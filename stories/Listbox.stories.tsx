import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within, waitFor } from 'storybook/test'
import { useState } from 'react'
import { Listbox, ListboxOption, ListboxLabel, ListboxDescription } from '../app/components/ui/listbox'
import { Field, Label, Description, ErrorMessage } from '../app/components/ui/fieldset'

/**
 * # Listbox
 *
 * The fancy dropdown. The "I'm better than a regular select" of form inputs.
 * While the humble `<select>` element does its job, sometimes you need... *more*.
 *
 * The Listbox is like Select's cooler cousin who studied abroad and came back
 * with refined taste. It supports custom styling per option, rich content like
 * descriptions and icons, and — here's the kicker — **multi-select mode** that
 * actually looks good.
 *
 * ## Listbox vs Select: A Philosophical Debate
 *
 * Use **Select** when:
 * - You need native form submission
 * - You want the browser's built-in accessibility handling
 * - Your options are simple text and you don't want to overthink it
 *
 * Use **Listbox** when:
 * - You need multi-select with visual checkmarks
 * - Each option needs descriptions, icons, or avatars
 * - You want that smooth animated dropdown feel
 * - You're building something users will actually enjoy using
 *
 * ## The stepOutputUse Connection
 *
 * This is the component we modified for stepOutputUse. Yes, *that* one.
 * It's been battle-tested against real recipe data where ingredients
 * need to flow between steps like a well-choreographed cooking show.
 * Trust us, it's seen things.
 *
 * ## Features
 *
 * - **Single or multi-select** - Pick one, pick many, pick none (you monster)
 * - **Rich option content** - Labels, descriptions, icons, avatars. Go wild.
 * - **Keyboard navigation** - Arrow keys, type-ahead, Enter to select
 * - **Controlled or uncontrolled** - Your state management, your rules
 * - **Animated transitions** - Smooth like butter (the good European kind)
 */
const meta: Meta<typeof Listbox> = {
  title: 'UI/Listbox',
  component: Listbox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The fancy dropdown. Built on HeadlessUI with support for rich option content, multi-select mode, and smooth animations.

Perfect for ingredient pickers, recipe step outputs, and any scenario where you need more than a basic select can offer. This is the component we battle-tested for stepOutputUse — it's seen some things.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text when nothing is selected. The "please pick something" state.',
    },
    multiple: {
      control: 'boolean',
      description: 'Enable multi-select mode. Turns the dropdown into a checklist.',
    },
    disabled: {
      control: 'boolean',
      description: 'Prevents interaction. The dropdown is there, just... out of reach.',
    },
    'aria-label': {
      control: 'text',
      description: 'Accessible label when no visible label exists.',
    },
  },
  decorators: [
    (Story) => (
      <div className="min-w-[280px]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

// Sample data for stories
const cuisines = [
  { id: 'italian', name: 'Italian', description: 'Pasta, pizza, and perfection' },
  { id: 'japanese', name: 'Japanese', description: 'Precision meets umami' },
  { id: 'mexican', name: 'Mexican', description: 'Bold flavors, warm hearts' },
  { id: 'indian', name: 'Indian', description: 'Spice is the variety of life' },
  { id: 'french', name: 'French', description: 'Butter makes everything better' },
]

const ingredients = [
  { id: 'flour', name: 'All-Purpose Flour', amount: '2 cups' },
  { id: 'sugar', name: 'Granulated Sugar', amount: '1 cup' },
  { id: 'butter', name: 'Unsalted Butter', amount: '½ cup, softened' },
  { id: 'eggs', name: 'Large Eggs', amount: '2' },
  { id: 'vanilla', name: 'Vanilla Extract', amount: '1 tsp' },
  { id: 'salt', name: 'Kosher Salt', amount: '½ tsp' },
]

const stepOutputs = [
  { id: 'dough', name: 'Cookie Dough', fromStep: 'Step 3: Mix' },
  { id: 'dry-mix', name: 'Dry Ingredient Mix', fromStep: 'Step 1: Combine' },
  { id: 'wet-mix', name: 'Wet Ingredient Mix', fromStep: 'Step 2: Cream' },
  { id: 'batter', name: 'Final Batter', fromStep: 'Step 4: Fold' },
]

// =============================================================================
// BASIC EXAMPLES
// =============================================================================

/**
 * The default Listbox. A dropdown in designer clothing.
 * Click to reveal your options, pick one, feel fancy.
 */
export const Default: Story = {
  render: () => {
    const [selected, setSelected] = useState(cuisines[0])
    return (
      <Listbox value={selected} onChange={setSelected} aria-label="Select cuisine">
        {cuisines.map((cuisine) => (
          <ListboxOption key={cuisine.id} value={cuisine}>
            <ListboxLabel>{cuisine.name}</ListboxLabel>
          </ListboxOption>
        ))}
      </Listbox>
    )
  },
}

/**
 * A Listbox with a placeholder. The "make a choice" state.
 *
 * Unlike native selects, Listbox placeholder is a proper prop,
 * not a fake first option. We're civilized here.
 */
export const WithPlaceholder: Story = {
  render: () => {
    const [selected, setSelected] = useState<(typeof cuisines)[0] | null>(null)
    return (
      <Listbox
        value={selected}
        onChange={setSelected}
        placeholder="Choose a cuisine..."
        aria-label="Select cuisine"
      >
        {cuisines.map((cuisine) => (
          <ListboxOption key={cuisine.id} value={cuisine}>
            <ListboxLabel>{cuisine.name}</ListboxLabel>
          </ListboxOption>
        ))}
      </Listbox>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'The placeholder prop shows when nothing is selected. Click to see the options. Or don\'t. We\'re not your mom.',
      },
    },
  },
}

/**
 * Options with descriptions. Because sometimes a name isn't enough.
 *
 * Use ListboxDescription to add context to each option.
 * It appears smaller and muted, providing helpful hints.
 */
export const WithDescriptions: Story = {
  render: () => {
    const [selected, setSelected] = useState(cuisines[0])
    return (
      <Listbox value={selected} onChange={setSelected} aria-label="Select cuisine">
        {cuisines.map((cuisine) => (
          <ListboxOption key={cuisine.id} value={cuisine}>
            <ListboxLabel>{cuisine.name}</ListboxLabel>
            <ListboxDescription>{cuisine.description}</ListboxDescription>
          </ListboxOption>
        ))}
      </Listbox>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'ListboxDescription adds secondary text to options. Great for providing context without cluttering the main label.',
      },
    },
  },
}

