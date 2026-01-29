import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { useState } from 'react'
import { Radio, RadioField, RadioGroup } from '../app/components/ui/radio'
import { Label, Description } from '../app/components/ui/fieldset'

/**
 * # Radio
 *
 * The exclusive selector. The "choose only one" of the UI world. The bouncer
 * at the nightclub of options.
 *
 * While checkboxes let you select any combination (like a buffet), radios force
 * you to commit to a single choice (like a prix fixe menu). One in, everyone
 * else out. It's basically the hunger games of form elements.
 *
 * ## The Philosophy of Radio Buttons
 *
 * Named after old-timey car radios where pressing one station button would pop
 * out all the others. Gen Z developers have no idea why they're called this,
 * but here we are, carrying on the tradition of confusing naming conventions.
 *
 * ## Features
 *
 * - **21 color variants** - Because your radio buttons deserve personality
 * - **RadioField** - Radio + Label, properly associated
 * - **RadioGroup** - Manages the "only one selected" logic for you
 * - **Accessible by default** - Arrow keys to navigate, Space to select
 * - **Keyboard friendly** - Tab to enter, arrows to navigate
 *
 * ## When to use Radio vs Checkbox
 *
 * - **Radio**: "Choose your payment method" (one at a time, please)
 * - **Checkbox**: "Select your toppings" (go wild, select all the things)
 */
const meta: Meta<typeof Radio> = {
  title: 'UI/Radio',
  component: Radio,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The exclusive selector. Built on HeadlessUI's RadioGroup with 21 color variants and full keyboard accessibility.

Use radios when users must choose exactly one option from a list. Like picking a favorite child, but for form inputs.
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
      description: 'The color when selected. Make it pop.',
    },
    value: {
      control: 'text',
      description: 'The value of this radio option.',
    },
    disabled: {
      control: 'boolean',
      description: 'Prevents selection. This option is off the menu.',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// BASIC STATES
// =============================================================================

/**
 * An unselected radio button. A circle of possibility.
 * It's waiting. Hoping. Dreaming of being chosen.
 */
export const Unselected: Story = {
  render: () => (
    <RadioGroup defaultValue="">
      <Radio value="option" />
    </RadioGroup>
  ),
}

/**
 * A selected radio button. This one won the popularity contest.
 * Notice the filled center — that's the victory lap.
 */
export const Selected: Story = {
  render: () => (
    <RadioGroup defaultValue="selected">
      <Radio value="selected" />
    </RadioGroup>
  ),
}

// =============================================================================
// DISABLED STATES
// =============================================================================

/**
 * A disabled, unselected radio. Can't be chosen, doesn't want to be.
 * It's sitting this round out.
 */
export const DisabledUnselected: Story = {
  render: () => (
    <RadioGroup defaultValue="">
      <Radio value="option" disabled />
    </RadioGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Disabled radios get 50% opacity. They\'re visible but untouchable, like a museum exhibit.',
      },
    },
  },
}

/**
 * A disabled, selected radio. Someone made this choice for you.
 * Deal with it.
 */
export const DisabledSelected: Story = {
  render: () => (
    <RadioGroup defaultValue="selected">
      <Radio value="selected" disabled />
    </RadioGroup>
  ),
}

// =============================================================================
// COLOR VARIANTS
// =============================================================================

/**
 * ## The Rainbow of Exclusivity
 *
 * 21 colors, all vying for your attention. Each one is convinced
 * it's the best choice. Sounds like a radio group to me.
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
        <RadioGroup key={color} defaultValue="selected">
          <div className="flex items-center gap-2">
            <Radio value="selected" color={color as any} />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">{color}</span>
          </div>
        </RadioGroup>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All 21 colors, selected and showing off. Pick the one that matches your brand identity crisis.',
      },
    },
  },
}

/**
 * The neutral palette. For serious applications and serious people.
 */
export const NeutralColors: Story = {
  render: () => (
    <div className="flex gap-4">
      {['dark/zinc', 'dark/white', 'white', 'dark', 'zinc'].map((color) => (
        <RadioGroup key={color} defaultValue="selected">
          <div className="flex flex-col items-center gap-1">
            <Radio value="selected" color={color as any} />
            <span className="text-xs text-zinc-500">{color}</span>
          </div>
        </RadioGroup>
      ))}
    </div>
  ),
}

