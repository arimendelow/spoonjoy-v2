import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Request as UndiciRequest, FormData as UndiciFormData } from "undici";
import { db } from "~/lib/db.server";
import { loader, action } from "~/routes/shopping-list";
import { createUser } from "~/lib/auth.server";
import { sessionStorage } from "~/lib/session.server";
import { cleanupDatabase } from "../helpers/cleanup";
import { faker } from "@faker-js/faker";

describe("Shopping List Route", () => {
  let testUserId: string;

  beforeEach(async () => {
    await cleanupDatabase();
    const email = faker.internet.email();
    const username = faker.internet.username() + "_" + faker.string.alphanumeric(8);
    const user = await createUser(db, email, username, "testPassword123");
    testUserId = user.id;
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe("loader", () => {
    it("should redirect when not logged in", async () => {
      const request = new UndiciRequest("http://localhost:3000/shopping-list");

      await expect(
        loader({
          request,
          context: { cloudflare: { env: null } },
          params: {},
        } as any)
      ).rejects.toSatisfy((error: any) => {
        expect(error).toBeInstanceOf(Response);
        expect(error.status).toBe(302);
        expect(error.headers.get("Location")).toContain("/login");
        return true;
      });
    });

    it("should create shopping list if not exists and return empty items", async () => {
      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest("http://localhost:3000/shopping-list", { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result.shoppingList).toBeDefined();
      expect(result.shoppingList.authorId).toBe(testUserId);
      expect(result.shoppingList.items).toEqual([]);
      expect(result.recipes).toEqual([]);
    });

    it("should return existing shopping list with items", async () => {
      // Create shopping list with items
      const shoppingList = await db.shoppingList.create({
        data: { authorId: testUserId },
      });

      const ingredientRef = await db.ingredientRef.create({
        data: { name: "apples" },
      });

      await db.shoppingListItem.create({
        data: {
          shoppingListId: shoppingList.id,
          ingredientRefId: ingredientRef.id,
          quantity: 5,
        },
      });

      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest("http://localhost:3000/shopping-list", { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result.shoppingList.items).toHaveLength(1);
      expect(result.shoppingList.items[0].quantity).toBe(5);
      expect(result.shoppingList.items[0].ingredientRef.name).toBe("apples");
    });

    it("should return user recipes for adding to shopping list", async () => {
      await db.recipe.create({
        data: {
          title: "Test Recipe",
          chefId: testUserId,
        },
      });

      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest("http://localhost:3000/shopping-list", { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result.recipes).toHaveLength(1);
      expect(result.recipes[0].title).toBe("Test Recipe");
    });
  });

  describe("action - addItem", () => {
    async function createFormRequest(
      formFields: Record<string, string>,
      userId?: string
    ): Promise<UndiciRequest> {
      const formData = new UndiciFormData();
      for (const [key, value] of Object.entries(formFields)) {
        formData.append(key, value);
      }

      const headers = new Headers();

      if (userId) {
        const session = await sessionStorage.getSession();
        session.set("userId", userId);
        const setCookieHeader = await sessionStorage.commitSession(session);
        const cookieValue = setCookieHeader.split(";")[0];
        headers.set("Cookie", cookieValue);
      }

      return new UndiciRequest("http://localhost:3000/shopping-list", {
        method: "POST",
        body: formData,
        headers,
      });
    }

    it("should add new item to shopping list", async () => {
      const request = await createFormRequest(
        {
          intent: "addItem",
          ingredientName: "bananas",
          quantity: "3",
          unitName: "pieces",
        },
        testUserId
      );

      await action({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      const shoppingList = await db.shoppingList.findUnique({
        where: { authorId: testUserId },
        include: {
          items: {
            include: { ingredientRef: true },
          },
        },
      });

      expect(shoppingList?.items).toHaveLength(1);
      expect(shoppingList?.items[0].ingredientRef.name).toBe("bananas");
      expect(shoppingList?.items[0].quantity).toBe(3);
    });

    it("should add item with unit", async () => {
      const request = await createFormRequest(
        {
          intent: "addItem",
          ingredientName: "milk",
          quantity: "2",
          unitName: "cups",
        },
        testUserId
      );

      await action({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      const shoppingList = await db.shoppingList.findUnique({
        where: { authorId: testUserId },
        include: {
          items: {
            include: { ingredientRef: true, unit: true },
          },
        },
      });

      expect(shoppingList?.items).toHaveLength(1);
      expect(shoppingList?.items[0].ingredientRef.name).toBe("milk");
      expect(shoppingList?.items[0].unit?.name).toBe("cups");
      expect(shoppingList?.items[0].quantity).toBe(2);
    });

    it("should update quantity if item already exists", async () => {
      // Create initial shopping list and item with unit
      const shoppingList = await db.shoppingList.create({
        data: { authorId: testUserId },
      });

      const ingredientRef = await db.ingredientRef.create({
        data: { name: "oranges" },
      });

      const unit = await db.unit.findFirst({ where: { name: "pieces" } }) ||
        await db.unit.create({ data: { name: "pieces" } });

      await db.shoppingListItem.create({
        data: {
          shoppingListId: shoppingList.id,
          ingredientRefId: ingredientRef.id,
          unitId: unit.id,
          quantity: 5,
        },
      });

      // Add more of the same item
      const request = await createFormRequest(
        {
          intent: "addItem",
          ingredientName: "oranges",
          unitName: "pieces",
          quantity: "3",
        },
        testUserId
      );

      await action({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      const updatedList = await db.shoppingList.findUnique({
        where: { authorId: testUserId },
        include: {
          items: {
            include: { ingredientRef: true },
          },
        },
      });

      expect(updatedList?.items).toHaveLength(1);
      expect(updatedList?.items[0].quantity).toBe(8); // 5 + 3
    });
  });

  describe("action - toggleCheck", () => {
    async function createFormRequest(
      formFields: Record<string, string>,
      userId?: string
    ): Promise<UndiciRequest> {
      const formData = new UndiciFormData();
      for (const [key, value] of Object.entries(formFields)) {
        formData.append(key, value);
      }

      const headers = new Headers();

      if (userId) {
        const session = await sessionStorage.getSession();
        session.set("userId", userId);
        const setCookieHeader = await sessionStorage.commitSession(session);
        const cookieValue = setCookieHeader.split(";")[0];
        headers.set("Cookie", cookieValue);
      }

      return new UndiciRequest("http://localhost:3000/shopping-list", {
        method: "POST",
        body: formData,
        headers,
      });
    }

    it("should toggle item checked status", async () => {
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
          checked: false,
        },
      });

      const request = await createFormRequest(
        {
          intent: "toggleCheck",
          itemId: item.id,
        },
        testUserId
      );

      await action({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      const updatedItem = await db.shoppingListItem.findUnique({
        where: { id: item.id },
      });

      expect(updatedItem?.checked).toBe(true);
    });
  });

  describe("action - clearCompleted", () => {
    async function createFormRequest(
      formFields: Record<string, string>,
      userId?: string
    ): Promise<UndiciRequest> {
      const formData = new UndiciFormData();
      for (const [key, value] of Object.entries(formFields)) {
        formData.append(key, value);
      }

      const headers = new Headers();

      if (userId) {
        const session = await sessionStorage.getSession();
        session.set("userId", userId);
        const setCookieHeader = await sessionStorage.commitSession(session);
        const cookieValue = setCookieHeader.split(";")[0];
        headers.set("Cookie", cookieValue);
      }

      return new UndiciRequest("http://localhost:3000/shopping-list", {
        method: "POST",
        body: formData,
        headers,
      });
    }

    it("should delete only checked items", async () => {
      const shoppingList = await db.shoppingList.create({
        data: { authorId: testUserId },
      });

      const ingredientRef1 = await db.ingredientRef.create({
        data: { name: "item1_" + faker.string.alphanumeric(6) },
      });

      const ingredientRef2 = await db.ingredientRef.create({
        data: { name: "item2_" + faker.string.alphanumeric(6) },
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

      const request = await createFormRequest(
        { intent: "clearCompleted" },
        testUserId
      );

      await action({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      const items = await db.shoppingListItem.findMany({
        where: { shoppingListId: shoppingList.id },
      });

      expect(items).toHaveLength(1);
      expect(items[0].checked).toBe(false);
    });
  });
});
