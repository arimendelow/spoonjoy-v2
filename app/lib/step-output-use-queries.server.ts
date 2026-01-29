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

/**
 * Load dependencies for a specific step - the list of steps whose outputs this step uses.
 *
 * @param recipeId - The ID of the recipe
 * @param stepNum - The step number to load dependencies for
 * @returns Array of {outputStepNum, stepTitle} for display
 */
export async function loadStepDependencies(recipeId: string, stepNum: number) {
  const stepOutputUses = await db.stepOutputUse.findMany({
    where: { recipeId, inputStepNum: stepNum },
    include: {
      outputOfStep: {
        select: { stepNum: true, stepTitle: true, id: true },
      },
    },
    orderBy: { outputStepNum: "asc" },
  });

  return stepOutputUses.map((use) => ({
    outputStepNum: use.outputStepNum,
    stepTitle: use.outputOfStep.stepTitle,
  }));
}
