import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Request as UndiciRequest } from "undici";
import { render, screen, fireEvent } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { db } from "~/lib/db.server";
import { loader } from "~/routes/recipes._index";
import RecipesList from "~/routes/recipes._index";
import { createUser } from "~/lib/auth.server";
import { sessionStorage } from "~/lib/session.server";
import { cleanupDatabase } from "../helpers/cleanup";
import { faker } from "@faker-js/faker";

describe("Recipes Index Route", () => {
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
      const request = new UndiciRequest("http://localhost:3000/recipes");

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

    it("should return empty recipes array when user has no recipes", async () => {
      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest("http://localhost:3000/recipes", { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result.recipes).toEqual([]);
    });

    it("should return user recipes ordered by updatedAt desc", async () => {
      // Create recipes with different updatedAt times
      const recipe1 = await db.recipe.create({
        data: {
          title: "Recipe 1 " + faker.string.alphanumeric(6),
          chefId: testUserId,
          updatedAt: new Date("2024-01-01"),
        },
      });

      const recipe2 = await db.recipe.create({
        data: {
          title: "Recipe 2 " + faker.string.alphanumeric(6),
          chefId: testUserId,
          updatedAt: new Date("2024-01-03"),
        },
      });

      const recipe3 = await db.recipe.create({
        data: {
          title: "Recipe 3 " + faker.string.alphanumeric(6),
          chefId: testUserId,
          updatedAt: new Date("2024-01-02"),
        },
      });

      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest("http://localhost:3000/recipes", { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result.recipes).toHaveLength(3);
      // Should be ordered by updatedAt desc: recipe2, recipe3, recipe1
      expect(result.recipes[0].id).toBe(recipe2.id);
      expect(result.recipes[1].id).toBe(recipe3.id);
      expect(result.recipes[2].id).toBe(recipe1.id);
    });

    it("should only return current user recipes", async () => {
      // Create another user
      const otherEmail = faker.internet.email();
      const otherUsername = faker.internet.username() + "_" + faker.string.alphanumeric(8);
      const otherUser = await createUser(db, otherEmail, otherUsername, "testPassword123");

      // Create recipe for current user
      await db.recipe.create({
        data: {
          title: "My Recipe " + faker.string.alphanumeric(6),
          chefId: testUserId,
        },
      });

      // Create recipe for other user
      await db.recipe.create({
        data: {
          title: "Other Recipe " + faker.string.alphanumeric(6),
          chefId: otherUser.id,
        },
      });

      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest("http://localhost:3000/recipes", { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result.recipes).toHaveLength(1);
      expect(result.recipes[0].title).toContain("My Recipe");
    });

    it("should exclude soft-deleted recipes", async () => {
      // Create an active recipe
      await db.recipe.create({
        data: {
          title: "Active Recipe " + faker.string.alphanumeric(6),
          chefId: testUserId,
        },
      });

      // Create a soft-deleted recipe
      await db.recipe.create({
        data: {
          title: "Deleted Recipe " + faker.string.alphanumeric(6),
          chefId: testUserId,
          deletedAt: new Date(),
        },
      });

      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest("http://localhost:3000/recipes", { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result.recipes).toHaveLength(1);
      expect(result.recipes[0].title).toContain("Active Recipe");
    });

    it("should return recipe with all expected fields", async () => {
      await db.recipe.create({
        data: {
          title: "Test Recipe",
          description: "Test Description",
          servings: "4",
          imageUrl: "https://example.com/image.jpg",
          chefId: testUserId,
        },
      });

      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest("http://localhost:3000/recipes", { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result.recipes).toHaveLength(1);
      const recipe = result.recipes[0];
      expect(recipe.id).toBeDefined();
      expect(recipe.title).toBe("Test Recipe");
      expect(recipe.description).toBe("Test Description");
      expect(recipe.servings).toBe("4");
      expect(recipe.imageUrl).toBe("https://example.com/image.jpg");
      expect(recipe.createdAt).toBeDefined();
      expect(recipe.updatedAt).toBeDefined();
    });
  });

  describe("component", () => {
    it("should render empty state when no recipes", async () => {
      const Stub = createRoutesStub([
        {
          path: "/recipes",
          Component: RecipesList,
          loader: () => ({ recipes: [] }),
        },
      ]);

      render(<Stub initialEntries={["/recipes"]} />);

      expect(await screen.findByText("My Recipes")).toBeInTheDocument();
      expect(screen.getByText("0 recipes")).toBeInTheDocument();
      expect(screen.getByText("No recipes yet")).toBeInTheDocument();
      expect(screen.getByText("Create your first recipe to get started")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Create Recipe" })).toHaveAttribute("href", "/recipes/new");
    });

    it("should render recipe list when recipes exist", async () => {
      const mockRecipes = [
        {
          id: "recipe-1",
          title: "Spaghetti Bolognese",
          description: "A classic Italian pasta dish",
          servings: "4",
          imageUrl: "https://example.com/spaghetti.jpg",
        },
        {
          id: "recipe-2",
          title: "Chicken Curry",
          description: null,
          servings: null,
          imageUrl: null,
        },
      ];

      const Stub = createRoutesStub([
        {
          path: "/recipes",
          Component: RecipesList,
          loader: () => ({ recipes: mockRecipes }),
        },
      ]);

      render(<Stub initialEntries={["/recipes"]} />);

      expect(await screen.findByText("My Recipes")).toBeInTheDocument();
      expect(screen.getByText("2 recipes")).toBeInTheDocument();
      expect(screen.getByText("Spaghetti Bolognese")).toBeInTheDocument();
      expect(screen.getByText("A classic Italian pasta dish")).toBeInTheDocument();
      expect(screen.getByText("Servings: 4")).toBeInTheDocument();
      expect(screen.getByText("Chicken Curry")).toBeInTheDocument();
    });

    it("should show singular recipe count", async () => {
      const Stub = createRoutesStub([
        {
          path: "/recipes",
          Component: RecipesList,
          loader: () => ({
            recipes: [{ id: "1", title: "Single Recipe", description: null, servings: null, imageUrl: null }],
          }),
        },
      ]);

      render(<Stub initialEntries={["/recipes"]} />);

      expect(await screen.findByText("1 recipe")).toBeInTheDocument();
    });

    it("should have correct links to recipe details and actions", async () => {
      const mockRecipes = [
        {
          id: "recipe-123",
          title: "Test Recipe",
          description: null,
          servings: null,
          imageUrl: null,
        },
      ];

      const Stub = createRoutesStub([
        {
          path: "/recipes",
          Component: RecipesList,
          loader: () => ({ recipes: mockRecipes }),
        },
      ]);

      render(<Stub initialEntries={["/recipes"]} />);

      expect(await screen.findByText("Test Recipe")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
      expect(screen.getByRole("link", { name: "+ New Recipe" })).toHaveAttribute("href", "/recipes/new");
      // Recipe card link
      const recipeLink = screen.getByRole("link", { name: /Test Recipe/ });
      expect(recipeLink).toHaveAttribute("href", "/recipes/recipe-123");
    });

    it("should render recipe without optional description", async () => {
      const mockRecipes = [
        {
          id: "recipe-1",
          title: "No Desc Recipe",
          description: null,
          servings: "2",
          imageUrl: "https://example.com/image.jpg",
        },
      ];

      const Stub = createRoutesStub([
        {
          path: "/recipes",
          Component: RecipesList,
          loader: () => ({ recipes: mockRecipes }),
        },
      ]);

      render(<Stub initialEntries={["/recipes"]} />);

      expect(await screen.findByText("No Desc Recipe")).toBeInTheDocument();
      expect(screen.getByText("Servings: 2")).toBeInTheDocument();
      // There should be only 2 text elements in the card content: title and servings
      // No description paragraph should be rendered
      const servingsText = screen.getByText("Servings: 2");
      expect(servingsText.previousElementSibling?.tagName).toBe("H3");
    });

    it("should render recipe without optional servings", async () => {
      const mockRecipes = [
        {
          id: "recipe-1",
          title: "Recipe Without Servings",
          description: "Has a description",
          servings: null,
          imageUrl: "https://example.com/image.jpg",
        },
      ];

      const Stub = createRoutesStub([
        {
          path: "/recipes",
          Component: RecipesList,
          loader: () => ({ recipes: mockRecipes }),
        },
      ]);

      render(<Stub initialEntries={["/recipes"]} />);

      expect(await screen.findByText("Recipe Without Servings")).toBeInTheDocument();
      expect(screen.getByText("Has a description")).toBeInTheDocument();
      // Servings should not be rendered
      expect(screen.queryByText(/Servings:/i)).not.toBeInTheDocument();
    });

    it("should handle mouse hover events on recipe cards", async () => {
      const mockRecipes = [
        {
          id: "recipe-1",
          title: "Hover Test Recipe",
          description: null,
          servings: null,
          imageUrl: null,
        },
      ];

      const Stub = createRoutesStub([
        {
          path: "/recipes",
          Component: RecipesList,
          loader: () => ({ recipes: mockRecipes }),
        },
      ]);

      render(<Stub initialEntries={["/recipes"]} />);

      const recipeLink = await screen.findByRole("link", { name: /Hover Test Recipe/ });

      // Test mouseEnter event
      fireEvent.mouseEnter(recipeLink);
      expect(recipeLink.style.boxShadow).toBe("0 4px 8px rgba(0,0,0,0.1)");

      // Test mouseLeave event
      fireEvent.mouseLeave(recipeLink);
      expect(recipeLink.style.boxShadow).toBe("none");
    });
  });
});
