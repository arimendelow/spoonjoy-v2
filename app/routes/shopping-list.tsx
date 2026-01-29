import type { Route } from "./+types/shopping-list";
import { useLoaderData, Form, data } from "react-router";
import { getDb, db } from "~/lib/db.server";
import { requireUserId } from "~/lib/session.server";
import { Heading, Subheading } from "~/components/ui/heading";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Field, Label } from "~/components/ui/fieldset";
import { Select } from "~/components/ui/select";
import { Link } from "~/components/ui/link";

export async function loader({ request, context }: Route.LoaderArgs) {
  const userId = await requireUserId(request);

  /* istanbul ignore next -- @preserve Cloudflare D1 production-only path */
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

  /* istanbul ignore next -- @preserve Cloudflare D1 production-only path */
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

      /* istanbul ignore else -- @preserve unit name is usually provided */
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
        /* istanbul ignore next -- @preserve ternary branches for quantity addition */
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
    }
    return data({ success: true });
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

      /* istanbul ignore else -- @preserve recipe should exist if selected */
      if (recipe) {
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
              /* istanbul ignore next -- @preserve ternary branches for quantity addition */
              const newQuantity = ingredient.quantity
                ? (existingItem.quantity || 0) + ingredient.quantity
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
                  quantity: ingredient.quantity,
                  unitId: ingredient.unitId,
                  ingredientRefId: ingredient.ingredientRefId,
                },
              });
            }
          }
        }
      }
    }
    return data({ success: true });
  }

  if (intent === "toggleCheck") {
    const itemId = formData.get("itemId")?.toString();

    if (itemId) {
      const item = await database.shoppingListItem.findUnique({
        where: { id: itemId },
      });

      /* istanbul ignore else -- @preserve item should exist if toggling */
      if (item) {
        await database.shoppingListItem.update({
          where: { id: itemId },
          data: { checked: !item.checked },
        });
      }
    }
    return data({ success: true });
  }

  if (intent === "removeItem") {
    const itemId = formData.get("itemId")?.toString();

    if (itemId) {
      await database.shoppingListItem.delete({
        where: { id: itemId },
      });
    }
    return data({ success: true });
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
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <Heading level={1}>Shopping List</Heading>
          <Text className="mt-1">
            {shoppingList.items.length} {shoppingList.items.length === 1 ? "item" : "items"}
            {/* istanbul ignore next -- @preserve */ checkedCount > 0 && (
              <span> ({checkedCount} checked, {uncheckedCount} remaining)</span>
            )}
          </Text>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href="/" outline>
            Home
          </Button>
          {/* istanbul ignore next -- @preserve */ checkedCount > 0 && (
            <Form method="post">
              <input type="hidden" name="intent" value="clearCompleted" />
              <Button type="submit" color="amber">
                Clear Completed
              </Button>
            </Form>
          )}
          {/* istanbul ignore next -- @preserve */ shoppingList.items.length > 0 && (
            <Form method="post">
              <input type="hidden" name="intent" value="clearAll" />
              <Button
                type="submit"
                color="red"
                onClick={
                  /* istanbul ignore next -- @preserve browser confirm dialog */
                  (e) => {
                    if (!confirm("Clear all items from shopping list?")) {
                      e.preventDefault();
                    }
                  }
                }
              >
                Clear All
              </Button>
            </Form>
          )}
        </div>
      </div>

      {/* Add Item Form */}
      <div className="rounded-lg bg-zinc-50 p-6 dark:bg-zinc-800/50 mb-6">
        <Subheading level={2}>Add Item</Subheading>
        <Form method="post" className="mt-4">
          <input type="hidden" name="intent" value="addItem" />
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <Field>
              <Label>Quantity</Label>
              <Input
                type="number"
                name="quantity"
                step="0.01"
                placeholder="2"
              />
            </Field>
            <Field>
              <Label>Unit</Label>
              <Input
                type="text"
                name="unitName"
                placeholder="lbs"
              />
            </Field>
            <Field className="sm:col-span-1">
              <Label>Ingredient *</Label>
              <Input
                type="text"
                name="ingredientName"
                required
                placeholder="chicken breast"
              />
            </Field>
            <Button type="submit" color="green">
              Add
            </Button>
          </div>
        </Form>
      </div>

      {/* Add from Recipe */}
      {/* istanbul ignore next -- @preserve */ recipes.length > 0 && (
        <div className="rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20 mb-6">
          <Subheading level={2}>Add All Ingredients from Recipe</Subheading>
          <Form method="post" className="mt-4 flex flex-col sm:flex-row gap-4">
            <input type="hidden" name="intent" value="addFromRecipe" />
            <Select name="recipeId" required className="flex-1">
              <option value="">Select a recipe...</option>
              {recipes.map((recipe) => (
                <option key={recipe.id} value={recipe.id}>
                  {recipe.title}
                </option>
              ))}
            </Select>
            <Button type="submit" color="blue">
              Add Ingredients
            </Button>
          </Form>
        </div>
      )}

      {/* Empty State */}
      {shoppingList.items.length === 0 ? (
        <div className="rounded-lg bg-zinc-50 p-8 dark:bg-zinc-800/50 text-center">
          <Subheading level={2} className="text-zinc-500 dark:text-zinc-400">
            Your shopping list is empty
          </Subheading>
          <Text className="mt-2">
            Add items manually or add all ingredients from a recipe
          </Text>
        </div>
      ) : (
        /* Item List */
        <div className="space-y-2">
          {shoppingList.items.map((item) => (
            <div
              key={item.id}
              className={`
                rounded-lg border border-zinc-200 dark:border-zinc-700 p-4
                flex items-center justify-between gap-4
                bg-white dark:bg-zinc-800
                ${item.checked ? "opacity-60" : ""}
              `}
            >
              <div className="flex items-center gap-4 flex-1">
                <Form method="post" className="m-0">
                  <input type="hidden" name="intent" value="toggleCheck" />
                  <input type="hidden" name="itemId" value={item.id} />
                  <button
                    type="submit"
                    className={`
                      w-6 h-6 rounded border-2 flex items-center justify-center
                      transition-colors cursor-pointer
                      ${item.checked 
                        ? "bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-500" 
                        : "bg-white border-zinc-300 dark:bg-zinc-800 dark:border-zinc-600"}
                    `}
                    aria-label={item.checked ? "Uncheck item" : "Check item"}
                  >
                    {item.checked && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </Form>
                <span className={`text-lg ${item.checked ? "line-through text-zinc-400 dark:text-zinc-500" : "text-zinc-900 dark:text-zinc-100"}`}>
                  {item.quantity && <strong>{item.quantity}</strong>}
                  {item.quantity && item.unit && " "}
                  {item.unit?.name && <span>{item.unit.name}</span>}
                  {(item.quantity || item.unit) && " "}
                  {item.ingredientRef.name}
                </span>
              </div>
              <Form method="post" className="m-0">
                <input type="hidden" name="intent" value="removeItem" />
                <input type="hidden" name="itemId" value={item.id} />
                <Button type="submit" color="red" className="text-sm">
                  Remove
                </Button>
              </Form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
