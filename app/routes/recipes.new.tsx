import type { Route } from "./+types/recipes.new";
import { redirect, data, useActionData, useNavigate } from "react-router";
import { getDb, db } from "~/lib/db.server";
import { requireUserId } from "~/lib/session.server";
import { Heading } from "~/components/ui/heading";
import { Link } from "~/components/ui/link";
import { RecipeForm } from "~/components/recipe/RecipeForm";
import {
  validateTitle,
  validateDescription,
  validateServings,
} from "~/lib/validation";

interface ActionData {
  errors?: {
    title?: string;
    description?: string;
    servings?: string;
    image?: string;
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
  const imageFile = formData.get("image") as File | null;

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

  /* istanbul ignore next -- @preserve Cloudflare D1 production-only path */
  const database = context?.cloudflare?.env?.DB
    ? getDb(context.cloudflare.env as { DB: D1Database })
    : db;

  try {
    // TODO: In production, upload imageFile to R2/storage and get URL
    // For now, we'll just create the recipe without an image URL from file
    const recipe = await database.recipe.create({
      data: {
        title: title.trim(),
        description: description.trim() || null,
        servings: servings.trim() || null,
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
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate("/recipes");
  };

  return (
    <div className="font-sans leading-relaxed p-8">
      <div className="max-w-[800px] mx-auto">
        <div className="mb-8">
          <Heading level={1}>Create New Recipe</Heading>
          <Link
            href="/recipes"
            className="text-blue-600 no-underline"
          >
            ← Back to recipes
          </Link>
        </div>

        <RecipeForm
          mode="create"
          onCancel={handleCancel}
          errors={actionData?.errors}
        />
      </div>
    </div>
  );
}
