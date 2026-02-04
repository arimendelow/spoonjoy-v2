import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { RecipeBuilder, type RecipeBuilderData } from '../../../app/components/recipe/RecipeBuilder'
import type { StepData } from '../../../app/components/recipe/StepEditorCard'

/**
 * # RecipeBuilder - Recipe Creation Guide
 *
 * The RecipeBuilder is the **main orchestration component** for the recipe creation/editing experience.
 * This story serves as a comprehensive guide to understand the full recipe creation flow.
 *
 * ## Architecture Overview
 *
 * ```
 * RecipeBuilder
 * ├── Recipe Metadata (title, description, servings)
 * └── StepList
 *     └── StepEditorCard (per step)
 *         ├── Instructions textarea
 *         ├── Duration input
 *         └── Ingredient Input (AI or Manual mode)
 * ```
 *
 * ## User Flow
 *
 * 1. **Start**: User sees empty form with title field focused
 * 2. **Metadata**: Fill in recipe title (required), description, servings
 * 3. **Add Steps**: Click "Add Step" to create recipe steps
 * 4. **Edit Steps**: Each step has instructions, duration, and ingredients
 * 5. **Reorder**: Drag or use buttons to reorder steps
 * 6. **Save**: Click "Save Recipe" to submit all data
 *
 * ## Features
 *
 * - **Single-page experience**: No navigation during creation
 * - **Progressive disclosure**: Start simple, expand on demand
 * - **Unified save**: All changes saved together
 * - **Edit mode support**: Pre-populate for existing recipes
 */
const meta: Meta<typeof RecipeBuilder> = {
  title: 'Recipe/Input/RecipeBuilder',
  component: RecipeBuilder,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The main orchestration component for recipe creation and editing.

Combines RecipeForm (metadata) with StepList (steps + ingredients) into a unified single-page experience.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    recipe: {
      control: 'object',
      description: 'Existing recipe data for edit mode. Omit for create mode.',
    },
    onSave: {
      action: 'saved',
      description: 'Callback when Save Recipe is clicked with complete recipe data',
    },
    onCancel: {
      action: 'cancelled',
      description: 'Callback when Cancel is clicked',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables all inputs and buttons',
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-3xl mx-auto">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// SAMPLE DATA
// =============================================================================

const sampleSteps: StepData[] = [
  {
    id: 'step-1',
    stepNum: 1,
    description: 'Preheat oven to 375°F (190°C). Line a baking sheet with parchment paper.',
    duration: 5,
    ingredients: [],
  },
  {
    id: 'step-2',
    stepNum: 2,
    description: 'In a large bowl, cream together the butter and sugars until light and fluffy, about 3-4 minutes.',
    duration: 5,
    ingredients: [
      { quantity: 1, unit: 'cup', ingredientName: 'butter, softened' },
      { quantity: 0.75, unit: 'cup', ingredientName: 'granulated sugar' },
      { quantity: 0.75, unit: 'cup', ingredientName: 'brown sugar, packed' },
    ],
  },
  {
    id: 'step-3',
    stepNum: 3,
    description: 'Beat in eggs one at a time, then add vanilla extract.',
    duration: 2,
    ingredients: [
      { quantity: 2, unit: '', ingredientName: 'large eggs' },
      { quantity: 1, unit: 'tsp', ingredientName: 'vanilla extract' },
    ],
  },
  {
    id: 'step-4',
    stepNum: 4,
    description: 'In a separate bowl, whisk together flour, baking soda, and salt. Gradually add to wet ingredients.',
    duration: 3,
    ingredients: [
      { quantity: 2.25, unit: 'cups', ingredientName: 'all-purpose flour' },
      { quantity: 1, unit: 'tsp', ingredientName: 'baking soda' },
      { quantity: 1, unit: 'tsp', ingredientName: 'salt' },
    ],
  },
  {
    id: 'step-5',
    stepNum: 5,
    description: 'Fold in chocolate chips until evenly distributed.',
    duration: 1,
    ingredients: [
      { quantity: 2, unit: 'cups', ingredientName: 'semi-sweet chocolate chips' },
    ],
  },
  {
    id: 'step-6',
    stepNum: 6,
    description: 'Drop rounded tablespoons of dough onto prepared baking sheet, spacing 2 inches apart.',
    duration: 5,
    ingredients: [],
  },
  {
    id: 'step-7',
    stepNum: 7,
    description: 'Bake for 9-11 minutes until edges are golden but centers still look slightly underdone. Cool on baking sheet for 5 minutes.',
    duration: 15,
    ingredients: [],
  },
]

const sampleRecipe: RecipeBuilderData = {
  id: 'recipe-cookies-123',
  title: 'Classic Chocolate Chip Cookies',
  description: 'Soft and chewy cookies with melty chocolate chips. A family favorite that never disappoints! Perfect for bake sales, holiday gifts, or an afternoon treat.',
  servings: '24 cookies',
  imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=400&fit=crop',
  steps: sampleSteps,
}

// =============================================================================
// CREATE MODE - USER FLOW GUIDE
// =============================================================================

/**
 * ## Step 1: Empty State (New Recipe)
 *
 * When creating a new recipe, users see:
 * - "Create Recipe" heading
 * - Empty title, description, servings fields
 * - "No steps yet" message
 * - "Add Step" button
 *
 * **First action**: Enter a recipe title (required to save)
 */
export const Step1_EmptyState: Story = {
  name: '1. Empty State (New Recipe)',
  args: {
    onSave: fn(),
    onCancel: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: `
**Starting point for new recipes.**

The form starts empty. Users must:
1. Enter a title (required)
2. Optionally add description and servings
3. Add steps with ingredients

The "Save Recipe" button is visually disabled until a title is entered.
        `,
      },
    },
  },
}

