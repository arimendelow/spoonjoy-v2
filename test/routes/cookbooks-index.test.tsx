import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Request as UndiciRequest } from "undici";
import { render } from "@testing-library/react";
import { createTestRoutesStub } from "../utils";
import { db } from "~/lib/db.server";
import { loader } from "~/routes/cookbooks._index";
import CookbooksIndexRedirect from "~/routes/cookbooks._index";
import { createUser } from "~/lib/auth.server";
import { sessionStorage } from "~/lib/session.server";
import { cleanupDatabase } from "../helpers/cleanup";
import { faker } from "@faker-js/faker";

describe("Cookbooks Index Redirect Route", () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  it("redirects unauthenticated requests to login", async () => {
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

  it("redirects authenticated users to kitchen cookbooks tab", async () => {
    const user = await createUser(
      db,
      faker.internet.email(),
      faker.internet.username() + "_" + faker.string.alphanumeric(8),
      "testPassword123"
    );

    const session = await sessionStorage.getSession();
    session.set("userId", user.id);
    const cookieValue = (await sessionStorage.commitSession(session)).split(";")[0];

    const headers = new Headers();
    headers.set("Cookie", cookieValue);

    const request = new UndiciRequest("http://localhost:3000/cookbooks", { headers });

    await expect(
      loader({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any)
    ).rejects.toSatisfy((error: any) => {
      expect(error).toBeInstanceOf(Response);
      expect(error.status).toBe(302);
      expect(error.headers.get("Location")).toBe("/?tab=cookbooks");
      return true;
    });
  });

  it("renders nothing in route component", () => {
    const Stub = createTestRoutesStub([
      {
        path: "/cookbooks",
        Component: CookbooksIndexRedirect,
        loader: () => null,
      },
    ]);

    const { container } = render(<Stub initialEntries={["/cookbooks"]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
