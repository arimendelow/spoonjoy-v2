import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Request as UndiciRequest, FormData as UndiciFormData } from "undici";
import { render, screen } from "@testing-library/react";
import { createTestRoutesStub } from "../utils";
import { db } from "~/lib/db.server";
import { loader, action } from "~/routes/recipes.$id.steps.new";
import NewStep from "~/routes/recipes.$id.steps.new";
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

describe("Recipes $id Steps New Route", () => {
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
      const request = new UndiciRequest(`http://localhost:3000/recipes/${recipeId}/steps/new`);

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

    it("should return recipe data and nextStepNum when logged in as owner", async () => {
      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest(`http://localhost:3000/recipes/${recipeId}/steps/new`, { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId },
      } as any);

      expect(result.recipe).toBeDefined();
      expect(result.recipe.id).toBe(recipeId);
      expect(result.nextStepNum).toBe(1);
    });

    it("should throw 403 when non-owner tries to access", async () => {
      const session = await sessionStorage.getSession();
      session.set("userId", otherUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest(`http://localhost:3000/recipes/${recipeId}/steps/new`, { headers });

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

      const request = new UndiciRequest("http://localhost:3000/recipes/nonexistent-id/steps/new", { headers });

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

      const request = new UndiciRequest(`http://localhost:3000/recipes/${recipeId}/steps/new`, { headers });

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

    it("should calculate correct nextStepNum with existing steps", async () => {
      // Create existing steps
      await db.recipeStep.create({
        data: {
          recipeId,
          stepNum: 1,
          description: "Step 1",
        },
      });

      await db.recipeStep.create({
        data: {
          recipeId,
          stepNum: 2,
          description: "Step 2",
        },
      });

      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest(`http://localhost:3000/recipes/${recipeId}/steps/new`, { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId },
      } as any);

      expect(result.nextStepNum).toBe(3);
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

      return new UndiciRequest(`http://localhost:3000/recipes/${recipeId}/steps/new`, {
        method: "POST",
        body: formData,
        headers,
      });
    }

    it("should redirect when not logged in", async () => {
      const request = await createFormRequest({ description: "Test step" });

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

    it("should throw 403 when non-owner tries to create", async () => {
      const request = await createFormRequest({ description: "Test step" }, otherUserId);

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
      const request = await createFormRequest({ description: "Test step" }, testUserId);

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

    it("should return validation error when description is empty", async () => {
      const request = await createFormRequest({ description: "", stepTitle: "Title" }, testUserId);

      const response = await action({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId },
      } as any);

      const { data, status } = extractResponseData(response);
      expect(status).toBe(400);
      expect(data.errors.description).toBe("Step description is required");
    });

    it("should successfully create step and redirect", async () => {
      const request = await createFormRequest(
        {
          stepTitle: "Prep Work",
          description: "Prepare all ingredients",
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
      expect(response.headers.get("Location")).toMatch(/\/recipes\/[\w-]+\/steps\/[\w-]+\/edit/);

      // Verify step was created
      const steps = await db.recipeStep.findMany({
        where: { recipeId },
      });
      expect(steps).toHaveLength(1);
      expect(steps[0].stepTitle).toBe("Prep Work");
      expect(steps[0].description).toBe("Prepare all ingredients");
      expect(steps[0].stepNum).toBe(1);
    });

    it("should create step without optional title", async () => {
      const request = await createFormRequest(
        {
          description: "Just a description",
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

      // Verify step was created with null title
      const steps = await db.recipeStep.findMany({
        where: { recipeId },
      });
      expect(steps).toHaveLength(1);
      expect(steps[0].stepTitle).toBeNull();
      expect(steps[0].description).toBe("Just a description");
    });

    it("should assign correct step number when adding to existing steps", async () => {
      // Create existing step
      await db.recipeStep.create({
        data: {
          recipeId,
          stepNum: 1,
          description: "Existing step",
        },
      });

      const request = await createFormRequest(
        {
          description: "New step",
        },
        testUserId
      );

      await action({
        request,
        context: { cloudflare: { env: null } },
        params: { id: recipeId },
      } as any);

      // Verify new step has correct step number
      const steps = await db.recipeStep.findMany({
        where: { recipeId },
        orderBy: { stepNum: "asc" },
      });
      expect(steps).toHaveLength(2);
      expect(steps[0].stepNum).toBe(1);
      expect(steps[1].stepNum).toBe(2);
      expect(steps[1].description).toBe("New step");
    });

    it("should return generic error for database errors", async () => {
      // Mock db.recipeStep.create to throw a generic error
      const originalCreate = db.recipeStep.create;
      db.recipeStep.create = vi.fn().mockRejectedValue(new Error("Database connection failed"));

      try {
        const request = await createFormRequest({ description: "Test step" }, testUserId);

        const response = await action({
          request,
          context: { cloudflare: { env: null } },
          params: { id: recipeId },
        } as any);

        const { data, status } = extractResponseData(response);
        expect(status).toBe(500);
        expect(data.errors.general).toBe("Failed to create step. Please try again.");
      } finally {
        // Restore original function
        db.recipeStep.create = originalCreate;
      }
    });
  });

  describe("component", () => {
    it("should render add step form", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Test Recipe",
        },
        nextStepNum: 1,
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id/steps/new",
          Component: NewStep,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1/steps/new"]} />);

      expect(await screen.findByRole("heading", { name: /Add Step to Test Recipe/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Step Title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Create Step & Add Ingredients/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /← Back to recipe/i })).toHaveAttribute("href", "/recipes/recipe-1/edit");
      expect(screen.getByRole("link", { name: /Cancel/i })).toHaveAttribute("href", "/recipes/recipe-1/edit");
    });

    it("should display step number info", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Test Recipe",
        },
        nextStepNum: 5,
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id/steps/new",
          Component: NewStep,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1/steps/new"]} />);

      expect(await screen.findByText(/Step Number:/)).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("should display general error when present", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Test Recipe",
        },
        nextStepNum: 1,
      };

      const mockActionData = {
        errors: {
          general: "Failed to create step. Please try again.",
        },
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id/steps/new",
          Component: NewStep,
          loader: () => mockData,
          action: () => mockActionData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1/steps/new"]} />);

      // Submit the form to trigger action
      const form = await screen.findByRole("button", { name: /Create Step & Add Ingredients/i });
      expect(form).toBeInTheDocument();
    });

    it("should display description validation error when present", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Test Recipe",
        },
        nextStepNum: 1,
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id/steps/new",
          Component: NewStep,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1/steps/new"]} />);

      const descriptionInput = await screen.findByLabelText(/Description/i);
      expect(descriptionInput).toBeInTheDocument();
      expect(descriptionInput).toHaveAttribute("required");
    });

    it("should have correct form attributes", async () => {
      const mockData = {
        recipe: {
          id: "recipe-1",
          title: "Test Recipe",
        },
        nextStepNum: 1,
      };

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id/steps/new",
          Component: NewStep,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/recipes/recipe-1/steps/new"]} />);

      const form = (await screen.findByRole("button", { name: /Create Step & Add Ingredients/i })).closest("form");
      expect(form).toHaveAttribute("method", "post");

      const stepTitleInput = screen.getByLabelText(/Step Title/i);
      expect(stepTitleInput).toHaveAttribute("type", "text");
      expect(stepTitleInput).toHaveAttribute("name", "stepTitle");
    });
  });
});
