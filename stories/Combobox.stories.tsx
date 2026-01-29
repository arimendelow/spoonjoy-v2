import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within, waitFor } from 'storybook/test'
import { useState } from 'react'
import { Combobox, ComboboxOption, ComboboxLabel, ComboboxDescription } from '../app/components/ui/combobox'
import { Field, Label, Description, ErrorMessage } from '../app/components/ui/fieldset'

/**
 * # Combobox
 *
 * The autocomplete. The "I'll help you find what you're looking for" of form inputs.
 * It's a select that went to college and learned to type.
 *
 * While a regular Select says "here are your options, pick one," the Combobox says
 * "start typing and I'll narrow it down for you." It's the difference between
 * browsing Netflix for an hour vs. knowing exactly what you want to watch.
 *
 * ## The Combobox Philosophy
 *
 * A Combobox is for when you have *too many* options to scroll through manually.
 * Country pickers with 195 entries? Ingredient selectors with thousands of items?
 * Recipe tags that multiply like rabbits? This is your weapon of choice.
 *
 * ## When to Use Combobox
 *
 * - **Large option sets** - More than 10-15 items? Type-ahead is a mercy
 * - **Searchable content** - When users know (roughly) what they want
 * - **Dynamic options** - Server-side filtering, async loading, infinite lists
 * - **Fuzzy matching** - When "parmazan" should find "Parmigiano-Reggiano"
 *
 * ## When NOT to Use Combobox
 *
 * - **Few options** - Under 10? Use a Select or Listbox
 * - **Unknown values** - Don't make users guess what's in your database
 * - **Yes/No questions** - A checkbox exists for a reason
 *
 * ## Combobox vs Listbox vs Select: The Showdown
 *
 * | Feature | Select | Listbox | Combobox |
 * |---------|--------|---------|----------|
 * | Type to filter | No | Type-ahead only | Full filtering |
 * | Custom content | No | Yes | Yes |
 * | Multi-select | Browser-native | Yes | No |
 * | Best for | Simple forms | Rich options | Large datasets |
 *
 * ## The Secret Sauce: Custom Filtering
 *
 * The `filter` prop lets you implement any matching logic you want.
 * Case-insensitive? Fuzzy? Weighted by relevance? Machine learning?
 * (Okay maybe not that last one, but you could.)
 *
 * By default, we do case-insensitive substring matching on displayValue.
 * It's what users expect and it just works.
 */
