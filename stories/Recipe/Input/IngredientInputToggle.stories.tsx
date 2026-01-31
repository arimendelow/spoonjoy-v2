import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { useState } from 'react'
import { IngredientInputToggle } from '../../../app/components/recipe/IngredientInputToggle'

/**
 * # IngredientInputToggle
 *
 * The gatekeeper of ingredient input modes. AI parsing or manual entry?
 * This switch decides.
 *
 * One toggle. Two modes. Infinite convenience.
 *
 * ## Purpose
 *
 * When adding ingredients to a recipe step, users can choose between:
 * - **AI Mode**: Paste "2 cups flour, sifted" and let AI parse it
 * - **Manual Mode**: Fill in quantity, unit, and ingredient fields separately
 *
 * The toggle remembers the user's preference via localStorage, so they don't
 * have to keep switching every time they add ingredients.
 *
 * ## Features
 *
 * - **Mode persistence** - Remembers preference in localStorage
 * - **Controlled or uncontrolled** - Use `mode` prop for controlled, `defaultMode` for uncontrolled
 * - **Accessible** - Proper labels, descriptions, and keyboard support
 * - **Disabled state** - For when AI isn't available
 */
const meta: Meta<typeof IngredientInputToggle> = {
  title: 'Recipe/Input/IngredientInputToggle',
  component: IngredientInputToggle,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A toggle switch for switching between AI-parsed and manual ingredient input modes.

Persists user preference to localStorage automatically. Use in step edit forms to give users control over how they enter ingredients.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    defaultMode: {
      control: 'radio',
      options: ['ai', 'manual'],
      description: 'Initial mode when uncontrolled. Ignored if `mode` is set.',
    },
    mode: {
      control: 'radio',
      options: ['ai', 'manual', undefined],
      description: 'Controlled mode. When set, component is fully controlled.',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the toggle. Use when AI parsing is unavailable.',
    },
    storageKey: {
      control: 'text',
      description: 'Custom localStorage key for persistence.',
    },
    onChange: {
      action: 'mode changed',
      description: 'Callback when mode changes. Receives "ai" or "manual".',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// BASIC STATES
// =============================================================================

/**
 * Default state. AI mode is on (checked).
 * This is the recommended default for most users.
 */
export const Default: Story = {
  args: {
    onChange: fn(),
  },
}

/**
 * Starting in AI mode. The switch is checked.
 * AI will parse ingredient text automatically.
 */
export const AIMode: Story = {
  args: {
    defaultMode: 'ai',
    onChange: fn(),
  },
}

/**
 * Starting in manual mode. The switch is unchecked.
 * Users will enter quantity, unit, and ingredient separately.
 */
export const ManualMode: Story = {
  args: {
    defaultMode: 'manual',
    onChange: fn(),
  },
}

// =============================================================================
// DISABLED STATE
// =============================================================================

/**
 * Disabled toggle. Can't be changed.
 * Use this when AI parsing is temporarily unavailable.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'When disabled, the toggle cannot be changed. Useful when AI parsing is unavailable (e.g., API key missing).',
      },
    },
  },
}

/**
 * Disabled in manual mode.
 * Shows the disabled state when stuck in manual mode.
 */
export const DisabledManual: Story = {
  args: {
    defaultMode: 'manual',
    disabled: true,
    onChange: fn(),
  },
}

// =============================================================================
// CONTROLLED MODE
// =============================================================================

/**
 * Controlled component example.
 * Parent manages the mode state.
 */
export const Controlled: Story = {
  render: function ControlledExample() {
    const [mode, setMode] = useState<'ai' | 'manual'>('ai')

    return (
      <div className="flex flex-col items-center gap-4">
        <IngredientInputToggle mode={mode} onChange={setMode} />
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          Current mode: <span className="font-medium">{mode}</span>
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use the `mode` prop for full control. The component becomes controlled and ignores localStorage.',
      },
    },
  },
}

// =============================================================================
// WITH CONTEXT
// =============================================================================

/**
 * In context of a form.
 * Shows how the toggle might appear in a real step edit form.
 */
export const InFormContext: Story = {
  render: function InFormContextExample() {
    const [mode, setMode] = useState<'ai' | 'manual'>('ai')

    return (
      <div className="w-96 p-6 border border-zinc-200 dark:border-zinc-700 rounded-xl space-y-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Add Ingredients
        </h3>
        <IngredientInputToggle onChange={setMode} />
        <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
          {mode === 'ai' ? (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Paste ingredients
              </label>
              <textarea
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                placeholder="2 cups flour, sifted&#10;1/2 cup sugar&#10;3 large eggs"
                rows={4}
              />
              <p className="text-xs text-zinc-500">
                AI will parse this into structured ingredients
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_1fr_2fr] gap-2">
                <input
                  type="number"
                  placeholder="Qty"
                  className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Unit"
                  className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Ingredient"
                  className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                />
              </div>
              <p className="text-xs text-zinc-500">
                Enter each field manually
              </p>
            </div>
          )}
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'The toggle controls which input mode is shown. AI mode shows a textarea, manual mode shows separate fields.',
      },
    },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Toggle from AI to manual mode.
 * Click the switch to turn off AI parsing.
 */
export const ToggleToManual: Story = {
  args: {
    defaultMode: 'ai',
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const switchEl = canvas.getByRole('switch')

    // Initially on (AI mode)
    await expect(switchEl).toBeChecked()

    // Click to toggle off
    await userEvent.click(switchEl)

    // Should be off now (manual mode)
    await expect(switchEl).not.toBeChecked()
    await expect(args.onChange).toHaveBeenCalledWith('manual')
  },
}

/**
 * Toggle from manual to AI mode.
 * Click the switch to turn on AI parsing.
 */
export const ToggleToAI: Story = {
  args: {
    defaultMode: 'manual',
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const switchEl = canvas.getByRole('switch')

    // Initially off (manual mode)
    await expect(switchEl).not.toBeChecked()

    // Click to toggle on
    await userEvent.click(switchEl)

    // Should be on now (AI mode)
    await expect(switchEl).toBeChecked()
    await expect(args.onChange).toHaveBeenCalledWith('ai')
  },
}

/**
 * Keyboard toggle with Space.
 * Accessible keyboard interaction.
 */
export const KeyboardToggle: Story = {
  args: {
    defaultMode: 'ai',
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const switchEl = canvas.getByRole('switch')

    // Focus the switch
    switchEl.focus()
    await expect(switchEl).toHaveFocus()

    // Press Space to toggle
    await userEvent.keyboard(' ')

    // Should be off now
    await expect(switchEl).not.toBeChecked()
    await expect(args.onChange).toHaveBeenCalledWith('manual')
  },
}

/**
 * Disabled switch doesn't respond to clicks.
 * Verifies the disabled state works correctly.
 */
export const DisabledInteraction: Story = {
  args: {
    disabled: true,
    defaultMode: 'ai',
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const switchEl = canvas.getByRole('switch')

    // Initially on and disabled
    await expect(switchEl).toBeChecked()
    await expect(switchEl).toHaveAttribute('data-disabled')

    // Try to click (should do nothing)
    await userEvent.click(switchEl)

    // Should still be on
    await expect(switchEl).toBeChecked()
    // onChange is called once on mount with initial value
    await expect(args.onChange).toHaveBeenCalledTimes(1)
  },
}

/**
 * Multiple rapid toggles.
 * Stress testing the toggle.
 */
export const RapidToggling: Story = {
  args: {
    defaultMode: 'ai',
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const switchEl = canvas.getByRole('switch')

    // Rapid toggles
    await userEvent.click(switchEl) // ai -> manual
    await userEvent.click(switchEl) // manual -> ai
    await userEvent.click(switchEl) // ai -> manual
    await userEvent.click(switchEl) // manual -> ai
    await userEvent.click(switchEl) // ai -> manual

    // Should end in manual mode
    await expect(switchEl).not.toBeChecked()

    // onChange called 5 times after mount
    await expect(args.onChange).toHaveBeenCalledTimes(6) // 1 mount + 5 clicks
  },
}

/**
 * Focus state verification.
 * Tab to see the focus ring.
 */
export const FocusState: Story = {
  args: {
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const switchEl = canvas.getByRole('switch')

    // Tab to focus
    await userEvent.tab()

    // Should have focus
    await expect(switchEl).toHaveFocus()
  },
}
