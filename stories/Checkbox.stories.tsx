import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { useState } from 'react'
import { Checkbox, CheckboxField, CheckboxGroup } from '../app/components/ui/checkbox'
import { Label, Description } from '../app/components/ui/fieldset'

/**
 * # Checkbox
 *
 * The humble checkbox. The binary hero of user input. The "yes or no" of the UI world.
 * Except when it's "yes, no, or I haven't decided yet" (that's indeterminate).
 *
 * Our Checkbox is built on HeadlessUI and comes with more color options than a
 * box of crayons. 21 colors, to be exact. Because why have one shade of green
 * when you can have five?
 *
 * ## The Philosophy of Checkboxes
 *
 * A checkbox is like a light switch. It's either on or off. But unlike a light switch,
 * it can also be in a quantum superposition state called "indeterminate" — perfect
 * for when you've selected some items but not all. Schrödinger would be proud.
 *
 * ## Features
 *
 * - **21 color variants** - Match your checkboxes to your mood
 * - **Indeterminate state** - For the commitment-phobic among us
 * - **CheckboxField** - Checkbox + Label, sitting in a tree...
 * - **CheckboxGroup** - For when one checkbox just isn't enough
 * - **Accessible by default** - Screen readers can see your checkboxes too
 * - **Keyboard friendly** - Space to toggle, because Enter is for buttons
 */
const meta: Meta<typeof Checkbox> = {
  title: 'UI/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The humble checkbox. The binary hero of user input. Built on HeadlessUI with 21 color variants, indeterminate state support, and automatic accessibility.

Perfect for "agree to terms" forms that nobody reads, todo lists that never get done, and settings pages that make users feel productive.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: [
        'dark/zinc', 'dark/white', 'white', 'dark', 'zinc',
        'red', 'orange', 'amber', 'yellow', 'lime', 'green',
        'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo',
        'violet', 'purple', 'fuchsia', 'pink', 'rose',
      ],
      description: 'The color when checked. Because life is too short for boring checkboxes.',
    },
    checked: {
      control: 'boolean',
      description: 'Whether the checkbox is checked. Shocking, I know.',
    },
    defaultChecked: {
      control: 'boolean',
      description: 'Initial checked state for uncontrolled usage.',
    },
    indeterminate: {
      control: 'boolean',
      description: 'The "I can\'t decide" state. Shows a dash instead of a checkmark.',
    },
    disabled: {
      control: 'boolean',
      description: 'Prevents interaction. The checkbox equivalent of "do not disturb."',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// BASIC STATES
// =============================================================================

/**
 * The default, unchecked checkbox. A blank canvas of possibility.
 * Will it be checked? Only the user knows.
 */
export const Unchecked: Story = {
  args: {
    defaultChecked: false,
  },
}

/**
 * A checked checkbox. The user has made their choice.
 * There's no going back now. (Just kidding, click it again.)
 */
export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
}

/**
 * The indeterminate state. Neither here nor there.
 *
 * Use this when a parent checkbox has some (but not all) children selected.
 * It's like saying "partially complete" without committing to a percentage.
 */
export const Indeterminate: Story = {
  args: {
    indeterminate: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows a horizontal line instead of a checkmark. Perfect for "select all" scenarios where only some items are selected.',
      },
    },
  },
}

// =============================================================================
// DISABLED STATES
// =============================================================================

/**
 * A disabled unchecked checkbox. Look but don't touch.
 */
export const DisabledUnchecked: Story = {
  args: {
    disabled: true,
    defaultChecked: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled checkboxes get 50% opacity. They\'re still visible, just... unavailable.',
      },
    },
  },
}

/**
 * A disabled checked checkbox. Someone made this choice for you.
 * Probably your past self. Or a product manager.
 */
export const DisabledChecked: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
}

/**
 * Disabled indeterminate. The ultimate state of paralysis.
 */
export const DisabledIndeterminate: Story = {
  args: {
    disabled: true,
    indeterminate: true,
  },
}

// =============================================================================
// COLOR VARIANTS
// =============================================================================