const meta: Meta<typeof Combobox> = {
  title: 'UI/Combobox',
  component: Combobox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
An autocomplete input with keyboard navigation and custom filtering. Built on HeadlessUI with virtualized rendering for performance.

The go-to choice when you have more options than any sane person would scroll through. Type to filter, arrow keys to navigate, Enter to select. It's the Select that learned to read.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text when empty. The "type something, anything" prompt.',
    },
    autoFocus: {
      control: 'boolean',
      description: 'Focus the input on mount. For when this is clearly the most important field.',
    },
    anchor: {
      control: 'select',
      options: ['top', 'bottom'],
      description: 'Where the dropdown appears. Gravity is just a suggestion.',
    },
    'aria-label': {
      control: 'text',
      description: 'Accessible label when no visible label exists.',
    },
  },
  decorators: [
    (Story) => (
      <div className="min-w-[300px] min-h-[350px] flex items-start justify-center pt-4">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// SAMPLE DATA
// =============================================================================

// Ingredients for autocomplete demos
const ingredients = [
  { id: 1, name: 'All-Purpose Flour', category: 'Dry Goods' },
  { id: 2, name: 'Bread Flour', category: 'Dry Goods' },
  { id: 3, name: 'Almond Flour', category: 'Dry Goods' },
  { id: 4, name: 'Butter', category: 'Dairy' },
  { id: 5, name: 'Heavy Cream', category: 'Dairy' },
  { id: 6, name: 'Sour Cream', category: 'Dairy' },
  { id: 7, name: 'Cream Cheese', category: 'Dairy' },
  { id: 8, name: 'Parmesan Cheese', category: 'Dairy' },
  { id: 9, name: 'Mozzarella', category: 'Dairy' },
  { id: 10, name: 'Chicken Breast', category: 'Protein' },
  { id: 11, name: 'Ground Beef', category: 'Protein' },
  { id: 12, name: 'Salmon Fillet', category: 'Protein' },
  { id: 13, name: 'Shrimp', category: 'Protein' },
  { id: 14, name: 'Tofu', category: 'Protein' },
  { id: 15, name: 'Garlic', category: 'Produce' },
  { id: 16, name: 'Onion', category: 'Produce' },
  { id: 17, name: 'Tomatoes', category: 'Produce' },
  { id: 18, name: 'Bell Peppers', category: 'Produce' },
  { id: 19, name: 'Spinach', category: 'Produce' },
  { id: 20, name: 'Basil', category: 'Herbs' },
  { id: 21, name: 'Oregano', category: 'Herbs' },
  { id: 22, name: 'Thyme', category: 'Herbs' },
  { id: 23, name: 'Rosemary', category: 'Herbs' },
  { id: 24, name: 'Cilantro', category: 'Herbs' },
  { id: 25, name: 'Olive Oil', category: 'Oils & Vinegars' },
  { id: 26, name: 'Balsamic Vinegar', category: 'Oils & Vinegars' },
  { id: 27, name: 'Soy Sauce', category: 'Condiments' },
  { id: 28, name: 'Worcestershire Sauce', category: 'Condiments' },
  { id: 29, name: 'Honey', category: 'Sweeteners' },
  { id: 30, name: 'Maple Syrup', category: 'Sweeteners' },
]

// Cuisines for simpler demos
const cuisines = [
  { id: 'italian', name: 'Italian', description: 'Pasta, pizza, and perfection' },
  { id: 'japanese', name: 'Japanese', description: 'Precision meets umami' },
  { id: 'mexican', name: 'Mexican', description: 'Bold flavors, warm hearts' },
  { id: 'indian', name: 'Indian', description: 'Spice is the variety of life' },
  { id: 'french', name: 'French', description: 'Butter makes everything better' },
  { id: 'thai', name: 'Thai', description: 'Sweet, sour, salty, spicy harmony' },
  { id: 'greek', name: 'Greek', description: 'Mediterranean sunshine on a plate' },
  { id: 'chinese', name: 'Chinese', description: 'Ancient wisdom, bold flavors' },
  { id: 'korean', name: 'Korean', description: 'Fermented perfection' },
  { id: 'vietnamese', name: 'Vietnamese', description: 'Fresh, light, and fragrant' },
]

// Countries for large dataset demo
const countries = [
  { code: 'us', name: 'United States' },
  { code: 'uk', name: 'United Kingdom' },
  { code: 'ca', name: 'Canada' },
  { code: 'au', name: 'Australia' },
  { code: 'de', name: 'Germany' },
  { code: 'fr', name: 'France' },
  { code: 'jp', name: 'Japan' },
  { code: 'cn', name: 'China' },
  { code: 'in', name: 'India' },
  { code: 'br', name: 'Brazil' },
  { code: 'mx', name: 'Mexico' },
  { code: 'it', name: 'Italy' },
  { code: 'es', name: 'Spain' },
  { code: 'kr', name: 'South Korea' },
  { code: 'nl', name: 'Netherlands' },
  { code: 'se', name: 'Sweden' },
  { code: 'no', name: 'Norway' },
  { code: 'dk', name: 'Denmark' },
  { code: 'fi', name: 'Finland' },
  { code: 'ch', name: 'Switzerland' },
  { code: 'at', name: 'Austria' },
  { code: 'be', name: 'Belgium' },
  { code: 'pl', name: 'Poland' },
  { code: 'pt', name: 'Portugal' },
  { code: 'gr', name: 'Greece' },
  { code: 'tr', name: 'Turkey' },
  { code: 'ru', name: 'Russia' },
  { code: 'za', name: 'South Africa' },
  { code: 'nz', name: 'New Zealand' },
  { code: 'sg', name: 'Singapore' },
]

// =============================================================================
// BASIC EXAMPLES
// =============================================================================

/**
 * The default Combobox. Type to filter, pick from what remains.
 * It's like a Select with a search bar built in.
 */
export const Default: Story = {
  render: () => {
    const [selected, setSelected] = useState<(typeof cuisines)[0] | null>(null)
    return (
      <Combobox
        options={cuisines}
        value={selected}
        onChange={setSelected}
        displayValue={(c) => c?.name}
        placeholder="Search cuisines..."
        aria-label="Select cuisine"
      >
        {(cuisine) => (
          <ComboboxOption value={cuisine}>
            <ComboboxLabel>{cuisine.name}</ComboboxLabel>
          </ComboboxOption>
        )}
      </Combobox>
    )
  },
}

/**
 * A Combobox with a pre-selected value. The defaults have already defaulted.
 */
export const WithValue: Story = {
  render: () => {
    const [selected, setSelected] = useState<(typeof cuisines)[0] | null>(cuisines[0])
    return (
      <Combobox
        options={cuisines}
        value={selected}
        onChange={setSelected}
        displayValue={(c) => c?.name}
        placeholder="Search cuisines..."
        aria-label="Select cuisine"
      >
        {(cuisine) => (
          <ComboboxOption value={cuisine}>
            <ComboboxLabel>{cuisine.name}</ComboboxLabel>
          </ComboboxOption>
        )}
      </Combobox>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Pass a value to pre-select an option. The input shows the displayValue. Users can clear and search for something else.',
      },
    },
  },
}

/**
 * Options with descriptions. Because sometimes names aren't enough.
 * Each cuisine gets its tagline.
 */
export const WithDescriptions: Story = {
  render: () => {
    const [selected, setSelected] = useState<(typeof cuisines)[0] | null>(null)
    return (
      <Combobox
        options={cuisines}
        value={selected}
        onChange={setSelected}
        displayValue={(c) => c?.name}
        placeholder="Find your flavor..."
        aria-label="Select cuisine"
      >
        {(cuisine) => (
          <ComboboxOption value={cuisine}>
            <ComboboxLabel>{cuisine.name}</ComboboxLabel>
            <ComboboxDescription>{cuisine.description}</ComboboxDescription>
          </ComboboxOption>
        )}
      </Combobox>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'ComboboxDescription adds secondary text. Filtered results maintain their descriptions, helping users make informed choices.',
      },
    },
  },
}

