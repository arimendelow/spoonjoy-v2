import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { db } from "~/lib/db.server";
import { cleanupDatabase } from "../helpers/cleanup";
import {
  createTestUser,
  createTestRecipe,
  createStepDescription,
  createStepTitle,
} from "../utils";
import {
  validateStepReorder,
  validateStepReorderOutgoing,
} from "~/lib/step-reorder-validation.server";

describe("validateStepReorder", () => {
  let testUserId: string;
  let testRecipeId: string;

  beforeEach(async () => {
    await cleanupDatabase();

    // Create test user
    const user = await db.user.create({
      data: createTestUser(),
    });
    testUserId = user.id;

    // Create test recipe
    const recipe = await db.recipe.create({
      data: createTestRecipe(testUserId),
    });
    testRecipeId = recipe.id;
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe("valid reorders (no incoming dependencies violated)", () => {
    it("should return valid when step has no incoming dependencies", async () => {
      // Create three steps with no dependencies
      await db.recipeStep.createMany({
        data: [
          {
            recipeId: testRecipeId,
            stepNum: 1,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 2,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 3,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
        ],
      });

      // Moving step 1 to position 3 should be valid since nothing uses step 1
      const result = await validateStepReorder(testRecipeId, 1, 3);

      expect(result).toEqual({ valid: true });
    });

    it("should return valid when moving step forward but dependents are after new position", async () => {
      // Create four steps
      await db.recipeStep.createMany({
        data: [
          {
            recipeId: testRecipeId,
            stepNum: 1,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 2,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 3,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 4,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
        ],
      });

      // Step 4 uses output of step 1
      await db.stepOutputUse.create({
        data: {
          recipeId: testRecipeId,
          outputStepNum: 1,
          inputStepNum: 4,
        },
      });

      // Moving step 1 to position 3 is OK - step 4 (the dependent) is still after position 3
      const result = await validateStepReorder(testRecipeId, 1, 3);

      expect(result).toEqual({ valid: true });
    });

    it("should return valid when moving step backward", async () => {
      // Create three steps
      await db.recipeStep.createMany({
        data: [
          {
            recipeId: testRecipeId,
            stepNum: 1,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 2,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 3,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
        ],
      });

      // Step 3 uses output of step 2
      await db.stepOutputUse.create({
        data: {
          recipeId: testRecipeId,
          outputStepNum: 2,
          inputStepNum: 3,
        },
      });

      // Moving step 2 backward to position 1 is OK - step 3 still comes after
      const result = await validateStepReorder(testRecipeId, 2, 1);

      expect(result).toEqual({ valid: true });
    });

    it("should return valid when staying in same position", async () => {
      // Create two steps
      await db.recipeStep.createMany({
        data: [
          {
            recipeId: testRecipeId,
            stepNum: 1,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 2,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
        ],
      });

      // Step 2 uses output of step 1
      await db.stepOutputUse.create({
        data: {
          recipeId: testRecipeId,
          outputStepNum: 1,
          inputStepNum: 2,
        },
      });

      // "Moving" step 1 to position 1 (no change) is always valid
      const result = await validateStepReorder(testRecipeId, 1, 1);

      expect(result).toEqual({ valid: true });
    });
  });

  describe("invalid reorders (incoming dependencies violated)", () => {
    it("should return error when moving step past a step that uses it", async () => {
      // Create three steps
      await db.recipeStep.createMany({
        data: [
          {
            recipeId: testRecipeId,
            stepNum: 1,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 2,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 3,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
        ],
      });

      // Step 2 uses output of step 1
      await db.stepOutputUse.create({
        data: {
          recipeId: testRecipeId,
          outputStepNum: 1,
          inputStepNum: 2,
        },
      });

      // Moving step 1 to position 3 would violate the dependency
      // Step 2 uses step 1, so step 1 cannot be after step 2
      const result = await validateStepReorder(testRecipeId, 1, 3);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toBe(
          "Cannot move Step 1 to position 3 because Step 2 uses its output"
        );
      }
    });

    it("should return error listing multiple blocking steps", async () => {
      // Create four steps
      await db.recipeStep.createMany({
        data: [
          {
            recipeId: testRecipeId,
            stepNum: 1,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 2,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 3,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 4,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
        ],
      });

      // Steps 2 and 3 both use output of step 1
      await db.stepOutputUse.createMany({
        data: [
          { recipeId: testRecipeId, outputStepNum: 1, inputStepNum: 2 },
          { recipeId: testRecipeId, outputStepNum: 1, inputStepNum: 3 },
        ],
      });

      // Moving step 1 to position 4 would pass both step 2 and step 3
      const result = await validateStepReorder(testRecipeId, 1, 4);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toBe(
          "Cannot move Step 1 to position 4 because Steps 2 and 3 use its output"
        );
      }
    });

    it("should return error listing three or more blocking steps with Oxford comma", async () => {
      // Create five steps
      await db.recipeStep.createMany({
        data: [
          {
            recipeId: testRecipeId,
            stepNum: 1,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 2,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 3,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 4,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 5,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
        ],
      });

      // Steps 2, 3, and 4 all use output of step 1
      await db.stepOutputUse.createMany({
        data: [
          { recipeId: testRecipeId, outputStepNum: 1, inputStepNum: 2 },
          { recipeId: testRecipeId, outputStepNum: 1, inputStepNum: 3 },
          { recipeId: testRecipeId, outputStepNum: 1, inputStepNum: 4 },
        ],
      });

      // Moving step 1 to position 5 would pass steps 2, 3, and 4
      const result = await validateStepReorder(testRecipeId, 1, 5);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toBe(
          "Cannot move Step 1 to position 5 because Steps 2, 3, and 4 use its output"
        );
      }
    });

    it("should only include blocking steps that would be before the new position", async () => {
      // Create five steps
      await db.recipeStep.createMany({
        data: [
          {
            recipeId: testRecipeId,
            stepNum: 1,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 2,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 3,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 4,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 5,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
        ],
      });

      // Steps 2, 3, 4, and 5 all use output of step 1
      await db.stepOutputUse.createMany({
        data: [
          { recipeId: testRecipeId, outputStepNum: 1, inputStepNum: 2 },
          { recipeId: testRecipeId, outputStepNum: 1, inputStepNum: 3 },
          { recipeId: testRecipeId, outputStepNum: 1, inputStepNum: 4 },
          { recipeId: testRecipeId, outputStepNum: 1, inputStepNum: 5 },
        ],
      });

      // Moving step 1 to position 3 only violates steps 2 (step 3, 4, 5 are >= new position)
      // After reorder: 2 becomes 1, 1 becomes 3, and 3,4,5 stay at 3,4,5
      // Actually: when moving from 1 to 3, steps 2 and 3 shift down
      // The blocking steps are those whose current position is <= newPosition but > currentPosition
      // i.e., dependents at positions 2 and 3 would be passed over
      const result = await validateStepReorder(testRecipeId, 1, 3);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        // Only steps 2 and 3 are blocking (steps at positions 4 and 5 would still be after)
        expect(result.error).toBe(
          "Cannot move Step 1 to position 3 because Steps 2 and 3 use its output"
        );
      }
    });
  });

  describe("edge cases", () => {
    it("should return valid for non-existent step", async () => {
      // Create a step
      await db.recipeStep.create({
        data: {
          recipeId: testRecipeId,
          stepNum: 1,
          stepTitle: createStepTitle(),
          description: createStepDescription(),
        },
      });

      // Validating reorder of non-existent step - should be valid (no dependencies exist)
      const result = await validateStepReorder(testRecipeId, 99, 1);

      expect(result).toEqual({ valid: true });
    });

    it("should return valid for non-existent recipe", async () => {
      const result = await validateStepReorder("non-existent-recipe-id", 1, 2);

      expect(result).toEqual({ valid: true });
    });

    it("should only consider dependencies from the specified recipe", async () => {
      // Create steps for the test recipe
      await db.recipeStep.createMany({
        data: [
          {
            recipeId: testRecipeId,
            stepNum: 1,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 2,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 3,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
        ],
      });

      // No dependencies in test recipe

      // Create another recipe with a dependency
      const otherRecipe = await db.recipe.create({
        data: createTestRecipe(testUserId),
      });
      await db.recipeStep.createMany({
        data: [
          {
            recipeId: otherRecipe.id,
            stepNum: 1,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: otherRecipe.id,
            stepNum: 2,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
        ],
      });
      await db.stepOutputUse.create({
        data: {
          recipeId: otherRecipe.id,
          outputStepNum: 1,
          inputStepNum: 2,
        },
      });

      // Test recipe's step 1 should be movable (no dependents in this recipe)
      const result = await validateStepReorder(testRecipeId, 1, 3);

      expect(result).toEqual({ valid: true });
    });

    it("should return blocking steps in ascending order by step number", async () => {
      // Create five steps
      await db.recipeStep.createMany({
        data: [
          {
            recipeId: testRecipeId,
            stepNum: 1,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 2,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 3,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 4,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 5,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
        ],
      });

      // Create dependencies in non-ascending order
      await db.stepOutputUse.createMany({
        data: [
          { recipeId: testRecipeId, outputStepNum: 1, inputStepNum: 4 },
          { recipeId: testRecipeId, outputStepNum: 1, inputStepNum: 2 },
          { recipeId: testRecipeId, outputStepNum: 1, inputStepNum: 3 },
        ],
      });

      // Moving step 1 to position 5
      const result = await validateStepReorder(testRecipeId, 1, 5);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        // Should be in ascending order: 2, 3, 4
        expect(result.error).toBe(
          "Cannot move Step 1 to position 5 because Steps 2, 3, and 4 use its output"
        );
      }
    });

    it("should handle moving middle step forward past dependents", async () => {
      // Create four steps
      await db.recipeStep.createMany({
        data: [
          {
            recipeId: testRecipeId,
            stepNum: 1,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 2,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 3,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 4,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
        ],
      });

      // Step 3 uses output of step 2
      await db.stepOutputUse.create({
        data: {
          recipeId: testRecipeId,
          outputStepNum: 2,
          inputStepNum: 3,
        },
      });

      // Moving step 2 to position 4 would pass step 3
      const result = await validateStepReorder(testRecipeId, 2, 4);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toBe(
          "Cannot move Step 2 to position 4 because Step 3 uses its output"
        );
      }
    });
  });
});

describe("validateStepReorderOutgoing", () => {
  let testUserId: string;
  let testRecipeId: string;

  beforeEach(async () => {
    await cleanupDatabase();

    // Create test user
    const user = await db.user.create({
      data: createTestUser(),
    });
    testUserId = user.id;

    // Create test recipe
    const recipe = await db.recipe.create({
      data: createTestRecipe(testUserId),
    });
    testRecipeId = recipe.id;
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe("valid reorders (no outgoing dependencies violated)", () => {
    it("should return valid when step has no outgoing dependencies", async () => {
      // Create three steps with no dependencies
      await db.recipeStep.createMany({
        data: [
          {
            recipeId: testRecipeId,
            stepNum: 1,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 2,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 3,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
        ],
      });

      // Moving step 3 to position 1 should be valid since step 3 uses no previous steps
      const result = await validateStepReorderOutgoing(testRecipeId, 3, 1);

      expect(result).toEqual({ valid: true });
    });

    it("should return valid when moving step backward but dependencies are still before new position", async () => {
      // Create four steps
      await db.recipeStep.createMany({
        data: [
          {
            recipeId: testRecipeId,
            stepNum: 1,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 2,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 3,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 4,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
        ],
      });

      // Step 4 uses output of step 1
      await db.stepOutputUse.create({
        data: {
          recipeId: testRecipeId,
          outputStepNum: 1,
          inputStepNum: 4,
        },
      });

      // Moving step 4 to position 2 is OK - step 1 (the dependency) is still before position 2
      const result = await validateStepReorderOutgoing(testRecipeId, 4, 2);

      expect(result).toEqual({ valid: true });
    });

    it("should return valid when moving step forward", async () => {
      // Create three steps
      await db.recipeStep.createMany({
        data: [
          {
            recipeId: testRecipeId,
            stepNum: 1,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 2,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 3,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
        ],
      });

      // Step 2 uses output of step 1
      await db.stepOutputUse.create({
        data: {
          recipeId: testRecipeId,
          outputStepNum: 1,
          inputStepNum: 2,
        },
      });

      // Moving step 2 forward to position 3 is OK - step 1 still comes before
      const result = await validateStepReorderOutgoing(testRecipeId, 2, 3);

      expect(result).toEqual({ valid: true });
    });

    it("should return valid when staying in same position", async () => {
      // Create two steps
      await db.recipeStep.createMany({
        data: [
          {
            recipeId: testRecipeId,
            stepNum: 1,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 2,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
        ],
      });

      // Step 2 uses output of step 1
      await db.stepOutputUse.create({
        data: {
          recipeId: testRecipeId,
          outputStepNum: 1,
          inputStepNum: 2,
        },
      });

      // "Moving" step 2 to position 2 (no change) is always valid
      const result = await validateStepReorderOutgoing(testRecipeId, 2, 2);

      expect(result).toEqual({ valid: true });
    });
  });

  describe("invalid reorders (outgoing dependencies violated)", () => {
    it("should return error when moving step before a step it uses", async () => {
      // Create three steps
      await db.recipeStep.createMany({
        data: [
          {
            recipeId: testRecipeId,
            stepNum: 1,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 2,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 3,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
        ],
      });

      // Step 3 uses output of step 2
      await db.stepOutputUse.create({
        data: {
          recipeId: testRecipeId,
          outputStepNum: 2,
          inputStepNum: 3,
        },
      });

      // Moving step 3 to position 1 would violate the dependency
      // Step 3 uses step 2, so step 3 cannot be before step 2
      const result = await validateStepReorderOutgoing(testRecipeId, 3, 1);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toBe(
          "Cannot move Step 3 to position 1 because it uses output from Step 2"
        );
      }
    });

    it("should return error listing multiple blocking dependencies", async () => {
      // Create four steps
      await db.recipeStep.createMany({
        data: [
          {
            recipeId: testRecipeId,
            stepNum: 1,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 2,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 3,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 4,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
        ],
      });

      // Step 4 uses outputs of steps 2 and 3
      await db.stepOutputUse.createMany({
        data: [
          { recipeId: testRecipeId, outputStepNum: 2, inputStepNum: 4 },
          { recipeId: testRecipeId, outputStepNum: 3, inputStepNum: 4 },
        ],
      });

      // Moving step 4 to position 1 would violate both dependencies
      const result = await validateStepReorderOutgoing(testRecipeId, 4, 1);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toBe(
          "Cannot move Step 4 to position 1 because it uses output from Steps 2 and 3"
        );
      }
    });

    it("should return error listing three or more blocking dependencies with Oxford comma", async () => {
      // Create five steps
      await db.recipeStep.createMany({
        data: [
          {
            recipeId: testRecipeId,
            stepNum: 1,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 2,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 3,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 4,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 5,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
        ],
      });

      // Step 5 uses outputs of steps 2, 3, and 4
      await db.stepOutputUse.createMany({
        data: [
          { recipeId: testRecipeId, outputStepNum: 2, inputStepNum: 5 },
          { recipeId: testRecipeId, outputStepNum: 3, inputStepNum: 5 },
          { recipeId: testRecipeId, outputStepNum: 4, inputStepNum: 5 },
        ],
      });

      // Moving step 5 to position 1 would violate all three dependencies
      const result = await validateStepReorderOutgoing(testRecipeId, 5, 1);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toBe(
          "Cannot move Step 5 to position 1 because it uses output from Steps 2, 3, and 4"
        );
      }
    });

    it("should only include blocking dependencies that would be after the new position", async () => {
      // Create five steps
      await db.recipeStep.createMany({
        data: [
          {
            recipeId: testRecipeId,
            stepNum: 1,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 2,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 3,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 4,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 5,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
        ],
      });

      // Step 5 uses outputs of steps 1, 2, 3, and 4
      await db.stepOutputUse.createMany({
        data: [
          { recipeId: testRecipeId, outputStepNum: 1, inputStepNum: 5 },
          { recipeId: testRecipeId, outputStepNum: 2, inputStepNum: 5 },
          { recipeId: testRecipeId, outputStepNum: 3, inputStepNum: 5 },
          { recipeId: testRecipeId, outputStepNum: 4, inputStepNum: 5 },
        ],
      });

      // Moving step 5 to position 3 only violates steps 3 and 4
      // Step 1 and 2 would still be before position 3
      const result = await validateStepReorderOutgoing(testRecipeId, 5, 3);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        // Only steps 3 and 4 are blocking (steps at positions 1 and 2 would still be before)
        expect(result.error).toBe(
          "Cannot move Step 5 to position 3 because it uses output from Steps 3 and 4"
        );
      }
    });
  });

  describe("edge cases", () => {
    it("should return valid for non-existent step", async () => {
      // Create a step
      await db.recipeStep.create({
        data: {
          recipeId: testRecipeId,
          stepNum: 1,
          stepTitle: createStepTitle(),
          description: createStepDescription(),
        },
      });

      // Validating reorder of non-existent step - should be valid (no dependencies exist)
      const result = await validateStepReorderOutgoing(testRecipeId, 99, 1);

      expect(result).toEqual({ valid: true });
    });

    it("should return valid for non-existent recipe", async () => {
      const result = await validateStepReorderOutgoing(
        "non-existent-recipe-id",
        3,
        1
      );

      expect(result).toEqual({ valid: true });
    });

    it("should only consider dependencies from the specified recipe", async () => {
      // Create steps for the test recipe
      await db.recipeStep.createMany({
        data: [
          {
            recipeId: testRecipeId,
            stepNum: 1,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 2,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 3,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
        ],
      });

      // No dependencies in test recipe's step 3

      // Create another recipe with a dependency on its step 3
      const otherRecipe = await db.recipe.create({
        data: createTestRecipe(testUserId),
      });
      await db.recipeStep.createMany({
        data: [
          {
            recipeId: otherRecipe.id,
            stepNum: 1,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: otherRecipe.id,
            stepNum: 2,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: otherRecipe.id,
            stepNum: 3,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
        ],
      });
      await db.stepOutputUse.create({
        data: {
          recipeId: otherRecipe.id,
          outputStepNum: 2,
          inputStepNum: 3,
        },
      });

      // Test recipe's step 3 should be movable to position 1 (no dependencies in this recipe)
      const result = await validateStepReorderOutgoing(testRecipeId, 3, 1);

      expect(result).toEqual({ valid: true });
    });

    it("should return blocking steps in ascending order by step number", async () => {
      // Create five steps
      await db.recipeStep.createMany({
        data: [
          {
            recipeId: testRecipeId,
            stepNum: 1,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 2,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 3,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 4,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 5,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
        ],
      });

      // Create dependencies in non-ascending order
      await db.stepOutputUse.createMany({
        data: [
          { recipeId: testRecipeId, outputStepNum: 4, inputStepNum: 5 },
          { recipeId: testRecipeId, outputStepNum: 2, inputStepNum: 5 },
          { recipeId: testRecipeId, outputStepNum: 3, inputStepNum: 5 },
        ],
      });

      // Moving step 5 to position 1
      const result = await validateStepReorderOutgoing(testRecipeId, 5, 1);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        // Should be in ascending order: 2, 3, 4
        expect(result.error).toBe(
          "Cannot move Step 5 to position 1 because it uses output from Steps 2, 3, and 4"
        );
      }
    });

    it("should handle moving middle step backward past dependencies", async () => {
      // Create four steps
      await db.recipeStep.createMany({
        data: [
          {
            recipeId: testRecipeId,
            stepNum: 1,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 2,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 3,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 4,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
        ],
      });

      // Step 3 uses output of step 2
      await db.stepOutputUse.create({
        data: {
          recipeId: testRecipeId,
          outputStepNum: 2,
          inputStepNum: 3,
        },
      });

      // Moving step 3 to position 1 would violate the dependency (step 2 would be after)
      const result = await validateStepReorderOutgoing(testRecipeId, 3, 1);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toBe(
          "Cannot move Step 3 to position 1 because it uses output from Step 2"
        );
      }
    });
  });
});
