import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { db } from "~/lib/db.server";
import { getOrCreateUnit, getOrCreateIngredientRef } from "../utils";

describe("RecipeStep Model", () => {
  let testUserId: string;
  let testRecipeId: string;

  beforeEach(async () => {
    const user = await db.user.create({
      data: {
        email: "test@example.com",
        username: "testuser",
        hashedPassword: "hashedpassword",
        salt: "salt",
      },
    });
    testUserId = user.id;

    const recipe = await db.recipe.create({
      data: {
        title: "Test Recipe",
        chefId: testUserId,
      },
    });
    testRecipeId = recipe.id;
  });

  afterEach(async () => {
    await db.recipeStep.deleteMany({});
    await db.recipe.deleteMany({});
    await db.user.deleteMany({});
  });

  describe("create", () => {
    it("should create a step with required fields", async () => {
      const step = await db.recipeStep.create({
        data: {
          recipeId: testRecipeId,
          stepNum: 1,
          description: "Mix ingredients",
        },
      });

      expect(step).toBeDefined();
      expect(step.stepNum).toBe(1);
      expect(step.description).toBe("Mix ingredients");
      expect(step.stepTitle).toBeNull();
    });

    it("should create a step with optional title", async () => {
      const step = await db.recipeStep.create({
        data: {
          recipeId: testRecipeId,
          stepNum: 1,
          stepTitle: "Preparation",
          description: "Prepare ingredients",
        },
      });

      expect(step.stepTitle).toBe("Preparation");
    });

    it("should enforce unique stepNum per recipe", async () => {
      await db.recipeStep.create({
        data: {
          recipeId: testRecipeId,
          stepNum: 1,
          description: "Step 1",
        },
      });

      await expect(
        db.recipeStep.create({
          data: {
            recipeId: testRecipeId,
            stepNum: 1,
            description: "Duplicate Step 1",
          },
        })
      ).rejects.toThrow();
    });
  });

  describe("read", () => {
    it("should find steps by recipe ordered by stepNum", async () => {
      await db.recipeStep.createMany({
        data: [
          { recipeId: testRecipeId, stepNum: 2, description: "Second" },
          { recipeId: testRecipeId, stepNum: 1, description: "First" },
          { recipeId: testRecipeId, stepNum: 3, description: "Third" },
        ],
      });

      const steps = await db.recipeStep.findMany({
        where: { recipeId: testRecipeId },
        orderBy: { stepNum: "asc" },
      });

      expect(steps).toHaveLength(3);
      expect(steps[0].description).toBe("First");
      expect(steps[1].description).toBe("Second");
      expect(steps[2].description).toBe("Third");
    });

    it("should include ingredients in step query", async () => {
      const step = await db.recipeStep.create({
        data: {
          recipeId: testRecipeId,
          stepNum: 1,
          description: "Mix",
        },
      });

      const unit = await getOrCreateUnit(db, "cup");

      const ingredientRef = await getOrCreateIngredientRef(db, "flour");

      await db.ingredient.create({
        data: {
          recipeId: testRecipeId,
          stepNum: 1,
          quantity: 2,
          unitId: unit.id,
          ingredientRefId: ingredientRef.id,
        },
      });

      const foundStep = await db.recipeStep.findUnique({
        where: { id: step.id },
        include: { ingredients: true },
      });

      expect(foundStep?.ingredients).toHaveLength(1);
      expect(foundStep?.ingredients[0].quantity).toBe(2);
    });
  });

  describe("update", () => {
    it("should update step fields", async () => {
      const step = await db.recipeStep.create({
        data: {
          recipeId: testRecipeId,
          stepNum: 1,
          description: "Original",
        },
      });

      const updated = await db.recipeStep.update({
        where: { id: step.id },
        data: {
          stepTitle: "New Title",
          description: "Updated description",
        },
      });

      expect(updated.stepTitle).toBe("New Title");
      expect(updated.description).toBe("Updated description");
    });

    it("should update stepNum for reordering", async () => {
      const step = await db.recipeStep.create({
        data: {
          recipeId: testRecipeId,
          stepNum: 1,
          description: "Step",
        },
      });

      const updated = await db.recipeStep.update({
        where: { id: step.id },
        data: { stepNum: 2 },
      });

      expect(updated.stepNum).toBe(2);
    });
  });

  describe("delete", () => {
    it("should delete step", async () => {
      const step = await db.recipeStep.create({
        data: {
          recipeId: testRecipeId,
          stepNum: 1,
          description: "To delete",
        },
      });

      await db.recipeStep.delete({
        where: { id: step.id },
      });

      const found = await db.recipeStep.findUnique({
        where: { id: step.id },
      });

      expect(found).toBeNull();
    });

    it("should cascade delete ingredients when step is deleted", async () => {
      const step = await db.recipeStep.create({
        data: {
          recipeId: testRecipeId,
          stepNum: 1,
          description: "Step with ingredients",
        },
      });

      const unit = await getOrCreateUnit(db, "cup");

      const ingredientRef = await getOrCreateIngredientRef(db, "flour");

      await db.ingredient.create({
        data: {
          recipeId: testRecipeId,
          stepNum: 1,
          quantity: 2,
          unitId: unit.id,
          ingredientRefId: ingredientRef.id,
        },
      });

      await db.recipeStep.delete({
        where: { id: step.id },
      });

      const ingredients = await db.ingredient.findMany({
        where: { recipeId: testRecipeId, stepNum: 1 },
      });

      expect(ingredients).toHaveLength(0);
    });
  });
});
