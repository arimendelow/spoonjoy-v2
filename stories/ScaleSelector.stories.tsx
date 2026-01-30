import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { useState } from 'react'
import { ScaleSelector } from '../app/components/recipe/ScaleSelector'

/**
 * # ScaleSelector
 *
 * The secret weapon for making grandma's "serves 4" recipe feed your entire
 * book club of 12. Or scaling down that bakery-sized batch of cookies to
 * something more... reasonable.
 *
 * This component lets users adjust recipe scale factors with tactile +/−
 * buttons, perfect for kitchen use where fingers might be covered in flour.
 *
 * ## Design Principles
 *
 * - **Mobile-first**: Large 44×44px touch targets for kitchen use
 * - **Clear feedback**: Shows current scale with "×" suffix (e.g., "1.5×")
 * - **Bounded**: Min 0.25×, Max 50× (because who's cooking for 200?)
 * - **Incremental**: 0.25 steps for recipe-friendly scaling
 */
const meta: Meta<typeof ScaleSelector> = {
  title: 'Recipe/ScaleSelector',
  component: ScaleSelector,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A scale factor selector with +/− buttons for recipe scaling.
Features large touch targets, 0.25 increments, and clear scale display.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'number', min: 0.25, max: 50, step: 0.25 },
      description: 'Current scale factor',
    },
    onChange: {
      action: 'changed',
      description: 'Callback when scale changes',
    },
    min: {
      control: { type: 'number', min: 0.25, max: 50, step: 0.25 },
      description: 'Minimum scale factor (default: 0.25)',
    },
    max: {
      control: { type: 'number', min: 0.25, max: 100, step: 1 },
      description: 'Maximum scale factor (default: 50)',
    },
    step: {
      control: { type: 'number', min: 0.1, max: 1, step: 0.05 },
      description: 'Increment step (default: 0.25)',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// BASIC STORIES
// =============================================================================

/**
 * Default state at 1× scale. The starting point for most recipes.
 */
export const Default: Story = {
  args: {
    value: 1,
    onChange: fn(),
  },
}

/**
 * Scaled up to 1.5×. Perfect for when you need "just a bit more."
 */
export const ScaledUp: Story = {
  args: {
    value: 1.5,
    onChange: fn(),
  },
}

/**
 * Halved recipe at 0.5×. For cooking for one (no judgment).
 */
export const ScaledDown: Story = {
  args: {
    value: 0.5,
    onChange: fn(),
  },
}

/**
 * At minimum scale (0.25×). Minus button should be disabled.
 */
export const AtMinimum: Story = {
  args: {
    value: 0.25,
    onChange: fn(),
  },
}

/**
 * At maximum scale (50×). Plus button should be disabled.
 * Are you feeding an army? A very hungry army?
 */
export const AtMaximum: Story = {
  args: {
    value: 50,
    onChange: fn(),
  },
}

// =============================================================================
// INTERACTIVE WRAPPER FOR STATEFUL TESTS
// =============================================================================

function InteractiveScaleSelector({
  initialValue = 1,
  min = 0.25,
  max = 50,
  step = 0.25,
  onChangeCallback = fn(),
}: {
  initialValue?: number
  min?: number
  max?: number
  step?: number
  onChangeCallback?: (value: number) => void
}) {
  const [value, setValue] = useState(initialValue)

  const handleChange = (newValue: number) => {
    setValue(newValue)
    onChangeCallback(newValue)
  }

  return (
    <ScaleSelector
      value={value}
      onChange={handleChange}
      min={min}
      max={max}
      step={step}
    />
  )
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * ## Increment Test
 *
 * Click the plus button and verify the scale increases by 0.25.
 */
export const IncrementTest: Story = {
  render: () => <InteractiveScaleSelector initialValue={1} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Initial value should be 1×
    const display = canvas.getByTestId('scale-display')
    await expect(display).toHaveTextContent('1×')

    // Click plus button
    const plusButton = canvas.getByTestId('scale-plus')
    await userEvent.click(plusButton)

    // Value should now be 1.25×
    await expect(display).toHaveTextContent('1.25×')
  },
}

/**
 * ## Decrement Test
 *
 * Click the minus button and verify the scale decreases by 0.25.
 */
export const DecrementTest: Story = {
  render: () => <InteractiveScaleSelector initialValue={1} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Initial value should be 1×
    const display = canvas.getByTestId('scale-display')
    await expect(display).toHaveTextContent('1×')

    // Click minus button
    const minusButton = canvas.getByTestId('scale-minus')
    await userEvent.click(minusButton)

    // Value should now be 0.75×
    await expect(display).toHaveTextContent('0.75×')
  },
}

/**
 * ## Multiple Increments Test
 *
 * Rapidly click plus multiple times and verify correct accumulation.
 */
