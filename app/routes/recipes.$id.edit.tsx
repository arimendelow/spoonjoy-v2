import type { Route } from "./+types/recipes.$id.edit";
import { Form, Link, redirect, data, useActionData, useLoaderData } from "react-router";
import { getDb, db } from "~/lib/db.server";
import { requireUserId } from "~/lib/session.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Fieldset, Field, Label, ErrorMessage } from "~/components/ui/fieldset";
import { Heading, Subheading } from "~/components/ui/heading";
import { Text } from "~/components/ui/text";
import {
  validateTitle,
  validateDescription,
  validateServings,
  validateImageUrl,
  TITLE_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  SERVINGS_MAX_LENGTH,
} from "~/lib/validation";
import { validateStepReorderComplete } from "~/lib/step-reorder-validation.server";

interface ActionData {
  errors?: {
    title?: string;
    description?: string;
    servings?: string;
    imageUrl?: string;
    general?: string;
    reorder?: string;
  };
  success?: boolean;
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
    include: {
      steps: {
        orderBy: {
          stepNum: "asc",
        },
        include: {
          ingredients: {
            include: {
              unit: true,
              ingredientRef: true,
            },
          },
        },
      },
    },
  });

  if (!recipe || recipe.deletedAt) {
    throw new Response("Recipe not found", { status: 404 });
  }

  if (recipe.chefId !== userId) {
    throw new Response("Unauthorized", { status: 403 });
  }

  return { recipe };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const { id } = params;
  const formData = await request.formData();
  const intent = formData.get("intent")?.toString();

  /* istanbul ignore next -- @preserve Cloudflare D1 production-only path */
  const database = context?.cloudflare?.env?.DB
    ? getDb(context.cloudflare.env as { DB: D1Database })
    : db;

  // Verify ownership
  const recipe = await database.recipe.findUnique({
    where: { id },
    select: { chefId: true, deletedAt: true },
  });

  if (!recipe || recipe.deletedAt) {
    throw new Response("Recipe not found", { status: 404 });
  }

  if (recipe.chefId !== userId) {
    throw new Response("Unauthorized", { status: 403 });
  }

  // Handle reorder step intent
  if (intent === "reorderStep") {
    const stepId = formData.get("stepId")?.toString();
    const direction = formData.get("direction")?.toString();

    if (stepId && (direction === "up" || direction === "down")) {
      const step = await database.recipeStep.findUnique({
        where: { id: stepId },
        select: { stepNum: true, recipeId: true },
      });

      if (step && step.recipeId === id) {
        const targetStepNum = direction === "up" ? step.stepNum - 1 : step.stepNum + 1;

        // Validate that reordering won't break dependencies
        const validationResult = await validateStepReorderComplete(id, step.stepNum, targetStepNum);
        if (!validationResult.valid) {
          return data({ errors: { reorder: validationResult.error } }, { status: 400 });
        }

        // Find the step to swap with
        const targetStep = await database.recipeStep.findUnique({
          where: {
            recipeId_stepNum: {
              recipeId: id,
              stepNum: targetStepNum,
            },
          },
        });

        if (targetStep) {
          // Swap step numbers using a temporary number to avoid unique constraint violation
          const tempStepNum = -1;

          // Note: SQLite's ON UPDATE CASCADE automatically updates StepOutputUse
          // references when RecipeStep.stepNum changes, so we don't need to
          // manually update StepOutputUse records here.

          await database.recipeStep.update({
            where: { id: stepId },
            data: { stepNum: tempStepNum },
          });

          await database.recipeStep.update({
            where: { id: targetStep.id },
            data: { stepNum: step.stepNum },
          });

          await database.recipeStep.update({
            where: { id: stepId },
            data: { stepNum: targetStepNum },
          });

          return data({ success: true });
        }
      }
    }
  }

  const title = formData.get("title")?.toString() || "";
  const description = formData.get("description")?.toString() || "";
  const servings = formData.get("servings")?.toString() || "";
  const imageUrl = formData.get("imageUrl")?.toString() || "";

  const errors: ActionData["errors"] = {};

  // Validation
  const titleResult = validateTitle(title);
  if (!titleResult.valid) {
    errors.title = titleResult.error;
  }

  const descriptionResult = validateDescription(description || null);
  if (!descriptionResult.valid) {
    errors.description = descriptionResult.error;
  }

  const servingsResult = validateServings(servings || null);
  if (!servingsResult.valid) {
    errors.servings = servingsResult.error;
  }

  const imageUrlResult = validateImageUrl(imageUrl || null);
  if (!imageUrlResult.valid) {
    errors.imageUrl = imageUrlResult.error;
  }

  if (Object.keys(errors).length > 0) {
    return data({ errors }, { status: 400 });
  }

  try {
    await database.recipe.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description.trim() || null,
        servings: servings.trim() || null,
        imageUrl: imageUrl.trim() || undefined,
      },
    });

    return redirect(`/recipes/${id}`);
  } catch (error) {
    return data(
      { errors: { general: "Failed to update recipe. Please try again." } },
      { status: 500 }
    );
  }
}

