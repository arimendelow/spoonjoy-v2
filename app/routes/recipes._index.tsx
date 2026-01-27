import type { Route } from "./+types/recipes._index";
import { Link, redirect, useLoaderData } from "react-router";
import { getDb, db } from "~/lib/db.server";
import { requireUserId } from "~/lib/session.server";

export async function loader({ request, context }: Route.LoaderArgs) {
  const userId = await requireUserId(request);

  /* istanbul ignore next -- @preserve Cloudflare D1 production-only path */
  const database = context?.cloudflare?.env?.DB
    ? getDb(context.cloudflare.env as { DB: D1Database })
    : db;

  const recipes = await database.recipe.findMany({
    where: {
      chefId: userId,
      deletedAt: null,
    },
    orderBy: {
      updatedAt: "desc",
    },
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

  return { recipes };
}

export default function RecipesList() {
  const { recipes } = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8", padding: "2rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h1>My Recipes</h1>
            <p style={{ color: "#666", margin: "0.5rem 0 0 0" }}>
              {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"}
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
            <Link
              to="/recipes/new"
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#28a745",
                color: "white",
                textDecoration: "none",
                borderRadius: "4px",
              }}
            >
              + New Recipe
            </Link>
          </div>
        </div>

        {recipes.length === 0 ? (
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "3rem",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <h2 style={{ color: "#6c757d" }}>No recipes yet</h2>
            <p style={{ color: "#999", marginBottom: "1.5rem" }}>
              Create your first recipe to get started
            </p>
            <Link
              to="/recipes/new"
              style={{
                display: "inline-block",
                padding: "0.75rem 1.5rem",
                backgroundColor: "#28a745",
                color: "white",
                textDecoration: "none",
                borderRadius: "4px",
              }}
            >
              Create Recipe
            </Link>
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
              <Link
                key={recipe.id}
                to={`/recipes/${recipe.id}`}
                style={{
                  backgroundColor: "white",
                  border: "1px solid #dee2e6",
                  borderRadius: "8px",
                  overflow: "hidden",
                  textDecoration: "none",
                  color: "inherit",
                  transition: "box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "200px",
                    backgroundColor: "#f8f9fa",
                    backgroundImage: `url(${recipe.imageUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
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
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {recipe.description}
                    </p>
                  )}
                  {recipe.servings && (
                    <p style={{ color: "#999", fontSize: "0.875rem", margin: 0 }}>
                      Servings: {recipe.servings}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
