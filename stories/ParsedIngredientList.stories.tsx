import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { ParsedIngredientList } from '../app/components/recipe/ParsedIngredientList'
import type { ParsedIngredient } from '../app/lib/ingredient-parse.server'

/**
 * # ParsedIngredientList
 *
 * Displays a list of parsed ingredients with a bulk "Add All" action.
 * Used after AI parsing to review and add ingredients to a recipe step.
 *
 * ## Features
 *
 * - **Ingredient list** - Shows all parsed ingredients
 * - **Add All** - Add all ingredients to the step at once
 * - **Per-row actions** - Edit or remove individual ingredients
 * - **Empty state** - Friendly message when no ingredients
 * - **Loading state** - Disables actions during submission
 *
 * ## Workflow
 *
 * 1. User enters ingredient text
 * 2. AI parses into structured ingredients
 * 3. This component displays parsed results
 * 4. User reviews, edits if needed
 * 5. User clicks "Add All" to add to step
 */
const meta: Meta<typeof ParsedIngredientList> = {
  title: 'Recipe/ParsedIngredientList',
  component: ParsedIngredientList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The parsed ingredients list is the review step after AI parsing.
It shows all parsed ingredients and allows the user to make corrections
before bulk-adding them to their recipe step.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onEdit: {
      action: 'edited',
      description: 'Called when an ingredient is edited (index, updatedIngredient)',
    },
    onRemove: {
      action: 'removed',
      description: 'Called when an ingredient is removed (index)',
    },
    onAddAll: {
      action: 'addedAll',
      description: 'Called when Add All is clicked (ingredients[])',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables all interactions',
    },
    loading: {
      control: 'boolean',
      description: 'Shows loading state on Add All button',
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

// Sample ingredients for stories
const sampleIngredients: ParsedIngredient[] = [
  { quantity: 2, unit: 'cups', ingredientName: 'all-purpose flour' },
  { quantity: 1, unit: 'tsp', ingredientName: 'salt' },
  { quantity: 0.5, unit: 'cup', ingredientName: 'sugar' },
  { quantity: 0.5, unit: 'cup', ingredientName: 'unsalted butter, softened' },
  { quantity: 2, unit: 'whole', ingredientName: 'eggs' },
]

// =============================================================================
// BASIC STORIES
// =============================================================================

/**
 * Default list with multiple ingredients.
 */
export const Default: Story = {
  args: {
    ingredients: sampleIngredients,
    onEdit: fn(),
    onRemove: fn(),
    onAddAll: fn(),
  },
}

/**
 * Single ingredient in the list.
 */
export const SingleIngredient: Story = {
  args: {
    ingredients: [{ quantity: 2, unit: 'cups', ingredientName: 'flour' }],
    onEdit: fn(),
    onRemove: fn(),
    onAddAll: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Works with just one ingredient. Button count shows (1).',
      },
    },
  },
}

/**
 * Empty list - shows friendly empty state.
 */
export const Empty: Story = {
  args: {
    ingredients: [],
    onEdit: fn(),
    onRemove: fn(),
    onAddAll: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'When there are no parsed ingredients, shows an empty state message.',
      },
    },
  },
}

/**
 * Loading state - Add All button is disabled and shows loading.
 */
export const Loading: Story = {
  args: {
    ingredients: sampleIngredients.slice(0, 3),
    onEdit: fn(),
    onRemove: fn(),
    onAddAll: fn(),
    loading: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'When adding ingredients, the button shows loading state.',
      },
    },
  },
}

/**
 * Disabled state - all actions are disabled.
 */
export const Disabled: Story = {
  args: {
    ingredients: sampleIngredients.slice(0, 3),
    onEdit: fn(),
    onRemove: fn(),
    onAddAll: fn(),
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'All buttons disabled. Used when parent form is submitting.',
      },
    },
  },
}

/**
 * Many ingredients - shows scrollable list behavior.
 */
export const ManyIngredients: Story = {
  args: {
    ingredients: [
      { quantity: 2, unit: 'cups', ingredientName: 'flour' },
      { quantity: 1, unit: 'tsp', ingredientName: 'salt' },
      { quantity: 0.5, unit: 'cup', ingredientName: 'sugar' },
      { quantity: 0.5, unit: 'cup', ingredientName: 'butter' },
      { quantity: 2, unit: 'whole', ingredientName: 'eggs' },
      { quantity: 1, unit: 'cup', ingredientName: 'milk' },
      { quantity: 1, unit: 'tsp', ingredientName: 'vanilla extract' },
      { quantity: 2, unit: 'tsp', ingredientName: 'baking powder' },
      { quantity: 0.5, unit: 'tsp', ingredientName: 'baking soda' },
      { quantity: 0.25, unit: 'tsp', ingredientName: 'nutmeg' },
    ],
    onEdit: fn(),
    onRemove: fn(),
    onAddAll: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'A longer list of ingredients, typical for a complex recipe.',
      },
    },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Test: Click Add All.
 */
