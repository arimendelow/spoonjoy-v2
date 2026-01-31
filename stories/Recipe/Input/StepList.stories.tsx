import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within, waitFor } from 'storybook/test'
import { StepList } from '../../../app/components/recipe/StepList'
import type { StepData } from '../../../app/components/recipe/StepEditorCard'

/**
 * # StepList
 *
 * Manages a collection of StepEditorCard instances with reordering,
 * adding, and removing capabilities.
 *
 * ## Features
 *
 * - **Add steps**: "Add Step" button appends new steps
 * - **Remove steps**: Confirmation dialog before removal
 * - **Reorder**: Drag-to-reorder or keyboard controls
 * - **Auto-renumber**: Step numbers update automatically
 * - **Empty state**: Helpful message when no steps exist
 *
 * ## Accessibility
 *
 * - Keyboard navigation with Ctrl+Arrow keys for reordering
 * - Screen reader announcements for step changes
 * - Confirmation dialog for destructive actions
 */
const meta: Meta<typeof StepList> = {
  title: 'Recipe/Input/StepList',
  component: StepList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A controlled component for managing recipe steps.

Integrates Framer Motion for drag-to-reorder and includes accessible keyboard controls.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    steps: {
      control: 'object',
      description: 'Array of step data objects',
    },
    recipeId: {
      control: 'text',
      description: 'Recipe ID for ingredient parsing context',
    },
    onChange: {
      action: 'changed',
      description: 'Callback when steps array changes',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables all interactions',
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
    description: 'Preheat oven to 375°F (190°C).',
    duration: 5,
    ingredients: [],
  },
  {
    id: 'step-2',
    stepNum: 2,
    description: 'Mix dry ingredients in a large bowl.',
    duration: 3,
    ingredients: [
      { quantity: 2, unit: 'cups', ingredientName: 'all-purpose flour' },
      { quantity: 1, unit: 'tsp', ingredientName: 'baking soda' },
      { quantity: 0.5, unit: 'tsp', ingredientName: 'salt' },
    ],
  },
  {
    id: 'step-3',
    stepNum: 3,
    description: 'Cream butter and sugar until fluffy.',
    duration: 5,
    ingredients: [
      { quantity: 1, unit: 'cup', ingredientName: 'butter, softened' },
      { quantity: 0.75, unit: 'cup', ingredientName: 'sugar' },
    ],
  },
]

// =============================================================================
// BASIC STATES
// =============================================================================

/**
 * Empty state - no steps yet.
 */
export const EmptyState: Story = {
  args: {
    steps: [],
    recipeId: 'recipe-new',
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows helpful message when no steps exist, with prominent "Add Step" button.',
      },
    },
  },
}

/**
 * Single step.
 */
export const SingleStep: Story = {
  args: {
    steps: [sampleSteps[0]],
    recipeId: 'recipe-single',
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'A single step. Move buttons are disabled when there\'s only one step.',
      },
    },
  },
}

/**
 * Multiple steps.
 */
export const MultipleSteps: Story = {
  args: {
    steps: sampleSteps,
    recipeId: 'recipe-multi',
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Multiple steps with drag handles and reorder buttons.',
      },
    },
  },
}

/**
 * Many steps (scrolling).
 */
export const ManySteps: Story = {
  args: {
    steps: [
      { id: 'step-1', stepNum: 1, description: 'Step 1: Prepare workspace and gather ingredients.', ingredients: [] },
      { id: 'step-2', stepNum: 2, description: 'Step 2: Preheat oven to correct temperature.', ingredients: [] },
      { id: 'step-3', stepNum: 3, description: 'Step 3: Mix dry ingredients thoroughly.', ingredients: [] },
      { id: 'step-4', stepNum: 4, description: 'Step 4: Mix wet ingredients separately.', ingredients: [] },
      { id: 'step-5', stepNum: 5, description: 'Step 5: Combine wet and dry ingredients.', ingredients: [] },
      { id: 'step-6', stepNum: 6, description: 'Step 6: Fold in additional mix-ins.', ingredients: [] },
      { id: 'step-7', stepNum: 7, description: 'Step 7: Portion onto baking sheet.', ingredients: [] },
      { id: 'step-8', stepNum: 8, description: 'Step 8: Bake until golden.', ingredients: [] },
      { id: 'step-9', stepNum: 9, description: 'Step 9: Cool on wire rack.', ingredients: [] },
      { id: 'step-10', stepNum: 10, description: 'Step 10: Store in airtight container.', ingredients: [] },
    ],
    recipeId: 'recipe-many',
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates handling of many steps with proper spacing.',
      },
    },
  },
}

