import type { Route } from "./+types/$";

const DEVTOOLS_WELL_KNOWN_PATH = "/.well-known/appspecific/com.chrome.devtools.json";

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);

  if (url.pathname === DEVTOOLS_WELL_KNOWN_PATH) {
    return new Response(null, { status: 204 });
  }

  throw new Response(`Not Found: ${url.pathname}`, { status: 404 });
}

export default function CatchAll() {
  return null;
}
