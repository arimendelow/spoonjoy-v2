import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { ParsedIngredientRow } from '../../../app/components/recipe/ParsedIngredientRow'

/**
 * # ParsedIngredientRow
 *
 * Displays a single parsed ingredient with inline edit and remove capabilities.
 * Used in the parsed ingredients list after AI parsing.
 *
 * ## Features
 *
 * - **Display mode** - Shows quantity, unit, and ingredient name
 * - **Inline edit** - Click edit to modify values directly
 * - **Remove action** - Remove this ingredient from the list
 * - **Keyboard support** - Enter to save, Escape to cancel edit
 *
 * ## Data Structure
 *
 * Expects a `ParsedIngredient` object:
 * ```ts
 * { quantity: number, unit: string, ingredientName: string }
 * ```
 */
const meta: Meta<typeof ParsedIngredientRow> = {
  title: 'Recipe/Input/ParsedIngredientRow',
  component: ParsedIngredientRow,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A row in the parsed ingredients list. Each row displays the ingredient data
and provides actions to edit or remove it.

The edit mode allows users to correct any parsing errors inline before
adding ingredients to their recipe step.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onEdit: {
      action: 'edited',
      description: 'Callback when ingredient is edited',
    },
    onRemove: {
      action: 'removed',
      description: 'Callback when ingredient is removed',
    },
  },
  decorators: [
    (Story) => (
      <ul className="max-w-2xl list-none p-0 m-0">
        <Story />
      </ul>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// BASIC STORIES
// =============================================================================

/**
 * Default display of a parsed ingredient.
 * Shows quantity, unit, and ingredient name with edit/remove actions.
 */
export const Default: Story = {
  args: {
    ingredient: { quantity: 2, unit: 'cups', ingredientName: 'all-purpose flour' },
    onEdit: fn(),
    onRemove: fn(),
  },
}

/**
 * Ingredient with decimal quantity.
 */
export const DecimalQuantity: Story = {
  args: {
    ingredient: { quantity: 0.5, unit: 'tsp', ingredientName: 'vanilla extract' },
    onEdit: fn(),
    onRemove: fn(),
  },
}

/**
 * Ingredient with a very small quantity.
 */
export const SmallQuantity: Story = {
  args: {
    ingredient: { quantity: 0.125, unit: 'tsp', ingredientName: 'salt' },
    onEdit: fn(),
    onRemove: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Very small quantities (like 1/8 tsp) display correctly as decimals.',
      },
    },
  },
}

/**
 * Ingredient with a compound name.
 */
export const CompoundName: Story = {
  args: {
    ingredient: { quantity: 2, unit: 'tbsp', ingredientName: 'extra virgin olive oil' },
    onEdit: fn(),
    onRemove: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Compound ingredient names stay together as parsed.',
      },
    },
  },
}

/**
 * Ingredient with prep notes.
 */
export const WithPrepNotes: Story = {
  args: {
    ingredient: { quantity: 1, unit: 'cup', ingredientName: 'onion, finely diced' },
    onEdit: fn(),
    onRemove: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Preparation notes are kept with the ingredient name.',
      },
    },
  },
}

/**
 * Ingredient with special characters.
 */
export const SpecialCharacters: Story = {
  args: {
    ingredient: { quantity: 1, unit: 'oz', ingredientName: "baker's chocolate (70%)" },
    onEdit: fn(),
    onRemove: fn(),
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Test: Click remove button.
 */
export const ClickRemove: Story = {
  args: {
    ingredient: { quantity: 3, unit: 'large', ingredientName: 'eggs' },
    onEdit: fn(),
    onRemove: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('button', { name: /remove/i }))

    await expect(args.onRemove).toHaveBeenCalledWith(args.ingredient)
  },
  parameters: {
    docs: {
      description: {
        story: 'Clicking remove calls onRemove with the ingredient.',
      },
    },
  },
}

/**
 * Test: Enter edit mode.
 */
export const EnterEditMode: Story = {
  args: {
    ingredient: { quantity: 2, unit: 'cups', ingredientName: 'flour' },
    onEdit: fn(),
    onRemove: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('button', { name: /edit/i }))

    // Should show input fields
    await expect(canvas.getByRole('spinbutton', { name: /quantity/i })).toBeInTheDocument()
    await expect(canvas.getByRole('textbox', { name: /unit/i })).toBeInTheDocument()
    await expect(canvas.getByRole('textbox', { name: /ingredient/i })).toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: /save/i })).toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  },
  parameters: {
    docs: {
      description: {
        story: 'Clicking edit switches to inline edit mode with save/cancel buttons.',
      },
    },
  },
}

