import { describe, it, expect } from "vitest";
import CookbooksLayout from "~/routes/cookbooks";

describe("Cookbooks Layout Route", () => {
  describe("default export", () => {
    it("should be a function component", () => {
      expect(typeof CookbooksLayout).toBe("function");
    });

    it("should render without throwing", () => {
      // The component just renders an Outlet, so we verify it doesn't throw
      // when called (it will return a React element)
      expect(() => CookbooksLayout()).not.toThrow();
    });
  });
});