export const ClickAddAll: Story = {
  args: {
    ingredients: sampleIngredients.slice(0, 3),
    onEdit: fn(),
    onRemove: fn(),
    onAddAll: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('button', { name: /add all/i }))

    await expect(args.onAddAll).toHaveBeenCalledWith(args.ingredients)
  },
  parameters: {
    docs: {
      description: {
        story: 'Add All passes all ingredients to the callback.',
      },
    },
  },
}

/**
 * Test: Remove an ingredient.
 */
export const RemoveIngredient: Story = {
  args: {
    ingredients: [
      { quantity: 2, unit: 'cups', ingredientName: 'flour' },
      { quantity: 1, unit: 'tsp', ingredientName: 'salt' },
      { quantity: 0.5, unit: 'cup', ingredientName: 'sugar' },
    ],
    onEdit: fn(),
    onRemove: fn(),
    onAddAll: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    // Find the salt row and click remove
    const saltRow = canvas.getByText('salt').closest('li')!
    const removeButton = within(saltRow).getByRole('button', { name: /remove/i })
    await userEvent.click(removeButton)

    // Should be called with index 1 (second item)
    await expect(args.onRemove).toHaveBeenCalledWith(1)
  },
  parameters: {
    docs: {
      description: {
        story: 'Remove button calls onRemove with the ingredient index.',
      },
    },
  },
}

/**
 * Test: Edit an ingredient inline.
 */
export const EditIngredient: Story = {
  args: {
    ingredients: [
      { quantity: 2, unit: 'cups', ingredientName: 'flour' },
      { quantity: 1, unit: 'tsp', ingredientName: 'salt' },
    ],
    onEdit: fn(),
    onRemove: fn(),
    onAddAll: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    // Find flour row and enter edit mode
    const flourRow = canvas.getByText('flour').closest('li')!
    await userEvent.click(within(flourRow).getByRole('button', { name: /edit/i }))

    // Change quantity
    const quantityInput = within(flourRow).getByRole('spinbutton', { name: /quantity/i })
    await userEvent.clear(quantityInput)
    await userEvent.type(quantityInput, '3')

    // Save
    await userEvent.click(within(flourRow).getByRole('button', { name: /save/i }))

    // Should be called with index 0 and updated ingredient
    await expect(args.onEdit).toHaveBeenCalledWith(0, {
      quantity: 3,
      unit: 'cups',
      ingredientName: 'flour',
    })
  },
  parameters: {
    docs: {
      description: {
        story: 'Edit updates the ingredient at the correct index.',
      },
    },
  },
}

// =============================================================================
// REAL WORLD EXAMPLES
// =============================================================================

/**
 * Example: Cookie recipe ingredients after parsing.
 */
export const CookieRecipe: Story = {
  args: {
    ingredients: [
      { quantity: 2.25, unit: 'cups', ingredientName: 'all-purpose flour' },
      { quantity: 1, unit: 'tsp', ingredientName: 'baking soda' },
      { quantity: 1, unit: 'tsp', ingredientName: 'salt' },
      { quantity: 1, unit: 'cup', ingredientName: 'unsalted butter, softened' },
      { quantity: 0.75, unit: 'cup', ingredientName: 'granulated sugar' },
      { quantity: 0.75, unit: 'cup', ingredientName: 'packed brown sugar' },
      { quantity: 2, unit: 'whole', ingredientName: 'large eggs' },
      { quantity: 1, unit: 'tsp', ingredientName: 'vanilla extract' },
      { quantity: 2, unit: 'cups', ingredientName: 'chocolate chips' },
    ],
    onEdit: fn(),
    onRemove: fn(),
    onAddAll: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'A complete chocolate chip cookie recipe, as parsed from natural text.',
      },
    },
  },
}

/**
 * Example: Simple vinaigrette.
 */
export const SimpleVinaigrette: Story = {
  args: {
    ingredients: [
      { quantity: 0.25, unit: 'cup', ingredientName: 'balsamic vinegar' },
      { quantity: 0.75, unit: 'cup', ingredientName: 'extra virgin olive oil' },
      { quantity: 1, unit: 'tsp', ingredientName: 'dijon mustard' },
      { quantity: 1, unit: 'clove', ingredientName: 'garlic, minced' },
      { quantity: 1, unit: 'pinch', ingredientName: 'salt' },
      { quantity: 1, unit: 'pinch', ingredientName: 'black pepper' },
    ],
    onEdit: fn(),
    onRemove: fn(),
    onAddAll: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows various units including pinch and clove.',
      },
    },
  },
}

/**
 * Example: Ingredients with corrections needed.
 */
export const NeedsCorrections: Story = {
  args: {
    ingredients: [
      { quantity: 1, unit: 'cup', ingredientName: 'flour' }, // Missing "all-purpose"
      { quantity: 1, unit: 'whole', ingredientName: 'egg' }, // Should be "large egg"
      { quantity: 0.5, unit: 'cup', ingredientName: 'milk' }, // OK
    ],
    onEdit: fn(),
    onRemove: fn(),
    onAddAll: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Sometimes AI parsing may miss details. Users can edit inline to fix before adding.',
      },
    },
  },
}
