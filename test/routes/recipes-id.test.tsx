import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Request as UndiciRequest, FormData as UndiciFormData } from "undici";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createTestRoutesStub } from "../utils";
import { db } from "~/lib/db.server";
import { loader, action } from "~/routes/recipes.$id";
import RecipeDetail from "~/routes/recipes.$id";
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

describe("Recipes $id Route", () => {
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
      const request = new UndiciRequest(`http://localhost:3000/recipes/${recipeId}`);

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

      const request = new UndiciRequest(`http://localhost:3000/recipes/${recipeId}`, { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId },
      } as any);

      expect(result.recipe).toBeDefined();
      expect(result.recipe.id).toBe(recipeId);
      expect(result.isOwner).toBe(true);
    });

    it("should return isOwner false when logged in as non-owner", async () => {
      const session = await sessionStorage.getSession();
      session.set("userId", otherUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest(`http://localhost:3000/recipes/${recipeId}`, { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId },
      } as any);

      expect(result.recipe).toBeDefined();
      expect(result.isOwner).toBe(false);
    });

    it("should throw 404 for non-existent recipe", async () => {
      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest("http://localhost:3000/recipes/nonexistent-id", { headers });

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

      const request = new UndiciRequest(`http://localhost:3000/recipes/${recipeId}`, { headers });

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

    it("should include recipe steps and ingredients", async () => {
      // Create a step with an ingredient
      const unit = await db.unit.create({ data: { name: "cup_" + faker.string.alphanumeric(6) } });
      const ingredientRef = await db.ingredientRef.create({ data: { name: "flour_" + faker.string.alphanumeric(6) } });

      const step = await db.recipeStep.create({
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

      const request = new UndiciRequest(`http://localhost:3000/recipes/${recipeId}`, { headers });

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

    it("should include step output uses (usingSteps) in recipe data", async () => {
      // Create step 1
      await db.recipeStep.create({
        data: {
          recipeId,
          stepNum: 1,
          description: "Chop vegetables",
          stepTitle: "Prep veggies",
        },
      });

      // Create step 2 that uses step 1's output
      await db.recipeStep.create({
        data: {
          recipeId,
          stepNum: 2,
          description: "Saute the chopped vegetables",
          stepTitle: "Cook veggies",
        },
      });

      // Create step output use: step 2 uses output of step 1
      await db.stepOutputUse.create({
        data: {
          recipeId,
          outputStepNum: 1,
          inputStepNum: 2,
        },
      });

      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest(`http://localhost:3000/recipes/${recipeId}`, { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId },
      } as any);

      expect(result.recipe.steps).toHaveLength(2);

      // Step 1 should have no usingSteps (it doesn't use any previous step)
      expect(result.recipe.steps[0].usingSteps).toHaveLength(0);

      // Step 2 should have one usingSteps entry pointing to step 1
      expect(result.recipe.steps[1].usingSteps).toHaveLength(1);
      expect(result.recipe.steps[1].usingSteps[0].outputStepNum).toBe(1);
      expect(result.recipe.steps[1].usingSteps[0].outputOfStep.stepNum).toBe(1);
      expect(result.recipe.steps[1].usingSteps[0].outputOfStep.stepTitle).toBe("Prep veggies");
    });

    it("should include multiple step output uses when a step depends on multiple previous steps", async () => {
      // Create step 1
      await db.recipeStep.create({
        data: {
          recipeId,
          stepNum: 1,
          description: "Cook rice",
          stepTitle: "Rice prep",
        },
      });

      // Create step 2
      await db.recipeStep.create({
        data: {
          recipeId,
          stepNum: 2,
          description: "Prepare sauce",
          stepTitle: "Sauce prep",
        },
      });

      // Create step 3 that uses both step 1 and step 2
      await db.recipeStep.create({
        data: {
          recipeId,
          stepNum: 3,
          description: "Combine rice and sauce",
          stepTitle: null,
        },
      });

      // Step 3 uses step 1
      await db.stepOutputUse.create({
        data: {
          recipeId,
          outputStepNum: 1,
          inputStepNum: 3,
        },
      });

      // Step 3 uses step 2
      await db.stepOutputUse.create({
        data: {
          recipeId,
          outputStepNum: 2,
          inputStepNum: 3,
        },
      });

      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest(`http://localhost:3000/recipes/${recipeId}`, { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId },
      } as any);

      expect(result.recipe.steps).toHaveLength(3);

      // Steps 1 and 2 have no dependencies
      expect(result.recipe.steps[0].usingSteps).toHaveLength(0);
      expect(result.recipe.steps[1].usingSteps).toHaveLength(0);

      // Step 3 depends on both step 1 and step 2
      expect(result.recipe.steps[2].usingSteps).toHaveLength(2);
      // Should be ordered by outputStepNum ascending
      expect(result.recipe.steps[2].usingSteps[0].outputStepNum).toBe(1);
      expect(result.recipe.steps[2].usingSteps[0].outputOfStep.stepTitle).toBe("Rice prep");
      expect(result.recipe.steps[2].usingSteps[1].outputStepNum).toBe(2);
      expect(result.recipe.steps[2].usingSteps[1].outputOfStep.stepTitle).toBe("Sauce prep");
    });

    it("should include usingSteps with null stepTitle", async () => {
      // Create step 1 with no title
      await db.recipeStep.create({
        data: {
          recipeId,
          stepNum: 1,
          description: "Do something",
          stepTitle: null,
        },
      });

      // Create step 2 that uses step 1
      await db.recipeStep.create({
        data: {
          recipeId,
          stepNum: 2,
          description: "Use the result",
        },
      });

      await db.stepOutputUse.create({
        data: {
          recipeId,
          outputStepNum: 1,
          inputStepNum: 2,
        },
      });

      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest(`http://localhost:3000/recipes/${recipeId}`, { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId },
      } as any);

      expect(result.recipe.steps[1].usingSteps).toHaveLength(1);
      expect(result.recipe.steps[1].usingSteps[0].outputOfStep.stepNum).toBe(1);
      expect(result.recipe.steps[1].usingSteps[0].outputOfStep.stepTitle).toBeNull();
    });

    it("should handle single-step recipe with empty usingSteps array", async () => {
      // Create a single step (step 1 can never have dependencies)
      await db.recipeStep.create({
        data: {
          recipeId,
          stepNum: 1,
          description: "The only step in this recipe",
          stepTitle: "Solo Step",
        },
      });

      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest(`http://localhost:3000/recipes/${recipeId}`, { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId },
      } as any);

      // Single-step recipe should have exactly one step
      expect(result.recipe.steps).toHaveLength(1);
      // Step 1 cannot have any dependencies (no previous steps exist)
      expect(result.recipe.steps[0].usingSteps).toHaveLength(0);
      expect(result.recipe.steps[0].stepNum).toBe(1);
      expect(result.recipe.steps[0].stepTitle).toBe("Solo Step");
    });

    it("should return savedInCookbookIds when recipe is saved in cookbooks", async () => {
      // Create two cookbooks for the user
      const cookbook1 = await db.cookbook.create({
        data: {
          title: "First Cookbook " + faker.string.alphanumeric(6),
          authorId: testUserId,
        },
      });
      const cookbook2 = await db.cookbook.create({
        data: {
          title: "Second Cookbook " + faker.string.alphanumeric(6),
          authorId: testUserId,
        },
      });

      // Add recipe to the first cookbook only
      await db.recipeInCookbook.create({
        data: {
          cookbookId: cookbook1.id,
          recipeId: recipeId,
          addedById: testUserId,
        },
      });

      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest(`http://localhost:3000/recipes/${recipeId}`, { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId },
      } as any);

      // Should return both cookbooks
      expect(result.cookbooks).toHaveLength(2);

      // Should return the cookbook ID where recipe is saved
      expect(result.savedInCookbookIds).toContain(cookbook1.id);
      expect(result.savedInCookbookIds).not.toContain(cookbook2.id);
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

      return new UndiciRequest(`http://localhost:3000/recipes/${recipeId}`, {
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
          params: { id: recipeId },
        } as any)
      ).rejects.toSatisfy((error: any) => {
        expect(error).toBeInstanceOf(Response);
        expect(error.status).toBe(302);
        expect(error.headers.get("Location")).toContain("/login");
        return true;
      });
    });

    it("should throw 403 when non-owner tries to delete", async () => {
      const request = await createFormRequest({ intent: "delete" }, otherUserId);

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

    it("should soft delete recipe and redirect", async () => {
      const request = await createFormRequest({ intent: "delete" }, testUserId);

      const response = await action({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId },
      } as any);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe("/recipes");

      // Verify recipe was soft deleted (not hard deleted)
      const recipe = await db.recipe.findUnique({ where: { id: recipeId } });
      expect(recipe).not.toBeNull();
      expect(recipe?.deletedAt).not.toBeNull();
    });

    it("should throw 404 for non-existent recipe", async () => {
      const request = await createFormRequest({ intent: "delete" }, testUserId);

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

    it("should return null for unknown intent", async () => {
      const request = await createFormRequest({ intent: "unknown" }, testUserId);

      const response = await action({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId },
      } as any);

      expect(response).toBeNull();
    });

    it("should throw 404 for soft-deleted recipe in action", async () => {
      // Soft delete the recipe
      await db.recipe.update({
        where: { id: recipeId },
        data: { deletedAt: new Date() },
      });

      const request = await createFormRequest({ intent: "delete" }, testUserId);

      await expect(
        action({
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
  });

  describe("component", () => {
    it("should render recipe with no steps (empty state) as owner", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Test Recipe",
          description: "A delicious test dish",
          servings: "4",
          imageUrl: "https://example.com/recipe.jpg",
          chef: { id: "user-1", username: "testchef" },
          steps: [],
        },
        isOwner: true,
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id",
          Component: RecipeDetail,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1"]} />);

      expect(await screen.findByRole("heading", { name: "Test Recipe" })).toBeInTheDocument();
      expect(screen.getByText(/By/)).toBeInTheDocument();
      // Chef name in link (Avatar also has it as title, so use link role to be specific)
      expect(screen.getByRole("link", { name: "testchef" })).toBeInTheDocument();
      expect(screen.getByText("A delicious test dish")).toBeInTheDocument();
      // Servings display with new component format
      expect(screen.getByText("4")).toBeInTheDocument();
      expect(screen.getByText("No steps added yet")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Add Steps" })).toHaveAttribute("href", "/recipes/recipe-1/edit");
      expect(screen.getByRole("link", { name: "← Back to recipes" })).toHaveAttribute("href", "/recipes");
    });

    it("should render recipe with no steps (empty state) as non-owner", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Someone Elses Recipe",
          description: null,
          servings: null,
          imageUrl: null,
          chef: { id: "user-2", username: "otherchef" },
          steps: [],
        },
        isOwner: false,
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id",
          Component: RecipeDetail,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1"]} />);

      expect(await screen.findByText("Someone Elses Recipe")).toBeInTheDocument();
      expect(screen.getByText("No steps added yet")).toBeInTheDocument();
      // Non-owner should not see edit/delete buttons
      expect(screen.queryByRole("link", { name: "Edit" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
      expect(screen.queryByRole("link", { name: "Add Steps" })).not.toBeInTheDocument();
    });

    it("should render recipe with steps and ingredients", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Spaghetti Bolognese",
          description: "Classic Italian pasta",
          servings: "4",
          imageUrl: "https://example.com/spaghetti.jpg",
          chef: { id: "user-1", username: "testchef" },
          steps: [
            {
              id: "step-1",
              stepNum: 1,
              stepTitle: "Prep the Sauce",
              description: "Heat oil in a pan and sauté the onions",
              ingredients: [
                {
                  id: "ing-1",
                  quantity: 2,
                  unit: { name: "tbsp" },
                  ingredientRef: { name: "olive oil" },
                },
                {
                  id: "ing-2",
                  quantity: 1,
                  unit: { name: "medium" },
                  ingredientRef: { name: "onion" },
                },
              ],
              usingSteps: [],
            },
            {
              id: "step-2",
              stepNum: 2,
              stepTitle: null,
              description: "Cook the pasta according to package instructions",
              ingredients: [],
              usingSteps: [],
            },
          ],
        },
        isOwner: true,
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id",
          Component: RecipeDetail,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1"]} />);

      expect(await screen.findByRole("heading", { name: "Spaghetti Bolognese" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Prep the Sauce" })).toBeInTheDocument();
      expect(screen.getByText("Heat oil in a pan and sauté the onions")).toBeInTheDocument();
      expect(screen.getByText("2 tbsp olive oil")).toBeInTheDocument();
      expect(screen.getByText("1 medium onion")).toBeInTheDocument();
      expect(screen.getByText("Cook the pasta according to package instructions")).toBeInTheDocument();
      // Step numbers
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("should show owner controls (edit, delete)", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "My Recipe",
          description: null,
          servings: null,
          imageUrl: null,
          chef: { id: "user-1", username: "testchef" },
          steps: [],
        },
        isOwner: true,
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id",
          Component: RecipeDetail,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1"]} />);

      expect(await screen.findByRole("link", { name: "Edit" })).toHaveAttribute("href", "/recipes/recipe-1/edit");
      expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    });

    it("should not render description when null", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "No Desc Recipe",
          description: null,
          servings: "2",
          imageUrl: null,
          chef: { id: "user-1", username: "testchef" },
          steps: [],
        },
        isOwner: false,
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id",
          Component: RecipeDetail,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1"]} />);

      expect(await screen.findByText("No Desc Recipe")).toBeInTheDocument();
      // Servings should be rendered (new format without "Servings:" label)
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("should not render servings when null", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "No Servings Recipe",
          description: "Has a description",
          servings: null,
          imageUrl: null,
          chef: { id: "user-1", username: "testchef" },
          steps: [],
        },
        isOwner: false,
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id",
          Component: RecipeDetail,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1"]} />);

      expect(await screen.findByText("No Servings Recipe")).toBeInTheDocument();
      expect(screen.getByText("Has a description")).toBeInTheDocument();
      // Scale selector should still be present (for ingredient scaling)
      expect(screen.getByTestId("scale-display")).toBeInTheDocument();
    });

    it("should render step without title", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Simple Recipe",
          description: null,
          servings: null,
          imageUrl: null,
          chef: { id: "user-1", username: "testchef" },
          steps: [
            {
              id: "step-1",
              stepNum: 1,
              stepTitle: null,
              description: "Just do the thing",
              ingredients: [],
              usingSteps: [],
            },
          ],
        },
        isOwner: false,
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id",
          Component: RecipeDetail,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1"]} />);

      expect(await screen.findByText("Simple Recipe")).toBeInTheDocument();
      expect(screen.getByText("Just do the thing")).toBeInTheDocument();
      // Only the Steps heading h2 should exist, no h3 for step title
      expect(screen.queryByRole("heading", { level: 3 })).not.toBeInTheDocument();
    });

    it("should render step output uses when present", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Recipe with Dependencies",
          description: null,
          servings: null,
          imageUrl: null,
          chef: { id: "user-1", username: "testchef" },
          steps: [
            {
              id: "step-1",
              stepNum: 1,
              stepTitle: "Cook rice",
              description: "Boil rice in water",
              ingredients: [],
              usingSteps: [],
            },
            {
              id: "step-2",
              stepNum: 2,
              stepTitle: "Make curry",
              description: "Prepare the curry sauce",
              ingredients: [],
              usingSteps: [],
            },
            {
              id: "step-3",
              stepNum: 3,
              stepTitle: "Combine",
              description: "Mix everything together",
              ingredients: [],
              usingSteps: [
                {
                  id: "use-1",
                  outputStepNum: 1,
                  outputOfStep: { stepNum: 1, stepTitle: "Cook rice" },
                },
                {
                  id: "use-2",
                  outputStepNum: 2,
                  outputOfStep: { stepNum: 2, stepTitle: "Make curry" },
                },
              ],
            },
          ],
        },
        isOwner: false,
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id",
          Component: RecipeDetail,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1"]} />);

      expect(await screen.findByText("Recipe with Dependencies")).toBeInTheDocument();
      // Step 3 should show step output uses inline with ingredients
      const stepOutputSection = screen.getByTestId("step-output-uses-section");
      expect(stepOutputSection).toBeInTheDocument();
      // Should display the step references
      expect(stepOutputSection).toHaveTextContent("Step 1");
      expect(stepOutputSection).toHaveTextContent("Cook rice");
      expect(stepOutputSection).toHaveTextContent("Step 2");
      expect(stepOutputSection).toHaveTextContent("Make curry");
    });

    it("should render step output use without title when stepTitle is null", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Recipe with Untitled Dependency",
          description: null,
          servings: null,
          imageUrl: null,
          chef: { id: "user-1", username: "testchef" },
          steps: [
            {
              id: "step-1",
              stepNum: 1,
              stepTitle: null,
              description: "First step without title",
              ingredients: [],
              usingSteps: [],
            },
            {
              id: "step-2",
              stepNum: 2,
              stepTitle: "Second step",
              description: "Uses the first step",
              ingredients: [],
              usingSteps: [
                {
                  id: "use-1",
                  outputStepNum: 1,
                  outputOfStep: { stepNum: 1, stepTitle: null },
                },
              ],
            },
          ],
        },
        isOwner: false,
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id",
          Component: RecipeDetail,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1"]} />);

      expect(await screen.findByText("Recipe with Untitled Dependency")).toBeInTheDocument();
      // Should display "Step 1" in the step output uses section
      const stepOutputSection = screen.getByTestId("step-output-uses-section");
      expect(stepOutputSection).toHaveTextContent("Step 1");
    });

    it("should not render using outputs section when usingSteps is empty", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Recipe without Dependencies",
          description: null,
          servings: null,
          imageUrl: null,
          chef: { id: "user-1", username: "testchef" },
          steps: [
            {
              id: "step-1",
              stepNum: 1,
              stepTitle: "Only step",
              description: "This step has no dependencies",
              ingredients: [],
              usingSteps: [],
            },
          ],
        },
        isOwner: false,
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id",
          Component: RecipeDetail,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1"]} />);

      expect(await screen.findByText("Recipe without Dependencies")).toBeInTheDocument();
      // Step output uses section should not be present
      expect(screen.queryByTestId("step-output-uses-section")).not.toBeInTheDocument();
    });

    it("should handle step with undefined usingSteps (nullish coalescing)", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Recipe with Undefined UsingSteps",
          description: null,
          servings: null,
          imageUrl: null,
          chef: { id: "user-1", username: "testchef" },
          steps: [
            {
              id: "step-1",
              stepNum: 1,
              stepTitle: "Step with no usingSteps property",
              description: "This step has usingSteps as undefined",
              ingredients: [],
              // Note: usingSteps is intentionally omitted to test the ?? [] fallback
            },
          ],
        },
        isOwner: false,
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id",
          Component: RecipeDetail,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1"]} />);

      // Recipe should render successfully despite undefined usingSteps
      expect(await screen.findByText("Recipe with Undefined UsingSteps")).toBeInTheDocument();
      expect(screen.getByText("This step has usingSteps as undefined")).toBeInTheDocument();
      // Step output uses section should not be present since usingSteps defaults to []
      expect(screen.queryByTestId("step-output-uses-section")).not.toBeInTheDocument();
    });

    it("should render single-step recipe as owner with edit controls", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Single Step Recipe",
          description: "A simple one-step recipe",
          servings: "2",
          imageUrl: null,
          chef: { id: "user-1", username: "testchef" },
          steps: [
            {
              id: "step-1",
              stepNum: 1,
              stepTitle: "The Only Step",
              description: "Do everything in one step",
              ingredients: [],
              usingSteps: [],
            },
          ],
        },
        isOwner: true,
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id",
          Component: RecipeDetail,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1"]} />);

      // Recipe title and content should render
      expect(await screen.findByRole("heading", { name: "Single Step Recipe" })).toBeInTheDocument();
      expect(screen.getByText("A simple one-step recipe")).toBeInTheDocument();
      expect(screen.getByText("Do everything in one step")).toBeInTheDocument();

      // Single step should render with step number
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "The Only Step" })).toBeInTheDocument();

      // Owner controls should be present
      expect(screen.getByRole("link", { name: "Edit" })).toHaveAttribute("href", "/recipes/recipe-1/edit");
      expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();

      // Step output uses section should NOT appear (single step has no dependencies)
      expect(screen.queryByTestId("step-output-uses-section")).not.toBeInTheDocument();
    });

    it("should render step output uses BEFORE description (display order test)", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Recipe with Display Order",
          description: null,
          servings: null,
          imageUrl: null,
          chef: { id: "user-1", username: "testchef" },
          steps: [
            {
              id: "step-1",
              stepNum: 1,
              stepTitle: "First step",
              description: "Prepare ingredients",
              ingredients: [],
              usingSteps: [],
            },
            {
              id: "step-2",
              stepNum: 2,
              stepTitle: "Second step",
              description: "This is the step description",
              ingredients: [
                {
                  id: "ing-1",
                  quantity: 1,
                  unit: { name: "cup" },
                  ingredientRef: { name: "test ingredient" },
                },
              ],
              usingSteps: [
                {
                  id: "use-1",
                  outputStepNum: 1,
                  outputOfStep: { stepNum: 1, stepTitle: "First step" },
                },
              ],
            },
          ],
        },
        isOwner: false,
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id",
          Component: RecipeDetail,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1"]} />);

      await screen.findByText("Recipe with Display Order");

      // Get step 2's step-output-uses-section (now inline with ingredients)
      const stepOutputSection = screen.getByTestId("step-output-uses-section");

      // Get the step card containing the section
      const stepCard = stepOutputSection.closest("article");
      expect(stepCard).not.toBeNull();

      // Extract text content to verify order
      const textContent = stepCard!.textContent || "";

      // The display order should be:
      // 1. Step number and title
      // 2. Ingredients (containing step output uses at top)
      // 3. Description

      // Step output uses are now inside the Ingredients section
      // Verify Step 1 appears in the content (from step output uses)
      const stepReferencePosition = textContent.indexOf("Step 1");
      const descriptionPosition = textContent.indexOf("This is the step description");
      const ingredientsPosition = textContent.indexOf("Ingredients");

      expect(stepReferencePosition).toBeGreaterThan(-1);
      expect(descriptionPosition).toBeGreaterThan(-1);
      expect(ingredientsPosition).toBeGreaterThan(-1);

      // Verify order: ingredients (with step outputs) < description
      expect(ingredientsPosition).toBeLessThan(descriptionPosition);
      // Step outputs are inside ingredients section, after the "Ingredients" heading
      expect(stepReferencePosition).toBeGreaterThan(ingredientsPosition);
      expect(stepReferencePosition).toBeLessThan(descriptionPosition);
    });

    it("should open delete dialog and allow confirmation", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Recipe to Delete",
          description: null,
          servings: null,
          imageUrl: null,
          chef: { id: "user-1", username: "testchef" },
          steps: [],
        },
        isOwner: true,
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id",
          Component: RecipeDetail,
          loader: () => mockData,
          action: () => null,
        },
        {
          path: "/recipes",
          Component: () => <div>Recipes List</div>,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1"]} />);

      // Click delete button
      const deleteButton = await screen.findByRole("button", { name: "Delete" });
      fireEvent.click(deleteButton);

      // Dialog should be open
      expect(await screen.findByText("Banish this recipe?")).toBeInTheDocument();
      expect(screen.getByText(/will be sent to the shadow realm/)).toBeInTheDocument();

      // Click confirm button
      const confirmButton = screen.getByRole("button", { name: "Delete it" });
      fireEvent.click(confirmButton);

      // Dialog should close (may need to wait for animation)
      await waitFor(() => {
        expect(screen.queryByText("Banish this recipe?")).not.toBeInTheDocument();
      });
    });

    it("should close delete dialog when clicking cancel", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Keep This Recipe",
          description: null,
          servings: null,
          imageUrl: null,
          chef: { id: "user-1", username: "testchef" },
          steps: [],
        },
        isOwner: true,
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id",
          Component: RecipeDetail,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1"]} />);

      // Click delete button
      const deleteButton = await screen.findByRole("button", { name: "Delete" });
      fireEvent.click(deleteButton);

      // Click cancel
      const cancelButton = screen.getByRole("button", { name: "Keep it" });
      fireEvent.click(cancelButton);

      // Dialog should close (may need to wait for animation)
      await waitFor(() => {
        expect(screen.queryByText("Banish this recipe?")).not.toBeInTheDocument();
      });
    });

    it("should render Share button for owner", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Owner Recipe",
          description: null,
          servings: null,
          imageUrl: null,
          chef: { id: "user-1", username: "testchef" },
          steps: [],
        },
        isOwner: true,
        cookbooks: [],
        savedInCookbookIds: [],
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id",
          Component: RecipeDetail,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1"]} />);

      // Share button should be visible
      expect(await screen.findByRole("button", { name: "Share recipe" })).toBeInTheDocument();
    });

    it("should render Share button for non-owner", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Someone Elses Recipe",
          description: null,
          servings: null,
          imageUrl: null,
          chef: { id: "user-2", username: "otherchef" },
          steps: [],
        },
        isOwner: false,
        cookbooks: [],
        savedInCookbookIds: [],
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id",
          Component: RecipeDetail,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1"]} />);

      // Share button should be visible for non-owner too
      expect(await screen.findByRole("button", { name: "Share recipe" })).toBeInTheDocument();
      // But Edit/Delete buttons should NOT be visible
      expect(screen.queryByRole("link", { name: "Edit" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
    });

    it("should render Save to Cookbook dropdown", async () => {
      const user = userEvent.setup();
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Recipe to Save",
          description: null,
          servings: null,
          imageUrl: null,
          chef: { id: "user-1", username: "testchef" },
          steps: [],
        },
        isOwner: true,
        cookbooks: [
          { id: "cb-1", title: "My Favorites" },
          { id: "cb-2", title: "Quick Meals" },
        ],
        savedInCookbookIds: [],
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id",
          Component: RecipeDetail,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1"]} />);

      // Save button should be visible
      const saveButton = await screen.findByRole("button", { name: "Save to cookbook" });
      expect(saveButton).toBeInTheDocument();

      // Click to open dropdown and wait for menu to appear
      await user.click(saveButton);

      // Should show cookbook options
      expect(await screen.findByText("My Favorites")).toBeInTheDocument();
      expect(screen.getByText("Quick Meals")).toBeInTheDocument();

      // Close dropdown and wait for it to be removed to avoid act() warnings
      await user.keyboard("{Escape}");
      await waitFor(() => {
        expect(screen.queryByText("My Favorites")).not.toBeInTheDocument();
      });
    });

    it("should show checkmark on already saved cookbooks", async () => {
      const user = userEvent.setup();
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Already Saved Recipe",
          description: null,
          servings: null,
          imageUrl: null,
          chef: { id: "user-1", username: "testchef" },
          steps: [],
        },
        isOwner: true,
        cookbooks: [
          { id: "cb-1", title: "My Favorites" },
          { id: "cb-2", title: "Quick Meals" },
        ],
        savedInCookbookIds: ["cb-1"], // Already saved in My Favorites
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id",
          Component: RecipeDetail,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1"]} />);

      // Click Save button to open dropdown
      const saveButton = await screen.findByRole("button", { name: "Save to cookbook" });
      await user.click(saveButton);

      // Wait for dropdown to render - My Favorites should show checkmark (already saved)
      expect(await screen.findByText("My Favorites ✓")).toBeInTheDocument();
      // Quick Meals should not have checkmark
      expect(screen.getByText("Quick Meals")).toBeInTheDocument();
      expect(screen.queryByText("Quick Meals ✓")).not.toBeInTheDocument();

      // Close dropdown and wait for it to be removed to avoid act() warnings
      await user.keyboard("{Escape}");
      await waitFor(() => {
        expect(screen.queryByText("My Favorites ✓")).not.toBeInTheDocument();
      });
    });

    it("should show empty state when user has no cookbooks", async () => {
      const user = userEvent.setup();
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Recipe No Cookbooks",
          description: null,
          servings: null,
          imageUrl: null,
          chef: { id: "user-1", username: "testchef" },
          steps: [],
        },
        isOwner: true,
        cookbooks: [],
        savedInCookbookIds: [],
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id",
          Component: RecipeDetail,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1"]} />);

      // Click Save button to open dropdown
      const saveButton = await screen.findByRole("button", { name: "Save to cookbook" });
      await user.click(saveButton);

      // Should show empty state message
      expect(await screen.findByText("No cookbooks yet")).toBeInTheDocument();
      expect(screen.getByText("Create your first cookbook")).toBeInTheDocument();

      // Close dropdown and wait for it to be removed to avoid act() warnings
      await user.keyboard("{Escape}");
      await waitFor(() => {
        expect(screen.queryByText("No cookbooks yet")).not.toBeInTheDocument();
      });
    });

    it("should call Share handler when Share button is clicked", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Shareable Recipe",
          description: "A recipe to share",
          servings: null,
          imageUrl: null,
          chef: { id: "user-1", username: "testchef" },
          steps: [],
        },
        isOwner: true,
        cookbooks: [],
        savedInCookbookIds: [],
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id",
          Component: RecipeDetail,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1"]} />);

      // Click Share button
      const shareButton = await screen.findByRole("button", { name: "Share recipe" });
      fireEvent.click(shareButton);

      // The share handler uses browser share API which is tested via integration
      // Here we just verify the button is clickable without errors
      expect(shareButton).toBeInTheDocument();
    });

    it("should toggle step output checkbox when clicked", async () => {
      const user = userEvent.setup();
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Recipe with Step Outputs",
          description: null,
          servings: null,
          imageUrl: null,
          chef: { id: "user-1", username: "testchef" },
          steps: [
            {
              id: "step-1",
              stepNum: 1,
              stepTitle: "First step",
              description: "Prepare base",
              ingredients: [],
              usingSteps: [],
            },
            {
              id: "step-2",
              stepNum: 2,
              stepTitle: "Second step",
              description: "Combine with first step output",
              ingredients: [],
              usingSteps: [
                {
                  id: "use-1",
                  outputStepNum: 1,
                  outputOfStep: { stepNum: 1, stepTitle: "First step" },
                },
              ],
            },
          ],
        },
        isOwner: false,
        cookbooks: [],
        savedInCookbookIds: [],
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id",
          Component: RecipeDetail,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1"]} />);

      // Wait for recipe to render
      await screen.findByRole("heading", { name: "Recipe with Step Outputs" });

      // Find the step output uses section
      const stepOutputSection = screen.getByTestId("step-output-uses-section");
      expect(stepOutputSection).toBeInTheDocument();

      // Find all checkboxes - the first should be the step output
      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes.length).toBeGreaterThan(0);

      // First checkbox is the step output checkbox
      const stepOutputCheckbox = checkboxes[0];
      expect(stepOutputCheckbox).not.toBeChecked();

      // Click to check
      await user.click(stepOutputCheckbox);
      expect(stepOutputCheckbox).toBeChecked();

      // Click again to uncheck (tests the delete branch in handleStepOutputToggle)
      await user.click(stepOutputCheckbox);
      expect(stepOutputCheckbox).not.toBeChecked();
    });

    it("should toggle ingredient checkbox when clicked", async () => {
      const user = userEvent.setup();
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Recipe with Ingredients",
          description: null,
          servings: null,
          imageUrl: null,
          chef: { id: "user-1", username: "testchef" },
          steps: [
            {
              id: "step-1",
              stepNum: 1,
              stepTitle: "Mix ingredients",
              description: "Combine all ingredients",
              ingredients: [
                {
                  id: "ing-1",
                  quantity: 2,
                  unit: { name: "cups" },
                  ingredientRef: { name: "flour" },
                },
                {
                  id: "ing-2",
                  quantity: 1,
                  unit: { name: "tsp" },
                  ingredientRef: { name: "salt" },
                },
              ],
              usingSteps: [],
            },
          ],
        },
        isOwner: false,
        cookbooks: [],
        savedInCookbookIds: [],
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id",
          Component: RecipeDetail,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1"]} />);

      // Wait for recipe to render
      await screen.findByRole("heading", { name: "Recipe with Ingredients" });

      // Find ingredient checkboxes
      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes.length).toBeGreaterThanOrEqual(2);

      // Find the flour ingredient checkbox (first one in the list)
      const flourCheckbox = checkboxes[0];
      expect(flourCheckbox).not.toBeChecked();

      // Click to check
      await user.click(flourCheckbox);
      expect(flourCheckbox).toBeChecked();

      // Click again to uncheck (tests the delete branch in handleIngredientToggle)
      await user.click(flourCheckbox);
      expect(flourCheckbox).not.toBeChecked();
    });

    it("should change scale factor when scale buttons are clicked", async () => {
      const user = userEvent.setup();
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Scalable Recipe",
          description: null,
          servings: "4",
          imageUrl: null,
          chef: { id: "user-1", username: "testchef" },
          steps: [
            {
              id: "step-1",
              stepNum: 1,
              stepTitle: "Prep",
              description: "Prepare ingredients",
              ingredients: [
                {
                  id: "ing-1",
                  quantity: 2,
                  unit: { name: "cups" },
                  ingredientRef: { name: "flour" },
                },
              ],
              usingSteps: [],
            },
          ],
        },
        isOwner: false,
        cookbooks: [],
        savedInCookbookIds: [],
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id",
          Component: RecipeDetail,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1"]} />);

      // Wait for recipe to render
      await screen.findByRole("heading", { name: "Scalable Recipe" });

      // Initial scale should be 1x
      const scaleDisplay = screen.getByTestId("scale-display");
      expect(scaleDisplay).toHaveTextContent("1×");

      // Click the plus button to increase scale (step is 0.25)
      const plusButton = screen.getByTestId("scale-plus");
      await user.click(plusButton);

      // Scale should now be 1.25x
      expect(scaleDisplay).toHaveTextContent("1.25×");

      // Click the minus button to decrease scale
      const minusButton = screen.getByTestId("scale-minus");
      await user.click(minusButton);

      // Scale should be back to 1x
      expect(scaleDisplay).toHaveTextContent("1×");
    });

    it("should save recipe to cookbook via dropdown (optimistic UI)", async () => {
      const user = userEvent.setup();
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Recipe to Save to Cookbook",
          description: null,
          servings: null,
          imageUrl: null,
          chef: { id: "user-1", username: "testchef" },
          steps: [],
        },
        isOwner: true,
        cookbooks: [
          { id: "cb-1", title: "My Favorites" },
          { id: "cb-2", title: "Quick Meals" },
        ],
        savedInCookbookIds: [],
      };

      let actionCalled = false;
      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id",
          Component: RecipeDetail,
          loader: () => mockData,
          action: async () => {
            actionCalled = true;
            return { success: true };
          },
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1"]} />);

      // Click Save button to open dropdown
      const saveButton = await screen.findByRole("button", { name: "Save to cookbook" });
      await user.click(saveButton);

      // Wait for dropdown to render
      const cookbookOption = await screen.findByText("My Favorites");
      expect(cookbookOption).toBeInTheDocument();

      // Click on the cookbook option to save
      await user.click(cookbookOption);

      // Verify action was called (submit was invoked)
      await waitFor(() => {
        expect(actionCalled).toBe(true);
      });

      // Optimistic UI: cookbook should now show as saved
      // Re-open the dropdown to verify
      await user.click(saveButton);
      expect(await screen.findByText("My Favorites ✓")).toBeInTheDocument();

      // Close dropdown and wait for it to fully close to avoid act() warnings
      await user.keyboard("{Escape}");
      await waitFor(() => {
        expect(screen.queryByText("Quick Meals")).not.toBeInTheDocument();
      });
    });
  });

  describe("action - addToCookbook", () => {
    let testCookbookId: string;

    beforeEach(async () => {
      // Create a cookbook for the test user
      const cookbook = await db.cookbook.create({
        data: {
          title: "Test Cookbook " + faker.string.alphanumeric(6),
          authorId: testUserId,
        },
      });
      testCookbookId = cookbook.id;
    });

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

      return new UndiciRequest(`http://localhost:3000/recipes/${recipeId}`, {
        method: "POST",
        body: formData,
        headers,
      });
    }

    it("should add recipe to cookbook successfully", async () => {
      const request = await createFormRequest(
        { intent: "addToCookbook", cookbookId: testCookbookId },
        testUserId
      );

      const result = await action({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId },
      } as any);

      expect(result).toEqual({ success: true });

      // Verify recipe is in cookbook
      const recipeInCookbook = await db.recipeInCookbook.findUnique({
        where: {
          cookbookId_recipeId: {
            cookbookId: testCookbookId,
            recipeId: recipeId,
          },
        },
      });
      expect(recipeInCookbook).not.toBeNull();
      expect(recipeInCookbook?.addedById).toBe(testUserId);
    });

    it("should return success even if recipe already in cookbook", async () => {
      // First add the recipe
      await db.recipeInCookbook.create({
        data: {
          cookbookId: testCookbookId,
          recipeId: recipeId,
          addedById: testUserId,
        },
      });

      // Try to add again
      const request = await createFormRequest(
        { intent: "addToCookbook", cookbookId: testCookbookId },
        testUserId
      );

      const result = await action({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId },
      } as any);

      // Should still return success (idempotent)
      expect(result).toEqual({ success: true });
    });

    it("should throw 403 when trying to add to someone elses cookbook", async () => {
      // Create cookbook for other user
      const otherCookbook = await db.cookbook.create({
        data: {
          title: "Other User Cookbook " + faker.string.alphanumeric(6),
          authorId: otherUserId,
        },
      });

      const request = await createFormRequest(
        { intent: "addToCookbook", cookbookId: otherCookbook.id },
        testUserId // testUser trying to add to otherUser's cookbook
      );

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

    it("should throw 403 when cookbook does not exist", async () => {
      const request = await createFormRequest(
        { intent: "addToCookbook", cookbookId: "nonexistent-cookbook-id" },
        testUserId
      );

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

    it("should allow non-owner to add recipe to their own cookbook", async () => {
      // Create cookbook for other user
      const otherUserCookbook = await db.cookbook.create({
        data: {
          title: "Other User Own Cookbook " + faker.string.alphanumeric(6),
          authorId: otherUserId,
        },
      });

      // otherUser adding testUser's recipe to otherUser's cookbook (allowed)
      const request = await createFormRequest(
        { intent: "addToCookbook", cookbookId: otherUserCookbook.id },
        otherUserId
      );

      const result = await action({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId },
      } as any);

      expect(result).toEqual({ success: true });
    });

    it("should do nothing when cookbookId is not provided", async () => {
      const request = await createFormRequest(
        { intent: "addToCookbook" }, // No cookbookId
        testUserId
      );

      const result = await action({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId },
      } as any);

      // Falls through to return null since no cookbookId
      expect(result).toBeNull();
    });
  });
});