/**
 * ## The Rainbow of Checkboxes
 *
 * 21 colors. Because your checkboxes deserve to express themselves.
 * Each color is carefully crafted to look good checked and maintain
 * proper contrast ratios. We're artists AND accessibility advocates.
 */
export const AllColors: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-4">
      {[
        'dark/zinc', 'dark/white', 'white', 'dark', 'zinc',
        'red', 'orange', 'amber', 'yellow', 'lime', 'green',
        'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo',
        'violet', 'purple', 'fuchsia', 'pink', 'rose',
      ].map((color) => (
        <div key={color} className="flex items-center gap-2">
          <Checkbox color={color as any} defaultChecked />
          <span className="text-sm text-zinc-600 dark:text-zinc-400">{color}</span>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All 21 colors, checked and ready for action. Pick your favorite. We won\'t judge.',
      },
    },
  },
}

/**
 * The neutral palette. Professional and understated.
 * For when your checkboxes need to attend a business meeting.
 */
export const NeutralColors: Story = {
  render: () => (
    <div className="flex gap-4">
      {['dark/zinc', 'dark/white', 'white', 'dark', 'zinc'].map((color) => (
        <div key={color} className="flex flex-col items-center gap-1">
          <Checkbox color={color as any} defaultChecked />
          <span className="text-xs text-zinc-500">{color}</span>
        </div>
      ))}
    </div>
  ),
}

/**
 * Warm colors for warm feelings.
 * Red for danger, orange for caution, yellow for "pay attention!"
 */
export const WarmColors: Story = {
  render: () => (
    <div className="flex gap-4">
      {['red', 'orange', 'amber', 'yellow'].map((color) => (
        <div key={color} className="flex flex-col items-center gap-1">
          <Checkbox color={color as any} defaultChecked />
          <span className="text-xs text-zinc-500">{color}</span>
        </div>
      ))}
    </div>
  ),
}

/**
 * Cool colors. Calm and collected.
 * Green for success, blue for trust, teal for sophistication.
 */
export const CoolColors: Story = {
  render: () => (
    <div className="flex gap-4">
      {['lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo'].map((color) => (
        <div key={color} className="flex flex-col items-center gap-1">
          <Checkbox color={color as any} defaultChecked />
          <span className="text-xs text-zinc-500">{color}</span>
        </div>
      ))}
    </div>
  ),
}

/**
 * The fun colors. For when your app has personality.
 */
export const VibrantColors: Story = {
  render: () => (
    <div className="flex gap-4">
      {['violet', 'purple', 'fuchsia', 'pink', 'rose'].map((color) => (
        <div key={color} className="flex flex-col items-center gap-1">
          <Checkbox color={color as any} defaultChecked />
          <span className="text-xs text-zinc-500">{color}</span>
        </div>
      ))}
    </div>
  ),
}

// =============================================================================
// WITH LABELS
// =============================================================================

/**
 * Checkbox with a label. They're better together.
 *
 * Use `CheckboxField` to properly associate a label with your checkbox.
 * This isn't just about looks — it's about accessibility. Clicking
 * the label toggles the checkbox. As it should be.
 */
export const WithLabel: Story = {
  render: () => (
    <CheckboxField>
      <Checkbox defaultChecked />
      <Label>I agree to pretend I read the terms</Label>
    </CheckboxField>
  ),
  parameters: {
    docs: {
      description: {
        story: 'CheckboxField creates the proper grid layout and label association. Click the label to toggle!',
      },
    },
  },
}

/**
 * Checkbox with label and description.
 * For when you need to explain what that checkbox actually does.
 */
export const WithLabelAndDescription: Story = {
  render: () => (
    <CheckboxField>
      <Checkbox defaultChecked color="blue" />
      <Label>Email notifications</Label>
      <Description>Get notified when someone comments on your recipe or follows you.</Description>
    </CheckboxField>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Add a Description component for additional context. The label becomes bold automatically.',
      },
    },
  },
}

/**
 * Multiple checkboxes with labels. A classic combo.
 */