/**
 * ## Step 2: Adding Recipe Metadata
 *
 * After filling in basic information:
 * - Title is filled (enables Save button)
 * - Description provides context
 * - Servings helps with scaling later
 */
export const Step2_WithMetadata: Story = {
  name: '2. With Metadata Filled',
  args: {
    recipe: {
      title: 'Homemade Pizza',
      description: 'A delicious homemade pizza with crispy crust and your favorite toppings.',
      servings: '4 servings',
      imageUrl: '',
      steps: [],
    },
    onSave: fn(),
    onCancel: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: `
**Metadata filled, ready for steps.**

At this point, the recipe has basic info but no steps yet.
User's next action: Click "Add Step" to begin adding recipe instructions.
        `,
      },
    },
  },
}

/**
 * ## Step 3: First Step Added
 *
 * After clicking "Add Step":
 * - A new StepEditorCard appears
 * - Instructions textarea is auto-focused
 * - User can add duration and ingredients
 */
export const Step3_OneStepAdded: Story = {
  name: '3. First Step Added',
  args: {
    recipe: {
      title: 'Homemade Pizza',
      description: 'A delicious homemade pizza with crispy crust and your favorite toppings.',
      servings: '4 servings',
      imageUrl: '',
      steps: [
        {
          id: 'step-1',
          stepNum: 1,
          description: 'Preheat oven to 450°F (230°C). Place pizza stone in oven while preheating.',
          duration: 30,
          ingredients: [],
        },
      ],
    },
    onSave: fn(),
    onCancel: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: `
**First step added to the recipe.**

The step card shows:
- Step number badge (1)
- Instructions with placeholder text
- Duration field (optional)
- Ingredient input section (AI or Manual mode)
- Action buttons: Save, Remove, reorder controls
        `,
      },
    },
  },
}

/**
 * ## Step 4: Multiple Steps with Ingredients
 *
 * A recipe in progress with:
 * - Multiple steps
 * - Ingredients attached to relevant steps
 * - Duration times for planning
 */