// =============================================================================
// WITH LABELS AND FIELDS
// =============================================================================

/**
 * Combobox with a proper label. Accessibility first, always.
 */
export const WithLabel: Story = {
  render: () => {
    const [selected, setSelected] = useState<(typeof cuisines)[0] | null>(null)
    return (
      <Field>
        <Label>Preferred cuisine</Label>
        <Combobox
          options={cuisines}
          value={selected}
          onChange={setSelected}
          displayValue={(c) => c?.name}
          placeholder="Start typing..."
        >
          {(cuisine) => (
            <ComboboxOption value={cuisine}>
              <ComboboxLabel>{cuisine.name}</ComboboxLabel>
            </ComboboxOption>
          )}
        </Combobox>
      </Field>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Use Field + Label for proper accessibility. Clicking the label focuses the input.',
      },
    },
  },
}

/**
 * Full field setup with label, description, and helpful context.
 */
export const WithLabelAndDescription: Story = {
  render: () => {
    const [selected, setSelected] = useState<(typeof cuisines)[0] | null>(null)
    return (
      <Field>
        <Label>Favorite cuisine</Label>
        <Description>We'll personalize your recipe recommendations based on this.</Description>
        <Combobox
          options={cuisines}
          value={selected}
          onChange={setSelected}
          displayValue={(c) => c?.name}
          placeholder="Type to search..."
        >
          {(cuisine) => (
            <ComboboxOption value={cuisine}>
              <ComboboxLabel>{cuisine.name}</ComboboxLabel>
              <ComboboxDescription>{cuisine.description}</ComboboxDescription>
            </ComboboxOption>
          )}
        </Combobox>
      </Field>
    )
  },
}

// =============================================================================
// ERROR STATES
// =============================================================================

/**
 * Combobox with an error. Something's not right.
 * Maybe nothing was selected. Maybe the validation gods are angry.
 */
