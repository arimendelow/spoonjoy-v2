import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Request as UndiciRequest } from "undici";
import { render, screen, within } from "@testing-library/react";
import { createTestRoutesStub } from "../utils";
import { db } from "~/lib/db.server";
import { loader, meta } from "~/routes/_index";
import Index from "~/routes/_index";
import { createUser } from "~/lib/auth.server";
import { sessionStorage } from "~/lib/session.server";
import { cleanupDatabase } from "../helpers/cleanup";
import { faker } from "@faker-js/faker";

describe("Index Route", () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe("loader", () => {
    it("should return null user when not logged in", async () => {
      const request = new UndiciRequest("http://localhost:3000/");

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result).toEqual({ user: null });
    });

    it("should return user data when logged in", async () => {
      const email = faker.internet.email();
      const username = faker.internet.username() + "_" + faker.string.alphanumeric(8);
      const password = "testPassword123";

      const createdUser = await createUser(db, email, username, password);

      const session = await sessionStorage.getSession();
      session.set("userId", createdUser.id);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest("http://localhost:3000/", { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result.user).not.toBeNull();
      expect(result.user.id).toBe(createdUser.id);
      expect(result.user.email).toBe(email.toLowerCase());
      expect(result.user.username).toBe(username);
      expect(result.user).toHaveProperty("createdAt");
    });

    it("should return null user when user id is invalid", async () => {
      const session = await sessionStorage.getSession();
      session.set("userId", "non-existent-user-id");
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest("http://localhost:3000/", { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result.user).toBeNull();
    });
  });

  describe("meta", () => {
    it("should return page metadata", () => {
      const result = meta({} as any);

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ title: "Spoonjoy - Recipe Management" });
      expect(result[1]).toEqual({ name: "description", content: "Manage your recipes with ease" });
    });
  });

  describe("component", () => {
    it("should render guest view when not logged in", async () => {
      const Stub = createTestRoutesStub([
        {
          path: "/",
          Component: Index,
          loader: () => ({ user: null }),
        },
      ]);

      render(<Stub initialEntries={["/"]} />);

      expect(await screen.findByText("Welcome to Spoonjoy v2")).toBeInTheDocument();
      expect(screen.getByText("Your personal recipe management system")).toBeInTheDocument();
      expect(screen.getByText("Get Started")).toBeInTheDocument();
      expect(screen.getByText("Sign up or log in to start managing your recipes")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Sign Up" })).toHaveAttribute("href", "/signup");
      expect(screen.getByRole("link", { name: "Log In" })).toHaveAttribute("href", "/login");
      expect(screen.getByText("Built with React Router v7 on Cloudflare")).toBeInTheDocument();
    });

    it("should render authenticated view when logged in", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
        createdAt: new Date("2024-01-15").toISOString(),
      };

      const Stub = createTestRoutesStub([
        {
          path: "/",
          Component: Index,
          loader: () => ({ user: mockUser }),
        },
      ]);

      render(<Stub initialEntries={["/"]} />);

      expect(await screen.findByText("Welcome to Spoonjoy v2")).toBeInTheDocument();
      // Check the logged in message contains both username and email
      expect(screen.getByText(/Logged in as/)).toBeInTheDocument();
      // Use getAllBy since the email appears multiple times
      expect(screen.getAllByText(/test@example.com/).length).toBeGreaterThan(0);
    });

    it("should render account info for logged in user", async () => {
      const mockUser = {
        id: "user-456",
        email: "chef@example.com",
        username: "chefmaster",
        createdAt: new Date("2024-06-20").toISOString(),
      };

      const Stub = createTestRoutesStub([
        {
          path: "/",
          Component: Index,
          loader: () => ({ user: mockUser }),
        },
      ]);

      render(<Stub initialEntries={["/"]} />);

      expect(await screen.findByText("Account Info")).toBeInTheDocument();
      expect(screen.getByText(/User ID:/)).toBeInTheDocument();
      expect(screen.getByText("user-456")).toBeInTheDocument();
      // Email appears in two places - check for the label
      expect(screen.getByText(/Email:/)).toBeInTheDocument();
      // Username appears in two places - check for the label
      expect(screen.getByText(/Username:/)).toBeInTheDocument();
      expect(screen.getByText(/Member since:/)).toBeInTheDocument();
    });

    it("should render quick links for logged in user", async () => {
      const mockUser = {
        id: "user-789",
        email: "test@example.com",
        username: "testuser",
        createdAt: new Date().toISOString(),
      };

      const Stub = createTestRoutesStub([
        {
          path: "/",
          Component: Index,
          loader: () => ({ user: mockUser }),
        },
      ]);

      render(<Stub initialEntries={["/"]} />);

      expect(await screen.findByText("Quick Links")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /My Recipes/ })).toHaveAttribute("href", "/recipes");
      expect(screen.getByRole("link", { name: /Cookbooks/ })).toHaveAttribute("href", "/cookbooks");
      expect(screen.getByRole("link", { name: /Shopping List/ })).toHaveAttribute("href", "/shopping-list");
      expect(screen.getByRole("link", { name: /Create Recipe/ })).toHaveAttribute("href", "/recipes/new");
    });

    it("should render logout button for logged in user", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
        createdAt: new Date().toISOString(),
      };

      const Stub = createTestRoutesStub([
        {
          path: "/",
          Component: Index,
          loader: () => ({ user: mockUser }),
        },
      ]);

      render(<Stub initialEntries={["/"]} />);

      const logoutButton = await screen.findByRole("button", { name: "Logout" });
      expect(logoutButton).toBeInTheDocument();
      expect(logoutButton.closest("form")).toHaveAttribute("action", "/logout");
    });

    it("should render upcoming features section", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
        createdAt: new Date().toISOString(),
      };

      const Stub = createTestRoutesStub([
        {
          path: "/",
          Component: Index,
          loader: () => ({ user: mockUser }),
        },
      ]);

      render(<Stub initialEntries={["/"]} />);

      expect(await screen.findByText("What's Next?")).toBeInTheDocument();
      expect(screen.getByText("Features coming soon:")).toBeInTheDocument();
      expect(screen.getByText("Recipe sharing and forking")).toBeInTheDocument();
      expect(screen.getByText("Image upload")).toBeInTheDocument();
      expect(screen.getByText("Mobile app")).toBeInTheDocument();
    });
  });
});
