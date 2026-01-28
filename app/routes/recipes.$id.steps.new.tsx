import type { Route } from "./+types/recipes.$id.steps.new";
import { Form, Link, redirect, data, useActionData, useLoaderData } from "react-router";
import { getDb, db } from "~/lib/db.server";
import { requireUserId } from "~/lib/session.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Fieldset, Field, Label, ErrorMessage } from "~/components/ui/fieldset";
import { Heading } from "~/components/ui/heading";
import { Text, Strong } from "~/components/ui/text";
import { validateStepTitle, validateStepDescription, STEP_TITLE_MAX_LENGTH, STEP_DESCRIPTION_MAX_LENGTH } from "~/lib/validation";

interface ActionData {
  errors?: {
    stepTitle?: string;
    description?: string;
    general?: string;
  };
}

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const { id } = params;

  /* istanbul ignore next -- @preserve Cloudflare D1 production-only path */
  const database = context?.cloudflare?.env?.DB
    ? getDb(context.cloudflare.env as { DB: D1Database })
    : db;

  const recipe = await database.recipe.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      chefId: true,
      deletedAt: true,
      steps: {
        select: { stepNum: true },
        orderBy: { stepNum: "desc" },
        take: 1,
      },
    },
  });

  if (!recipe || recipe.deletedAt) {
    throw new Response("Recipe not found", { status: 404 });
  }

  if (recipe.chefId !== userId) {
    throw new Response("Unauthorized", { status: 403 });
  }

  const nextStepNum = recipe.steps.length > 0 ? recipe.steps[0].stepNum + 1 : 1;

  return { recipe, nextStepNum };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const { id } = params;
  const formData = await request.formData();

  /* istanbul ignore next -- @preserve Cloudflare D1 production-only path */
  const database = context?.cloudflare?.env?.DB
    ? getDb(context.cloudflare.env as { DB: D1Database })
    : db;

  // Verify ownership
  const recipe = await database.recipe.findUnique({
    where: { id },
    select: {
      chefId: true,
      deletedAt: true,
      steps: {
        select: { stepNum: true },
        orderBy: { stepNum: "desc" },
        take: 1,
      },
    },
  });

  if (!recipe || recipe.deletedAt) {
    throw new Response("Recipe not found", { status: 404 });
  }

  if (recipe.chefId !== userId) {
    throw new Response("Unauthorized", { status: 403 });
  }

  const stepTitle = formData.get("stepTitle")?.toString() || "";
  const description = formData.get("description")?.toString() || "";

  const errors: ActionData["errors"] = {};

  // Validation
  const stepTitleResult = validateStepTitle(stepTitle || null);
  if (!stepTitleResult.valid) {
    errors.stepTitle = stepTitleResult.error;
  }

  const descriptionResult = validateStepDescription(description);
  if (!descriptionResult.valid) {
    errors.description = descriptionResult.error;
  }

  if (Object.keys(errors).length > 0) {
    return data({ errors }, { status: 400 });
  }

  const nextStepNum = recipe.steps.length > 0 ? recipe.steps[0].stepNum + 1 : 1;

  try {
    const step = await database.recipeStep.create({
      data: {
        recipeId: id,
        stepNum: nextStepNum,
        stepTitle: stepTitle.trim() || null,
        description: description.trim(),
      },
    });

    return redirect(`/recipes/${id}/steps/${step.id}/edit`);
  } catch (error) {
    return data(
      { errors: { general: "Failed to create step. Please try again." } },
      { status: 500 }
    );
  }
}

export default function NewStep() {
  const { recipe, nextStepNum } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();

  return (
    <div className="font-sans leading-relaxed p-8">
      <div className="max-w-[800px] mx-auto">
        <div className="mb-8">
          <Heading level={1}>Add Step to {recipe.title}</Heading>
          <Link
            to={`/recipes/${recipe.id}/edit`}
            className="text-blue-600 no-underline"
          >
            ← Back to recipe
          </Link>
        </div>

        {/* istanbul ignore next -- @preserve */ actionData?.errors?.general && (
          <div className="p-3 mb-4 bg-red-50 border border-red-600 rounded text-red-600" role="alert">
            {actionData.errors.general}
          </div>
        )}

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <Text className="m-0">
            <Strong>Step Number:</Strong> {nextStepNum}
          </Text>
        </div>

        <Form method="post">
          <Fieldset className="space-y-6">
            <Field>
              <Label>Step Title (optional)</Label>
              <Input
                type="text"
                name="stepTitle"
                maxLength={STEP_TITLE_MAX_LENGTH}
                placeholder="e.g., Prepare the dough"
                data-invalid={/* istanbul ignore next -- @preserve */ actionData?.errors?.stepTitle ? true : undefined}
              />
              {/* istanbul ignore next -- @preserve */ actionData?.errors?.stepTitle && (
                <ErrorMessage>
                  {actionData.errors.stepTitle}
                </ErrorMessage>
              )}
            </Field>

            <Field>
              <Label>Description *</Label>
              <Textarea
                name="description"
                rows={6}
                required
                maxLength={STEP_DESCRIPTION_MAX_LENGTH}
                placeholder="Describe what to do in this step..."
                data-invalid={/* istanbul ignore next -- @preserve */ actionData?.errors?.description ? true : undefined}
              />
              {/* istanbul ignore next -- @preserve */ actionData?.errors?.description && (
                <ErrorMessage>
                  {actionData.errors.description}
                </ErrorMessage>
              )}
            </Field>

            <div className="flex gap-4 justify-end pt-4">
              <Button href={`/recipes/${recipe.id}/edit`} color="zinc">
                Cancel
              </Button>
              <Button type="submit" color="green">
                Create Step & Add Ingredients
              </Button>
            </div>
          </Fieldset>
        </Form>
      </div>
    </div>
  );
}
