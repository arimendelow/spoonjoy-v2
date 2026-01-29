import { checkStepUsage } from "~/lib/step-output-use-queries.server";
import type { ValidationResult } from "~/lib/validation";

/**
 * Validates whether a step can be safely reordered to a new position.
 * A step cannot be moved past steps that depend on its output (incoming dependencies).
 *
 * When moving a step from currentStepNum to newPosition:
 * - If moving forward (newPosition > currentStepNum), check if any dependents
 *   would end up before the step's new position
 * - If moving backward or staying in place, always valid (for incoming dependencies)
 *
 * @param recipeId - The ID of the recipe containing the step
 * @param currentStepNum - The current step number being moved
 * @param newPosition - The target position for the step
 * @returns ValidationResult - { valid: true } if reorder is allowed, { valid: false, error: string } if not
 */
export async function validateStepReorder(
  recipeId: string,
  currentStepNum: number,
  newPosition: number
): Promise<ValidationResult> {
  // If not moving forward, no incoming dependency violations are possible
  if (newPosition <= currentStepNum) {
    return { valid: true };
  }

  // Get all steps that use this step's output (incoming dependencies)
  const dependentSteps = await checkStepUsage(recipeId, currentStepNum);

  if (dependentSteps.length === 0) {
    return { valid: true };
  }

  // Find dependents that would be "passed over" by the move
  // These are dependents whose current position is between the current position and new position
  // i.e., currentStepNum < dependentStepNum <= newPosition
  const blockingSteps = dependentSteps
    .filter((dep) => dep.inputStepNum <= newPosition)
    .map((dep) => dep.inputStepNum)
    .sort((a, b) => a - b);

  if (blockingSteps.length === 0) {
    return { valid: true };
  }

  const error = formatBlockingStepsError(
    currentStepNum,
    newPosition,
    blockingSteps
  );

  return { valid: false, error };
}

/**
 * Formats an error message for blocking steps.
 * - 1 blocking: "Cannot move Step X to position Y because Step Z uses its output"
 * - 2 blocking: "Cannot move Step X to position Y because Steps Z and W use its output"
 * - 3+ blocking: "Cannot move Step X to position Y because Steps Z, W, and V use its output"
 */
function formatBlockingStepsError(
  stepNum: number,
  newPosition: number,
  blockingStepNums: number[]
): string {
  const prefix = `Cannot move Step ${stepNum} to position ${newPosition} because`;

  if (blockingStepNums.length === 1) {
    return `${prefix} Step ${blockingStepNums[0]} uses its output`;
  }

  if (blockingStepNums.length === 2) {
    return `${prefix} Steps ${blockingStepNums[0]} and ${blockingStepNums[1]} use its output`;
  }

  // 3 or more: use Oxford comma format
  const allButLast = blockingStepNums.slice(0, -1).join(", ");
  const last = blockingStepNums[blockingStepNums.length - 1];
  return `${prefix} Steps ${allButLast}, and ${last} use its output`;
}
