import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within, waitFor } from 'storybook/test'
import { StepEditorCard, type StepData } from '../../../app/components/recipe/StepEditorCard'

/**
 * # StepEditorCard
 *
 * A card component for editing individual recipe steps.
 *
 * ## Features
 *
 * - **Step number display**: Visual badge showing step position
 * - **Instructions**: Textarea for step description (required)
 * - **Duration**: Optional time estimate in minutes
 * - **Ingredients**: AI parsing or manual entry modes
 * - **Actions**: Save, Remove, Move Up/Down, Drag handle
 *
 * ## Ingredient Input Modes
 *
 * - **AI Mode**: Paste or type ingredients, AI parses them
 * - **Manual Mode**: Fill in quantity, unit, name fields
 *
 * ## Accessibility
 *
 * - Proper labeling for all inputs
 * - Focus management for new steps
 * - Touch-friendly 44px minimum tap targets
 */
const meta: Meta<typeof StepEditorCard> = {
  title: 'Recipe/Input/StepEditorCard',
  component: StepEditorCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Individual step editor with instructions, duration, and ingredient management.

Supports both AI-powered ingredient parsing and manual entry.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    stepNumber: {
      control: { type: 'number', min: 1 },
      description: 'The step number to display',
    },
    step: {
      control: 'object',
      description: 'Existing step data (for edit mode)',
    },
    recipeId: {
      control: 'text',
      description: 'Recipe ID for ingredient parsing context',
    },
    onSave: {
      action: 'saved',
      description: 'Callback when Save is clicked',
    },
    onRemove: {
      action: 'removed',
      description: 'Callback when Remove is clicked',
    },
    onMoveUp: {
      action: 'moved up',
      description: 'Callback when Move Up is clicked',
    },
    onMoveDown: {
      action: 'moved down',
      description: 'Callback when Move Down is clicked',
    },
    canMoveUp: {
      control: 'boolean',
      description: 'Whether Move Up is enabled',
    },
    canMoveDown: {
      control: 'boolean',
      description: 'Whether Move Down is enabled',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables all interactions',
    },
    autoFocusInstructions: {
      control: 'boolean',
      description: 'Auto-focus instructions textarea on mount',
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
// SAMPLE DATA
// =============================================================================

const emptyStep: StepData = {
  id: 'step-new',
  stepNum: 1,
  description: '',
  ingredients: [],
}

const filledStep: StepData = {
  id: 'step-filled',
  stepNum: 2,
  description: 'In a large bowl, cream together the butter and sugars until light and fluffy, about 3-4 minutes with an electric mixer.',
  duration: 5,
  ingredients: [
    { quantity: 1, unit: 'cup', ingredientName: 'butter, softened' },
    { quantity: 0.75, unit: 'cup', ingredientName: 'granulated sugar' },
    { quantity: 0.75, unit: 'cup', ingredientName: 'brown sugar, packed' },
  ],
}

const stepWithManyIngredients: StepData = {
  id: 'step-many',
  stepNum: 3,
  description: 'Add all the spices to the mixture and stir well to combine.',
  duration: 2,
  ingredients: [
    { quantity: 1, unit: 'tsp', ingredientName: 'cinnamon' },
    { quantity: 0.5, unit: 'tsp', ingredientName: 'nutmeg' },
    { quantity: 0.25, unit: 'tsp', ingredientName: 'allspice' },
    { quantity: 0.25, unit: 'tsp', ingredientName: 'ginger' },
    { quantity: 0.125, unit: 'tsp', ingredientName: 'cloves' },
    { quantity: 1, unit: 'pinch', ingredientName: 'cardamom' },
  ],
}

// =============================================================================
// BASIC STATES
// =============================================================================

/**
 * New step - empty state.
 */
export const NewStep: Story = {
  args: {
    stepNumber: 1,
    step: emptyStep,
    recipeId: 'recipe-123',
    onSave: fn(),
    onRemove: fn(),
    onMoveUp: fn(),
    onMoveDown: fn(),
    canMoveUp: false,
    canMoveDown: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'A new, empty step ready for content. This is what users see when they click "Add Step".',
      },
    },
  },
}

/**
 * Step with content.
 */
export const FilledStep: Story = {
  args: {
    stepNumber: 2,
    step: filledStep,
    recipeId: 'recipe-123',
    onSave: fn(),
    onRemove: fn(),
    onMoveUp: fn(),
    onMoveDown: fn(),
    canMoveUp: true,
    canMoveDown: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'A step with instructions, duration, and ingredients filled in.',
      },
    },
  },
}

/**
 * Step with many ingredients.
 */
export const ManyIngredients: Story = {
  args: {
    stepNumber: 3,
    step: stepWithManyIngredients,
    recipeId: 'recipe-123',
    onSave: fn(),
    onRemove: fn(),
    onMoveUp: fn(),
    onMoveDown: fn(),
    canMoveUp: true,
    canMoveDown: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Step with many ingredients to show list handling.',
      },
    },
  },
}

