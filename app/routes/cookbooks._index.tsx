import type { Route } from "./+types/cookbooks._index";
import { Link, useLoaderData } from "react-router";
import { getDb, db } from "~/lib/db.server";
import { requireUserId } from "~/lib/session.server";

export async function loader({ request, context }: Route.LoaderArgs) {
  const userId = await requireUserId(request);

  /* istanbul ignore next -- @preserve Cloudflare D1 production-only path */
  const database = context?.cloudflare?.env?.DB
    ? getDb(context.cloudflare.env as { DB: D1Database })
    : db;

  const cookbooks = await database.cookbook.findMany({
    where: {
      authorId: userId,
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      _count: {
        select: { recipes: true },
      },
    },
  });

  return { cookbooks };
}

export default function CookbooksList() {
  const { cookbooks } = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8", padding: "2rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h1>My Cookbooks</h1>
            <p style={{ color: "#666", margin: "0.5rem 0 0 0" }}>
              {cookbooks.length} {cookbooks.length === 1 ? "cookbook" : "cookbooks"}
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
              to="/cookbooks/new"
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#28a745",
                color: "white",
                textDecoration: "none",
                borderRadius: "4px",
              }}
            >
              + New Cookbook
            </Link>
          </div>
        </div>

        {cookbooks.length === 0 ? (
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "3rem",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <h2 style={{ color: "#6c757d" }}>No cookbooks yet</h2>
            <p style={{ color: "#999", marginBottom: "1.5rem" }}>
              Create your first cookbook to organize your recipes
            </p>
            <Link
              to="/cookbooks/new"
              style={{
                display: "inline-block",
                padding: "0.75rem 1.5rem",
                backgroundColor: "#28a745",
                color: "white",
                textDecoration: "none",
                borderRadius: "4px",
              }}
            >
              Create Cookbook
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
            {cookbooks.map((cookbook) => (
              <Link
                key={cookbook.id}
                to={`/cookbooks/${cookbook.id}`}
                style={{
                  backgroundColor: "white",
                  border: "2px solid #0066cc",
                  borderRadius: "8px",
                  padding: "1.5rem",
                  textDecoration: "none",
                  color: "inherit",
                  transition: "box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,102,204,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      backgroundColor: "#0066cc",
                      color: "white",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem",
                      marginRight: "1rem",
                    }}
                  >
                    📖
                  </div>
                  <h3 style={{ margin: 0, flex: 1 }}>{cookbook.title}</h3>
                </div>
                <p style={{ color: "#666", margin: 0 }}>
                  {cookbook._count.recipes} {cookbook._count.recipes === 1 ? "recipe" : "recipes"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
