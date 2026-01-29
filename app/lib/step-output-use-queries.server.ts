import { db } from "~/lib/db.server";

/**
 * Load all StepOutputUse records for a recipe with step details for display.
 *
 * @param recipeId - The ID of the recipe to load step output uses for
 * @returns Array of StepOutputUse records with outputOfStep details (stepNum and stepTitle)
 */
export async function loadRecipeStepOutputUses(recipeId: string) {
  return db.stepOutputUse.findMany({
    where: { recipeId },
    include: {
      outputOfStep: {
        select: { stepNum: true, stepTitle: true },
      },
    },
    orderBy: [{ inputStepNum: "asc" }, { outputStepNum: "asc" }],
  });
}
