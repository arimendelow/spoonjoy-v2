import type { Route } from "./+types/recipes.$id";
import { Link, redirect, useLoaderData, Form, data } from "react-router";
import { getDb, db } from "~/lib/db.server";
import { requireUserId } from "~/lib/session.server";

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const { id } = params;

  const database = context?.cloudflare?.env?.DB
    ? getDb(context.cloudflare.env as { DB: D1Database })
    : db;

  const recipe = await database.recipe.findUnique({
    where: { id },
    include: {
      chef: {
        select: {
          id: true,
          username: true,
        },
      },
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

  // Check if user owns this recipe
  const isOwner = recipe.chefId === userId;

  return { recipe, isOwner };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const { id } = params;
  const formData = await request.formData();
  const intent = formData.get("intent");

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

  if (intent === "delete") {
    // Soft delete
    await database.recipe.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return redirect("/recipes");
  }

  return null;
}

export default function RecipeDetail() {
  const { recipe, isOwner } = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8", padding: "2rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
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

        <div
          style={{
            width: "100%",
            height: "300px",
            backgroundColor: "#f8f9fa",
            backgroundImage: `url(${recipe.imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: "8px",
            marginBottom: "2rem",
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
          <div>
            <h1 style={{ margin: "0 0 0.5rem 0" }}>{recipe.title}</h1>
            <p style={{ color: "#666", margin: 0 }}>
              By <strong>{recipe.chef.username}</strong>
            </p>
          </div>
          {isOwner && (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Link
                to={`/recipes/${recipe.id}/edit`}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#0066cc",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "4px",
                }}
              >
                Edit
              </Link>
              <Form method="post">
                <input type="hidden" name="intent" value="delete" />
                <button
                  type="submit"
                  onClick={
                    /* istanbul ignore next -- browser confirm dialog */
                    (e) => {
                      if (!confirm("Are you sure you want to delete this recipe?")) {
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
                  Delete
                </button>
              </Form>
            </div>
          )}
        </div>

        {recipe.description && (
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "1.5rem",
              borderRadius: "8px",
              marginBottom: "2rem",
            }}
          >
            <p style={{ margin: 0 }}>{recipe.description}</p>
          </div>
        )}

        {recipe.servings && (
          <div style={{ marginBottom: "2rem" }}>
            <p>
              <strong>Servings:</strong> {recipe.servings}
            </p>
          </div>
        )}

        <div>
          <h2>Steps</h2>
          {recipe.steps.length === 0 ? (
            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "2rem",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <p style={{ color: "#666", marginBottom: "1rem" }}>No steps added yet</p>
              {isOwner && (
                <Link
                  to={`/recipes/${recipe.id}/edit`}
                  style={{
                    display: "inline-block",
                    padding: "0.5rem 1rem",
                    backgroundColor: "#0066cc",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "4px",
                  }}
                >
                  Add Steps
                </Link>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {recipe.steps.map((step) => (
                <div
                  key={step.id}
                  style={{
                    backgroundColor: "white",
                    border: "1px solid #dee2e6",
                    borderRadius: "8px",
                    padding: "1.5rem",
                  }}
                >
                  <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
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
                        <h3 style={{ margin: "0 0 0.5rem 0" }}>{step.stepTitle}</h3>
                      )}
                      <p style={{ margin: 0 }}>{step.description}</p>
                    </div>
                  </div>

                  {step.ingredients.length > 0 && (
                    <div
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "1rem",
                        borderRadius: "4px",
                        marginTop: "1rem",
                      }}
                    >
                      <h4 style={{ margin: "0 0 0.75rem 0", fontSize: "0.875rem", textTransform: "uppercase", color: "#666" }}>
                        Ingredients
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
                        {step.ingredients.map((ingredient) => (
                          <li key={ingredient.id}>
                            {ingredient.quantity} {ingredient.unit.name} {ingredient.ingredientRef.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