export default function EditRecipe() {
  const { recipe } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();

  return (
    <div className="font-sans leading-relaxed p-8">
      <div className="max-w-[800px] mx-auto">
        <div className="mb-8">
          <Heading level={1}>Edit Recipe</Heading>
          <Link
            to={`/recipes/${recipe.id}`}
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

        <Form method="post">
          <Fieldset className="space-y-6">
            <Field>
              <Label>Recipe Title *</Label>
              <Input
                type="text"
                name="title"
                required
                maxLength={TITLE_MAX_LENGTH}
                defaultValue={recipe.title}
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
                maxLength={DESCRIPTION_MAX_LENGTH}
                defaultValue={recipe.description || ""}
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
                maxLength={SERVINGS_MAX_LENGTH}
                defaultValue={recipe.servings || ""}
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
                defaultValue={recipe.imageUrl}
                data-invalid={/* istanbul ignore next -- @preserve */ actionData?.errors?.imageUrl ? true : undefined}
              />
              {/* istanbul ignore next -- @preserve */ actionData?.errors?.imageUrl && (
                <ErrorMessage>
                  {actionData.errors.imageUrl}
                </ErrorMessage>
              )}
            </Field>

            <div className="flex gap-4 justify-end pt-4">
              <Button href={`/recipes/${recipe.id}`} color="zinc">
                Cancel
              </Button>
              <Button type="submit" color="blue">
                Save Changes
              </Button>
            </div>
          </Fieldset>
        </Form>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <Heading level={2} className="m-0">Recipe Steps</Heading>
            <Button href={`/recipes/${recipe.id}/steps/new`} color="green">
              + Add Step
            </Button>
          </div>

          {actionData?.errors?.reorder && (
            <div className="p-3 mb-4 bg-red-50 border border-red-600 rounded text-red-600" role="alert">
              {actionData.errors.reorder}
            </div>
          )}

          {recipe.steps.length === 0 ? (
            <div className="bg-gray-100 p-8 rounded-lg text-center">
              <Text>No steps added yet</Text>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {recipe.steps.map((step, index) => (
                <div
                  key={step.id}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                      {step.stepNum}
                    </div>
                    <div className="flex-1">
                      {step.stepTitle && (
                        <Subheading level={4} className="m-0 mb-2">{step.stepTitle}</Subheading>
                      )}
                      <Text className="m-0 mb-2">{step.description}</Text>
                      {step.ingredients.length > 0 && (
                        <Text className="text-sm">
                          {step.ingredients.length} ingredient{step.ingredients.length !== 1 ? "s" : ""}
                        </Text>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      {index > 0 && (
                        <Form method="post">
                          <input type="hidden" name="intent" value="reorderStep" />
                          <input type="hidden" name="stepId" value={step.id} />
                          <input type="hidden" name="direction" value="up" />
                          <Button type="submit" color="zinc" className="text-xs px-2 py-1" title="Move up">
                            ↑
                          </Button>
                        </Form>
                      )}
                      {index < recipe.steps.length - 1 && (
                        <Form method="post">
                          <input type="hidden" name="intent" value="reorderStep" />
                          <input type="hidden" name="stepId" value={step.id} />
                          <input type="hidden" name="direction" value="down" />
                          <Button type="submit" color="zinc" className="text-xs px-2 py-1" title="Move down">
                            ↓
                          </Button>
                        </Form>
                      )}
                    </div>
                    <Button href={`/recipes/${recipe.id}/steps/${step.id}/edit`} color="blue" className="text-sm">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
