import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Request as UndiciRequest } from "undici";
import { render, screen, fireEvent } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { db } from "~/lib/db.server";
import { loader } from "~/routes/cookbooks._index";
import CookbooksList from "~/routes/cookbooks._index";
import { createUser } from "~/lib/auth.server";
import { sessionStorage } from "~/lib/session.server";
import { cleanupDatabase } from "../helpers/cleanup";
import { faker } from "@faker-js/faker";

describe("Cookbooks Index Route", () => {
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
      const request = new UndiciRequest("http://localhost:3000/cookbooks");

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

    it("should return empty cookbooks array when user has no cookbooks", async () => {
      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest("http://localhost:3000/cookbooks", { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result.cookbooks).toEqual([]);
    });

    it("should return cookbooks with recipe counts", async () => {
      // Create cookbooks for the user
      const cookbook1 = await db.cookbook.create({
        data: {
          title: "Breakfast Recipes",
          authorId: testUserId,
        },
      });

      const cookbook2 = await db.cookbook.create({
        data: {
          title: "Dinner Ideas",
          authorId: testUserId,
        },
      });

      // Create recipes and add them to cookbook1
      const recipe = await db.recipe.create({
        data: {
          title: "Pancakes",
          chefId: testUserId,
        },
      });

      await db.recipeInCookbook.create({
        data: {
          cookbookId: cookbook1.id,
          recipeId: recipe.id,
          addedById: testUserId,
        },
      });

      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest("http://localhost:3000/cookbooks", { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result.cookbooks).toHaveLength(2);

      // Find the cookbook with recipes
      const breakfastCookbook = result.cookbooks.find((c: any) => c.title === "Breakfast Recipes");
      const dinnerCookbook = result.cookbooks.find((c: any) => c.title === "Dinner Ideas");

      expect(breakfastCookbook._count.recipes).toBe(1);
      expect(dinnerCookbook._count.recipes).toBe(0);
    });

    it("should only return current user cookbooks", async () => {
      // Create another user
      const otherEmail = faker.internet.email();
      const otherUsername = faker.internet.username() + "_" + faker.string.alphanumeric(8);
      const otherUser = await createUser(db, otherEmail, otherUsername, "testPassword123");

      // Create cookbook for current user
      await db.cookbook.create({
        data: {
          title: "My Cookbook",
          authorId: testUserId,
        },
      });

      // Create cookbook for other user
      await db.cookbook.create({
        data: {
          title: "Other Cookbook",
          authorId: otherUser.id,
        },
      });

      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest("http://localhost:3000/cookbooks", { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result.cookbooks).toHaveLength(1);
      expect(result.cookbooks[0].title).toBe("My Cookbook");
    });

    it("should return cookbooks ordered by updatedAt desc", async () => {
      // Create cookbooks with different updatedAt times
      await db.cookbook.create({
        data: {
          title: "Old Cookbook",
          authorId: testUserId,
          updatedAt: new Date("2024-01-01"),
        },
      });

      await db.cookbook.create({
        data: {
          title: "Newest Cookbook",
          authorId: testUserId,
          updatedAt: new Date("2024-01-03"),
        },
      });

      await db.cookbook.create({
        data: {
          title: "Middle Cookbook",
          authorId: testUserId,
          updatedAt: new Date("2024-01-02"),
        },
      });

      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest("http://localhost:3000/cookbooks", { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result.cookbooks).toHaveLength(3);
      // Should be ordered by updatedAt desc
      expect(result.cookbooks[0].title).toBe("Newest Cookbook");
      expect(result.cookbooks[1].title).toBe("Middle Cookbook");
      expect(result.cookbooks[2].title).toBe("Old Cookbook");
    });
  });

  describe("component", () => {
    it("should render empty state when no cookbooks", async () => {
      const Stub = createRoutesStub([
        {
          path: "/cookbooks",
          Component: CookbooksList,
          loader: () => ({ cookbooks: [] }),
        },
      ]);

      render(<Stub initialEntries={["/cookbooks"]} />);

      expect(await screen.findByText("My Cookbooks")).toBeInTheDocument();
      expect(screen.getByText("0 cookbooks")).toBeInTheDocument();
      expect(screen.getByText("No cookbooks yet")).toBeInTheDocument();
      expect(screen.getByText("Create your first cookbook to organize your recipes")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Create Cookbook" })).toHaveAttribute("href", "/cookbooks/new");
    });

    it("should render cookbook list when cookbooks exist", async () => {
      const mockCookbooks = [
        {
          id: "cookbook-1",
          title: "Breakfast Recipes",
          _count: { recipes: 5 },
        },
        {
          id: "cookbook-2",
          title: "Dinner Ideas",
          _count: { recipes: 0 },
        },
      ];

      const Stub = createRoutesStub([
        {
          path: "/cookbooks",
          Component: CookbooksList,
          loader: () => ({ cookbooks: mockCookbooks }),
        },
      ]);

      render(<Stub initialEntries={["/cookbooks"]} />);

      expect(await screen.findByText("My Cookbooks")).toBeInTheDocument();
      expect(screen.getByText("2 cookbooks")).toBeInTheDocument();
      expect(screen.getByText("Breakfast Recipes")).toBeInTheDocument();
      expect(screen.getByText("Dinner Ideas")).toBeInTheDocument();
      expect(screen.getByText("5 recipes")).toBeInTheDocument();
      expect(screen.getByText("0 recipes")).toBeInTheDocument();
    });

    it("should show singular cookbook count", async () => {
      const Stub = createRoutesStub([
        {
          path: "/cookbooks",
          Component: CookbooksList,
          loader: () => ({
            cookbooks: [{ id: "1", title: "Single", _count: { recipes: 1 } }],
          }),
        },
      ]);

      render(<Stub initialEntries={["/cookbooks"]} />);

      expect(await screen.findByText("1 cookbook")).toBeInTheDocument();
      expect(screen.getByText("1 recipe")).toBeInTheDocument();
    });

    it("should have correct links to cookbook details and actions", async () => {
      const mockCookbooks = [
        {
          id: "cookbook-123",
          title: "Test Cookbook",
          _count: { recipes: 2 },
        },
      ];

      const Stub = createRoutesStub([
        {
          path: "/cookbooks",
          Component: CookbooksList,
          loader: () => ({ cookbooks: mockCookbooks }),
        },
      ]);

      render(<Stub initialEntries={["/cookbooks"]} />);

      expect(await screen.findByText("Test Cookbook")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
      expect(screen.getByRole("link", { name: "+ New Cookbook" })).toHaveAttribute("href", "/cookbooks/new");
      // Cookbook card link
      const cookbookLink = screen.getByRole("link", { name: /Test Cookbook/ });
      expect(cookbookLink).toHaveAttribute("href", "/cookbooks/cookbook-123");
    });

    it("should handle mouse hover events on cookbook cards", async () => {
      const mockCookbooks = [
        {
          id: "cookbook-1",
          title: "Hover Test Cookbook",
          _count: { recipes: 3 },
        },
      ];

      const Stub = createRoutesStub([
        {
          path: "/cookbooks",
          Component: CookbooksList,
          loader: () => ({ cookbooks: mockCookbooks }),
        },
      ]);

      render(<Stub initialEntries={["/cookbooks"]} />);

      const cookbookLink = await screen.findByRole("link", { name: /Hover Test Cookbook/ });

      // Test mouseEnter event
      fireEvent.mouseEnter(cookbookLink);
      expect(cookbookLink.style.boxShadow).toBe("0 4px 8px rgba(0,102,204,0.2)");

      // Test mouseLeave event
      fireEvent.mouseLeave(cookbookLink);
      expect(cookbookLink.style.boxShadow).toBe("none");
    });
  });
});