export const WithError: Story = {
  render: () => {
    const [selected, setSelected] = useState<(typeof cuisines)[0] | null>(null)
    return (
      <Field>
        <Label>Primary cuisine</Label>
        <Combobox
          options={cuisines}
          value={selected}
          onChange={setSelected}
          displayValue={(c) => c?.name}
          placeholder="Select a cuisine..."
          data-invalid
        >
          {(cuisine) => (
            <ComboboxOption value={cuisine}>
              <ComboboxLabel>{cuisine.name}</ComboboxLabel>
            </ComboboxOption>
          )}
        </Combobox>
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
// AUTOCOMPLETE BEHAVIOR
// =============================================================================

/**
 * ## The Main Event: Autocomplete Filtering
 *
 * This is what Combobox is for. Start typing and watch the options
 * narrow down in real-time. It's like magic, but it's just JavaScript.
 *
 * The default filter is case-insensitive substring matching.
 * Type "gar" to find "Garlic". Type "cream" to find "Heavy Cream",
 * "Sour Cream", and "Cream Cheese".
 */
export const AutocompleteFiltering: Story = {
  render: () => {
    const [selected, setSelected] = useState<(typeof ingredients)[0] | null>(null)
    return (
      <Field>
        <Label>Search ingredients</Label>
        <Description>Start typing to filter. Try "cream" or "flour" or "chi".</Description>
        <Combobox
          options={ingredients}
          value={selected}
          onChange={setSelected}
          displayValue={(i) => i?.name}
          placeholder="Type an ingredient name..."
        >
          {(ingredient) => (
            <ComboboxOption value={ingredient}>
              <ComboboxLabel>{ingredient.name}</ComboboxLabel>
              <ComboboxDescription>{ingredient.category}</ComboboxDescription>
            </ComboboxOption>
          )}
        </Combobox>
      </Field>
    )
  },
  parameters: {
    docs: {
      description: {
        story: `
**This is the killer feature.** The default filter matches substrings case-insensitively.

Type "cream" and you'll get Heavy Cream, Sour Cream, and Cream Cheese. Type "chi" and you'll get Chicken Breast. The filter runs on every keystroke, updating the options list instantly.
        `,
      },
    },
  },
}

/**
 * ## Custom Filtering: You're in Control
 *
 * The `filter` prop accepts a function `(option, query) => boolean`.
 * This example filters ingredients by category OR name.
 * Type "dairy" to see all dairy products!
 */
export const CustomFiltering: Story = {
  render: () => {
    const [selected, setSelected] = useState<(typeof ingredients)[0] | null>(null)

    const customFilter = (ingredient: (typeof ingredients)[0], query: string) => {
      const q = query.toLowerCase()
      return (
        ingredient.name.toLowerCase().includes(q) ||
        ingredient.category.toLowerCase().includes(q)
      )
    }

    return (
      <Field>
        <Label>Search by name or category</Label>
        <Description>Try typing "herbs" or "dairy" to filter by category.</Description>
        <Combobox
          options={ingredients}
          value={selected}
          onChange={setSelected}
          displayValue={(i) => i?.name}
          filter={customFilter}
          placeholder="Search name or category..."
        >
          {(ingredient) => (
            <ComboboxOption value={ingredient}>
              <ComboboxLabel>{ingredient.name}</ComboboxLabel>
              <ComboboxDescription>{ingredient.category}</ComboboxDescription>
            </ComboboxOption>
          )}
        </Combobox>
      </Field>
    )
  },
  parameters: {
    docs: {
      description: {
        story: `
Custom filter function! This one searches both the name AND the category.

Type "dairy" to see Butter, Heavy Cream, Sour Cream, Cream Cheese, Parmesan, and Mozzarella. Type "herbs" to see Basil, Oregano, Thyme, Rosemary, and Cilantro. Your filter logic, your rules.
        `,
      },
    },
  },
}

/**
 * ## Starts-With Filtering
 *
 * Maybe you only want to match from the beginning of words.
 * This filter requires the query to match the start of the name.
 * "chi" finds "Chicken" but not "Mozzarella" (no "chi" at the start).
 */
export const StartsWithFiltering: Story = {
  render: () => {
    const [selected, setSelected] = useState<(typeof ingredients)[0] | null>(null)

    const startsWithFilter = (ingredient: (typeof ingredients)[0], query: string) => {
      return ingredient.name.toLowerCase().startsWith(query.toLowerCase())
    }

    return (
      <Field>
        <Label>Search (starts with)</Label>
        <Description>Only matches from the beginning. Try "sal" or "bu".</Description>
        <Combobox
          options={ingredients}
          value={selected}
          onChange={setSelected}
          displayValue={(i) => i?.name}
          filter={startsWithFilter}
          placeholder="Type to filter..."
        >
          {(ingredient) => (
            <ComboboxOption value={ingredient}>
              <ComboboxLabel>{ingredient.name}</ComboboxLabel>
            </ComboboxOption>
          )}
        </Combobox>
      </Field>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'A starts-with filter. More precise than substring matching. "sal" finds "Salmon" but "mon" doesn\'t.',
      },
    },
  },
}

// =============================================================================
// ANCHOR POSITIONS
// =============================================================================

/**
 * Dropdown anchored to the bottom (default).
 */
export const AnchorBottom: Story = {
  render: () => {
    const [selected, setSelected] = useState<(typeof cuisines)[0] | null>(null)
    return (
      <Combobox
        options={cuisines}
        value={selected}
        onChange={setSelected}
        displayValue={(c) => c?.name}
        placeholder="Opens below..."
        anchor="bottom"
        aria-label="Bottom anchor"
      >
        {(cuisine) => (
          <ComboboxOption value={cuisine}>
            <ComboboxLabel>{cuisine.name}</ComboboxLabel>
          </ComboboxOption>
        )}
      </Combobox>
    )
  },
}

/**
 * Dropdown anchored to the top. For inputs near the bottom of the viewport.
 */
export const AnchorTop: Story = {
  render: () => {
    const [selected, setSelected] = useState<(typeof cuisines)[0] | null>(null)
    return (
      <div className="mt-64">
        <Combobox
          options={cuisines}
          value={selected}
          onChange={setSelected}
          displayValue={(c) => c?.name}
          placeholder="Opens above..."
          anchor="top"
          aria-label="Top anchor"
        >
          {(cuisine) => (
            <ComboboxOption value={cuisine}>
              <ComboboxLabel>{cuisine.name}</ComboboxLabel>
            </ComboboxOption>
          )}
        </Combobox>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Use `anchor="top"` when the input is near the bottom of the viewport.',
      },
    },
  },
}

// =============================================================================
// REAL-WORLD EXAMPLES
// =============================================================================

/**
 * ## Ingredient Picker
 *
 * The workhorse of recipe apps. Users need to find ingredients from a
 * potentially massive list. Type-ahead is not just nice, it's essential.
 */
export const IngredientPicker: Story = {
  render: () => {
    const [selected, setSelected] = useState<(typeof ingredients)[0] | null>(null)
    return (
      <Field>
        <Label>Add ingredient</Label>
        <Description>Search our ingredient database by name or category.</Description>
        <Combobox
          options={ingredients}
          value={selected}
          onChange={setSelected}
          displayValue={(i) => i?.name}
          filter={(ingredient, query) => {
            const q = query.toLowerCase()
            return (
              ingredient.name.toLowerCase().includes(q) ||
              ingredient.category.toLowerCase().includes(q)
            )
          }}
          placeholder="Search ingredients..."
        >
          {(ingredient) => (
            <ComboboxOption value={ingredient}>
              <ComboboxLabel>{ingredient.name}</ComboboxLabel>
              <ComboboxDescription>{ingredient.category}</ComboboxDescription>
            </ComboboxOption>
          )}
        </Combobox>
      </Field>
    )
  },
  parameters: {
    docs: {
      description: {
        story: `
A real ingredient picker. Users can search by name ("garlic") or category ("herbs").

This is the pattern for any searchable list where:
- There are too many items to scroll through
- Users generally know what they're looking for
- Categories or metadata can help narrow results
        `,
      },
    },
  },
}

/**
 * ## Country Selector
 *
 * The classic use case. 195 countries (more or less, depending on your politics).
 * Nobody wants to scroll past "United States" to find "Vietnam".
 */
export const CountrySelector: Story = {
  render: () => {
    const [selected, setSelected] = useState<(typeof countries)[0] | null>(null)
    return (
      <Field>
        <Label>Country</Label>
        <Description>Where are you cooking from today?</Description>
        <Combobox
          options={countries}
          value={selected}
          onChange={setSelected}
          displayValue={(c) => c?.name}
          placeholder="Search countries..."
        >
          {(country) => (
            <ComboboxOption value={country}>
              <ComboboxLabel>{country.name}</ComboboxLabel>
            </ComboboxOption>
          )}
        </Combobox>
      </Field>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'The country picker. A Combobox classic. Type "uni" to quickly find United States or United Kingdom.',
      },
    },
  },
}