/**
 * First step - can only move down.
 */
export const FirstStep: Story = {
  args: {
    stepNumber: 1,
    step: {
      ...filledStep,
      id: 'step-first',
      stepNum: 1,
    },
    recipeId: 'recipe-123',
    onSave: fn(),
    onRemove: fn(),
    onMoveUp: fn(),
    onMoveDown: fn(),
    canMoveUp: false,
    canMoveDown: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'First step in a list - Move Up is disabled.',
      },
    },
  },
}

/**
 * Last step - can only move up.
 */
export const LastStep: Story = {
  args: {
    stepNumber: 5,
    step: {
      ...filledStep,
      id: 'step-last',
      stepNum: 5,
    },
    recipeId: 'recipe-123',
    onSave: fn(),
    onRemove: fn(),
    onMoveUp: fn(),
    onMoveDown: fn(),
    canMoveUp: true,
    canMoveDown: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Last step in a list - Move Down is disabled.',
      },
    },
  },
}

/**
 * Disabled state.
 */
export const DisabledState: Story = {
  args: {
    stepNumber: 2,
    step: filledStep,
    recipeId: 'recipe-123',
    onSave: fn(),
    onRemove: fn(),
    onMoveUp: fn(),
    onMoveDown: fn(),
    canMoveUp: true,
    canMoveDown: true,
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'All inputs and buttons disabled.',
      },
    },
  },
}

/**
 * Auto-focus instructions.
 */
export const AutoFocus: Story = {
  args: {
    stepNumber: 1,
    step: emptyStep,
    recipeId: 'recipe-123',
    onSave: fn(),
    onRemove: fn(),
    canMoveUp: false,
    canMoveDown: false,
    autoFocusInstructions: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Instructions textarea is auto-focused on mount (used when adding new steps).',
      },
    },
  },
}

// =============================================================================
// WITH DRAG HANDLE
// =============================================================================

/**
 * With drag handle rendered.
 */
export const WithDragHandle: Story = {
  args: {
    stepNumber: 2,
    step: filledStep,
    recipeId: 'recipe-123',
    onSave: fn(),
    onRemove: fn(),
    onMoveUp: fn(),
    onMoveDown: fn(),
    canMoveUp: true,
    canMoveDown: true,
    dragHandle: (
      <button
        type="button"
        aria-label="Drag to reorder"
        className="cursor-grab active:cursor-grabbing p-1 min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Step with drag handle for reordering (rendered via render prop from StepList).',
      },
    },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Test: Fill and save step.
 */
export const Test_FillAndSave: Story = {
  args: {
    stepNumber: 1,
    step: emptyStep,
    recipeId: 'recipe-test',
    onSave: fn(),
    onRemove: fn(),
    canMoveUp: false,
    canMoveDown: false,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    // Fill instructions
    const instructionsInput = canvas.getByLabelText(/instructions/i)
    await userEvent.type(instructionsInput, 'Mix all ingredients together')

    // Fill duration
    const durationInput = canvas.getByLabelText(/duration/i)
    await userEvent.type(durationInput, '5')

    // Click Save
    const saveButton = canvas.getByRole('button', { name: /save/i })
    await userEvent.click(saveButton)

    // Verify onSave was called
    await expect(args.onSave).toHaveBeenCalled()
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests filling in step data and saving.',
      },
    },
  },
}

/**
 * Test: Remove button triggers callback.
 */
export const Test_RemoveButton: Story = {
  args: {
    stepNumber: 1,
    step: filledStep,
    recipeId: 'recipe-test',
    onSave: fn(),
    onRemove: fn(),
    canMoveUp: false,
    canMoveDown: false,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    // Click Remove
    const removeButton = canvas.getByRole('button', { name: /remove/i })
    await userEvent.click(removeButton)

    // Verify onRemove was called
    await expect(args.onRemove).toHaveBeenCalled()
  },
  parameters: {
    docs: {
      description: {
        story: 'Remove button triggers onRemove callback.',
      },
    },
  },
}

/**
 * Test: Move buttons work.
 */
export const Test_MoveButtons: Story = {
  args: {
    stepNumber: 2,
    step: filledStep,
    recipeId: 'recipe-test',
    onSave: fn(),
    onRemove: fn(),
    onMoveUp: fn(),
    onMoveDown: fn(),
    canMoveUp: true,
    canMoveDown: true,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    // Click Move Up
    const moveUpButton = canvas.getByRole('button', { name: /move up/i })
    await userEvent.click(moveUpButton)
    await expect(args.onMoveUp).toHaveBeenCalled()

    // Click Move Down
    const moveDownButton = canvas.getByRole('button', { name: /move down/i })
    await userEvent.click(moveDownButton)
    await expect(args.onMoveDown).toHaveBeenCalled()
  },
  parameters: {
    docs: {
      description: {
        story: 'Move Up/Down buttons trigger respective callbacks.',
      },
    },
  },
}