// =============================================================================
// DISABLED STATES
// =============================================================================

/**
 * A disabled Listbox. All dressed up with nowhere to go.
 *
 * The options are there, the styling is nice, but you can't click it.
 * It's like window shopping for dropdowns.
 */
export const Disabled: Story = {
  render: () => {
    const [selected, setSelected] = useState(cuisines[0])
    return (
      <Listbox value={selected} onChange={setSelected} disabled aria-label="Disabled listbox">
        {cuisines.map((cuisine) => (
          <ListboxOption key={cuisine.id} value={cuisine}>
            <ListboxLabel>{cuisine.name}</ListboxLabel>
          </ListboxOption>
        ))}
      </Listbox>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "Disabled Listboxes get reduced opacity. They're visible but unreachable, like the last cookie on a high shelf.",
      },
    },
  },
}

/**
 * Disabled with placeholder. Maximum taunting potential.
 */
export const DisabledWithPlaceholder: Story = {
  render: () => {
    return (
      <Listbox
        value={null}
        onChange={() => {}}
        disabled
        placeholder="You can't select anything..."
        aria-label="Disabled listbox"
      >
        {cuisines.map((cuisine) => (
          <ListboxOption key={cuisine.id} value={cuisine}>
            <ListboxLabel>{cuisine.name}</ListboxLabel>
          </ListboxOption>
        ))}
      </Listbox>
    )
  },
}

/**
 * Individual disabled options. "The lobster is market price."
 *
 * Some options can be disabled while others remain selectable.
 * Use this for premium features, out-of-stock items, or
 * things that are "coming soon" (we've all been there).
 */
export const DisabledOptions: Story = {
  render: () => {
    const [selected, setSelected] = useState<(typeof cuisines)[0] | null>(null)
    return (
      <Listbox
        value={selected}
        onChange={setSelected}
        placeholder="Select a cuisine..."
        aria-label="Select cuisine"
      >
        {cuisines.map((cuisine, index) => (
          <ListboxOption key={cuisine.id} value={cuisine} disabled={index === 2 || index === 4}>
            <ListboxLabel>
              {cuisine.name}
              {(index === 2 || index === 4) && ' (coming soon)'}
            </ListboxLabel>
          </ListboxOption>
        ))}
      </Listbox>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'Individual options can be disabled. They show in the list but can\'t be selected. Great for "out of stock" vibes.',
      },
    },
  },
}

