import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { ManualIngredientInput } from '../../../app/components/recipe/ManualIngredientInput'

/**
 * # ManualIngredientInput
 *
 * A 3-field input component for manually entering recipe ingredients.
 * Users enter quantity, unit, and ingredient name in separate fields.
 *
 * This is the "I know exactly what I want" mode of ingredient input,
 * as opposed to the AI-powered parsing mode which parses natural text.
 *
 * ## Features
 *
 * - **Three distinct fields** - Quantity (number), Unit (text), Ingredient (text)
 * - **Validation** - Required fields, quantity bounds, max lengths
 * - **Keyboard-friendly** - Tab between fields, Enter to submit
 * - **Accessible** - Proper labels, ARIA attributes
 *
 * ## Grid Layout
 *
 * Uses a 4-column grid: `[1fr 1fr 2fr auto]`
 * - Quantity: 1 unit
 * - Unit: 1 unit
 * - Ingredient: 2 units (wider for longer names)
 * - Button: auto-sized
 */
const meta: Meta<typeof ManualIngredientInput> = {
  title: 'Recipe/Input/ManualIngredientInput',
  component: ManualIngredientInput,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The 3-field manual ingredient input. For users who prefer precision over convenience.

Each field has validation: quantity must be positive, unit and ingredient are required.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onAdd: {
      action: 'added',
      description: 'Callback when ingredient is added',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables all inputs and the button',
    },
    loading: {
      control: 'boolean',
      description: 'Shows loading state on the button',
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// BASIC STORIES
// =============================================================================

/**
 * The default empty state. Ready for user input.
 */
export const Default: Story = {
  args: {
    onAdd: fn(),
  },
}

/**
 * Disabled state - all inputs and button are disabled.
 * Used when the parent form is submitting or the feature is unavailable.
 */
export const Disabled: Story = {
  args: {
    onAdd: fn(),
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'All inputs and the button are disabled. Users cannot interact with the form.',
      },
    },
  },
}

/**
 * Loading state - shows a loading indicator on the button.
 * Used when the ingredient is being added to the database.
 */
export const Loading: Story = {
  args: {
    onAdd: fn(),
    loading: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Button shows loading state. Inputs are disabled to prevent duplicate submissions.',
      },
    },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Test: User fills in all fields and submits.
 */
export const FillAndSubmit: Story = {
  args: {
    onAdd: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    // Fill in quantity
    const quantityInput = canvas.getByLabelText(/quantity/i)
    await userEvent.type(quantityInput, '2')
    await expect(quantityInput).toHaveValue(2)

    // Fill in unit
    const unitInput = canvas.getByLabelText(/unit/i)
    await userEvent.type(unitInput, 'cups')
    await expect(unitInput).toHaveValue('cups')

    // Fill in ingredient
    const ingredientInput = canvas.getByLabelText(/ingredient/i)
    await userEvent.type(ingredientInput, 'all-purpose flour')
    await expect(ingredientInput).toHaveValue('all-purpose flour')

    // Submit
    const addButton = canvas.getByRole('button', { name: /add/i })
    await userEvent.click(addButton)

    // Verify callback was called
    await expect(args.onAdd).toHaveBeenCalledWith({
      quantity: 2,
      unit: 'cups',
      ingredientName: 'all-purpose flour',
    })
  },
  parameters: {
    docs: {
      description: {
        story: 'Watch as we fill in all fields and submit. The onAdd callback receives the structured data.',
      },
    },
  },
}

/**
 * Test: Submit with decimal quantity.
 */
export const DecimalQuantity: Story = {
  args: {
    onAdd: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.type(canvas.getByLabelText(/quantity/i), '0.5')
    await userEvent.type(canvas.getByLabelText(/unit/i), 'tsp')
    await userEvent.type(canvas.getByLabelText(/ingredient/i), 'vanilla extract')
    await userEvent.click(canvas.getByRole('button', { name: /add/i }))

    await expect(args.onAdd).toHaveBeenCalledWith({
      quantity: 0.5,
      unit: 'tsp',
      ingredientName: 'vanilla extract',
    })
  },
  parameters: {
    docs: {
      description: {
        story: 'Decimal quantities work - perfect for 0.5 tsp or 1.5 cups.',
      },
    },
  },
}

/**
 * Test: Keyboard navigation with Tab.
 */
