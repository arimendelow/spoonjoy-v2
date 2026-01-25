import type { Route } from "./+types/cookbooks.new";
import { Form, Link, redirect, data, useActionData } from "react-router";
import { getDb, db } from "~/lib/db.server";
import { requireUserId } from "~/lib/session.server";

interface ActionData {
  errors?: {
    title?: string;
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

  const errors: ActionData["errors"] = {};

  // Validation
  if (!title || title.trim().length === 0) {
    errors.title = "Title is required";
  }

  if (Object.keys(errors).length > 0) {
    return data({ errors }, { status: 400 });
  }

  const database = context?.cloudflare?.env?.DB
    ? getDb(context.cloudflare.env as { DB: D1Database })
    : db;

  try {
    const cookbook = await database.cookbook.create({
      data: {
        title: title.trim(),
        authorId: userId,
      },
    });

    return redirect(`/cookbooks/${cookbook.id}`);
  } catch (error: any) {
    // Check for unique constraint violation
    if (error.code === "P2002") {
      return data(
        { errors: { title: "You already have a cookbook with this title" } },
        { status: 400 }
      );
    }
    return data(
      { errors: { general: "Failed to create cookbook. Please try again." } },
      { status: 500 }
    );
  }
}

export default function NewCookbook() {
  const actionData = useActionData<ActionData>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8", padding: "2rem" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1>Create New Cookbook</h1>
          <Link
            to="/cookbooks"
            style={{
              color: "#0066cc",
              textDecoration: "none",
            }}
          >
            ← Back to cookbooks
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
            <label htmlFor="title" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
              Cookbook Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              placeholder="e.g., Family Favorites, Holiday Recipes"
              style={{
                width: "100%",
                padding: "0.75rem",
                fontSize: "1rem",
                border: actionData?.errors?.title ? "1px solid #c33" : "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            {actionData?.errors?.title && (
              <div style={{ color: "#c33", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                {actionData.errors.title}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
            <Link
              to="/cookbooks"
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
              Create Cookbook
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
