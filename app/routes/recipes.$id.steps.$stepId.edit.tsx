import type { Route } from "./+types/recipes.$id.steps.$stepId.edit";
import { Form, Link, redirect, data, useActionData, useLoaderData } from "react-router";
import { getDb, db } from "~/lib/db.server";
import { requireUserId } from "~/lib/session.server";
import { useState } from "react";

interface ActionData {
  errors?: {
    stepTitle?: string;
    description?: string;
    general?: string;
  };
}

interface Ingredient {
  quantity: string;
  unitName: string;
  ingredientName: string;
}

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const { id, stepId } = params;

  /* istanbul ignore next -- Cloudflare D1 production-only path */
  const database = context?.cloudflare?.env?.DB
    ? getDb(context.cloudflare.env as { DB: D1Database })
    : db;

  const recipe = await database.recipe.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      chefId: true,
      deletedAt: true,
    },
  });

  if (!recipe || recipe.deletedAt) {
    throw new Response("Recipe not found", { status: 404 });
  }

  if (recipe.chefId !== userId) {
    throw new Response("Unauthorized", { status: 403 });
  }

  const step = await database.recipeStep.findUnique({
    where: { id: stepId },
    include: {
      ingredients: {
        include: {
          unit: true,
          ingredientRef: true,
        },
      },
    },
  });

  if (!step || step.recipeId !== id) {
    throw new Response("Step not found", { status: 404 });
  }

  return { recipe, step };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const { id, stepId } = params;
  const formData = await request.formData();
  const intent = formData.get("intent")?.toString();

  /* istanbul ignore next -- Cloudflare D1 production-only path */
  const database = context?.cloudflare?.env?.DB
    ? getDb(context.cloudflare.env as { DB: D1Database })
    : db;

  // Verify ownership
  const recipe = await database.recipe.findUnique({
    where: { id },
    select: { chefId: true, deletedAt: true },
  });

  if (!recipe || recipe.deletedAt) {
    throw new Response("Recipe not found", { status: 404 });
  }

  if (recipe.chefId !== userId) {
    throw new Response("Unauthorized", { status: 403 });
  }

  const step = await database.recipeStep.findUnique({
    where: { id: stepId },
    select: { id: true, recipeId: true },
  });

  if (!step || step.recipeId !== id) {
    throw new Response("Step not found", { status: 404 });
  }

  // Handle delete intent
  if (intent === "delete") {
    await database.recipeStep.delete({
      where: { id: stepId },
    });
    return redirect(`/recipes/${id}/edit`);
  }

  // Handle add ingredient intent
  if (intent === "addIngredient") {
    const quantity = parseFloat(formData.get("quantity")?.toString() || "0");
    const unitName = formData.get("unitName")?.toString() || "";
    const ingredientName = formData.get("ingredientName")?.toString() || "";

    if (quantity && unitName && ingredientName) {
      // Get or create unit
      let unit = await database.unit.findUnique({
        where: { name: unitName.toLowerCase() },
      });

      if (!unit) {
        unit = await database.unit.create({
          data: { name: unitName.toLowerCase() },
        });
      }

      // Get or create ingredient ref
      let ingredientRef = await database.ingredientRef.findUnique({
        where: { name: ingredientName.toLowerCase() },
      });

      if (!ingredientRef) {
        ingredientRef = await database.ingredientRef.create({
          data: { name: ingredientName.toLowerCase() },
        });
      }

      // Create ingredient
      await database.ingredient.create({
        data: {
          recipeId: id,
          stepNum: (await database.recipeStep.findUnique({ where: { id: stepId }, select: { stepNum: true } }))!.stepNum,
          quantity,
          unitId: unit.id,
          ingredientRefId: ingredientRef.id,
        },
      });

      return data({ success: true });
    }
  }

  // Handle delete ingredient intent
  if (intent === "deleteIngredient") {
    const ingredientId = formData.get("ingredientId")?.toString();
    if (ingredientId) {
      await database.ingredient.delete({
        where: { id: ingredientId },
      });
      return data({ success: true });
    }
  }

  // Handle update step
  const stepTitle = formData.get("stepTitle")?.toString() || "";
  const description = formData.get("description")?.toString() || "";

  const errors: ActionData["errors"] = {};

  if (!description || description.trim().length === 0) {
    errors.description = "Step description is required";
  }

  if (Object.keys(errors).length > 0) {
    return data({ errors }, { status: 400 });
  }

  try {
    await database.recipeStep.update({
      where: { id: stepId },
      data: {
        stepTitle: stepTitle.trim() || null,
        description: description.trim(),
      },
    });

    return redirect(`/recipes/${id}/edit`);
  } catch (error) {
    return data(
      { errors: { general: "Failed to update step. Please try again." } },
      { status: 500 }
    );
  }
}

