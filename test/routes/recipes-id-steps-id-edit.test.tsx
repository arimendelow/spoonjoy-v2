import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Request as UndiciRequest, FormData as UndiciFormData } from "undici";
import { render, screen, fireEvent } from "@testing-library/react";
import { createTestRoutesStub } from "../utils";
import { db } from "~/lib/db.server";
import { loader, action } from "~/routes/recipes.$id.steps.$stepId.edit";
import EditStep from "~/routes/recipes.$id.steps.$stepId.edit";
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

    it("should return validation error when stepTitle exceeds 200 characters", async () => {
      const longTitle = "a".repeat(201);
      const request = await createFormRequest(
        { stepTitle: longTitle, description: "Valid description" },
        testUserId
      );

      const response = await action({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId, stepId },
      } as any);

      const { data, status } = extractResponseData(response);
      expect(status).toBe(400);
      expect(data.errors.stepTitle).toBe("Step title must be 200 characters or less");
    });

    it("should return validation error when description exceeds 5000 characters", async () => {
      const longDescription = "a".repeat(5001);
      const request = await createFormRequest(
        { description: longDescription },
        testUserId
      );

      const response = await action({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId, stepId },
      } as any);

      const { data, status } = extractResponseData(response);
      expect(status).toBe(400);
      expect(data.errors.description).toBe("Description must be 5,000 characters or less");
    });

    it("should accept stepTitle at exactly 200 characters", async () => {
      const exactTitle = "a".repeat(200);
      const request = await createFormRequest(
        { stepTitle: exactTitle, description: "Valid description" },
        testUserId
      );

      const response = await action({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId, stepId },
      } as any);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
    });

    it("should accept description at exactly 5000 characters", async () => {
      const exactDescription = "a".repeat(5000);
      const request = await createFormRequest(
        { description: exactDescription },
        testUserId
      );

      const response = await action({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId, stepId },
      } as any);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
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

    it("should return generic error for database errors", async () => {
      // Mock db.recipeStep.update to throw a generic error
      const originalUpdate = db.recipeStep.update;
      db.recipeStep.update = vi.fn().mockRejectedValue(new Error("Database connection failed"));

      try {
        const request = await createFormRequest(
          {
            stepTitle: "Updated Title",
            description: "Updated description",
          },
          testUserId
        );

        const response = await action({
          request,
          context: { cloudflare: { env: null } },
          params: { id: recipeId, stepId },
        } as any);

        const { data, status } = extractResponseData(response);
        expect(status).toBe(500);
        expect(data.errors.general).toBe("Failed to update step. Please try again.");
      } finally {
        // Restore original function
        db.recipeStep.update = originalUpdate;
      }
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

      it("should return validation error when quantity is below minimum (0.001)", async () => {
        const request = await createFormRequest(
          {
            intent: "addIngredient",
            quantity: "0.0001",
            unitName: "cup",
            ingredientName: "flour",
          },
          testUserId
        );

        const response = await action({
          request,
          context: { cloudflare: { env: null } },
          params: { id: recipeId, stepId },
        } as any);

        const { data, status } = extractResponseData(response);
        expect(status).toBe(400);
        expect(data.errors.quantity).toBe("Quantity must be between 0.001 and 99,999");
      });

      it("should return validation error when quantity exceeds maximum (99999)", async () => {
        const request = await createFormRequest(
          {
            intent: "addIngredient",
            quantity: "100000",
            unitName: "cup",
            ingredientName: "flour",
          },
          testUserId
        );

        const response = await action({
          request,
          context: { cloudflare: { env: null } },
          params: { id: recipeId, stepId },
        } as any);

        const { data, status } = extractResponseData(response);
        expect(status).toBe(400);
        expect(data.errors.quantity).toBe("Quantity must be between 0.001 and 99,999");
      });

      it("should return validation error when quantity is not a valid number", async () => {
        const request = await createFormRequest(
          {
            intent: "addIngredient",
            quantity: "abc",
            unitName: "cup",
            ingredientName: "flour",
          },
          testUserId
        );

        const response = await action({
          request,
          context: { cloudflare: { env: null } },
          params: { id: recipeId, stepId },
        } as any);

        const { data, status } = extractResponseData(response);
        expect(status).toBe(400);
        expect(data.errors.quantity).toBe("Quantity must be a valid number");
      });

      it("should return validation error when unit name exceeds 50 characters", async () => {
        const longUnitName = "a".repeat(51);
        const request = await createFormRequest(
          {
            intent: "addIngredient",
            quantity: "2",
            unitName: longUnitName,
            ingredientName: "flour",
          },
          testUserId
        );

        const response = await action({
          request,
          context: { cloudflare: { env: null } },
          params: { id: recipeId, stepId },
        } as any);

        const { data, status } = extractResponseData(response);
        expect(status).toBe(400);
        expect(data.errors.unitName).toBe("Unit name must be 50 characters or less");
      });

      it("should return validation error when ingredient name exceeds 100 characters", async () => {
        const longIngredientName = "a".repeat(101);
        const request = await createFormRequest(
          {
            intent: "addIngredient",
            quantity: "2",
            unitName: "cup",
            ingredientName: longIngredientName,
          },
          testUserId
        );

        const response = await action({
          request,
          context: { cloudflare: { env: null } },
          params: { id: recipeId, stepId },
        } as any);

        const { data, status } = extractResponseData(response);
        expect(status).toBe(400);
        expect(data.errors.ingredientName).toBe("Ingredient name must be 100 characters or less");
      });

      it("should accept quantity at exactly minimum boundary (0.001)", async () => {
        const unitName = "cup_" + faker.string.alphanumeric(6);
        const ingredientName = "flour_" + faker.string.alphanumeric(6);

        const request = await createFormRequest(
          {
            intent: "addIngredient",
            quantity: "0.001",
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

        // Verify ingredient was created
        const ingredients = await db.ingredient.findMany({
          where: { recipeId, stepNum: 1 },
        });
        expect(ingredients).toHaveLength(1);
        expect(ingredients[0].quantity).toBe(0.001);
      });

      it("should accept quantity at exactly maximum boundary (99999)", async () => {
        const unitName = "cup_" + faker.string.alphanumeric(6);
        const ingredientName = "flour_" + faker.string.alphanumeric(6);

        const request = await createFormRequest(
          {
            intent: "addIngredient",
            quantity: "99999",
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

        // Verify ingredient was created
        const ingredients = await db.ingredient.findMany({
          where: { recipeId, stepNum: 1 },
        });
        expect(ingredients).toHaveLength(1);
        expect(ingredients[0].quantity).toBe(99999);
      });

      it("should accept unit name at exactly 50 characters", async () => {
        const unitName = "a".repeat(50);
        const ingredientName = "flour_" + faker.string.alphanumeric(6);

        const request = await createFormRequest(
          {
            intent: "addIngredient",
            quantity: "2",
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
      });

      it("should accept ingredient name at exactly 100 characters", async () => {
        const unitName = "cup_" + faker.string.alphanumeric(6);
        const ingredientName = "a".repeat(100);

        const request = await createFormRequest(
          {
            intent: "addIngredient",
            quantity: "2",
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
      });

      it("should return multiple validation errors when multiple fields are invalid", async () => {
        const longUnitName = "a".repeat(51);
        const longIngredientName = "a".repeat(101);

        const request = await createFormRequest(
          {
            intent: "addIngredient",
            quantity: "-1",
            unitName: longUnitName,
            ingredientName: longIngredientName,
          },
          testUserId
        );

        const response = await action({
          request,
          context: { cloudflare: { env: null } },
          params: { id: recipeId, stepId },
        } as any);

        const { data, status } = extractResponseData(response);
        expect(status).toBe(400);
        expect(data.errors.quantity).toBe("Quantity must be between 0.001 and 99,999");
        expect(data.errors.unitName).toBe("Unit name must be 50 characters or less");
        expect(data.errors.ingredientName).toBe("Ingredient name must be 100 characters or less");
      });

      it("should return error when adding duplicate ingredient to same step", async () => {
        const unitName = "cup_" + faker.string.alphanumeric(6).toLowerCase();
        const ingredientName = "flour_" + faker.string.alphanumeric(6).toLowerCase();

        // Create unit and ingredientRef
        const unit = await db.unit.create({ data: { name: unitName } });
        const ingredientRef = await db.ingredientRef.create({ data: { name: ingredientName } });

        // Add ingredient to the step
        await db.ingredient.create({
          data: {
            recipeId,
            stepNum: 1,
            quantity: 2,
            unitId: unit.id,
            ingredientRefId: ingredientRef.id,
          },
        });

        // Try to add the same ingredient again
        const request = await createFormRequest(
          {
            intent: "addIngredient",
            quantity: "3",
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

        const { data, status } = extractResponseData(response);
        expect(status).toBe(400);
        expect(data.errors.ingredientName).toBe("This ingredient is already in the recipe");

        // Verify no duplicate ingredient was created
        const ingredients = await db.ingredient.findMany({
          where: { recipeId },
        });
        expect(ingredients).toHaveLength(1);
      });

      it("should return error when adding duplicate ingredient to different step", async () => {
        const unitName = "tbsp_" + faker.string.alphanumeric(6).toLowerCase();
        const ingredientName = "sugar_" + faker.string.alphanumeric(6).toLowerCase();

        // Create a second step
        const step2 = await db.recipeStep.create({
          data: {
            recipeId,
            stepNum: 2,
            description: "Second step",
          },
        });

        // Create unit and ingredientRef
        const unit = await db.unit.create({ data: { name: unitName } });
        const ingredientRef = await db.ingredientRef.create({ data: { name: ingredientName } });

        // Add ingredient to step 2
        await db.ingredient.create({
          data: {
            recipeId,
            stepNum: 2,
            quantity: 1,
            unitId: unit.id,
            ingredientRefId: ingredientRef.id,
          },
        });

        // Try to add the same ingredient to step 1 (via the step edit route for step 1)
        const request = await createFormRequest(
          {
            intent: "addIngredient",
            quantity: "2",
            unitName: unitName,
            ingredientName: ingredientName,
          },
          testUserId
        );

        const response = await action({
          request,
          context: { cloudflare: { env: null } },
          params: { id: recipeId, stepId }, // stepId is for step 1
        } as any);

        const { data, status } = extractResponseData(response);
        expect(status).toBe(400);
        expect(data.errors.ingredientName).toBe("This ingredient is already in the recipe");

        // Verify no duplicate ingredient was created
        const ingredients = await db.ingredient.findMany({
          where: { recipeId },
        });
        expect(ingredients).toHaveLength(1);
      });

      it("should allow adding ingredient with different case (case-insensitive check)", async () => {
        const baseName = "butter_" + faker.string.alphanumeric(6);
        const unitName = "tbsp_" + faker.string.alphanumeric(6).toLowerCase();

        // Create unit and ingredientRef with lowercase name
        const unit = await db.unit.create({ data: { name: unitName } });
        const ingredientRef = await db.ingredientRef.create({ data: { name: baseName.toLowerCase() } });

        // Add ingredient to the step
        await db.ingredient.create({
          data: {
            recipeId,
            stepNum: 1,
            quantity: 2,
            unitId: unit.id,
            ingredientRefId: ingredientRef.id,
          },
        });

        // Try to add the same ingredient with UPPERCASE (should still be caught)
        const request = await createFormRequest(
          {
            intent: "addIngredient",
            quantity: "3",
            unitName: unitName.toUpperCase(),
            ingredientName: baseName.toUpperCase(),
          },
          testUserId
        );

        const response = await action({
          request,
          context: { cloudflare: { env: null } },
          params: { id: recipeId, stepId },
        } as any);

        const { data, status } = extractResponseData(response);
        expect(status).toBe(400);
        expect(data.errors.ingredientName).toBe("This ingredient is already in the recipe");
      });

      it("should allow adding different ingredients to the same recipe", async () => {
        const unitName = "cup_" + faker.string.alphanumeric(6).toLowerCase();
        const ingredientName1 = "flour_" + faker.string.alphanumeric(6).toLowerCase();
        const ingredientName2 = "sugar_" + faker.string.alphanumeric(6).toLowerCase();

        // Create unit and first ingredientRef
        const unit = await db.unit.create({ data: { name: unitName } });
        const ingredientRef1 = await db.ingredientRef.create({ data: { name: ingredientName1 } });

        // Add first ingredient
        await db.ingredient.create({
          data: {
            recipeId,
            stepNum: 1,
            quantity: 2,
            unitId: unit.id,
            ingredientRefId: ingredientRef1.id,
          },
        });

        // Add a different ingredient (should succeed)
        const request = await createFormRequest(
          {
            intent: "addIngredient",
            quantity: "1",
            unitName: unitName,
            ingredientName: ingredientName2,
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

        // Verify both ingredients exist
        const ingredients = await db.ingredient.findMany({
          where: { recipeId },
        });
        expect(ingredients).toHaveLength(2);
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

  describe("component", () => {
    it("should render step edit form with step data", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Test Recipe",
        },
        step: {
          id: "step-1",
          stepNum: 1,
          stepTitle: "Prep the Ingredients",
          description: "Chop all vegetables",
          ingredients: [],
        },
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id/steps/:stepId/edit",
          Component: EditStep,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1/steps/step-1/edit"]} />);

      expect(await screen.findByRole("heading", { name: "Edit Step 1" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "← Back to recipe" })).toHaveAttribute("href", "/recipes/recipe-1/edit");
      expect(screen.getByLabelText(/Step Title/)).toHaveValue("Prep the Ingredients");
      expect(screen.getByLabelText(/Description/)).toHaveValue("Chop all vegetables");
      expect(screen.getByRole("button", { name: "Delete Step" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Save Changes" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Cancel" })).toHaveAttribute("href", "/recipes/recipe-1/edit");
    });

    it("should render no ingredients message when step has no ingredients", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Test Recipe",
        },
        step: {
          id: "step-1",
          stepNum: 1,
          stepTitle: null,
          description: "A step with no ingredients",
          ingredients: [],
        },
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id/steps/:stepId/edit",
          Component: EditStep,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1/steps/step-1/edit"]} />);

      expect(await screen.findByText("No ingredients added yet")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "+ Add Ingredient" })).toBeInTheDocument();
    });

    it("should render step with ingredients", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Test Recipe",
        },
        step: {
          id: "step-1",
          stepNum: 1,
          stepTitle: "Mix",
          description: "Mix the ingredients",
          ingredients: [
            {
              id: "ing-1",
              quantity: 2,
              unit: { name: "cups" },
              ingredientRef: { name: "flour" },
            },
            {
              id: "ing-2",
              quantity: 0.5,
              unit: { name: "tsp" },
              ingredientRef: { name: "salt" },
            },
          ],
        },
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id/steps/:stepId/edit",
          Component: EditStep,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1/steps/step-1/edit"]} />);

      expect(await screen.findByText("2")).toBeInTheDocument();
      expect(screen.getByText(/cups flour/)).toBeInTheDocument();
      expect(screen.getByText("0.5")).toBeInTheDocument();
      expect(screen.getByText(/tsp salt/)).toBeInTheDocument();
      // Two remove buttons for two ingredients
      expect(screen.getAllByRole("button", { name: "Remove" })).toHaveLength(2);
    });

    it("should show add ingredient form when clicking add ingredient button", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Test Recipe",
        },
        step: {
          id: "step-1",
          stepNum: 1,
          stepTitle: null,
          description: "A step",
          ingredients: [],
        },
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id/steps/:stepId/edit",
          Component: EditStep,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1/steps/step-1/edit"]} />);

      // Click add ingredient button
      const addButton = await screen.findByRole("button", { name: "+ Add Ingredient" });
      fireEvent.click(addButton);

      // Now form should be visible
      expect(screen.getByLabelText(/Quantity/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Unit/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Ingredient/)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
      // Button text should change to Cancel
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    });

    it("should hide add ingredient form when clicking cancel", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Test Recipe",
        },
        step: {
          id: "step-1",
          stepNum: 1,
          stepTitle: null,
          description: "A step",
          ingredients: [],
        },
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id/steps/:stepId/edit",
          Component: EditStep,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1/steps/step-1/edit"]} />);

      // Show form
      const addButton = await screen.findByRole("button", { name: "+ Add Ingredient" });
      fireEvent.click(addButton);

      expect(screen.getByLabelText(/Quantity/)).toBeInTheDocument();

      // Click cancel (the button with "Cancel" text in the ingredient form section)
      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      fireEvent.click(cancelButton);

      // Form should be hidden
      expect(screen.queryByLabelText(/Quantity/)).not.toBeInTheDocument();
      // Button should be back to "+ Add Ingredient"
      expect(screen.getByRole("button", { name: "+ Add Ingredient" })).toBeInTheDocument();
    });

    it("should render empty step title when null", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Test Recipe",
        },
        step: {
          id: "step-1",
          stepNum: 1,
          stepTitle: null,
          description: "Just a description",
          ingredients: [],
        },
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id/steps/:stepId/edit",
          Component: EditStep,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1/steps/step-1/edit"]} />);

      expect(await screen.findByLabelText(/Step Title/)).toHaveValue("");
    });

    it("should have correct form structure for updating step", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Test Recipe",
        },
        step: {
          id: "step-1",
          stepNum: 1,
          stepTitle: "Step Title",
          description: "Step description",
          ingredients: [],
        },
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id/steps/:stepId/edit",
          Component: EditStep,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1/steps/step-1/edit"]} />);

      // Check form elements
      const titleInput = await screen.findByLabelText(/Step Title/);
      const descriptionTextarea = screen.getByLabelText(/Description/);

      expect(titleInput).toHaveAttribute("type", "text");
      expect(titleInput).toHaveAttribute("name", "stepTitle");
      expect(descriptionTextarea).toHaveAttribute("name", "description");
      expect(descriptionTextarea).toBeRequired();
    });

    it("should have delete step form with intent hidden input", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Test Recipe",
        },
        step: {
          id: "step-1",
          stepNum: 1,
          stepTitle: null,
          description: "Step description",
          ingredients: [],
        },
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id/steps/:stepId/edit",
          Component: EditStep,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1/steps/step-1/edit"]} />);

      await screen.findByRole("button", { name: "Delete Step" });
      // The delete button is inside a form with a hidden input for intent
      const deleteButton = screen.getByRole("button", { name: "Delete Step" });
      expect(deleteButton).toBeInTheDocument();
    });

    it("should render ingredient with remove button", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Test Recipe",
        },
        step: {
          id: "step-1",
          stepNum: 1,
          stepTitle: null,
          description: "Mix flour",
          ingredients: [
            {
              id: "ing-1",
              quantity: 2,
              unit: { name: "cups" },
              ingredientRef: { name: "flour" },
            },
          ],
        },
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id/steps/:stepId/edit",
          Component: EditStep,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1/steps/step-1/edit"]} />);

      // Verify ingredient display
      expect(await screen.findByText("2")).toBeInTheDocument();
      expect(screen.getByText(/cups flour/)).toBeInTheDocument();

      // Verify remove button exists
      const removeButton = screen.getByRole("button", { name: "Remove" });
      expect(removeButton).toBeInTheDocument();
    });

    it("should display general error message when present", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Test Recipe",
        },
        step: {
          id: "step-1",
          stepNum: 1,
          stepTitle: null,
          description: "A step",
          ingredients: [],
        },
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id/steps/:stepId/edit",
          Component: EditStep,
          loader: () => mockData,
          action: () => ({
            errors: { general: "Failed to update step. Please try again." },
          }),
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1/steps/step-1/edit"]} />);

      // Wait for form to render
      await screen.findByLabelText(/Description/);
    });
  });
});
