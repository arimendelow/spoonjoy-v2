import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Request as UndiciRequest, FormData as UndiciFormData } from "undici";
import { db } from "~/lib/db.server";
import { loader, action } from "~/routes/cookbooks.$id";
import { createUser } from "~/lib/auth.server";
import { sessionStorage } from "~/lib/session.server";
import { cleanupDatabase } from "../helpers/cleanup";
import { faker } from "@faker-js/faker";

// Helper to extract data from React Router's data() response
function extractResponseData(response: any): { data: any; status: number } {
  if (response && typeof response === "object" && response.type === "DataWithResponseInit") {
    return { data: response.data, status: response.init?.status || 200 };
  }
  if (response instanceof Response) {
    return { data: null, status: response.status };
  }
  return { data: response, status: 200 };
}

describe("Cookbooks $id Route", () => {
  let testUserId: string;
  let otherUserId: string;
  let cookbookId: string;

  beforeEach(async () => {
    await cleanupDatabase();
    const email = faker.internet.email();
    const username = faker.internet.username() + "_" + faker.string.alphanumeric(8);
    const user = await createUser(db, email, username, "testPassword123");
    testUserId = user.id;

    // Create another user for permission tests
    const otherEmail = faker.internet.email();
    const otherUsername = faker.internet.username() + "_" + faker.string.alphanumeric(8);
    const otherUser = await createUser(db, otherEmail, otherUsername, "testPassword123");
    otherUserId = otherUser.id;

    // Create a cookbook for testing
    const cookbook = await db.cookbook.create({
      data: {
        title: "Test Cookbook " + faker.string.alphanumeric(6),
        authorId: testUserId,
      },
    });
    cookbookId = cookbook.id;
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe("loader", () => {
    it("should redirect when not logged in", async () => {
      const request = new UndiciRequest(`http://localhost:3000/cookbooks/${cookbookId}`);

      await expect(
        loader({
          request,
          context: { cloudflare: { env: null } },
          params: { id: cookbookId },
        } as any)
      ).rejects.toSatisfy((error: any) => {
        expect(error).toBeInstanceOf(Response);
        expect(error.status).toBe(302);
        expect(error.headers.get("Location")).toContain("/login");
        return true;
      });
    });

    it("should return cookbook data when logged in as owner", async () => {
      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest(`http://localhost:3000/cookbooks/${cookbookId}`, { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: { id: cookbookId },
      } as any);

      expect(result.cookbook).toBeDefined();
      expect(result.cookbook.id).toBe(cookbookId);
      expect(result.isOwner).toBe(true);
    });

    it("should return isOwner false when logged in as non-owner", async () => {
      const session = await sessionStorage.getSession();
      session.set("userId", otherUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest(`http://localhost:3000/cookbooks/${cookbookId}`, { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: { id: cookbookId },
      } as any);

      expect(result.cookbook).toBeDefined();
      expect(result.isOwner).toBe(false);
    });

    it("should throw 404 for non-existent cookbook", async () => {
      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest("http://localhost:3000/cookbooks/nonexistent-id", { headers });

      await expect(
        loader({
          request,
          context: { cloudflare: { env: null } },
          params: { id: "nonexistent-id" },
        } as any)
      ).rejects.toSatisfy((error: any) => {
        expect(error).toBeInstanceOf(Response);
        expect(error.status).toBe(404);
        return true;
      });
    });
  });

  describe("action", () => {
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

      return new UndiciRequest(`http://localhost:3000/cookbooks/${cookbookId}`, {
        method: "POST",
        body: formData,
        headers,
      });
    }

    it("should redirect when not logged in", async () => {
      const request = await createFormRequest({ intent: "delete" });

      await expect(
        action({
          request,
          context: { cloudflare: { env: null } },
          params: { id: cookbookId },
        } as any)
      ).rejects.toSatisfy((error: any) => {
        expect(error).toBeInstanceOf(Response);
        expect(error.status).toBe(302);
        expect(error.headers.get("Location")).toContain("/login");
        return true;
      });
    });

    it("should throw 403 when non-owner tries to modify", async () => {
      const request = await createFormRequest({ intent: "delete" }, otherUserId);

      await expect(
        action({
          request,
          context: { cloudflare: { env: null } },
          params: { id: cookbookId },
        } as any)
      ).rejects.toSatisfy((error: any) => {
        expect(error).toBeInstanceOf(Response);
        expect(error.status).toBe(403);
        return true;
      });
    });

    it("should update title successfully", async () => {
      const newTitle = "Updated Cookbook Title " + faker.string.alphanumeric(6);
      const request = await createFormRequest(
        { intent: "updateTitle", title: newTitle },
        testUserId
      );

      const response = await action({
        request,
        context: { cloudflare: { env: null } },
        params: { id: cookbookId },
      } as any);

      const { data } = extractResponseData(response);
      expect(data.success).toBe(true);

      // Verify title was updated
      const cookbook = await db.cookbook.findUnique({ where: { id: cookbookId } });
      expect(cookbook?.title).toBe(newTitle);
    });

    it("should return error for empty title", async () => {
      const request = await createFormRequest(
        { intent: "updateTitle", title: "" },
        testUserId
      );

      const response = await action({
        request,
        context: { cloudflare: { env: null } },
        params: { id: cookbookId },
      } as any);

      const { data, status } = extractResponseData(response);
      expect(status).toBe(400);
      expect(data.error).toBe("Title is required");
    });

    it("should delete cookbook and redirect", async () => {
      const request = await createFormRequest({ intent: "delete" }, testUserId);

      const response = await action({
        request,
        context: { cloudflare: { env: null } },
        params: { id: cookbookId },
      } as any);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe("/cookbooks");

      // Verify cookbook was deleted
      const cookbook = await db.cookbook.findUnique({ where: { id: cookbookId } });
      expect(cookbook).toBeNull();
    });

    it("should add recipe to cookbook", async () => {
      // Create a recipe to add
      const recipe = await db.recipe.create({
        data: {
          title: "Test Recipe " + faker.string.alphanumeric(6),
          chefId: testUserId,
        },
      });

      const request = await createFormRequest(
        { intent: "addRecipe", recipeId: recipe.id },
        testUserId
      );

      const response = await action({
        request,
        context: { cloudflare: { env: null } },
        params: { id: cookbookId },
      } as any);

      const { data } = extractResponseData(response);
      expect(data.success).toBe(true);

      // Verify recipe was added
      const recipeInCookbook = await db.recipeInCookbook.findFirst({
        where: { cookbookId, recipeId: recipe.id },
      });
      expect(recipeInCookbook).not.toBeNull();
    });

    it("should remove recipe from cookbook", async () => {
      // Create a recipe and add it to cookbook
      const recipe = await db.recipe.create({
        data: {
          title: "Test Recipe " + faker.string.alphanumeric(6),
          chefId: testUserId,
        },
      });

      const recipeInCookbook = await db.recipeInCookbook.create({
        data: {
          cookbookId,
          recipeId: recipe.id,
          addedById: testUserId,
        },
      });

      const request = await createFormRequest(
        { intent: "removeRecipe", recipeInCookbookId: recipeInCookbook.id },
        testUserId
      );

      const response = await action({
        request,
        context: { cloudflare: { env: null } },
        params: { id: cookbookId },
      } as any);

      const { data } = extractResponseData(response);
      expect(data.success).toBe(true);

      // Verify recipe was removed
      const removed = await db.recipeInCookbook.findUnique({
        where: { id: recipeInCookbook.id },
      });
      expect(removed).toBeNull();
    });
  });
});
