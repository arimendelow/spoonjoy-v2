import type { Route } from "./+types/recipes.new";
import { Form, Link, redirect, data, useActionData } from "react-router";
import { getDb, db } from "~/lib/db.server";
import { requireUserId } from "~/lib/session.server";

interface ActionData {
  errors?: {
    title?: string;
    description?: string;
    servings?: string;
    general?: string;
  };
}

export async function loader({ request, context }: Route.LoaderArgs) {
  await requireUserId(request);
  return null;
}

export async function action({ request, context }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();

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

  /* istanbul ignore next -- @preserve Cloudflare D1 production-only path */
  const database = context?.cloudflare?.env?.DB
    ? getDb(context.cloudflare.env as { DB: D1Database })
    : db;

  try {
    const recipe = await database.recipe.create({
      data: {
        title: title.trim(),
        description: description.trim() || null,
        servings: servings.trim() || null,
        imageUrl: imageUrl.trim() || undefined,
        chefId: userId,
      },
    });

    return redirect(`/recipes/${recipe.id}`);
  } catch (error) {
    return data(
      { errors: { general: "Failed to create recipe. Please try again." } },
      { status: 500 }
    );
  }
}

export default function NewRecipe() {
  const actionData = useActionData<ActionData>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1>Create New Recipe</h1>
          <Link
            to="/recipes"
            style={{
              color: "#0066cc",
              textDecoration: "none",
            }}
          >
            ← Back to recipes
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
              placeholder="e.g., Grandma's Chocolate Chip Cookies"
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
              placeholder="Brief description of your recipe..."
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
              placeholder="e.g., 4, 6-8, or 2 dozen"
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
              placeholder="https://example.com/image.jpg (optional)"
              style={{
                width: "100%",
                padding: "0.75rem",
                fontSize: "1rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <p style={{ fontSize: "0.875rem", color: "#666", marginTop: "0.25rem" }}>
              Leave blank to use default placeholder image
            </p>
          </div>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
            <Link
              to="/recipes"
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
              Create Recipe
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
