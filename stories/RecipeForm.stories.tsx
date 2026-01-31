import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within, waitFor } from 'storybook/test'
import { RecipeForm } from '../app/components/recipe/RecipeForm'

/**
 * # RecipeForm
 *
 * A unified form component for creating and editing recipes.
 * Handles recipe metadata (title, description, servings, image) but NOT ingredients.
 * Ingredients are added per-step after recipe creation.
 *
 * ## Modes
 *
 * - **Create**: Empty form for new recipe creation
 * - **Edit**: Pre-populated form for editing existing recipe
 *
 * ## Features
 *
 * - Title input (required, max 200 chars)
 * - Description textarea (optional, max 2000 chars)
 * - Servings input (optional, max 100 chars)
 * - Image upload via RecipeImageUpload component
 * - Form validation with error display
 * - Loading and disabled states
 */
const meta: Meta<typeof RecipeForm> = {
  title: 'Recipe/RecipeForm',
  component: RecipeForm,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Unified form for recipe create and edit flows.

Uses existing UI components (Input, Textarea, Button) and RecipeImageUpload for image handling.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'radio',
      options: ['create', 'edit'],
      description: 'Form mode - create for new recipes, edit for existing',
    },
    onSubmit: {
      action: 'submitted',
      description: 'Callback when form is submitted with valid data',
    },
    onCancel: {
      action: 'cancelled',
      description: 'Callback when cancel button is clicked',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables all form inputs and buttons',
    },
    loading: {
      control: 'boolean',
      description: 'Shows loading state on submit button',
    },
    errors: {
      control: 'object',
      description: 'Error messages for form fields',
    },
    recipe: {
      control: 'object',
      description: 'Existing recipe data (required in edit mode)',
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl mx-auto">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// CREATE MODE STORIES
// =============================================================================

/**
 * Default create mode - empty form for new recipe.
 */
export const CreateMode: Story = {
  args: {
    mode: 'create',
    onSubmit: fn(),
    onCancel: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty form for creating a new recipe. Only title is required.',
      },
    },
  },
}

/**
 * Create mode with disabled state.
 */
export const CreateModeDisabled: Story = {
  args: {
    mode: 'create',
    onSubmit: fn(),
    onCancel: fn(),
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'All inputs and buttons are disabled.',
      },
    },
  },
}

/**
 * Create mode with loading state.
 */
export const CreateModeLoading: Story = {
  args: {
    mode: 'create',
    onSubmit: fn(),
    onCancel: fn(),
    loading: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Form is disabled and submit button shows loading indicator.',
      },
    },
  },
}

/**
 * Create mode with validation errors.
 */
export const CreateModeWithErrors: Story = {
  args: {
    mode: 'create',
    onSubmit: fn(),
    onCancel: fn(),
    errors: {
      title: 'Title is required',
      description: 'Description must be 2,000 characters or less',
      general: 'Failed to create recipe. Please try again.',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Error messages displayed for invalid fields.',
      },
    },
  },
}

// =============================================================================
// EDIT MODE STORIES
// =============================================================================

const sampleRecipe = {
  id: 'recipe-abc123',
  title: 'Classic Chocolate Chip Cookies',
  description: 'Soft and chewy cookies with melty chocolate chips. A family favorite that never disappoints!',
  servings: '24 cookies',
  imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=400&fit=crop',
}

/**
 * Edit mode - populated form for existing recipe.
 */
export const EditMode: Story = {
  args: {
    mode: 'edit',
    recipe: sampleRecipe,
    onSubmit: fn(),
    onCancel: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Form pre-populated with existing recipe data.',
      },
    },
  },
}

/**
 * Edit mode without image.
 */
export const EditModeNoImage: Story = {
  args: {
    mode: 'edit',
    recipe: {
      ...sampleRecipe,
      imageUrl: '',
    },
    onSubmit: fn(),
    onCancel: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Editing a recipe that has no image.',
      },
    },
  },
}

/**
 * Edit mode with minimal data.
 */
export const EditModeMinimalData: Story = {
  args: {
    mode: 'edit',
    recipe: {
      id: 'recipe-xyz789',
      title: 'Quick Omelette',
      description: null,
      servings: null,
      imageUrl: '',
    },
    onSubmit: fn(),
    onCancel: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Editing a recipe with only required fields filled.',
      },
    },
  },
}

/**
 * Edit mode with loading state.
 */
