import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { IngredientParseInput } from '../../../app/components/recipe/IngredientParseInput'

/**
 * # IngredientParseInput
 *
 * A textarea component for entering natural language ingredient text.
 * The text is automatically parsed by AI after a debounce period.
 *
 * This is the "just type like you're reading a recipe" mode of ingredient input,
 * as opposed to the manual 3-field mode (ManualIngredientInput).
 *
 * ## Features
 *
 * - **Natural language input** - Users type ingredients as they'd see them in a recipe
 * - **Debounced parsing** - AI parses after 1 second of inactivity
 * - **Loading states** - Visual feedback during parsing
 * - **Error handling** - Clear error messages when parsing fails
 * - **Multi-line support** - Enter multiple ingredients, one per line
 *
 * ## AI Parsing
 *
 * The component uses useFetcher to call the parse action on the step edit route.
 * It sends the ingredient text and receives structured ingredient data back.
 *
 * Example input:
 * ```
 * 2 cups all-purpose flour
 * 1/2 tsp salt
 * 3 large eggs
 * ```
 *
 * Parses to:
 * ```json
 * [
 *   { "quantity": 2, "unit": "cup", "ingredientName": "all-purpose flour" },
 *   { "quantity": 0.5, "unit": "tsp", "ingredientName": "salt" },
 *   { "quantity": 3, "unit": "whole", "ingredientName": "large eggs" }
 * ]
 * ```
 */
const meta: Meta<typeof IngredientParseInput> = {
  title: 'Recipe/Input/IngredientParseInput',
  component: IngredientParseInput,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
AI-powered ingredient parsing. Type ingredients naturally and let the AI do the work.

Parses after 1 second of inactivity - no button press needed.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    recipeId: {
      description: 'The recipe ID for the parse action route',
    },
    stepId: {
      description: 'The step ID for the parse action route',
    },
    onParsed: {
      action: 'parsed',
      description: 'Callback when ingredients are successfully parsed',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the textarea',
    },
    defaultValue: {
      control: 'text',
      description: 'Initial text value',
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

// =============================================================================
// BASIC STORIES
// =============================================================================

/**
 * The default empty state. Ready for user input.
 * Type ingredients naturally - AI will parse after you stop typing.
 */
export const Default: Story = {
  args: {
    recipeId: 'recipe-123',
    stepId: 'step-456',
    onParsed: fn(),
  },
}

/**
 * Disabled state - the textarea is disabled.
 * Used when the parent is in a state where parsing shouldn't occur.
 */
export const Disabled: Story = {
  args: {
    recipeId: 'recipe-123',
    stepId: 'step-456',
    onParsed: fn(),
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'The textarea is disabled. Users cannot type or trigger parsing.',
      },
    },
  },
}

/**
 * With initial value - useful for editing existing ingredient text.
 * Will trigger a parse after the debounce period on mount.
 */
export const WithDefaultValue: Story = {
  args: {
    recipeId: 'recipe-123',
    stepId: 'step-456',
    onParsed: fn(),
    defaultValue: '2 cups all-purpose flour\n1/2 tsp salt\n3 large eggs',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Pre-filled with ingredient text. Parsing will trigger automatically after the debounce period.',
      },
    },
  },
}

// =============================================================================
// STATE STORIES (Simulated)
// =============================================================================

/**
 * Loading state - shown while AI is parsing ingredients.
 *
 * Note: This is a simulated state for documentation purposes.
 * In actual use, the loading state is managed internally.
 */
export const LoadingState: Story = {
  args: {
    recipeId: 'recipe-123',
    stepId: 'step-456',
    onParsed: fn(),
    defaultValue: '2 cups flour',
  },
  parameters: {
    docs: {
      description: {
        story: `
Simulated loading state. In actual use:
1. User types ingredients
2. After 1 second of inactivity, parsing begins
3. Loading indicator appears
4. Textarea is disabled during parsing
5. Results appear (or error if parsing fails)
        `,
      },
    },
  },
}

/**
 * Error state - shown when AI parsing fails.
 *
 * Note: This is documented for completeness. The actual error
 * state is triggered by the action returning an error response.
 */
