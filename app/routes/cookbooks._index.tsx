import type { Route } from "./+types/cookbooks._index";
import { redirect } from "react-router";
import { requireUserId } from "~/lib/session.server";

export async function loader({ request }: Route.LoaderArgs) {
  await requireUserId(request);
  throw redirect("/?tab=cookbooks");
}

export default function CookbooksIndexRedirect() {
  return null;
}