/**
 * Warm colors. For when your choices need to feel urgent.
 */
export const WarmColors: Story = {
  render: () => (
    <div className="flex gap-4">
      {['red', 'orange', 'amber', 'yellow'].map((color) => (
        <RadioGroup key={color} defaultValue="selected">
          <div className="flex flex-col items-center gap-1">
            <Radio value="selected" color={color as any} />
            <span className="text-xs text-zinc-500">{color}</span>
          </div>
        </RadioGroup>
      ))}
    </div>
  ),
}

/**
 * Cool colors. Calm decisions for calm people.
 */
export const CoolColors: Story = {
  render: () => (
    <div className="flex gap-4">
      {['lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo'].map((color) => (
        <RadioGroup key={color} defaultValue="selected">
          <div className="flex flex-col items-center gap-1">
            <Radio value="selected" color={color as any} />
            <span className="text-xs text-zinc-500">{color}</span>
          </div>
        </RadioGroup>
      ))}
    </div>
  ),
}

/**
 * The fun colors. Your app has personality and it's not afraid to show it.
 */
export const VibrantColors: Story = {
  render: () => (
    <div className="flex gap-4">
      {['violet', 'purple', 'fuchsia', 'pink', 'rose'].map((color) => (
        <RadioGroup key={color} defaultValue="selected">
          <div className="flex flex-col items-center gap-1">
            <Radio value="selected" color={color as any} />
            <span className="text-xs text-zinc-500">{color}</span>
          </div>
        </RadioGroup>
      ))}
    </div>
  ),
}

// =============================================================================
// WITH LABELS
// =============================================================================

/**
 * Radio with a label. They go together like peanut butter and jelly.
 * Or like form elements and accessibility requirements.
 */
export const WithLabel: Story = {
  render: () => (
    <RadioGroup defaultValue="option1">
      <RadioField>
        <Radio value="option1" />
        <Label>I am the chosen one</Label>
      </RadioField>
    </RadioGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'RadioField creates proper layout and label association. Click the label to select!',
      },
    },
  },
}

/**
 * Radio with label and description. For when you need to explain
 * why this option is clearly the superior choice.
 */
export const WithLabelAndDescription: Story = {
  render: () => (
    <RadioGroup defaultValue="premium">
      <RadioField>
        <Radio value="premium" color="blue" />
        <Label>Premium Plan</Label>
        <Description>All features, unlimited recipes, zero regrets.</Description>
      </RadioField>
    </RadioGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Add a Description for more context. The label becomes bold automatically when a description is present.',
      },
    },
  },
}

// =============================================================================
// RADIO GROUPS (THE MAIN EVENT)
// =============================================================================

/**
 * The classic radio group. Multiple options, one winner.
 * Democracy in action. Or is it autocracy? One rules, the rest bow.
 */
export const BasicGroup: Story = {
  render: () => (
    <RadioGroup defaultValue="medium">
      <RadioField>
        <Radio value="small" />
        <Label>Small</Label>
      </RadioField>
      <RadioField>
        <Radio value="medium" />
        <Label>Medium</Label>
      </RadioField>
      <RadioField>
        <Radio value="large" />
        <Label>Large</Label>
      </RadioField>
    </RadioGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A basic radio group. Click an option to select it, and watch the others deselect. Survival of the fittest.',
      },
    },
  },
}

/**
 * Radio group with descriptions. Because sometimes "Large" isn't descriptive enough.
 * (Looking at you, Starbucks.)
 */
export const GroupWithDescriptions: Story = {
  render: () => (
    <RadioGroup defaultValue="standard">
      <RadioField>
        <Radio value="economy" color="green" />
        <Label>Economy</Label>
        <Description>5-7 business days. Patience is a virtue.</Description>
      </RadioField>
      <RadioField>
        <Radio value="standard" color="blue" />
        <Label>Standard</Label>
        <Description>3-5 business days. The sensible choice.</Description>
      </RadioField>
      <RadioField>
        <Radio value="express" color="orange" />
        <Label>Express</Label>
        <Description>1-2 business days. For the impatient.</Description>
      </RadioField>
      <RadioField>
        <Radio value="overnight" color="red" />
        <Label>Overnight</Label>
        <Description>Next day delivery. Money is no object.</Description>
      </RadioField>
    </RadioGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Each option has a description. The spacing automatically adjusts and labels become bold.',
      },
    },
  },
}

