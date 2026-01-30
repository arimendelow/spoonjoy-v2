import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Request as UndiciRequest, FormData as UndiciFormData } from "undici";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
      expect(screen.getByText("testchef")).toBeInTheDocument();
      expect(screen.getByText("A delicious test dish")).toBeInTheDocument();
      expect(screen.getByText(/Servings:/)).toBeInTheDocument();
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
      // Servings should be rendered
      expect(screen.getByText(/Servings:/)).toBeInTheDocument();
      // No description block should be present
      const descriptionBlocks = screen.queryAllByText(/description/i);
      expect(descriptionBlocks.length).toBe(0);
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
      // Servings should not be rendered
      expect(screen.queryByText(/Servings:/)).not.toBeInTheDocument();
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
      // Step 3 should show "Using outputs from" section
      expect(screen.getByText("Using outputs from")).toBeInTheDocument();
      // Should display the step output uses
      expect(screen.getByText(/output of step 1: Cook rice/)).toBeInTheDocument();
      expect(screen.getByText(/output of step 2: Make curry/)).toBeInTheDocument();
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
      // Should display "output of step 1" without the colon and title
      expect(screen.getByText("output of step 1")).toBeInTheDocument();
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
      // "Using outputs from" section should not be present
      expect(screen.queryByText("Using outputs from")).not.toBeInTheDocument();
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
      // "Using outputs from" section should not be present since usingSteps defaults to []
      expect(screen.queryByText("Using outputs from")).not.toBeInTheDocument();
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

      // "Using outputs from" should NOT appear (single step has no dependencies)
      expect(screen.queryByText("Using outputs from")).not.toBeInTheDocument();
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

      // Get the step 2 container
      const stepCards = document.querySelectorAll('.bg-white.border.border-gray-200.rounded-lg.p-6');
      const step2Card = stepCards[1]; // Second step card

      // Extract text content to verify order
      const textContent = step2Card.textContent || "";

      // The display order should be:
      // 1. Step number and title
      // 2. Step output uses ("Using outputs from" section)
      // 3. Description
      // 4. Ingredients

      // "Using outputs from" should appear BEFORE "This is the step description"
      const usingOutputsPosition = textContent.indexOf("Using outputs from");
      const descriptionPosition = textContent.indexOf("This is the step description");
      const ingredientsPosition = textContent.indexOf("Ingredients");

      expect(usingOutputsPosition).toBeGreaterThan(-1);
      expect(descriptionPosition).toBeGreaterThan(-1);
      expect(ingredientsPosition).toBeGreaterThan(-1);

      // Verify order: using outputs < description < ingredients
      expect(usingOutputsPosition).toBeLessThan(descriptionPosition);
      expect(descriptionPosition).toBeLessThan(ingredientsPosition);
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
  });
});
