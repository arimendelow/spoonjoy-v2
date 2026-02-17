import type { Route } from "./+types/cookbooks._index";
import { useLoaderData } from "react-router";
import { getDb, db } from "~/lib/db.server";
import { requireUserId } from "~/lib/session.server";
import { Button } from "~/components/ui/button";
import { Heading, Subheading } from "~/components/ui/heading";
import { Text } from "~/components/ui/text";
import { Link } from "~/components/ui/link";

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
          <div className="bg-zinc-100 dark:bg-zinc-800/50 p-12 rounded-lg text-center">
            <Subheading level={2} className="text-zinc-500 dark:text-zinc-400">No cookbooks yet</Subheading>
            <Text className="mb-6">
              Create your first cookbook to organize your recipes
            </Text>
            <Button href="/cookbooks/new">
              Create Cookbook
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
            {cookbooks.map((cookbook) => (
              <Link
                key={cookbook.id}
                href={`/cookbooks/${cookbook.id}`}
                className="bg-white dark:bg-zinc-800 border-2 border-blue-600 dark:border-blue-500 rounded-lg p-6 no-underline text-inherit transition-shadow duration-200 hover:shadow-lg block"
              >
                <div className="flex items-center mb-4">
                  <div className="w-[50px] h-[50px] bg-blue-600 dark:bg-blue-500 text-white rounded-lg flex items-center justify-center text-2xl mr-4">
                    📖
                  </div>
                  <Subheading level={3} className="m-0 flex-1">{cookbook.title}</Subheading>
                </div>
                <Text className="m-0">
                  {cookbook._count.recipes} {cookbook._count.recipes === 1 ? "recipe" : "recipes"}
                </Text>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
