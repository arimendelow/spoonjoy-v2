import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { Select } from '../app/components/ui/select'
import { Field, Label, Description, ErrorMessage } from '../app/components/ui/fieldset'

/**
 * # Select
 *
 * The dropdown. The picker. The "I'll let you choose from this curated list" of form inputs.
 * It's like a multiple choice test, but for your UI.
 *
 * Our Select is built on HeadlessUI's native select wrapper, which means you get all the
 * accessibility benefits of a real `<select>` element without the pain of trying to style
 * one from scratch. (Seriously, have you ever tried styling a native select? It's like
 * trying to teach a cat to fetch — technically possible, but why would you?)
 *
 * ## The Philosophy of Selects
 *
 * A select says "I trust you to make a choice, but not *too* much of a choice." It's the
 * UI equivalent of asking "Would you like coffee or tea?" instead of "What would you like
 * to drink?" Infinite freedom sounds nice until you're staring at a text input wondering
 * if "orange juice" has a hyphen.
 *
 * ## When to Use Select
 *
 * - **5+ options** - Fewer? Use radio buttons. They're lonely.
 * - **Single selection** - Need multiple? Check out our multi-select variant.
 * - **Known, finite options** - Don't use a select for "enter your country" with 195 options.
 *   Actually, do. It's your funeral.
 *
 * ## Features
 *
 * - **Native select element** - Screen readers love it, browsers know it
 * - **Custom styling** - Looks good without the native browser chrome
 * - **Disabled options** - "You can't have the lobster, it's market price"
 * - **Option groups** - Organize your choices like a civilized person
 * - **Multiple selection** - When one just isn't enough
 */
const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The dropdown selector. Built on HeadlessUI's native select wrapper for proper accessibility and styling.

Perfect for country pickers nobody scrolls through, font selectors in WYSIWYG editors, and any situation where you want users to feel like they have a choice (while secretly limiting their options).
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Prevents interaction. The "this feature is coming soon" of dropdowns.',
    },
    multiple: {
      control: 'boolean',
      description: 'Allow multiple selections. Turns the dropdown into a listbox.',
    },
    required: {
      control: 'boolean',
      description: 'Makes the field required. Because optional fields are for cowards.',
    },
    'aria-label': {
      control: 'text',
      description: 'Accessible label when no visible label exists.',
    },
  },
  decorators: [
    (Story) => (
      <div className="min-w-[250px]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// BASIC EXAMPLES
// =============================================================================

/**
 * The default select. A dropdown in its natural habitat.
 * Click it, make a choice, feel empowered.
 */
export const Default: Story = {
  render: (args) => (
    <Select {...args} aria-label="Select an option">
      <option value="">Select an option...</option>
      <option value="chocolate">Chocolate</option>
      <option value="vanilla">Vanilla</option>
      <option value="strawberry">Strawberry</option>
    </Select>
  ),
}

/**
 * A select with a placeholder. The "pick something, anything" state.
 *
 * The first option acts as the placeholder. It's a convention as old as
 * HTML itself, and we're not about to fight tradition.
 */
export const WithPlaceholder: Story = {
  render: () => (
    <Select aria-label="Choose your poison">
      <option value="">Choose your poison...</option>
      <option value="coffee">Coffee</option>
      <option value="tea">Tea</option>
      <option value="energy-drink">Energy Drink (for the brave)</option>
    </Select>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The first option with an empty value serves as the placeholder. Classic HTML, still works great.',
      },
    },
  },
}

/**
 * A select with a pre-selected value. Someone already made the choice for you.
 * Probably the product team.
 */
export const WithDefaultValue: Story = {
  render: () => (
    <Select defaultValue="medium" aria-label="Spice level">
      <option value="mild">Mild (training wheels)</option>
      <option value="medium">Medium (the safe choice)</option>
      <option value="hot">Hot (living dangerously)</option>
      <option value="extreme">Extreme (sign this waiver first)</option>
    </Select>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Use `defaultValue` to pre-select an option. The sensible default is usually in the middle.',
      },
    },
  },
}

