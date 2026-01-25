import type { Route } from "./+types/logout";
import { destroyUserSession } from "~/lib/session.server";

export async function loader({ request }: Route.LoaderArgs) {
  return destroyUserSession(request, "/login");
}

export async function action({ request }: Route.ActionArgs) {
  return destroyUserSession(request, "/login");
}

export default function Logout() {
  return null;
}