export const MultipleWithLabels: Story = {
  render: () => (
    <CheckboxGroup>
      <CheckboxField>
        <Checkbox color="green" defaultChecked />
        <Label>Vegetarian</Label>
      </CheckboxField>
      <CheckboxField>
        <Checkbox color="green" />
        <Label>Vegan</Label>
      </CheckboxField>
      <CheckboxField>
        <Checkbox color="amber" defaultChecked />
        <Label>Gluten-free</Label>
      </CheckboxField>
      <CheckboxField>
        <Checkbox color="red" />
        <Label>Spicy</Label>
        <Description>Warning: may cause regret</Description>
      </CheckboxField>
    </CheckboxGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Use CheckboxGroup to space multiple checkboxes consistently. Each can have its own color.',
      },
    },
  },
}

/**
 * Disabled checkboxes with labels still show the association,
 * but the whole field becomes muted.
 */
export const DisabledWithLabel: Story = {
  render: () => (
    <CheckboxGroup>
      <CheckboxField>
        <Checkbox disabled />
        <Label>Free shipping (unavailable)</Label>
        <Description>Order $50+ for free shipping</Description>
      </CheckboxField>
      <CheckboxField>
        <Checkbox disabled defaultChecked color="green" />
        <Label>Express checkout (enabled by admin)</Label>
      </CheckboxField>
    </CheckboxGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'When disabled, the entire field gets 50% opacity. Labels and descriptions fade with the checkbox.',
      },
    },
  },
}

// =============================================================================
// REAL-WORLD EXAMPLES
// =============================================================================

/**
 * A settings panel. Where checkboxes live their best lives.
 */
export const SettingsPanel: Story = {
  render: () => (
    <div className="w-80 space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
          Notification Preferences
        </h3>
        <CheckboxGroup>
          <CheckboxField>
            <Checkbox color="indigo" defaultChecked />
            <Label>Email notifications</Label>
            <Description>Receive updates via email</Description>
          </CheckboxField>
          <CheckboxField>
            <Checkbox color="indigo" defaultChecked />
            <Label>Push notifications</Label>
            <Description>Get alerts on your device</Description>
          </CheckboxField>
          <CheckboxField>
            <Checkbox color="indigo" />
            <Label>SMS notifications</Label>
            <Description>Text messages for urgent updates</Description>
          </CheckboxField>
        </CheckboxGroup>
      </div>

      <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
          Privacy
        </h3>
        <CheckboxGroup>
          <CheckboxField>
            <Checkbox color="emerald" defaultChecked />
            <Label>Profile visible</Label>
            <Description>Let others see your recipes</Description>
          </CheckboxField>
          <CheckboxField>
            <Checkbox color="emerald" />
            <Label>Share cooking stats</Label>
            <Description>Show how many recipes you've tried</Description>
          </CheckboxField>
        </CheckboxGroup>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A realistic settings panel. Checkboxes grouped by category, each with helpful descriptions.',
      },
    },
  },
}

/**
 * The infamous "Select All" pattern with indeterminate state.
 */
export const SelectAllPattern: Story = {
  render: function SelectAllExample() {
    const [items, setItems] = useState([
      { id: 1, label: 'Flour', checked: true },
      { id: 2, label: 'Sugar', checked: true },
      { id: 3, label: 'Butter', checked: false },
      { id: 4, label: 'Eggs', checked: false },
    ])

    const allChecked = items.every((item) => item.checked)
    const someChecked = items.some((item) => item.checked)
    const indeterminate = someChecked && !allChecked

    const handleSelectAll = (checked: boolean) => {
      setItems(items.map((item) => ({ ...item, checked })))
    }

    const handleItemChange = (id: number, checked: boolean) => {
      setItems(items.map((item) => (item.id === id ? { ...item, checked } : item)))
    }

    return (
      <div className="w-64 border border-zinc-200 dark:border-zinc-700 rounded-lg">
        <div className="p-3 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
          <CheckboxField>
            <Checkbox
              color="blue"
              checked={allChecked}
              indeterminate={indeterminate}
              onChange={handleSelectAll}
            />
            <Label>Shopping List</Label>
          </CheckboxField>
        </div>
        <div className="p-3">
          <CheckboxGroup>
            {items.map((item) => (
              <CheckboxField key={item.id}>
                <Checkbox
                  color="blue"
                  checked={item.checked}
                  onChange={(checked) => handleItemChange(item.id, checked)}
                />
                <Label>{item.label}</Label>
              </CheckboxField>
            ))}
          </CheckboxGroup>
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'The classic "select all" pattern. Parent shows indeterminate when some (but not all) children are checked. Try toggling items!',
      },
    },
  },
}

