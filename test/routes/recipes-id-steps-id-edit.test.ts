import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Request as UndiciRequest, FormData as UndiciFormData } from "undici";
import { db } from "~/lib/db.server";
import { loader, action } from "~/routes/recipes.$id.steps.$stepId.edit";
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

describe("Recipes $id Steps $stepId Edit Route", () => {
  let testUserId: string;
  let otherUserId: string;
  let recipeId: string;
  let stepId: string;

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
        chefId: testUserId,
      },
    });
    recipeId = recipe.id;

    // Create a step for testing
    const step = await db.recipeStep.create({
      data: {
        recipeId,
        stepNum: 1,
        description: "Test step description",
        stepTitle: "Test Step Title",
      },
    });
    stepId = step.id;
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe("loader", () => {
    it("should redirect when not logged in", async () => {
      const request = new UndiciRequest(`http://localhost:3000/recipes/${recipeId}/steps/${stepId}/edit`);

      await expect(
        loader({
          request,
          context: { cloudflare: { env: null } },
          params: { id: recipeId, stepId },
        } as any)
      ).rejects.toSatisfy((error: any) => {
        expect(error).toBeInstanceOf(Response);
        expect(error.status).toBe(302);
        expect(error.headers.get("Location")).toContain("/login");
        return true;
      });
    });

    it("should return recipe and step data when logged in as owner", async () => {
      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest(`http://localhost:3000/recipes/${recipeId}/steps/${stepId}/edit`, { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId, stepId },
      } as any);

      expect(result.recipe).toBeDefined();
      expect(result.recipe.id).toBe(recipeId);
      expect(result.step).toBeDefined();
      expect(result.step.id).toBe(stepId);
      expect(result.step.description).toBe("Test step description");
    });

    it("should throw 403 when non-owner tries to access", async () => {
      const session = await sessionStorage.getSession();
      session.set("userId", otherUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest(`http://localhost:3000/recipes/${recipeId}/steps/${stepId}/edit`, { headers });

      await expect(
        loader({
          request,
          context: { cloudflare: { env: null } },
          params: { id: recipeId, stepId },
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

      const request = new UndiciRequest(`http://localhost:3000/recipes/nonexistent-id/steps/${stepId}/edit`, { headers });

      await expect(
        loader({
          request,
          context: { cloudflare: { env: null } },
          params: { id: "nonexistent-id", stepId },
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

      const request = new UndiciRequest(`http://localhost:3000/recipes/${recipeId}/steps/${stepId}/edit`, { headers });

      await expect(
        loader({
          request,
          context: { cloudflare: { env: null } },
          params: { id: recipeId, stepId },
        } as any)
      ).rejects.toSatisfy((error: any) => {
        expect(error).toBeInstanceOf(Response);
        expect(error.status).toBe(404);
        return true;
      });
    });

    it("should throw 404 for non-existent step", async () => {
      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest(`http://localhost:3000/recipes/${recipeId}/steps/nonexistent-step/edit`, { headers });

      await expect(
        loader({
          request,
          context: { cloudflare: { env: null } },
          params: { id: recipeId, stepId: "nonexistent-step" },
        } as any)
      ).rejects.toSatisfy((error: any) => {
        expect(error).toBeInstanceOf(Response);
        expect(error.status).toBe(404);
        return true;
      });
    });

    it("should throw 404 when step belongs to different recipe", async () => {
      // Create another recipe
      const otherRecipe = await db.recipe.create({
        data: {
          title: "Other Recipe " + faker.string.alphanumeric(6),
          chefId: testUserId,
        },
      });

      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      // Try to access the step using the other recipe's ID
      const request = new UndiciRequest(`http://localhost:3000/recipes/${otherRecipe.id}/steps/${stepId}/edit`, { headers });

      await expect(
        loader({
          request,
          context: { cloudflare: { env: null } },
          params: { id: otherRecipe.id, stepId },
        } as any)
      ).rejects.toSatisfy((error: any) => {
        expect(error).toBeInstanceOf(Response);
        expect(error.status).toBe(404);
        return true;
      });
    });

    it("should include step ingredients with unit and ingredientRef", async () => {
      // Create unit and ingredientRef
      const unit = await db.unit.create({ data: { name: "cup_" + faker.string.alphanumeric(6) } });
      const ingredientRef = await db.ingredientRef.create({ data: { name: "flour_" + faker.string.alphanumeric(6) } });

      // Add ingredient to the step
      await db.ingredient.create({
        data: {
          recipeId,
          stepNum: 1,
          quantity: 2.5,
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

      const request = new UndiciRequest(`http://localhost:3000/recipes/${recipeId}/steps/${stepId}/edit`, { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId, stepId },
      } as any);

      expect(result.step.ingredients).toHaveLength(1);
      expect(result.step.ingredients[0].quantity).toBe(2.5);
      expect(result.step.ingredients[0].unit.name).toBe(unit.name);
      expect(result.step.ingredients[0].ingredientRef.name).toBe(ingredientRef.name);
    });
  });

  describe("action", () => {
    async function createFormRequest(
      formFields: Record<string, string>,
      userId?: string,
      recId?: string,
      stId?: string
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

      const targetRecipeId = recId || recipeId;
      const targetStepId = stId || stepId;

      return new UndiciRequest(`http://localhost:3000/recipes/${targetRecipeId}/steps/${targetStepId}/edit`, {
        method: "POST",
        body: formData,
        headers,
      });
    }

    it("should redirect when not logged in", async () => {
      const request = await createFormRequest({ description: "Updated step" });

      await expect(
        action({
          request,
          context: { cloudflare: { env: null } },
          params: { id: recipeId, stepId },
        } as any)
      ).rejects.toSatisfy((error: any) => {
        expect(error).toBeInstanceOf(Response);
        expect(error.status).toBe(302);
        expect(error.headers.get("Location")).toContain("/login");
        return true;
      });
    });

    it("should throw 403 when non-owner tries to update", async () => {
      const request = await createFormRequest({ description: "Updated step" }, otherUserId);

      await expect(
        action({
          request,
          context: { cloudflare: { env: null } },
          params: { id: recipeId, stepId },
        } as any)
      ).rejects.toSatisfy((error: any) => {
        expect(error).toBeInstanceOf(Response);
        expect(error.status).toBe(403);
        return true;
      });
    });

    it("should throw 404 for non-existent recipe", async () => {
      const request = await createFormRequest({ description: "Updated step" }, testUserId, "nonexistent-id");

      await expect(
        action({
          request,
          context: { cloudflare: { env: null } },
          params: { id: "nonexistent-id", stepId },
        } as any)
      ).rejects.toSatisfy((error: any) => {
        expect(error).toBeInstanceOf(Response);
        expect(error.status).toBe(404);
        return true;
      });
    });

    it("should throw 404 for soft-deleted recipe in action", async () => {
      // Soft delete the recipe
      await db.recipe.update({
        where: { id: recipeId },
        data: { deletedAt: new Date() },
      });

      const request = await createFormRequest({ description: "Updated step" }, testUserId);

      await expect(
        action({
          request,
          context: { cloudflare: { env: null } },
          params: { id: recipeId, stepId },
        } as any)
      ).rejects.toSatisfy((error: any) => {
        expect(error).toBeInstanceOf(Response);
        expect(error.status).toBe(404);
        return true;
      });
    });

    it("should throw 404 for non-existent step in action", async () => {
      const request = await createFormRequest({ description: "Updated step" }, testUserId, recipeId, "nonexistent-step");

      await expect(
        action({
          request,
          context: { cloudflare: { env: null } },
          params: { id: recipeId, stepId: "nonexistent-step" },
        } as any)
      ).rejects.toSatisfy((error: any) => {
        expect(error).toBeInstanceOf(Response);
        expect(error.status).toBe(404);
        return true;
      });
    });

    it("should throw 404 when step belongs to different recipe in action", async () => {
      // Create another recipe
      const otherRecipe = await db.recipe.create({
        data: {
          title: "Other Recipe " + faker.string.alphanumeric(6),
          chefId: testUserId,
        },
      });

      const request = await createFormRequest({ description: "Updated step" }, testUserId, otherRecipe.id);

      await expect(
        action({
          request,
          context: { cloudflare: { env: null } },
          params: { id: otherRecipe.id, stepId },
        } as any)
      ).rejects.toSatisfy((error: any) => {
        expect(error).toBeInstanceOf(Response);
        expect(error.status).toBe(404);
        return true;
      });
    });

    it("should return validation error when description is empty", async () => {
      const request = await createFormRequest({ description: "", stepTitle: "Title" }, testUserId);

      const response = await action({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId, stepId },
      } as any);

      const { data, status } = extractResponseData(response);
      expect(status).toBe(400);
      expect(data.errors.description).toBe("Step description is required");
    });

    it("should return validation error when description is only whitespace", async () => {
      const request = await createFormRequest({ description: "   " }, testUserId);

      const response = await action({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId, stepId },
      } as any);

      const { data, status } = extractResponseData(response);
      expect(status).toBe(400);
      expect(data.errors.description).toBe("Step description is required");
    });

    it("should successfully update step and redirect", async () => {
      const request = await createFormRequest(
        {
          stepTitle: "Updated Title",
          description: "Updated description content",
        },
        testUserId
      );

      const response = await action({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId, stepId },
      } as any);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe(`/recipes/${recipeId}/edit`);

      // Verify step was updated
      const updatedStep = await db.recipeStep.findUnique({ where: { id: stepId } });
      expect(updatedStep?.stepTitle).toBe("Updated Title");
      expect(updatedStep?.description).toBe("Updated description content");
    });

    it("should update step without optional title (set to null)", async () => {
      const request = await createFormRequest(
        {
          stepTitle: "",
          description: "Just description",
        },
        testUserId
      );

      const response = await action({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId, stepId },
      } as any);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);

      // Verify step title is null
      const updatedStep = await db.recipeStep.findUnique({ where: { id: stepId } });
      expect(updatedStep?.stepTitle).toBeNull();
      expect(updatedStep?.description).toBe("Just description");
    });

    describe("delete intent", () => {
      it("should delete step and redirect to recipe edit", async () => {
        const request = await createFormRequest({ intent: "delete" }, testUserId);

        const response = await action({
          request,
          context: { cloudflare: { env: null } },
          params: { id: recipeId, stepId },
        } as any);

        expect(response).toBeInstanceOf(Response);
        expect(response.status).toBe(302);
        expect(response.headers.get("Location")).toBe(`/recipes/${recipeId}/edit`);

        // Verify step was deleted
        const deletedStep = await db.recipeStep.findUnique({ where: { id: stepId } });
        expect(deletedStep).toBeNull();
      });
    });

    describe("addIngredient intent", () => {
      it("should add ingredient with existing unit and ingredientRef", async () => {
        // Create existing unit and ingredientRef with lowercase names (as the action normalizes to lowercase)
        const unitName = "tablespoon_" + faker.string.alphanumeric(6).toLowerCase();
        const ingredientName = "sugar_" + faker.string.alphanumeric(6).toLowerCase();
        const existingUnit = await db.unit.create({ data: { name: unitName } });
        const existingIngredientRef = await db.ingredientRef.create({ data: { name: ingredientName } });

        const request = await createFormRequest(
          {
            intent: "addIngredient",
            quantity: "3",
            unitName: unitName, // Same case as stored
            ingredientName: ingredientName, // Same case as stored
          },
          testUserId
        );

        const response = await action({
          request,
          context: { cloudflare: { env: null } },
          params: { id: recipeId, stepId },
        } as any);

        const { data } = extractResponseData(response);
        expect(data.success).toBe(true);

        // Verify ingredient was created
        const ingredients = await db.ingredient.findMany({
          where: { recipeId, stepNum: 1 },
          include: { unit: true, ingredientRef: true },
        });
        expect(ingredients).toHaveLength(1);
        expect(ingredients[0].quantity).toBe(3);
        expect(ingredients[0].unitId).toBe(existingUnit.id);
        expect(ingredients[0].ingredientRefId).toBe(existingIngredientRef.id);
      });

      it("should create new unit and ingredientRef if they do not exist", async () => {
        const unitName = "newunit_" + faker.string.alphanumeric(6);
        const ingredientName = "newingredient_" + faker.string.alphanumeric(6);

        const request = await createFormRequest(
          {
            intent: "addIngredient",
            quantity: "1.5",
            unitName: unitName,
            ingredientName: ingredientName,
          },
          testUserId
        );

        const response = await action({
          request,
          context: { cloudflare: { env: null } },
          params: { id: recipeId, stepId },
        } as any);

        const { data } = extractResponseData(response);
        expect(data.success).toBe(true);

        // Verify unit was created (normalized to lowercase by the action)
        const unit = await db.unit.findUnique({ where: { name: unitName.toLowerCase() } });
        expect(unit).not.toBeNull();

        // Verify ingredientRef was created (normalized to lowercase by the action)
        const ingredientRef = await db.ingredientRef.findUnique({ where: { name: ingredientName.toLowerCase() } });
        expect(ingredientRef).not.toBeNull();

        // Verify ingredient was created
        const ingredients = await db.ingredient.findMany({
          where: { recipeId, stepNum: 1 },
        });
        expect(ingredients).toHaveLength(1);
        expect(ingredients[0].quantity).toBe(1.5);
      });

      it("should not add ingredient if quantity is missing or zero", async () => {
        const request = await createFormRequest(
          {
            intent: "addIngredient",
            quantity: "0",
            unitName: "cup",
            ingredientName: "flour",
          },
          testUserId
        );

        await action({
          request,
          context: { cloudflare: { env: null } },
          params: { id: recipeId, stepId },
        } as any);

        // Verify no ingredient was created
        const ingredients = await db.ingredient.findMany({
          where: { recipeId, stepNum: 1 },
        });
        expect(ingredients).toHaveLength(0);
      });

      it("should not add ingredient if unitName is missing", async () => {
        const request = await createFormRequest(
          {
            intent: "addIngredient",
            quantity: "2",
            unitName: "",
            ingredientName: "flour",
          },
          testUserId
        );

        await action({
          request,
          context: { cloudflare: { env: null } },
          params: { id: recipeId, stepId },
        } as any);

        // Verify no ingredient was created
        const ingredients = await db.ingredient.findMany({
          where: { recipeId, stepNum: 1 },
        });
        expect(ingredients).toHaveLength(0);
      });

      it("should not add ingredient if ingredientName is missing", async () => {
        const request = await createFormRequest(
          {
            intent: "addIngredient",
            quantity: "2",
            unitName: "cup",
            ingredientName: "",
          },
          testUserId
        );

        await action({
          request,
          context: { cloudflare: { env: null } },
          params: { id: recipeId, stepId },
        } as any);

        // Verify no ingredient was created
        const ingredients = await db.ingredient.findMany({
          where: { recipeId, stepNum: 1 },
        });
        expect(ingredients).toHaveLength(0);
      });
    });

    describe("deleteIngredient intent", () => {
      it("should delete ingredient successfully", async () => {
        // Create unit, ingredientRef, and ingredient
        const unit = await db.unit.create({ data: { name: "cup_" + faker.string.alphanumeric(6) } });
        const ingredientRef = await db.ingredientRef.create({ data: { name: "flour_" + faker.string.alphanumeric(6) } });
        const ingredient = await db.ingredient.create({
          data: {
            recipeId,
            stepNum: 1,
            quantity: 2,
            unitId: unit.id,
            ingredientRefId: ingredientRef.id,
          },
        });

        const request = await createFormRequest(
          {
            intent: "deleteIngredient",
            ingredientId: ingredient.id,
          },
          testUserId
        );

        const response = await action({
          request,
          context: { cloudflare: { env: null } },
          params: { id: recipeId, stepId },
        } as any);

        const { data } = extractResponseData(response);
        expect(data.success).toBe(true);

        // Verify ingredient was deleted
        const deletedIngredient = await db.ingredient.findUnique({ where: { id: ingredient.id } });
        expect(deletedIngredient).toBeNull();
      });

      it("should do nothing if ingredientId is not provided", async () => {
        const request = await createFormRequest(
          {
            intent: "deleteIngredient",
          },
          testUserId
        );

        // Should not throw
        await action({
          request,
          context: { cloudflare: { env: null } },
          params: { id: recipeId, stepId },
        } as any);
      });
    });
  });
});
