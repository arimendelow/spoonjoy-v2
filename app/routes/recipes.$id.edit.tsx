import type { Route } from "./+types/recipes.$id.edit";
import { Form, Link, redirect, data, useActionData, useLoaderData } from "react-router";
import { getDb, db } from "~/lib/db.server";
import { requireUserId } from "~/lib/session.server";
import { useState } from "react";

interface ActionData {
  errors?: {
    title?: string;
    description?: string;
    servings?: string;
    general?: string;
  };
}

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const { id } = params;

  /* istanbul ignore next -- @preserve Cloudflare D1 production-only path */
  const database = context?.cloudflare?.env?.DB
    ? getDb(context.cloudflare.env as { DB: D1Database })
    : db;

  const recipe = await database.recipe.findUnique({
    where: { id },
    include: {
      steps: {
        orderBy: {
          stepNum: "asc",
        },
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

  if (!recipe || recipe.deletedAt) {
    throw new Response("Recipe not found", { status: 404 });
  }

  if (recipe.chefId !== userId) {
    throw new Response("Unauthorized", { status: 403 });
  }

  return { recipe };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const { id } = params;
  const formData = await request.formData();
  const intent = formData.get("intent")?.toString();

  /* istanbul ignore next -- @preserve Cloudflare D1 production-only path */
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

  // Handle reorder step intent
  if (intent === "reorderStep") {
    const stepId = formData.get("stepId")?.toString();
    const direction = formData.get("direction")?.toString();

    if (stepId && (direction === "up" || direction === "down")) {
      const step = await database.recipeStep.findUnique({
        where: { id: stepId },
        select: { stepNum: true, recipeId: true },
      });

      if (step && step.recipeId === id) {
        const targetStepNum = direction === "up" ? step.stepNum - 1 : step.stepNum + 1;

        // Find the step to swap with
        const targetStep = await database.recipeStep.findUnique({
          where: {
            recipeId_stepNum: {
              recipeId: id,
              stepNum: targetStepNum,
            },
          },
        });

        if (targetStep) {
          // Swap step numbers using a temporary number to avoid unique constraint violation
          const tempStepNum = -1;

          await database.recipeStep.update({
            where: { id: stepId },
            data: { stepNum: tempStepNum },
          });

          await database.recipeStep.update({
            where: { id: targetStep.id },
            data: { stepNum: step.stepNum },
          });

          await database.recipeStep.update({
            where: { id: stepId },
            data: { stepNum: targetStepNum },
          });

          return data({ success: true });
        }
      }
    }
  }

  const title = formData.get("title")?.toString() || "";
  const description = formData.get("description")?.toString() || "";
  const servings = formData.get("servings")?.toString() || "";
  const imageUrl = formData.get("imageUrl")?.toString() || "";

  const errors: ActionData["errors"] = {};

  // Validation
  if (!title || title.trim().length === 0) {
    errors.title = "Title is required";
  }

  if (Object.keys(errors).length > 0) {
    return data({ errors }, { status: 400 });
  }

  try {
    await database.recipe.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description.trim() || null,
        servings: servings.trim() || null,
        imageUrl: imageUrl.trim() || undefined,
      },
    });

    return redirect(`/recipes/${id}`);
  } catch (error) {
    return data(
      { errors: { general: "Failed to update recipe. Please try again." } },
      { status: 500 }
    );
  }
}

