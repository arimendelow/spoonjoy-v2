import type { Route } from "./+types/recipes.$id";
import { redirect, useLoaderData, useSubmit } from "react-router";
import { useState, useEffect, useRef } from "react";
import { usePostHog } from "@posthog/react";
import { getDb, db } from "~/lib/db.server";
import { requireUserId } from "~/lib/session.server";
import { Button } from "~/components/ui/button";
import { Heading } from "~/components/ui/heading";
import { Text } from "~/components/ui/text";
import { Link } from "~/components/ui/link";
import { RecipeHeader } from "~/components/recipe/RecipeHeader";
import { StepCard } from "~/components/recipe/StepCard";
import type { Ingredient } from "~/components/recipe/IngredientList";
import type { StepReference } from "~/components/recipe/StepOutputUseCallout";
import { shareContent } from "~/components/navigation/quick-actions";
import { SaveToCookbookDropdown } from "~/components/recipe/SaveToCookbookDropdown";

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const { id } = params;

  /* istanbul ignore next -- @preserve Cloudflare D1 production-only path */
  const database = context?.cloudflare?.env?.DB
    ? getDb(context.cloudflare.env as { DB: D1Database })
    : db;

  const recipe = await database.recipe.findUnique({
    where: { id },
    include: {
      chef: {
        select: {
          id: true,
          username: true,
          photoUrl: true,
        },
      },
      steps: {
        orderBy: {
          stepNum: "asc",
        },
        include: {
          ingredients: {
            include: {
              unit: true,
              ingredientRef: true,
            },
          },
          usingSteps: {
            include: {
              outputOfStep: {
                select: {
                  stepNum: true,
                  stepTitle: true,
                },
              },
            },
            orderBy: {
              outputStepNum: "asc",
            },
          },
        },
      },
    },
  });

  if (!recipe || recipe.deletedAt) {
    throw new Response("Recipe not found", { status: 404 });
  }

  // Check if user owns this recipe
  const isOwner = recipe.chefId === userId;

  // Fetch user's cookbooks for save functionality
  const userCookbooks = await database.cookbook.findMany({
    where: { authorId: userId },
    select: {
      id: true,
      title: true,
      recipes: {
        where: { recipeId: id },
        select: { id: true },
      },
    },
    orderBy: { title: "asc" },
  });

  // Transform cookbooks and track which already contain this recipe
  const cookbooks = userCookbooks.map((cb) => ({
    id: cb.id,
    title: cb.title,
  }));
  const savedInCookbookIds = userCookbooks
    .filter((cb) => cb.recipes.length > 0)
    .map((cb) => cb.id);

  return { recipe, isOwner, cookbooks, savedInCookbookIds };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const { id } = params;
  const formData = await request.formData();
  const intent = formData.get("intent");

  /* istanbul ignore next -- @preserve Cloudflare D1 production-only path */
  const database = context?.cloudflare?.env?.DB
    ? getDb(context.cloudflare.env as { DB: D1Database })
    : db;

  // Add to cookbook doesn't require recipe ownership
  if (intent === "addToCookbook") {
    const cookbookId = formData.get("cookbookId")?.toString();
    if (cookbookId) {
      // Verify user owns the cookbook
      const cookbook = await database.cookbook.findUnique({
        where: { id: cookbookId },
        select: { authorId: true },
      });
      if (!cookbook || cookbook.authorId !== userId) {
        throw new Response("Unauthorized", { status: 403 });
      }
      try {
        await database.recipeInCookbook.create({
          data: {
            cookbookId,
            recipeId: id,
            addedById: userId,
          },
        });
        return { success: true };
      } catch (error: unknown) {
        // Already in cookbook - ignore
        return { success: true };
      }
    }
  }

  // Verify ownership for other actions
  const recipe = await database.recipe.findUnique({
    where: { id },
    select: { chefId: true, deletedAt: true },
  });

  if (!recipe || recipe.deletedAt) {
    throw new Response("Recipe not found", { status: 404 });
  }

  if (recipe.chefId !== userId) {
    throw new Response("Unauthorized", { status: 403 });
  }

  if (intent === "delete") {
    // Soft delete
    await database.recipe.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return redirect("/recipes");
  }

  return null;
}

