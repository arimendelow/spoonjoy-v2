/**
 * Recipe import orchestrator.
 *
 * Owns the full pipeline:
 *   1. Quota check (ImageGenLedger kind="import").
 *   2. Safe-fetch HTML.
 *   3. JSON-LD extract; if missing or partial, fall through / gap-fill via LLM.
 *   4. Existing-URL hint (per-chef, non-deleted).
 *   5. Dry-run shortcut.
 *   6. Title-collision retry (Unit 4d).
 *   7. Persist Recipe + RecipeStep + Ingredient rows.
 *   8. Schedule cover upload (Unit 4d).
 *
 * Cover scheduling and title-collision retry are extended in Unit 4d.
 */

import type { Prisma, PrismaClient } from "@prisma/client";
import {
  fetchRecipeHtml,
  SafeFetchError,
  type SafeFetchCode,
} from "~/lib/recipe-import-fetch.server";
import {
  extractRecipeJsonLd,
  type JsonLdRecipeDraft,
} from "~/lib/recipe-import-jsonld.server";
import {
  htmlToPlainText,
  RecipeLlmError,
  type RecipeLlmRunner,
} from "~/lib/recipe-import-llm.server";
import {
  parseIngredients,
  type ParsedIngredient,
} from "~/lib/ingredient-parse.server";
import { tryConsumeImageGenQuota } from "~/lib/image-gen-ledger.server";
import { validateActiveRecipeTitleUnique } from "~/lib/recipe-title-uniqueness.server";
import type { ImageGenRunner } from "~/lib/image-gen.server";

type Database = PrismaClient | Prisma.TransactionClient;

export type ImportRecipeCode =
  | "bad-url"
  | "fetch-blocked"
  | "fetch-timeout"
  | "fetch-too-large"
  | "fetch-failed"
  | "not-html"
  | "no-content"
  | "llm-failed"
  | "rate-limited"
  | "title-conflict";

export class ImportRecipeError extends Error {
  readonly code: ImportRecipeCode;
  readonly status: number;
  constructor(code: ImportRecipeCode, status: number, message: string) {
    super(message);
    this.name = "ImportRecipeError";
    this.code = code;
    this.status = status;
  }
}

const SAFE_FETCH_TO_IMPORT: Record<
  SafeFetchCode,
  { code: ImportRecipeCode; status: number }
> = {
  "bad-scheme": { code: "bad-url", status: 400 },
  "blocked-host": { code: "fetch-blocked", status: 400 },
  timeout: { code: "fetch-timeout", status: 504 },
  "too-large": { code: "fetch-too-large", status: 413 },
  "non-2xx": { code: "fetch-failed", status: 502 },
  "not-html": { code: "not-html", status: 415 },
};

export interface ImportRecipeOptions {
  url: string;
  chefId: string;
  dryRun?: boolean;
}

export interface ImportRecipeDeps {
  db: PrismaClient;
  env?: { OPENAI_API_KEY?: string } | null;
  bucket?: R2Bucket;
  waitUntil?: (promise: Promise<unknown>) => void;
  fetchImpl?: typeof fetch;
  llmRunner?: RecipeLlmRunner;
  imageGenRunner?: ImageGenRunner;
  ingredientParser?: (
    text: string,
    env?: { OPENAI_API_KEY?: string } | null,
  ) => Promise<ParsedIngredient[]>;
  logger?: Pick<Console, "error">;
  now?: () => Date;
}

export type ImportRecipeConfidence = "high" | "medium" | "low";
export type ImportRecipeSource = "json-ld" | "llm" | "mixed";

export interface ImportRecipeDraftView {
  title: string;
  description: string | null;
  servings: string | null;
  ingredients: string[];
  steps: string[];
  imageUrl: string | null;
  sourceUrl: string;
}

export interface ImportRecipeResult {
  recipeId: string | null;
  recipe: unknown;
  confidence: ImportRecipeConfidence;
  source: ImportRecipeSource;
  existingRecipeId: string | null;
  coverPending: boolean;
}

const recipeInclude = {
  chef: { select: { id: true, email: true, username: true } },
  covers: { orderBy: [{ createdAt: "desc" }, { id: "desc" }] },
  steps: {
    include: { ingredients: { include: { unit: true, ingredientRef: true } } },
  },
} satisfies Prisma.RecipeInclude;

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}

