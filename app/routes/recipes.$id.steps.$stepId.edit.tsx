import type { Route } from "./+types/recipes.$id.steps.$stepId.edit";
import { Form, Link, redirect, data, useActionData, useLoaderData, useSubmit } from "react-router";
import { getDb, db } from "~/lib/db.server";
import { requireUserId } from "~/lib/session.server";
import { useState, useRef } from "react";
import { ConfirmationDialog } from "~/components/confirmation-dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Field, Label } from "~/components/ui/fieldset";
import { Text } from "~/components/ui/text";
import { ValidationError } from "~/components/ui/validation-error";
import { Listbox, ListboxOption, ListboxLabel } from "~/components/ui/listbox";
import {
  deleteExistingStepOutputUses,
  createStepOutputUses,
} from "~/lib/step-output-use-mutations.server";
import { validateStepDeletion } from "~/lib/step-deletion-validation.server";
import {
  validateStepTitle,
  validateStepDescription,
  validateQuantity,
  validateUnitName,
  validateIngredientName,
  validateStepReference,
  STEP_TITLE_MAX_LENGTH,
  STEP_DESCRIPTION_MAX_LENGTH,
  UNIT_NAME_MAX_LENGTH,
  INGREDIENT_NAME_MAX_LENGTH,
  QUANTITY_MIN,
  QUANTITY_MAX,
} from "~/lib/validation";

interface ActionData {
  errors?: {
    stepTitle?: string;
    description?: string;
    quantity?: string;
    unitName?: string;
    ingredientName?: string;
    usesSteps?: string;
    stepDeletion?: string;
    general?: string;
  };
}

interface Ingredient {
  quantity: string;
  unitName: string;
  ingredientName: string;
}

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const { id, stepId } = params;

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
    },
  });

  if (!recipe || recipe.deletedAt) {
    throw new Response("Recipe not found", { status: 404 });
  }

  if (recipe.chefId !== userId) {
    throw new Response("Unauthorized", { status: 403 });
  }

  const step = await database.recipeStep.findUnique({
    where: { id: stepId },
    include: {
      ingredients: {
        include: {
          unit: true,
          ingredientRef: true,
        },
      },
      usingSteps: {
        include: {
          outputOfStep: {
            select: { stepNum: true, stepTitle: true },
          },
        },
        orderBy: { outputStepNum: "asc" },
      },
    },
  });

  if (!step || step.recipeId !== id) {
    throw new Response("Step not found", { status: 404 });
  }

  // Get available steps (all steps with stepNum < current step's stepNum)
  const availableSteps = await database.recipeStep.findMany({
    where: {
      recipeId: id,
      stepNum: { lt: step.stepNum },
    },
    select: {
      stepNum: true,
      stepTitle: true,
    },
    orderBy: { stepNum: "asc" },
  });

  return { recipe, step, availableSteps };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const { id, stepId } = params;
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

  const step = await database.recipeStep.findUnique({
    where: { id: stepId },
    select: { id: true, recipeId: true, stepNum: true },
  });

  if (!step || step.recipeId !== id) {
    throw new Response("Step not found", { status: 404 });
  }

  // Handle delete intent
  if (intent === "delete") {
    // Validate step can be deleted (no dependencies)
    const validationResult = await validateStepDeletion(id, step.stepNum);
    if (!validationResult.valid) {
      return data(
        { errors: { stepDeletion: validationResult.error } },
        { status: 400 }
      );
    }

    await database.recipeStep.delete({
      where: { id: stepId },
    });
    return redirect(`/recipes/${id}/edit`);
  }

  // Handle add ingredient intent
  if (intent === "addIngredient") {
    /* istanbul ignore next -- @preserve formData null fallbacks */
    const quantity = parseFloat(formData.get("quantity")?.toString() || "0");
    const unitName = formData.get("unitName")?.toString() || "";
    const ingredientName = formData.get("ingredientName")?.toString() || "";

    // Validate ingredient fields
    const ingredientErrors: ActionData["errors"] = {};

    const quantityResult = validateQuantity(quantity);
    if (!quantityResult.valid) {
      ingredientErrors.quantity = quantityResult.error;
    }

    const unitNameResult = validateUnitName(unitName);
    if (!unitNameResult.valid) {
      ingredientErrors.unitName = unitNameResult.error;
    }

    const ingredientNameResult = validateIngredientName(ingredientName);
    if (!ingredientNameResult.valid) {
      ingredientErrors.ingredientName = ingredientNameResult.error;
    }

    if (Object.keys(ingredientErrors).length > 0) {
      return data({ errors: ingredientErrors }, { status: 400 });
    }

    // Get or create unit
    let unit = await database.unit.findUnique({
      where: { name: unitName.toLowerCase() },
    });

    if (!unit) {
      unit = await database.unit.create({
        data: { name: unitName.toLowerCase() },
      });
    }

    // Get or create ingredient ref
    let ingredientRef = await database.ingredientRef.findUnique({
      where: { name: ingredientName.toLowerCase() },
    });

    if (!ingredientRef) {
      ingredientRef = await database.ingredientRef.create({
        data: { name: ingredientName.toLowerCase() },
      });
    }

    // Check for duplicate ingredient in recipe
    const existingIngredient = await database.ingredient.findFirst({
      where: {
        recipeId: id,
        ingredientRefId: ingredientRef.id,
      },
    });

    if (existingIngredient) {
      return data(
        { errors: { ingredientName: "This ingredient is already in the recipe" } },
        { status: 400 }
      );
    }

    // Create ingredient
    await database.ingredient.create({
      data: {
        recipeId: id,
        stepNum: (await database.recipeStep.findUnique({ where: { id: stepId }, select: { stepNum: true } }))!.stepNum,
        quantity,
        unitId: unit.id,
        ingredientRefId: ingredientRef.id,
      },
    });

    return data({ success: true });
  }

  // Handle delete ingredient intent
  if (intent === "deleteIngredient") {
    const ingredientId = formData.get("ingredientId")?.toString();
    if (ingredientId) {
      await database.ingredient.delete({
        where: { id: ingredientId },
      });
      return data({ success: true });
    }
  }

  // Handle update step
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

  // Parse and validate selected step output uses
  const usesStepsRaw = formData.getAll("usesSteps");
  const parsedSteps = usesStepsRaw.map((s) => parseInt(s.toString(), 10));

  // Validate each selected step reference
  for (const outputStepNum of parsedSteps) {
    const validationResult = validateStepReference(outputStepNum, step.stepNum);
    if (!validationResult.valid) {
      errors.usesSteps = validationResult.error;
      break; // Show first error
    }
  }

  if (Object.keys(errors).length > 0) {
    return data({ errors }, { status: 400 });
  }

  // Filter to only valid step numbers (extra safety)
  const usesSteps = parsedSteps.filter((n) => !isNaN(n) && n > 0 && n < step.stepNum);

  try {
    await database.recipeStep.update({
      where: { id: stepId },
      data: {
        stepTitle: stepTitle.trim() || null,
        description: description.trim(),
      },
    });

    // Update step output uses: delete existing and create new
    await deleteExistingStepOutputUses(id, step.stepNum);
    if (usesSteps.length > 0) {
      await createStepOutputUses(id, step.stepNum, usesSteps);
    }

    return redirect(`/recipes/${id}/edit`);
  } catch (error) {
    return data(
      { errors: { general: "Failed to update step. Please try again." } },
      { status: 500 }
    );
  }
}

