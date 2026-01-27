import type { Route } from "./+types/shopping-list";
import { Link, useLoaderData, Form, data } from "react-router";
import { getDb, db } from "~/lib/db.server";
import { requireUserId } from "~/lib/session.server";

export async function loader({ request, context }: Route.LoaderArgs) {
  const userId = await requireUserId(request);

  const database = context?.cloudflare?.env?.DB
    ? getDb(context.cloudflare.env as { DB: D1Database })
    : db;

  // Get or create shopping list
  let shoppingList = await database.shoppingList.findUnique({
    where: { authorId: userId },
    include: {
      items: {
        include: {
          unit: true,
          ingredientRef: true,
        },
        orderBy: {
          ingredientRef: {
            name: "asc",
          },
        },
      },
    },
  });

  if (!shoppingList) {
    shoppingList = await database.shoppingList.create({
      data: {
        authorId: userId,
      },
      include: {
        items: {
          include: {
            unit: true,
            ingredientRef: true,
          },
        },
      },
    });
  }

  // Get user's recipes for adding ingredients
  const recipes = await database.recipe.findMany({
    where: {
      chefId: userId,
      deletedAt: null,
    },
    select: {
      id: true,
      title: true,
    },
    orderBy: {
      title: "asc",
    },
  });

  return { shoppingList, recipes };
}

export async function action({ request, context }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const intent = formData.get("intent")?.toString();

  const database = context?.cloudflare?.env?.DB
    ? getDb(context.cloudflare.env as { DB: D1Database })
    : db;

  // Get or create shopping list
  let shoppingList = await database.shoppingList.findUnique({
    where: { authorId: userId },
  });

  if (!shoppingList) {
    shoppingList = await database.shoppingList.create({
      data: { authorId: userId },
    });
  }

  if (intent === "addItem") {
    const quantity = formData.get("quantity")?.toString();
    const unitName = formData.get("unitName")?.toString() || "";
    const ingredientName = formData.get("ingredientName")?.toString() || "";

    if (ingredientName) {
      // Get or create ingredient ref
      let ingredientRef = await database.ingredientRef.findUnique({
        where: { name: ingredientName.toLowerCase() },
      });

      if (!ingredientRef) {
        ingredientRef = await database.ingredientRef.create({
          data: { name: ingredientName.toLowerCase() },
        });
      }

      let unitId: string | null = null;

      if (unitName) {
        // Get or create unit
        let unit = await database.unit.findUnique({
          where: { name: unitName.toLowerCase() },
        });

        if (!unit) {
          unit = await database.unit.create({
            data: { name: unitName.toLowerCase() },
          });
        }

        unitId = unit.id;
      }

      // Check if item already exists
      const existingItem = await database.shoppingListItem.findUnique({
        where: {
          shoppingListId_unitId_ingredientRefId: {
            shoppingListId: shoppingList.id,
            unitId,
            ingredientRefId: ingredientRef.id,
          },
        },
      });

      if (existingItem) {
        // Update quantity
        const newQuantity = quantity
          ? (existingItem.quantity || 0) + parseFloat(quantity)
          : existingItem.quantity;

        await database.shoppingListItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity },
        });
      } else {
        // Create new item
        await database.shoppingListItem.create({
          data: {
            shoppingListId: shoppingList.id,
            quantity: quantity ? parseFloat(quantity) : null,
            unitId,
            ingredientRefId: ingredientRef.id,
          },
        });
      }

      return data({ success: true });
    }
  }

  if (intent === "addFromRecipe") {
    const recipeId = formData.get("recipeId")?.toString();

    if (recipeId) {
      const recipe = await database.recipe.findUnique({
        where: { id: recipeId },
        include: {
          steps: {
            include: {
              ingredients: {
                include: {
                  unit: true,
                  ingredientRef: true,
                },
              },
            },
          },
        },
      });

      if (recipe) {
        // Add all ingredients from all steps
        for (const step of recipe.steps) {
          for (const ingredient of step.ingredients) {
            // Check if item already exists
            const existingItem = await database.shoppingListItem.findUnique({
              where: {
                shoppingListId_unitId_ingredientRefId: {
                  shoppingListId: shoppingList.id,
                  unitId: ingredient.unitId,
                  ingredientRefId: ingredient.ingredientRefId,
                },
              },
            });

            if (existingItem) {
              // Update quantity
              const newQuantity = (existingItem.quantity || 0) + ingredient.quantity;
              await database.shoppingListItem.update({
                where: { id: existingItem.id },
                data: { quantity: newQuantity },
              });
            } else {
              // Create new item
              await database.shoppingListItem.create({
                data: {
                  shoppingListId: shoppingList.id,
                  quantity: ingredient.quantity,
                  unitId: ingredient.unitId,
                  ingredientRefId: ingredient.ingredientRefId,
                },
              });
            }
          }
        }

        return data({ success: true });
      }
    }
  }

  if (intent === "toggleCheck") {
    const itemId = formData.get("itemId")?.toString();
    if (itemId) {
      const item = await database.shoppingListItem.findUnique({
        where: { id: itemId },
        select: { checked: true },
      });
      if (item) {
        await database.shoppingListItem.update({
          where: { id: itemId },
          data: { checked: !item.checked },
        });
        return data({ success: true });
      }
    }
  }

  if (intent === "removeItem") {
    const itemId = formData.get("itemId")?.toString();
    if (itemId) {
      await database.shoppingListItem.delete({
        where: { id: itemId },
      });
      return data({ success: true });
    }
  }

  if (intent === "clearCompleted") {
    await database.shoppingListItem.deleteMany({
      where: {
        shoppingListId: shoppingList.id,
        checked: true,
      },
    });
    return data({ success: true });
  }

  if (intent === "clearAll") {
    await database.shoppingListItem.deleteMany({
      where: { shoppingListId: shoppingList.id },
    });
    return data({ success: true });
  }

  return null;
}

