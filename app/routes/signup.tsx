import type { Route } from "./+types/signup";
import { Form, redirect, data, useActionData, useLoaderData } from "react-router";
import { getDb, db } from "~/lib/db.server";
import { createUser, emailExists, usernameExists } from "~/lib/auth.server";
import { createUserSession, getUserId } from "~/lib/session.server";

interface ActionData {
  errors?: {
    email?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
  };
}

interface LoaderData {
  oauthError?: string;
}

// Loader - redirect if already logged in, handle OAuth errors
export async function loader({ request, context }: Route.LoaderArgs) {
  const userId = await getUserId(request);
  if (userId) {
    throw redirect("/");
  }

  // Check for OAuth error in URL search params
  const url = new URL(request.url);
  const oauthError = url.searchParams.get("oauthError");

  if (oauthError) {
    return { oauthError } as LoaderData;
  }

  return null;
}

// Action - handle signup form submission
export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email")?.toString() || "";
  const username = formData.get("username")?.toString() || "";
  const password = formData.get("password")?.toString() || "";
  const confirmPassword = formData.get("confirmPassword")?.toString() || "";

  const errors: ActionData["errors"] = {};

  // Validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Valid email is required";
  }

  if (!username || username.length < 3) {
    errors.username = "Username must be at least 3 characters";
  }

  if (!password || password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  // Get the appropriate database instance
  /* istanbul ignore next -- @preserve Cloudflare D1 production-only path */
  const database = context?.cloudflare?.env?.DB
    ? getDb(context.cloudflare.env as { DB: D1Database })
    : db;

  // Check if email or username already exists
  if (!errors.email) {
    const emailInUse = await emailExists(database, email);
    if (emailInUse) {
      errors.email = "An account with this email already exists";
    }
  }

  if (!errors.username) {
    const usernameInUse = await usernameExists(database, username);
    if (usernameInUse) {
      errors.username = "This username is already taken";
    }
  }

  if (Object.keys(errors).length > 0) {
    return data({ errors }, { status: 400 });
  }

  // Create user
  const user = await createUser(database, email, username, password);

  // Create session and redirect
  return createUserSession(user.id, "/recipes");
}

export default function Signup() {
  const actionData = useActionData<ActionData>();
  const loaderData = useLoaderData<LoaderData | null>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
      <h1>Sign Up</h1>

      {/* OAuth error messages */}
      {loaderData?.oauthError === "account_exists" && (
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
          An account with this email already exists. Please log in to link your account.
        </div>
      )}
      {loaderData?.oauthError && loaderData.oauthError !== "account_exists" && (
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
          Something went wrong. Please try again.
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
              border: /* istanbul ignore next -- @preserve */ actionData?.errors?.email ? "1px solid #c33" : "1px solid #ccc"
            }}
          />
          {/* istanbul ignore next -- @preserve */ actionData?.errors?.email && (
            <div style={{ color: "#c33", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              {actionData.errors.email}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="username" style={{ display: "block", marginBottom: "0.5rem" }}>
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            required
            minLength={3}
            style={{
              width: "100%",
              padding: "0.5rem",
              fontSize: "1rem",
              border: /* istanbul ignore next -- @preserve */ actionData?.errors?.username ? "1px solid #c33" : "1px solid #ccc"
            }}
          />
          {/* istanbul ignore next -- @preserve */ actionData?.errors?.username && (
            <div style={{ color: "#c33", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              {actionData.errors.username}
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
            minLength={8}
            style={{
              width: "100%",
              padding: "0.5rem",
              fontSize: "1rem",
              border: /* istanbul ignore next -- @preserve */ actionData?.errors?.password ? "1px solid #c33" : "1px solid #ccc"
            }}
          />
          {/* istanbul ignore next -- @preserve */ actionData?.errors?.password && (
            <div style={{ color: "#c33", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              {actionData.errors.password}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" style={{ display: "block", marginBottom: "0.5rem" }}>
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            required
            minLength={8}
            style={{
              width: "100%",
              padding: "0.5rem",
              fontSize: "1rem",
              border: /* istanbul ignore next -- @preserve */ actionData?.errors?.confirmPassword ? "1px solid #c33" : "1px solid #ccc"
            }}
          />
          {/* istanbul ignore next -- @preserve */ actionData?.errors?.confirmPassword && (
            <div style={{ color: "#c33", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              {actionData.errors.confirmPassword}
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
          Sign Up
        </button>
      </Form>

      {/* OAuth separator */}
      <div
        data-testid="oauth-separator"
        style={{
          display: "flex",
          alignItems: "center",
          margin: "1.5rem 0",
        }}
      >
        <div style={{ flex: 1, height: "1px", backgroundColor: "#ccc" }} />
        <span style={{ padding: "0 1rem", color: "#666" }}>or</span>
        <div style={{ flex: 1, height: "1px", backgroundColor: "#ccc" }} />
      </div>

      {/* OAuth buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <form action="/auth/google" method="post">
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "0.75rem",
              fontSize: "1rem",
              backgroundColor: "#fff",
              color: "#333",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Continue with Google
          </button>
        </form>
        <form action="/auth/apple" method="post">
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "0.75rem",
              fontSize: "1rem",
              backgroundColor: "#000",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Continue with Apple
          </button>
        </form>
      </div>

      <p style={{ marginTop: "1rem", textAlign: "center" }}>
        Already have an account?{" "}
        <a href="/login" style={{ color: "#0066cc" }}>
          Log in
        </a>
      </p>
    </div>
  );
}