export const Step4_MultipleSteps: Story = {
  name: '4. Multiple Steps with Ingredients',
  args: {
    recipe: {
      title: 'Homemade Pizza',
      description: 'A delicious homemade pizza with crispy crust and your favorite toppings.',
      servings: '4 servings',
      imageUrl: '',
      steps: [
        {
          id: 'step-1',
          stepNum: 1,
          description: 'Preheat oven to 450°F (230°C). Place pizza stone in oven while preheating.',
          duration: 30,
          ingredients: [],
        },
        {
          id: 'step-2',
          stepNum: 2,
          description: 'Stretch the pizza dough on a floured surface to about 12 inches diameter.',
          duration: 5,
          ingredients: [
            { quantity: 1, unit: 'lb', ingredientName: 'pizza dough' },
            { quantity: 2, unit: 'tbsp', ingredientName: 'flour for dusting' },
          ],
        },
        {
          id: 'step-3',
          stepNum: 3,
          description: 'Spread sauce evenly over dough, leaving 1/2 inch border.',
          duration: 2,
          ingredients: [
            { quantity: 0.5, unit: 'cup', ingredientName: 'pizza sauce' },
          ],
        },
        {
          id: 'step-4',
          stepNum: 4,
          description: 'Add cheese and toppings. Transfer to preheated stone.',
          duration: 3,
          ingredients: [
            { quantity: 2, unit: 'cups', ingredientName: 'mozzarella cheese, shredded' },
            { quantity: 0.5, unit: 'cup', ingredientName: 'pepperoni slices' },
          ],
        },
        {
          id: 'step-5',
          stepNum: 5,
          description: 'Bake for 10-12 minutes until crust is golden and cheese is bubbly.',
          duration: 12,
          ingredients: [],
        },
      ],
    },
    onSave: fn(),
    onCancel: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: `
**Recipe with multiple steps and ingredients.**

Each step can have:
- Detailed instructions
- Estimated duration
- Related ingredients (parsed via AI or added manually)

Steps can be reordered using drag handles or Move Up/Down buttons.
        `,
      },
    },
  },
}

// =============================================================================
// EDIT MODE
// =============================================================================

/**
 * ## Edit Mode: Complete Recipe
 *
 * When editing an existing recipe:
 * - "Edit Recipe" heading (not "Create Recipe")
 * - All fields pre-populated
 * - All steps loaded with their ingredients
 * - Same editing capabilities as create mode
 */
export const EditMode_CompleteRecipe: Story = {
  name: 'Edit Mode - Complete Recipe',
  args: {
    recipe: sampleRecipe,
    onSave: fn(),
    onCancel: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: `
**Editing a fully-developed recipe.**

This shows a chocolate chip cookie recipe with:
- Complete metadata (title, description, servings)
- 7 detailed steps
- Ingredients attached to relevant steps
- Duration estimates for timing

All fields can be modified and saved together.
        `,
      },
    },
  },
}

/**
 * ## Edit Mode: Minimal Recipe
 *
 * Editing a recipe with only required data.
 */
export const EditMode_Minimal: Story = {
  name: 'Edit Mode - Minimal Data',
  args: {
    recipe: {
      id: 'recipe-quick',
      title: 'Quick Scrambled Eggs',
      description: null,
      servings: null,
      imageUrl: '',
      steps: [
        {
          id: 'step-1',
          stepNum: 1,
          description: 'Beat eggs in a bowl. Cook in buttered pan over medium heat, stirring frequently.',
          ingredients: [
            { quantity: 3, unit: '', ingredientName: 'eggs' },
            { quantity: 1, unit: 'tbsp', ingredientName: 'butter' },
          ],
        },
      ],
    },
    onSave: fn(),
    onCancel: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: `
**Editing a simple recipe with minimal data.**

Shows that recipes don't need all fields filled - only title is required.
        `,
      },
    },
  },
}

