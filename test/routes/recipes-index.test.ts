import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Request as UndiciRequest } from "undici";
import { db } from "~/lib/db.server";
import { loader } from "~/routes/recipes._index";
import { createUser } from "~/lib/auth.server";
import { sessionStorage } from "~/lib/session.server";
import { cleanupDatabase } from "../helpers/cleanup";
import { faker } from "@faker-js/faker";

describe("Recipes Index Route", () => {
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
      const request = new UndiciRequest("http://localhost:3000/recipes");

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

    it("should return empty recipes array when user has no recipes", async () => {
      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest("http://localhost:3000/recipes", { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result.recipes).toEqual([]);
    });

    it("should return user recipes ordered by updatedAt desc", async () => {
      // Create recipes with different updatedAt times
      const recipe1 = await db.recipe.create({
        data: {
          title: "Recipe 1 " + faker.string.alphanumeric(6),
          chefId: testUserId,
          updatedAt: new Date("2024-01-01"),
        },
      });

      const recipe2 = await db.recipe.create({
        data: {
          title: "Recipe 2 " + faker.string.alphanumeric(6),
          chefId: testUserId,
          updatedAt: new Date("2024-01-03"),
        },
      });

      const recipe3 = await db.recipe.create({
        data: {
          title: "Recipe 3 " + faker.string.alphanumeric(6),
          chefId: testUserId,
          updatedAt: new Date("2024-01-02"),
        },
      });

      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest("http://localhost:3000/recipes", { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result.recipes).toHaveLength(3);
      // Should be ordered by updatedAt desc: recipe2, recipe3, recipe1
      expect(result.recipes[0].id).toBe(recipe2.id);
      expect(result.recipes[1].id).toBe(recipe3.id);
      expect(result.recipes[2].id).toBe(recipe1.id);
    });

    it("should only return current user recipes", async () => {
      // Create another user
      const otherEmail = faker.internet.email();
      const otherUsername = faker.internet.username() + "_" + faker.string.alphanumeric(8);
      const otherUser = await createUser(db, otherEmail, otherUsername, "testPassword123");

      // Create recipe for current user
      await db.recipe.create({
        data: {
          title: "My Recipe " + faker.string.alphanumeric(6),
          chefId: testUserId,
        },
      });

      // Create recipe for other user
      await db.recipe.create({
        data: {
          title: "Other Recipe " + faker.string.alphanumeric(6),
          chefId: otherUser.id,
        },
      });

      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest("http://localhost:3000/recipes", { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result.recipes).toHaveLength(1);
      expect(result.recipes[0].title).toContain("My Recipe");
    });

    it("should exclude soft-deleted recipes", async () => {
      // Create an active recipe
      await db.recipe.create({
        data: {
          title: "Active Recipe " + faker.string.alphanumeric(6),
          chefId: testUserId,
        },
      });

      // Create a soft-deleted recipe
      await db.recipe.create({
        data: {
          title: "Deleted Recipe " + faker.string.alphanumeric(6),
          chefId: testUserId,
          deletedAt: new Date(),
        },
      });

      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest("http://localhost:3000/recipes", { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result.recipes).toHaveLength(1);
      expect(result.recipes[0].title).toContain("Active Recipe");
    });

    it("should return recipe with all expected fields", async () => {
      await db.recipe.create({
        data: {
          title: "Test Recipe",
          description: "Test Description",
          servings: "4",
          imageUrl: "https://example.com/image.jpg",
          chefId: testUserId,
        },
      });

      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest("http://localhost:3000/recipes", { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result.recipes).toHaveLength(1);
      const recipe = result.recipes[0];
      expect(recipe.id).toBeDefined();
      expect(recipe.title).toBe("Test Recipe");
      expect(recipe.description).toBe("Test Description");
      expect(recipe.servings).toBe("4");
      expect(recipe.imageUrl).toBe("https://example.com/image.jpg");
      expect(recipe.createdAt).toBeDefined();
      expect(recipe.updatedAt).toBeDefined();
    });
  });
});
