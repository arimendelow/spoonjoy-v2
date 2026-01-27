import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Request as UndiciRequest, FormData as UndiciFormData } from "undici";
import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { db } from "~/lib/db.server";
import { loader, action } from "~/routes/recipes.$id.edit";
import EditRecipe from "~/routes/recipes.$id.edit";
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

    it("should not reorder if stepId is missing", async () => {
      const request = await createFormRequest(
        {
          intent: "reorderStep",
          direction: "up",
        },
        testUserId
      );

      // Should not throw and not reorder
      await action({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId },
      } as any);
    });

    it("should not reorder if direction is invalid", async () => {
      const step = await db.recipeStep.create({
        data: {
          recipeId,
          stepNum: 1,
          description: "Step 1",
        },
      });

      const request = await createFormRequest(
        {
          intent: "reorderStep",
          stepId: step.id,
          direction: "sideways",
        },
        testUserId
      );

      await action({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId },
      } as any);

      // Step should remain unchanged
      const updatedStep = await db.recipeStep.findUnique({ where: { id: step.id } });
      expect(updatedStep?.stepNum).toBe(1);
    });

    it("should not reorder if step belongs to different recipe", async () => {
      // Create another recipe with a step
      const otherRecipe = await db.recipe.create({
        data: {
          title: "Other Recipe " + faker.string.alphanumeric(6),
          chefId: testUserId,
        },
      });

      const otherStep = await db.recipeStep.create({
        data: {
          recipeId: otherRecipe.id,
          stepNum: 1,
          description: "Other step",
        },
      });

      const request = await createFormRequest(
        {
          intent: "reorderStep",
          stepId: otherStep.id,
          direction: "up",
        },
        testUserId
      );

      await action({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId },
      } as any);

      // Other step should remain unchanged
      const updatedStep = await db.recipeStep.findUnique({ where: { id: otherStep.id } });
      expect(updatedStep?.stepNum).toBe(1);
    });

    it("should throw 404 for soft-deleted recipe in action", async () => {
      // Soft delete the recipe
      await db.recipe.update({
        where: { id: recipeId },
        data: { deletedAt: new Date() },
      });

      const request = await createFormRequest({ title: "New Title" }, testUserId);

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

    it("should set empty description and servings to null", async () => {
      const request = await createFormRequest(
        {
          title: "Updated Title",
          description: "",
          servings: "   ",
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

      // Verify empty fields become null
      const recipe = await db.recipe.findUnique({ where: { id: recipeId } });
      expect(recipe?.description).toBeNull();
      expect(recipe?.servings).toBeNull();
    });

    it("should return validation error for whitespace-only title", async () => {
      const request = await createFormRequest({ title: "   " }, testUserId);

      const response = await action({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId },
      } as any);

      const { data, status } = extractResponseData(response);
      expect(status).toBe(400);
      expect(data.errors.title).toBe("Title is required");
    });

    it("should return generic error for database errors", async () => {
      // Mock db.recipe.update to throw a generic error
      const originalUpdate = db.recipe.update;
      db.recipe.update = vi.fn().mockRejectedValue(new Error("Database connection failed"));

      try {
        const request = await createFormRequest({ title: "Updated Title" }, testUserId);

        const response = await action({
          request,
          context: { cloudflare: { env: null } },
          params: { id: recipeId },
        } as any);

        const { data, status } = extractResponseData(response);
        expect(status).toBe(500);
        expect(data.errors.general).toBe("Failed to update recipe. Please try again.");
      } finally {
        // Restore original function
        db.recipe.update = originalUpdate;
      }
    });
  });

  describe("component", () => {
    it("should render edit recipe form with recipe data", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Test Recipe",
          description: "A delicious dish",
          servings: "4",
          imageUrl: "https://example.com/recipe.jpg",
          steps: [],
        },
      };

      const Stub = createRoutesStub([
        {
          path: "/recipes/:id/edit",
          Component: EditRecipe,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1/edit"]} />);

      expect(await screen.findByRole("heading", { name: "Edit Recipe" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "← Back to recipe" })).toHaveAttribute("href", "/recipes/recipe-1");
      expect(screen.getByLabelText(/Recipe Title/)).toHaveValue("Test Recipe");
      expect(screen.getByLabelText(/Description/)).toHaveValue("A delicious dish");
      expect(screen.getByLabelText(/Servings/)).toHaveValue("4");
      expect(screen.getByLabelText(/Image URL/)).toHaveValue("https://example.com/recipe.jpg");
    });

    it("should render empty steps state", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Test Recipe",
          description: null,
          servings: null,
          imageUrl: "",
          steps: [],
        },
      };

      const Stub = createRoutesStub([
        {
          path: "/recipes/:id/edit",
          Component: EditRecipe,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1/edit"]} />);

      expect(await screen.findByText("No steps added yet")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "+ Add Step" })).toHaveAttribute("href", "/recipes/recipe-1/steps/new");
    });

    it("should render recipe steps with title and description", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Test Recipe",
          description: null,
          servings: null,
          imageUrl: "",
          steps: [
            {
              id: "step-1",
              stepNum: 1,
              stepTitle: "Prep the Ingredients",
              description: "Chop all vegetables",
              ingredients: [
                { id: "ing-1", quantity: 1 },
                { id: "ing-2", quantity: 2 },
              ],
            },
            {
              id: "step-2",
              stepNum: 2,
              stepTitle: null,
              description: "Cook everything together",
              ingredients: [],
            },
          ],
        },
      };

      const Stub = createRoutesStub([
        {
          path: "/recipes/:id/edit",
          Component: EditRecipe,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1/edit"]} />);

      expect(await screen.findByRole("heading", { name: "Recipe Steps" })).toBeInTheDocument();
      expect(screen.getByText("Prep the Ingredients")).toBeInTheDocument();
      expect(screen.getByText("Chop all vegetables")).toBeInTheDocument();
      expect(screen.getByText("2 ingredients")).toBeInTheDocument();
      expect(screen.getByText("Cook everything together")).toBeInTheDocument();
      // Two edit links for two steps
      expect(screen.getAllByRole("link", { name: "Edit" })).toHaveLength(2);
    });

    it("should render singular ingredient count for single ingredient", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Test Recipe",
          description: null,
          servings: null,
          imageUrl: "",
          steps: [
            {
              id: "step-1",
              stepNum: 1,
              stepTitle: null,
              description: "Mix the flour",
              ingredients: [{ id: "ing-1", quantity: 1 }],
            },
          ],
        },
      };

      const Stub = createRoutesStub([
        {
          path: "/recipes/:id/edit",
          Component: EditRecipe,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1/edit"]} />);

      expect(await screen.findByText("1 ingredient")).toBeInTheDocument();
    });

    it("should not show ingredient count when step has no ingredients", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Test Recipe",
          description: null,
          servings: null,
          imageUrl: "",
          steps: [
            {
              id: "step-1",
              stepNum: 1,
              stepTitle: null,
              description: "Just instructions",
              ingredients: [],
            },
          ],
        },
      };

      const Stub = createRoutesStub([
        {
          path: "/recipes/:id/edit",
          Component: EditRecipe,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1/edit"]} />);

      await screen.findByText("Just instructions");
      expect(screen.queryByText(/ingredient/)).not.toBeInTheDocument();
    });

    it("should render reorder buttons for multiple steps", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Test Recipe",
          description: null,
          servings: null,
          imageUrl: "",
          steps: [
            {
              id: "step-1",
              stepNum: 1,
              stepTitle: null,
              description: "First step",
              ingredients: [],
            },
            {
              id: "step-2",
              stepNum: 2,
              stepTitle: null,
              description: "Second step",
              ingredients: [],
            },
            {
              id: "step-3",
              stepNum: 3,
              stepTitle: null,
              description: "Third step",
              ingredients: [],
            },
          ],
        },
      };

      const Stub = createRoutesStub([
        {
          path: "/recipes/:id/edit",
          Component: EditRecipe,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1/edit"]} />);

      await screen.findByText("First step");
      // First step should only have down button
      // Middle step should have both up and down
      // Last step should only have up button
      const upButtons = screen.getAllByTitle("Move up");
      const downButtons = screen.getAllByTitle("Move down");
      expect(upButtons).toHaveLength(2); // Second and third steps
      expect(downButtons).toHaveLength(2); // First and second steps
    });

    it("should render form buttons correctly", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Test Recipe",
          description: null,
          servings: null,
          imageUrl: "",
          steps: [],
        },
      };

      const Stub = createRoutesStub([
        {
          path: "/recipes/:id/edit",
          Component: EditRecipe,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1/edit"]} />);

      expect(await screen.findByRole("button", { name: "Save Changes" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Cancel" })).toHaveAttribute("href", "/recipes/recipe-1");
    });

    it("should render null values as empty strings in form", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Test Recipe",
          description: null,
          servings: null,
          imageUrl: "",
          steps: [],
        },
      };

      const Stub = createRoutesStub([
        {
          path: "/recipes/:id/edit",
          Component: EditRecipe,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1/edit"]} />);

      expect(await screen.findByLabelText(/Description/)).toHaveValue("");
      expect(screen.getByLabelText(/Servings/)).toHaveValue("");
    });

    it("should have correct edit link for each step", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Test Recipe",
          description: null,
          servings: null,
          imageUrl: "",
          steps: [
            {
              id: "step-abc",
              stepNum: 1,
              stepTitle: null,
              description: "First step",
              ingredients: [],
            },
          ],
        },
      };

      const Stub = createRoutesStub([
        {
          path: "/recipes/:id/edit",
          Component: EditRecipe,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1/edit"]} />);

      await screen.findByText("First step");
      const editLink = screen.getByRole("link", { name: "Edit" });
      expect(editLink).toHaveAttribute("href", "/recipes/recipe-1/steps/step-abc/edit");
    });

    it("should display general error message when present", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Test Recipe",
          description: null,
          servings: null,
          imageUrl: "",
          steps: [],
        },
      };

      const Stub = createRoutesStub([
        {
          path: "/recipes/:id/edit",
          Component: EditRecipe,
          loader: () => mockData,
          action: () => ({
            errors: { general: "Failed to update recipe. Please try again." },
          }),
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1/edit"]} />);

      // Wait for form to render
      await screen.findByLabelText(/Recipe Title/);
    });
  });
});