/**
 * ## Edit Mode: With Existing Image
 *
 * Editing a recipe that has an existing image.
 * Shows the image upload component with the current image displayed.
 */
export const EditMode_WithExistingImage: Story = {
  name: 'Edit Mode - With Existing Image',
  args: {
    recipe: {
      id: 'recipe-with-image',
      title: 'Homemade Bread',
      description: 'Crusty artisan bread with a soft interior.',
      servings: '1 loaf',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop',
      steps: [
        {
          id: 'step-1',
          stepNum: 1,
          description: 'Mix flour, yeast, salt, and water. Knead for 10 minutes.',
          duration: 15,
          ingredients: [
            { quantity: 3, unit: 'cups', ingredientName: 'bread flour' },
            { quantity: 1, unit: 'tsp', ingredientName: 'instant yeast' },
            { quantity: 1.5, unit: 'tsp', ingredientName: 'salt' },
            { quantity: 1.25, unit: 'cups', ingredientName: 'warm water' },
          ],
        },
        {
          id: 'step-2',
          stepNum: 2,
          description: 'Let rise for 1 hour, shape, and bake at 450°F for 30 minutes.',
          duration: 90,
          ingredients: [],
        },
      ],
    },
    onSave: fn(),
    onCancel: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: `
**Editing a recipe with an existing image.**

The RecipeImageUpload component shows:
- The current recipe image
- "Change Image" button to replace it
- "Remove" button to clear it

Users can upload a new image or remove the existing one.
        `,
      },
    },
  },
}

// =============================================================================
// STATES
// =============================================================================

/**
 * ## Disabled State
 *
 * All inputs and buttons disabled (e.g., during save operation).
 */
export const DisabledState: Story = {
  name: 'Disabled State',
  args: {
    recipe: sampleRecipe,
    onSave: fn(),
    onCancel: fn(),
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: `
**Form in disabled state.**

Used when:
- Save operation is in progress
- User lacks edit permissions
- Recipe is locked

All inputs, buttons, and step controls are non-interactive.
        `,
      },
    },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Test: Complete create flow with steps.
 */
export const Test_CreateFlow: Story = {
  name: 'Test: Create Recipe Flow',
  args: {
    onSave: fn(),
    onCancel: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    // Fill in title
    const titleInput = canvas.getByLabelText(/title/i)
    await userEvent.type(titleInput, 'Test Recipe')

    // Fill in description
    const descriptionInput = canvas.getByLabelText(/description/i)
    await userEvent.type(descriptionInput, 'A test recipe for Storybook')

    // Fill in servings
    const servingsInput = canvas.getByLabelText(/servings/i)
    await userEvent.type(servingsInput, '4 servings')

    // Add a step
    const addStepButton = canvas.getByRole('button', { name: /add step/i })
    await userEvent.click(addStepButton)

    // Verify step was added
    await expect(canvas.getByText('Step 1')).toBeInTheDocument()

    // Save recipe
    const saveButton = canvas.getByRole('button', { name: /save recipe/i })
    await userEvent.click(saveButton)

    // Verify save was called
    await expect(args.onSave).toHaveBeenCalled()
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests the complete recipe creation flow: fill metadata, add step, save.',
      },
    },
  },
}

/**
 * Test: Cancel discards changes.
 */
export const Test_CancelFlow: Story = {
  name: 'Test: Cancel Flow',
  args: {
    onSave: fn(),
    onCancel: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    // Type something
    await userEvent.type(canvas.getByLabelText(/title/i), 'Will be discarded')

    // Click cancel
    const cancelButton = canvas.getByRole('button', { name: /cancel/i })
    await userEvent.click(cancelButton)

    // Verify cancel called, save not called
    await expect(args.onCancel).toHaveBeenCalled()
    await expect(args.onSave).not.toHaveBeenCalled()
  },
  parameters: {
    docs: {
      description: {
        story: 'Clicking Cancel triggers onCancel callback.',
      },
    },
  },
}

