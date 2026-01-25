import type { Route } from "./+types/root";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  Form,
  Link,
} from "react-router";
import { getUserId } from "~/lib/session.server";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await getUserId(request);
  return { userId };
}

export default function App() {
  const { userId } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <nav
          style={{
            backgroundColor: "#333",
            color: "white",
            padding: "1rem 2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link
            to="/"
            style={{
              color: "white",
              textDecoration: "none",
              fontSize: "1.5rem",
              fontWeight: "bold",
            }}
          >
            Spoonjoy
          </Link>
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            {userId ? (
              <>
                <Link
                  to="/recipes"
                  style={{ color: "white", textDecoration: "none" }}
                >
                  Recipes
                </Link>
                <Link
                  to="/cookbooks"
                  style={{ color: "white", textDecoration: "none" }}
                >
                  Cookbooks
                </Link>
                <Link
                  to="/"
                  style={{ color: "white", textDecoration: "none" }}
                >
                  Shopping List
                </Link>
                <Form method="post" action="/logout" style={{ margin: 0 }}>
                  <button
                    type="submit"
                    style={{
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      padding: "0.5rem 1rem",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Logout
                  </button>
                </Form>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  style={{ color: "white", textDecoration: "none" }}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  style={{
                    backgroundColor: "#0066cc",
                    color: "white",
                    textDecoration: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "4px",
                  }}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
