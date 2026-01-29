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
import { ThemeProvider } from "~/components/ui/theme-provider";
import { ThemeToggle } from "~/components/ui/theme-toggle";
import { MobileNav } from "~/components/navigation";
import "./styles/tailwind.css";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await getUserId(request);
  return { userId };
}

export default function App() {
  const { userId } = useLoaderData<typeof loader>();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const stored = localStorage.getItem('spoonjoy-theme');
                const theme = stored === 'light' || stored === 'dark' 
                  ? stored 
                  : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.classList.add(theme);
              })();
            `,
          }}
        />
      </head>
      <body className="m-0 p-0 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 transition-colors">
        <ThemeProvider>
          {/* Desktop navigation - hidden on mobile */}
          <nav className="hidden lg:flex bg-zinc-800 dark:bg-zinc-950 text-white px-8 py-4 justify-between items-center">
            <Link
              to="/"
              className="text-white no-underline text-2xl font-bold hover:text-zinc-200 transition-colors"
            >
              Spoonjoy
            </Link>
            <div className="flex gap-6 items-center">
              {userId ? (
                <>
                  <Link
                    to="/recipes"
                    className="text-white no-underline hover:text-zinc-300 transition-colors"
                  >
                    Recipes
                  </Link>
                  <Link
                    to="/cookbooks"
                    className="text-white no-underline hover:text-zinc-300 transition-colors"
                  >
                    Cookbooks
                  </Link>
                  <Link
                    to="/"
                    className="text-white no-underline hover:text-zinc-300 transition-colors"
                  >
                    Shopping List
                  </Link>
                  <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <Form method="post" action="/logout" className="m-0">
                      <button
                        type="submit"
                        className="bg-red-600 hover:bg-red-700 text-white border-none px-4 py-2 rounded cursor-pointer transition-colors"
                      >
                        Logout
                      </button>
                    </Form>
                  </div>
                </>
              ) : (
                <>
                  <ThemeToggle />
                  <Link
                    to="/login"
                    className="text-white no-underline hover:text-zinc-300 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-blue-600 hover:bg-blue-700 text-white no-underline px-4 py-2 rounded transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </nav>
          {/* Main content with bottom padding for mobile dock */}
          <main className="pb-20 lg:pb-0">
            <Outlet />
          </main>
          {/* Mobile navigation dock - only for authenticated users */}
          {userId && <MobileNav />}
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