export default function ShoppingList() {
  const { shoppingList, recipes } = useLoaderData<typeof loader>();

  const checkedCount = shoppingList.items.filter((item) => item.checked).length;
  const uncheckedCount = shoppingList.items.length - checkedCount;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8", padding: "2rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h1>Shopping List</h1>
            <p style={{ color: "#666", margin: "0.5rem 0 0 0" }}>
              {shoppingList.items.length} {shoppingList.items.length === 1 ? "item" : "items"}
              {checkedCount > 0 && (
                <span> ({checkedCount} checked, {uncheckedCount} remaining)</span>
              )}
            </p>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <Link
              to="/"
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#6c757d",
                color: "white",
                textDecoration: "none",
                borderRadius: "4px",
              }}
            >
              Home
            </Link>
            {checkedCount > 0 && (
              <Form method="post">
                <input type="hidden" name="intent" value="clearCompleted" />
                <button
                  type="submit"
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#ffc107",
                    color: "#212529",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Clear Completed
                </button>
              </Form>
            )}
            {shoppingList.items.length > 0 && (
              <Form method="post">
                <input type="hidden" name="intent" value="clearAll" />
                <button
                  type="submit"
                  onClick={
                    /* istanbul ignore next -- browser confirm dialog */
                    (e) => {
                      if (!confirm("Clear all items from shopping list?")) {
                        e.preventDefault();
                      }
                    }
                  }
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Clear All
                </button>
              </Form>
            )}
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "1.5rem",
            borderRadius: "8px",
            marginBottom: "2rem",
          }}
        >
          <h3 style={{ margin: "0 0 1rem 0" }}>Add Item</h3>
          <Form method="post" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input type="hidden" name="intent" value="addItem" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr auto", gap: "1rem", alignItems: "end" }}>
              <div>
                <label htmlFor="quantity" style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "bold" }}>
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  step="0.01"
                  placeholder="2"
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    fontSize: "1rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
              </div>
              <div>
                <label htmlFor="unitName" style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "bold" }}>
                  Unit
                </label>
                <input
                  type="text"
                  id="unitName"
                  name="unitName"
                  placeholder="lbs"
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    fontSize: "1rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
              </div>
              <div>
                <label htmlFor="ingredientName" style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "bold" }}>
                  Ingredient *
                </label>
                <input
                  type="text"
                  id="ingredientName"
                  name="ingredientName"
                  required
                  placeholder="chicken breast"
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    fontSize: "1rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: "0.5rem 1rem",
                  fontSize: "1rem",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Add
              </button>
            </div>
          </Form>
        </div>

        {recipes.length > 0 && (
          <div
            style={{
              backgroundColor: "#e7f3ff",
              padding: "1.5rem",
              borderRadius: "8px",
              marginBottom: "2rem",
            }}
          >
            <h3 style={{ margin: "0 0 1rem 0" }}>Add All Ingredients from Recipe</h3>
            <Form method="post" style={{ display: "flex", gap: "1rem" }}>
              <input type="hidden" name="intent" value="addFromRecipe" />
              <select
                name="recipeId"
                required
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  fontSize: "1rem",
                  border: "1px solid #0066cc",
                  borderRadius: "4px",
                }}
              >
                <option value="">Select a recipe...</option>
                {recipes.map((recipe) => (
                  <option key={recipe.id} value={recipe.id}>
                    {recipe.title}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                style={{
                  padding: "0.5rem 1.5rem",
                  fontSize: "1rem",
                  backgroundColor: "#0066cc",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Add Ingredients
              </button>
            </Form>
          </div>
        )}

        {shoppingList.items.length === 0 ? (
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "3rem",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <h2 style={{ color: "#6c757d" }}>Your shopping list is empty</h2>
            <p style={{ color: "#999" }}>
              Add items manually or add all ingredients from a recipe
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {shoppingList.items.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: "white",
                  border: "1px solid #dee2e6",
                  borderRadius: "4px",
                  padding: "1rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  opacity: item.checked ? 0.6 : 1,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1 }}>
                  <Form method="post" style={{ margin: 0 }}>
                    <input type="hidden" name="intent" value="toggleCheck" />
                    <input type="hidden" name="itemId" value={item.id} />
                    <button
                      type="submit"
                      style={{
                        width: "24px",
                        height: "24px",
                        border: "2px solid #0066cc",
                        borderRadius: "4px",
                        backgroundColor: item.checked ? "#0066cc" : "white",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                      }}
                      aria-label={item.checked ? "Uncheck item" : "Check item"}
                    >
                      {item.checked && (
                        <span style={{ color: "white", fontSize: "1rem", lineHeight: 1 }}>✓</span>
                      )}
                    </button>
                  </Form>
                  <span
                    style={{
                      fontSize: "1.125rem",
                      textDecoration: item.checked ? "line-through" : "none",
                    }}
                  >
                    {item.quantity && <strong>{item.quantity}</strong>}
                    {item.quantity && item.unit && " "}
                    {item.unit?.name && <span>{item.unit.name}</span>}
                    {(item.quantity || item.unit) && " "}
                    {item.ingredientRef.name}
                  </span>
                </div>
                <Form method="post" style={{ margin: 0 }}>
                  <input type="hidden" name="intent" value="removeItem" />
                  <input type="hidden" name="itemId" value={item.id} />
                  <button
                    type="submit"
                    style={{
                      padding: "0.25rem 0.75rem",
                      fontSize: "0.875rem",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                </Form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