// =============================================================================
// WITH LABELS AND DESCRIPTIONS
// =============================================================================

/**
 * Listbox with a proper label. Accessibility approved.
 *
 * Wrap in a Field component for proper label association.
 * Your screen reader users will thank you.
 */
export const WithLabel: Story = {
  render: () => {
    const [selected, setSelected] = useState<(typeof cuisines)[0] | null>(null)
    return (
      <Field>
        <Label>Preferred cuisine</Label>
        <Listbox value={selected} onChange={setSelected} placeholder="Select a cuisine...">
          {cuisines.map((cuisine) => (
            <ListboxOption key={cuisine.id} value={cuisine}>
              <ListboxLabel>{cuisine.name}</ListboxLabel>
            </ListboxOption>
          ))}
        </Listbox>
      </Field>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Use Field + Label for proper accessibility. The label announces to screen readers what this dropdown is for.',
      },
    },
  },
}

/**
 * Listbox with label and description for extra context.
 */
export const WithLabelAndDescription: Story = {
  render: () => {
    const [selected, setSelected] = useState<(typeof cuisines)[0] | null>(null)
    return (
      <Field>
        <Label>Preferred cuisine</Label>
        <Description>We'll recommend recipes based on your selection.</Description>
        <Listbox value={selected} onChange={setSelected} placeholder="Select a cuisine...">
          {cuisines.map((cuisine) => (
            <ListboxOption key={cuisine.id} value={cuisine}>
              <ListboxLabel>{cuisine.name}</ListboxLabel>
              <ListboxDescription>{cuisine.description}</ListboxDescription>
            </ListboxOption>
          ))}
        </Listbox>
      </Field>
    )
  },
}

// =============================================================================
// ERROR STATES
// =============================================================================

/**
 * Listbox with an error state. Something went wrong, or nothing was selected.
 */
export const WithError: Story = {
  render: () => {
    const [selected, setSelected] = useState<(typeof cuisines)[0] | null>(null)
    return (
      <Field>
        <Label>Preferred cuisine</Label>
        <Listbox
          value={selected}
          onChange={setSelected}
          placeholder="Select a cuisine..."
          data-invalid
        >
          {cuisines.map((cuisine) => (
            <ListboxOption key={cuisine.id} value={cuisine}>
              <ListboxLabel>{cuisine.name}</ListboxLabel>
            </ListboxOption>
          ))}
        </Listbox>
        <ErrorMessage>Please select a cuisine to continue.</ErrorMessage>
      </Field>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Use `data-invalid` attribute for error styling. Pair with ErrorMessage for context.',
      },
    },
  },
}

// =============================================================================
// MULTI-SELECT MODE
// =============================================================================

/**
 * ## Multi-Select Mode
 *
 * This is where Listbox really shines. Multi-select that actually looks good.
 * Checkmarks appear next to selected items, and the button shows all selections.
 *
 * This is the mode we use for stepOutputUse. It's been through the fire.
 */
export const MultiSelect: Story = {
  render: () => {
    const [selected, setSelected] = useState<typeof cuisines>([])
    return (
      <Listbox
        value={selected}
        onChange={setSelected}
        multiple
        placeholder="Select cuisines..."
        aria-label="Select cuisines"
      >
        {cuisines.map((cuisine) => (
          <ListboxOption key={cuisine.id} value={cuisine}>
            <ListboxLabel>{cuisine.name}</ListboxLabel>
          </ListboxOption>
        ))}
      </Listbox>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'Add `multiple` prop to enable multi-select mode. Checkmarks indicate selected options. Click an option again to deselect.',
      },
    },
  },
}

/**
 * Multi-select with pre-selected values.
 * Someone already made some choices for you. Classic onboarding.
 */
export const MultiSelectWithDefaults: Story = {
  render: () => {
    const [selected, setSelected] = useState([cuisines[0], cuisines[2]])
    return (
      <Listbox
        value={selected}
        onChange={setSelected}
        multiple
        placeholder="Select cuisines..."
        aria-label="Select cuisines"
      >
        {cuisines.map((cuisine) => (
          <ListboxOption key={cuisine.id} value={cuisine}>
            <ListboxLabel>{cuisine.name}</ListboxLabel>
          </ListboxOption>
        ))}
      </Listbox>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Pass an array as the initial value to pre-select options. Users can modify from there.',
      },
    },
  },
}

