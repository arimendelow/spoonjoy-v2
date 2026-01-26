import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Request as UndiciRequest, FormData as UndiciFormData } from "undici";
import { db } from "~/lib/db.server";
import { loader, action } from "~/routes/recipes.$id.edit";
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

describe("Recipes $id Edit Route", () => {
  let testUserId: string;
  let otherUserId: string;
  let recipeId: string;

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

    // Create a recipe for testing
    const recipe = await db.recipe.create({
      data: {
        title: "Test Recipe " + faker.string.alphanumeric(6),
        description: "Test description",
        servings: "4",
        chefId: testUserId,
      },
    });
    recipeId = recipe.id;
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe("loader", () => {
    it("should redirect when not logged in", async () => {
      const request = new UndiciRequest(`http://localhost:3000/recipes/${recipeId}/edit`);

      await expect(
        loader({
          request,
          context: { cloudflare: { env: null } },
          params: { id: recipeId },
        } as any)
      ).rejects.toSatisfy((error: any) => {
        expect(error).toBeInstanceOf(Response);
        expect(error.status).toBe(302);
        expect(error.headers.get("Location")).toContain("/login");
        return true;
      });
    });

    it("should return recipe data when logged in as owner", async () => {
      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest(`http://localhost:3000/recipes/${recipeId}/edit`, { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId },
      } as any);

      expect(result.recipe).toBeDefined();
      expect(result.recipe.id).toBe(recipeId);
    });

    it("should throw 403 when non-owner tries to access", async () => {
      const session = await sessionStorage.getSession();
      session.set("userId", otherUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest(`http://localhost:3000/recipes/${recipeId}/edit`, { headers });

      await expect(
        loader({
          request,
          context: { cloudflare: { env: null } },
          params: { id: recipeId },
        } as any)
      ).rejects.toSatisfy((error: any) => {
        expect(error).toBeInstanceOf(Response);
        expect(error.status).toBe(403);
        return true;
      });
    });

    it("should throw 404 for non-existent recipe", async () => {
      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest("http://localhost:3000/recipes/nonexistent-id/edit", { headers });

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

    it("should throw 404 for soft-deleted recipe", async () => {
      // Soft delete the recipe
      await db.recipe.update({
        where: { id: recipeId },
        data: { deletedAt: new Date() },
      });

      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest(`http://localhost:3000/recipes/${recipeId}/edit`, { headers });

      await expect(
        loader({
          request,
          context: { cloudflare: { env: null } },
          params: { id: recipeId },
        } as any)
      ).rejects.toSatisfy((error: any) => {
        expect(error).toBeInstanceOf(Response);
        expect(error.status).toBe(404);
        return true;
      });
    });

    it("should include recipe steps with ingredients", async () => {
      // Create a step with an ingredient
      const unit = await db.unit.create({ data: { name: "cup_" + faker.string.alphanumeric(6) } });
      const ingredientRef = await db.ingredientRef.create({ data: { name: "flour_" + faker.string.alphanumeric(6) } });

      await db.recipeStep.create({
        data: {
          recipeId,
          stepNum: 1,
          description: "Mix ingredients",
          stepTitle: "Prep",
        },
      });

      await db.ingredient.create({
        data: {
          recipeId,
          stepNum: 1,
          quantity: 2,
          unitId: unit.id,
          ingredientRefId: ingredientRef.id,
        },
      });

      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest(`http://localhost:3000/recipes/${recipeId}/edit`, { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId },
      } as any);

      expect(result.recipe.steps).toHaveLength(1);
      expect(result.recipe.steps[0].description).toBe("Mix ingredients");
      expect(result.recipe.steps[0].ingredients).toHaveLength(1);
      expect(result.recipe.steps[0].ingredients[0].quantity).toBe(2);
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

      return new UndiciRequest(`http://localhost:3000/recipes/${recipeId}/edit`, {
        method: "POST",
        body: formData,
        headers,
      });
    }

    it("should redirect when not logged in", async () => {
      const request = await createFormRequest({ title: "New Title" });

      await expect(
        action({
          request,
          context: { cloudflare: { env: null } },
          params: { id: recipeId },
        } as any)
      ).rejects.toSatisfy((error: any) => {
        expect(error).toBeInstanceOf(Response);
        expect(error.status).toBe(302);
        expect(error.headers.get("Location")).toContain("/login");
        return true;
      });
    });

    it("should throw 403 when non-owner tries to update", async () => {
      const request = await createFormRequest({ title: "New Title" }, otherUserId);

      await expect(
        action({
          request,
          context: { cloudflare: { env: null } },
          params: { id: recipeId },
        } as any)
      ).rejects.toSatisfy((error: any) => {
        expect(error).toBeInstanceOf(Response);
        expect(error.status).toBe(403);
        return true;
      });
    });

    it("should throw 404 for non-existent recipe", async () => {
      const request = await createFormRequest({ title: "New Title" }, testUserId);

      await expect(
        action({
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

    it("should return validation error when title is empty", async () => {
      const request = await createFormRequest({ title: "", description: "Test" }, testUserId);

      const response = await action({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId },
      } as any);

      const { data, status } = extractResponseData(response);
      expect(status).toBe(400);
      expect(data.errors.title).toBe("Title is required");
    });

    it("should successfully update recipe and redirect", async () => {
      const request = await createFormRequest(
        {
          title: "Updated Title",
          description: "Updated Description",
          servings: "6",
          imageUrl: "https://example.com/new.jpg",
        },
        testUserId
      );

      const response = await action({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId },
      } as any);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe(`/recipes/${recipeId}`);

      // Verify recipe was updated
      const recipe = await db.recipe.findUnique({ where: { id: recipeId } });
      expect(recipe?.title).toBe("Updated Title");
      expect(recipe?.description).toBe("Updated Description");
      expect(recipe?.servings).toBe("6");
      expect(recipe?.imageUrl).toBe("https://example.com/new.jpg");
    });

    it("should handle reorderStep intent - move step up", async () => {
      // Create two steps
      const step1 = await db.recipeStep.create({
        data: {
          recipeId,
          stepNum: 1,
          description: "Step 1",
        },
      });

      const step2 = await db.recipeStep.create({
        data: {
          recipeId,
          stepNum: 2,
          description: "Step 2",
        },
      });

      const request = await createFormRequest(
        {
          intent: "reorderStep",
          stepId: step2.id,
          direction: "up",
        },
        testUserId
      );

      const response = await action({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId },
      } as any);

      const { data } = extractResponseData(response);
      expect(data.success).toBe(true);

      // Verify steps were reordered
      const updatedStep1 = await db.recipeStep.findUnique({ where: { id: step1.id } });
      const updatedStep2 = await db.recipeStep.findUnique({ where: { id: step2.id } });
      expect(updatedStep1?.stepNum).toBe(2);
      expect(updatedStep2?.stepNum).toBe(1);
    });

    it("should handle reorderStep intent - move step down", async () => {
      // Create two steps
      const step1 = await db.recipeStep.create({
        data: {
          recipeId,
          stepNum: 1,
          description: "Step 1",
        },
      });

      const step2 = await db.recipeStep.create({
        data: {
          recipeId,
          stepNum: 2,
          description: "Step 2",
        },
      });

      const request = await createFormRequest(
        {
          intent: "reorderStep",
          stepId: step1.id,
          direction: "down",
        },
        testUserId
      );

      const response = await action({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId },
      } as any);

      const { data } = extractResponseData(response);
      expect(data.success).toBe(true);

      // Verify steps were reordered
      const updatedStep1 = await db.recipeStep.findUnique({ where: { id: step1.id } });
      const updatedStep2 = await db.recipeStep.findUnique({ where: { id: step2.id } });
      expect(updatedStep1?.stepNum).toBe(2);
      expect(updatedStep2?.stepNum).toBe(1);
    });

    it("should not reorder if step is already at boundary", async () => {
      // Create a single step
      const step1 = await db.recipeStep.create({
        data: {
          recipeId,
          stepNum: 1,
          description: "Step 1",
        },
      });

      // Try to move up when already at top
      const request = await createFormRequest(
        {
          intent: "reorderStep",
          stepId: step1.id,
          direction: "up",
        },
        testUserId
      );

      await action({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId },
      } as any);

      // Step should remain at position 1
      const updatedStep = await db.recipeStep.findUnique({ where: { id: step1.id } });
      expect(updatedStep?.stepNum).toBe(1);
    });
  });
});
