import type { Route } from "./+types/recipes.$id.edit";
import { Form, redirect, data, useActionData, useLoaderData, useNavigate, useNavigation, useSubmit } from "react-router";
import { getDb, db } from "~/lib/db.server";
import { requireUserId } from "~/lib/session.server";
import { Button } from "~/components/ui/button";
import { Heading, Subheading } from "~/components/ui/heading";
import { Text } from "~/components/ui/text";
import { Link } from "~/components/ui/link";
import { ValidationError } from "~/components/ui/validation-error";
import { RecipeForm, type RecipeFormData } from "~/components/recipe/RecipeForm";
import {
  validateTitle,
  validateDescription,
  validateServings,
} from "~/lib/validation";
import { validateStepReorderComplete } from "~/lib/step-reorder-validation.server";

interface ActionData {
  errors?: {
    title?: string;
    description?: string;
    servings?: string;
    image?: string;
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
  const image = formData.get("image");
  const clearImage = formData.get("clearImage")?.toString() === "true";

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

  if (Object.keys(errors).length > 0) {
    return data({ errors }, { status: 400 });
  }

  // Handle image
  let imageUrl: string | undefined | null = undefined;
  if (clearImage) {
    imageUrl = null; // Clear the image
  } else if (image && image instanceof File && image.size > 0) {
    // TODO: Upload to Cloudflare R2 and get URL
    // For now, we'll just keep the existing image
    imageUrl = undefined; // Would be the uploaded URL
  }

  try {
    const updateData: {
      title: string;
      description: string | null;
      servings: string | null;
      imageUrl?: string | null;
    } = {
      title: title.trim(),
      description: description.trim() || null,
      servings: servings.trim() || null,
    };

    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl;
    }

    await database.recipe.update({
      where: { id },
      data: updateData,
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
  const navigate = useNavigate();
  const navigation = useNavigation();
  const submit = useSubmit();

  const isLoading = navigation.state === "submitting";

  const handleSubmit = (formData: RecipeFormData) => {
    const data = new FormData();
    if (formData.id) {
      data.set("id", formData.id);
    }
    data.set("title", formData.title);
    data.set("description", formData.description);
    data.set("servings", formData.servings);
    if (formData.imageFile) {
      data.set("image", formData.imageFile);
    }
    if (formData.clearImage) {
      data.set("clearImage", "true");
    }
    submit(data, { method: "post", encType: "multipart/form-data" });
  };

  const handleCancel = () => {
    navigate(`/recipes/${recipe.id}`);
  };

  return (
    <div className="font-sans leading-relaxed p-8">
      <div className="max-w-[800px] mx-auto">
        <div className="mb-8">
          <Heading level={1}>Edit Recipe</Heading>
          <Link
            href={`/recipes/${recipe.id}`}
            className="text-blue-600 no-underline"
          >
            ← Back to recipe
          </Link>
        </div>

        <RecipeForm
          mode="edit"
          recipe={{
            id: recipe.id,
            title: recipe.title,
            description: recipe.description,
            servings: recipe.servings,
            imageUrl: recipe.imageUrl || "",
          }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={isLoading}
          errors={actionData?.errors}
        />

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <Heading level={2} className="m-0">Recipe Steps</Heading>
            <Button href={`/recipes/${recipe.id}/steps/new`} color="green">
              + Add Step
            </Button>
          </div>

          {actionData?.errors?.reorder && (
            <ValidationError error={actionData.errors.reorder} className="mb-4" />
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
