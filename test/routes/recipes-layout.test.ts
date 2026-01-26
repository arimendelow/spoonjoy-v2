import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Request as UndiciRequest } from "undici";
import { db } from "~/lib/db.server";
import { loader } from "~/routes/recipes";
import { createUser } from "~/lib/auth.server";
import { sessionStorage } from "~/lib/session.server";
import { cleanupDatabase } from "../helpers/cleanup";
import { faker } from "@faker-js/faker";

describe("Recipes Layout Route", () => {
  let testUserId: string;
  let testUserEmail: string;
  let testUserUsername: string;

  beforeEach(async () => {
    await cleanupDatabase();
    testUserEmail = faker.internet.email();
    testUserUsername = faker.internet.username() + "_" + faker.string.alphanumeric(8);
    const user = await createUser(db, testUserEmail, testUserUsername, "testPassword123");
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

    it("should return user and empty recipes when logged in", async () => {
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

      expect(result.user).not.toBeNull();
      expect(result.user.username).toBe(testUserUsername);
      expect(result.recipes).toEqual([]);
    });

    it("should return user and recipes when logged in with recipes", async () => {
      // Create some recipes for the user
      await db.recipe.create({
        data: {
          title: "Test Recipe 1",
          description: "Description 1",
          chefId: testUserId,
        },
      });

      await db.recipe.create({
        data: {
          title: "Test Recipe 2",
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

      expect(result.user).not.toBeNull();
      expect(result.recipes).toHaveLength(2);
      expect(result.recipes[0]).toHaveProperty("title");
      expect(result.recipes[0]).toHaveProperty("description");
    });

    it("should not return deleted recipes", async () => {
      // Create a regular recipe
      await db.recipe.create({
        data: {
          title: "Active Recipe",
          chefId: testUserId,
        },
      });

      // Create a soft-deleted recipe
      await db.recipe.create({
        data: {
          title: "Deleted Recipe",
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
      expect(result.recipes[0].title).toBe("Active Recipe");
    });

    it("should throw 404 when user not found", async () => {
      // Create session with valid session but then delete the user
      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      // Delete the user (and their recipes to avoid FK constraint)
      await db.recipe.deleteMany({ where: { chefId: testUserId } });
      await db.user.delete({ where: { id: testUserId } });

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest("http://localhost:3000/recipes", { headers });

      await expect(
        loader({
          request,
          context: { cloudflare: { env: null } },
          params: {},
        } as any)
      ).rejects.toSatisfy((error: any) => {
        expect(error).toBeInstanceOf(Response);
        expect(error.status).toBe(404);
        return true;
      });
    });
  });
});
