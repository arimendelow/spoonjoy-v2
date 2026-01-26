import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Request as UndiciRequest } from "undici";
import { db } from "~/lib/db.server";
import { loader, action } from "~/routes/signup";
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

describe("Signup Route", () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe("loader", () => {
    it("should return null when user is not logged in", async () => {
      const request = new UndiciRequest("http://localhost:3000/signup");

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

      const request = new UndiciRequest("http://localhost:3000/signup", { headers });

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
      formData.set("username", "testuser");
      formData.set("password", "password123");
      formData.set("confirmPassword", "password123");

      const request = new Request("http://localhost:3000/signup", {
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

    it("should return validation errors for short username", async () => {
      const formData = new FormData();
      formData.set("email", "test@example.com");
      formData.set("username", "ab");
      formData.set("password", "password123");
      formData.set("confirmPassword", "password123");

      const request = new Request("http://localhost:3000/signup", {
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
      expect(data.errors.username).toBe("Username must be at least 3 characters");
    });

    it("should return validation errors for short password", async () => {
      const formData = new FormData();
      formData.set("email", "test@example.com");
      formData.set("username", "testuser");
      formData.set("password", "short");
      formData.set("confirmPassword", "short");

      const request = new Request("http://localhost:3000/signup", {
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
      expect(data.errors.password).toBe("Password must be at least 8 characters");
    });

    it("should return validation errors for mismatched passwords", async () => {
      const formData = new FormData();
      formData.set("email", "test@example.com");
      formData.set("username", "testuser");
      formData.set("password", "password123");
      formData.set("confirmPassword", "different123");

      const request = new Request("http://localhost:3000/signup", {
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
      expect(data.errors.confirmPassword).toBe("Passwords do not match");
    });

    it("should return error if email already exists", async () => {
      const existingEmail = faker.internet.email();
      const username = faker.internet.username() + "_" + faker.string.alphanumeric(8);
      await createUser(db, existingEmail, username, "password123");

      const formData = new FormData();
      formData.set("email", existingEmail);
      formData.set("username", "newuser_" + faker.string.alphanumeric(8));
      formData.set("password", "password123");
      formData.set("confirmPassword", "password123");

      const request = new Request("http://localhost:3000/signup", {
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
      expect(data.errors.email).toBe("An account with this email already exists");
    });

    it("should return error if username already exists", async () => {
      const existingUsername = "existinguser_" + faker.string.alphanumeric(8);
      await createUser(db, faker.internet.email(), existingUsername, "password123");

      const formData = new FormData();
      formData.set("email", faker.internet.email());
      formData.set("username", existingUsername);
      formData.set("password", "password123");
      formData.set("confirmPassword", "password123");

      const request = new Request("http://localhost:3000/signup", {
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
      expect(data.errors.username).toBe("This username is already taken");
    });

    it("should create user and redirect on successful signup", async () => {
      const email = faker.internet.email();
      const username = faker.internet.username() + "_" + faker.string.alphanumeric(8);

      const formData = new FormData();
      formData.set("email", email);
      formData.set("username", username);
      formData.set("password", "password123");
      formData.set("confirmPassword", "password123");

      const request = new Request("http://localhost:3000/signup", {
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

      // Verify user was created
      const user = await db.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      expect(user).not.toBeNull();
      expect(user?.username).toBe(username);
    });

    it("should handle multiple validation errors at once", async () => {
      const formData = new FormData();
      formData.set("email", "");
      formData.set("username", "");
      formData.set("password", "");
      formData.set("confirmPassword", "different");

      const request = new Request("http://localhost:3000/signup", {
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
      expect(data.errors.email).toBeDefined();
      expect(data.errors.username).toBeDefined();
      expect(data.errors.password).toBeDefined();
      expect(data.errors.confirmPassword).toBeDefined();
    });
  });
});