export default function EditRecipe() {
  const { recipe } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1>Edit Recipe</h1>
          <Link
            to={`/recipes/${recipe.id}`}
            style={{
              color: "#0066cc",
              textDecoration: "none",
            }}
          >
            ← Back to recipe
          </Link>
        </div>

        {/* istanbul ignore next -- @preserve */ actionData?.errors?.general && (
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
            <label htmlFor="title" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
              Recipe Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              defaultValue={recipe.title}
              style={{
                width: "100%",
                padding: "0.75rem",
                fontSize: "1rem",
                border: /* istanbul ignore next -- @preserve */ actionData?.errors?.title ? "1px solid #c33" : "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            {/* istanbul ignore next -- @preserve */ actionData?.errors?.title && (
              <div style={{ color: "#c33", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                {actionData.errors.title}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="description" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={recipe.description || ""}
              style={{
                width: "100%",
                padding: "0.75rem",
                fontSize: "1rem",
                border: /* istanbul ignore next -- @preserve */ actionData?.errors?.description ? "1px solid #c33" : "1px solid #ccc",
                borderRadius: "4px",
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />
            {/* istanbul ignore next -- @preserve */ actionData?.errors?.description && (
              <div style={{ color: "#c33", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                {actionData.errors.description}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="servings" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
              Servings
            </label>
            <input
              type="text"
              id="servings"
              name="servings"
              defaultValue={recipe.servings || ""}
              style={{
                width: "100%",
                padding: "0.75rem",
                fontSize: "1rem",
                border: /* istanbul ignore next -- @preserve */ actionData?.errors?.servings ? "1px solid #c33" : "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            {/* istanbul ignore next -- @preserve */ actionData?.errors?.servings && (
              <div style={{ color: "#c33", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                {actionData.errors.servings}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="imageUrl" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
              Image URL
            </label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              defaultValue={recipe.imageUrl}
              style={{
                width: "100%",
                padding: "0.75rem",
                fontSize: "1rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
            <Link
              to={`/recipes/${recipe.id}`}
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

        <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid #dee2e6" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ margin: 0 }}>Recipe Steps</h2>
            <Link
              to={`/recipes/${recipe.id}/steps/new`}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#28a745",
                color: "white",
                textDecoration: "none",
                borderRadius: "4px",
              }}
            >
              + Add Step
            </Link>
          </div>

          {recipe.steps.length === 0 ? (
            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "2rem",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <p style={{ color: "#666" }}>No steps added yet</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {recipe.steps.map((step, index) => (
                <div
                  key={step.id}
                  style={{
                    backgroundColor: "white",
                    border: "1px solid #dee2e6",
                    borderRadius: "8px",
                    padding: "1rem",
                  }}
                >
                  <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        backgroundColor: "#0066cc",
                        color: "white",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        flexShrink: 0,
                      }}
                    >
                      {step.stepNum}
                    </div>
                    <div style={{ flex: 1 }}>
                      {step.stepTitle && (
                        <h4 style={{ margin: "0 0 0.5rem 0" }}>{step.stepTitle}</h4>
                      )}
                      <p style={{ margin: "0 0 0.5rem 0", color: "#666" }}>{step.description}</p>
                      {step.ingredients.length > 0 && (
                        <div style={{ fontSize: "0.875rem", color: "#999" }}>
                          {step.ingredients.length} ingredient{step.ingredients.length !== 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      {index > 0 && (
                        <Form method="post">
                          <input type="hidden" name="intent" value="reorderStep" />
                          <input type="hidden" name="stepId" value={step.id} />
                          <input type="hidden" name="direction" value="up" />
                          <button
                            type="submit"
                            style={{
                              padding: "0.25rem 0.5rem",
                              backgroundColor: "#6c757d",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "0.75rem",
                            }}
                            title="Move up"
                          >
                            ↑
                          </button>
                        </Form>
                      )}
                      {index < recipe.steps.length - 1 && (
                        <Form method="post">
                          <input type="hidden" name="intent" value="reorderStep" />
                          <input type="hidden" name="stepId" value={step.id} />
                          <input type="hidden" name="direction" value="down" />
                          <button
                            type="submit"
                            style={{
                              padding: "0.25rem 0.5rem",
                              backgroundColor: "#6c757d",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "0.75rem",
                            }}
                            title="Move down"
                          >
                            ↓
                          </button>
                        </Form>
                      )}
                    </div>
                    <Link
                      to={`/recipes/${recipe.id}/steps/${step.id}/edit`}
                      style={{
                        padding: "0.25rem 0.75rem",
                        backgroundColor: "#0066cc",
                        color: "white",
                        textDecoration: "none",
                        borderRadius: "4px",
                        fontSize: "0.875rem",
                      }}
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