export const EditModeLoading: Story = {
  args: {
    mode: 'edit',
    recipe: sampleRecipe,
    onSubmit: fn(),
    onCancel: fn(),
    loading: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Form disabled while saving changes.',
      },
    },
  },
}

/**
 * Edit mode with validation errors.
 */
export const EditModeWithErrors: Story = {
  args: {
    mode: 'edit',
    recipe: sampleRecipe,
    onSubmit: fn(),
    onCancel: fn(),
    errors: {
      title: 'Title must be 200 characters or less',
      servings: 'Servings must be 100 characters or less',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Error messages displayed during edit.',
      },
    },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Test: Fill and submit create form.
 */
export const FillAndSubmitCreate: Story = {
  args: {
    mode: 'create',
    onSubmit: fn(),
    onCancel: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    // Fill in title
    const titleInput = canvas.getByLabelText(/title/i)
    await userEvent.type(titleInput, 'Homemade Pizza')

    // Fill in description
    const descriptionInput = canvas.getByLabelText(/description/i)
    await userEvent.type(descriptionInput, 'Crispy crust with fresh toppings')

    // Fill in servings
    const servingsInput = canvas.getByLabelText(/servings/i)
    await userEvent.type(servingsInput, '4-6')

    // Submit form
    const submitButton = canvas.getByRole('button', { name: /create recipe/i })
    await userEvent.click(submitButton)

    // Verify submission
    await expect(args.onSubmit).toHaveBeenCalled()
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates filling and submitting the create form.',
      },
    },
  },
}

/**
 * Test: Edit and save changes.
 */
export const EditAndSave: Story = {
  args: {
    mode: 'edit',
    recipe: sampleRecipe,
    onSubmit: fn(),
    onCancel: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    // Modify title
    const titleInput = canvas.getByLabelText(/title/i)
    await userEvent.clear(titleInput)
    await userEvent.type(titleInput, 'Updated Cookie Recipe')

    // Save changes
    const submitButton = canvas.getByRole('button', { name: /save changes/i })
    await userEvent.click(submitButton)

    // Verify submission
    await expect(args.onSubmit).toHaveBeenCalled()
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates editing and saving an existing recipe.',
      },
    },
  },
}

/**
 * Test: Cancel form discards changes.
 */
export const CancelForm: Story = {
  args: {
    mode: 'create',
    onSubmit: fn(),
    onCancel: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    // Type some data
    await userEvent.type(canvas.getByLabelText(/title/i), 'Discarded Recipe')

    // Click cancel
    const cancelButton = canvas.getByRole('button', { name: /cancel/i })
    await userEvent.click(cancelButton)

    // Verify cancel was called, not submit
    await expect(args.onCancel).toHaveBeenCalled()
    await expect(args.onSubmit).not.toHaveBeenCalled()
  },
  parameters: {
    docs: {
      description: {
        story: 'Clicking cancel triggers onCancel callback.',
      },
    },
  },
}

/**
 * Test: Form validation - title required.
 */
export const ValidationTitleRequired: Story = {
  args: {
    mode: 'create',
    onSubmit: fn(),
    onCancel: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    // Try to submit without title
    const submitButton = canvas.getByRole('button', { name: /create recipe/i })
    await userEvent.click(submitButton)

    // Form should not submit (HTML5 validation)
    await expect(args.onSubmit).not.toHaveBeenCalled()
  },
  parameters: {
    docs: {
      description: {
        story: 'Form cannot be submitted without a title.',
      },
    },
  },
}

/**
 * Test: Keyboard navigation.
 */
export const KeyboardNavigation: Story = {
  args: {
    mode: 'create',
    onSubmit: fn(),
    onCancel: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Focus title
    const titleInput = canvas.getByLabelText(/title/i)
    await userEvent.click(titleInput)
    await expect(titleInput).toHaveFocus()

    // Tab to description
    await userEvent.tab()
    const descriptionInput = canvas.getByLabelText(/description/i)
    await expect(descriptionInput).toHaveFocus()

    // Tab to servings
    await userEvent.tab()
    const servingsInput = canvas.getByLabelText(/servings/i)
    await expect(servingsInput).toHaveFocus()
  },
  parameters: {
    docs: {
      description: {
        story: 'Tab navigates through form fields.',
      },
    },
  },
}

/**
 * Test: Disabled state prevents interaction.
 */
