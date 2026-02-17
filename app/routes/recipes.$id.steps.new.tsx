import type { Route } from "./+types/recipes.$id.steps.new";
import { Form, redirect, data, useActionData, useLoaderData } from "react-router";
import { getDb, db } from "~/lib/db.server";
import { requireUserId } from "~/lib/session.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Fieldset, Field, Label, ErrorMessage } from "~/components/ui/fieldset";
import { Heading } from "~/components/ui/heading";
import { Text, Strong } from "~/components/ui/text";
import { Link } from "~/components/ui/link";
import { ValidationError } from "~/components/ui/validation-error";
import { Listbox, ListboxOption, ListboxLabel } from "~/components/ui/listbox";
import { validateStepTitle, validateStepDescription, validateStepReference, STEP_TITLE_MAX_LENGTH, STEP_DESCRIPTION_MAX_LENGTH } from "~/lib/validation";
import { createStepOutputUses } from "~/lib/step-output-use-mutations.server";
import { useState } from "react";

interface ActionData {
  errors?: {
    stepTitle?: string;
    description?: string;
    usesSteps?: string;
    general?: string;
  };
}

const STEP_CONTENT_REQUIREMENT_ERROR = "Add at least 1 ingredient or 1 step output use before saving this step.";

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const { id } = params;

  /* istanbul ignore next -- @preserve Cloudflare D1 production-only path */
  const database = context?.cloudflare?.env?.DB
    ? await getDb(context.cloudflare.env as { DB: D1Database })
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

  // Load available previous steps for step output uses selection
  // Only needed if this won't be the first step
  const availableSteps = nextStepNum > 1
    ? await database.recipeStep.findMany({
        where: {
          recipeId: id,
          stepNum: { lt: nextStepNum },
        },
        select: {
          stepNum: true,
          stepTitle: true,
        },
        orderBy: { stepNum: "asc" },
      })
    : [];

  return { recipe, nextStepNum, availableSteps };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const { id } = params;
  const formData = await request.formData();

  /* istanbul ignore next -- @preserve Cloudflare D1 production-only path */
  const database = context?.cloudflare?.env?.DB
    ? await getDb(context.cloudflare.env as { DB: D1Database })
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

  const nextStepNum = recipe.steps.length > 0 ? recipe.steps[0].stepNum + 1 : 1;

  // Parse and validate selected step output uses
  const usesStepsRaw = formData.getAll("usesSteps");
  const parsedSteps = usesStepsRaw.map((s) => parseInt(s.toString(), 10));

  // Validate each selected step reference
  for (const outputStepNum of parsedSteps) {
    const validationResult = validateStepReference(outputStepNum, nextStepNum);
    if (!validationResult.valid) {
      errors.usesSteps = validationResult.error;
      break; // Show first error
    }
  }

  if (Object.keys(errors).length > 0) {
    return data({ errors }, { status: 400 });
  }

  // Filter to only valid step numbers and de-duplicate (extra safety)
  const usesSteps = [...new Set(parsedSteps.filter((n) => !isNaN(n) && n > 0 && n < nextStepNum))];

  // For non-first steps, require a dependency at creation time because ingredients
  // are added on the next screen after step creation.
  if (nextStepNum > 1 && usesSteps.length === 0) {
    errors.usesSteps = STEP_CONTENT_REQUIREMENT_ERROR;
    return data({ errors }, { status: 400 });
  }

  try {
    const step = await database.recipeStep.create({
      data: {
        recipeId: id,
        stepNum: nextStepNum,
        stepTitle: stepTitle.trim() || null,
        description: description.trim(),
      },
    });

    // Create StepOutputUse records if any steps were selected
    if (usesSteps.length > 0) {
      await createStepOutputUses(database, id, nextStepNum, usesSteps);
    }

    return redirect(`/recipes/${id}/steps/${step.id}/edit`);
  } catch (error) {
    return data(
      { errors: { general: "Failed to create step. Please try again." } },
      { status: 500 }
    );
  }
}

export default function NewStep() {
  const { recipe, nextStepNum, availableSteps } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const [selectedSteps, setSelectedSteps] = useState<number[]>([]);

  return (
    <div className="font-sans leading-relaxed p-8">
      <div className="max-w-[800px] mx-auto">
        <div className="mb-8">
          <Heading level={1}>Add Step to {recipe.title}</Heading>
          <Link
            href={`/recipes/${recipe.id}/edit`}
            className="text-blue-600 no-underline"
          >
            ← Back to recipe
          </Link>
        </div>

        {/* istanbul ignore next -- @preserve */ actionData?.errors?.general && (
          <ValidationError error={actionData.errors.general} className="mb-4" />
        )}

        <div className="bg-zinc-100 p-4 rounded-lg mb-6">
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

            {nextStepNum === 1 ? (
              <Field>
                <Label>Uses Output From</Label>
                <Text className="text-zinc-500 italic">No previous steps available</Text>
              </Field>
            ) : availableSteps.length > 0 && (
              <Field>
                <Label>Uses Output From (optional)</Label>
                <Listbox
                  multiple
                  value={selectedSteps}
                  onChange={setSelectedSteps}
                  aria-label="Select previous steps"
                  placeholder="Select previous steps (optional)"
                >
                  {availableSteps.map((step) => (
                    <ListboxOption key={step.stepNum} value={step.stepNum}>
                      <ListboxLabel>
                        Step {step.stepNum}{step.stepTitle ? `: ${step.stepTitle}` : ""}
                      </ListboxLabel>
                    </ListboxOption>
                  ))}
                </Listbox>
                {actionData?.errors?.usesSteps && (
                  <ErrorMessage>
                    {actionData.errors.usesSteps}
                  </ErrorMessage>
                )}
                {selectedSteps.map((stepNum) => (
                  <input key={stepNum} type="hidden" name="usesSteps" value={stepNum} />
                ))}
              </Field>
            )}

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
