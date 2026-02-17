import type { Route } from "./+types/cookbooks._index";
import { useLoaderData } from "react-router";
import { getDb, db } from "~/lib/db.server";
import { requireUserId } from "~/lib/session.server";
import { Button } from "~/components/ui/button";
import { Heading, Subheading } from "~/components/ui/heading";
import { Text } from "~/components/ui/text";
import { CookbookCard } from "~/components/pantry/CookbookCard";

export async function loader({ request, context }: Route.LoaderArgs) {
  const userId = await requireUserId(request);

  /* istanbul ignore next -- @preserve Cloudflare D1 production-only path */
  const database = context?.cloudflare?.env?.DB
    ? await getDb(context.cloudflare.env as { DB: D1Database })
    : db;

  const cookbooks = await database.cookbook.findMany({
    where: {
      authorId: userId,
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      _count: {
        select: { recipes: true },
      },
      recipes: {
        take: 4,
        orderBy: { addedAt: "desc" },
        include: {
          recipe: {
            select: {
              imageUrl: true,
              title: true,
            },
          },
        },
      },
    },
  });

  return { cookbooks };
}

export default function CookbooksList() {
  const { cookbooks } = useLoaderData<typeof loader>();

  return (
    <div className="font-sans leading-relaxed p-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Heading level={1}>My Cookbooks</Heading>
            <Text className="mt-2 mb-0">
              {cookbooks.length} {cookbooks.length === 1 ? "cookbook" : "cookbooks"}
            </Text>
          </div>
          <div className="flex gap-4">
            <Button href="/cookbooks/new">
              + New Cookbook
            </Button>
          </div>
        </div>

        {cookbooks.length === 0 ? (
          <div className="border border-dashed border-zinc-300 dark:border-zinc-700 rounded-sm p-12 text-center">
            <Subheading level={2} className="text-zinc-500 dark:text-zinc-400">No cookbooks yet</Subheading>
            <Text className="mb-6">
              Create your first cookbook to organize your recipes
            </Text>
            <Button href="/cookbooks/new">
              Create Cookbook
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cookbooks.map((cookbook) => (
              <CookbookCard
                key={cookbook.id}
                id={cookbook.id}
                title={cookbook.title}
                recipeCount={cookbook._count.recipes}
                recipeImages={cookbook.recipes.map((r) => ({
                  imageUrl: r.recipe.imageUrl,
                  title: r.recipe.title,
                }))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