/**
 * A radio group with some disabled options.
 * "You can have any color you want, as long as it's black." — Henry Ford, probably
 */
export const GroupWithDisabledOptions: Story = {
  render: () => (
    <RadioGroup defaultValue="available">
      <RadioField>
        <Radio value="available" color="green" />
        <Label>Available option</Label>
        <Description>This one's on the menu.</Description>
      </RadioField>
      <RadioField>
        <Radio value="soldout" disabled />
        <Label>Sold out</Label>
        <Description>Should've ordered earlier.</Description>
      </RadioField>
      <RadioField>
        <Radio value="coming" disabled />
        <Label>Coming soon</Label>
        <Description>We're working on it. Probably.</Description>
      </RadioField>
    </RadioGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Individual radios can be disabled while the group remains functional. Some doors are just... closed.',
      },
    },
  },
}

/**
 * An entirely disabled radio group.
 * The decision has been made. You're just here to witness it.
 */
export const DisabledGroup: Story = {
  render: () => (
    <RadioGroup defaultValue="preselected" disabled>
      <RadioField>
        <Radio value="option1" />
        <Label>Option A</Label>
      </RadioField>
      <RadioField>
        <Radio value="preselected" />
        <Label>Option B (pre-selected by management)</Label>
      </RadioField>
      <RadioField>
        <Radio value="option3" />
        <Label>Option C</Label>
      </RadioField>
    </RadioGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'When the entire RadioGroup is disabled, all options become untouchable. Corporate has made the decision.',
      },
    },
  },
}

// =============================================================================
// REAL-WORLD EXAMPLES
// =============================================================================

/**
 * Subscription tiers. The classic upsell pattern.
 * Notice how Premium is pre-selected. Coincidence? I think not.
 */
export const PricingTiers: Story = {
  render: () => (
    <div className="w-80">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
        Choose your plan
      </h3>
      <RadioGroup defaultValue="pro">
        <RadioField>
          <Radio value="free" color="zinc" />
          <Label>Free</Label>
          <Description>5 recipes, basic features. Good for trying things out.</Description>
        </RadioField>
        <RadioField>
          <Radio value="pro" color="blue" />
          <Label>Pro — $9/month</Label>
          <Description>Unlimited recipes, meal planning, shopping lists.</Description>
        </RadioField>
        <RadioField>
          <Radio value="team" color="indigo" />
          <Label>Team — $29/month</Label>
          <Description>Everything in Pro, plus collaboration and sharing.</Description>
        </RadioField>
      </RadioGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A pricing page pattern. The middle option is pre-selected because that\'s where the money is.',
      },
    },
  },
}

/**
 * Cooking difficulty selector. For recipes.
 * Because some of us just want to boil water.
 */
export const DifficultySelector: Story = {
  render: () => (
    <div className="w-72">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
        Recipe Difficulty
      </h3>
      <RadioGroup defaultValue="medium">
        <RadioField>
          <Radio value="easy" color="green" />
          <Label>Easy</Label>
          <Description>Microwave expertise required.</Description>
        </RadioField>
        <RadioField>
          <Radio value="medium" color="amber" />
          <Label>Medium</Label>
          <Description>Some knife skills. Don't cut yourself.</Description>
        </RadioField>
        <RadioField>
          <Radio value="hard" color="orange" />
          <Label>Hard</Label>
          <Description>Multiple techniques. Mise en place essential.</Description>
        </RadioField>
        <RadioField>
          <Radio value="expert" color="red" />
          <Label>Expert</Label>
          <Description>You've worked in a professional kitchen.</Description>
        </RadioField>
      </RadioGroup>
    </div>
  ),
}

/**
 * Dietary preference selector. No judgment here.
 * (Okay, maybe a little judgment.)
 */
