import type { Route } from "./+types/$";
import { data } from "react-router";
import { Heading } from "~/components/ui/heading";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "404 - Page not found | Spoonjoy" },
    { name: "description", content: "The page you requested could not be found." },
  ];
}

export function loader() {
  return data(null, { status: 404 });
}

export default function CatchAll() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:py-20">
      <section className="rounded-sm border border-zinc-300 bg-stone-50 p-8 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <Heading level={1} className="font-serif tracking-tight">
          Page not found
        </Heading>
        <Text className="mt-3 text-zinc-600 dark:text-zinc-300">
          The page you are looking for does not exist or may have moved.
        </Text>
        <div className="mt-6">
          <Button href="/">Go home</Button>
        </div>
      </section>
    </div>
  );
}