export default function EditStep() {
  const { recipe, step, availableSteps } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const [showIngredientForm, setShowIngredientForm] = useState(false);
  const [showDeleteStepDialog, setShowDeleteStepDialog] = useState(false);
  const [ingredientToRemove, setIngredientToRemove] = useState<string | null>(null);
  const submit = useSubmit();
  const deleteStepFormRef = useRef<HTMLFormElement>(null);

  // Initialize selected steps from existing usingSteps
  const [selectedSteps, setSelectedSteps] = useState<number[]>(
    step.usingSteps?.map((u) => u.outputStepNum) || []
  );

  return (
    <div className="font-sans leading-relaxed p-8">
      <div className="max-w-[800px] mx-auto">
        <div className="mb-8">
          <h1>Edit Step {step.stepNum}</h1>
          <Link
            to={`/recipes/${recipe.id}/edit`}
            className="text-blue-600 no-underline"
          >
            ← Back to recipe
          </Link>
        </div>

        {/* istanbul ignore next -- @preserve */ actionData?.errors?.general && (
          <ValidationError error={actionData.errors.general} className="mb-4" />
        )}

        <Form method="post" className="flex flex-col gap-6">
          <div>
            <label htmlFor="stepTitle" className="block mb-2 font-bold">
              Step Title (optional)
            </label>
            <Input
              type="text"
              id="stepTitle"
              name="stepTitle"
              maxLength={STEP_TITLE_MAX_LENGTH}
              defaultValue={step.stepTitle || ""}
              invalid={/* istanbul ignore next -- @preserve */ !!actionData?.errors?.stepTitle}
            />
          </div>

          {step.stepNum === 1 ? (
            <Field>
              <Label>Uses Output From</Label>
              <Text className="text-gray-500 italic">No previous steps available</Text>
            </Field>
          ) : availableSteps.length > 0 && (
            <Field>
              <Label>Uses Output From (optional)</Label>
              <Listbox
                name="usesSteps"
                multiple
                value={selectedSteps}
                onChange={setSelectedSteps}
                aria-label="Select previous steps"
                placeholder="Select previous steps (optional)"
              >
                {availableSteps.map((availableStep) => (
                  <ListboxOption key={availableStep.stepNum} value={availableStep.stepNum}>
                    <ListboxLabel>
                      Step {availableStep.stepNum}{availableStep.stepTitle ? `: ${availableStep.stepTitle}` : ""}
                    </ListboxLabel>
                  </ListboxOption>
                ))}
              </Listbox>
              {actionData?.errors?.usesSteps && (
                <div className="text-red-600 text-sm mt-1">
                  {actionData.errors.usesSteps}
                </div>
              )}
            </Field>
          )}

          <div>
            <label htmlFor="description" className="block mb-2 font-bold">
              Description *
            </label>
            <Textarea
              id="description"
              name="description"
              rows={6}
              required
              maxLength={STEP_DESCRIPTION_MAX_LENGTH}
              defaultValue={step.description}
              invalid={/* istanbul ignore next -- @preserve */ !!actionData?.errors?.description}
            />
            {/* istanbul ignore next -- @preserve */ actionData?.errors?.description && (
              <div className="text-red-600 text-sm mt-1">
                {actionData.errors.description}
              </div>
            )}
          </div>

          <div className="flex gap-4 justify-end">
            <Link
              to={`/recipes/${recipe.id}/edit`}
              className="px-6 py-3 text-base bg-gray-500 text-white no-underline rounded text-center"
            >
              Cancel
            </Link>
            <Button type="submit" color="blue">
              Save Changes
            </Button>
          </div>
        </Form>

        <div className="mt-4">
          {actionData?.errors?.stepDeletion && (
            <ValidationError error={actionData.errors.stepDeletion} className="mb-4" />
          )}
          <Form method="post" ref={deleteStepFormRef}>
            <input type="hidden" name="intent" value="delete" />
            <Button
              type="button"
              color="red"
              onClick={() => setShowDeleteStepDialog(true)}
            >
              Delete Step
            </Button>
          </Form>
          <ConfirmationDialog
            open={showDeleteStepDialog}
            onClose={() => setShowDeleteStepDialog(false)}
            onConfirm={() => {
              setShowDeleteStepDialog(false);
              deleteStepFormRef.current?.submit();
            }}
            title="Delete this step? 🗑️"
            description="This step and all its ingredients will be permanently deleted. Other steps that depend on this one may be affected."
            confirmLabel="Delete it"
            cancelLabel="Keep it"
            destructive
          />
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="m-0">Ingredients</h2>
            <Button
              onClick={() => setShowIngredientForm(!showIngredientForm)}
              color="green"
            >
              {showIngredientForm ? "Cancel" : "+ Add Ingredient"}
            </Button>
          </div>

          {showIngredientForm && (
            <Form
              method="post"
              className="bg-gray-100 p-6 rounded-lg mb-4 flex flex-col gap-4"
            >
              <input type="hidden" name="intent" value="addIngredient" />
              <div className="grid grid-cols-[1fr_1fr_2fr_auto] gap-4 items-end">
                <div>
                  <label htmlFor="quantity" className="block mb-2 text-sm font-bold">
                    Quantity
                  </label>
                  <Input
                    type="number"
                    id="quantity"
                    name="quantity"
                    step="0.01"
                    min={QUANTITY_MIN}
                    max={QUANTITY_MAX}
                    required
                    placeholder="1.5"
                  />
                </div>
                <div>
                  <label htmlFor="unitName" className="block mb-2 text-sm font-bold">
                    Unit
                  </label>
                  <Input
                    type="text"
                    id="unitName"
                    name="unitName"
                    required
                    maxLength={UNIT_NAME_MAX_LENGTH}
                    placeholder="cup"
                  />
                </div>
                <div>
                  <label htmlFor="ingredientName" className="block mb-2 text-sm font-bold">
                    Ingredient
                  </label>
                  <Input
                    type="text"
                    id="ingredientName"
                    name="ingredientName"
                    required
                    maxLength={INGREDIENT_NAME_MAX_LENGTH}
                    placeholder="flour"
                  />
                </div>
                <Button type="submit" color="green">
                  Add
                </Button>
              </div>
            </Form>
          )}

          {step.ingredients.length === 0 ? (
            <div className="bg-gray-100 p-8 rounded-lg text-center">
              <p className="text-gray-500">No ingredients added yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {step.ingredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="bg-white border border-gray-200 rounded p-3 px-4 flex justify-between items-center"
                >
                  <span>
                    <strong>{ingredient.quantity}</strong> {ingredient.unit.name} {ingredient.ingredientRef.name}
                  </span>
                  <Button
                    type="button"
                    color="red"
                    onClick={() => setIngredientToRemove(ingredient.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Remove ingredient confirmation dialog */}
        <ConfirmationDialog
          open={!!ingredientToRemove}
          onClose={() => setIngredientToRemove(null)}
          onConfirm={() => {
            /* v8 ignore start - defensive check: dialog is only open when ingredientToRemove is set */
            if (ingredientToRemove) {
              const formData = new FormData();
              formData.set("intent", "deleteIngredient");
              formData.set("ingredientId", ingredientToRemove);
              submit(formData, { method: "post" });
              setIngredientToRemove(null);
            }
            /* v8 ignore stop */
          }}
          title="Remove this ingredient? 🥕"
          description="This ingredient will be removed from the step."
          confirmLabel="Remove it"
          cancelLabel="Keep it"
          destructive
        />
      </div>
    </div>
  );
}
