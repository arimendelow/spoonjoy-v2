import type { Prisma, PrismaClient as PrismaClientType } from "@prisma/client";

export class ForkSourceNotFoundError extends Error {
  constructor(sourceRecipeId: string) {
    super(`Source recipe not found: ${sourceRecipeId}`);
    this.name = "ForkSourceNotFoundError";
  }
}

export class ForkTitleExhaustedError extends Error {
  constructor(baseTitle: string) {
    super(
      `Could not resolve a unique title for fork of "${baseTitle}" after ${MAX_VARIATION_ATTEMPTS} attempts`,
    );
    this.name = "ForkTitleExhaustedError";
  }
}

const MAX_VARIATION_ATTEMPTS = 100;

export interface ForkRecipeInput {
  sourceRecipeId: string;
  viewerId: string;
  titleOverride?: string | null;
}

const sourceInclude = {
  chef: { select: { id: true, username: true } },
  steps: {
    orderBy: { stepNum: "asc" as const },
    include: {
      ingredients: true,
    },
  },
  covers: {
    orderBy: [{ createdAt: "desc" as const }, { id: "desc" as const }],
    take: 1,
  },
} satisfies Prisma.RecipeInclude;

const detailInclude = {
  chef: { select: { id: true, email: true, username: true } },
  covers: { orderBy: [{ createdAt: "desc" as const }, { id: "desc" as const }] },
  steps: {
    orderBy: { stepNum: "asc" as const },
    include: {
      ingredients: { include: { unit: true, ingredientRef: true } },
    },
  },
} satisfies Prisma.RecipeInclude;

export type ForkedRecipeDetail = Prisma.RecipeGetPayload<{ include: typeof detailInclude }>;

export interface ForkedRecipeResult {
  recipe: ForkedRecipeDetail;
  attribution: {
    sourceRecipeId: string;
    sourceChef: { id: string; username: string };
  };
  appliedTitle: string;
  titleWasSuffixed: boolean;
}

function variationTitle(base: string, n: number): string {
  return n <= 1 ? base : `${base} (variation ${n})`;
}

async function resolveTitle(
  db: PrismaClientType,
  chefId: string,
  baseTitle: string,
): Promise<{ title: string; suffixed: boolean }> {
  for (let n = 1; n <= MAX_VARIATION_ATTEMPTS; n++) {
    const candidate = variationTitle(baseTitle, n);
    const collision = await db.recipe.findFirst({
      where: { chefId, title: candidate, deletedAt: null },
      select: { id: true },
    });
    if (!collision) return { title: candidate, suffixed: n > 1 };
  }
  throw new ForkTitleExhaustedError(baseTitle);
}

export async function forkRecipe(
  db: PrismaClientType,
  input: ForkRecipeInput,
): Promise<ForkedRecipeResult> {
  const source = await db.recipe.findUnique({
    where: { id: input.sourceRecipeId },
    include: sourceInclude,
  });
  if (!source || source.deletedAt) {
    throw new ForkSourceNotFoundError(input.sourceRecipeId);
  }

  const stepOutputUses = await db.stepOutputUse.findMany({
    where: { recipeId: source.id },
    select: { outputStepNum: true, inputStepNum: true },
  });

  const override = input.titleOverride?.trim();
  const baseTitle = override && override.length > 0 ? override : source.title;

  // Cloudflare D1 (used in both local dev and production) does not support
  // interactive `$transaction(async (tx) => ...)`; we sequence the writes
  // without a transaction. The schema's `(chefId, title, deletedAt)` unique
  // index still protects against duplicate-title races at the storage layer.
  const { title } = await resolveTitle(db, input.viewerId, baseTitle);
  const created = await db.recipe.create({
    data: {
      title,
      description: source.description,
      servings: source.servings,
      chefId: input.viewerId,
      sourceRecipeId: source.id,
      // sourceUrl intentionally NOT propagated
    },
    select: { id: true },
  });

  for (const step of source.steps) {
    await db.recipeStep.create({
      data: {
        recipeId: created.id,
        stepNum: step.stepNum,
        stepTitle: step.stepTitle,
        description: step.description,
        duration: step.duration,
      },
    });
  }

  for (const step of source.steps) {
    if (step.ingredients.length === 0) continue;
    await db.ingredient.createMany({
      data: step.ingredients.map((ing) => ({
        recipeId: created.id,
        stepNum: step.stepNum,
        quantity: ing.quantity,
        unitId: ing.unitId,
        ingredientRefId: ing.ingredientRefId,
      })),
    });
  }

  if (stepOutputUses.length > 0) {
    await db.stepOutputUse.createMany({
      data: stepOutputUses.map((sou) => ({
        recipeId: created.id,
        outputStepNum: sou.outputStepNum,
        inputStepNum: sou.inputStepNum,
      })),
    });
  }

  const latestCover = source.covers[0];
  if (latestCover) {
    await db.recipeCover.create({
      data: {
        recipeId: created.id,
        imageUrl: latestCover.imageUrl,
        stylizedImageUrl: null,
        sourceType: "chef-upload",
        sourceSpoonId: null,
      },
    });
  }

  const recipe = await db.recipe.findUniqueOrThrow({
    where: { id: created.id },
    include: detailInclude,
  });

  return {
    recipe,
    attribution: {
      sourceRecipeId: source.id,
      sourceChef: { id: source.chef.id, username: source.chef.username },
    },
    appliedTitle: recipe.title,
    titleWasSuffixed: recipe.title !== baseTitle,
  };
}