// =============================================================================
// DISABLED STATES
// =============================================================================

/**
 * A disabled select. Look, but don't touch.
 * The options are right there, taunting you, forever out of reach.
 */
export const Disabled: Story = {
  render: () => (
    <Select disabled aria-label="Disabled dropdown">
      <option value="">Can't touch this...</option>
      <option value="option1">Option 1</option>
      <option value="option2">Option 2</option>
    </Select>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Disabled selects get reduced opacity. They\'re visible but unreachable, like a cookie jar on a high shelf.',
      },
    },
  },
}

/**
 * A select with some disabled options. "The salmon is off tonight."
 */
export const DisabledOptions: Story = {
  render: () => (
    <Select aria-label="Menu selection">
      <option value="">What would you like?</option>
      <option value="burger">Burger ($12)</option>
      <option value="pizza">Pizza ($15)</option>
      <option value="lobster" disabled>Lobster (Market Price — sold out)</option>
      <option value="salad">Salad ($8)</option>
      <option value="steak" disabled>Steak (Reserved for VIPs)</option>
    </Select>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Individual options can be disabled. Perfect for "out of stock" items or premium features you\'re upselling.',
      },
    },
  },
}

/**
 * Disabled select with a value already selected.
 * "This decision has been made for you by management."
 */
export const DisabledWithValue: Story = {
  render: () => (
    <Select disabled defaultValue="enterprise" aria-label="Subscription plan">
      <option value="free">Free Tier</option>
      <option value="pro">Pro ($9/mo)</option>
      <option value="enterprise">Enterprise (Contact Sales)</option>
    </Select>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A disabled select with a pre-selected value. The user can see what was chosen but can\'t change it.',
      },
    },
  },
}

// =============================================================================
// WITH LABELS AND DESCRIPTIONS
// =============================================================================

/**
 * Select with a proper label. They're better together, like peanut butter and jelly.
 *
 * Always use a Field wrapper for proper label association.
 */
export const WithLabel: Story = {
  render: () => (
    <Field>
      <Label>Preferred cooking method</Label>
      <Select>
        <option value="">Select a method...</option>
        <option value="baking">Baking</option>
        <option value="grilling">Grilling</option>
        <option value="sauteing">Sautéing</option>
        <option value="frying">Deep Frying (no judgment)</option>
      </Select>
    </Field>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Use Field + Label for proper accessibility. Clicking the label focuses the select.',
      },
    },
  },
}

/**
 * Select with label and description.
 * For when you need to explain why this matters.
 */
export const WithLabelAndDescription: Story = {
  render: () => (
    <Field>
      <Label>Skill level</Label>
      <Description>This helps us recommend appropriate recipes for you.</Description>
      <Select>
        <option value="">How comfortable are you in the kitchen?</option>
        <option value="beginner">Beginner (I burn water)</option>
        <option value="intermediate">Intermediate (I can follow a recipe)</option>
        <option value="advanced">Advanced (I freestyle)</option>
        <option value="professional">Professional (I judge others)</option>
      </Select>
    </Field>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Add a Description for helpful context. It appears between the label and the select.',
      },
    },
  },
}

// =============================================================================
// ERROR STATES
// =============================================================================

/**
 * Select with an error state. Something went wrong.
 * Maybe they didn't pick anything. Maybe they picked wrong. Who knows?
 */
export const WithError: Story = {
  render: () => (
    <Field>
      <Label>Dietary restrictions</Label>
      <Select data-invalid>
        <option value="">Please select...</option>
        <option value="none">None</option>
        <option value="vegetarian">Vegetarian</option>
        <option value="vegan">Vegan</option>
        <option value="gluten-free">Gluten-free</option>
      </Select>
      <ErrorMessage>Please select a dietary restriction to continue.</ErrorMessage>
    </Field>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Use `data-invalid` attribute to show error styling. Pair with ErrorMessage for context.',
      },
    },
  },
}

/**
 * Error state with a value selected but still invalid.
 * "You picked, but you picked wrong."
 */