export const DietaryPreference: Story = {
  render: () => (
    <div className="w-80">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
        Dietary Preference
      </h3>
      <RadioGroup defaultValue="omnivore">
        <RadioField>
          <Radio value="omnivore" color="zinc" />
          <Label>Omnivore</Label>
          <Description>I eat everything. Life is short.</Description>
        </RadioField>
        <RadioField>
          <Radio value="vegetarian" color="green" />
          <Label>Vegetarian</Label>
          <Description>No meat, but cheese is essential.</Description>
        </RadioField>
        <RadioField>
          <Radio value="vegan" color="emerald" />
          <Label>Vegan</Label>
          <Description>Plant-based everything. Will tell you about it.</Description>
        </RadioField>
        <RadioField>
          <Radio value="pescatarian" color="cyan" />
          <Label>Pescatarian</Label>
          <Description>Fish are friends AND food.</Description>
        </RadioField>
      </RadioGroup>
    </div>
  ),
}

/**
 * Sort order selector. A horizontal layout variation.
 */
export const SortOrder: Story = {
  render: () => (
    <div>
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mr-4">Sort by:</span>
      <RadioGroup defaultValue="newest" className="inline-flex gap-6 !space-y-0">
        <RadioField className="!grid-cols-[auto_auto] items-center">
          <Radio value="newest" color="blue" />
          <Label>Newest</Label>
        </RadioField>
        <RadioField className="!grid-cols-[auto_auto] items-center">
          <Radio value="popular" color="blue" />
          <Label>Popular</Label>
        </RadioField>
        <RadioField className="!grid-cols-[auto_auto] items-center">
          <Radio value="rating" color="blue" />
          <Label>Top Rated</Label>
        </RadioField>
      </RadioGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Radio buttons can be laid out horizontally for compact filter controls.',
      },
    },
  },
}

/**
 * A controlled radio group example. State management included.
 */
