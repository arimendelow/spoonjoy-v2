import { describe, it, expect } from "vitest";
import { Request as UndiciRequest } from "undici";
import { loader } from "~/routes/$";
import CatchAll from "~/routes/$";

describe("Catch-all Route ($)", () => {
  describe("loader", () => {
    it("should throw 404 response for unknown routes", async () => {
      const request = new UndiciRequest("http://localhost:3000/unknown-path");

      try {
        await loader({
          request,
          context: { cloudflare: { env: null } },
          params: { "*": "unknown-path" },
        } as any);
        expect.fail("Should have thrown a 404 response");
      } catch (response: any) {
        expect(response).toBeInstanceOf(Response);
        expect(response.status).toBe(404);
        const text = await response.text();
        expect(text).toBe("Not Found: /unknown-path");
      }
    });

    it("should throw 404 for Chrome DevTools request", async () => {
      const request = new UndiciRequest(
        "http://localhost:3000/.well-known/appspecific/com.chrome.devtools.json"
      );

      try {
        await loader({
          request,
          context: { cloudflare: { env: null } },
          params: { "*": ".well-known/appspecific/com.chrome.devtools.json" },
        } as any);
        expect.fail("Should have thrown a 404 response");
      } catch (response: any) {
        expect(response).toBeInstanceOf(Response);
        expect(response.status).toBe(404);
        const text = await response.text();
        expect(text).toBe(
          "Not Found: /.well-known/appspecific/com.chrome.devtools.json"
        );
      }
    });

    it("should throw 404 for deeply nested unknown paths", async () => {
      const request = new UndiciRequest(
        "http://localhost:3000/some/deeply/nested/path"
      );

      try {
        await loader({
          request,
          context: { cloudflare: { env: null } },
          params: { "*": "some/deeply/nested/path" },
        } as any);
        expect.fail("Should have thrown a 404 response");
      } catch (response: any) {
        expect(response).toBeInstanceOf(Response);
        expect(response.status).toBe(404);
        const text = await response.text();
        expect(text).toBe("Not Found: /some/deeply/nested/path");
      }
    });
  });

  describe("component", () => {
    it("should render null", () => {
      const result = CatchAll();
      expect(result).toBeNull();
    });
  });
});
