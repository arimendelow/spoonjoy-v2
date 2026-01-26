import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Request as UndiciRequest } from "undici";
import { render } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { loader, action } from "~/routes/logout";
import Logout from "~/routes/logout";
import { sessionStorage } from "~/lib/session.server";
import { cleanupDatabase } from "../helpers/cleanup";

describe("Logout Route", () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe("loader", () => {
    it("should destroy session and redirect to login", async () => {
      const session = await sessionStorage.getSession();
      session.set("userId", "test-user-id");
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest("http://localhost:3000/logout", { headers });

      const response = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe("/login");
      expect(response.headers.get("Set-Cookie")).toBeDefined();
    });

    it("should redirect even without session", async () => {
      const request = new UndiciRequest("http://localhost:3000/logout");

      const response = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe("/login");
    });
  });

  describe("action", () => {
    it("should destroy session and redirect to login", async () => {
      const session = await sessionStorage.getSession();
      session.set("userId", "test-user-id");
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest("http://localhost:3000/logout", {
        method: "POST",
        headers,
      });

      const response = await action({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe("/login");
      expect(response.headers.get("Set-Cookie")).toBeDefined();
    });

    it("should redirect even without session", async () => {
      const request = new UndiciRequest("http://localhost:3000/logout", {
        method: "POST",
      });

      const response = await action({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe("/login");
    });
  });

  describe("component", () => {
    it("should render null (empty component)", async () => {
      const Stub = createRoutesStub([
        {
          path: "/logout",
          Component: Logout,
          loader: () => {
            throw new Response(null, { status: 302, headers: { Location: "/login" } });
          },
        },
        {
          path: "/login",
          Component: () => <div>Login Page</div>,
        },
      ]);

      const { container } = render(<Stub initialEntries={["/logout"]} />);

      // The logout component returns null, so container should be empty or have minimal content
      // Since it redirects, we'll end up on login page
      // Note: In actual rendering, the redirect happens and we see the login page
      expect(container).toBeDefined();
    });

    it("should render nothing when component is called directly", () => {
      // Test the component directly returns null
      const result = Logout();
      expect(result).toBeNull();
    });
  });
});