/**
 * A todo list. The natural habitat of checkboxes.
 */
export const TodoList: Story = {
  render: function TodoListExample() {
    const [todos, setTodos] = useState([
      { id: 1, text: 'Preheat oven to 350°F', done: true },
      { id: 2, text: 'Mix dry ingredients', done: true },
      { id: 3, text: 'Cream butter and sugar', done: false },
      { id: 4, text: 'Add eggs one at a time', done: false },
      { id: 5, text: 'Combine wet and dry', done: false },
    ])

    const toggleTodo = (id: number, done: boolean) => {
      setTodos(todos.map((todo) => (todo.id === id ? { ...todo, done } : todo)))
    }

    return (
      <div className="w-72 border border-zinc-200 dark:border-zinc-700 rounded-lg">
        <div className="p-3 border-b border-zinc-200 dark:border-zinc-700">
          <h3 className="font-semibold text-zinc-900 dark:text-white">Recipe Steps</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {todos.filter((t) => t.done).length} of {todos.length} complete
          </p>
        </div>
        <div className="p-3">
          <CheckboxGroup>
            {todos.map((todo) => (
              <CheckboxField key={todo.id}>
                <Checkbox
                  color="green"
                  checked={todo.done}
                  onChange={(done) => toggleTodo(todo.id, done)}
                />
                <Label className={todo.done ? 'line-through text-zinc-400' : ''}>
                  {todo.text}
                </Label>
              </CheckboxField>
            ))}
          </CheckboxGroup>
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'A todo list with strike-through styling for completed items. The checkbox\'s natural habitat.',
      },
    },
  },
}

/**
 * Agreement checkboxes. You know, those things everyone ignores
 * before clicking "I Agree" anyway.
 */
export const AgreementForm: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <CheckboxField>
        <Checkbox color="blue" />
        <Label>I agree to the Terms of Service</Label>
        <Description>
          You definitely read all 47 pages. We believe you.
        </Description>
      </CheckboxField>
      <CheckboxField>
        <Checkbox color="blue" />
        <Label>I agree to the Privacy Policy</Label>
        <Description>
          We promise to only use your data for "personalization."
        </Description>
      </CheckboxField>
      <CheckboxField>
        <Checkbox color="violet" />
        <Label>Send me marketing emails</Label>
        <Description>
          Optional but we really, really want you to check this.
        </Description>
      </CheckboxField>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The classic agreement form. Required checkboxes for legal stuff, optional for marketing.',
      },
    },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Click to toggle! This story tests the basic click-to-toggle interaction.
 * Open the Interactions panel to watch the magic happen.
 */
export const ClickToToggle: Story = {
  args: {
    defaultChecked: false,
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const checkbox = canvas.getByRole('checkbox')

    // Initially unchecked
    await expect(checkbox).not.toBeChecked()

    // Click to check
    await userEvent.click(checkbox)
    await expect(checkbox).toBeChecked()
    await expect(args.onChange).toHaveBeenCalledTimes(1)
    await expect(args.onChange).toHaveBeenLastCalledWith(true)

    // Click to uncheck
    await userEvent.click(checkbox)
    await expect(checkbox).not.toBeChecked()
    await expect(args.onChange).toHaveBeenCalledTimes(2)
    await expect(args.onChange).toHaveBeenLastCalledWith(false)
  },
  parameters: {
    docs: {
      description: {
        story: 'Watch the Interactions panel to see the checkbox being toggled. Click, click, click.',
      },
    },
  },
}