/**
 * Multi-select with descriptions. Rich content in every option.
 */
export const MultiSelectWithDescriptions: Story = {
  render: () => {
    const [selected, setSelected] = useState<typeof cuisines>([])
    return (
      <Field>
        <Label>Favorite cuisines</Label>
        <Description>Select all that apply. We won't judge.</Description>
        <Listbox value={selected} onChange={setSelected} multiple placeholder="Select cuisines...">
          {cuisines.map((cuisine) => (
            <ListboxOption key={cuisine.id} value={cuisine}>
              <ListboxLabel>{cuisine.name}</ListboxLabel>
              <ListboxDescription>{cuisine.description}</ListboxDescription>
            </ListboxOption>
          ))}
        </Listbox>
      </Field>
    )
  },
}

/**
 * Multi-select with some disabled options.
 * "You can have any topping except pineapple."
 */
export const MultiSelectDisabledOptions: Story = {
  render: () => {
    const [selected, setSelected] = useState<typeof cuisines>([])
    return (
      <Listbox
        value={selected}
        onChange={setSelected}
        multiple
        placeholder="Select cuisines..."
        aria-label="Select cuisines"
      >
        {cuisines.map((cuisine, index) => (
          <ListboxOption key={cuisine.id} value={cuisine} disabled={index === 3}>
            <ListboxLabel>
              {cuisine.name}
              {index === 3 && ' (no ingredients available)'}
            </ListboxLabel>
          </ListboxOption>
        ))}
      </Listbox>
    )
  },
}

// =============================================================================
// REAL-WORLD EXAMPLES: RECIPE CONTEXT
// =============================================================================

/**
 * ## Ingredient Picker
 *
 * A realistic ingredient selection interface. Each option shows
 * the ingredient name and the amount needed. This pattern is used
 * throughout the recipe editor.
 */
export const IngredientPicker: Story = {
  render: () => {
    const [selected, setSelected] = useState<typeof ingredients>([])
    return (
      <Field>
        <Label>Select ingredients to add</Label>
        <Description>Choose from the recipe's ingredient list.</Description>
        <Listbox value={selected} onChange={setSelected} multiple placeholder="Choose ingredients...">
          {ingredients.map((ingredient) => (
            <ListboxOption key={ingredient.id} value={ingredient}>
              <ListboxLabel>{ingredient.name}</ListboxLabel>
              <ListboxDescription>{ingredient.amount}</ListboxDescription>
            </ListboxOption>
          ))}
        </Listbox>
      </Field>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'An ingredient picker showing name and amount. This is the kind of rich content that makes Listbox worth using over a plain select.',
      },
    },
  },
}

/**
 * ## Step Output Selector (The Famous One)
 *
 * This is it. The component we modified for stepOutputUse.
 * It allows selecting outputs from previous recipe steps to use
 * as inputs in the current step. The descriptions show which
 * step produced each output.
 *
 * This pattern enables the flow: "use the dough from step 3"
 * in a way that's both user-friendly and data-driven.
 */
export const StepOutputSelector: Story = {
  render: () => {
    const [selected, setSelected] = useState<typeof stepOutputs>([])
    return (
      <Field>
        <Label>Use outputs from previous steps</Label>
        <Description>Select ingredients or preparations from earlier steps.</Description>
        <Listbox value={selected} onChange={setSelected} multiple placeholder="Select step outputs...">
          {stepOutputs.map((output) => (
            <ListboxOption key={output.id} value={output}>
              <ListboxLabel>{output.name}</ListboxLabel>
              <ListboxDescription>{output.fromStep}</ListboxDescription>
            </ListboxOption>
          ))}
        </Listbox>
      </Field>
    )
  },
  parameters: {
    docs: {
      description: {
        story: `
**This is the one.** The stepOutputUse selector that connects recipe steps together.

Each option shows what was produced and which step it came from. Multi-select allows a step to use multiple outputs from previous steps. It's like a directed acyclic graph, but for cookies.
        `,
      },
    },
  },
}

/**
 * Step output selector with pre-selected values.
 * When editing an existing recipe step.
 */
