import type { Route } from "./+types/logout";
import { destroyUserSession } from "~/lib/session.server";

export async function loader({ request }: Route.LoaderArgs) {
  return destroyUserSession(request, "/");
}

export async function action({ request }: Route.ActionArgs) {
  return destroyUserSession(request, "/");
}

export default function Logout() {
  return null;
}