async function getOrCreateUnit(db: Database, name: string) {
  const normalized = normalizeName(name);
  const existing = await db.unit.findUnique({ where: { name: normalized } });
  if (existing) return existing;
  return db.unit.create({ data: { name: normalized } });
}

async function getOrCreateIngredientRef(db: Database, name: string) {
  const normalized = normalizeName(name);
  const existing = await db.ingredientRef.findUnique({
    where: { name: normalized },
  });
  if (existing) return existing;
  return db.ingredientRef.create({ data: { name: normalized } });
}

function jsonLdPartial(draft: JsonLdRecipeDraft): boolean {
  return draft.ingredients.length === 0 || draft.steps.length === 0;
}

function mapSafeFetchError(err: SafeFetchError): ImportRecipeError {
  const mapped = SAFE_FETCH_TO_IMPORT[err.code];
  return new ImportRecipeError(mapped.code, mapped.status, err.message);
}

interface ExtractionOutput {
  draft: ImportRecipeDraftView;
  source: ImportRecipeSource;
  confidence: ImportRecipeConfidence;
}

async function runExtraction(
  url: string,
  html: string,
  ogImageUrl: string | null,
  deps: ImportRecipeDeps,
): Promise<ExtractionOutput> {
  const jsonLd = extractRecipeJsonLd(html);
  if (jsonLd.draft) {
    const draft = jsonLd.draft;
    if (!jsonLdPartial(draft)) {
      return {
        draft: {
          title: draft.title,
          description: draft.description,
          servings: draft.servings,
          ingredients: draft.ingredients,
          steps: draft.steps,
          imageUrl: draft.imageUrl ?? ogImageUrl,
          sourceUrl: url,
        },
        source: "json-ld",
        confidence: jsonLd.multipleRecipes ? "medium" : "high",
      };
    }
    // Partial JSON-LD → gap-fill via LLM
    const llm = await runLlm(html, deps);
    return {
      draft: {
        title: draft.title || llm.title,
        description: draft.description ?? llm.description,
        servings: draft.servings ?? llm.servings,
        ingredients:
          draft.ingredients.length > 0 ? draft.ingredients : llm.ingredients,
        steps: draft.steps.length > 0 ? draft.steps : llm.steps,
        imageUrl: draft.imageUrl ?? ogImageUrl,
        sourceUrl: url,
      },
      source: "mixed",
      confidence: "medium",
    };
  }
  // No usable JSON-LD → full LLM
  const llm = await runLlm(html, deps);
  if (!llm.title || !llm.title.trim()) {
    throw new ImportRecipeError(
      "no-content",
      422,
      "Could not extract a recipe from the page",
    );
  }
  return {
    draft: {
      title: llm.title,
      description: llm.description,
      servings: llm.servings,
      ingredients: llm.ingredients,
      steps: llm.steps,
      imageUrl: ogImageUrl,
      sourceUrl: url,
    },
    source: "llm",
    confidence: "low",
  };
}

async function runLlm(
  html: string,
  deps: ImportRecipeDeps,
): Promise<{
  title: string;
  description: string | null;
  servings: string | null;
  ingredients: string[];
  steps: string[];
}> {
  if (!deps.llmRunner) {
    throw new ImportRecipeError(
      "llm-failed",
      502,
      "LLM runner is not configured",
    );
  }
  const text = htmlToPlainText(html);
  try {
    return await deps.llmRunner.extract(text);
  } catch (err) {
    if (err instanceof RecipeLlmError) {
      throw new ImportRecipeError("llm-failed", 502, err.message);
    }
    throw err;
  }
}

async function findExistingRecipeId(
  db: PrismaClient,
  chefId: string,
  sourceUrl: string,
): Promise<string | null> {
  const existing = await db.recipe.findFirst({
    where: { chefId, sourceUrl, deletedAt: null },
    select: { id: true },
  });
  return existing?.id ?? null;
}