export const MultipleIncrementsTest: Story = {
  render: () => <InteractiveScaleSelector initialValue={1} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const plusButton = canvas.getByTestId('scale-plus')
    const display = canvas.getByTestId('scale-display')

    // Click plus 4 times (1 → 1.25 → 1.5 → 1.75 → 2)
    await userEvent.click(plusButton)
    await userEvent.click(plusButton)
    await userEvent.click(plusButton)
    await userEvent.click(plusButton)

    await expect(display).toHaveTextContent('2×')
  },
}

/**
 * ## Minimum Boundary Test
 *
 * At minimum (0.25), minus button should be disabled and clicking it
 * should not change the value.
 */
export const MinimumBoundaryTest: Story = {
  render: () => <InteractiveScaleSelector initialValue={0.25} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const minusButton = canvas.getByTestId('scale-minus')
    const display = canvas.getByTestId('scale-display')

    // Verify initial value
    await expect(display).toHaveTextContent('0.25×')

    // Minus button should be disabled
    await expect(minusButton).toBeDisabled()

    // Plus button should still work
    const plusButton = canvas.getByTestId('scale-plus')
    await expect(plusButton).not.toBeDisabled()
  },
}

/**
 * ## Maximum Boundary Test
 *
 * At maximum (50), plus button should be disabled and clicking it
 * should not change the value.
 */
export const MaximumBoundaryTest: Story = {
  render: () => <InteractiveScaleSelector initialValue={50} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const plusButton = canvas.getByTestId('scale-plus')
    const display = canvas.getByTestId('scale-display')

    // Verify initial value
    await expect(display).toHaveTextContent('50×')

    // Plus button should be disabled
    await expect(plusButton).toBeDisabled()

    // Minus button should still work
    const minusButton = canvas.getByTestId('scale-minus')
    await expect(minusButton).not.toBeDisabled()
  },
}

/**
 * ## Keyboard Navigation Test
 *
 * Verify the component is keyboard accessible.
 * Tab to minus, press Enter, Tab to plus, press Enter.
 */
export const KeyboardNavigationTest: Story = {
  render: () => <InteractiveScaleSelector initialValue={1} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const display = canvas.getByTestId('scale-display')
    const minusButton = canvas.getByTestId('scale-minus')

    // Tab to minus button and press Enter
    await userEvent.tab()
    await expect(minusButton).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await expect(display).toHaveTextContent('0.75×')

    // Tab to display (might be skipped), then to plus button
    await userEvent.tab()
    const plusButton = canvas.getByTestId('scale-plus')
    await userEvent.tab()
    await expect(plusButton).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await expect(display).toHaveTextContent('1×')
  },
}

/**
 * ## Accessibility Labels Test
 *
 * Verify buttons have proper accessible labels for screen readers.
 */
export const AccessibilityLabelsTest: Story = {
  args: {
    value: 1,
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Buttons should have accessible names
    const minusButton = canvas.getByRole('button', { name: /decrease/i })
    const plusButton = canvas.getByRole('button', { name: /increase/i })

    await expect(minusButton).toBeInTheDocument()
    await expect(plusButton).toBeInTheDocument()
  },
}

// =============================================================================
// VISUAL STATES
// =============================================================================

/**
 * ## Mobile Size Demo
 *
 * Demonstrates the component at mobile viewport size, showing
 * the large touch targets suitable for kitchen use.
 */
export const MobileSizeDemo: Story = {
  args: {
    value: 1,
    onChange: fn(),
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
}

/**
 * ## All States
 *
 * Shows all possible visual states in one view.
 */
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <span className="w-32 text-sm text-zinc-500">Default (1×)</span>
        <InteractiveScaleSelector initialValue={1} />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-32 text-sm text-zinc-500">At minimum</span>
        <InteractiveScaleSelector initialValue={0.25} />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-32 text-sm text-zinc-500">At maximum</span>
        <InteractiveScaleSelector initialValue={50} />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-32 text-sm text-zinc-500">Scaled up</span>
        <InteractiveScaleSelector initialValue={2} />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-32 text-sm text-zinc-500">Scaled down</span>
        <InteractiveScaleSelector initialValue={0.5} />
      </div>
    </div>
  ),
}

/**
 * ## Custom Step Size
 *
 * Using 0.5 increments instead of 0.25 for simpler scaling.
 */
export const CustomStepSize: Story = {
  render: () => <InteractiveScaleSelector initialValue={1} step={0.5} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const plusButton = canvas.getByTestId('scale-plus')
    const display = canvas.getByTestId('scale-display')

    // Click plus twice (1 → 1.5 → 2)
    await userEvent.click(plusButton)
    await expect(display).toHaveTextContent('1.5×')
    await userEvent.click(plusButton)
    await expect(display).toHaveTextContent('2×')
  },
}