/**
 * ## Recipe Search
 *
 * A search-style combobox for finding recipes. This pattern works great
 * for any searchable content where you want to show previews.
 */
export const RecipeSearch: Story = {
  render: () => {
    const recipes = [
      { id: 1, name: 'Pasta Carbonara', cuisine: 'Italian', time: '25 min' },
      { id: 2, name: 'Pad Thai', cuisine: 'Thai', time: '30 min' },
      { id: 3, name: 'Chicken Tikka Masala', cuisine: 'Indian', time: '45 min' },
      { id: 4, name: 'Beef Tacos', cuisine: 'Mexican', time: '20 min' },
      { id: 5, name: 'Sushi Rolls', cuisine: 'Japanese', time: '60 min' },
      { id: 6, name: 'French Onion Soup', cuisine: 'French', time: '90 min' },
      { id: 7, name: 'Greek Salad', cuisine: 'Greek', time: '15 min' },
      { id: 8, name: 'Kung Pao Chicken', cuisine: 'Chinese', time: '35 min' },
      { id: 9, name: 'Bibimbap', cuisine: 'Korean', time: '40 min' },
      { id: 10, name: 'Pho', cuisine: 'Vietnamese', time: '180 min' },
    ]

    const [selected, setSelected] = useState<(typeof recipes)[0] | null>(null)

    return (
      <Field>
        <Label>Quick recipe search</Label>
        <Combobox
          options={recipes}
          value={selected}
          onChange={setSelected}
          displayValue={(r) => r?.name}
          filter={(recipe, query) => {
            const q = query.toLowerCase()
            return (
              recipe.name.toLowerCase().includes(q) ||
              recipe.cuisine.toLowerCase().includes(q)
            )
          }}
          placeholder="Search recipes..."
        >
          {(recipe) => (
            <ComboboxOption value={recipe}>
              <ComboboxLabel>{recipe.name}</ComboboxLabel>
              <ComboboxDescription>{recipe.cuisine} · {recipe.time}</ComboboxDescription>
            </ComboboxOption>
          )}
        </Combobox>
      </Field>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Recipe search with cuisine and cook time in the description. Search by recipe name or cuisine type.',
      },
    },
  },
}

/**
 * ## Chef/Author Selector
 *
 * For attributing recipes or filtering by chef. Each option shows
 * the chef name and their specialty.
 */
export const ChefSelector: Story = {
  render: () => {
    const chefs = [
      { id: 1, name: 'Julia Child', specialty: 'French cuisine' },
      { id: 2, name: 'Gordon Ramsay', specialty: 'British & French' },
      { id: 3, name: 'Massimo Bottura', specialty: 'Modern Italian' },
      { id: 4, name: 'Jiro Ono', specialty: 'Sushi master' },
      { id: 5, name: 'Alice Waters', specialty: 'California cuisine' },
      { id: 6, name: 'Thomas Keller', specialty: 'French-American' },
      { id: 7, name: 'René Redzepi', specialty: 'New Nordic' },
      { id: 8, name: 'Dominique Crenn', specialty: 'Poetic cuisine' },
    ]

    const [selected, setSelected] = useState<(typeof chefs)[0] | null>(null)

    return (
      <Field>
        <Label>Recipe attribution</Label>
        <Description>Credit the original chef or cookbook author.</Description>
        <Combobox
          options={chefs}
          value={selected}
          onChange={setSelected}
          displayValue={(c) => c?.name}
          filter={(chef, query) => {
            const q = query.toLowerCase()
            return (
              chef.name.toLowerCase().includes(q) ||
              chef.specialty.toLowerCase().includes(q)
            )
          }}
          placeholder="Search chefs..."
        >
          {(chef) => (
            <ComboboxOption value={chef}>
              <ComboboxLabel>{chef.name}</ComboboxLabel>
              <ComboboxDescription>{chef.specialty}</ComboboxDescription>
            </ComboboxOption>
          )}
        </Combobox>
      </Field>
    )
  },
}

/**
 * ## Empty Results Message
 *
 * What happens when the filter returns nothing? The dropdown
 * just... disappears. It's built-in behavior from HeadlessUI.
 * The `empty:invisible` class handles it gracefully.
 */
