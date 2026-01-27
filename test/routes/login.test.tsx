import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Request as UndiciRequest } from "undici";
import { render, screen } from "@testing-library/react";
import { createTestRoutesStub } from "../utils";
import { db } from "~/lib/db.server";
import { loader, action } from "~/routes/login";
import Login from "~/routes/login";
import { createUser } from "~/lib/auth.server";
import { sessionStorage } from "~/lib/session.server";
import { cleanupDatabase } from "../helpers/cleanup";
import { faker } from "@faker-js/faker";

// Helper to extract data from React Router's data() response
function extractResponseData(response: any): { data: any; status: number } {
  // React Router v7 data() returns DataWithResponseInit object with type, data, and init properties
  if (response && typeof response === "object" && response.type === "DataWithResponseInit") {
    return { data: response.data, status: response.init?.status || 200 };
  }
  // For regular Response objects (redirects)
  if (response instanceof Response) {
    return { data: null, status: response.status };
  }
  return { data: response, status: 200 };
}

describe("Login Route", () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe("loader", () => {
    it("should return null when user is not logged in", async () => {
      const request = new UndiciRequest("http://localhost:3000/login");

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result).toBeNull();
    });

    it("should redirect when user is already logged in", async () => {
      const session = await sessionStorage.getSession();
      session.set("userId", "test-user-id");
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest("http://localhost:3000/login", { headers });

      await expect(
        loader({
          request,
          context: { cloudflare: { env: null } },
          params: {},
        } as any)
      ).rejects.toSatisfy((error: any) => {
        expect(error).toBeInstanceOf(Response);
        expect(error.status).toBe(302);
        expect(error.headers.get("Location")).toBe("/");
        return true;
      });
    });
  });

  describe("action", () => {
    it("should return validation errors for invalid email", async () => {
      const formData = new FormData();
      formData.set("email", "invalid-email");
      formData.set("password", "password123");

      const request = new Request("http://localhost:3000/login", {
        method: "POST",
        body: formData,
      });

      const response = await action({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      const { data, status } = extractResponseData(response);
      expect(status).toBe(400);
      expect(data.errors.email).toBe("Valid email is required");
    });

    it("should return validation errors for missing password", async () => {
      const formData = new FormData();
      formData.set("email", "test@example.com");
      formData.set("password", "");

      const request = new Request("http://localhost:3000/login", {
        method: "POST",
        body: formData,
      });

      const response = await action({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      const { data, status } = extractResponseData(response);
      expect(status).toBe(400);
      expect(data.errors.password).toBe("Password is required");
    });

    it("should return error for invalid credentials", async () => {
      const formData = new FormData();
      formData.set("email", "nonexistent@example.com");
      formData.set("password", "password123");

      const request = new Request("http://localhost:3000/login", {
        method: "POST",
        body: formData,
      });

      const response = await action({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      const { data, status } = extractResponseData(response);
      expect(status).toBe(401);
      expect(data.errors.general).toBe("Invalid email or password");
    });

    it("should return error for wrong password", async () => {
      const email = faker.internet.email();
      const username = faker.internet.username() + "_" + faker.string.alphanumeric(8);
      const password = "correctPassword123";

      await createUser(db, email, username, password);

      const formData = new FormData();
      formData.set("email", email);
      formData.set("password", "wrongPassword");

      const request = new Request("http://localhost:3000/login", {
        method: "POST",
        body: formData,
      });

      const response = await action({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      const { data, status } = extractResponseData(response);
      expect(status).toBe(401);
      expect(data.errors.general).toBe("Invalid email or password");
    });

    it("should redirect on successful login", async () => {
      const email = faker.internet.email();
      const username = faker.internet.username() + "_" + faker.string.alphanumeric(8);
      const password = "testPassword123";

      await createUser(db, email, username, password);

      const formData = new FormData();
      formData.set("email", email);
      formData.set("password", password);

      const request = new Request("http://localhost:3000/login", {
        method: "POST",
        body: formData,
      });

      const response = await action({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe("/recipes");
      expect(response.headers.get("Set-Cookie")).toBeDefined();
    });

    it("should redirect to custom redirectTo URL", async () => {
      const email = faker.internet.email();
      const username = faker.internet.username() + "_" + faker.string.alphanumeric(8);
      const password = "testPassword123";

      await createUser(db, email, username, password);

      const formData = new FormData();
      formData.set("email", email);
      formData.set("password", password);

      const request = new Request("http://localhost:3000/login?redirectTo=/cookbooks", {
        method: "POST",
        body: formData,
      });

      const response = await action({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe("/cookbooks");
    });

    it("should handle missing email and password", async () => {
      const formData = new FormData();

      const request = new Request("http://localhost:3000/login", {
        method: "POST",
        body: formData,
      });

      const response = await action({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      const { data, status } = extractResponseData(response);
      expect(status).toBe(400);
      expect(data.errors.email).toBe("Valid email is required");
      expect(data.errors.password).toBe("Password is required");
    });
  });

  describe("component", () => {
    it("should render login form", async () => {
      const Stub = createTestRoutesStub([
        {
          path: "/login",
          Component: Login,
          loader: () => null,
        },
      ]);

      render(<Stub initialEntries={["/login"]} />);

      expect(await screen.findByRole("heading", { name: "Log In" })).toBeInTheDocument();
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Log In" })).toBeInTheDocument();
      expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute("href", "/signup");
    });

    it("should have email input with correct attributes", async () => {
      const Stub = createTestRoutesStub([
        {
          path: "/login",
          Component: Login,
          loader: () => null,
        },
      ]);

      render(<Stub initialEntries={["/login"]} />);

      const emailInput = await screen.findByLabelText("Email");
      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("name", "email");
      expect(emailInput).toHaveAttribute("required");
    });

    it("should have password input with correct attributes", async () => {
      const Stub = createTestRoutesStub([
        {
          path: "/login",
          Component: Login,
          loader: () => null,
        },
      ]);

      render(<Stub initialEntries={["/login"]} />);

      const passwordInput = await screen.findByLabelText("Password");
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(passwordInput).toHaveAttribute("name", "password");
      expect(passwordInput).toHaveAttribute("required");
    });

    it("should have form with post method", async () => {
      const Stub = createTestRoutesStub([
        {
          path: "/login",
          Component: Login,
          loader: () => null,
        },
      ]);

      render(<Stub initialEntries={["/login"]} />);

      const form = (await screen.findByRole("button", { name: "Log In" })).closest("form");
      expect(form).toHaveAttribute("method", "post");
    });
  });
});
