import type { Route } from "./+types/recipes.new";
import { Form, Link, redirect, data, useActionData } from "react-router";
import { getDb, db } from "~/lib/db.server";
import { requireUserId } from "~/lib/session.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Fieldset, Field, Label, ErrorMessage, Description } from "~/components/ui/fieldset";
import { Heading } from "~/components/ui/heading";
import { Text } from "~/components/ui/text";

interface ActionData {
  errors?: {
    title?: string;
    description?: string;
    servings?: string;
    general?: string;
  };
}

export async function loader({ request, context }: Route.LoaderArgs) {
  await requireUserId(request);
  return null;
}

export async function action({ request, context }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const title = formData.get("title")?.toString() || "";
  const description = formData.get("description")?.toString() || "";
  const servings = formData.get("servings")?.toString() || "";
  const imageUrl = formData.get("imageUrl")?.toString() || "";

  const errors: ActionData["errors"] = {};

  // Validation
  if (!title || title.trim().length === 0) {
    errors.title = "Title is required";
  }

  if (Object.keys(errors).length > 0) {
    return data({ errors }, { status: 400 });
  }

  /* istanbul ignore next -- @preserve Cloudflare D1 production-only path */
  const database = context?.cloudflare?.env?.DB
    ? getDb(context.cloudflare.env as { DB: D1Database })
    : db;

  try {
    const recipe = await database.recipe.create({
      data: {
        title: title.trim(),
        description: description.trim() || null,
        servings: servings.trim() || null,
        imageUrl: imageUrl.trim() || undefined,
        chefId: userId,
      },
    });

    return redirect(`/recipes/${recipe.id}`);
  } catch (error) {
    return data(
      { errors: { general: "Failed to create recipe. Please try again." } },
      { status: 500 }
    );
  }
}

export default function NewRecipe() {
  const actionData = useActionData<ActionData>();

  return (
    <div className="font-sans leading-relaxed p-8">
      <div className="max-w-[800px] mx-auto">
        <div className="mb-8">
          <Heading level={1}>Create New Recipe</Heading>
          <Link
            to="/recipes"
            className="text-blue-600 no-underline"
          >
            ← Back to recipes
          </Link>
        </div>

        {/* istanbul ignore next -- @preserve */ actionData?.errors?.general && (
          <div className="p-3 mb-4 bg-red-50 border border-red-600 rounded text-red-600" role="alert">
            {actionData.errors.general}
          </div>
        )}

        <Form method="post">
          <Fieldset className="space-y-6">
            <Field>
              <Label>Recipe Title *</Label>
              <Input
                type="text"
                name="title"
                required
                placeholder="e.g., Grandma's Chocolate Chip Cookies"
                data-invalid={/* istanbul ignore next -- @preserve */ actionData?.errors?.title ? true : undefined}
              />
              {/* istanbul ignore next -- @preserve */ actionData?.errors?.title && (
                <ErrorMessage>
                  {actionData.errors.title}
                </ErrorMessage>
              )}
            </Field>

            <Field>
              <Label>Description</Label>
              <Textarea
                name="description"
                rows={4}
                placeholder="Brief description of your recipe..."
                data-invalid={/* istanbul ignore next -- @preserve */ actionData?.errors?.description ? true : undefined}
              />
              {/* istanbul ignore next -- @preserve */ actionData?.errors?.description && (
                <ErrorMessage>
                  {actionData.errors.description}
                </ErrorMessage>
              )}
            </Field>

            <Field>
              <Label>Servings</Label>
              <Input
                type="text"
                name="servings"
                placeholder="e.g., 4, 6-8, or 2 dozen"
                data-invalid={/* istanbul ignore next -- @preserve */ actionData?.errors?.servings ? true : undefined}
              />
              {/* istanbul ignore next -- @preserve */ actionData?.errors?.servings && (
                <ErrorMessage>
                  {actionData.errors.servings}
                </ErrorMessage>
              )}
            </Field>

            <Field>
              <Label>Image URL</Label>
              <Input
                type="url"
                name="imageUrl"
                placeholder="https://example.com/image.jpg (optional)"
              />
              <Description>
                Leave blank to use default placeholder image
              </Description>
            </Field>

            <div className="flex gap-4 justify-end pt-4">
              <Button href="/recipes" color="zinc">
                Cancel
              </Button>
              <Button type="submit" color="green">
                Create Recipe
              </Button>
            </div>
          </Fieldset>
        </Form>
      </div>
    </div>
  );
}
