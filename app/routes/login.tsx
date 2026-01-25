import type { Route } from "./+types/login";
import { Form, redirect, data, useActionData } from "react-router";
import { getDb, db } from "~/lib/db.server";
import { authenticateUser } from "~/lib/auth.server";
import { createUserSession, getUserId } from "~/lib/session.server";

interface ActionData {
  errors?: {
    email?: string;
    password?: string;
    general?: string;
  };
}

// Loader - redirect if already logged in
export async function loader({ request, context }: Route.LoaderArgs) {
  const userId = await getUserId(request);
  if (userId) {
    throw redirect("/");
  }
  return null;
}

// Action - handle login form submission
export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email")?.toString() || "";
  const password = formData.get("password")?.toString() || "";

  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirectTo") || "/recipes";

  const errors: ActionData["errors"] = {};

  // Validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Valid email is required";
  }

  if (!password) {
    errors.password = "Password is required";
  }

  if (Object.keys(errors).length > 0) {
    return data({ errors }, { status: 400 });
  }

  // Get the appropriate database instance
  const database = context?.cloudflare?.env?.DB
    ? getDb(context.cloudflare.env as { DB: D1Database })
    : db;

  // Authenticate user
  const user = await authenticateUser(database, email, password);

  if (!user) {
    return data(
      { errors: { general: "Invalid email or password" } },
      { status: 401 }
    );
  }

  // Create session and redirect
  return createUserSession(user.id, redirectTo);
}

export default function Login() {
  const actionData = useActionData<ActionData>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
      <h1>Log In</h1>

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

      <Form method="post" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label htmlFor="email" style={{ display: "block", marginBottom: "0.5rem" }}>
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              fontSize: "1rem",
              border: actionData?.errors?.email ? "1px solid #c33" : "1px solid #ccc"
            }}
          />
          {actionData?.errors?.email && (
            <div style={{ color: "#c33", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              {actionData.errors.email}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="password" style={{ display: "block", marginBottom: "0.5rem" }}>
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              fontSize: "1rem",
              border: actionData?.errors?.password ? "1px solid #c33" : "1px solid #ccc"
            }}
          />
          {actionData?.errors?.password && (
            <div style={{ color: "#c33", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              {actionData.errors.password}
            </div>
          )}
        </div>

        <button
          type="submit"
          style={{
            padding: "0.75rem",
            fontSize: "1rem",
            backgroundColor: "#0066cc",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Log In
        </button>
      </Form>

      <p style={{ marginTop: "1rem", textAlign: "center" }}>
        Don't have an account?{" "}
        <a href="/signup" style={{ color: "#0066cc" }}>
          Sign up
        </a>
      </p>
    </div>
  );
}
