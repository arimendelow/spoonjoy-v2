import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { db } from "~/lib/db.server";
import { cleanupDatabase } from "../helpers/cleanup";
import { createTestUser, createTestRecipe, createStepDescription, createStepTitle, createTestRoutesStub } from "../utils";
import * as sessionModule from "~/lib/session.server";

// Mock requireUserId
vi.mock("~/lib/session.server", async () => {
  const actual = await vi.importActual("~/lib/session.server");
  return {
    ...actual,
    requireUserId: vi.fn(),
  };
});

describe("Step Deletion Error UI", () => {
  let testUserId: string;
  let testRecipeId: string;

  beforeEach(async () => {
    await cleanupDatabase();

    const user = await db.user.create({
      data: createTestUser(),
    });
    testUserId = user.id;

    const recipe = await db.recipe.create({
      data: createTestRecipe(testUserId),
    });
    testRecipeId = recipe.id;

    vi.mocked(sessionModule.requireUserId).mockResolvedValue(testUserId);
  });

  afterEach(async () => {
    await cleanupDatabase();
    vi.clearAllMocks();
  });

  describe("Action - Delete with dependencies validation", () => {
    it("should return error when step cannot be deleted due to dependencies", async () => {
      // Create two steps where step 2 uses step 1
      await db.recipeStep.createMany({
        data: [
          {
            recipeId: testRecipeId,
            stepNum: 1,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 2,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
        ],
      });

      const step1 = await db.recipeStep.findFirst({
        where: { recipeId: testRecipeId, stepNum: 1 },
      });

      // Create dependency: step 2 uses output of step 1
      await db.stepOutputUse.create({
        data: {
          recipeId: testRecipeId,
          outputStepNum: 1,
          inputStepNum: 2,
        },
      });

      // Import action dynamically
      const { action } = await import("~/routes/recipes.$id.steps.$stepId.edit");

      const formData = new FormData();
      formData.set("intent", "delete");

      const request = new Request("http://localhost/recipes/test/steps/step1/edit", {
        method: "POST",
        body: formData,
      });

      const response = await action({
        request,
        params: { id: testRecipeId, stepId: step1!.id },
        context: { cloudflare: { env: null } },
      });

      // Should return a data response with error, not a redirect
      expect(response).not.toBeInstanceOf(Response);

      const responseData = response as { errors?: { stepDeletion?: string } };
      expect(responseData.errors?.stepDeletion).toBe(
        "Cannot delete Step 1 because it is used by Step 2"
      );
    });

    it("should return error listing multiple dependent steps", async () => {
      // Create three steps where steps 2 and 3 use step 1
      await db.recipeStep.createMany({
        data: [
          {
            recipeId: testRecipeId,
            stepNum: 1,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 2,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 3,
            stepTitle: createStepTitle(),
            description: createStepDescription(),
          },
        ],
      });

      const step1 = await db.recipeStep.findFirst({
        where: { recipeId: testRecipeId, stepNum: 1 },
      });

      // Create dependencies: steps 2 and 3 use output of step 1
      await db.stepOutputUse.createMany({
        data: [
          { recipeId: testRecipeId, outputStepNum: 1, inputStepNum: 2 },
          { recipeId: testRecipeId, outputStepNum: 1, inputStepNum: 3 },
        ],
      });

      const { action } = await import("~/routes/recipes.$id.steps.$stepId.edit");

      const formData = new FormData();
      formData.set("intent", "delete");

      const request = new Request("http://localhost/recipes/test/steps/step1/edit", {
        method: "POST",
        body: formData,
      });

      const response = await action({
        request,
        params: { id: testRecipeId, stepId: step1!.id },
        context: { cloudflare: { env: null } },
      });

      const responseData = response as { errors?: { stepDeletion?: string } };
      expect(responseData.errors?.stepDeletion).toBe(
        "Cannot delete Step 1 because it is used by Steps 2 and 3"
      );
    });

    it("should allow deletion when step has no dependencies", async () => {
      // Create a single step with no dependencies
      const step = await db.recipeStep.create({
        data: {
          recipeId: testRecipeId,
          stepNum: 1,
          stepTitle: createStepTitle(),
          description: createStepDescription(),
        },
      });

      const { action } = await import("~/routes/recipes.$id.steps.$stepId.edit");

      const formData = new FormData();
      formData.set("intent", "delete");

      const request = new Request("http://localhost/recipes/test/steps/step1/edit", {
        method: "POST",
        body: formData,
      });

      const response = await action({
        request,
        params: { id: testRecipeId, stepId: step.id },
        context: { cloudflare: { env: null } },
      });

      // Should redirect on successful deletion
      expect(response).toBeInstanceOf(Response);
      expect((response as Response).status).toBe(302);

      // Verify step was deleted
      const deletedStep = await db.recipeStep.findUnique({
        where: { id: step.id },
      });
      expect(deletedStep).toBeNull();
    });
  });

  describe("UI - Error display", () => {
    it("should display step deletion error near delete button", async () => {
      // Create two steps where step 2 uses step 1
      await db.recipeStep.createMany({
        data: [
          {
            recipeId: testRecipeId,
            stepNum: 1,
            stepTitle: "Prep Sauce",
            description: createStepDescription(),
          },
          {
            recipeId: testRecipeId,
            stepNum: 2,
            stepTitle: "Combine",
            description: createStepDescription(),
          },
        ],
      });

      const step1 = await db.recipeStep.findFirst({
        where: { recipeId: testRecipeId, stepNum: 1 },
        include: {
          ingredients: { include: { unit: true, ingredientRef: true } },
          usingSteps: { include: { outputOfStep: { select: { stepNum: true, stepTitle: true } } } },
        },
      });

      // Create dependency
      await db.stepOutputUse.create({
        data: {
          recipeId: testRecipeId,
          outputStepNum: 1,
          inputStepNum: 2,
        },
      });

      const { default: EditStep } = await import("~/routes/recipes.$id.steps.$stepId.edit");

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id/steps/:stepId/edit",
          Component: EditStep,
          loader: () => ({
            recipe: { id: testRecipeId, title: "Test Recipe" },
            step: {
              ...step1,
              ingredients: [],
              usingSteps: [],
            },
            availableSteps: [],
          }),
          action: () => ({
            errors: {
              stepDeletion: "Cannot delete Step 1 because it is used by Step 2",
            },
          }),
        },
      ]);

      render(
        <Stub
          initialEntries={[`/recipes/${testRecipeId}/steps/${step1!.id}/edit`]}
        />
      );

      // The error should be displayed
      const errorElement = await screen.findByRole("alert");
      expect(errorElement).toHaveTextContent(
        "Cannot delete Step 1 because it is used by Step 2"
      );
    });

    it("should style error consistently with existing error patterns", async () => {
      const step = await db.recipeStep.create({
        data: {
          recipeId: testRecipeId,
          stepNum: 1,
          stepTitle: "Test Step",
          description: createStepDescription(),
        },
      });

      const { default: EditStep } = await import("~/routes/recipes.$id.steps.$stepId.edit");

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id/steps/:stepId/edit",
          Component: EditStep,
          loader: () => ({
            recipe: { id: testRecipeId, title: "Test Recipe" },
            step: {
              ...step,
              ingredients: [],
              usingSteps: [],
            },
            availableSteps: [],
          }),
          action: () => ({
            errors: {
              stepDeletion: "Cannot delete Step 1 because it is used by Step 2",
            },
          }),
        },
      ]);

      render(
        <Stub
          initialEntries={[`/recipes/${testRecipeId}/steps/${step.id}/edit`]}
        />
      );

      const errorElement = await screen.findByRole("alert");

      // Should have the same styling as other error alerts in the codebase
      // (red background, red text, red border)
      expect(errorElement).toHaveClass("bg-red-50");
      expect(errorElement).toHaveClass("text-red-600");
      expect(errorElement).toHaveClass("border-red-600");
    });

    it("should not display error when no deletion error exists", async () => {
      const step = await db.recipeStep.create({
        data: {
          recipeId: testRecipeId,
          stepNum: 1,
          stepTitle: "Test Step",
          description: createStepDescription(),
        },
      });

      const { default: EditStep } = await import("~/routes/recipes.$id.steps.$stepId.edit");

      const Stub = createTestRoutesStub([
        {
          path: "/recipes/:id/steps/:stepId/edit",
          Component: EditStep,
          loader: () => ({
            recipe: { id: testRecipeId, title: "Test Recipe" },
            step: {
              ...step,
              ingredients: [],
              usingSteps: [],
            },
            availableSteps: [],
          }),
          // No action data - no errors
        },
      ]);

      render(
        <Stub
          initialEntries={[`/recipes/${testRecipeId}/steps/${step.id}/edit`]}
        />
      );

      // Should not find any alert with step deletion error
      const errorAlerts = screen.queryAllByRole("alert");
      const deletionErrorAlert = errorAlerts.find(alert =>
        alert.textContent?.includes("Cannot delete")
      );
      expect(deletionErrorAlert).toBeUndefined();
    });
  });
});