export const DisabledInteraction: Story = {
  args: {
    mode: 'create',
    onSubmit: fn(),
    onCancel: fn(),
    disabled: true,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    // All inputs should be disabled
    const titleInput = canvas.getByLabelText(/title/i)
    await expect(titleInput).toBeDisabled()

    // Buttons should be disabled
    const submitButton = canvas.getByRole('button', { name: /create recipe/i })
    await expect(submitButton).toBeDisabled()

    const cancelButton = canvas.getByRole('button', { name: /cancel/i })
    await expect(cancelButton).toBeDisabled()
  },
  parameters: {
    docs: {
      description: {
        story: 'When disabled, no interactions are possible.',
      },
    },
  },
}

// =============================================================================
// REAL-WORLD EXAMPLES
// =============================================================================

/**
 * Example: New recipe in typical flow.
 */
export const ExampleNewRecipe: Story = {
  args: {
    mode: 'create',
    onSubmit: fn(),
    onCancel: fn(),
  },
  decorators: [
    (Story) => (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Create New Recipe</h1>
        <p className="text-zinc-500">Add a new recipe to your cookbook.</p>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'How the form appears in the new recipe flow.',
      },
    },
  },
}

/**
 * Example: Editing an existing recipe.
 */
export const ExampleEditRecipe: Story = {
  args: {
    mode: 'edit',
    recipe: {
      id: 'recipe-pasta-123',
      title: 'Creamy Garlic Pasta',
      description: 'A rich and flavorful pasta dish with a creamy garlic sauce. Perfect for a quick weeknight dinner.',
      servings: '4 servings',
      imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop',
    },
    onSubmit: fn(),
    onCancel: fn(),
  },
  decorators: [
    (Story) => (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Edit Recipe</h1>
        <p className="text-zinc-500">Make changes to your recipe.</p>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'How the form appears in the edit recipe flow.',
      },
    },
  },
}

// =============================================================================
// EDGE CASES
// =============================================================================

/**
 * Long title at max length.
 */
export const LongTitle: Story = {
  args: {
    mode: 'edit',
    recipe: {
      id: 'recipe-long',
      title: 'A Very Long Recipe Title That Goes On And On And Is Meant To Test The Maximum Length Of The Title Field Which Is Set To Two Hundred Characters So We Need Enough Text Here To Reach That Limit Properly',
      description: 'Testing max length title.',
      servings: '4',
      imageUrl: '',
    },
    onSubmit: fn(),
    onCancel: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Recipe with title at maximum length (200 chars).',
      },
    },
  },
}

/**
 * Long description with multiple paragraphs.
 */
export const LongDescription: Story = {
  args: {
    mode: 'edit',
    recipe: {
      id: 'recipe-long-desc',
      title: 'Recipe with Long Description',
      description: `This is a recipe with a very detailed description that spans multiple paragraphs.

First, we'll cover the history of this dish and why it's so beloved in many cultures around the world.

Then, we'll dive into the specific techniques that make this recipe special. The key is in the preparation - taking time to properly prepare each ingredient ensures the best final result.

Finally, we'll discuss variations and substitutions for those with dietary restrictions or different taste preferences. This recipe is quite flexible and can be adapted to many different cuisines.`,
      servings: '6-8',
      imageUrl: '',
    },
    onSubmit: fn(),
    onCancel: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Recipe with multiline description.',
      },
    },
  },
}

/**
 * Unicode and special characters.
 */
export const UnicodeCharacters: Story = {
  args: {
    mode: 'edit',
    recipe: {
      id: 'recipe-unicode',
      title: 'Crème Brûlée avec Vanille 🍮',
      description: '法式焦糖布丁 - A classic French dessert with caramelized sugar topping.\n\nIngredients include: café, crème fraîche, and vanilla from Tahiti.',
      servings: '6 ramequins',
      imageUrl: '',
    },
    onSubmit: fn(),
    onCancel: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Recipe with international characters and emoji.',
      },
    },
  },
}

/**
 * All error types displayed.
 */
export const AllErrors: Story = {
  args: {
    mode: 'create',
    onSubmit: fn(),
    onCancel: fn(),
    errors: {
      title: 'Title is required',
      description: 'Description must be 2,000 characters or less',
      servings: 'Servings must be 100 characters or less',
      image: 'Image upload failed',
      general: 'Something went wrong. Please try again.',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'All possible error messages displayed.',
      },
    },
  },
}
