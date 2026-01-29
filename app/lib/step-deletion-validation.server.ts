import { checkStepUsage } from "~/lib/step-output-use-queries.server";
import type { ValidationResult } from "~/lib/validation";

/**
 * Validates whether a step can be safely deleted.
 * A step cannot be deleted if other steps depend on its output.
 *
 * @param recipeId - The ID of the recipe containing the step
 * @param stepNum - The step number to validate for deletion
 * @returns ValidationResult - { valid: true } if deletable, { valid: false, error: string } if not
 */
export async function validateStepDeletion(
  recipeId: string,
  stepNum: number
): Promise<ValidationResult> {
  const dependentSteps = await checkStepUsage(recipeId, stepNum);

  if (dependentSteps.length === 0) {
    return { valid: true };
  }

  const sortedDependents = dependentSteps
    .map((dep) => dep.inputStepNum)
    .sort((a, b) => a - b);

  const error = formatDependentStepsError(stepNum, sortedDependents);

  return { valid: false, error };
}

/**
 * Formats an error message for dependent steps.
 * - 1 dependent: "Cannot delete Step X because it is used by Step Y"
 * - 2 dependents: "Cannot delete Step X because it is used by Steps Y and Z"
 * - 3+ dependents: "Cannot delete Step X because it is used by Steps Y, Z, and W"
 */
function formatDependentStepsError(
  stepNum: number,
  dependentStepNums: number[]
): string {
  const prefix = `Cannot delete Step ${stepNum} because it is used by`;

  if (dependentStepNums.length === 1) {
    return `${prefix} Step ${dependentStepNums[0]}`;
  }

  if (dependentStepNums.length === 2) {
    return `${prefix} Steps ${dependentStepNums[0]} and ${dependentStepNums[1]}`;
  }

  // 3 or more: use Oxford comma format
  const allButLast = dependentStepNums.slice(0, -1).join(", ");
  const last = dependentStepNums[dependentStepNums.length - 1];
  return `${prefix} Steps ${allButLast}, and ${last}`;
}
