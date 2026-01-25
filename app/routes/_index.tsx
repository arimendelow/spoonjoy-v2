import type { Route } from "./+types/_index";
import { redirect, useLoaderData } from "react-router";
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
    throw redirect("/login");
  }

  const database = context?.cloudflare?.env?.DB
    ? getDb(context.cloudflare.env as { DB: D1Database })
    : db;

  const user = await getUserById(database, userId);

  if (!user) {
    throw redirect("/login");
  }

  return { user };
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>();

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
          <a
            href="/logout"
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#dc3545",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
            }}
          >
            Logout
          </a>
        </div>

        <div style={{ backgroundColor: "#f8f9fa", padding: "1.5rem", borderRadius: "8px", marginBottom: "1.5rem" }}>
          <h2 style={{ marginTop: 0 }}>Account Info</h2>
          <p><strong>User ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>

        <div>
          <h2>What's Next?</h2>
          <p>
            This is the foundation for the Spoonjoy rebuild. Features coming soon:
          </p>
          <ul>
            <li>Recipe creation and management</li>
            <li>Recipe steps and ingredients</li>
            <li>Cookbooks</li>
            <li>Shopping lists</li>
            <li>Recipe sharing and forking</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