export const ErrorState: Story = {
  args: {
    recipeId: 'recipe-123',
    stepId: 'step-456',
    onParsed: fn(),
    defaultValue: 'gibberish input',
  },
  parameters: {
    docs: {
      description: {
        story: `
Error states occur when:
- API rate limit exceeded
- API key missing or invalid
- Network error
- Invalid response from AI

The error message is displayed below the textarea with proper ARIA attributes.
        `,
      },
    },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Test: User types ingredients into the textarea.
 */
export const TypingIngredients: Story = {
  args: {
    recipeId: 'recipe-123',
    stepId: 'step-456',
    onParsed: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const textarea = canvas.getByRole('textbox')
    await userEvent.type(textarea, '2 cups flour')
    await expect(textarea).toHaveValue('2 cups flour')
  },
  parameters: {
    docs: {
      description: {
        story: 'User types ingredients. Parsing will trigger after debounce.',
      },
    },
  },
}

/**
 * Test: Multi-line ingredient input.
 */
export const MultiLineInput: Story = {
  args: {
    recipeId: 'recipe-123',
    stepId: 'step-456',
    onParsed: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const textarea = canvas.getByRole('textbox')
    await userEvent.type(
      textarea,
      '2 cups all-purpose flour{enter}1/2 tsp salt{enter}3 large eggs{enter}1 cup milk'
    )

    await expect(textarea).toHaveValue('2 cups all-purpose flour\n1/2 tsp salt\n3 large eggs\n1 cup milk')
  },
  parameters: {
    docs: {
      description: {
        story: 'Multiple ingredients entered on separate lines. Each line is parsed independently.',
      },
    },
  },
}

/**
 * Test: Clear and retype ingredients.
 */
export const ClearAndRetype: Story = {
  args: {
    recipeId: 'recipe-123',
    stepId: 'step-456',
    onParsed: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const textarea = canvas.getByRole('textbox')

    // Type initial ingredients
    await userEvent.type(textarea, '2 cups flour')
    await expect(textarea).toHaveValue('2 cups flour')

    // Clear
    await userEvent.clear(textarea)
    await expect(textarea).toHaveValue('')

    // Type new ingredients
    await userEvent.type(textarea, '1/2 tsp vanilla')
    await expect(textarea).toHaveValue('1/2 tsp vanilla')
  },
  parameters: {
    docs: {
      description: {
        story: 'User clears and retypes. Clearing should reset any error or parsed state.',
      },
    },
  },
}

// =============================================================================
// REAL-WORLD EXAMPLES
// =============================================================================

/**
 * Example: Baking ingredients list.
 */
export const ExampleBakingIngredients: Story = {
  args: {
    recipeId: 'recipe-123',
    stepId: 'step-456',
    onParsed: fn(),
    defaultValue: `2 cups all-purpose flour
1/2 cup unsalted butter, softened
3/4 cup granulated sugar
2 large eggs
1 tsp vanilla extract
1/2 tsp baking powder
1/4 tsp salt`,
  },
  parameters: {
    docs: {
      description: {
        story: 'A realistic baking ingredients list. Note the variety of formats: fractions, prep notes, sizes.',
      },
    },
  },
}

/**
 * Example: Cooking ingredients with compound names.
 */
export const ExampleCookingIngredients: Story = {
  args: {
    recipeId: 'recipe-123',
    stepId: 'step-456',
    onParsed: fn(),
    defaultValue: `2 tbsp extra virgin olive oil
4 cloves garlic, minced
1 can (14 oz) diced tomatoes
1/2 cup fresh basil, chopped
kosher salt to taste
freshly ground black pepper`,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Cooking ingredients with compound names and prep notes. AI handles "extra virgin olive oil" as a single ingredient.',
      },
    },
  },
}

/**
 * Example: Ingredients with unusual units.
 */
export const ExampleUnusualUnits: Story = {
  args: {
    recipeId: 'recipe-123',
    stepId: 'step-456',
    onParsed: fn(),
    defaultValue: `1 pinch saffron threads
2 dashes Worcestershire sauce
1 bunch fresh cilantro
3 sprigs fresh thyme
handful of cherry tomatoes`,
  },
  parameters: {
    docs: {
      description: {
        story: 'Ingredients with unusual units like "pinch", "dash", "bunch", "sprig", and "handful".',
      },
    },
  },
}