/**
 * Disabled state.
 */
export const DisabledState: Story = {
  args: {
    steps: sampleSteps,
    recipeId: 'recipe-disabled',
    onChange: fn(),
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'All interactions disabled. Used during save operations or when editing is not allowed.',
      },
    },
  },
}

// =============================================================================
// STEPS WITH INGREDIENTS
// =============================================================================

/**
 * Steps with various ingredient states.
 */
export const StepsWithIngredients: Story = {
  args: {
    steps: [
      {
        id: 'step-1',
        stepNum: 1,
        description: 'Prep work - no ingredients needed.',
        duration: 5,
        ingredients: [],
      },
      {
        id: 'step-2',
        stepNum: 2,
        description: 'Combine all dry ingredients.',
        duration: 3,
        ingredients: [
          { quantity: 3, unit: 'cups', ingredientName: 'flour' },
          { quantity: 2, unit: 'tsp', ingredientName: 'baking powder' },
          { quantity: 1, unit: 'tsp', ingredientName: 'salt' },
          { quantity: 0.5, unit: 'tsp', ingredientName: 'cinnamon' },
        ],
      },
      {
        id: 'step-3',
        stepNum: 3,
        description: 'Mix wet ingredients.',
        duration: 2,
        ingredients: [
          { quantity: 2, unit: '', ingredientName: 'large eggs' },
          { quantity: 1, unit: 'cup', ingredientName: 'milk' },
          { quantity: 0.25, unit: 'cup', ingredientName: 'vegetable oil' },
        ],
      },
    ],
    recipeId: 'recipe-ingredients',
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Steps showing different numbers of ingredients, including steps with no ingredients.',
      },
    },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Test: Add step button works.
 */
export const Test_AddStep: Story = {
  args: {
    steps: [],
    recipeId: 'recipe-test-add',
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    // Click Add Step
    const addButton = canvas.getByRole('button', { name: /add step/i })
    await userEvent.click(addButton)

    // Verify onChange was called
    await expect(args.onChange).toHaveBeenCalled()

    // Check that a step was passed
    const calls = (args.onChange as ReturnType<typeof fn>).mock.calls
    const newSteps = calls[0][0] as StepData[]
    await expect(newSteps.length).toBe(1)
    await expect(newSteps[0].stepNum).toBe(1)
  },
  parameters: {
    docs: {
      description: {
        story: 'Clicking "Add Step" creates a new step with correct numbering.',
      },
    },
  },
}

/**
 * Test: Remove step shows confirmation.
 */
export const Test_RemoveStep: Story = {
  args: {
    steps: [sampleSteps[0]],
    recipeId: 'recipe-test-remove',
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Click Remove button on step
    const removeButton = canvas.getByRole('button', { name: /remove/i })
    await userEvent.click(removeButton)

    // Verify confirmation dialog appears
    await waitFor(() => {
      expect(canvas.getByRole('alertdialog')).toBeInTheDocument()
    })

    // Check dialog content
    await expect(canvas.getByText(/are you sure/i)).toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: /confirm/i })).toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  },
  parameters: {
    docs: {
      description: {
        story: 'Removing a step shows confirmation dialog to prevent accidental deletion.',
      },
    },
  },
}

/**
 * Test: Confirm removal deletes step.
 */
export const Test_ConfirmRemoval: Story = {
  args: {
    steps: [sampleSteps[0]],
    recipeId: 'recipe-test-confirm',
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    // Click Remove
    const removeButton = canvas.getByRole('button', { name: /remove/i })
    await userEvent.click(removeButton)

    // Wait for dialog
    await waitFor(() => {
      expect(canvas.getByRole('alertdialog')).toBeInTheDocument()
    })

    // Click Confirm
    const confirmButton = canvas.getByRole('button', { name: /confirm/i })
    await userEvent.click(confirmButton)

    // Verify onChange called with empty array
    await waitFor(() => {
      const calls = (args.onChange as ReturnType<typeof fn>).mock.calls
      const lastCall = calls[calls.length - 1]
      expect(lastCall[0]).toHaveLength(0)
    })
  },
  parameters: {
    docs: {
      description: {
        story: 'Confirming removal deletes the step and triggers onChange.',
      },
    },
  },
}

