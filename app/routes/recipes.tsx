import type { Route } from "./+types/recipes";
import { Outlet } from "react-router";
import { requireUserId } from "~/lib/session.server";

// This is a layout route - it just renders child routes
// The actual recipe list is in recipes._index.tsx

export async function loader({ request }: Route.LoaderArgs) {
  // Ensure user is authenticated for all recipe routes
  await requireUserId(request);
  return null;
}

export default function RecipesLayout() {
  return <Outlet />;
}
