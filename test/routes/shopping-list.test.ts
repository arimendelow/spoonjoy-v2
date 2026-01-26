import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { db } from "~/lib/db.server";
import { getOrCreateUnit, getOrCreateIngredientRef } from "../utils";

describe("Shopping List Routes", () => {
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
    await db.shoppingListItem.deleteMany({});
    await db.shoppingList.deleteMany({});
    await db.ingredientRef.deleteMany({});
    await db.unit.deleteMany({});
    await db.recipe.deleteMany({});
    await db.user.deleteMany({});
  });

  describe("loader", () => {
    it("should get or create shopping list for user", async () => {
      let shoppingList = await db.shoppingList.findUnique({
        where: { authorId: testUserId },
      });

      if (!shoppingList) {
        shoppingList = await db.shoppingList.create({
          data: { authorId: testUserId },
        });
      }

      expect(shoppingList).toBeDefined();
      expect(shoppingList.authorId).toBe(testUserId);
    });

    it("should load shopping list with items", async () => {
      const shoppingList = await db.shoppingList.create({
        data: { authorId: testUserId },
      });

      const ingredientRef = await db.ingredientRef.create({
        data: { name: "milk" },
      });

      await db.shoppingListItem.create({
        data: {
          shoppingListId: shoppingList.id,
          ingredientRefId: ingredientRef.id,
        },
      });

      const loaded = await db.shoppingList.findUnique({
        where: { id: shoppingList.id },
        include: {
          items: {
            include: {
              unit: true,
              ingredientRef: true,
            },
          },
        },
      });

      expect(loaded?.items).toHaveLength(1);
      expect(loaded?.items[0].ingredientRef.name).toBe("milk");
    });
  });

  describe("action - addItem", () => {
    it("should add new item to shopping list", async () => {
      const shoppingList = await db.shoppingList.create({
        data: { authorId: testUserId },
      });

      const ingredientRef = await db.ingredientRef.create({
        data: { name: "bread" },
      });

      const item = await db.shoppingListItem.create({
        data: {
          shoppingListId: shoppingList.id,
          ingredientRefId: ingredientRef.id,
          quantity: 2,
        },
      });

      expect(item).toBeDefined();
      expect(item.quantity).toBe(2);
      expect(item.checked).toBe(false);
    });

    it("should update quantity if item already exists", async () => {
      const shoppingList = await db.shoppingList.create({
        data: { authorId: testUserId },
      });

      const unit = await getOrCreateUnit(db, "lbs");

      const ingredientRef = await db.ingredientRef.create({
        data: { name: "chicken" },
      });

      const existingItem = await db.shoppingListItem.create({
        data: {
          shoppingListId: shoppingList.id,
          quantity: 1,
          unitId: unit.id,
          ingredientRefId: ingredientRef.id,
        },
      });

      // Simulate adding more
      const updated = await db.shoppingListItem.update({
        where: { id: existingItem.id },
        data: { quantity: (existingItem.quantity || 0) + 2 },
      });

      expect(updated.quantity).toBe(3);
    });

    it("should create new unit and ingredient ref if needed", async () => {
      const shoppingList = await db.shoppingList.create({
        data: { authorId: testUserId },
      });

      let unit = await db.unit.findUnique({
        where: { name: "oz" },
      });

      if (!unit) {
        unit = await getOrCreateUnit(db, "oz");
      }

      let ingredientRef = await db.ingredientRef.findUnique({
        where: { name: "cheese" },
      });

      if (!ingredientRef) {
        ingredientRef = await db.ingredientRef.create({
          data: { name: "cheese" },
        });
      }

      const item = await db.shoppingListItem.create({
        data: {
          shoppingListId: shoppingList.id,
          quantity: 8,
          unitId: unit.id,
          ingredientRefId: ingredientRef.id,
        },
      });

      expect(item).toBeDefined();
      expect(unit.name).toBe("oz");
      expect(ingredientRef.name).toBe("cheese");
    });
  });

  describe("action - addFromRecipe", () => {
    it("should add all ingredients from recipe to shopping list", async () => {
      const shoppingList = await db.shoppingList.create({
        data: { authorId: testUserId },
      });

      const recipe = await db.recipe.create({
        data: {
          title: "Test Recipe",
          chefId: testUserId,
        },
      });

      const unit = await getOrCreateUnit(db, "cup");

      const ingredientRef = await db.ingredientRef.create({
        data: { name: "flour" },
      });

      const step = await db.recipeStep.create({
        data: {
          recipeId: recipe.id,
          stepNum: 1,
          description: "Mix",
        },
      });

      await db.ingredient.create({
        data: {
          recipeId: recipe.id,
          stepNum: 1,
          quantity: 2,
          unitId: unit.id,
          ingredientRefId: ingredientRef.id,
        },
      });

      // Get ingredients from recipe
      const recipeWithIngredients = await db.recipe.findUnique({
        where: { id: recipe.id },
        include: {
          steps: {
            include: {
              ingredients: {
                include: {
                  unit: true,
                  ingredientRef: true,
                },
              },
            },
          },
        },
      });

      // Add to shopping list
      for (const step of recipeWithIngredients!.steps) {
        for (const ingredient of step.ingredients) {
          await db.shoppingListItem.create({
            data: {
              shoppingListId: shoppingList.id,
              quantity: ingredient.quantity,
              unitId: ingredient.unitId,
              ingredientRefId: ingredient.ingredientRefId,
            },
          });
        }
      }

      const items = await db.shoppingListItem.findMany({
        where: { shoppingListId: shoppingList.id },
      });

      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(2);
    });
  });

  describe("action - toggleCheck", () => {
    it("should toggle item checked status", async () => {
      const shoppingList = await db.shoppingList.create({
        data: { authorId: testUserId },
      });

      const ingredientRef = await db.ingredientRef.create({
        data: { name: "eggs" },
      });

      const item = await db.shoppingListItem.create({
        data: {
          shoppingListId: shoppingList.id,
          ingredientRefId: ingredientRef.id,
          checked: false,
        },
      });

      const updated = await db.shoppingListItem.update({
        where: { id: item.id },
        data: { checked: !item.checked },
      });

      expect(updated.checked).toBe(true);
    });
  });

  describe("action - clearCompleted", () => {
    it("should delete only checked items", async () => {
      const shoppingList = await db.shoppingList.create({
        data: { authorId: testUserId },
      });

      const ingredientRef1 = await db.ingredientRef.create({
        data: { name: "item1" },
      });

      const ingredientRef2 = await db.ingredientRef.create({
        data: { name: "item2" },
      });

      const ingredientRef3 = await db.ingredientRef.create({
        data: { name: "item3" },
      });

      await db.shoppingListItem.create({
        data: {
          shoppingListId: shoppingList.id,
          ingredientRefId: ingredientRef1.id,
          checked: true,
        },
      });

      await db.shoppingListItem.create({
        data: {
          shoppingListId: shoppingList.id,
          ingredientRefId: ingredientRef2.id,
          checked: false,
        },
      });

      await db.shoppingListItem.create({
        data: {
          shoppingListId: shoppingList.id,
          ingredientRefId: ingredientRef3.id,
          checked: true,
        },
      });

      await db.shoppingListItem.deleteMany({
        where: {
          shoppingListId: shoppingList.id,
          checked: true,
        },
      });

      const remaining = await db.shoppingListItem.findMany({
        where: { shoppingListId: shoppingList.id },
      });

      expect(remaining).toHaveLength(1);
      expect(remaining[0].ingredientRefId).toBe(ingredientRef2.id);
    });
  });

  describe("action - clearAll", () => {
    it("should delete all items from shopping list", async () => {
      const shoppingList = await db.shoppingList.create({
        data: { authorId: testUserId },
      });

      const ingredientRef1 = await db.ingredientRef.create({
        data: { name: "item1" },
      });

      const ingredientRef2 = await db.ingredientRef.create({
        data: { name: "item2" },
      });

      await db.shoppingListItem.createMany({
        data: [
          {
            shoppingListId: shoppingList.id,
            ingredientRefId: ingredientRef1.id,
          },
          {
            shoppingListId: shoppingList.id,
            ingredientRefId: ingredientRef2.id,
          },
        ],
      });

      await db.shoppingListItem.deleteMany({
        where: { shoppingListId: shoppingList.id },
      });

      const items = await db.shoppingListItem.findMany({
        where: { shoppingListId: shoppingList.id },
      });

      expect(items).toHaveLength(0);
    });
  });
});
