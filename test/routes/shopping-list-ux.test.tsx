import "@testing-library/jest-dom/vitest";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import React from "react";
import { createTestRoutesStub } from "../utils";

vi.mock("framer-motion", () => {
  const MotionDiv = ({
    children,
    onDragEnd,
    animate,
    ...props
  }: {
    children: React.ReactNode;
    onDragEnd?: (_event: unknown, info: { offset: { x: number; y: number } }) => void;
    animate?: { x?: number };
    [key: string]: unknown;
  }) => (
    <div
      {...props}
      data-motion-x={String(animate?.x ?? 0)}
      onPointerUp={(event) => {
        const offsetX = Number(
          (event.currentTarget as HTMLDivElement).dataset.dragOffsetX ?? "0"
        );
        onDragEnd?.(event, { offset: { x: offsetX, y: 0 } });
      }}
    >
      {children}
    </div>
  );

  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: { div: MotionDiv },
  };
});

import ShoppingList, {
  resolveSwipeAction,
  shouldDeleteOnSwipe,
} from "~/routes/shopping-list";

function swipeRow(row: Element, offsetX: number) {
  row.setAttribute("data-drag-offset-x", String(offsetX));
  fireEvent.pointerUp(row);
}

describe("shopping list UX updates", () => {
  const singleItemData = {
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

  it("removes inline remove buttons and per-item category chips", async () => {
    const Stub = createTestRoutesStub([
      {
        path: "/shopping-list",
        Component: ShoppingList,
        loader: () => singleItemData,
      },
    ]);

    render(<Stub initialEntries={["/shopping-list"]} />);

    expect(await screen.findByText("chicken thigh")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove" })).not.toBeInTheDocument();
    expect(screen.getAllByTestId("shopping-list-category")).toHaveLength(1);
  });

  it("resolves swipe actions for reveal, confirm, dismiss, and no-op states", () => {
    expect(resolveSwipeAction(-80, false)).toBe("reveal");
    expect(resolveSwipeAction(-120, true)).toBe("confirmDelete");
    expect(resolveSwipeAction(40, true)).toBe("dismiss");
    expect(resolveSwipeAction(-30, false)).toBe("none");
    expect(shouldDeleteOnSwipe(-120, true)).toBe(true);
    expect(shouldDeleteOnSwipe(-120, false)).toBe(false);
  });

  it("requires two actions to delete and allows row-tap or right-swipe cancel", async () => {
    const Stub = createTestRoutesStub([
      {
        path: "/shopping-list",
        Component: ShoppingList,
        loader: () => singleItemData,
      },
    ]);

    render(<Stub initialEntries={["/shopping-list"]} />);

    const itemLabel = await screen.findByText("chicken thigh");
    const row = itemLabel.closest("[data-motion-x]");
    expect(row).toBeInTheDocument();

    swipeRow(row!, -80);
    await waitFor(() => expect(row).toHaveAttribute("data-motion-x", "-104"));
    expect(screen.getByRole("button", { name: "Delete chicken thigh" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Check item" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Check item" }));
    await waitFor(() => expect(row).toHaveAttribute("data-motion-x", "0"));
    expect(screen.getByRole("button", { name: "Check item" })).toBeInTheDocument();

    swipeRow(row!, -80);
    await waitFor(() => expect(row).toHaveAttribute("data-motion-x", "-104"));
    swipeRow(row!, 40);
    await waitFor(() => expect(row).toHaveAttribute("data-motion-x", "0"));

    swipeRow(row!, -80);
    await waitFor(() => expect(row).toHaveAttribute("data-motion-x", "-104"));
    swipeRow(row!, -120);
    await waitFor(() => {
      expect(screen.queryByText("chicken thigh")).not.toBeInTheDocument();
    });
  });

  it("uses straight seam classes and closes all reveals when check-off reorders rows", async () => {
    const Stub = createTestRoutesStub([
      {
        path: "/shopping-list",
        Component: ShoppingList,
        loader: () => ({
          shoppingList: {
            id: "list-2",
            items: [
              {
                id: "item-1",
                quantity: 1,
                checked: false,
                unit: null,
                ingredientRef: { name: "apples" },
                categoryKey: "produce",
                iconKey: "apple",
              },
              {
                id: "item-2",
                quantity: 1,
                checked: false,
                unit: null,
                ingredientRef: { name: "bananas" },
                categoryKey: "produce",
                iconKey: "banana",
              },
            ],
          },
          recipes: [],
        }),
      },
    ]);

    const { container } = render(<Stub initialEntries={["/shopping-list"]} />);

    const seamContainer = container.querySelector(".relative.overflow-hidden.rounded-lg.border");
    const rowShell = container.querySelector(".relative.z-10.px-3.py-2");
    expect(seamContainer).toBeInTheDocument();
    expect(rowShell?.className).not.toContain("rounded");

    const bananasLabel = await screen.findByText("bananas");
    const bananasRow = bananasLabel.closest("[data-motion-x]");
    expect(bananasRow).toBeInTheDocument();

    swipeRow(bananasRow!, -80);
    await waitFor(() => expect(bananasRow).toHaveAttribute("data-motion-x", "-104"));

    const applesRow = screen.getByText("apples").closest("[data-motion-x]");
    const applesCheck = within(applesRow!).getByRole("button", { name: "Check item" });
    fireEvent.click(applesCheck);

    await waitFor(() => expect(bananasRow).toHaveAttribute("data-motion-x", "0"));
  });
});
