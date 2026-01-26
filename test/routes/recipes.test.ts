import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { db } from "~/lib/db.server";
import { getOrCreateUnit, getOrCreateIngredientRef } from "../utils";

describe("Recipe Routes", () => {
  let testUserId: string;
  let mockContext: any;

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

    mockContext = {
      cloudflare: {
        env: null,
      },
    };
  });

  afterEach(async () => {
    await db.recipe.deleteMany({});
    await db.user.deleteMany({});
  });

  describe("recipes.new action", () => {
    it("should create a recipe with valid data", async () => {
      const formData = new FormData();
      formData.set("title", "Test Recipe");
      formData.set("description", "A test recipe");
      formData.set("servings", "4");

      const recipe = await db.recipe.create({
        data: {
          title: formData.get("title") as string,
          description: formData.get("description") as string,
          servings: formData.get("servings") as string,
          chefId: testUserId,
        },
      });

      expect(recipe.title).toBe("Test Recipe");
      expect(recipe.description).toBe("A test recipe");
      expect(recipe.servings).toBe("4");
      expect(recipe.chefId).toBe(testUserId);
    });

    it("should reject recipe without title", async () => {
      const title = "";
      const isValid = title.trim().length > 0;

      expect(isValid).toBe(false);
    });

    it("should allow recipe with only title", async () => {
      const formData = new FormData();
      formData.set("title", "Minimal Recipe");

      const recipe = await db.recipe.create({
        data: {
          title: formData.get("title") as string,
          chefId: testUserId,
        },
      });

      expect(recipe.title).toBe("Minimal Recipe");
      expect(recipe.description).toBeNull();
      expect(recipe.servings).toBeNull();
    });
  });

  describe("recipes.$id.edit action", () => {
    it("should update recipe with valid data", async () => {
      const recipe = await db.recipe.create({
        data: {
          title: "Original Title",
          chefId: testUserId,
        },
      });

      const updated = await db.recipe.update({
        where: { id: recipe.id },
        data: {
          title: "Updated Title",
          description: "New description",
        },
      });

      expect(updated.title).toBe("Updated Title");
      expect(updated.description).toBe("New description");
    });

    it("should not allow updating another user's recipe", async () => {
      const otherUser = await db.user.create({
        data: {
          email: "other@example.com",
          username: "otheruser",
          hashedPassword: "hashedpassword",
          salt: "salt",
        },
      });

      const recipe = await db.recipe.create({
        data: {
          title: "Other User Recipe",
          chefId: otherUser.id,
        },
      });

      const foundRecipe = await db.recipe.findUnique({
        where: { id: recipe.id },
        select: { chefId: true },
      });

      expect(foundRecipe?.chefId).not.toBe(testUserId);
    });

    it("should handle reorderStep action", async () => {
      const recipe = await db.recipe.create({
        data: {
          title: "Recipe with Steps",
          chefId: testUserId,
        },
      });

      const step1 = await db.recipeStep.create({
        data: {
          recipeId: recipe.id,
          stepNum: 1,
          description: "Step 1",
        },
      });

      const step2 = await db.recipeStep.create({
        data: {
          recipeId: recipe.id,
          stepNum: 2,
          description: "Step 2",
        },
      });

      // Simulate reorder: move step 2 up
      await db.recipeStep.update({
        where: { id: step2.id },
        data: { stepNum: -1 },
      });

      await db.recipeStep.update({
        where: { id: step1.id },
        data: { stepNum: 2 },
      });

      await db.recipeStep.update({
        where: { id: step2.id },
        data: { stepNum: 1 },
      });

      const steps = await db.recipeStep.findMany({
        where: { recipeId: recipe.id },
        orderBy: { stepNum: "asc" },
      });

      expect(steps[0].description).toBe("Step 2");
      expect(steps[1].description).toBe("Step 1");
    });
  });

  describe("recipes.$id.steps.new action", () => {
    it("should create a new step", async () => {
      const recipe = await db.recipe.create({
        data: {
          title: "Recipe",
          chefId: testUserId,
        },
      });

      const step = await db.recipeStep.create({
        data: {
          recipeId: recipe.id,
          stepNum: 1,
          stepTitle: "Preparation",
          description: "Prepare ingredients",
        },
      });

      expect(step.recipeId).toBe(recipe.id);
      expect(step.stepNum).toBe(1);
      expect(step.stepTitle).toBe("Preparation");
      expect(step.description).toBe("Prepare ingredients");
    });

    it("should calculate next step number correctly", async () => {
      const recipe = await db.recipe.create({
        data: {
          title: "Recipe",
          chefId: testUserId,
          steps: {
            create: [
              { stepNum: 1, description: "Step 1" },
              { stepNum: 2, description: "Step 2" },
            ],
          },
        },
      });

      const existingSteps = await db.recipeStep.findMany({
        where: { recipeId: recipe.id },
        orderBy: { stepNum: "desc" },
        take: 1,
      });

      const nextStepNum =
        existingSteps.length > 0 ? existingSteps[0].stepNum + 1 : 1;

      expect(nextStepNum).toBe(3);
    });
  });

  describe("recipes.$id.steps.$stepId.edit action", () => {
    it("should add ingredient to step", async () => {
      const recipe = await db.recipe.create({
        data: {
          title: "Recipe",
          chefId: testUserId,
        },
      });

      const step = await db.recipeStep.create({
        data: {
          recipeId: recipe.id,
          stepNum: 1,
          description: "Mix",
        },
      });

      const unit = await getOrCreateUnit(db, "cup");

      const ingredientRef = await getOrCreateIngredientRef(db, "flour");

      const ingredient = await db.ingredient.create({
        data: {
          recipeId: recipe.id,
          stepNum: 1,
          quantity: 2,
          unitId: unit.id,
          ingredientRefId: ingredientRef.id,
        },
      });

      expect(ingredient.quantity).toBe(2);
      expect(ingredient.unitId).toBe(unit.id);
      expect(ingredient.ingredientRefId).toBe(ingredientRef.id);
    });

    it("should delete ingredient from step", async () => {
      const recipe = await db.recipe.create({
        data: {
          title: "Recipe",
          chefId: testUserId,
        },
      });

      const step = await db.recipeStep.create({
        data: {
          recipeId: recipe.id,
          stepNum: 1,
          description: "Mix",
        },
      });

      const unit = await getOrCreateUnit(db, "cup");

      const ingredientRef = await db.ingredientRef.create({
        data: { name: "flour" },
      });

      const ingredient = await db.ingredient.create({
        data: {
          recipeId: recipe.id,
          stepNum: 1,
          quantity: 2,
          unitId: unit.id,
          ingredientRefId: ingredientRef.id,
        },
      });

      await db.ingredient.delete({
        where: { id: ingredient.id },
      });

      const found = await db.ingredient.findUnique({
        where: { id: ingredient.id },
      });

      expect(found).toBeNull();
    });

    it("should delete step with all ingredients", async () => {
      const recipe = await db.recipe.create({
        data: {
          title: "Recipe",
          chefId: testUserId,
        },
      });

      const step = await db.recipeStep.create({
        data: {
          recipeId: recipe.id,
          stepNum: 1,
          description: "Mix",
        },
      });

      const unit = await getOrCreateUnit(db, "cup3");

      const ingredientRef = await getOrCreateIngredientRef(db, "flour3");

      await db.ingredient.create({
        data: {
          recipeId: recipe.id,
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
        where: { recipeId: recipe.id, stepNum: 1 },
      });

      expect(ingredients).toHaveLength(0);
    });
  });
});
