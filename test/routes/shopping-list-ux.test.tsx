import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ShoppingList, { shouldDeleteOnSwipe } from "~/routes/shopping-list";
import { createTestRoutesStub } from "../utils";

describe("shopping list UX updates", () => {
  it("removes inline remove buttons and per-item category chips", async () => {
    const mockData = {
      shoppingList: {
        id: "list-1",
        items: [
          {
            id: "item-1",
            quantity: 2,
            checked: false,
            unit: { name: "lbs" },
            ingredientRef: { name: "chicken thigh" },
            categoryKey: "protein",
            iconKey: "beef",
          },
        ],
      },
      recipes: [],
    };

    const Stub = createTestRoutesStub([
      {
        path: "/shopping-list",
        Component: ShoppingList,
        loader: () => mockData,
      },
    ]);

    render(<Stub initialEntries={["/shopping-list"]} />);

    expect(await screen.findByText("chicken thigh")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove" })).not.toBeInTheDocument();
    expect(screen.getAllByTestId("shopping-list-category")).toHaveLength(1);
  });

  it("deletes only on a sufficient left swipe", () => {
    expect(shouldDeleteOnSwipe(-72)).toBe(true);
    expect(shouldDeleteOnSwipe(-120)).toBe(true);
    expect(shouldDeleteOnSwipe(-71)).toBe(false);
    expect(shouldDeleteOnSwipe(88)).toBe(false);
  });
});