export const WithErrorAndValue: Story = {
  render: () => (
    <Field>
      <Label>Serving size</Label>
      <Description>How many people are you cooking for?</Description>
      <Select data-invalid defaultValue="100">
        <option value="">Select serving size...</option>
        <option value="1">1 person</option>
        <option value="2">2 people</option>
        <option value="4">4 people</option>
        <option value="6">6 people</option>
        <option value="100">100 people</option>
      </Select>
      <ErrorMessage>We don't have enough ingredients for 100 people. Maybe try a caterer?</ErrorMessage>
    </Field>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Validation can fail even with a value. Maybe it\'s out of range, maybe it\'s business logic.',
      },
    },
  },
}

// =============================================================================
// OPTION GROUPS
// =============================================================================

/**
 * Options organized into groups. Because organization is its own reward.
 *
 * Use `<optgroup>` to create visual and semantic groupings.
 */
export const WithOptionGroups: Story = {
  render: () => (
    <Field>
      <Label>Select an ingredient</Label>
      <Select>
        <option value="">Choose an ingredient...</option>
        <optgroup label="Proteins">
          <option value="chicken">Chicken</option>
          <option value="beef">Beef</option>
          <option value="tofu">Tofu</option>
          <option value="fish">Fish</option>
        </optgroup>
        <optgroup label="Vegetables">
          <option value="broccoli">Broccoli</option>
          <option value="carrots">Carrots</option>
          <option value="spinach">Spinach</option>
        </optgroup>
        <optgroup label="Carbs">
          <option value="rice">Rice</option>
          <option value="pasta">Pasta</option>
          <option value="bread">Bread</option>
        </optgroup>
      </Select>
    </Field>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Use `<optgroup>` for categorized options. The label appears bold and non-selectable.',
      },
    },
  },
}

/**
 * Option groups with some disabled options within.
 * "We have these categories, but not everything is available."
 */
export const GroupsWithDisabledOptions: Story = {
  render: () => (
    <Field>
      <Label>Choose your protein</Label>
      <Description>Some options are currently unavailable.</Description>
      <Select>
        <option value="">Select protein...</option>
        <optgroup label="Land">
          <option value="chicken">Chicken</option>
          <option value="beef">Beef</option>
          <option value="lamb" disabled>Lamb (out of season)</option>
        </optgroup>
        <optgroup label="Sea">
          <option value="salmon">Salmon</option>
          <option value="tuna" disabled>Tuna (sustainable sourcing issue)</option>
          <option value="shrimp">Shrimp</option>
        </optgroup>
        <optgroup label="Plant-based">
          <option value="tofu">Tofu</option>
          <option value="tempeh">Tempeh</option>
          <option value="seitan">Seitan</option>
        </optgroup>
      </Select>
    </Field>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Mix disabled options within groups. Great for availability indicators.',
      },
    },
  },
}

// =============================================================================
// MULTIPLE SELECT
// =============================================================================

/**
 * Multiple selection mode. When one option just won't cut it.
 *
 * This transforms the select into a listbox. Hold Ctrl/Cmd to select multiple.
 */
export const MultipleSelect: Story = {
  render: () => (
    <Field>
      <Label>Favorite cuisines</Label>
      <Description>Hold Ctrl/Cmd to select multiple. Or just click around. We're not your mom.</Description>
      <Select multiple className="h-32">
        <option value="italian">Italian</option>
        <option value="mexican">Mexican</option>
        <option value="japanese">Japanese</option>
        <option value="indian">Indian</option>
        <option value="thai">Thai</option>
        <option value="french">French</option>
        <option value="american">American</option>
      </Select>
    </Field>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Add `multiple` prop to allow multiple selections. The chevron indicator disappears in this mode.',
      },
    },
  },
}

/**
 * Multiple select with pre-selected values.
 * Someone already has opinions about your preferences.
 */