export const NoResultsDemo: Story = {
  render: () => {
    const [selected, setSelected] = useState<(typeof cuisines)[0] | null>(null)
    return (
      <Field>
        <Label>Try searching for something that doesn't exist</Label>
        <Description>Type "pizza" — it's not in our cuisine list. The dropdown vanishes.</Description>
        <Combobox
          options={cuisines}
          value={selected}
          onChange={setSelected}
          displayValue={(c) => c?.name}
          placeholder="Try typing 'pizza'..."
        >
          {(cuisine) => (
            <ComboboxOption value={cuisine}>
              <ComboboxLabel>{cuisine.name}</ComboboxLabel>
            </ComboboxOption>
          )}
        </Combobox>
      </Field>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'When filtering returns no results, the dropdown disappears. No "No results found" message needed — the absence is the message.',
      },
    },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * ## Basic Selection Test
 *
 * Open the combobox, click an option, verify it's selected.
 * The fundamental interaction.
 */
export const BasicSelectionInteraction: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<(typeof cuisines)[0] | null>(null)
    const handleChange = (value: (typeof cuisines)[0] | null) => {
      setSelected(value)
      args.onChange?.(value)
    }
    return (
      <Combobox
        options={cuisines}
        value={selected}
        onChange={handleChange}
        displayValue={(c) => c?.name}
        placeholder="Select a cuisine..."
        aria-label="Test combobox"
      >
        {(cuisine) => (
          <ComboboxOption value={cuisine}>
            <ComboboxLabel>{cuisine.name}</ComboboxLabel>
          </ComboboxOption>
        )}
      </Combobox>
    )
  },
  args: {
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    // Find the input
    const input = canvas.getByRole('combobox')
    await expect(input).toHaveValue('')

    // Click to open
    await userEvent.click(input)

    // Wait for options to appear
    await waitFor(() => {
      expect(canvas.getByRole('listbox')).toBeInTheDocument()
    })

    // Click an option
    const options = canvas.getAllByRole('option')
    await userEvent.click(options[1]) // Japanese

    // Verify the input shows the selected value
    await waitFor(() => {
      expect(input).toHaveValue('Japanese')
    })

    // Verify onChange was called
    await expect(args.onChange).toHaveBeenCalled()
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic interaction: click input, pick from dropdown, verify selection.',
      },
    },
  },
}

/**
 * ## Type to Filter Test
 *
 * The main event. Type a search query, watch the options filter,
 * select from the filtered results.
 */
export const TypeToFilterInteraction: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<(typeof ingredients)[0] | null>(null)
    const handleChange = (value: (typeof ingredients)[0] | null) => {
      setSelected(value)
      args.onChange?.(value)
    }
    return (
      <Combobox
        options={ingredients}
        value={selected}
        onChange={handleChange}
        displayValue={(i) => i?.name}
        placeholder="Type to search..."
        aria-label="Ingredient search"
      >
        {(ingredient) => (
          <ComboboxOption value={ingredient}>
            <ComboboxLabel>{ingredient.name}</ComboboxLabel>
          </ComboboxOption>
        )}
      </Combobox>
    )
  },
  args: {
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox')

    // Type a search query
    await userEvent.type(input, 'cream')

    // Wait for filtered options
    await waitFor(() => {
      expect(canvas.getByRole('listbox')).toBeInTheDocument()
    })

    // Should see filtered results (cream-related items)
    const options = canvas.getAllByRole('option')
    // We expect Heavy Cream, Sour Cream, Cream Cheese
    expect(options.length).toBeLessThan(ingredients.length)

    // Select first filtered result
    await userEvent.click(options[0])

    // Verify selection
    await expect(args.onChange).toHaveBeenCalled()

    // Input should show the selected value (one of the cream items)
    await waitFor(() => {
      expect(input).toHaveValue(expect.stringContaining('Cream'))
    })
  },
  parameters: {
    docs: {
      description: {
        story: 'Type to filter: enter search text, verify options narrow, select from filtered list.',
      },
    },
  },
}

/**
 * ## Keyboard Navigation Test
 *
 * Arrow keys to navigate, Enter to select.
 * Full keyboard accessibility.
 */
export const KeyboardNavigationInteraction: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<(typeof cuisines)[0] | null>(null)
    const handleChange = (value: (typeof cuisines)[0] | null) => {
      setSelected(value)
      args.onChange?.(value)
    }
    return (
      <Combobox
        options={cuisines}
        value={selected}
        onChange={handleChange}
        displayValue={(c) => c?.name}
        placeholder="Use arrow keys..."
        aria-label="Keyboard test"
      >
        {(cuisine) => (
          <ComboboxOption value={cuisine}>
            <ComboboxLabel>{cuisine.name}</ComboboxLabel>
          </ComboboxOption>
        )}
      </Combobox>
    )
  },
  args: {
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox')

    // Focus the input
    input.focus()
    await expect(input).toHaveFocus()

    // Arrow down to open and navigate
    await userEvent.keyboard('{ArrowDown}')

    // Wait for listbox
    await waitFor(() => {
      expect(canvas.getByRole('listbox')).toBeInTheDocument()
    })

    // Navigate down a few times
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{ArrowDown}')

    // Press Enter to select
    await userEvent.keyboard('{Enter}')

    // Dropdown should close
    await waitFor(() => {
      expect(canvas.queryByRole('listbox')).not.toBeInTheDocument()
    })

    // onChange should have been called
    await expect(args.onChange).toHaveBeenCalled()
  },
  parameters: {
    docs: {
      description: {
        story: 'Full keyboard flow: focus input, arrow down to open, navigate with arrows, Enter to select.',
      },
    },
  },
}