/**
 * Testing that disabled checkboxes don't respond to clicks.
 * They're not being rude, they're just... disabled.
 */
export const DisabledInteraction: Story = {
  args: {
    disabled: true,
    defaultChecked: false,
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const checkbox = canvas.getByRole('checkbox')

    // Verify it's disabled
    await expect(checkbox).toBeDisabled()
    await expect(checkbox).not.toBeChecked()

    // Try to click (should do nothing)
    await userEvent.click(checkbox)

    // Should still be unchecked and onChange not called
    await expect(checkbox).not.toBeChecked()
    await expect(args.onChange).not.toHaveBeenCalled()
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled checkboxes ignore all interaction attempts. No means no.',
      },
    },
  },
}

/**
 * Testing keyboard accessibility. Space toggles the checkbox.
 * (Not Enter — that's for buttons!)
 */
export const KeyboardInteraction: Story = {
  args: {
    defaultChecked: false,
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const checkbox = canvas.getByRole('checkbox')

    // Focus the checkbox
    checkbox.focus()
    await expect(checkbox).toHaveFocus()

    // Press Space to check
    await userEvent.keyboard(' ')
    await expect(checkbox).toBeChecked()
    await expect(args.onChange).toHaveBeenCalledTimes(1)

    // Press Space again to uncheck
    await userEvent.keyboard(' ')
    await expect(checkbox).not.toBeChecked()
    await expect(args.onChange).toHaveBeenCalledTimes(2)
  },
  parameters: {
    docs: {
      description: {
        story: 'Space bar toggles checkboxes. It\'s the law of HTML. We don\'t make the rules.',
      },
    },
  },
}

/**
 * Testing that clicking the label also toggles the checkbox.
 * That's the whole point of labels, after all.
 */
export const LabelClickToggle: Story = {
  render: (args) => (
    <CheckboxField>
      <Checkbox {...args} />
      <Label>Click this label</Label>
    </CheckboxField>
  ),
  args: {
    defaultChecked: false,
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const checkbox = canvas.getByRole('checkbox')
    const label = canvas.getByText('Click this label')

    // Initially unchecked
    await expect(checkbox).not.toBeChecked()

    // Click the label (not the checkbox)
    await userEvent.click(label)
    await expect(checkbox).toBeChecked()
    await expect(args.onChange).toHaveBeenCalledTimes(1)

    // Click the label again
    await userEvent.click(label)
    await expect(checkbox).not.toBeChecked()
    await expect(args.onChange).toHaveBeenCalledTimes(2)
  },
  parameters: {
    docs: {
      description: {
        story: 'Clicking the label toggles the checkbox. This is why we use proper HTML associations.',
      },
    },
  },
}

/**
 * Test the focus state - verify the checkbox can receive focus.
 */
export const FocusState: Story = {
  args: {
    defaultChecked: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const checkbox = canvas.getByRole('checkbox')

    // Tab to focus
    await userEvent.tab()

    // Verify focus
    await expect(checkbox).toHaveFocus()
  },
  parameters: {
    docs: {
      description: {
        story: 'Tab to see the focus ring. Keyboard navigation is important!',
      },
    },
  },
}

/**
 * Starting checked and toggling off.
 * Because sometimes you inherit decisions you didn't make.
 */
export const ToggleFromChecked: Story = {
  args: {
    defaultChecked: true,
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const checkbox = canvas.getByRole('checkbox')

    // Initially checked
    await expect(checkbox).toBeChecked()

    // Click to uncheck
    await userEvent.click(checkbox)
    await expect(checkbox).not.toBeChecked()
    await expect(args.onChange).toHaveBeenCalledWith(false)

    // Click to check again
    await userEvent.click(checkbox)
    await expect(checkbox).toBeChecked()
    await expect(args.onChange).toHaveBeenCalledWith(true)
  },
  parameters: {
    docs: {
      description: {
        story: 'Starting from a checked state and toggling. Same behavior, different starting point.',
      },
    },
  },
}