export const MultipleWithDefaults: Story = {
  render: () => (
    <Field>
      <Label>Allergens to avoid</Label>
      <Description>Based on your profile, we've pre-selected some common ones.</Description>
      <Select multiple defaultValue={['gluten', 'dairy']} className="h-32">
        <option value="gluten">Gluten</option>
        <option value="dairy">Dairy</option>
        <option value="nuts">Tree Nuts</option>
        <option value="peanuts">Peanuts</option>
        <option value="shellfish">Shellfish</option>
        <option value="eggs">Eggs</option>
        <option value="soy">Soy</option>
      </Select>
    </Field>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Pass an array to `defaultValue` for pre-selected options in multiple mode.',
      },
    },
  },
}

// =============================================================================
// REAL-WORLD EXAMPLES
// =============================================================================

/**
 * A recipe filter form. The kind you see on every food website.
 */
export const RecipeFilterForm: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <Field>
        <Label>Cuisine Type</Label>
        <Select>
          <option value="">All cuisines</option>
          <optgroup label="Asian">
            <option value="chinese">Chinese</option>
            <option value="japanese">Japanese</option>
            <option value="korean">Korean</option>
            <option value="thai">Thai</option>
            <option value="indian">Indian</option>
          </optgroup>
          <optgroup label="European">
            <option value="italian">Italian</option>
            <option value="french">French</option>
            <option value="spanish">Spanish</option>
            <option value="greek">Greek</option>
          </optgroup>
          <optgroup label="Americas">
            <option value="mexican">Mexican</option>
            <option value="american">American</option>
            <option value="brazilian">Brazilian</option>
          </optgroup>
        </Select>
      </Field>

      <Field>
        <Label>Difficulty</Label>
        <Select>
          <option value="">Any difficulty</option>
          <option value="easy">Easy (under 30 min)</option>
          <option value="medium">Medium (30-60 min)</option>
          <option value="hard">Hard (60+ min)</option>
          <option value="expert">Expert (bring your A-game)</option>
        </Select>
      </Field>

      <Field>
        <Label>Dietary</Label>
        <Select>
          <option value="">No restrictions</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="vegan">Vegan</option>
          <option value="gluten-free">Gluten-free</option>
          <option value="dairy-free">Dairy-free</option>
          <option value="keto">Keto</option>
          <option value="paleo">Paleo</option>
        </Select>
      </Field>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A realistic filter form. Multiple selects working together to narrow down search results.',
      },
    },
  },
}

/**
 * A measurement converter. Because America still uses cups and the rest
 * of the world uses grams like civilized people.
 */
export const MeasurementConverter: Story = {
  render: () => (
    <div className="w-72 space-y-4">
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Field>
            <Label>From</Label>
            <Select defaultValue="cups">
              <optgroup label="Volume">
                <option value="cups">Cups</option>
                <option value="tablespoons">Tablespoons</option>
                <option value="teaspoons">Teaspoons</option>
                <option value="ml">Milliliters</option>
                <option value="liters">Liters</option>
              </optgroup>
              <optgroup label="Weight">
                <option value="grams">Grams</option>
                <option value="ounces">Ounces</option>
                <option value="pounds">Pounds</option>
                <option value="kg">Kilograms</option>
              </optgroup>
            </Select>
          </Field>
        </div>
        <span className="pb-2 text-zinc-500">→</span>
        <div className="flex-1">
          <Field>
            <Label>To</Label>
            <Select defaultValue="grams">
              <optgroup label="Volume">
                <option value="cups">Cups</option>
                <option value="tablespoons">Tablespoons</option>
                <option value="teaspoons">Teaspoons</option>
                <option value="ml">Milliliters</option>
                <option value="liters">Liters</option>
              </optgroup>
              <optgroup label="Weight">
                <option value="grams">Grams</option>
                <option value="ounces">Ounces</option>
                <option value="pounds">Pounds</option>
                <option value="kg">Kilograms</option>
              </optgroup>
            </Select>
          </Field>
        </div>
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        1 cup = 236.59 grams (approximately, depending on ingredient)
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Unit conversion selects. A common pattern in recipe apps. Note how optgroups help organize the units.',
      },
    },
  },
}

/**
 * A timezone selector. The bane of every developer's existence.
 */