/**
 * ## Escape to Close Test
 *
 * Press Escape to close without selecting.
 * The universal "never mind" gesture.
 */
export const EscapeToCloseInteraction: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<(typeof cuisines)[0] | null>(null)
    const handleChange = (value: (typeof cuisines)[0] | null) => {
      setSelected(value)
      args.onChange?.(value)
    }
    return (
      <Combobox
        options={cuisines}
        value={selected}
        onChange={handleChange}
        displayValue={(c) => c?.name}
        placeholder="Open and escape..."
        aria-label="Escape test"
      >
        {(cuisine) => (
          <ComboboxOption value={cuisine}>
            <ComboboxLabel>{cuisine.name}</ComboboxLabel>
          </ComboboxOption>
        )}
      </Combobox>
    )
  },
  args: {
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox')

    // Click to open
    await userEvent.click(input)

    await waitFor(() => {
      expect(canvas.getByRole('listbox')).toBeInTheDocument()
    })

    // Press Escape
    await userEvent.keyboard('{Escape}')

    // Listbox should close
    await waitFor(() => {
      expect(canvas.queryByRole('listbox')).not.toBeInTheDocument()
    })

    // No selection should have been made
    await expect(args.onChange).not.toHaveBeenCalled()

    // Input should still be empty
    await expect(input).toHaveValue('')
  },
  parameters: {
    docs: {
      description: {
        story: 'Escape closes the dropdown without selecting. Changes your mind? Just press Escape.',
      },
    },
  },
}

/**
 * ## Clear and Re-search Test
 *
 * Select something, then clear and search again.
 * The "actually, let me look again" flow.
 */
export const ClearAndResearchInteraction: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<(typeof cuisines)[0] | null>(cuisines[0])
    const handleChange = (value: (typeof cuisines)[0] | null) => {
      setSelected(value)
      args.onChange?.(value)
    }
    return (
      <Combobox
        options={cuisines}
        value={selected}
        onChange={handleChange}
        displayValue={(c) => c?.name}
        placeholder="Search cuisines..."
        aria-label="Clear and research"
      >
        {(cuisine) => (
          <ComboboxOption value={cuisine}>
            <ComboboxLabel>{cuisine.name}</ComboboxLabel>
          </ComboboxOption>
        )}
      </Combobox>
    )
  },
  args: {
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox')

    // Should start with Italian selected
    await expect(input).toHaveValue('Italian')

    // Clear the input
    await userEvent.clear(input)

    // Type a new search
    await userEvent.type(input, 'jap')

    // Wait for filtered results
    await waitFor(() => {
      expect(canvas.getByRole('listbox')).toBeInTheDocument()
    })

    // Select from filtered results
    const options = canvas.getAllByRole('option')
    await userEvent.click(options[0]) // Should be Japanese

    // Verify new selection
    await waitFor(() => {
      expect(input).toHaveValue('Japanese')
    })

    await expect(args.onChange).toHaveBeenCalled()
  },
  parameters: {
    docs: {
      description: {
        story: 'Start with a selection, clear it, search for something new. The full re-selection flow.',
      },
    },
  },
}

/**
 * ## Custom Filter Test
 *
 * Verify that custom filter logic works correctly.
 * This one searches by category.
 */
export const CustomFilterInteraction: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<(typeof ingredients)[0] | null>(null)
    const handleChange = (value: (typeof ingredients)[0] | null) => {
      setSelected(value)
      args.onChange?.(value)
    }

    const customFilter = (ingredient: (typeof ingredients)[0], query: string) => {
      const q = query.toLowerCase()
      return (
        ingredient.name.toLowerCase().includes(q) ||
        ingredient.category.toLowerCase().includes(q)
      )
    }

    return (
      <Combobox
        options={ingredients}
        value={selected}
        onChange={handleChange}
        displayValue={(i) => i?.name}
        filter={customFilter}
        placeholder="Search by name or category..."
        aria-label="Custom filter test"
      >
        {(ingredient) => (
          <ComboboxOption value={ingredient}>
            <ComboboxLabel>{ingredient.name}</ComboboxLabel>
            <ComboboxDescription>{ingredient.category}</ComboboxDescription>
          </ComboboxOption>
        )}
      </Combobox>
    )
  },
  args: {
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox')

    // Search by category
    await userEvent.type(input, 'herbs')

    // Wait for results
    await waitFor(() => {
      expect(canvas.getByRole('listbox')).toBeInTheDocument()
    })

    // Should only see herbs (Basil, Oregano, Thyme, Rosemary, Cilantro)
    const options = canvas.getAllByRole('option')
    expect(options.length).toBe(5)

    // Select one
    await userEvent.click(options[0]) // Basil

    // Verify selection
    await expect(args.onChange).toHaveBeenCalled()
    await waitFor(() => {
      expect(input).toHaveValue('Basil')
    })
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom filter test: search by category ("herbs") and verify only matching items appear.',
      },
    },
  },
}

