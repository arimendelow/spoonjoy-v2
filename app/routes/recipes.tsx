import type { Route } from "./+types/recipes";
import { Form, useLoaderData } from "react-router";
import { requireUserId } from "~/lib/session.server";
import { getUserById } from "~/lib/auth.server";
import { getDb, db } from "~/lib/db.server";

export async function loader({ request, context }: Route.LoaderArgs) {
  const userId = await requireUserId(request);

  /* istanbul ignore next -- Cloudflare D1 production-only path */
  const database = context?.cloudflare?.env?.DB
    ? getDb(context.cloudflare.env as { DB: D1Database })
    : db;

  const user = await getUserById(database, userId);

  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  const recipes = await database.recipe.findMany({
    where: { chefId: userId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      servings: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return { user, recipes };
}

export default function Recipes() {
  const { user, recipes } = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1>My Recipes</h1>
          <p style={{ color: "#666" }}>Welcome back, {user.username}!</p>
        </div>
        <Form method="post" action="/logout">
          <button
            type="submit"
            style={{
              padding: "0.5rem 1rem",
              fontSize: "1rem",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Log Out
          </button>
        </Form>
      </div>

      {recipes.length === 0 ? (
        <div
          style={{
            padding: "3rem",
            textAlign: "center",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
          }}
        >
          <h2>No recipes yet</h2>
          <p style={{ color: "#666", marginBottom: "1.5rem" }}>
            Start building your recipe collection!
          </p>
          <button
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
            Create Your First Recipe
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                overflow: "hidden",
                backgroundColor: "white",
              }}
            >
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                }}
              />
              <div style={{ padding: "1rem" }}>
                <h3 style={{ margin: "0 0 0.5rem 0" }}>{recipe.title}</h3>
                {recipe.description && (
                  <p
                    style={{
                      color: "#666",
                      fontSize: "0.875rem",
                      margin: "0 0 0.5rem 0",
                    }}
                  >
                    {recipe.description}
                  </p>
                )}
                {recipe.servings && (
                  <p style={{ fontSize: "0.875rem", color: "#888", margin: 0 }}>
                    Servings: {recipe.servings}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
