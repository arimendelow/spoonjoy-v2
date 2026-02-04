import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Request as UndiciRequest } from "undici";
import { render, screen } from "@testing-library/react";
import { createTestRoutesStub } from "../utils";
import { db } from "~/lib/db.server";
import { loader } from "~/routes/recipes";
import Recipes from "~/routes/recipes";
import { createUser } from "~/lib/auth.server";
import { sessionStorage } from "~/lib/session.server";
import { cleanupDatabase } from "../helpers/cleanup";
import { faker } from "@faker-js/faker";

/**
 * Tests for the Recipes Layout Route (recipes.tsx)
 *
 * This is a layout route that:
 * - Ensures user is authenticated (redirects to login if not)
 * - Returns null from loader (no data needed by layout)
 * - Renders an Outlet for child routes
 *
 * Recipe list functionality is in recipes._index.tsx (tested in recipes-index.test.tsx)
 */
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

    it("should return null when logged in (layout route)", async () => {
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

      // Layout route returns null - it just enforces authentication
      expect(result).toBeNull();
    });
  });

  describe("component", () => {
    it("should render child routes via Outlet", async () => {
      // The Recipes component is a layout that renders <Outlet />
      // Test that it properly renders child content
      const Stub = createTestRoutesStub([
        {
          path: "/recipes",
          Component: Recipes,
          loader: () => null,
          children: [
            {
              index: true,
              Component: () => <div data-testid="child-content">Recipe List Child</div>,
              loader: () => null,
            },
          ],
        },
      ]);

      render(<Stub initialEntries={["/recipes"]} />);

      // The Outlet should render the child route
      expect(await screen.findByTestId("child-content")).toBeInTheDocument();
      expect(screen.getByText("Recipe List Child")).toBeInTheDocument();
    });
  });
});