/**
 * Test: Disabled buttons when at edges.
 */
export const Test_DisabledMoveButtons: Story = {
  args: {
    stepNumber: 1,
    step: emptyStep,
    recipeId: 'recipe-test',
    onSave: fn(),
    onRemove: fn(),
    onMoveUp: fn(),
    onMoveDown: fn(),
    canMoveUp: false,
    canMoveDown: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Both move buttons should be disabled
    const moveUpButton = canvas.getByRole('button', { name: /move up/i })
    await expect(moveUpButton).toBeDisabled()

    const moveDownButton = canvas.getByRole('button', { name: /move down/i })
    await expect(moveDownButton).toBeDisabled()
  },
  parameters: {
    docs: {
      description: {
        story: 'Move buttons are disabled when canMoveUp/canMoveDown are false.',
      },
    },
  },
}

/**
 * Test: Ingredient mode toggle.
 */
export const Test_IngredientModeToggle: Story = {
  args: {
    stepNumber: 1,
    step: emptyStep,
    recipeId: 'recipe-test',
    onSave: fn(),
    onRemove: fn(),
    canMoveUp: false,
    canMoveDown: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Find the Manual radio button and click it
    const manualRadio = canvas.getByRole('radio', { name: /manual/i })
    await userEvent.click(manualRadio)

    // Verify Manual mode is selected
    await expect(manualRadio).toBeChecked()

    // Check that manual input fields appear
    await waitFor(() => {
      expect(canvas.getByLabelText(/quantity/i)).toBeInTheDocument()
    })
  },
  parameters: {
    docs: {
      description: {
        story: 'Toggling between AI and Manual ingredient input modes.',
      },
    },
  },
}

/**
 * Test: Disabled state prevents all interactions.
 */
export const Test_DisabledState: Story = {
  args: {
    stepNumber: 2,
    step: filledStep,
    recipeId: 'recipe-test',
    onSave: fn(),
    onRemove: fn(),
    onMoveUp: fn(),
    onMoveDown: fn(),
    canMoveUp: true,
    canMoveDown: true,
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Instructions should be disabled
    const instructionsInput = canvas.getByLabelText(/instructions/i)
    await expect(instructionsInput).toBeDisabled()

    // Duration should be disabled
    const durationInput = canvas.getByLabelText(/duration/i)
    await expect(durationInput).toBeDisabled()

    // All buttons should be disabled
    const saveButton = canvas.getByRole('button', { name: /save/i })
    await expect(saveButton).toBeDisabled()

    const removeButton = canvas.getByRole('button', { name: /remove/i })
    await expect(removeButton).toBeDisabled()
  },
  parameters: {
    docs: {
      description: {
        story: 'All inputs and buttons are disabled when disabled prop is true.',
      },
    },
  },
}

// =============================================================================
// EDGE CASES
// =============================================================================

/**
 * Long instructions text.
 */
export const LongInstructions: Story = {
  args: {
    stepNumber: 1,
    step: {
      id: 'step-long',
      stepNum: 1,
      description: 'This is a very detailed step with extensive instructions. Begin by preparing your workspace and ensuring all equipment is clean and ready. Then, carefully measure out each ingredient according to the recipe specifications. Make sure to level off dry ingredients for accuracy. When combining the ingredients, use a gentle folding motion to avoid deflating any air that has been incorporated. Continue mixing until the batter is just combined - do not overmix as this will result in a tough final product. The consistency should be smooth but still have some small lumps.',
      duration: 15,
      ingredients: [],
    },
    recipeId: 'recipe-long',
    onSave: fn(),
    onRemove: fn(),
    canMoveUp: false,
    canMoveDown: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Step with very long instructions to test textarea handling.',
      },
    },
  },
}

/**
 * High step number.
 */
export const HighStepNumber: Story = {
  args: {
    stepNumber: 99,
    step: {
      id: 'step-99',
      stepNum: 99,
      description: 'A recipe with many steps.',
      ingredients: [],
    },
    recipeId: 'recipe-many',
    onSave: fn(),
    onRemove: fn(),
    onMoveUp: fn(),
    onMoveDown: fn(),
    canMoveUp: true,
    canMoveDown: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests display of high step numbers.',
      },
    },
  },
}

/**
 * Unicode content.
 */
export const UnicodeContent: Story = {
  args: {
    stepNumber: 1,
    step: {
      id: 'step-unicode',
      stepNum: 1,
      description: '将面粉和水混合 (Mix flour and water). Добавить соль по вкусу. 🍳 Cook until golden!',
      duration: 10,
      ingredients: [
        { quantity: 2, unit: 'カップ', ingredientName: 'arroz' },
        { quantity: 1, unit: 'столовая ложка', ingredientName: 'оливковое масло' },
      ],
    },
    recipeId: 'recipe-unicode',
    onSave: fn(),
    onRemove: fn(),
    canMoveUp: false,
    canMoveDown: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests handling of international characters and emoji.',
      },
    },
  },
}