export default function EditStep() {
  const { recipe, step } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const [showIngredientForm, setShowIngredientForm] = useState(false);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1>Edit Step {step.stepNum}</h1>
          <Link
            to={`/recipes/${recipe.id}/edit`}
            style={{
              color: "#0066cc",
              textDecoration: "none",
            }}
          >
            ← Back to recipe
          </Link>
        </div>

        {actionData?.errors?.general && (
          <div
            style={{
              padding: "0.75rem",
              marginBottom: "1rem",
              backgroundColor: "#fee",
              border: "1px solid #c33",
              borderRadius: "4px",
              color: "#c33",
            }}
          >
            {actionData.errors.general}
          </div>
        )}

        <Form method="post" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <label htmlFor="stepTitle" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
              Step Title (optional)
            </label>
            <input
              type="text"
              id="stepTitle"
              name="stepTitle"
              defaultValue={step.stepTitle || ""}
              style={{
                width: "100%",
                padding: "0.75rem",
                fontSize: "1rem",
                border: actionData?.errors?.stepTitle ? "1px solid #c33" : "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </div>

          <div>
            <label htmlFor="description" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={6}
              required
              defaultValue={step.description}
              style={{
                width: "100%",
                padding: "0.75rem",
                fontSize: "1rem",
                border: actionData?.errors?.description ? "1px solid #c33" : "1px solid #ccc",
                borderRadius: "4px",
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />
            {actionData?.errors?.description && (
              <div style={{ color: "#c33", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                {actionData.errors.description}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
            <Link
              to={`/recipes/${recipe.id}/edit`}
              style={{
                padding: "0.75rem 1.5rem",
                fontSize: "1rem",
                backgroundColor: "#6c757d",
                color: "white",
                textDecoration: "none",
                borderRadius: "4px",
                textAlign: "center",
              }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              style={{
                padding: "0.75rem 1.5rem",
                fontSize: "1rem",
                backgroundColor: "#0066cc",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Save Changes
            </button>
          </div>
        </Form>

        <div style={{ marginTop: "1rem" }}>
          <Form method="post">
            <input type="hidden" name="intent" value="delete" />
            <button
              type="submit"
              onClick={
                /* istanbul ignore next -- browser confirm dialog */
                (e) => {
                  if (!confirm("Are you sure you want to delete this step?")) {
                    e.preventDefault();
                  }
                }
              }
              style={{
                padding: "0.75rem 1.5rem",
                fontSize: "1rem",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Delete Step
            </button>
          </Form>
        </div>

        <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid #dee2e6" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ margin: 0 }}>Ingredients</h2>
            <button
              onClick={() => setShowIngredientForm(!showIngredientForm)}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {showIngredientForm ? "Cancel" : "+ Add Ingredient"}
            </button>
          </div>

          {showIngredientForm && (
            <Form
              method="post"
              style={{
                backgroundColor: "#f8f9fa",
                padding: "1.5rem",
                borderRadius: "8px",
                marginBottom: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <input type="hidden" name="intent" value="addIngredient" />
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
                    required
                    placeholder="1.5"
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
                    required
                    placeholder="cup"
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
                    Ingredient
                  </label>
                  <input
                    type="text"
                    id="ingredientName"
                    name="ingredientName"
                    required
                    placeholder="flour"
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
          )}

          {step.ingredients.length === 0 ? (
            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "2rem",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <p style={{ color: "#666" }}>No ingredients added yet</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {step.ingredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  style={{
                    backgroundColor: "white",
                    border: "1px solid #dee2e6",
                    borderRadius: "4px",
                    padding: "0.75rem 1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>
                    <strong>{ingredient.quantity}</strong> {ingredient.unit.name} {ingredient.ingredientRef.name}
                  </span>
                  <Form method="post" style={{ margin: 0 }}>
                    <input type="hidden" name="intent" value="deleteIngredient" />
                    <input type="hidden" name="ingredientId" value={ingredient.id} />
                    <button
                      type="submit"
                      onClick={
                        /* istanbul ignore next -- browser confirm dialog */
                        (e) => {
                          if (!confirm("Remove this ingredient?")) {
                            e.preventDefault();
                          }
                        }
                      }
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
    </div>
  );
}
