import type { Route } from "./+types/_index";
import { Link, useLoaderData, Form } from "react-router";
import { getDb, db } from "~/lib/db.server";
import { getUserId } from "~/lib/session.server";
import { getUserById } from "~/lib/auth.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Spoonjoy - Recipe Management" },
    { name: "description", content: "Manage your recipes with ease" },
  ];
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const userId = await getUserId(request);

  if (!userId) {
    return { user: null };
  }

  /* istanbul ignore next -- Cloudflare D1 production-only path */
  const database = context?.cloudflare?.env?.DB
    ? getDb(context.cloudflare.env as { DB: D1Database })
    : db;

  const user = await getUserById(database, userId);
  return { user };
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>();

  if (!user) {
    return (
      <div
        style={{
          fontFamily: "system-ui, sans-serif",
          lineHeight: "1.8",
          padding: "2rem",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <h1>Welcome to Spoonjoy v2</h1>
        <p style={{ fontSize: "1.125rem", color: "#666" }}>
          Your personal recipe management system
        </p>

        <div
          style={{
            marginTop: "3rem",
            padding: "2rem",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
          }}
        >
          <h2>Get Started</h2>
          <p style={{ marginBottom: "1.5rem" }}>
            Sign up or log in to start managing your recipes
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link
              to="/signup"
              style={{
                padding: "0.75rem 1.5rem",
                fontSize: "1rem",
                backgroundColor: "#0066cc",
                color: "white",
                textDecoration: "none",
                borderRadius: "4px",
              }}
            >
              Sign Up
            </Link>
            <Link
              to="/login"
              style={{
                padding: "0.75rem 1.5rem",
                fontSize: "1rem",
                backgroundColor: "white",
                color: "#0066cc",
                textDecoration: "none",
                borderRadius: "4px",
                border: "1px solid #0066cc",
              }}
            >
              Log In
            </Link>
          </div>
        </div>

        <div style={{ marginTop: "2rem", fontSize: "0.875rem", color: "#888" }}>
          <p>Built with React Router v7 on Cloudflare</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h1>Welcome to Spoonjoy v2</h1>
            <p style={{ color: "#666", margin: "0.5rem 0" }}>
              Logged in as <strong>{user.username}</strong> ({user.email})
            </p>
          </div>
          <Form method="post" action="/logout">
            <button
              type="submit"
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </Form>
        </div>

        <div style={{ backgroundColor: "#f8f9fa", padding: "1.5rem", borderRadius: "8px", marginBottom: "1.5rem" }}>
          <h2 style={{ marginTop: 0 }}>Account Info</h2>
          <p><strong>User ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>

        <div>
          <h2>Quick Links</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
            <Link
              to="/recipes"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "1.5rem 1rem",
                backgroundColor: "#0066cc",
                color: "white",
                textDecoration: "none",
                borderRadius: "8px",
                fontWeight: "bold",
              }}
            >
              <span style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🍳</span>
              My Recipes
            </Link>
            <Link
              to="/cookbooks"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "1.5rem 1rem",
                backgroundColor: "#17a2b8",
                color: "white",
                textDecoration: "none",
                borderRadius: "8px",
                fontWeight: "bold",
              }}
            >
              <span style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📖</span>
              Cookbooks
            </Link>
            <Link
              to="/shopping-list"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "1.5rem 1rem",
                backgroundColor: "#ffc107",
                color: "#333",
                textDecoration: "none",
                borderRadius: "8px",
                fontWeight: "bold",
              }}
            >
              <span style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🛒</span>
              Shopping List
            </Link>
            <Link
              to="/recipes/new"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "1.5rem 1rem",
                backgroundColor: "#28a745",
                color: "white",
                textDecoration: "none",
                borderRadius: "8px",
                fontWeight: "bold",
              }}
            >
              <span style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>➕</span>
              Create Recipe
            </Link>
          </div>
        </div>

        <div style={{ marginTop: "2rem" }}>
          <h2>What's Next?</h2>
          <p>
            Features coming soon:
          </p>
          <ul>
            <li>Recipe sharing and forking</li>
            <li>Image upload</li>
            <li>Mobile app</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
