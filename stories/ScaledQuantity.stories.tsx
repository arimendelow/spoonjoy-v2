import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { ScaledQuantity } from '../app/components/recipe/ScaledQuantity'

/**
 * # ScaledQuantity
 *
 * The component that turns "2 ½ cups flour" into something readable.
 * Because measuring cups don't come with Unicode support, but your
 * recipe display should.
 *
 * This component handles the display of an ingredient's quantity + unit + name,
 * with support for fractional quantities rendered as proper Unicode fractions.
 *
 * ## Design Principles
 *
 * - **Clear typography**: Readable at arm's length (important in a kitchen!)
 * - **Proper fractions**: Uses Unicode characters (½, ¼, ⅓) instead of "1/2"
 * - **Graceful fallbacks**: Handles missing data without crashing
 */
const meta: Meta<typeof ScaledQuantity> = {
  title: 'Recipe/ScaledQuantity',
  component: ScaledQuantity,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Displays an ingredient's scaled quantity with proper Unicode fractions.
Format: "2 ½ cups flour" (quantity + unit + name)
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    quantity: {
      control: { type: 'number', min: 0, max: 100, step: 0.25 },
      description: 'The quantity to display',
    },
    unit: {
      control: 'text',
      description: 'The unit of measurement (e.g., "cups", "tbsp")',
    },
    name: {
      control: 'text',
      description: 'The ingredient name',
    },
    scaleFactor: {
      control: { type: 'number', min: 0.25, max: 10, step: 0.25 },
      description: 'Scale factor to apply to quantity (default: 1)',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// BASIC STORIES
// =============================================================================

/**
 * A simple whole number quantity. Nothing fancy, just flour.
 */
export const WholeNumber: Story = {
  args: {
    quantity: 2,
    unit: 'cups',
    name: 'all-purpose flour',
  },
}

/**
 * Half a cup. The ½ symbol is much prettier than "0.5".
 */
export const HalfQuantity: Story = {
  args: {
    quantity: 0.5,
    unit: 'cup',
    name: 'sugar',
  },
}

/**
 * Mixed number - the most common format in recipes.
 */
export const MixedNumber: Story = {
  args: {
    quantity: 1.5,
    unit: 'cups',
    name: 'milk',
  },
}

/**
 * Quarter quantities are common in baking.
 */
export const QuarterQuantity: Story = {
  args: {
    quantity: 0.25,
    unit: 'tsp',
    name: 'salt',
  },
}

/**
 * Three-quarters is also common.
 */
export const ThreeQuarters: Story = {
  args: {
    quantity: 2.75,
    unit: 'cups',
    name: 'bread flour',
  },
}

/**
 * Thirds happen with eggs divided among batches.
 */
export const ThirdQuantity: Story = {
  args: {
    quantity: 1 / 3,
    unit: 'cup',
    name: 'vegetable oil',
  },
}

// =============================================================================
// SCALING STORIES
// =============================================================================

/**
 * ## Scaled to Double
 *
 * Original recipe calls for 1 cup, but we're making double.
 */
export const ScaledDouble: Story = {
  args: {
    quantity: 1,
    unit: 'cup',
    name: 'butter',
    scaleFactor: 2,
  },
}

/**
 * ## Scaled to Half
 *
 * Scaling down for a smaller batch.
 */
export const ScaledHalf: Story = {
  args: {
    quantity: 2,
    unit: 'cups',
    name: 'flour',
    scaleFactor: 0.5,
  },
}

/**
 * ## 1.5x Scale
 *
 * A scale of 1.5 on 2 cups = 3 cups
 */
export const ScaledOneAndHalf: Story = {
  args: {
    quantity: 2,
    unit: 'cups',
    name: 'sugar',
    scaleFactor: 1.5,
  },
}

// =============================================================================
// EDGE CASES
// =============================================================================

/**
 * ## No Unit
 *
 * Some ingredients don't need a unit (like "3 eggs").
 */
export const NoUnit: Story = {
  args: {
    quantity: 3,
    unit: '',
    name: 'large eggs',
  },
}

/**
 * ## Null Quantity
 *
 * When quantity is null, it should handle gracefully.
 */
export const NullQuantity: Story = {
  args: {
    quantity: null as unknown as number,
    unit: 'cup',
    name: 'optional garnish',
  },
}

/**
 * ## Zero Quantity
 *
 * Edge case for ingredients that might be 0 in some configurations.
 */
export const ZeroQuantity: Story = {
  args: {
    quantity: 0,
    unit: 'tbsp',
    name: 'optional chili flakes',
  },
}

/**
 * ## Very Large Quantity
 *
 * When you're feeding an army.
 */
export const LargeQuantity: Story = {
  args: {
    quantity: 24,
    unit: 'cups',
    name: 'flour',
  },
}

/**
 * ## Small Eighth Quantity
 *
 * Eighth fractions for precision measurements.
 */
export const EighthQuantity: Story = {
  args: {
    quantity: 0.125,
    unit: 'tsp',
    name: 'cayenne pepper',
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * ## Displays Formatted Quantity
 *
 * Verify that the quantity is displayed with proper Unicode fractions.
 */
export const DisplaysFormattedQuantity: Story = {
  args: {
    quantity: 1.5,
    unit: 'cups',
    name: 'flour',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Should display "1 ½ cups flour"
    const content = canvas.getByTestId('scaled-quantity')
    await expect(content).toHaveTextContent('1 ½')
    await expect(content).toHaveTextContent('cups')
    await expect(content).toHaveTextContent('flour')
  },
}

/**
 * ## Handles Scaling
 *
 * Verify the scale factor is applied correctly.
 */
export const HandlesScaling: Story = {
  args: {
    quantity: 2,
    unit: 'cups',
    name: 'sugar',
    scaleFactor: 0.5,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // 2 cups × 0.5 = 1 cup
    const content = canvas.getByTestId('scaled-quantity')
    await expect(content).toHaveTextContent('1')
    await expect(content).toHaveTextContent('cups')
  },
}

/**
 * ## Graceful Null Handling
 *
 * Verify null quantity doesn't crash the component.
 */
export const GracefulNullHandling: Story = {
  args: {
    quantity: null as unknown as number,
    unit: 'cup',
    name: 'mystery ingredient',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Should still render without the quantity
    const content = canvas.getByTestId('scaled-quantity')
    await expect(content).toHaveTextContent('mystery ingredient')
  },
}

// =============================================================================
// VISUAL STATES
// =============================================================================

/**
 * ## All Fraction Types
 *
 * Shows all common fraction renderings in one view.
 */
export const AllFractionTypes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <ScaledQuantity quantity={0.5} unit="cup" name="(half)" />
      <ScaledQuantity quantity={0.25} unit="cup" name="(quarter)" />
      <ScaledQuantity quantity={0.75} unit="cup" name="(three-quarters)" />
      <ScaledQuantity quantity={1 / 3} unit="cup" name="(third)" />
      <ScaledQuantity quantity={2 / 3} unit="cup" name="(two-thirds)" />
      <ScaledQuantity quantity={0.125} unit="tsp" name="(eighth)" />
      <ScaledQuantity quantity={1.5} unit="cups" name="(one and a half)" />
      <ScaledQuantity quantity={2.25} unit="cups" name="(two and a quarter)" />
    </div>
  ),
}

/**
 * ## Common Baking Measurements
 *
 * Real-world examples from actual recipes.
 */
export const CommonBakingMeasurements: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <ScaledQuantity quantity={2.5} unit="cups" name="all-purpose flour" />
      <ScaledQuantity quantity={1} unit="cup" name="granulated sugar" />
      <ScaledQuantity quantity={0.5} unit="cup" name="unsalted butter, softened" />
      <ScaledQuantity quantity={3} unit="" name="large eggs" />
      <ScaledQuantity quantity={1} unit="tsp" name="vanilla extract" />
      <ScaledQuantity quantity={0.5} unit="tsp" name="salt" />
      <ScaledQuantity quantity={2} unit="tsp" name="baking powder" />
    </div>
  ),
}

/**
 * ## With Scale Factor Applied
 *
 * Same recipe at different scales.
 */
export const WithScaleFactorApplied: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-sm text-zinc-500 block mb-2">Original (1×)</span>
        <ScaledQuantity quantity={2} unit="cups" name="flour" scaleFactor={1} />
      </div>
      <div>
        <span className="text-sm text-zinc-500 block mb-2">Half (0.5×)</span>
        <ScaledQuantity quantity={2} unit="cups" name="flour" scaleFactor={0.5} />
      </div>
      <div>
        <span className="text-sm text-zinc-500 block mb-2">Double (2×)</span>
        <ScaledQuantity quantity={2} unit="cups" name="flour" scaleFactor={2} />
      </div>
      <div>
        <span className="text-sm text-zinc-500 block mb-2">Triple (3×)</span>
        <ScaledQuantity quantity={2} unit="cups" name="flour" scaleFactor={3} />
      </div>
    </div>
  ),
}

/**
 * ## Mobile View
 *
 * How it looks on a phone screen.
 */
export const MobileView: Story = {
  args: {
    quantity: 2.5,
    unit: 'cups',
    name: 'all-purpose flour',
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
}
