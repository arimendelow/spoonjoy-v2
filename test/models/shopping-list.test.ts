import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { db } from "~/lib/db.server";
import { getOrCreateUnit, getOrCreateIngredientRef } from "../utils";

describe("ShoppingList Model", () => {
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
    await db.user.deleteMany({});
  });

  describe("create", () => {
    it("should create a shopping list for user", async () => {
      const shoppingList = await db.shoppingList.create({
        data: {
          authorId: testUserId,
        },
      });

      expect(shoppingList).toBeDefined();
      expect(shoppingList.authorId).toBe(testUserId);
    });

    it("should enforce one shopping list per user", async () => {
      await db.shoppingList.create({
        data: {
          authorId: testUserId,
        },
      });

      await expect(
        db.shoppingList.create({
          data: {
            authorId: testUserId,
          },
        })
      ).rejects.toThrow();
    });
  });

  describe("items", () => {
    it("should add item to shopping list", async () => {
      const shoppingList = await db.shoppingList.create({
        data: {
          authorId: testUserId,
        },
      });

      const unit = await getOrCreateUnit(db, "lbs");

      const ingredientRef = await getOrCreateIngredientRef(db, "chicken");

      const item = await db.shoppingListItem.create({
        data: {
          shoppingListId: shoppingList.id,
          quantity: 2,
          unitId: unit.id,
          ingredientRefId: ingredientRef.id,
        },
      });

      expect(item).toBeDefined();
      expect(item.quantity).toBe(2);
      expect(item.checked).toBe(false);
    });

    it("should allow item without quantity or unit", async () => {
      const shoppingList = await db.shoppingList.create({
        data: {
          authorId: testUserId,
        },
      });

      const ingredientRef = await getOrCreateIngredientRef(db, "eggs");

      const item = await db.shoppingListItem.create({
        data: {
          shoppingListId: shoppingList.id,
          ingredientRefId: ingredientRef.id,
        },
      });

      expect(item.quantity).toBeNull();
      expect(item.unitId).toBeNull();
    });

    it("should enforce unique item per shopping list", async () => {
      const shoppingList = await db.shoppingList.create({
        data: {
          authorId: testUserId,
        },
      });

      const unit = await getOrCreateUnit(db, "cup");

      const ingredientRef = await getOrCreateIngredientRef(db, "flour");

      await db.shoppingListItem.create({
        data: {
          shoppingListId: shoppingList.id,
          unitId: unit.id,
          ingredientRefId: ingredientRef.id,
        },
      });

      await expect(
        db.shoppingListItem.create({
          data: {
            shoppingListId: shoppingList.id,
            unitId: unit.id,
            ingredientRefId: ingredientRef.id,
          },
        })
      ).rejects.toThrow();
    });

    it("should toggle checked status", async () => {
      const shoppingList = await db.shoppingList.create({
        data: {
          authorId: testUserId,
        },
      });

      const ingredientRef = await getOrCreateIngredientRef(db, "milk");

      const item = await db.shoppingListItem.create({
        data: {
          shoppingListId: shoppingList.id,
          ingredientRefId: ingredientRef.id,
        },
      });

      const updated = await db.shoppingListItem.update({
        where: { id: item.id },
        data: { checked: true },
      });

      expect(updated.checked).toBe(true);
    });

    it("should delete checked items", async () => {
      const shoppingList = await db.shoppingList.create({
        data: {
          authorId: testUserId,
        },
      });

      const ingredientRef1 = await getOrCreateIngredientRef(db, "item1");

      const ingredientRef2 = await getOrCreateIngredientRef(db, "item2");

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

  describe("cascade delete", () => {
    it("should delete items when shopping list is deleted", async () => {
      const shoppingList = await db.shoppingList.create({
        data: {
          authorId: testUserId,
        },
      });

      const ingredientRef = await getOrCreateIngredientRef(db, "butter");

      await db.shoppingListItem.create({
        data: {
          shoppingListId: shoppingList.id,
          ingredientRefId: ingredientRef.id,
        },
      });

      await db.shoppingList.delete({
        where: { id: shoppingList.id },
      });

      const items = await db.shoppingListItem.findMany({
        where: { shoppingListId: shoppingList.id },
      });

      expect(items).toHaveLength(0);
    });
  });
});