/**
 * Test: Edit and save changes.
 */
export const EditAndSave: Story = {
  args: {
    ingredient: { quantity: 2, unit: 'cups', ingredientName: 'flour' },
    onEdit: fn(),
    onRemove: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    // Enter edit mode
    await userEvent.click(canvas.getByRole('button', { name: /edit/i }))

    // Change quantity
    const quantityInput = canvas.getByRole('spinbutton', { name: /quantity/i })
    await userEvent.clear(quantityInput)
    await userEvent.type(quantityInput, '3')

    // Change unit
    const unitInput = canvas.getByRole('textbox', { name: /unit/i })
    await userEvent.clear(unitInput)
    await userEvent.type(unitInput, 'tbsp')

    // Save
    await userEvent.click(canvas.getByRole('button', { name: /save/i }))

    await expect(args.onEdit).toHaveBeenCalledWith({
      quantity: 3,
      unit: 'tbsp',
      ingredientName: 'flour',
    })
  },
  parameters: {
    docs: {
      description: {
        story: 'Edit values and save to update the ingredient.',
      },
    },
  },
}

/**
 * Test: Cancel edit.
 */
export const CancelEdit: Story = {
  args: {
    ingredient: { quantity: 2, unit: 'cups', ingredientName: 'flour' },
    onEdit: fn(),
    onRemove: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    // Enter edit mode
    await userEvent.click(canvas.getByRole('button', { name: /edit/i }))

    // Make changes
    const quantityInput = canvas.getByRole('spinbutton', { name: /quantity/i })
    await userEvent.clear(quantityInput)
    await userEvent.type(quantityInput, '999')

    // Cancel
    await userEvent.click(canvas.getByRole('button', { name: /cancel/i }))

    // Should not have called onEdit
    await expect(args.onEdit).not.toHaveBeenCalled()

    // Should be back in display mode
    await expect(canvas.queryByRole('spinbutton')).not.toBeInTheDocument()
    await expect(canvas.getByText('2')).toBeInTheDocument()
  },
  parameters: {
    docs: {
      description: {
        story: 'Cancel discards changes and returns to display mode.',
      },
    },
  },
}

/**
 * Test: Save with Enter key.
 */
export const SaveWithEnter: Story = {
  args: {
    ingredient: { quantity: 1, unit: 'cup', ingredientName: 'milk' },
    onEdit: fn(),
    onRemove: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('button', { name: /edit/i }))

    const ingredientInput = canvas.getByRole('textbox', { name: /ingredient/i })
    await userEvent.clear(ingredientInput)
    await userEvent.type(ingredientInput, 'cream{enter}')

    await expect(args.onEdit).toHaveBeenCalledWith({
      quantity: 1,
      unit: 'cup',
      ingredientName: 'cream',
    })
  },
  parameters: {
    docs: {
      description: {
        story: 'Press Enter in any field to save changes.',
      },
    },
  },
}

/**
 * Test: Cancel with Escape key.
 */
export const CancelWithEscape: Story = {
  args: {
    ingredient: { quantity: 1, unit: 'cup', ingredientName: 'water' },
    onEdit: fn(),
    onRemove: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('button', { name: /edit/i }))
    await userEvent.keyboard('{Escape}')

    await expect(args.onEdit).not.toHaveBeenCalled()
    await expect(canvas.queryByRole('spinbutton')).not.toBeInTheDocument()
  },
  parameters: {
    docs: {
      description: {
        story: 'Press Escape to cancel edit mode.',
      },
    },
  },
}

// =============================================================================
// REAL WORLD EXAMPLES
// =============================================================================

/**
 * Example: Butter with prep notes.
 */
export const ExampleButter: Story = {
  args: {
    ingredient: { quantity: 0.5, unit: 'cup', ingredientName: 'unsalted butter, softened' },
    onEdit: fn(),
    onRemove: fn(),
  },
}

/**
 * Example: Countable item (eggs).
 */
export const ExampleEggs: Story = {
  args: {
    ingredient: { quantity: 3, unit: 'whole', ingredientName: 'eggs' },
    onEdit: fn(),
    onRemove: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'For countable items, the LLM uses "whole" as the unit.',
      },
    },
  },
}

/**
 * Example: Pinch of salt.
 */
export const ExamplePinchOfSalt: Story = {
  args: {
    ingredient: { quantity: 1, unit: 'pinch', ingredientName: 'salt' },
    onEdit: fn(),
    onRemove: fn(),
  },
}
