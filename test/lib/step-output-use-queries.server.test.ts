import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { db } from "~/lib/db.server";
import { cleanupDatabase } from "../helpers/cleanup";
import { createTestUser, createTestRecipe, createStepDescription, createStepTitle } from "../utils";
import { loadRecipeStepOutputUses } from "~/lib/step-output-use-queries.server";

describe("loadRecipeStepOutputUses", () => {
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

  it("should return empty array when recipe has no steps", async () => {
    const result = await loadRecipeStepOutputUses(testRecipeId);

    expect(result).toEqual([]);
  });

  it("should return empty array when recipe has steps but no step output uses", async () => {
    // Create two steps without any step output uses
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

    const result = await loadRecipeStepOutputUses(testRecipeId);

    expect(result).toEqual([]);
  });

  it("should return step output uses with step details", async () => {
    // Create steps
    const step1Title = createStepTitle();
    const step2Title = createStepTitle();
    await db.recipeStep.createMany({
      data: [
        {
          recipeId: testRecipeId,
          stepNum: 1,
          stepTitle: step1Title,
          description: createStepDescription(),
        },
        {
          recipeId: testRecipeId,
          stepNum: 2,
          stepTitle: step2Title,
          description: createStepDescription(),
        },
      ],
    });

    // Create a step output use: step 2 uses output of step 1
    const stepOutputUse = await db.stepOutputUse.create({
      data: {
        recipeId: testRecipeId,
        outputStepNum: 1,
        inputStepNum: 2,
      },
    });

    const result = await loadRecipeStepOutputUses(testRecipeId);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(stepOutputUse.id);
    expect(result[0].recipeId).toBe(testRecipeId);
    expect(result[0].outputStepNum).toBe(1);
    expect(result[0].inputStepNum).toBe(2);
    expect(result[0].outputOfStep).toEqual({
      stepNum: 1,
      stepTitle: step1Title,
    });
  });

  it("should include outputOfStep with null stepTitle when step has no title", async () => {
    // Create steps (step 1 has no title)
    await db.recipeStep.createMany({
      data: [
        {
          recipeId: testRecipeId,
          stepNum: 1,
          stepTitle: null,
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

    // Create step output use: step 2 uses output of step 1
    await db.stepOutputUse.create({
      data: {
        recipeId: testRecipeId,
        outputStepNum: 1,
        inputStepNum: 2,
      },
    });

    const result = await loadRecipeStepOutputUses(testRecipeId);

    expect(result).toHaveLength(1);
    expect(result[0].outputOfStep).toEqual({
      stepNum: 1,
      stepTitle: null,
    });
  });

  it("should return multiple step output uses ordered by inputStepNum then outputStepNum", async () => {
    // Create three steps
    const step1Title = createStepTitle();
    const step2Title = createStepTitle();
    const step3Title = createStepTitle();
    await db.recipeStep.createMany({
      data: [
        {
          recipeId: testRecipeId,
          stepNum: 1,
          stepTitle: step1Title,
          description: createStepDescription(),
        },
        {
          recipeId: testRecipeId,
          stepNum: 2,
          stepTitle: step2Title,
          description: createStepDescription(),
        },
        {
          recipeId: testRecipeId,
          stepNum: 3,
          stepTitle: step3Title,
          description: createStepDescription(),
        },
      ],
    });

    // Create step output uses:
    // - Step 3 uses output of step 1
    // - Step 3 uses output of step 2
    // - Step 2 uses output of step 1
    await db.stepOutputUse.createMany({
      data: [
        { recipeId: testRecipeId, outputStepNum: 1, inputStepNum: 3 },
        { recipeId: testRecipeId, outputStepNum: 2, inputStepNum: 3 },
        { recipeId: testRecipeId, outputStepNum: 1, inputStepNum: 2 },
      ],
    });

    const result = await loadRecipeStepOutputUses(testRecipeId);

    expect(result).toHaveLength(3);
    // Ordered by inputStepNum ascending, then outputStepNum ascending
    expect(result[0].inputStepNum).toBe(2);
    expect(result[0].outputStepNum).toBe(1);
    expect(result[1].inputStepNum).toBe(3);
    expect(result[1].outputStepNum).toBe(1);
    expect(result[2].inputStepNum).toBe(3);
    expect(result[2].outputStepNum).toBe(2);
  });

  it("should only return step output uses for the specified recipe", async () => {
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
      ],
    });

    // Create step output use for test recipe
    await db.stepOutputUse.create({
      data: {
        recipeId: testRecipeId,
        outputStepNum: 1,
        inputStepNum: 2,
      },
    });

    // Create another recipe with steps and step output use
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

    const result = await loadRecipeStepOutputUses(testRecipeId);

    expect(result).toHaveLength(1);
    expect(result[0].recipeId).toBe(testRecipeId);
  });

  it("should return empty array for non-existent recipe", async () => {
    const result = await loadRecipeStepOutputUses("non-existent-recipe-id");

    expect(result).toEqual([]);
  });
});