export const StepOutputSelectorWithValues: Story = {
  render: () => {
    const [selected, setSelected] = useState([stepOutputs[0], stepOutputs[2]])
    return (
      <Field>
        <Label>Use outputs from previous steps</Label>
        <Description>Currently using: Cookie Dough, Wet Ingredient Mix</Description>
        <Listbox value={selected} onChange={setSelected} multiple placeholder="Select step outputs...">
          {stepOutputs.map((output) => (
            <ListboxOption key={output.id} value={output}>
              <ListboxLabel>{output.name}</ListboxLabel>
              <ListboxDescription>{output.fromStep}</ListboxDescription>
            </ListboxOption>
          ))}
        </Listbox>
      </Field>
    )
  },
}

/**
 * ## Dietary Restriction Picker
 *
 * A multi-select for dietary restrictions. Each option has a description
 * explaining what it means. Because "plant-based" means different things
 * to different people.
 */
export const DietaryRestrictions: Story = {
  render: () => {
    const restrictions = [
      { id: 'vegetarian', name: 'Vegetarian', description: 'No meat or fish' },
      { id: 'vegan', name: 'Vegan', description: 'No animal products whatsoever' },
      { id: 'gluten-free', name: 'Gluten-Free', description: 'No wheat, barley, or rye' },
      { id: 'dairy-free', name: 'Dairy-Free', description: 'No milk, cheese, or butter' },
      { id: 'nut-free', name: 'Nut-Free', description: 'No tree nuts or peanuts' },
      { id: 'kosher', name: 'Kosher', description: 'Follows Jewish dietary laws' },
      { id: 'halal', name: 'Halal', description: 'Follows Islamic dietary laws' },
    ]
    const [selected, setSelected] = useState<typeof restrictions>([])
    return (
      <Field>
        <Label>Dietary restrictions</Label>
        <Description>We'll filter recipes accordingly.</Description>
        <Listbox value={selected} onChange={setSelected} multiple placeholder="Select restrictions...">
          {restrictions.map((restriction) => (
            <ListboxOption key={restriction.id} value={restriction}>
              <ListboxLabel>{restriction.name}</ListboxLabel>
              <ListboxDescription>{restriction.description}</ListboxDescription>
            </ListboxOption>
          ))}
        </Listbox>
      </Field>
    )
  },
}

/**
 * ## Recipe Tag Selector
 *
 * A single-select for categorizing recipes. Shows tag and description.
 */
export const RecipeTagSelector: Story = {
  render: () => {
    const tags = [
      { id: 'quick', name: 'Quick & Easy', description: 'Under 30 minutes' },
      { id: 'beginner', name: 'Beginner Friendly', description: 'Simple techniques only' },
      { id: 'meal-prep', name: 'Meal Prep', description: 'Makes great leftovers' },
      { id: 'special', name: 'Special Occasion', description: 'Worth the extra effort' },
      { id: 'comfort', name: 'Comfort Food', description: 'Warm hugs in food form' },
    ]
    const [selected, setSelected] = useState<(typeof tags)[0] | null>(null)
    return (
      <Field>
        <Label>Primary tag</Label>
        <Description>How would you categorize this recipe?</Description>
        <Listbox value={selected} onChange={setSelected} placeholder="Select a tag...">
          {tags.map((tag) => (
            <ListboxOption key={tag.id} value={tag}>
              <ListboxLabel>{tag.name}</ListboxLabel>
              <ListboxDescription>{tag.description}</ListboxDescription>
            </ListboxOption>
          ))}
        </Listbox>
      </Field>
    )
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Testing basic single-select behavior. Open, select, close.
 * The bread and butter of dropdown interactions.
 */
export const SingleSelectInteraction: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<(typeof cuisines)[0] | null>(null)
    const handleChange = (value: (typeof cuisines)[0] | null) => {
      setSelected(value)
      args.onChange?.(value)
    }
    return (
      <Listbox
        value={selected}
        onChange={handleChange}
        placeholder="Select a cuisine..."
        aria-label="Test listbox"
      >
        {cuisines.map((cuisine) => (
          <ListboxOption key={cuisine.id} value={cuisine}>
            <ListboxLabel>{cuisine.name}</ListboxLabel>
          </ListboxOption>
        ))}
      </Listbox>
    )
  },
  args: {
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    // Find and click the listbox button
    const button = canvas.getByRole('button')
    await expect(button).toHaveTextContent('Select a cuisine...')

    // Click to open
    await userEvent.click(button)

    // Wait for options to appear
    await waitFor(() => {
      expect(canvas.getByRole('listbox')).toBeInTheDocument()
    })

    // Find and click an option
    const options = canvas.getAllByRole('option')
    await userEvent.click(options[1]) // Click "Japanese"

    // Verify the button now shows the selected value
    await waitFor(() => {
      expect(button).toHaveTextContent('Japanese')
    })

    // Verify onChange was called
    await expect(args.onChange).toHaveBeenCalled()
  },
  parameters: {
    docs: {
      description: {
        story: 'Open the Interactions panel to watch the single-select flow in action.',
      },
    },
  },
}

