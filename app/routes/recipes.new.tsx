import type { Route } from "./+types/recipes.new";
import { redirect, data, useActionData, useNavigate, useNavigation, useSubmit } from "react-router";
import { getDb, db } from "~/lib/db.server";
import { requireUserId } from "~/lib/session.server";
import { Heading } from "~/components/ui/heading";
import { Link } from "~/components/ui/link";
import { RecipeForm, type RecipeFormData } from "~/components/recipe/RecipeForm";
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
  const image = formData.get("image");

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

  // Handle image file - for now we just validate it exists if provided
  // Image upload to storage would be implemented here
  let imageUrl: string | undefined;
  if (image && image instanceof File && image.size > 0) {
    // TODO: Upload to Cloudflare R2 and get URL
    // For now, we'll just acknowledge the file was received
    imageUrl = undefined; // Would be the uploaded URL
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
        imageUrl: imageUrl,
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
  const navigation = useNavigation();
  const submit = useSubmit();

  const isLoading = navigation.state === "submitting";

  const handleSubmit = (formData: RecipeFormData) => {
    const data = new FormData();
    data.set("title", formData.title);
    data.set("description", formData.description);
    data.set("servings", formData.servings);
    if (formData.imageFile) {
      data.set("image", formData.imageFile);
    }
    submit(data, { method: "post", encType: "multipart/form-data" });
  };

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
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={isLoading}
          errors={actionData?.errors}
        />
      </div>
    </div>
  );
}
