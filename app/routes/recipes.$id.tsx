import type { Route } from "./+types/recipes.$id";
import { Link, redirect, useLoaderData, Form, useSubmit } from "react-router";
import { useState } from "react";
import { getDb, db } from "~/lib/db.server";
import { requireUserId } from "~/lib/session.server";
import { Button } from "~/components/ui/button";
import { Heading, Subheading } from "~/components/ui/heading";
import { Input } from "~/components/ui/input";
import { Text, Strong } from "~/components/ui/text";
import { StepOutputUseDisplay } from "~/components/StepOutputUseDisplay";
import { ConfirmationDialog } from "~/components/confirmation-dialog";

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
      chef: {
        select: {
          id: true,
          username: true,
        },
      },
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
          usingSteps: {
            include: {
              outputOfStep: {
                select: {
                  stepNum: true,
                  stepTitle: true,
                },
              },
            },
            orderBy: {
              outputStepNum: "asc",
            },
          },
        },
      },
    },
  });

  if (!recipe || recipe.deletedAt) {
    throw new Response("Recipe not found", { status: 404 });
  }

  // Check if user owns this recipe
  const isOwner = recipe.chefId === userId;

  return { recipe, isOwner };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const { id } = params;
  const formData = await request.formData();
  const intent = formData.get("intent");

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

  if (intent === "delete") {
    // Soft delete
    await database.recipe.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return redirect("/recipes");
  }

  return null;
}

export default function RecipeDetail() {
  const { recipe, isOwner } = useLoaderData<typeof loader>();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const submit = useSubmit();

  const handleDeleteConfirm = () => {
    setShowDeleteDialog(false);
    submit({ intent: "delete" }, { method: "post" });
  };

  return (
    <div className="font-sans leading-relaxed p-8">
      <div className="max-w-[900px] mx-auto">
        <div className="mb-8">
          <Link
            to="/recipes"
            className="text-blue-600 no-underline"
          >
            ← Back to recipes
          </Link>
        </div>

        <div
          className="w-full h-[300px] bg-gray-100 bg-cover bg-center rounded-lg mb-8"
          data-image-url={recipe.imageUrl}
          aria-label={`Image for ${recipe.title}`}
        />

        <div className="flex justify-between items-start mb-4">
          <div>
            <Heading level={1} className="m-0 mb-2">{recipe.title}</Heading>
            <Text className="m-0">
              By <Strong>{recipe.chef.username}</Strong>
            </Text>
          </div>
          {/* istanbul ignore next -- @preserve owner-only UI rendering */}
          {isOwner && (
            <div className="flex gap-2">
              <Button href={`/recipes/${recipe.id}/edit`} color="blue">
                Edit
              </Button>
              <Button
                color="red"
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete
              </Button>
              <ConfirmationDialog
                open={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleDeleteConfirm}
                title="Banish this recipe?"
                description={`"${recipe.title}" will be sent to the shadow realm. This cannot be undone!`}
                confirmLabel="Delete it"
                cancelLabel="Keep it"
                destructive
              />
            </div>
          )}
        </div>

        {recipe.description && (
          <div className="bg-gray-100 p-6 rounded-lg mb-8">
            <Text className="m-0">{recipe.description}</Text>
          </div>
        )}

        {recipe.servings && (
          <div className="mb-8">
            <Text>
              <Strong>Servings:</Strong> {recipe.servings}
            </Text>
          </div>
        )}

        <div>
          <Heading level={2}>Steps</Heading>
          {recipe.steps.length === 0 ? (
            <div className="bg-gray-100 p-8 rounded-lg text-center">
              <Text className="mb-4">No steps added yet</Text>
              {isOwner && (
                <Button href={`/recipes/${recipe.id}/edit`} color="blue">
                  Add Steps
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {recipe.steps.map((step) => (
                <div
                  key={step.id}
                  className="bg-white border border-gray-200 rounded-lg p-6"
                >
                  <div className="flex gap-4 mb-4">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                      {step.stepNum}
                    </div>
                    <div className="flex-1">
                      {step.stepTitle && (
                        <Subheading level={3} className="m-0 mb-2">{step.stepTitle}</Subheading>
                      )}
                    </div>
                  </div>

                  <StepOutputUseDisplay usingSteps={step.usingSteps ?? []} />

                  <Text className="m-0">{step.description}</Text>

                  {step.ingredients.length > 0 && (
                    <div className="bg-gray-100 p-4 rounded mt-4">
                      <Subheading level={4} className="m-0 mb-3 text-sm uppercase text-gray-500">
                        Ingredients
                      </Subheading>
                      <ul className="m-0 pl-6">
                        {step.ingredients.map((ingredient) => (
                          <li key={ingredient.id}>
                            {ingredient.quantity} {ingredient.unit.name} {ingredient.ingredientRef.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