/**
 * Testing multi-select behavior. Select multiple, verify checkmarks.
 */
export const MultiSelectInteraction: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<typeof cuisines>([])
    const handleChange = (value: typeof cuisines) => {
      setSelected(value)
      args.onChange?.(value)
    }
    return (
      <Listbox
        value={selected}
        onChange={handleChange}
        multiple
        placeholder="Select cuisines..."
        aria-label="Test multi-select"
      >
        {cuisines.map((cuisine) => (
          <ListboxOption key={cuisine.id} value={cuisine}>
            <ListboxLabel>{cuisine.name}</ListboxLabel>
          </ListboxOption>
        ))}
      </Listbox>
    )
  },
  args: {
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    const button = canvas.getByRole('button')
    await expect(button).toHaveTextContent('Select cuisines...')

    // Click to open
    await userEvent.click(button)

    // Wait for options to appear
    await waitFor(() => {
      expect(canvas.getByRole('listbox')).toBeInTheDocument()
    })

    // Select first option
    const options = canvas.getAllByRole('option')
    await userEvent.click(options[0]) // Click "Italian"

    // onChange should have been called with array containing Italian
    await expect(args.onChange).toHaveBeenCalled()

    // Dropdown should still be open in multi-select mode
    // Select another option
    await userEvent.click(options[2]) // Click "Mexican"

    // Should have been called again
    await expect(args.onChange).toHaveBeenCalledTimes(2)
  },
  parameters: {
    docs: {
      description: {
        story:
          'Multi-select keeps the dropdown open after each selection. Select multiple items without reopening.',
      },
    },
  },
}

/**
 * Testing keyboard navigation. Arrow keys, Enter, Escape.
 */
export const KeyboardNavigation: Story = {
  render: () => {
    const [selected, setSelected] = useState<(typeof cuisines)[0] | null>(null)
    return (
      <Listbox
        value={selected}
        onChange={setSelected}
        placeholder="Select a cuisine..."
        aria-label="Keyboard test"
      >
        {cuisines.map((cuisine) => (
          <ListboxOption key={cuisine.id} value={cuisine}>
            <ListboxLabel>{cuisine.name}</ListboxLabel>
          </ListboxOption>
        ))}
      </Listbox>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const button = canvas.getByRole('button')

    // Focus the button
    button.focus()
    await expect(button).toHaveFocus()

    // Press Enter to open
    await userEvent.keyboard('{Enter}')

    // Wait for listbox to appear
    await waitFor(() => {
      expect(canvas.getByRole('listbox')).toBeInTheDocument()
    })

    // Arrow down to navigate
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{ArrowDown}')

    // Press Enter to select
    await userEvent.keyboard('{Enter}')

    // Dropdown should close and show selection
    await waitFor(() => {
      expect(canvas.queryByRole('listbox')).not.toBeInTheDocument()
    })
  },
  parameters: {
    docs: {
      description: {
        story: 'Full keyboard navigation: Enter to open, Arrow keys to navigate, Enter to select, Escape to close.',
      },
    },
  },
}

/**
 * Testing disabled listbox doesn't respond to clicks.
 */
export const DisabledInteraction: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<(typeof cuisines)[0] | null>(null)
    return (
      <Listbox
        {...args}
        value={selected}
        onChange={setSelected}
        disabled
        placeholder="Can't touch this..."
        aria-label="Disabled test"
      >
        {cuisines.map((cuisine) => (
          <ListboxOption key={cuisine.id} value={cuisine}>
            <ListboxLabel>{cuisine.name}</ListboxLabel>
          </ListboxOption>
        ))}
      </Listbox>
    )
  },
  args: {
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    const button = canvas.getByRole('button')

    // Button should be disabled
    await expect(button).toHaveAttribute('data-disabled', '')

    // Click the button (should do nothing)
    await userEvent.click(button)

    // Listbox should not open
    await expect(canvas.queryByRole('listbox')).not.toBeInTheDocument()

    // onChange should not be called
    await expect(args.onChange).not.toHaveBeenCalled()
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled listboxes ignore all interaction attempts. They\'re just for show.',
      },
    },
  },
}

