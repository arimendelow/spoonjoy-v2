import type { PrismaClient } from "@prisma/client";

/**
 * Load all StepOutputUse records for a recipe with step details for display.
 *
 * @param db - The Prisma client instance
 * @param recipeId - The ID of the recipe to load step output uses for
 * @returns Array of StepOutputUse records with outputOfStep details (stepNum and stepTitle)
 */
export async function loadRecipeStepOutputUses(
  db: PrismaClient,
  recipeId: string
) {
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
 * @param db - The Prisma client instance
 * @param recipeId - The ID of the recipe
 * @param stepNum - The step number to load dependencies for
 * @returns Array of {outputStepNum, stepTitle} for display
 */
export async function loadStepDependencies(
  db: PrismaClient,
  recipeId: string,
  stepNum: number
) {
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

/**
 * Check if a step is used by other steps - returns the list of dependent steps.
 *
 * @param db - The Prisma client instance
 * @param recipeId - The ID of the recipe
 * @param stepNum - The step number to check usage for
 * @returns Array of {inputStepNum, stepTitle} for dependent steps
 */
export async function checkStepUsage(
  db: PrismaClient,
  recipeId: string,
  stepNum: number
) {
  const stepOutputUses = await db.stepOutputUse.findMany({
    where: { recipeId, outputStepNum: stepNum },
    include: {
      inputOfStep: {
        select: { stepNum: true, stepTitle: true },
      },
    },
    orderBy: { inputStepNum: "asc" },
  });

  return stepOutputUses.map((use) => ({
    inputStepNum: use.inputStepNum,
    stepTitle: use.inputOfStep.stepTitle,
  }));
}
