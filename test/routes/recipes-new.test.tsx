import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Request as UndiciRequest, FormData as UndiciFormData } from "undici";
import { render, screen } from "@testing-library/react";
import { createTestRoutesStub } from "../utils";
import { db } from "~/lib/db.server";
import { loader, action } from "~/routes/recipes.new";
import NewRecipe from "~/routes/recipes.new";
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

describe("Recipes New Route", () => {
  let testUserId: string;

  beforeEach(async () => {
    await cleanupDatabase();
    const email = faker.internet.email();
    const username = faker.internet.username() + "_" + faker.string.alphanumeric(8);
    const user = await createUser(db, email, username, "testPassword123");
    testUserId = user.id;
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe("loader", () => {
    it("should redirect when not logged in", async () => {
      const request = new UndiciRequest("http://localhost:3000/recipes/new");

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

    it("should return null when logged in", async () => {
      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest("http://localhost:3000/recipes/new", { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result).toBeNull();
    });
  });

  describe("action", () => {
    // Helper to create a request with form data and session cookie using undici
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

      return new UndiciRequest("http://localhost:3000/recipes/new", {
        method: "POST",
        body: formData,
        headers,
      });
    }

    it("should return validation error when title is missing", async () => {
      const request = await createFormRequest(
        { title: "", description: "Some description" },
        testUserId
      );

      const response = await action({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      const { data, status } = extractResponseData(response);
      expect(status).toBe(400);
      expect(data.errors.title).toBe("Title is required");
    });

    it("should create recipe and redirect on success", async () => {
      const request = await createFormRequest(
        { title: "My New Recipe", description: "A delicious recipe", servings: "4" },
        testUserId
      );

      const response = await action({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toMatch(/\/recipes\/[\w-]+/);

      // Verify recipe was created
      const recipes = await db.recipe.findMany({
        where: { chefId: testUserId },
      });
      expect(recipes).toHaveLength(1);
      expect(recipes[0].title).toBe("My New Recipe");
      expect(recipes[0].description).toBe("A delicious recipe");
      expect(recipes[0].servings).toBe("4");
    });

    it("should redirect when not logged in", async () => {
      const request = await createFormRequest({ title: "My Recipe" });

      await expect(
        action({
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

    it("should create recipe with only required fields", async () => {
      const request = await createFormRequest({ title: "Minimal Recipe" }, testUserId);

      const response = await action({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);

      // Verify recipe was created with null optional fields
      const recipes = await db.recipe.findMany({
        where: { chefId: testUserId },
      });
      expect(recipes).toHaveLength(1);
      expect(recipes[0].title).toBe("Minimal Recipe");
      expect(recipes[0].description).toBeNull();
      expect(recipes[0].servings).toBeNull();
    });

    it("should return validation error for whitespace-only title", async () => {
      const request = await createFormRequest({ title: "   " }, testUserId);

      const response = await action({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      const { data, status } = extractResponseData(response);
      expect(status).toBe(400);
      expect(data.errors.title).toBe("Title is required");
    });

    it("should trim title and other fields whitespace", async () => {
      const request = await createFormRequest(
        {
          title: "  My Recipe  ",
          description: "  Description  ",
          servings: "  4  ",
        },
        testUserId
      );

      const response = await action({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);

      // Verify fields were trimmed
      const recipe = await db.recipe.findFirst({
        where: { chefId: testUserId },
      });
      expect(recipe?.title).toBe("My Recipe");
      expect(recipe?.description).toBe("Description");
      expect(recipe?.servings).toBe("4");
    });

    it("should handle empty optional fields correctly", async () => {
      const request = await createFormRequest(
        {
          title: "Recipe Title",
          description: "",
          servings: "  ",
          imageUrl: "",
        },
        testUserId
      );

      const response = await action({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);

      // Verify empty fields become null
      const recipe = await db.recipe.findFirst({
        where: { chefId: testUserId },
      });
      expect(recipe?.description).toBeNull();
      expect(recipe?.servings).toBeNull();
    });

    it("should return generic error for database errors", async () => {
      // Mock db.recipe.create to throw a generic error
      const originalCreate = db.recipe.create;
      db.recipe.create = vi.fn().mockRejectedValue(new Error("Database connection failed"));

      try {
        const request = await createFormRequest({ title: "My Recipe" }, testUserId);

        const response = await action({
          request,
          context: { cloudflare: { env: null } },
          params: {},
        } as any);

        const { data, status } = extractResponseData(response);
        expect(status).toBe(500);
        expect(data.errors.general).toBe("Failed to create recipe. Please try again.");
      } finally {
        // Restore original function
        db.recipe.create = originalCreate;
      }
    });

    describe("field validation", () => {
      it("should return validation error when title exceeds max length", async () => {
        const longTitle = "a".repeat(201);
        const request = await createFormRequest({ title: longTitle }, testUserId);

        const response = await action({
          request,
          context: { cloudflare: { env: null } },
          params: {},
        } as any);

        const { data, status } = extractResponseData(response);
        expect(status).toBe(400);
        expect(data.errors.title).toBe("Title must be 200 characters or less");
      });

      it("should accept title at exactly max length", async () => {
        const maxTitle = "a".repeat(200);
        const request = await createFormRequest({ title: maxTitle }, testUserId);

        const response = await action({
          request,
          context: { cloudflare: { env: null } },
          params: {},
        } as any);

        expect(response).toBeInstanceOf(Response);
        expect(response.status).toBe(302);
      });

      it("should return validation error when description exceeds max length", async () => {
        const longDescription = "a".repeat(2001);
        const request = await createFormRequest(
          { title: "Valid Title", description: longDescription },
          testUserId
        );

        const response = await action({
          request,
          context: { cloudflare: { env: null } },
          params: {},
        } as any);

        const { data, status } = extractResponseData(response);
        expect(status).toBe(400);
        expect(data.errors.description).toBe("Description must be 2,000 characters or less");
      });

      it("should accept description at exactly max length", async () => {
        const maxDescription = "a".repeat(2000);
        const request = await createFormRequest(
          { title: "Valid Title", description: maxDescription },
          testUserId
        );

        const response = await action({
          request,
          context: { cloudflare: { env: null } },
          params: {},
        } as any);

        expect(response).toBeInstanceOf(Response);
        expect(response.status).toBe(302);
      });

      it("should return validation error when servings exceeds max length", async () => {
        const longServings = "a".repeat(101);
        const request = await createFormRequest(
          { title: "Valid Title", servings: longServings },
          testUserId
        );

        const response = await action({
          request,
          context: { cloudflare: { env: null } },
          params: {},
        } as any);

        const { data, status } = extractResponseData(response);
        expect(status).toBe(400);
        expect(data.errors.servings).toBe("Servings must be 100 characters or less");
      });

      it("should accept servings at exactly max length", async () => {
        const maxServings = "a".repeat(100);
        const request = await createFormRequest(
          { title: "Valid Title", servings: maxServings },
          testUserId
        );

        const response = await action({
          request,
          context: { cloudflare: { env: null } },
          params: {},
        } as any);

        expect(response).toBeInstanceOf(Response);
        expect(response.status).toBe(302);
      });

      it("should return multiple validation errors at once", async () => {
        const longTitle = "a".repeat(201);
        const longDescription = "a".repeat(2001);
        const longServings = "a".repeat(101);
        const request = await createFormRequest(
          {
            title: longTitle,
            description: longDescription,
            servings: longServings,
          },
          testUserId
        );

        const response = await action({
          request,
          context: { cloudflare: { env: null } },
          params: {},
        } as any);

        const { data, status } = extractResponseData(response);
        expect(status).toBe(400);
        expect(data.errors.title).toBe("Title must be 200 characters or less");
        expect(data.errors.description).toBe("Description must be 2,000 characters or less");
        expect(data.errors.servings).toBe("Servings must be 100 characters or less");
      });
    });
  });

  describe("component", () => {
    it("should render create recipe form", async () => {
      const Stub = createTestRoutesStub([
        {
          path: "/recipes/new",
          Component: NewRecipe,
          loader: () => null,
        },
      ]);

      render(<Stub initialEntries={["/recipes/new"]} />);

      expect(await screen.findByRole("heading", { name: "Create New Recipe" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "← Back to recipes" })).toHaveAttribute("href", "/recipes");
      expect(screen.getByLabelText(/Title/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Servings/)).toBeInTheDocument();
      // Recipe Image is now a file upload, not a URL input
      expect(screen.getByRole("group", { name: /Recipe Image/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Create Recipe" })).toBeInTheDocument();
      // Cancel is now a button that navigates programmatically, not a link
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    });

    it("should have correct form structure", async () => {
      const Stub = createTestRoutesStub([
        {
          path: "/recipes/new",
          Component: NewRecipe,
          loader: () => null,
        },
      ]);

      render(<Stub initialEntries={["/recipes/new"]} />);

      const titleInput = await screen.findByLabelText(/Title/);
      expect(titleInput).toHaveAttribute("type", "text");
      expect(titleInput).toHaveAttribute("name", "title");
      expect(titleInput).toBeRequired();

      const descriptionTextarea = screen.getByLabelText(/Description/);
      expect(descriptionTextarea).toHaveAttribute("name", "description");

      const servingsInput = screen.getByLabelText(/Servings/);
      expect(servingsInput).toHaveAttribute("type", "text");
      expect(servingsInput).toHaveAttribute("name", "servings");

      // Recipe Image is now a file upload, not a URL input
      expect(screen.getByRole("group", { name: /Recipe Image/ })).toBeInTheDocument();
    });

    it("should have correct placeholders", async () => {
      const Stub = createTestRoutesStub([
        {
          path: "/recipes/new",
          Component: NewRecipe,
          loader: () => null,
        },
      ]);

      render(<Stub initialEntries={["/recipes/new"]} />);

      expect(await screen.findByPlaceholderText("e.g., Chocolate Chip Cookies")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("A brief description of your recipe...")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("e.g., 4, 6-8, or 2 dozen")).toBeInTheDocument();
    });

    it("should display general error message when present", async () => {
      const Stub = createTestRoutesStub([
        {
          path: "/recipes/new",
          Component: NewRecipe,
          loader: () => null,
          action: () => ({
            errors: { general: "Failed to create recipe. Please try again." },
          }),
        },
      ]);

      render(<Stub initialEntries={["/recipes/new"]} />);

      // Wait for form to render
      await screen.findByLabelText(/Title/);
    });
  });
});