/**
 * Testing that disabled options cannot be selected.
 */
export const DisabledOptionInteraction: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<(typeof cuisines)[0] | null>(null)
    const handleChange = (value: (typeof cuisines)[0] | null) => {
      setSelected(value)
      args.onChange?.(value)
    }
    return (
      <Listbox
        value={selected}
        onChange={handleChange}
        placeholder="Select a cuisine..."
        aria-label="Disabled option test"
      >
        {cuisines.map((cuisine, index) => (
          <ListboxOption key={cuisine.id} value={cuisine} disabled={index === 1}>
            <ListboxLabel>
              {cuisine.name}
              {index === 1 && ' (disabled)'}
            </ListboxLabel>
          </ListboxOption>
        ))}
      </Listbox>
    )
  },
  args: {
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    // Open the listbox
    const button = canvas.getByRole('button')
    await userEvent.click(button)

    await waitFor(() => {
      expect(canvas.getByRole('listbox')).toBeInTheDocument()
    })

    // Try to click the disabled option (Japanese at index 1)
    const options = canvas.getAllByRole('option')
    const disabledOption = options[1]

    // The option should have data-disabled attribute
    await expect(disabledOption).toHaveAttribute('data-disabled', '')

    // Click the disabled option
    await userEvent.click(disabledOption)

    // onChange should NOT have been called (option is disabled)
    await expect(args.onChange).not.toHaveBeenCalled()

    // Now click an enabled option
    await userEvent.click(options[0]) // Italian

    // This should work
    await expect(args.onChange).toHaveBeenCalled()
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled options can be seen but not selected. Clicking them does nothing.',
      },
    },
  },
}

/**
 * Testing changing selection from one value to another.
 */
export const ChangeSelection: Story = {
  render: (args) => {
    const [selected, setSelected] = useState(cuisines[0])
    const handleChange = (value: (typeof cuisines)[0]) => {
      setSelected(value)
      args.onChange?.(value)
    }
    return (
      <Listbox value={selected} onChange={handleChange} aria-label="Change selection test">
        {cuisines.map((cuisine) => (
          <ListboxOption key={cuisine.id} value={cuisine}>
            <ListboxLabel>{cuisine.name}</ListboxLabel>
          </ListboxOption>
        ))}
      </Listbox>
    )
  },
  args: {
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    const button = canvas.getByRole('button')

    // Should start with Italian selected
    await expect(button).toHaveTextContent('Italian')

    // Open and select a different option
    await userEvent.click(button)

    await waitFor(() => {
      expect(canvas.getByRole('listbox')).toBeInTheDocument()
    })

    const options = canvas.getAllByRole('option')
    await userEvent.click(options[2]) // Mexican

    // Button should now show Mexican
    await waitFor(() => {
      expect(button).toHaveTextContent('Mexican')
    })

    // onChange should have been called
    await expect(args.onChange).toHaveBeenCalled()

    // Open again and change to another option
    await userEvent.click(button)

    await waitFor(() => {
      expect(canvas.getByRole('listbox')).toBeInTheDocument()
    })

    const newOptions = canvas.getAllByRole('option')
    await userEvent.click(newOptions[4]) // French

    await waitFor(() => {
      expect(button).toHaveTextContent('French')
    })

    // onChange should have been called twice total
    await expect(args.onChange).toHaveBeenCalledTimes(2)
  },
  parameters: {
    docs: {
      description: {
        story: 'Changing selection: start with one value, click to change, verify the new value appears.',
      },
    },
  },
}

/**
 * Testing multi-select deselection. Click to select, click again to deselect.
 */