export const TimezoneSelector: Story = {
  render: () => (
    <Field className="w-80">
      <Label>Your timezone</Label>
      <Description>We'll adjust recipe timers and meal planning accordingly.</Description>
      <Select defaultValue="america_new_york">
        <optgroup label="Americas">
          <option value="america_new_york">Eastern Time (ET)</option>
          <option value="america_chicago">Central Time (CT)</option>
          <option value="america_denver">Mountain Time (MT)</option>
          <option value="america_los_angeles">Pacific Time (PT)</option>
          <option value="america_anchorage">Alaska Time (AKT)</option>
          <option value="pacific_honolulu">Hawaii Time (HT)</option>
        </optgroup>
        <optgroup label="Europe">
          <option value="europe_london">London (GMT/BST)</option>
          <option value="europe_paris">Paris (CET/CEST)</option>
          <option value="europe_berlin">Berlin (CET/CEST)</option>
        </optgroup>
        <optgroup label="Asia">
          <option value="asia_tokyo">Tokyo (JST)</option>
          <option value="asia_shanghai">Shanghai (CST)</option>
          <option value="asia_kolkata">Mumbai (IST)</option>
        </optgroup>
        <optgroup label="Other">
          <option value="utc">UTC</option>
        </optgroup>
      </Select>
    </Field>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A timezone picker. One of the most dreaded dropdowns in existence, tamed with optgroups.',
      },
    },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Testing that we can open the dropdown and select an option.
 * The fundamental select interaction.
 */
export const SelectAnOption: Story = {
  render: (args) => (
    <Select {...args} aria-label="Test select">
      <option value="">Select something...</option>
      <option value="first">First Option</option>
      <option value="second">Second Option</option>
      <option value="third">Third Option</option>
    </Select>
  ),
  args: {
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const select = canvas.getByRole('combobox')

    // Initially shows placeholder
    await expect(select).toHaveValue('')

    // Select an option
    await userEvent.selectOptions(select, 'second')

    // Verify selection
    await expect(select).toHaveValue('second')
    await expect(args.onChange).toHaveBeenCalled()
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic interaction test. Open dropdown, select option, verify selection.',
      },
    },
  },
}

/**
 * Testing keyboard navigation. Tab to focus, arrow keys to navigate.
 */
export const KeyboardNavigation: Story = {
  render: (args) => (
    <Select {...args} aria-label="Keyboard test">
      <option value="">Pick one...</option>
      <option value="apple">Apple</option>
      <option value="banana">Banana</option>
      <option value="cherry">Cherry</option>
    </Select>
  ),
  args: {
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const select = canvas.getByRole('combobox')

    // Tab to focus the select
    await userEvent.tab()
    await expect(select).toHaveFocus()

    // Arrow down should open and navigate (behavior varies by browser)
    // We'll just verify focus is maintained
    await userEvent.keyboard('{ArrowDown}')

    // Select should still have focus
    await expect(select).toHaveFocus()
  },
  parameters: {
    docs: {
      description: {
        story: 'Keyboard accessibility test. Tab to focus, arrow keys to navigate options.',
      },
    },
  },
}

/**
 * Testing that disabled selects cannot be interacted with.
 */
export const DisabledInteraction: Story = {
  render: (args) => (
    <Select {...args} disabled aria-label="Disabled test">
      <option value="">Can't select me...</option>
      <option value="option1">Option 1</option>
      <option value="option2">Option 2</option>
    </Select>
  ),
  args: {
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const select = canvas.getByRole('combobox')

    // Verify it's disabled
    await expect(select).toBeDisabled()

    // Try to select an option (should do nothing)
    await userEvent.selectOptions(select, 'option1').catch(() => {
      // Expected to fail or do nothing for disabled select
    })

    // onChange should not have been called
    await expect(args.onChange).not.toHaveBeenCalled()
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled selects ignore all interaction attempts.',
      },
    },
  },
}

/**
 * Testing selection change from one option to another.
 */
