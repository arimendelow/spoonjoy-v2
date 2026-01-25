import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { db } from "~/lib/db.server";

describe("Cookbook Model", () => {
  let testUserId: string;

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
  });

  afterEach(async () => {
    await db.recipeInCookbook.deleteMany({});
    await db.cookbook.deleteMany({});
    await db.recipe.deleteMany({});
    await db.user.deleteMany({});
  });

  describe("create", () => {
    it("should create a cookbook", async () => {
      const cookbook = await db.cookbook.create({
        data: {
          title: "My Favorites",
          authorId: testUserId,
        },
      });

      expect(cookbook).toBeDefined();
      expect(cookbook.title).toBe("My Favorites");
      expect(cookbook.authorId).toBe(testUserId);
    });

    it("should enforce unique title per author", async () => {
      await db.cookbook.create({
        data: {
          title: "Duplicate Title",
          authorId: testUserId,
        },
      });

      await expect(
        db.cookbook.create({
          data: {
            title: "Duplicate Title",
            authorId: testUserId,
          },
        })
      ).rejects.toThrow();
    });
  });

  describe("read", () => {
    it("should find cookbook by id with recipes", async () => {
      const cookbook = await db.cookbook.create({
        data: {
          title: "Test Cookbook",
          authorId: testUserId,
        },
      });

      const recipe = await db.recipe.create({
        data: {
          title: "Test Recipe",
          chefId: testUserId,
        },
      });

      await db.recipeInCookbook.create({
        data: {
          cookbookId: cookbook.id,
          recipeId: recipe.id,
          addedById: testUserId,
        },
      });

      const found = await db.cookbook.findUnique({
        where: { id: cookbook.id },
        include: { recipes: true },
      });

      expect(found).toBeDefined();
      expect(found?.recipes).toHaveLength(1);
    });

    it("should find cookbooks by author", async () => {
      await db.cookbook.createMany({
        data: [
          { title: "Cookbook 1", authorId: testUserId },
          { title: "Cookbook 2", authorId: testUserId },
        ],
      });

      const cookbooks = await db.cookbook.findMany({
        where: { authorId: testUserId },
      });

      expect(cookbooks).toHaveLength(2);
    });
  });

  describe("update", () => {
    it("should update cookbook title", async () => {
      const cookbook = await db.cookbook.create({
        data: {
          title: "Original Title",
          authorId: testUserId,
        },
      });

      const updated = await db.cookbook.update({
        where: { id: cookbook.id },
        data: { title: "Updated Title" },
      });

      expect(updated.title).toBe("Updated Title");
    });
  });

  describe("recipes", () => {
    it("should add recipe to cookbook", async () => {
      const cookbook = await db.cookbook.create({
        data: {
          title: "Test Cookbook",
          authorId: testUserId,
        },
      });

      const recipe = await db.recipe.create({
        data: {
          title: "Test Recipe",
          chefId: testUserId,
        },
      });

      const relation = await db.recipeInCookbook.create({
        data: {
          cookbookId: cookbook.id,
          recipeId: recipe.id,
          addedById: testUserId,
        },
      });

      expect(relation).toBeDefined();
      expect(relation.cookbookId).toBe(cookbook.id);
      expect(relation.recipeId).toBe(recipe.id);
    });

    it("should enforce unique recipe per cookbook", async () => {
      const cookbook = await db.cookbook.create({
        data: {
          title: "Test Cookbook",
          authorId: testUserId,
        },
      });

      const recipe = await db.recipe.create({
        data: {
          title: "Test Recipe",
          chefId: testUserId,
        },
      });

      await db.recipeInCookbook.create({
        data: {
          cookbookId: cookbook.id,
          recipeId: recipe.id,
          addedById: testUserId,
        },
      });

      await expect(
        db.recipeInCookbook.create({
          data: {
            cookbookId: cookbook.id,
            recipeId: recipe.id,
            addedById: testUserId,
          },
        })
      ).rejects.toThrow();
    });

    it("should remove recipe from cookbook", async () => {
      const cookbook = await db.cookbook.create({
        data: {
          title: "Test Cookbook",
          authorId: testUserId,
        },
      });

      const recipe = await db.recipe.create({
        data: {
          title: "Test Recipe",
          chefId: testUserId,
        },
      });

      const relation = await db.recipeInCookbook.create({
        data: {
          cookbookId: cookbook.id,
          recipeId: recipe.id,
          addedById: testUserId,
        },
      });

      await db.recipeInCookbook.delete({
        where: { id: relation.id },
      });

      const found = await db.recipeInCookbook.findUnique({
        where: { id: relation.id },
      });

      expect(found).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete cookbook", async () => {
      const cookbook = await db.cookbook.create({
        data: {
          title: "To Delete",
          authorId: testUserId,
        },
      });

      await db.cookbook.delete({
        where: { id: cookbook.id },
      });

      const found = await db.cookbook.findUnique({
        where: { id: cookbook.id },
      });

      expect(found).toBeNull();
    });

    it("should cascade delete recipe relations when cookbook is deleted", async () => {
      const cookbook = await db.cookbook.create({
        data: {
          title: "Test Cookbook",
          authorId: testUserId,
        },
      });

      const recipe = await db.recipe.create({
        data: {
          title: "Test Recipe",
          chefId: testUserId,
        },
      });

      await db.recipeInCookbook.create({
        data: {
          cookbookId: cookbook.id,
          recipeId: recipe.id,
          addedById: testUserId,
        },
      });

      await db.cookbook.delete({
        where: { id: cookbook.id },
      });

      const relations = await db.recipeInCookbook.findMany({
        where: { cookbookId: cookbook.id },
      });

      expect(relations).toHaveLength(0);
    });
  });
});