export default function RecipeDetail() {
  const { recipe, isOwner, cookbooks, savedInCookbookIds } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const posthog = usePostHog();

  // Scale state for recipe scaling
  const [scaleFactor, setScaleFactor] = useState(1);

  // Track which ingredients have been checked off
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());

  // Track which step outputs have been checked off
  const [checkedStepOutputs, setCheckedStepOutputs] = useState<Set<string>>(new Set());

  // Track which cookbooks this recipe is saved in (optimistic UI)
  const [savedCookbookIds, setSavedCookbookIds] = useState<Set<string>>(
    () => new Set(savedInCookbookIds)
  );

  // Track view start time for engagement metrics
  const viewStartTime = useRef<number>(Date.now());

  // PostHog: Track recipe view on mount
  useEffect(() => {
    /* istanbul ignore next -- @preserve PostHog client-only analytics */
    if (posthog) {
      posthog.capture("recipe_viewed", {
        recipe_id: recipe.id,
        recipe_title: recipe.title,
        chef_id: recipe.chef.id,
        step_count: recipe.steps.length,
        is_owner: isOwner,
      });
    }

    // Track time on recipe when leaving
    /* istanbul ignore next -- @preserve PostHog client-only analytics */
    return () => {
      if (posthog) {
        const timeOnRecipe = Math.round((Date.now() - viewStartTime.current) / 1000);
        posthog.capture("recipe_view_ended", {
          recipe_id: recipe.id,
          time_on_recipe_seconds: timeOnRecipe,
        });
      }
    };
  }, [recipe.id, recipe.title, recipe.chef.id, recipe.steps.length, isOwner, posthog]);

  // PostHog: Track scale changes
  const handleScaleChange = (newScale: number) => {
    setScaleFactor(newScale);
    /* istanbul ignore next -- @preserve PostHog client-only analytics */
    if (posthog) {
      posthog.capture("recipe_scaled", {
        recipe_id: recipe.id,
        scale_factor: newScale,
        previous_scale: scaleFactor,
      });
    }
  };

  const handleDeleteConfirm = () => {
    submit({ intent: "delete" }, { method: "post" });
  };

  const handleIngredientToggle = (id: string) => {
    const newChecked = new Set(checkedIngredients);
    const wasChecked = newChecked.has(id);
    if (wasChecked) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedIngredients(newChecked);

    // PostHog: Track ingredient check/uncheck
    /* istanbul ignore next -- @preserve PostHog client-only analytics */
    if (posthog) {
      posthog.capture("ingredient_toggled", {
        recipe_id: recipe.id,
        ingredient_id: id,
        is_checked: !wasChecked,
        total_checked: newChecked.size,
      });
    }
  };

  const handleStepOutputToggle = (id: string) => {
    const newChecked = new Set(checkedStepOutputs);
    const wasChecked = newChecked.has(id);
    if (wasChecked) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedStepOutputs(newChecked);

    // PostHog: Track step output check/uncheck
    /* istanbul ignore next -- @preserve PostHog client-only analytics */
    if (posthog) {
      posthog.capture("step_output_toggled", {
        recipe_id: recipe.id,
        step_output_id: id,
        is_checked: !wasChecked,
        total_checked: newChecked.size,
      });
    }
  };

  const handleShare = async () => {
    /* istanbul ignore next -- @preserve browser share API */
    const result = await shareContent({
      title: recipe.title,
      text: recipe.description ?? `Check out this recipe: ${recipe.title}`,
      url: typeof window !== "undefined" ? window.location.href : `/recipes/${recipe.id}`,
    });

    /* istanbul ignore next -- @preserve PostHog client-only analytics */
    if (posthog) {
      posthog.capture("recipe_shared", {
        recipe_id: recipe.id,
        share_method: result.method,
        share_success: result.success,
      });
    }
  };

  const handleSaveToCookbook = (cookbookId: string) => {
    // Optimistic UI update
    setSavedCookbookIds((prev) => new Set([...prev, cookbookId]));

    // Submit the form
    submit(
      { intent: "addToCookbook", cookbookId },
      { method: "post" }
    );

    // PostHog: Track recipe saved to cookbook
    /* istanbul ignore next -- @preserve PostHog client-only analytics */
    if (posthog) {
      posthog.capture("recipe_saved_to_cookbook", {
        recipe_id: recipe.id,
        cookbook_id: cookbookId,
      });
    }
  };

  const handleCreateNewCookbook = () => {
    /* istanbul ignore next -- @preserve browser navigation */
    if (typeof window !== "undefined") {
      window.location.href = "/cookbooks/new";
    }
  };

  /* istanbul ignore next -- @preserve browser scroll navigation */
  const handleStepReferenceClick = (stepNumber: number) => {
    // Scroll to the referenced step
    const stepElement = document.getElementById(`step-${stepNumber}`);
    if (stepElement) {
      stepElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Transform step data to component format
  const transformIngredients = (
    ingredients: Array<{
      id: string;
      quantity: number | null;
      unit: { name: string };
      ingredientRef: { name: string };
    }>
  ): Ingredient[] => {
    return ingredients.map((ing) => ({
      id: ing.id,
      quantity: ing.quantity,
      unit: ing.unit.name,
      name: ing.ingredientRef.name,
    }));
  };

  const transformStepOutputUses = (
    usingSteps: Array<{
      id: string;
      outputStepNum: number;
      outputOfStep: { stepNum: number; stepTitle: string | null };
    }>
  ): StepReference[] => {
    return usingSteps.map((use) => ({
      id: use.id,
      stepNumber: use.outputOfStep.stepNum,
      stepTitle: use.outputOfStep.stepTitle,
    }));
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Back Link */}
      <div className="px-4 py-3 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <Link href="/recipes" className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
          ← Back to recipes
        </Link>
      </div>

      {/* Recipe Header with prominent image */}
      <RecipeHeader
        title={recipe.title}
        description={recipe.description ?? undefined}
        chefName={recipe.chef.username}
        chefId={recipe.chef.id}
        chefPhotoUrl={recipe.chef.photoUrl ?? undefined}
        imageUrl={recipe.imageUrl ?? undefined}
        servings={recipe.servings ?? undefined}
        scaleFactor={scaleFactor}
        onScaleChange={handleScaleChange}
        isOwner={isOwner}
        recipeId={recipe.id}
        onDelete={handleDeleteConfirm}
        onShare={handleShare}
        renderSaveButton={() => (
          <SaveToCookbookDropdown
            cookbooks={cookbooks}
            savedInCookbookIds={savedCookbookIds}
            onSave={handleSaveToCookbook}
            onCreateNew={handleCreateNewCookbook}
          />
        )}
      />

      {/* Steps Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl mx-auto">
        <Heading level={2} className="text-2xl font-bold mb-6">
          Steps
        </Heading>

        {recipe.steps.length === 0 ? (
          <div className="bg-zinc-100 dark:bg-zinc-800 p-8 rounded-xl text-center">
            <Text className="mb-4">No steps added yet</Text>
            {/* istanbul ignore next -- @preserve owner-only UI rendering */}
            {isOwner && (
              <Button href={`/recipes/${recipe.id}/edit`} color="blue">
                Add Steps
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {recipe.steps.map((step) => (
              <div key={step.id} id={`step-${step.stepNum}`}>
                <StepCard
                  stepNumber={step.stepNum}
                  title={step.stepTitle ?? undefined}
                  description={step.description}
                  ingredients={transformIngredients(step.ingredients)}
                  stepOutputUses={transformStepOutputUses(step.usingSteps ?? [])}
                  scaleFactor={scaleFactor}
                  checkedIngredientIds={checkedIngredients}
                  onIngredientToggle={handleIngredientToggle}
                  checkedStepOutputIds={checkedStepOutputs}
                  onStepOutputToggle={handleStepOutputToggle}
                  onStepReferenceClick={handleStepReferenceClick}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