async function persistRecipe(
  db: PrismaClient,
  chefId: string,
  draft: ImportRecipeDraftView,
  ingredientParser: NonNullable<ImportRecipeDeps["ingredientParser"]>,
  env: ImportRecipeDeps["env"],
): Promise<{ id: string; recipe: unknown }> {
  const title = draft.title.trim();
  // First-attempt collision check (full retry logic lands in Unit 4d).
  const conflict = await validateActiveRecipeTitleUnique(db, {
    chefId,
    title,
  });
  if (!conflict.valid) {
    throw new ImportRecipeError(
      "title-conflict",
      409,
      conflict.error ?? "Title already in use",
    );
  }

  // Parse ingredient strings up-front (outside the transaction — these
  // calls can be slow and we don't want to hold a write transaction open).
  const parsedPerStep: ParsedIngredient[][] = [];
  for (const _ of draft.steps) {
    parsedPerStep.push([]);
  }
  // Map: per-step ingredient list. The JSON-LD recipeIngredient[] is flat —
  // we attach all ingredients to step 1 to preserve them. This matches
  // current Spoonjoy data model behaviour where ingredients reference a
  // step number.
  const stepCount = Math.max(draft.steps.length, 1);
  const allIngredients: ParsedIngredient[] = [];
  for (const ingredientText of draft.ingredients) {
    const parsed = await ingredientParser(ingredientText, env);
    for (const p of parsed) allIngredients.push(p);
  }

  return db.$transaction(async (tx) => {
    const created = await tx.recipe.create({
      data: {
        title,
        description: draft.description,
        servings: draft.servings,
        sourceUrl: draft.sourceUrl,
        chefId,
      },
    });

    const stepsToInsert =
      draft.steps.length > 0 ? draft.steps : ["(No steps provided.)"];
    for (let i = 0; i < stepsToInsert.length; i++) {
      await tx.recipeStep.create({
        data: {
          recipeId: created.id,
          stepNum: i + 1,
          description: stepsToInsert[i],
        },
      });
    }

    // Attach all ingredients to step 1.
    for (const ingredient of allIngredients) {
      const unit = await getOrCreateUnit(tx, ingredient.unit);
      const ref = await getOrCreateIngredientRef(tx, ingredient.ingredientName);
      await tx.ingredient.create({
        data: {
          recipeId: created.id,
          stepNum: 1,
          quantity: ingredient.quantity,
          unitId: unit.id,
          ingredientRefId: ref.id,
        },
      });
    }

    const full = await tx.recipe.findUniqueOrThrow({
      where: { id: created.id },
      include: recipeInclude,
    });
    return { id: created.id, recipe: full };
  });
}

export async function importRecipeFromUrl(
  options: ImportRecipeOptions,
  deps: ImportRecipeDeps,
): Promise<ImportRecipeResult> {
  const { url, chefId, dryRun = false } = options;
  const now = deps.now;

  // 1. Quota (skip on dry-run).
  if (!dryRun) {
    const ok = await tryConsumeImageGenQuota(deps.db, chefId, "import", {
      now,
    });
    if (!ok) {
      throw new ImportRecipeError(
        "rate-limited",
        429,
        "Daily import quota exhausted",
      );
    }
  }

  // 2. Fetch.
  let fetched;
  try {
    fetched = await fetchRecipeHtml(url, { fetchImpl: deps.fetchImpl });
  } catch (err) {
    if (err instanceof SafeFetchError) {
      throw mapSafeFetchError(err);
    }
    throw err;
  }

  // 3. Extract.
  const extraction = await runExtraction(
    url,
    fetched.html,
    fetched.ogImageUrl,
    deps,
  );

  // 4. Existing-URL hint.
  const existingRecipeId = await findExistingRecipeId(deps.db, chefId, url);

  // 5. Dry-run shortcut.
  if (dryRun) {
    return {
      recipeId: null,
      recipe: extraction.draft,
      confidence: extraction.confidence,
      source: extraction.source,
      existingRecipeId,
      coverPending: false,
    };
  }

  // 6. Persist.
  const ingredientParser: NonNullable<ImportRecipeDeps["ingredientParser"]> =
    deps.ingredientParser ??
    ((text, env) => parseIngredients(text, env ?? undefined));
  const persisted = await persistRecipe(
    deps.db,
    chefId,
    extraction.draft,
    ingredientParser,
    deps.env,
  );

  return {
    recipeId: persisted.id,
    recipe: persisted.recipe,
    confidence: extraction.confidence,
    source: extraction.source,
    existingRecipeId,
    coverPending: false,
  };
}
