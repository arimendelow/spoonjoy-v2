import type { Route } from "./+types/recipes.$id";
import { redirect, useFetcher, useLoaderData, useSubmit } from "react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { usePostHog } from "@posthog/react";
import { getDb, db } from "~/lib/db.server";
import { requireUserId } from "~/lib/session.server";
import { Button } from "~/components/ui/button";
import { Heading } from "~/components/ui/heading";
import { Text } from "~/components/ui/text";
import { RecipeHeader } from "~/components/recipe/RecipeHeader";
import { StepCard } from "~/components/recipe/StepCard";
import type { Ingredient } from "~/components/recipe/IngredientList";
import type { StepReference } from "~/components/recipe/StepOutputUseCallout";
import { shareContent, useRecipeDetailActions } from "~/components/navigation";

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const { id } = params;

  /* istanbul ignore next -- @preserve Cloudflare D1 production-only path */
  const database = context?.cloudflare?.env?.DB
    ? await getDb(context.cloudflare.env as { DB: D1Database })
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
    ? await getDb(context.cloudflare.env as { DB: D1Database })
    : db;

  // Create cookbook and save recipe to it
  if (intent === "createCookbookAndSave") {
    const title = formData.get("title")?.toString()?.trim();
    if (!title) {
      throw new Response("Title is required", { status: 400 });
    }
    const newCookbook = await database.cookbook.create({
      data: {
        title,
        authorId: userId,
      },
    });
    await database.recipeInCookbook.create({
      data: {
        cookbookId: newCookbook.id,
        recipeId: id,
        addedById: userId,
      },
    });
    return { success: true, newCookbook: { id: newCookbook.id, title: newCookbook.title } };
  }

  // Add/remove cookbook membership doesn't require recipe ownership
  if (intent === "addToCookbook" || intent === "removeFromCookbook") {
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

      if (intent === "removeFromCookbook") {
        await database.recipeInCookbook.deleteMany({
          where: { cookbookId, recipeId: id },
        });
        return { success: true };
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
  const addToListFetcher = useFetcher();
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

  const handleShare = useCallback(async () => {
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
  }, [recipe.id, recipe.title, recipe.description, posthog]);

  // State for Save modal (bottom sheet)
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const handleAddToList = useCallback(() => {
    addToListFetcher.submit(
      { intent: "addFromRecipe", recipeId: recipe.id },
      { method: "post", action: "/shopping-list" }
    );

    /* istanbul ignore next -- @preserve PostHog client-only analytics */
    if (posthog) {
      posthog.capture("recipe_added_to_shopping_list", {
        recipe_id: recipe.id,
        source: "recipe_detail_dock",
      });
    }
  }, [addToListFetcher, recipe.id, posthog]);

  // Register dock actions for this recipe detail page
  useRecipeDetailActions({
    recipeId: recipe.id,
    isOwner,
    onSave: () => setIsSaveModalOpen(true),
    onAddToList: handleAddToList,
    onShare: handleShare,
  });

  const handleToggleCookbookSave = (cookbookId: string) => {
    const isCurrentlySaved = savedCookbookIds.has(cookbookId);

    // Optimistic UI update
    setSavedCookbookIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlySaved) {
        next.delete(cookbookId);
      } else {
        next.add(cookbookId);
      }
      return next;
    });

    submit(
      { intent: isCurrentlySaved ? "removeFromCookbook" : "addToCookbook", cookbookId },
      { method: "post" }
    );

    /* istanbul ignore next -- @preserve PostHog client-only analytics */
    if (posthog) {
      posthog.capture(isCurrentlySaved ? "recipe_removed_from_cookbook" : "recipe_saved_to_cookbook", {
        recipe_id: recipe.id,
        cookbook_id: cookbookId,
      });
    }
  };

  const handleCreateAndSave = (title: string) => {
    submit(
      { intent: "createCookbookAndSave", title },
      { method: "post" }
    );

    // PostHog: Track cookbook creation from recipe detail
    /* istanbul ignore next -- @preserve PostHog client-only analytics */
    if (posthog) {
      posthog.capture("cookbook_created_from_recipe", {
        recipe_id: recipe.id,
        cookbook_title: title,
      });
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-24">
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
      />

      {/* Save to Cookbook Modal (Bottom Sheet) */}
      {isSaveModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center bg-black/50"
          onClick={() => setIsSaveModalOpen(false)}
          data-testid="save-modal-backdrop"
        >
          <div
            className="w-full sm:max-w-md bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
            data-testid="save-modal"
          >
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
              <Heading level={2} className="text-xl font-bold">Save to Cookbook</Heading>
            </div>
            <div className="overflow-y-auto flex-1 p-4">
              {cookbooks.length > 0 ? (
                <div className="space-y-2">
                  {cookbooks.map((cookbook) => {
                    const isSaved = savedCookbookIds.has(cookbook.id);
                    return (
                      <button
                        key={cookbook.id}
                        onClick={() => handleToggleCookbookSave(cookbook.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                          isSaved
                            ? 'bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50'
                            : 'bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                        }`}
                        data-testid={`cookbook-item-${cookbook.id}`}
                      >
                        <Text className="flex items-center justify-between">
                          <span>{cookbook.title}</span>
                          {isSaved && <span className="text-blue-500">✓</span>}
                        </Text>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <Text className="text-center text-zinc-500 dark:text-zinc-400 py-8">
                  No cookbooks yet. Create your first one below!
                </Text>
              )}
              
              {/* Create New Cookbook Section */}
              <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                <div className="space-y-3">
                  <label htmlFor="new-cookbook-input" className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Create new cookbook
                  </label>
                  <input
                    id="new-cookbook-input"
                    type="text"
                    placeholder="Cookbook name"
                    className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.currentTarget;
                        const title = input.value.trim();
                        if (title) {
                          handleCreateAndSave(title);
                          setIsSaveModalOpen(false);
                          input.value = '';
                        }
                      }
                    }}
                    data-testid="new-cookbook-input"
                  />
                  <Button
                    color="blue"
                    onClick={(e) => {
                      const input = document.getElementById('new-cookbook-input') as HTMLInputElement;
                      const title = input?.value.trim();
                      if (title) {
                        handleCreateAndSave(title);
                        setIsSaveModalOpen(false);
                        input.value = '';
                      }
                    }}
                    data-testid="create-cookbook-button"
                  >
                    Create & Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
