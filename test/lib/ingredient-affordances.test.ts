import { describe, expect, it } from "vitest";
import { inferIngredientAffordance, resolveIngredientAffordance } from "~/lib/ingredient-affordances";

describe("ingredient affordance mapping", () => {
  it("maps lime to produce", () => {
    const affordance = inferIngredientAffordance("lime");

    expect(affordance.categoryKey).toBe("produce");
    expect(affordance.iconKey).toBe("citrus");
  });

  it("maps coconut milk to pantry", () => {
    const affordance = inferIngredientAffordance("coconut milk");

    expect(affordance.categoryKey).toBe("pantry");
    expect(affordance.iconKey).toBe("package");
  });

  it("uses ingredient-specific icon intent for chicken thigh", () => {
    const affordance = resolveIngredientAffordance("chicken thigh", "protein", null);

    expect(affordance.categoryKey).toBe("protein");
    expect(affordance.iconKey).toBe("drumstick");
  });
});
