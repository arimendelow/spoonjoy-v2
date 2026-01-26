import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createUserSession, requireUserId, destroyUserSession, getUserId, sessionStorage } from "~/lib/session.server";
import { Request } from "undici";

describe("session.server", () => {
  let originalSessionSecret: string | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    originalSessionSecret = process.env.SESSION_SECRET;
  });

  afterEach(() => {
    // Restore original SESSION_SECRET
    if (originalSessionSecret !== undefined) {
      process.env.SESSION_SECRET = originalSessionSecret;
    } else {
      delete process.env.SESSION_SECRET;
    }
  });

  describe("getUserId", () => {
    it("should return null when no session exists", async () => {
      const request = new Request("http://localhost:3000/test");
      const userId = await getUserId(request);

      expect(userId).toBeNull();
    });

    it("should return userId from valid session", async () => {
      const session = await sessionStorage.getSession();
      session.set("userId", "test-user-id");
      const setCookieHeader = await sessionStorage.commitSession(session);

      // Extract just the cookie value from the Set-Cookie header
      // Set-Cookie format: "name=value; Path=/; HttpOnly; ..."
      const cookieValue = setCookieHeader.split(";")[0];

      // Create headers object explicitly
      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new Request("http://localhost:3000/test", {
        headers,
      });

      const userId = await getUserId(request);
      expect(userId).toBe("test-user-id");
    });
  });

  describe("requireUserId", () => {
    it("should throw redirect response when no session", async () => {
      const request = new Request("http://localhost:3000/test");

      try {
        await requireUserId(request);
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(Response);
        expect((error as Response).status).toBe(302);
      }
    });

    it("should return userId from valid session", async () => {
      const session = await sessionStorage.getSession();
      session.set("userId", "test-user-id");
      const setCookieHeader = await sessionStorage.commitSession(session);

      // Extract just the cookie value from the Set-Cookie header
      const cookieValue = setCookieHeader.split(";")[0];

      // Create headers object explicitly
      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new Request("http://localhost:3000/test", {
        headers,
      });

      const result = await requireUserId(request);
      expect(result).toBe("test-user-id");
    });
  });

  describe("createUserSession", () => {
    it("should create a session and return redirect response", async () => {
      const response = await createUserSession("test-user-id", "/recipes");

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe("/recipes");
      expect(response.headers.get("Set-Cookie")).toBeDefined();
    });
  });

  describe("destroyUserSession", () => {
    it("should destroy session and return redirect response", async () => {
      const session = await sessionStorage.getSession();
      session.set("userId", "test-user-id");
      const setCookieHeader = await sessionStorage.commitSession(session);

      // Extract just the cookie value from the Set-Cookie header
      const cookieValue = setCookieHeader.split(";")[0];

      // Create headers object explicitly
      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new Request("http://localhost:3000/logout", {
        headers,
      });

      const response = await destroyUserSession(request, "/");

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe("/");
      expect(response.headers.get("Set-Cookie")).toBeDefined();
    });
  });
});