export const ChangeSelection: Story = {
  render: (args) => (
    <Select {...args} aria-label="Change test">
      <option value="">Initial...</option>
      <option value="first">First</option>
      <option value="second">Second</option>
      <option value="third">Third</option>
    </Select>
  ),
  args: {
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const select = canvas.getByRole('combobox')

    // Select first option
    await userEvent.selectOptions(select, 'first')
    await expect(select).toHaveValue('first')

    // Change to second option
    await userEvent.selectOptions(select, 'second')
    await expect(select).toHaveValue('second')

    // Change to third option
    await userEvent.selectOptions(select, 'third')
    await expect(select).toHaveValue('third')

    // onChange should have been called 3 times
    await expect(args.onChange).toHaveBeenCalledTimes(3)
  },
  parameters: {
    docs: {
      description: {
        story: 'Test changing selection between different options.',
      },
    },
  },
}

/**
 * Testing the focus ring appears correctly.
 */
export const FocusState: Story = {
  render: () => (
    <Select aria-label="Focus test">
      <option value="">Focus me...</option>
      <option value="option1">Option 1</option>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const select = canvas.getByRole('combobox')

    // Tab to focus
    await userEvent.tab()

    // Verify focus
    await expect(select).toHaveFocus()
  },
  parameters: {
    docs: {
      description: {
        story: 'Tab to see the focus ring. Accessibility matters!',
      },
    },
  },
}

/**
 * Testing with a label click focuses the select.
 */
export const LabelClickFocus: Story = {
  render: (args) => (
    <Field>
      <Label>Click this label</Label>
      <Select {...args}>
        <option value="">Pick something...</option>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
      </Select>
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const label = canvas.getByText('Click this label')
    const select = canvas.getByRole('combobox')

    // Click the label
    await userEvent.click(label)

    // Select should be focused
    await expect(select).toHaveFocus()
  },
  parameters: {
    docs: {
      description: {
        story: 'Clicking the label focuses the select. That\'s what labels are for!',
      },
    },
  },
}

/**
 * Testing that we cannot select disabled options.
 */
export const DisabledOptionInteraction: Story = {
  render: (args) => (
    <Select {...args} aria-label="Disabled option test">
      <option value="">Choose wisely...</option>
      <option value="available">Available Option</option>
      <option value="unavailable" disabled>Unavailable Option</option>
      <option value="also-available">Also Available</option>
    </Select>
  ),
  args: {
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const select = canvas.getByRole('combobox')

    // Select an available option
    await userEvent.selectOptions(select, 'available')
    await expect(select).toHaveValue('available')

    // Try to select disabled option - browsers prevent this natively
    // The select will just not change
    await userEvent.selectOptions(select, 'unavailable').catch(() => {
      // Expected to fail
    })

    // Value should still be 'available' (browsers don't allow selecting disabled options)
    await expect(select).toHaveValue('available')

    // Can still select other available options
    await userEvent.selectOptions(select, 'also-available')
    await expect(select).toHaveValue('also-available')
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled options cannot be selected. The browser enforces this natively.',
      },
    },
  },
}

/**
 * Testing multiple select - selecting and deselecting options.
 */
export const MultipleSelectInteraction: Story = {
  render: (args) => (
    <Select {...args} multiple className="h-28" aria-label="Multi-select test">
      <option value="a">Option A</option>
      <option value="b">Option B</option>
      <option value="c">Option C</option>
      <option value="d">Option D</option>
    </Select>
  ),
  args: {
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const select = canvas.getByRole('listbox')

    // Select multiple options (Ctrl/Cmd click simulation)
    await userEvent.selectOptions(select, ['a', 'c'])

    // Verify multiple selections
    const options = canvas.getAllByRole('option') as HTMLOptionElement[]
    await expect(options.find(o => o.value === 'a')?.selected).toBe(true)
    await expect(options.find(o => o.value === 'c')?.selected).toBe(true)
    await expect(options.find(o => o.value === 'b')?.selected).toBe(false)

    await expect(args.onChange).toHaveBeenCalled()
  },
  parameters: {
    docs: {
      description: {
        story: 'Multiple select allows selecting several options at once.',
      },
    },
  },
}
