import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { useState } from 'react'
import { IngredientList, type Ingredient } from '../../../app/components/recipe/IngredientList'

/**
 * # IngredientList
 *
 * The ingredient checklist for kitchen warriors. Because nothing feels better
 * than checking off "butter" while your hands are covered in... butter.
 *
 * This component displays a list of ingredients with scaled quantities and
 * checkboxes for tracking progress. Perfect for the cooking flow where you
 * need to verify you have everything before starting.
 *
 * ## Design Principles
 *
 * - **Checkable items**: Track which ingredients you've added
 * - **Scaled quantities**: Integrates with recipe scaling
 * - **Kitchen-friendly**: Large touch targets for messy hands
 * - **Visual feedback**: Checked items get strikethrough
 */
const meta: Meta<typeof IngredientList> = {
  title: 'Recipe/View/IngredientList',
  component: IngredientList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A checkable ingredient list with scaled quantities.
Each ingredient shows quantity, unit, and name with an optional checkbox for tracking progress.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    ingredients: {
      description: 'Array of ingredients to display',
    },
    scaleFactor: {
      control: { type: 'number', min: 0.25, max: 10, step: 0.25 },
      description: 'Scale factor for quantities (default: 1)',
    },
    checkedIds: {
      description: 'Set of checked ingredient IDs',
    },
    onToggle: {
      action: 'toggled',
      description: 'Callback when an ingredient is toggled',
    },
    showCheckboxes: {
      control: 'boolean',
      description: 'Whether to show checkboxes (default: true)',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Sample ingredients
const basicIngredients: Ingredient[] = [
  { id: '1', quantity: 2, unit: 'cups', name: 'all-purpose flour' },
  { id: '2', quantity: 1, unit: 'cup', name: 'sugar' },
  { id: '3', quantity: 0.5, unit: 'cup', name: 'butter, softened' },
  { id: '4', quantity: 3, unit: '', name: 'large eggs' },
  { id: '5', quantity: 1, unit: 'tsp', name: 'vanilla extract' },
]

const mixedIngredients: Ingredient[] = [
  { id: '1', quantity: 2.5, unit: 'cups', name: 'bread flour' },
  { id: '2', quantity: 1 / 3, unit: 'cup', name: 'warm water' },
  { id: '3', quantity: 0.25, unit: 'tsp', name: 'instant yeast' },
  { id: '4', quantity: 1.5, unit: 'tsp', name: 'salt' },
]

// =============================================================================
// BASIC STORIES
// =============================================================================

/**
 * A basic ingredient list with no items checked.
 */
export const Default: Story = {
  args: {
    ingredients: basicIngredients,
    scaleFactor: 1,
    checkedIds: new Set(),
    onToggle: fn(),
  },
}

/**
 * Some ingredients already checked off.
 */
export const PartiallyChecked: Story = {
  args: {
    ingredients: basicIngredients,
    scaleFactor: 1,
    checkedIds: new Set(['1', '3']),
    onToggle: fn(),
  },
}

/**
 * All ingredients checked - ready to cook!
 */
export const AllChecked: Story = {
  args: {
    ingredients: basicIngredients,
    scaleFactor: 1,
    checkedIds: new Set(['1', '2', '3', '4', '5']),
    onToggle: fn(),
  },
}

/**
 * Empty ingredient list.
 */
export const EmptyList: Story = {
  args: {
    ingredients: [],
    scaleFactor: 1,
    checkedIds: new Set(),
    onToggle: fn(),
  },
}

// =============================================================================
// SCALING STORIES
// =============================================================================

/**
 * Double the recipe (2× scale).
 */
export const DoubleScale: Story = {
  args: {
    ingredients: basicIngredients,
    scaleFactor: 2,
    checkedIds: new Set(),
    onToggle: fn(),
  },
}

/**
 * Half the recipe (0.5× scale).
 */
export const HalfScale: Story = {
  args: {
    ingredients: basicIngredients,
    scaleFactor: 0.5,
    checkedIds: new Set(),
    onToggle: fn(),
  },
}

/**
 * Fractional ingredients with scaling.
 */
export const FractionalScaling: Story = {
  args: {
    ingredients: mixedIngredients,
    scaleFactor: 1.5,
    checkedIds: new Set(),
    onToggle: fn(),
  },
}

// =============================================================================
// INTERACTIVE WRAPPER
// =============================================================================

function InteractiveIngredientList({
  ingredients,
  scaleFactor = 1,
  initialChecked = new Set<string>(),
  showCheckboxes = true,
}: {
  ingredients: Ingredient[]
  scaleFactor?: number
  initialChecked?: Set<string>
  showCheckboxes?: boolean
}) {
  const [checkedIds, setCheckedIds] = useState(initialChecked)

  const handleToggle = (id: string) => {
    const newChecked = new Set(checkedIds)
    if (newChecked.has(id)) {
      newChecked.delete(id)
    } else {
      newChecked.add(id)
    }
    setCheckedIds(newChecked)
  }

  return (
    <IngredientList
      ingredients={ingredients}
      scaleFactor={scaleFactor}
      checkedIds={checkedIds}
      onToggle={handleToggle}
      showCheckboxes={showCheckboxes}
    />
  )
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * ## Toggle Ingredient Test
 *
 * Click an ingredient to toggle its checked state.
 */
export const ToggleTest: Story = {
  render: () => <InteractiveIngredientList ingredients={basicIngredients} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Find and click the first checkbox
    const checkboxes = canvas.getAllByRole('checkbox')
    await expect(checkboxes[0]).not.toBeChecked()
    await userEvent.click(checkboxes[0])
    await expect(checkboxes[0]).toBeChecked()

    // Click again to uncheck
    await userEvent.click(checkboxes[0])
    await expect(checkboxes[0]).not.toBeChecked()
  },
}

/**
 * ## Checked State Preserved During Scale Change
 *
 * Verify checked items remain checked when scale changes.
 */
export const CheckedStatePersistence: Story = {
  render: () => {
    const [scale, setScale] = useState(1)
    const [checkedIds, setCheckedIds] = useState(new Set(['1', '2']))

    const handleToggle = (id: string) => {
      const newChecked = new Set(checkedIds)
      if (newChecked.has(id)) {
        newChecked.delete(id)
      } else {
        newChecked.add(id)
      }
      setCheckedIds(newChecked)
    }

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setScale(1)}
            data-testid="scale-1"
            className="px-3 py-1 bg-zinc-200 rounded"
          >
            1×
          </button>
          <button
            type="button"
            onClick={() => setScale(2)}
            data-testid="scale-2"
            className="px-3 py-1 bg-zinc-200 rounded"
          >
            2×
          </button>
        </div>
        <IngredientList
          ingredients={basicIngredients}
          scaleFactor={scale}
          checkedIds={checkedIds}
          onToggle={handleToggle}
        />
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // First two should be checked initially
    const checkboxes = canvas.getAllByRole('checkbox')
    await expect(checkboxes[0]).toBeChecked()
    await expect(checkboxes[1]).toBeChecked()

    // Change scale
    await userEvent.click(canvas.getByTestId('scale-2'))

    // Should still be checked
    const checkboxesAfter = canvas.getAllByRole('checkbox')
    await expect(checkboxesAfter[0]).toBeChecked()
    await expect(checkboxesAfter[1]).toBeChecked()
  },
}

/**
 * ## Renders Quantities
 *
 * Verify quantities are displayed correctly.
 */
export const RendersQuantities: Story = {
  args: {
    ingredients: [
      { id: '1', quantity: 1.5, unit: 'cups', name: 'flour' },
    ],
    scaleFactor: 1,
    checkedIds: new Set(),
    onToggle: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const list = canvas.getByTestId('ingredient-list')
    await expect(list).toHaveTextContent('1 ½')
    await expect(list).toHaveTextContent('cups')
    await expect(list).toHaveTextContent('flour')
  },
}

/**
 * ## Scales Quantities
 *
 * Verify scaling is applied to quantities.
 */
export const ScalesQuantities: Story = {
  args: {
    ingredients: [
      { id: '1', quantity: 2, unit: 'cups', name: 'flour' },
    ],
    scaleFactor: 0.5,
    checkedIds: new Set(),
    onToggle: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // 2 × 0.5 = 1
    const list = canvas.getByTestId('ingredient-list')
    await expect(list).toHaveTextContent('1 cups flour')
  },
}

// =============================================================================
// VISUAL VARIANTS
// =============================================================================

/**
 * ## Without Checkboxes
 *
 * Display-only mode without interaction.
 */
export const WithoutCheckboxes: Story = {
  args: {
    ingredients: basicIngredients,
    scaleFactor: 1,
    checkedIds: new Set(),
    showCheckboxes: false,
  },
}

/**
 * ## Mobile View
 *
 * How it looks on a phone screen.
 */
export const MobileView: Story = {
  args: {
    ingredients: basicIngredients,
    scaleFactor: 1,
    checkedIds: new Set(['1']),
    onToggle: fn(),
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
}

/**
 * ## All Visual States
 *
 * Shows different states side by side.
 */
export const AllVisualStates: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <span className="text-sm text-zinc-500 block mb-2">Unchecked:</span>
        <InteractiveIngredientList
          ingredients={basicIngredients.slice(0, 3)}
        />
      </div>
      <div>
        <span className="text-sm text-zinc-500 block mb-2">Some checked:</span>
        <InteractiveIngredientList
          ingredients={basicIngredients.slice(0, 3)}
          initialChecked={new Set(['1'])}
        />
      </div>
      <div>
        <span className="text-sm text-zinc-500 block mb-2">Scaled 2×:</span>
        <InteractiveIngredientList
          ingredients={basicIngredients.slice(0, 3)}
          scaleFactor={2}
        />
      </div>
      <div>
        <span className="text-sm text-zinc-500 block mb-2">No checkboxes:</span>
        <InteractiveIngredientList
          ingredients={basicIngredients.slice(0, 3)}
          showCheckboxes={false}
        />
      </div>
    </div>
  ),
}