export const KeyboardNavigation: Story = {
  args: {
    onAdd: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const quantityInput = canvas.getByLabelText(/quantity/i)
    const unitInput = canvas.getByLabelText(/unit/i)
    const ingredientInput = canvas.getByLabelText(/ingredient/i)
    const addButton = canvas.getByRole('button', { name: /add/i })

    // Start at quantity
    await userEvent.click(quantityInput)
    await expect(quantityInput).toHaveFocus()

    // Tab through fields
    await userEvent.tab()
    await expect(unitInput).toHaveFocus()

    await userEvent.tab()
    await expect(ingredientInput).toHaveFocus()

    await userEvent.tab()
    await expect(addButton).toHaveFocus()
  },
  parameters: {
    docs: {
      description: {
        story: 'Tab navigates through fields in logical order: Quantity -> Unit -> Ingredient -> Add.',
      },
    },
  },
}

/**
 * Test: Submit with Enter key in ingredient field.
 */
export const SubmitWithEnter: Story = {
  args: {
    onAdd: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.type(canvas.getByLabelText(/quantity/i), '1')
    await userEvent.type(canvas.getByLabelText(/unit/i), 'tbsp')
    await userEvent.type(canvas.getByLabelText(/ingredient/i), 'olive oil{enter}')

    await expect(args.onAdd).toHaveBeenCalledWith({
      quantity: 1,
      unit: 'tbsp',
      ingredientName: 'olive oil',
    })
  },
  parameters: {
    docs: {
      description: {
        story: 'Press Enter in any field to submit. Speed matters in the kitchen!',
      },
    },
  },
}

/**
 * Test: Form clears after submission.
 */
export const ClearsAfterSubmit: Story = {
  args: {
    onAdd: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const quantityInput = canvas.getByLabelText(/quantity/i)
    const unitInput = canvas.getByLabelText(/unit/i)
    const ingredientInput = canvas.getByLabelText(/ingredient/i)

    // Fill and submit
    await userEvent.type(quantityInput, '3')
    await userEvent.type(unitInput, 'cups')
    await userEvent.type(ingredientInput, 'water')
    await userEvent.click(canvas.getByRole('button', { name: /add/i }))

    // Verify form is cleared
    await expect(quantityInput).toHaveValue(null)
    await expect(unitInput).toHaveValue('')
    await expect(ingredientInput).toHaveValue('')
  },
  parameters: {
    docs: {
      description: {
        story: 'After adding an ingredient, all fields clear for the next entry.',
      },
    },
  },
}

// =============================================================================
// REAL-WORLD EXAMPLES
// =============================================================================

/**
 * Example: Adding butter to a recipe.
 * Common ingredient with standard unit.
 */
export const ExampleButter: Story = {
  args: {
    onAdd: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.type(canvas.getByLabelText(/quantity/i), '0.5')
    await userEvent.type(canvas.getByLabelText(/unit/i), 'cup')
    await userEvent.type(canvas.getByLabelText(/ingredient/i), 'unsalted butter, softened')
    await userEvent.click(canvas.getByRole('button', { name: /add/i }))

    await expect(args.onAdd).toHaveBeenCalled()
  },
  parameters: {
    docs: {
      description: {
        story: 'A real example: adding butter with preparation notes.',
      },
    },
  },
}

/**
 * Example: Adding eggs (no typical unit).
 */
export const ExampleEggs: Story = {
  args: {
    onAdd: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.type(canvas.getByLabelText(/quantity/i), '3')
    await userEvent.type(canvas.getByLabelText(/unit/i), 'large')
    await userEvent.type(canvas.getByLabelText(/ingredient/i), 'eggs')
    await userEvent.click(canvas.getByRole('button', { name: /add/i }))

    await expect(args.onAdd).toHaveBeenCalled()
  },
  parameters: {
    docs: {
      description: {
        story: 'Eggs use "large" as the unit - descriptive rather than measurement.',
      },
    },
  },
}

/**
 * Example: Compound ingredient name.
 */
export const ExampleOliveOil: Story = {
  args: {
    onAdd: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.type(canvas.getByLabelText(/quantity/i), '2')
    await userEvent.type(canvas.getByLabelText(/unit/i), 'tbsp')
    await userEvent.type(canvas.getByLabelText(/ingredient/i), 'extra virgin olive oil')
    await userEvent.click(canvas.getByRole('button', { name: /add/i }))

    await expect(args.onAdd).toHaveBeenCalled()
  },
  parameters: {
    docs: {
      description: {
        story: 'Compound ingredient names work fine - "extra virgin olive oil" stays together.',
      },
    },
  },
}
