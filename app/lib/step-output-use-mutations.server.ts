import { db } from "~/lib/db.server";

/**
 * Delete all existing StepOutputUse records for a step when updating it.
 * Uses recipeId + inputStepNum as key (where inputStepNum = current step being edited).
 *
 * @param recipeId - The ID of the recipe containing the step
 * @param inputStepNum - The step number being edited (the consumer step)
 * @returns Object with count of deleted records
 */
export async function deleteExistingStepOutputUses(
  recipeId: string,
  inputStepNum: number
): Promise<{ count: number }> {
  const result = await db.stepOutputUse.deleteMany({
    where: {
      recipeId,
      inputStepNum,
    },
  });

  return { count: result.count };
}

/**
 * Create StepOutputUse records for a step when updating it.
 * Creates one record for each outputStepNum that the current step uses.
 *
 * @param recipeId - The ID of the recipe containing the step
 * @param inputStepNum - The step number being edited (the consumer step)
 * @param outputStepNums - Array of step numbers whose outputs this step uses
 * @returns Object with count of created records
 */
export async function createStepOutputUses(
  recipeId: string,
  inputStepNum: number,
  outputStepNums: number[]
): Promise<{ count: number }> {
  // Handle empty array gracefully
  if (outputStepNums.length === 0) {
    return { count: 0 };
  }

  // Create all StepOutputUse records
  const result = await db.stepOutputUse.createMany({
    data: outputStepNums.map((outputStepNum) => ({
      recipeId,
      inputStepNum,
      outputStepNum,
    })),
  });

  return { count: result.count };
}
