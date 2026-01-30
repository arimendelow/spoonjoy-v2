import type { Route } from "./+types/$";

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  throw new Response(`Not Found: ${url.pathname}`, { status: 404 });
}

export default function CatchAll() {
  return null;
}
