import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Request as UndiciRequest } from "undici";
import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { db } from "~/lib/db.server";
import { loader } from "~/routes/recipes";
import Recipes from "~/routes/recipes";
import { createUser } from "~/lib/auth.server";
import { sessionStorage } from "~/lib/session.server";
import { cleanupDatabase } from "../helpers/cleanup";
import { faker } from "@faker-js/faker";

describe("Recipes Layout Route", () => {
  let testUserId: string;
  let testUserEmail: string;
  let testUserUsername: string;

  beforeEach(async () => {
    await cleanupDatabase();
    testUserEmail = faker.internet.email();
    testUserUsername = faker.internet.username() + "_" + faker.string.alphanumeric(8);
    const user = await createUser(db, testUserEmail, testUserUsername, "testPassword123");
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

    it("should return user and empty recipes when logged in", async () => {
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

      expect(result.user).not.toBeNull();
      expect(result.user.username).toBe(testUserUsername);
      expect(result.recipes).toEqual([]);
    });

    it("should return user and recipes when logged in with recipes", async () => {
      // Create some recipes for the user
      await db.recipe.create({
        data: {
          title: "Test Recipe 1",
          description: "Description 1",
          chefId: testUserId,
        },
      });

      await db.recipe.create({
        data: {
          title: "Test Recipe 2",
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

      expect(result.user).not.toBeNull();
      expect(result.recipes).toHaveLength(2);
      expect(result.recipes[0]).toHaveProperty("title");
      expect(result.recipes[0]).toHaveProperty("description");
    });

    it("should not return deleted recipes", async () => {
      // Create a regular recipe
      await db.recipe.create({
        data: {
          title: "Active Recipe",
          chefId: testUserId,
        },
      });

      // Create a soft-deleted recipe
      await db.recipe.create({
        data: {
          title: "Deleted Recipe",
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
      expect(result.recipes[0].title).toBe("Active Recipe");
    });

    it("should throw 404 when user not found", async () => {
      // Create session with valid session but then delete the user
      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      // Delete the user (and their recipes to avoid FK constraint)
      await db.recipe.deleteMany({ where: { chefId: testUserId } });
      await db.user.delete({ where: { id: testUserId } });

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest("http://localhost:3000/recipes", { headers });

      await expect(
        loader({
          request,
          context: { cloudflare: { env: null } },
          params: {},
        } as any)
      ).rejects.toSatisfy((error: any) => {
        expect(error).toBeInstanceOf(Response);
        expect(error.status).toBe(404);
        return true;
      });
    });

    it("should return recipes ordered by createdAt desc", async () => {
      // Create recipes with different createdAt times
      const recipe1 = await db.recipe.create({
        data: {
          title: "Old Recipe",
          chefId: testUserId,
          createdAt: new Date("2024-01-01"),
        },
      });

      const recipe2 = await db.recipe.create({
        data: {
          title: "Newest Recipe",
          chefId: testUserId,
          createdAt: new Date("2024-01-03"),
        },
      });

      const recipe3 = await db.recipe.create({
        data: {
          title: "Middle Recipe",
          chefId: testUserId,
          createdAt: new Date("2024-01-02"),
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
      // Should be ordered by createdAt desc
      expect(result.recipes[0].id).toBe(recipe2.id);
      expect(result.recipes[1].id).toBe(recipe3.id);
      expect(result.recipes[2].id).toBe(recipe1.id);
    });
  });

  describe("component", () => {
    it("should render empty state when no recipes", async () => {
      const Stub = createRoutesStub([
        {
          path: "/recipes",
          Component: Recipes,
          loader: () => ({
            user: { username: "testuser" },
            recipes: [],
          }),
        },
      ]);

      render(<Stub initialEntries={["/recipes"]} />);

      expect(await screen.findByText("My Recipes")).toBeInTheDocument();
      expect(screen.getByText("Welcome back, testuser!")).toBeInTheDocument();
      expect(screen.getByText("No recipes yet")).toBeInTheDocument();
      expect(screen.getByText("Start building your recipe collection!")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Create Your First Recipe" })).toBeInTheDocument();
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
          imageUrl: "https://example.com/curry.jpg",
        },
      ];

      const Stub = createRoutesStub([
        {
          path: "/recipes",
          Component: Recipes,
          loader: () => ({
            user: { username: "chef123" },
            recipes: mockRecipes,
          }),
        },
      ]);

      render(<Stub initialEntries={["/recipes"]} />);

      expect(await screen.findByText("My Recipes")).toBeInTheDocument();
      expect(screen.getByText("Welcome back, chef123!")).toBeInTheDocument();
      expect(screen.getByText("Spaghetti Bolognese")).toBeInTheDocument();
      expect(screen.getByText("A classic Italian pasta dish")).toBeInTheDocument();
      expect(screen.getByText("Servings: 4")).toBeInTheDocument();
      expect(screen.getByText("Chicken Curry")).toBeInTheDocument();
    });

    it("should render logout button", async () => {
      const Stub = createRoutesStub([
        {
          path: "/recipes",
          Component: Recipes,
          loader: () => ({
            user: { username: "testuser" },
            recipes: [],
          }),
        },
      ]);

      render(<Stub initialEntries={["/recipes"]} />);

      const logoutButton = await screen.findByRole("button", { name: "Log Out" });
      expect(logoutButton).toBeInTheDocument();
      expect(logoutButton.closest("form")).toHaveAttribute("action", "/logout");
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
          Component: Recipes,
          loader: () => ({
            user: { username: "testuser" },
            recipes: mockRecipes,
          }),
        },
      ]);

      render(<Stub initialEntries={["/recipes"]} />);

      expect(await screen.findByText("No Desc Recipe")).toBeInTheDocument();
      expect(screen.getByText("Servings: 2")).toBeInTheDocument();
      // Verify servings is directly after h3 (no description in between)
      const servingsText = screen.getByText("Servings: 2");
      expect(servingsText.previousElementSibling?.tagName).toBe("H3");
    });

    it("should render recipe without optional servings", async () => {
      const mockRecipes = [
        {
          id: "recipe-1",
          title: "No Servings Recipe",
          description: "Has a description",
          servings: null,
          imageUrl: "https://example.com/image.jpg",
        },
      ];

      const Stub = createRoutesStub([
        {
          path: "/recipes",
          Component: Recipes,
          loader: () => ({
            user: { username: "testuser" },
            recipes: mockRecipes,
          }),
        },
      ]);

      render(<Stub initialEntries={["/recipes"]} />);

      expect(await screen.findByText("No Servings Recipe")).toBeInTheDocument();
      expect(screen.getByText("Has a description")).toBeInTheDocument();
      // Servings should not be rendered
      expect(screen.queryByText(/Servings:/i)).not.toBeInTheDocument();
    });

    it("should render recipe image with correct alt text", async () => {
      const mockRecipes = [
        {
          id: "recipe-1",
          title: "Image Test Recipe",
          description: null,
          servings: null,
          imageUrl: "https://example.com/test-image.jpg",
        },
      ];

      const Stub = createRoutesStub([
        {
          path: "/recipes",
          Component: Recipes,
          loader: () => ({
            user: { username: "testuser" },
            recipes: mockRecipes,
          }),
        },
      ]);

      render(<Stub initialEntries={["/recipes"]} />);

      const image = await screen.findByAltText("Image Test Recipe");
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", "https://example.com/test-image.jpg");
    });
  });
});