/**
 * ## Focus State Test
 *
 * Tab to focus, verify the focus ring appears.
 */
export const FocusStateInteraction: Story = {
  render: () => {
    const [selected, setSelected] = useState<(typeof cuisines)[0] | null>(null)
    return (
      <Combobox
        options={cuisines}
        value={selected}
        onChange={setSelected}
        displayValue={(c) => c?.name}
        placeholder="Tab to focus..."
        aria-label="Focus test"
      >
        {(cuisine) => (
          <ComboboxOption value={cuisine}>
            <ComboboxLabel>{cuisine.name}</ComboboxLabel>
          </ComboboxOption>
        )}
      </Combobox>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Tab to focus
    await userEvent.tab()

    const input = canvas.getByRole('combobox')
    await expect(input).toHaveFocus()
  },
  parameters: {
    docs: {
      description: {
        story: 'Tab to see the focus ring. Keyboard accessibility starts with visible focus.',
      },
    },
  },
}

/**
 * ## Change Selection Test
 *
 * Select one option, then change to another.
 * The "actually, I changed my mind" flow.
 */
export const ChangeSelectionInteraction: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<(typeof cuisines)[0] | null>(null)
    const handleChange = (value: (typeof cuisines)[0] | null) => {
      setSelected(value)
      args.onChange?.(value)
    }
    return (
      <Combobox
        options={cuisines}
        value={selected}
        onChange={handleChange}
        displayValue={(c) => c?.name}
        placeholder="Select, then change..."
        aria-label="Change selection test"
      >
        {(cuisine) => (
          <ComboboxOption value={cuisine}>
            <ComboboxLabel>{cuisine.name}</ComboboxLabel>
          </ComboboxOption>
        )}
      </Combobox>
    )
  },
  args: {
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox')

    // First selection
    await userEvent.click(input)
    await waitFor(() => {
      expect(canvas.getByRole('listbox')).toBeInTheDocument()
    })
    const options1 = canvas.getAllByRole('option')
    await userEvent.click(options1[0]) // Italian

    await waitFor(() => {
      expect(input).toHaveValue('Italian')
    })

    // Change selection - clear and select again
    await userEvent.clear(input)
    await userEvent.click(input)

    await waitFor(() => {
      expect(canvas.getByRole('listbox')).toBeInTheDocument()
    })

    const options2 = canvas.getAllByRole('option')
    await userEvent.click(options2[2]) // Mexican

    await waitFor(() => {
      expect(input).toHaveValue('Mexican')
    })

    // onChange should have been called multiple times
    await expect(args.onChange).toHaveBeenCalled()
  },
  parameters: {
    docs: {
      description: {
        story: 'Select one option, then clear and select another. The full change-your-mind flow.',
      },
    },
  },
}

/**
 * ## Clicking the Chevron Button Test
 *
 * The chevron button on the right also opens the dropdown.
 */
export const ChevronButtonInteraction: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<(typeof cuisines)[0] | null>(null)
    const handleChange = (value: (typeof cuisines)[0] | null) => {
      setSelected(value)
      args.onChange?.(value)
    }
    return (
      <Combobox
        options={cuisines}
        value={selected}
        onChange={handleChange}
        displayValue={(c) => c?.name}
        placeholder="Click the chevron..."
        aria-label="Chevron test"
      >
        {(cuisine) => (
          <ComboboxOption value={cuisine}>
            <ComboboxLabel>{cuisine.name}</ComboboxLabel>
          </ComboboxOption>
        )}
      </Combobox>
    )
  },
  args: {
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Find the button (chevron)
    const button = canvas.getByRole('button')

    // Click the chevron button
    await userEvent.click(button)

    // Dropdown should open
    await waitFor(() => {
      expect(canvas.getByRole('listbox')).toBeInTheDocument()
    })

    // All options should be visible
    const options = canvas.getAllByRole('option')
    expect(options.length).toBe(cuisines.length)
  },
  parameters: {
    docs: {
      description: {
        story: 'The chevron button opens the dropdown too. Two ways to access the same options.',
      },
    },
  },
}

/**
 * ## Label Click Focus Test
 *
 * Clicking the label should focus the combobox input.
 */
export const LabelClickFocusInteraction: Story = {
  render: () => {
    const [selected, setSelected] = useState<(typeof cuisines)[0] | null>(null)
    return (
      <Field>
        <Label>Click this label</Label>
        <Combobox
          options={cuisines}
          value={selected}
          onChange={setSelected}
          displayValue={(c) => c?.name}
          placeholder="I should get focused..."
        >
          {(cuisine) => (
            <ComboboxOption value={cuisine}>
              <ComboboxLabel>{cuisine.name}</ComboboxLabel>
            </ComboboxOption>
          )}
        </Combobox>
      </Field>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const label = canvas.getByText('Click this label')
    const input = canvas.getByRole('combobox')

    // Click the label
    await userEvent.click(label)

    // Input should be focused
    await expect(input).toHaveFocus()
  },
  parameters: {
    docs: {
      description: {
        story: 'Clicking the label focuses the input. That\'s what labels are for!',
      },
    },
  },
}