export const ControlledGroup: Story = {
  render: function ControlledExample() {
    const [selected, setSelected] = useState('medium')

    return (
      <div className="w-64">
        <RadioGroup value={selected} onChange={setSelected}>
          <RadioField>
            <Radio value="small" color="blue" />
            <Label>Small</Label>
          </RadioField>
          <RadioField>
            <Radio value="medium" color="blue" />
            <Label>Medium</Label>
          </RadioField>
          <RadioField>
            <Radio value="large" color="blue" />
            <Label>Large</Label>
          </RadioField>
        </RadioGroup>
        <p className="mt-4 text-sm text-zinc-500">
          Selected: <span className="font-medium text-zinc-900 dark:text-white">{selected}</span>
        </p>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'A controlled RadioGroup with React state. The selection is displayed below.',
      },
    },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Click to select! Test that clicking a radio option selects it.
 * Watch the Interactions panel for the play-by-play.
 */
export const ClickToSelect: Story = {
  render: (args) => (
    <RadioGroup defaultValue="" onChange={args.onChange}>
      <RadioField>
        <Radio value="first" data-testid="first" />
        <Label>First option</Label>
      </RadioField>
      <RadioField>
        <Radio value="second" data-testid="second" />
        <Label>Second option</Label>
      </RadioField>
      <RadioField>
        <Radio value="third" data-testid="third" />
        <Label>Third option</Label>
      </RadioField>
    </RadioGroup>
  ),
  args: {
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const radios = canvas.getAllByRole('radio')
    const [first, second, third] = radios

    // Initially none selected
    await expect(first).not.toBeChecked()
    await expect(second).not.toBeChecked()
    await expect(third).not.toBeChecked()

    // Click the first option
    await userEvent.click(first)
    await expect(first).toBeChecked()
    await expect(second).not.toBeChecked()
    await expect(third).not.toBeChecked()
    await expect(args.onChange).toHaveBeenCalledWith('first')

    // Click the second option (first should deselect)
    await userEvent.click(second)
    await expect(first).not.toBeChecked()
    await expect(second).toBeChecked()
    await expect(third).not.toBeChecked()
    await expect(args.onChange).toHaveBeenCalledWith('second')

    // Click the third option
    await userEvent.click(third)
    await expect(first).not.toBeChecked()
    await expect(second).not.toBeChecked()
    await expect(third).toBeChecked()
    await expect(args.onChange).toHaveBeenCalledWith('third')
  },
  parameters: {
    docs: {
      description: {
        story: 'Clicking a radio selects it and deselects all others. The fundamental radio behavior.',
      },
    },
  },
}

/**
 * Testing keyboard navigation. Arrow keys move through options.
 * Tab enters the group, arrows navigate, and selection follows focus.
 */
export const KeyboardNavigation: Story = {
  render: (args) => (
    <RadioGroup defaultValue="first" onChange={args.onChange}>
      <RadioField>
        <Radio value="first" />
        <Label>First option</Label>
      </RadioField>
      <RadioField>
        <Radio value="second" />
        <Label>Second option</Label>
      </RadioField>
      <RadioField>
        <Radio value="third" />
        <Label>Third option</Label>
      </RadioField>
    </RadioGroup>
  ),
  args: {
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const radios = canvas.getAllByRole('radio')
    const [first, second, third] = radios

    // First is selected by default
    await expect(first).toBeChecked()

    // Tab into the radio group (focuses the selected radio)
    await userEvent.tab()
    await expect(first).toHaveFocus()

    // Arrow down to second option (should select it)
    await userEvent.keyboard('{ArrowDown}')
    await expect(second).toHaveFocus()
    await expect(second).toBeChecked()
    await expect(first).not.toBeChecked()
    await expect(args.onChange).toHaveBeenCalledWith('second')

    // Arrow down to third option
    await userEvent.keyboard('{ArrowDown}')
    await expect(third).toHaveFocus()
    await expect(third).toBeChecked()
    await expect(second).not.toBeChecked()
    await expect(args.onChange).toHaveBeenCalledWith('third')

    // Arrow down wraps to first
    await userEvent.keyboard('{ArrowDown}')
    await expect(first).toHaveFocus()
    await expect(first).toBeChecked()
    await expect(third).not.toBeChecked()
    await expect(args.onChange).toHaveBeenCalledWith('first')
  },
  parameters: {
    docs: {
      description: {
        story: 'Tab to enter the group, then use arrow keys to navigate. Selection follows focus — no need to press Space.',
      },
    },
  },
}

/**
 * Arrow Up navigation. Going backwards through the options.
 */
export const ArrowUpNavigation: Story = {
  render: (args) => (
    <RadioGroup defaultValue="third" onChange={args.onChange}>
      <RadioField>
        <Radio value="first" />
        <Label>First</Label>
      </RadioField>
      <RadioField>
        <Radio value="second" />
        <Label>Second</Label>
      </RadioField>
      <RadioField>
        <Radio value="third" />
        <Label>Third</Label>
      </RadioField>
    </RadioGroup>
  ),
  args: {
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const radios = canvas.getAllByRole('radio')
    const [first, second, third] = radios

    // Third is selected by default
    await expect(third).toBeChecked()

    // Tab to focus
    await userEvent.tab()
    await expect(third).toHaveFocus()

    // Arrow up to second
    await userEvent.keyboard('{ArrowUp}')
    await expect(second).toHaveFocus()
    await expect(second).toBeChecked()
    await expect(args.onChange).toHaveBeenCalledWith('second')

    // Arrow up to first
    await userEvent.keyboard('{ArrowUp}')
    await expect(first).toHaveFocus()
    await expect(first).toBeChecked()
    await expect(args.onChange).toHaveBeenCalledWith('first')

    // Arrow up wraps to third
    await userEvent.keyboard('{ArrowUp}')
    await expect(third).toHaveFocus()
    await expect(third).toBeChecked()
    await expect(args.onChange).toHaveBeenCalledWith('third')
  },
  parameters: {
    docs: {
      description: {
        story: 'Arrow Up moves backwards through options. Wraps around at the beginning.',
      },
    },
  },
}

/**
 * Testing disabled radios don't respond to clicks.
 * Trying to click them is like trying to push a pull door.
 */
export const DisabledInteraction: Story = {
  render: (args) => (
    <RadioGroup defaultValue="enabled" onChange={args.onChange}>
      <RadioField>
        <Radio value="enabled" />
        <Label>Enabled option</Label>
      </RadioField>
      <RadioField>
        <Radio value="disabled" disabled />
        <Label>Disabled option</Label>
      </RadioField>
    </RadioGroup>
  ),
  args: {
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const radios = canvas.getAllByRole('radio')
    const [enabled, disabled] = radios

    // Enabled is selected
    await expect(enabled).toBeChecked()

    // Disabled radio should have disabled attribute
    await expect(disabled).toHaveAttribute('data-disabled')

    // Try to click the disabled radio
    await userEvent.click(disabled)

    // Enabled should still be checked (the selection didn't change)
    await expect(enabled).toBeChecked()

    // onChange should not have been called with 'disabled' since the click was ignored
    // (It may or may not be called at all depending on HeadlessUI internals)
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled radios can\'t be selected. The group skips over them during keyboard navigation too.',
      },
    },
  },
}

