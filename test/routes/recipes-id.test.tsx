import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Request as UndiciRequest, FormData as UndiciFormData } from "undici";
import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
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

      const Stub = createRoutesStub([
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

      const Stub = createRoutesStub([
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
            },
            {
              id: "step-2",
              stepNum: 2,
              stepTitle: null,
              description: "Cook the pasta according to package instructions",
              ingredients: [],
            },
          ],
        },
        isOwner: true,
      };

      const Stub = createRoutesStub([
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

      const Stub = createRoutesStub([
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

      const Stub = createRoutesStub([
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

      const Stub = createRoutesStub([
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
            },
          ],
        },
        isOwner: false,
      };

      const Stub = createRoutesStub([
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
  });
});