/**
 * Test: Save requires title.
 */
export const Test_TitleRequired: Story = {
  name: 'Test: Title Required',
  args: {
    onSave: fn(),
    onCancel: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    // Try to save without title
    const saveButton = canvas.getByRole('button', { name: /save recipe/i })
    await userEvent.click(saveButton)

    // Should not save
    await expect(args.onSave).not.toHaveBeenCalled()
  },
  parameters: {
    docs: {
      description: {
        story: 'Recipe cannot be saved without a title.',
      },
    },
  },
}

/**
 * Test: Edit mode preserves data.
 */
export const Test_EditModePreservesData: Story = {
  name: 'Test: Edit Mode Preserves Data',
  args: {
    recipe: {
      id: 'test-recipe',
      title: 'Original Title',
      description: 'Original description',
      servings: '4',
      imageUrl: '',
      steps: [
        {
          id: 'step-1',
          stepNum: 1,
          description: 'Original step',
          ingredients: [],
        },
      ],
    },
    onSave: fn(),
    onCancel: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Verify pre-populated data
    const titleInput = canvas.getByLabelText(/title/i) as HTMLInputElement
    await expect(titleInput.value).toBe('Original Title')

    const descriptionInput = canvas.getByLabelText(/description/i) as HTMLTextAreaElement
    await expect(descriptionInput.value).toBe('Original description')

    // Verify step is present
    await expect(canvas.getByText('Step 1')).toBeInTheDocument()
  },
  parameters: {
    docs: {
      description: {
        story: 'Edit mode correctly pre-populates all form fields.',
      },
    },
  },
}

/**
 * Test: Disabled state prevents interaction.
 */
export const Test_DisabledState: Story = {
  name: 'Test: Disabled State',
  args: {
    recipe: sampleRecipe,
    onSave: fn(),
    onCancel: fn(),
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Verify inputs are disabled
    const titleInput = canvas.getByLabelText(/title/i)
    await expect(titleInput).toBeDisabled()

    const descriptionInput = canvas.getByLabelText(/description/i)
    await expect(descriptionInput).toBeDisabled()

    // Verify buttons are disabled
    const saveButton = canvas.getByRole('button', { name: /save recipe/i })
    await expect(saveButton).toBeDisabled()

    const cancelButton = canvas.getByRole('button', { name: /cancel/i })
    await expect(cancelButton).toBeDisabled()

    const addStepButton = canvas.getByRole('button', { name: /add step/i })
    await expect(addStepButton).toBeDisabled()
  },
  parameters: {
    docs: {
      description: {
        story: 'All interactions are disabled when disabled prop is true.',
      },
    },
  },
}

// =============================================================================
// REAL-WORLD EXAMPLES
// =============================================================================

/**
 * Example: Recipe with complex steps.
 */