/**
 * Label click selects the radio. Because that's how labels work.
 */
export const LabelClickSelects: Story = {
  render: (args) => (
    <RadioGroup defaultValue="" onChange={args.onChange}>
      <RadioField>
        <Radio value="first" />
        <Label>Click this label</Label>
      </RadioField>
      <RadioField>
        <Radio value="second" />
        <Label>Or this one</Label>
      </RadioField>
    </RadioGroup>
  ),
  args: {
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const radios = canvas.getAllByRole('radio')
    const [first, second] = radios
    const firstLabel = canvas.getByText('Click this label')
    const secondLabel = canvas.getByText('Or this one')

    // Initially neither selected
    await expect(first).not.toBeChecked()
    await expect(second).not.toBeChecked()

    // Click the first label
    await userEvent.click(firstLabel)
    await expect(first).toBeChecked()
    await expect(second).not.toBeChecked()
    await expect(args.onChange).toHaveBeenCalledWith('first')

    // Click the second label
    await userEvent.click(secondLabel)
    await expect(first).not.toBeChecked()
    await expect(second).toBeChecked()
    await expect(args.onChange).toHaveBeenCalledWith('second')
  },
  parameters: {
    docs: {
      description: {
        story: 'Clicking a radio\'s label selects it. RadioField handles the association automatically.',
      },
    },
  },
}

/**
 * Test the focus ring visibility.
 */
export const FocusState: Story = {
  render: () => (
    <RadioGroup defaultValue="focused">
      <RadioField>
        <Radio value="focused" />
        <Label>Tab to see focus ring</Label>
      </RadioField>
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const radio = canvas.getByRole('radio')

    // Tab to focus
    await userEvent.tab()
    await expect(radio).toHaveFocus()
  },
  parameters: {
    docs: {
      description: {
        story: 'The focus ring appears on Tab. It\'s blue and offset for visibility.',
      },
    },
  },
}

/**
 * Starting with a selection and changing it.
 * Like changing your mind at a restaurant after ordering.
 */
export const ChangeSelection: Story = {
  render: (args) => (
    <RadioGroup defaultValue="original" onChange={args.onChange}>
      <RadioField>
        <Radio value="original" color="blue" />
        <Label>Original choice</Label>
      </RadioField>
      <RadioField>
        <Radio value="changed" color="blue" />
        <Label>Changed my mind</Label>
      </RadioField>
    </RadioGroup>
  ),
  args: {
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const radios = canvas.getAllByRole('radio')
    const [original, changed] = radios

    // Original is selected by default
    await expect(original).toBeChecked()
    await expect(changed).not.toBeChecked()

    // Click to change selection
    await userEvent.click(changed)
    await expect(original).not.toBeChecked()
    await expect(changed).toBeChecked()
    await expect(args.onChange).toHaveBeenCalledWith('changed')

    // Change back
    await userEvent.click(original)
    await expect(original).toBeChecked()
    await expect(changed).not.toBeChecked()
    await expect(args.onChange).toHaveBeenCalledWith('original')
  },
  parameters: {
    docs: {
      description: {
        story: 'Selections can be changed freely. Each click fires the onChange callback.',
      },
    },
  },
}