export const MultiSelectDeselection: Story = {
  render: (args) => {
    const [selected, setSelected] = useState([cuisines[0], cuisines[2]])
    const handleChange = (value: typeof cuisines) => {
      setSelected(value)
      args.onChange?.(value)
    }
    return (
      <Listbox
        value={selected}
        onChange={handleChange}
        multiple
        placeholder="Select cuisines..."
        aria-label="Deselection test"
      >
        {cuisines.map((cuisine) => (
          <ListboxOption key={cuisine.id} value={cuisine}>
            <ListboxLabel>{cuisine.name}</ListboxLabel>
          </ListboxOption>
        ))}
      </Listbox>
    )
  },
  args: {
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    const button = canvas.getByRole('button')

    // Should show the two pre-selected items
    await expect(button).toHaveTextContent(/Italian/)
    await expect(button).toHaveTextContent(/Mexican/)

    // Open the listbox
    await userEvent.click(button)

    await waitFor(() => {
      expect(canvas.getByRole('listbox')).toBeInTheDocument()
    })

    // Click Italian to deselect it
    const options = canvas.getAllByRole('option')
    await userEvent.click(options[0]) // Deselect Italian

    // onChange should be called with just Mexican
    await expect(args.onChange).toHaveBeenCalled()

    // Click Mexican to deselect it too
    await userEvent.click(options[2]) // Deselect Mexican

    // Should have been called again
    await expect(args.onChange).toHaveBeenCalledTimes(2)
  },
  parameters: {
    docs: {
      description: {
        story: 'Multi-select allows deselection by clicking a selected option again. Toggle behavior.',
      },
    },
  },
}

/**
 * Testing focus state - the listbox button can receive focus.
 */
export const FocusState: Story = {
  render: () => {
    const [selected, setSelected] = useState<(typeof cuisines)[0] | null>(null)
    return (
      <Listbox value={selected} onChange={setSelected} placeholder="Focus me..." aria-label="Focus test">
        {cuisines.map((cuisine) => (
          <ListboxOption key={cuisine.id} value={cuisine}>
            <ListboxLabel>{cuisine.name}</ListboxLabel>
          </ListboxOption>
        ))}
      </Listbox>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Tab to focus the button
    await userEvent.tab()

    const button = canvas.getByRole('button')
    await expect(button).toHaveFocus()
  },
  parameters: {
    docs: {
      description: {
        story: 'Tab to see the focus ring. Keyboard users need to know where they are.',
      },
    },
  },
}

/**
 * Testing escape key closes the dropdown without selecting.
 */
export const EscapeToClose: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<(typeof cuisines)[0] | null>(null)
    const handleChange = (value: (typeof cuisines)[0] | null) => {
      setSelected(value)
      args.onChange?.(value)
    }
    return (
      <Listbox
        value={selected}
        onChange={handleChange}
        placeholder="Open and escape..."
        aria-label="Escape test"
      >
        {cuisines.map((cuisine) => (
          <ListboxOption key={cuisine.id} value={cuisine}>
            <ListboxLabel>{cuisine.name}</ListboxLabel>
          </ListboxOption>
        ))}
      </Listbox>
    )
  },
  args: {
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    const button = canvas.getByRole('button')

    // Open the listbox
    await userEvent.click(button)

    await waitFor(() => {
      expect(canvas.getByRole('listbox')).toBeInTheDocument()
    })

    // Press Escape to close without selecting
    await userEvent.keyboard('{Escape}')

    // Listbox should close
    await waitFor(() => {
      expect(canvas.queryByRole('listbox')).not.toBeInTheDocument()
    })

    // onChange should NOT have been called
    await expect(args.onChange).not.toHaveBeenCalled()

    // Placeholder should still be showing
    await expect(button).toHaveTextContent('Open and escape...')
  },
  parameters: {
    docs: {
      description: {
        story: 'Press Escape to close the dropdown without making a selection. The ultimate "never mind."',
      },
    },
  },
}

/**
 * Testing that clicking the label focuses the listbox when wrapped in a Field.
 */
export const LabelClickFocus: Story = {
  render: () => {
    const [selected, setSelected] = useState<(typeof cuisines)[0] | null>(null)
    return (
      <Field>
        <Label>Click this label</Label>
        <Listbox value={selected} onChange={setSelected} placeholder="I should get focused...">
          {cuisines.map((cuisine) => (
            <ListboxOption key={cuisine.id} value={cuisine}>
              <ListboxLabel>{cuisine.name}</ListboxLabel>
            </ListboxOption>
          ))}
        </Listbox>
      </Field>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const label = canvas.getByText('Click this label')
    const button = canvas.getByRole('button')

    // Click the label
    await userEvent.click(label)

    // The button should be focused
    await expect(button).toHaveFocus()
  },
  parameters: {
    docs: {
      description: {
        story: 'Clicking the label focuses the listbox button. That\'s what labels are for!',
      },
    },
  },
}
