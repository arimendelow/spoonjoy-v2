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
