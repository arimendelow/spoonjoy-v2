import type { Route } from "./+types/recipes";
import { Form, useLoaderData } from "react-router";
import { requireUserId } from "~/lib/session.server";
import { getUserById } from "~/lib/auth.server";
import { getDb, db } from "~/lib/db.server";
import { Button } from "~/components/ui/button";
import { Heading } from "~/components/ui/heading";
import { Text } from "~/components/ui/text";

export async function loader({ request, context }: Route.LoaderArgs) {
  const userId = await requireUserId(request);

  /* istanbul ignore next -- @preserve Cloudflare D1 production-only path */
  const database = context?.cloudflare?.env?.DB
    ? getDb(context.cloudflare.env as { DB: D1Database })
    : db;

  const user = await getUserById(database, userId);

  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  const recipes = await database.recipe.findMany({
    where: { chefId: userId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      servings: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return { user, recipes };
}

export default function Recipes() {
  const { user, recipes } = useLoaderData<typeof loader>();

  return (
    <div className="font-sans p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Heading level={1}>My Recipes</Heading>
          <Text>Welcome back, {user.username}!</Text>
        </div>
        <Form method="post" action="/logout">
          <Button type="submit" color="red">
            Log Out
          </Button>
        </Form>
      </div>

      {recipes.length === 0 ? (
        <div className="p-12 text-center bg-zinc-100 rounded-lg">
          <Heading level={2}>No recipes yet</Heading>
          <Text className="mb-6">
            Start building your recipe collection!
          </Text>
          <Button color="blue">
            Create Your First Recipe
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="border border-zinc-300 rounded-lg overflow-hidden bg-white"
            >
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="w-full h-[200px] object-cover"
              />
              <div className="p-4">
                <Heading level={3} className="m-0 mb-2">{recipe.title}</Heading>
                {recipe.description && (
                  <Text className="m-0 mb-2">
                    {recipe.description}
                  </Text>
                )}
                {recipe.servings && (
                  <Text className="m-0">
                    Servings: {recipe.servings}
                  </Text>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