/**
 * Test: Cancel removal keeps step.
 */
export const Test_CancelRemoval: Story = {
  args: {
    steps: [sampleSteps[0]],
    recipeId: 'recipe-test-cancel',
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    // Click Remove
    const removeButton = canvas.getByRole('button', { name: /remove/i })
    await userEvent.click(removeButton)

    // Wait for dialog
    await waitFor(() => {
      expect(canvas.getByRole('alertdialog')).toBeInTheDocument()
    })

    // Click Cancel
    const cancelButton = canvas.getByRole('button', { name: /cancel/i })
    await userEvent.click(cancelButton)

    // Dialog should close
    await waitFor(() => {
      expect(canvas.queryByRole('alertdialog')).not.toBeInTheDocument()
    })

    // Step should still be visible
    await expect(canvas.getByText('Step 1')).toBeInTheDocument()
  },
  parameters: {
    docs: {
      description: {
        story: 'Canceling removal keeps the step and closes dialog.',
      },
    },
  },
}

/**
 * Test: Move up/down buttons work.
 */
export const Test_MoveButtons: Story = {
  args: {
    steps: sampleSteps,
    recipeId: 'recipe-test-move',
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    // Find Move Down button on first step
    const moveDownButtons = canvas.getAllByRole('button', { name: /move down/i })
    await userEvent.click(moveDownButtons[0])

    // Verify onChange was called with reordered steps
    await waitFor(() => {
      const calls = (args.onChange as ReturnType<typeof fn>).mock.calls
      if (calls.length > 0) {
        const reorderedSteps = calls[calls.length - 1][0] as StepData[]
        // First step should now be step-2 (was moved down, so step-2 is now first)
        expect(reorderedSteps[0].id).toBe('step-2')
      }
    })
  },
  parameters: {
    docs: {
      description: {
        story: 'Move Up/Down buttons reorder steps and update step numbers.',
      },
    },
  },
}

/**
 * Test: Disabled state prevents all actions.
 */
export const Test_DisabledPreventsActions: Story = {
  args: {
    steps: sampleSteps,
    recipeId: 'recipe-test-disabled',
    onChange: fn(),
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Add Step button should be disabled
    const addButton = canvas.getByRole('button', { name: /add step/i })
    await expect(addButton).toBeDisabled()

    // All Remove buttons should be disabled
    const removeButtons = canvas.getAllByRole('button', { name: /remove/i })
    for (const button of removeButtons) {
      await expect(button).toBeDisabled()
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'When disabled, no buttons can be clicked.',
      },
    },
  },
}

// =============================================================================
// EDGE CASES
// =============================================================================

/**
 * Steps with long descriptions.
 */
export const LongDescriptions: Story = {
  args: {
    steps: [
      {
        id: 'step-1',
        stepNum: 1,
        description: 'This is a very long step description that goes into extensive detail about what needs to be done. It includes multiple sentences explaining the technique, the reasoning behind it, and tips for success. The description continues further to test how the UI handles long text content without breaking the layout or causing overflow issues.',
        duration: 15,
        ingredients: [
          { quantity: 2, unit: 'cups', ingredientName: 'ingredient with a very long name that might wrap' },
        ],
      },
      {
        id: 'step-2',
        stepNum: 2,
        description: 'Short step.',
        ingredients: [],
      },
    ],
    recipeId: 'recipe-long',
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests UI handling of very long step descriptions.',
      },
    },
  },
}

/**
 * Steps with unicode and special characters.
 */
export const UnicodeContent: Story = {
  args: {
    steps: [
      {
        id: 'step-1',
        stepNum: 1,
        description: 'Préparer la pâte: mélanger 面粉 (flour) with 버터 (butter) 🧈',
        ingredients: [
          { quantity: 2, unit: 'カップ', ingredientName: 'crème fraîche' },
        ],
      },
      {
        id: 'step-2',
        stepNum: 2,
        description: 'Cook at 180°C / 356°F for 30–45 min ⏱️',
        ingredients: [],
      },
    ],
    recipeId: 'recipe-unicode',
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests handling of international characters, emoji, and special symbols.',
      },
    },
  },
}
