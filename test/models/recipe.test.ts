import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { db } from "~/lib/db.server";

describe("Recipe Model", () => {
  let testUserId: string;

  beforeEach(async () => {
    // Create a test user
    const user = await db.user.create({
      data: {
        email: "test@example.com",
        username: "testuser",
        hashedPassword: "hashedpassword",
        salt: "salt",
      },
    });
    testUserId = user.id;
  });

  afterEach(async () => {
    // Clean up test data
    await db.recipe.deleteMany({});
    await db.user.deleteMany({});
  });

  describe("create", () => {
    it("should create a recipe with required fields", async () => {
      const recipe = await db.recipe.create({
        data: {
          title: "Test Recipe",
          chefId: testUserId,
        },
      });

      expect(recipe).toBeDefined();
      expect(recipe.title).toBe("Test Recipe");
      expect(recipe.chefId).toBe(testUserId);
      expect(recipe.imageUrl).toBeDefined();
      expect(recipe.deletedAt).toBeNull();
    });

    it("should create a recipe with optional fields", async () => {
      const recipe = await db.recipe.create({
        data: {
          title: "Test Recipe",
          description: "A delicious test recipe",
          servings: "4",
          imageUrl: "https://example.com/image.jpg",
          chefId: testUserId,
        },
      });

      expect(recipe.description).toBe("A delicious test recipe");
      expect(recipe.servings).toBe("4");
      expect(recipe.imageUrl).toBe("https://example.com/image.jpg");
    });

    it("should enforce unique title per chef (when not deleted)", async () => {
      await db.recipe.create({
        data: {
          title: "Duplicate Recipe",
          chefId: testUserId,
        },
      });

      await expect(
        db.recipe.create({
          data: {
            title: "Duplicate Recipe",
            chefId: testUserId,
          },
        })
      ).rejects.toThrow();
    });
  });

  describe("read", () => {
    it("should find recipe by id", async () => {
      const created = await db.recipe.create({
        data: {
          title: "Find Me",
          chefId: testUserId,
        },
      });

      const found = await db.recipe.findUnique({
        where: { id: created.id },
      });

      expect(found).toBeDefined();
      expect(found?.title).toBe("Find Me");
    });

    it("should find recipes by chef", async () => {
      await db.recipe.createMany({
        data: [
          { title: "Recipe 1", chefId: testUserId },
          { title: "Recipe 2", chefId: testUserId },
        ],
      });

      const recipes = await db.recipe.findMany({
        where: { chefId: testUserId, deletedAt: null },
      });

      expect(recipes).toHaveLength(2);
    });

    it("should exclude soft-deleted recipes", async () => {
      const recipe = await db.recipe.create({
        data: {
          title: "To Delete",
          chefId: testUserId,
        },
      });

      await db.recipe.update({
        where: { id: recipe.id },
        data: { deletedAt: new Date() },
      });

      const found = await db.recipe.findFirst({
        where: { id: recipe.id, deletedAt: null },
      });

      expect(found).toBeNull();
    });
  });

  describe("update", () => {
    it("should update recipe fields", async () => {
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
  });

  describe("delete", () => {
    it("should soft delete recipe", async () => {
      const recipe = await db.recipe.create({
        data: {
          title: "To Soft Delete",
          chefId: testUserId,
        },
      });

      await db.recipe.update({
        where: { id: recipe.id },
        data: { deletedAt: new Date() },
      });

      const found = await db.recipe.findUnique({
        where: { id: recipe.id },
      });

      expect(found?.deletedAt).not.toBeNull();
    });

    it("should cascade delete steps when recipe is deleted", async () => {
      const recipe = await db.recipe.create({
        data: {
          title: "Recipe with Steps",
          chefId: testUserId,
          steps: {
            create: {
              stepNum: 1,
              description: "Step 1",
            },
          },
        },
      });

      await db.recipe.delete({
        where: { id: recipe.id },
      });

      const steps = await db.recipeStep.findMany({
        where: { recipeId: recipe.id },
      });

      expect(steps).toHaveLength(0);
    });
  });
});
