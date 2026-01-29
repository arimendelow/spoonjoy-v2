import type { Route } from "./+types/_index";
import { Form, useLoaderData } from "react-router";
import { getDb, db } from "~/lib/db.server";
import { getUserId } from "~/lib/session.server";
import { getUserById } from "~/lib/auth.server";
import { Heading, Subheading } from "~/components/ui/heading";
import { Text, Strong } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { Link } from "~/components/ui/link";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Spoonjoy - Recipe Management" },
    { name: "description", content: "Manage your recipes with ease" },
  ];
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const userId = await getUserId(request);

  if (!userId) {
    return { user: null };
  }

  /* istanbul ignore next -- @preserve Cloudflare D1 production-only path */
  const database = context?.cloudflare?.env?.DB
    ? getDb(context.cloudflare.env as { DB: D1Database })
    : db;

  const user = await getUserById(database, userId);
  return { user };
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>();

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-16">
        <Heading level={1}>Welcome to Spoonjoy v2</Heading>
        <Text className="mt-2">
          Your personal recipe management system
        </Text>

        <div className="mt-8 rounded-lg bg-zinc-50 p-6 dark:bg-zinc-800/50">
          <Subheading level={2}>Get Started</Subheading>
          <Text className="mt-2">
            Sign up or log in to start managing your recipes
          </Text>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button href="/signup" color="blue">
              Sign Up
            </Button>
            <Button href="/login" outline>
              Log In
            </Button>
          </div>
        </div>

        <Text className="mt-6 text-sm text-zinc-400 dark:text-zinc-500">
          Built with React Router v7 on Cloudflare
        </Text>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <Heading level={1}>Welcome to Spoonjoy v2</Heading>
          <Text className="mt-1">
            Logged in as <Strong>{user.username}</Strong> ({user.email})
          </Text>
        </div>
        <Form method="post" action="/logout">
          <Button type="submit" color="red">
            Logout
          </Button>
        </Form>
      </div>

      <div className="rounded-lg bg-zinc-50 p-6 dark:bg-zinc-800/50 mb-6">
        <Subheading level={2}>Account Info</Subheading>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex gap-2">
            <Text as="dt" className="font-medium">User ID:</Text>
            <Text as="dd">{user.id}</Text>
          </div>
          <div className="flex gap-2">
            <Text as="dt" className="font-medium">Email:</Text>
            <Text as="dd">{user.email}</Text>
          </div>
          <div className="flex gap-2">
            <Text as="dt" className="font-medium">Username:</Text>
            <Text as="dd">{user.username}</Text>
          </div>
          <div className="flex gap-2">
            <Text as="dt" className="font-medium">Member since:</Text>
            <Text as="dd">{new Date(user.createdAt).toLocaleDateString()}</Text>
          </div>
        </dl>
      </div>

      <div className="mb-6">
        <Subheading level={2}>Quick Links</Subheading>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <QuickLinkCard
            href="/recipes"
            emoji="🍳"
            label="My Recipes"
            color="blue"
          />
          <QuickLinkCard
            href="/cookbooks"
            emoji="📖"
            label="Cookbooks"
            color="cyan"
          />
          <QuickLinkCard
            href="/shopping-list"
            emoji="🛒"
            label="Shopping List"
            color="amber"
          />
          <QuickLinkCard
            href="/recipes/new"
            emoji="➕"
            label="Create Recipe"
            color="green"
          />
        </div>
      </div>

      <div>
        <Subheading level={2}>What's Next?</Subheading>
        <Text className="mt-2">
          Features coming soon:
        </Text>
        <ul className="mt-2 list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-400">
          <li>Recipe sharing and forking</li>
          <li>Image upload</li>
          <li>Mobile app</li>
        </ul>
      </div>
    </div>
  );
}

interface QuickLinkCardProps {
  href: string;
  emoji: string;
  label: string;
  color: "blue" | "cyan" | "amber" | "green";
}

function QuickLinkCard({ href, emoji, label, color }: QuickLinkCardProps) {
  const colorClasses = {
    blue: "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
    cyan: "bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600",
    amber: "bg-amber-500 hover:bg-amber-600 text-zinc-900",
    green: "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600",
  };

  return (
    <Link
      href={href}
      className={`
        flex flex-col items-center justify-center p-4 rounded-lg
        text-white font-semibold transition-colors
        ${colorClasses[color]}
      `}
    >
      <span className="text-2xl mb-1">{emoji}</span>
      <span className="text-sm">{label}</span>
    </Link>
  );
}
