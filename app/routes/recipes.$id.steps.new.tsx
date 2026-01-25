import type { Route } from "./+types/recipes.$id.steps.new";
import { Form, Link, redirect, data, useActionData, useLoaderData } from "react-router";
import { getDb, db } from "~/lib/db.server";
import { requireUserId } from "~/lib/session.server";

interface ActionData {
  errors?: {
    stepTitle?: string;
    description?: string;
    general?: string;
  };
}

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const { id } = params;

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
      steps: {
        select: { stepNum: true },
        orderBy: { stepNum: "desc" },
        take: 1,
      },
    },
  });

  if (!recipe || recipe.deletedAt) {
    throw new Response("Recipe not found", { status: 404 });
  }

  if (recipe.chefId !== userId) {
    throw new Response("Unauthorized", { status: 403 });
  }

  const nextStepNum = recipe.steps.length > 0 ? recipe.steps[0].stepNum + 1 : 1;

  return { recipe, nextStepNum };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const { id } = params;
  const formData = await request.formData();

  const database = context?.cloudflare?.env?.DB
    ? getDb(context.cloudflare.env as { DB: D1Database })
    : db;

  // Verify ownership
  const recipe = await database.recipe.findUnique({
    where: { id },
    select: {
      chefId: true,
      deletedAt: true,
      steps: {
        select: { stepNum: true },
        orderBy: { stepNum: "desc" },
        take: 1,
      },
    },
  });

  if (!recipe || recipe.deletedAt) {
    throw new Response("Recipe not found", { status: 404 });
  }

  if (recipe.chefId !== userId) {
    throw new Response("Unauthorized", { status: 403 });
  }

  const stepTitle = formData.get("stepTitle")?.toString() || "";
  const description = formData.get("description")?.toString() || "";

  const errors: ActionData["errors"] = {};

  // Validation
  if (!description || description.trim().length === 0) {
    errors.description = "Step description is required";
  }

  if (Object.keys(errors).length > 0) {
    return data({ errors }, { status: 400 });
  }

  const nextStepNum = recipe.steps.length > 0 ? recipe.steps[0].stepNum + 1 : 1;

  try {
    const step = await database.recipeStep.create({
      data: {
        recipeId: id,
        stepNum: nextStepNum,
        stepTitle: stepTitle.trim() || null,
        description: description.trim(),
      },
    });

    return redirect(`/recipes/${id}/steps/${step.id}/edit`);
  } catch (error) {
    return data(
      { errors: { general: "Failed to create step. Please try again." } },
      { status: 500 }
    );
  }
}

export default function NewStep() {
  const { recipe, nextStepNum } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1>Add Step to {recipe.title}</h1>
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

        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
          }}
        >
          <p style={{ margin: 0 }}>
            <strong>Step Number:</strong> {nextStepNum}
          </p>
        </div>

        <Form method="post" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <label htmlFor="stepTitle" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
              Step Title (optional)
            </label>
            <input
              type="text"
              id="stepTitle"
              name="stepTitle"
              placeholder="e.g., Prepare the dough"
              style={{
                width: "100%",
                padding: "0.75rem",
                fontSize: "1rem",
                border: actionData?.errors?.stepTitle ? "1px solid #c33" : "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            {actionData?.errors?.stepTitle && (
              <div style={{ color: "#c33", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                {actionData.errors.stepTitle}
              </div>
            )}
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
              placeholder="Describe what to do in this step..."
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
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Create Step & Add Ingredients
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
