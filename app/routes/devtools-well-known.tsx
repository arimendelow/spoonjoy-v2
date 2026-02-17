import type { Route } from "./+types/devtools-well-known";

export function loader(_args: Route.LoaderArgs) {
  return new Response(null, { status: 204 });
}

export default function DevtoolsWellKnown() {
  return null;
}