export const Example_ComplexRecipe: Story = {
  name: 'Example: Complex Recipe',
  args: {
    recipe: {
      id: 'recipe-lasagna',
      title: 'Classic Italian Lasagna',
      description: 'Layers of pasta, rich meat sauce, creamy béchamel, and melted cheese. This authentic Italian lasagna takes time but is absolutely worth it.',
      servings: '8-10 servings',
      imageUrl: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&h=400&fit=crop',
      steps: [
        {
          id: 'step-1',
          stepNum: 1,
          description: 'Make the meat sauce: Brown ground beef and Italian sausage in a large pot. Add onion, garlic, and cook until softened.',
          duration: 15,
          ingredients: [
            { quantity: 1, unit: 'lb', ingredientName: 'ground beef' },
            { quantity: 0.5, unit: 'lb', ingredientName: 'Italian sausage' },
            { quantity: 1, unit: '', ingredientName: 'large onion, diced' },
            { quantity: 4, unit: 'cloves', ingredientName: 'garlic, minced' },
          ],
        },
        {
          id: 'step-2',
          stepNum: 2,
          description: 'Add crushed tomatoes, tomato paste, Italian herbs, and simmer for at least 30 minutes.',
          duration: 35,
          ingredients: [
            { quantity: 2, unit: 'cans (28 oz)', ingredientName: 'crushed tomatoes' },
            { quantity: 1, unit: 'can (6 oz)', ingredientName: 'tomato paste' },
            { quantity: 2, unit: 'tsp', ingredientName: 'Italian seasoning' },
            { quantity: 1, unit: 'tsp', ingredientName: 'sugar' },
          ],
        },
        {
          id: 'step-3',
          stepNum: 3,
          description: 'Make béchamel sauce: Melt butter, whisk in flour, then gradually add milk while whisking constantly.',
          duration: 15,
          ingredients: [
            { quantity: 4, unit: 'tbsp', ingredientName: 'butter' },
            { quantity: 0.25, unit: 'cup', ingredientName: 'all-purpose flour' },
            { quantity: 3, unit: 'cups', ingredientName: 'whole milk' },
            { quantity: 0.25, unit: 'tsp', ingredientName: 'nutmeg' },
          ],
        },
        {
          id: 'step-4',
          stepNum: 4,
          description: 'Prepare ricotta mixture: Combine ricotta, egg, parsley, and half the parmesan.',
          duration: 5,
          ingredients: [
            { quantity: 2, unit: 'lbs', ingredientName: 'ricotta cheese' },
            { quantity: 1, unit: '', ingredientName: 'egg' },
            { quantity: 0.25, unit: 'cup', ingredientName: 'fresh parsley, chopped' },
            { quantity: 1, unit: 'cup', ingredientName: 'parmesan cheese, grated' },
          ],
        },
        {
          id: 'step-5',
          stepNum: 5,
          description: 'Assemble: Layer meat sauce, lasagna noodles, ricotta mixture, béchamel, and mozzarella. Repeat 3 times.',
          duration: 20,
          ingredients: [
            { quantity: 1, unit: 'lb', ingredientName: 'lasagna noodles' },
            { quantity: 4, unit: 'cups', ingredientName: 'mozzarella cheese, shredded' },
          ],
        },
        {
          id: 'step-6',
          stepNum: 6,
          description: 'Cover with foil and bake at 375°F for 45 minutes. Remove foil and bake 15 more minutes until bubbly.',
          duration: 60,
          ingredients: [],
        },
      ],
    },
    onSave: fn(),
    onCancel: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'A complex recipe with many steps and ingredients, demonstrating the full capability of the RecipeBuilder.',
      },
    },
  },
}

/**
 * Example: Quick recipe with few steps.
 */
export const Example_QuickRecipe: Story = {
  name: 'Example: Quick Recipe',
  args: {
    recipe: {
      id: 'recipe-toast',
      title: 'Avocado Toast',
      description: 'Simple, healthy, and delicious breakfast.',
      servings: '1 serving',
      imageUrl: '',
      steps: [
        {
          id: 'step-1',
          stepNum: 1,
          description: 'Toast bread until golden and crispy.',
          duration: 3,
          ingredients: [
            { quantity: 1, unit: 'slice', ingredientName: 'sourdough bread' },
          ],
        },
        {
          id: 'step-2',
          stepNum: 2,
          description: 'Mash avocado with salt, pepper, and lime juice. Spread on toast. Top with red pepper flakes.',
          duration: 2,
          ingredients: [
            { quantity: 0.5, unit: '', ingredientName: 'ripe avocado' },
            { quantity: 1, unit: 'squeeze', ingredientName: 'lime juice' },
            { quantity: 1, unit: 'pinch', ingredientName: 'red pepper flakes' },
          ],
        },
      ],
    },
    onSave: fn(),
    onCancel: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'A simple recipe showing that RecipeBuilder works well for both complex and quick recipes.',
      },
    },
  },
}
