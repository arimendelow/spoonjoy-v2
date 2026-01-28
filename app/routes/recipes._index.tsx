import type { Route } from "./+types/recipes._index";
import { Link, useLoaderData } from "react-router";
import { getDb, db } from "~/lib/db.server";
import { requireUserId } from "~/lib/session.server";
import { Button } from "~/components/ui/button";
import { Heading, Subheading } from "~/components/ui/heading";
import { Text } from "~/components/ui/text";

export async function loader({ request, context }: Route.LoaderArgs) {
  const userId = await requireUserId(request);

  /* istanbul ignore next -- @preserve Cloudflare D1 production-only path */
  const database = context?.cloudflare?.env?.DB
    ? getDb(context.cloudflare.env as { DB: D1Database })
    : db;

  const recipes = await database.recipe.findMany({
    where: {
      chefId: userId,
      deletedAt: null,
    },
    orderBy: {
      updatedAt: "desc",
    },
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

  return { recipes };
}

export default function RecipesList() {
  const { recipes } = useLoaderData<typeof loader>();

  return (
    <div className="font-sans leading-relaxed p-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Heading level={1}>My Recipes</Heading>
            <Text className="mt-2 mb-0">
              {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"}
            </Text>
          </div>
          <div className="flex gap-4">
            <Button href="/" color="zinc">
              Home
            </Button>
            <Button href="/recipes/new" color="green">
              + New Recipe
            </Button>
          </div>
        </div>

        {recipes.length === 0 ? (
          <div className="bg-gray-100 p-12 rounded-lg text-center">
            <Subheading level={2} className="text-gray-500">No recipes yet</Subheading>
            <Text className="mb-6">
              Create your first recipe to get started
            </Text>
            <Button href="/recipes/new" color="green">
              Create Recipe
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
            {recipes.map((recipe) => (
              <Link
                key={recipe.id}
                to={`/recipes/${recipe.id}`}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden no-underline text-inherit transition-shadow duration-200 hover:shadow-lg"
              >
                <div
                  className="w-full h-[200px] bg-gray-100 bg-cover bg-center"
                  data-image-url={recipe.imageUrl}
                  aria-label={`Image for ${recipe.title}`}
                />
                <div className="p-4">
                  <Subheading level={3} className="m-0 mb-2">{recipe.title}</Subheading>
                  {recipe.description && (
                    <Text className="m-0 mb-2 line-clamp-2">
                      {recipe.description}
                    </Text>
                  )}
                  {recipe.servings && (
                    <Text className="m-0">
                      Servings: {recipe.servings}
                    </Text>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
