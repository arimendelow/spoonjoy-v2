import type { Route } from "./+types/cookbooks.$id";
import { Link, redirect, useLoaderData, Form, data } from "react-router";
import { getDb, db } from "~/lib/db.server";
import { requireUserId } from "~/lib/session.server";
import { useState } from "react";

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const { id } = params;

  const database = context?.cloudflare?.env?.DB
    ? getDb(context.cloudflare.env as { DB: D1Database })
    : db;

  const cookbook = await database.cookbook.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          username: true,
        },
      },
      recipes: {
        include: {
          recipe: {
            select: {
              id: true,
              title: true,
              description: true,
              imageUrl: true,
              servings: true,
              chef: {
                select: {
                  username: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!cookbook) {
    throw new Response("Cookbook not found", { status: 404 });
  }

  // Check if user owns this cookbook
  const isOwner = cookbook.authorId === userId;

  // Get user's recipes that aren't in this cookbook
  const availableRecipes = isOwner
    ? await database.recipe.findMany({
        where: {
          chefId: userId,
          deletedAt: null,
          NOT: {
            cookbooks: {
              some: {
                cookbookId: id,
              },
            },
          },
        },
        select: {
          id: true,
          title: true,
        },
        orderBy: {
          title: "asc",
        },
      })
    : [];

  return { cookbook, isOwner, availableRecipes };
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
  const cookbook = await database.cookbook.findUnique({
    where: { id },
    select: { authorId: true },
  });

  if (!cookbook) {
    throw new Response("Cookbook not found", { status: 404 });
  }

  if (cookbook.authorId !== userId) {
    throw new Response("Unauthorized", { status: 403 });
  }

  if (intent === "updateTitle") {
    const title = formData.get("title")?.toString() || "";
    if (!title.trim()) {
      return data({ error: "Title is required" }, { status: 400 });
    }
    try {
      await database.cookbook.update({
        where: { id },
        data: { title: title.trim() },
      });
      return data({ success: true });
    } catch (error: any) {
      if (error.code === "P2002") {
        return data({ error: "You already have a cookbook with this title" }, { status: 400 });
      }
      throw error;
    }
  }

  if (intent === "delete") {
    await database.cookbook.delete({
      where: { id },
    });
    return redirect("/cookbooks");
  }

  if (intent === "addRecipe") {
    const recipeId = formData.get("recipeId")?.toString();
    if (recipeId) {
      try {
        await database.recipeInCookbook.create({
          data: {
            cookbookId: id,
            recipeId,
            addedById: userId,
          },
        });
        return data({ success: true });
      } catch (error: any) {
        if (error.code === "P2002") {
          return data({ error: "Recipe already in cookbook" }, { status: 400 });
        }
        throw error;
      }
    }
  }

  if (intent === "removeRecipe") {
    const recipeInCookbookId = formData.get("recipeInCookbookId")?.toString();
    if (recipeInCookbookId) {
      await database.recipeInCookbook.delete({
        where: { id: recipeInCookbookId },
      });
      return data({ success: true });
    }
  }

  return null;
}

export default function CookbookDetail() {
  const { cookbook, isOwner, availableRecipes } = useLoaderData<typeof loader>();
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8", padding: "2rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
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

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
          <div style={{ flex: 1 }}>
            {isEditingTitle && isOwner ? (
              <Form method="post" style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
                <input type="hidden" name="intent" value="updateTitle" />
                <input
                  type="text"
                  name="title"
                  defaultValue={cookbook.title}
                  required
                  autoFocus
                  style={{
                    fontSize: "2rem",
                    fontWeight: "bold",
                    padding: "0.25rem 0.5rem",
                    border: "2px solid #0066cc",
                    borderRadius: "4px",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(false)}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </Form>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                <h1 style={{ margin: 0 }}>{cookbook.title}</h1>
                {isOwner && (
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    style={{
                      padding: "0.25rem 0.75rem",
                      fontSize: "0.875rem",
                      backgroundColor: "#0066cc",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Edit Title
                  </button>
                )}
              </div>
            )}
            <p style={{ color: "#666", margin: 0 }}>
              By <strong>{cookbook.author.username}</strong>
            </p>
            <p style={{ color: "#999", margin: "0.5rem 0 0 0", fontSize: "0.875rem" }}>
              {cookbook.recipes.length} {cookbook.recipes.length === 1 ? "recipe" : "recipes"}
            </p>
          </div>
          {isOwner && (
            <Form method="post">
              <input type="hidden" name="intent" value="delete" />
              <button
                type="submit"
                onClick={
                  /* istanbul ignore next -- browser confirm dialog */
                  (e) => {
                    if (!confirm("Are you sure you want to delete this cookbook?")) {
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
                Delete Cookbook
              </button>
            </Form>
          )}
        </div>

        {isOwner && availableRecipes.length > 0 && (
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "1.5rem",
              borderRadius: "8px",
              marginBottom: "2rem",
            }}
          >
            <h3 style={{ margin: "0 0 1rem 0" }}>Add Recipe to Cookbook</h3>
            <Form method="post" style={{ display: "flex", gap: "1rem" }}>
              <input type="hidden" name="intent" value="addRecipe" />
              <select
                name="recipeId"
                required
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  fontSize: "1rem",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              >
                <option value="">Select a recipe...</option>
                {availableRecipes.map((recipe) => (
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
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Add Recipe
              </button>
            </Form>
          </div>
        )}

        {cookbook.recipes.length === 0 ? (
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
              {isOwner ? "Add recipes to your cookbook using the form above" : "This cookbook is empty"}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {cookbook.recipes.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: "white",
                  border: "1px solid #dee2e6",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <Link
                  to={`/recipes/${item.recipe.id}`}
                  style={{
                    display: "block",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "200px",
                      backgroundColor: "#f8f9fa",
                      backgroundImage: `url(${item.recipe.imageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div style={{ padding: "1rem" }}>
                    <h3 style={{ margin: "0 0 0.5rem 0" }}>{item.recipe.title}</h3>
                    {item.recipe.description && (
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
                        {item.recipe.description}
                      </p>
                    )}
                    <p style={{ color: "#999", fontSize: "0.875rem", margin: 0 }}>
                      By {item.recipe.chef.username}
                    </p>
                  </div>
                </Link>
                {isOwner && (
                  <div style={{ padding: "0 1rem 1rem" }}>
                    <Form method="post">
                      <input type="hidden" name="intent" value="removeRecipe" />
                      <input type="hidden" name="recipeInCookbookId" value={item.id} />
                      <button
                        type="submit"
                        onClick={
                          /* istanbul ignore next -- browser confirm dialog */
                          (e) => {
                            if (!confirm("Remove this recipe from the cookbook?")) {
                              e.preventDefault();
                            }
                          }
                        }
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          fontSize: "0.875rem",
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Remove from Cookbook
                      </button>
                    </Form>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
