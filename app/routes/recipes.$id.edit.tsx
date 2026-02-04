import type { Route } from "./+types/recipes.$id.edit";
import { Form, redirect, data, useActionData, useLoaderData, useNavigate, useNavigation } from "react-router";
import { useRecipeEditActions } from "~/components/navigation";
import { getDb, db } from "~/lib/db.server";
import { requireUserId } from "~/lib/session.server";
import { Heading } from "~/components/ui/heading";
import { Link } from "~/components/ui/link";
import { ValidationError } from "~/components/ui/validation-error";
import { RecipeBuilder, type RecipeBuilderData } from "~/components/recipe/RecipeBuilder";
import {
  validateTitle,
  validateDescription,
  validateServings,
} from "~/lib/validation";
import { validateStepReorderComplete } from "~/lib/step-reorder-validation.server";
import { useRef } from "react";

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
    ? await getDb(context.cloudflare.env as { DB: D1Database })
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

  // Transform steps data for RecipeBuilder
  const formattedSteps = recipe.steps.map((step) => ({
    id: step.id,
    stepNum: step.stepNum,
    stepTitle: step.stepTitle || undefined,
    description: step.description,
    duration: step.duration || undefined,
    ingredients: step.ingredients.map((ing) => ({
      quantity: ing.quantity,
      unit: ing.unit?.name || "",
      ingredientName: ing.ingredientRef?.name || "",
    })),
  }));

  return { recipe, formattedSteps };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const { id } = params;
  const formData = await request.formData();
  const intent = formData.get("intent")?.toString();

  /* istanbul ignore next -- @preserve Cloudflare D1 production-only path */
  const database = context?.cloudflare?.env?.DB
    ? await getDb(context.cloudflare.env as { DB: D1Database })
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
        const validationResult = await validateStepReorderComplete(database, id, step.stepNum, targetStepNum);
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
  const imageFile = formData.get("image") as File | null;
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

  // Validate image file if provided
  if (imageFile && imageFile.size > 0) {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(imageFile.type)) {
      errors.image = "Invalid image format";
    } else if (imageFile.size > 5 * 1024 * 1024) {
      errors.image = "Image must be less than 5MB";
    }
  }

  if (Object.keys(errors).length > 0) {
    return data({ errors }, { status: 400 });
  }

  try {
    // Build update data
    const updateData: { title: string; description: string | null; servings: string | null; imageUrl?: string } = {
      title: title.trim(),
      description: description.trim() || null,
      servings: servings.trim() || null,
    };

    // Handle image: clear if requested, otherwise keep existing
    // TODO: In production, upload imageFile to R2/storage and set URL
    if (clearImage) {
      updateData.imageUrl = "";
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
  const { recipe, formattedSteps } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isLoading = navigation.state === 'submitting';

  const handleCancel = () => {
    navigate(`/recipes/${recipe.id}`);
  };

  const handleSave = (recipeData: RecipeBuilderData) => {
    if (!formRef.current) return;

    // Populate form with recipe data
    const form = formRef.current;
    const titleInput = form.querySelector('input[name="title"]') as HTMLInputElement;
    const descriptionInput = form.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
    const servingsInput = form.querySelector('input[name="servings"]') as HTMLInputElement;
    const stepsInput = form.querySelector('input[name="steps"]') as HTMLInputElement;
    const clearImageInput = form.querySelector('input[name="clearImage"]') as HTMLInputElement;

    if (titleInput) titleInput.value = recipeData.title;
    if (descriptionInput) descriptionInput.value = recipeData.description || "";
    if (servingsInput) servingsInput.value = recipeData.servings || "";
    if (stepsInput) stepsInput.value = JSON.stringify(recipeData.steps);
    if (clearImageInput) clearImageInput.value = recipeData.clearImage ? "true" : "";

    // Handle image file
    if (recipeData.imageFile && fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(recipeData.imageFile);
      fileInputRef.current.files = dataTransfer.files;
    }

    // Submit the form
    form.requestSubmit();
  };

  // Register dock actions for this recipe edit page
  useRecipeEditActions({
    recipeId: recipe.id,
  });

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

        {/* Hidden form for submitting data to the action */}
        <Form ref={formRef} method="post" encType="multipart/form-data" className="hidden">
          <input type="hidden" name="title" />
          <textarea name="description" className="hidden" />
          <input type="hidden" name="servings" />
          <input type="hidden" name="steps" />
          <input type="hidden" name="clearImage" />
          <input ref={fileInputRef} type="file" name="image" accept="image/*" />
        </Form>

        {actionData?.errors?.reorder && (
          <ValidationError error={actionData.errors.reorder} className="mb-4" />
        )}

        <RecipeBuilder
          recipe={{
            id: recipe.id,
            title: recipe.title,
            description: recipe.description,
            servings: recipe.servings,
            imageUrl: recipe.imageUrl,
            steps: formattedSteps,
          }}
          onSave={handleSave}
          onCancel={handleCancel}
          errors={actionData?.errors}
          loading={isLoading}
        />
      </div>
    </div>
  );
}
