import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { useState } from 'react'
import { StepCard, type StepCardProps } from '../app/components/recipe/StepCard'
import type { Ingredient } from '../app/components/recipe/IngredientList'
import type { StepReference } from '../app/components/recipe/StepOutputUseCallout'

/**
 * # StepCard
 *
 * The atomic unit of recipe instructions. Each StepCard represents a single
 * step in the cooking process, complete with ingredients needed, any step
 * outputs being used, and clear instructions.
 *
 * Think of it as a self-contained cooking mission briefing.
 *
 * ## Design Principles
 *
 * - **Step number prominence**: Large badge so users always know where they are
 * - **Clear hierarchy**: Title → Uses → Ingredients → Description
 * - **Mobile-first**: Readable at arm's length in the kitchen
 * - **Integrated scaling**: Ingredients scale with the recipe
 */
const meta: Meta<typeof StepCard> = {
  title: 'Recipe/StepCard',
  component: StepCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A single recipe step card showing step number, optional title, ingredients,
step output references, and description. Integrates with recipe scaling.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    stepNumber: {
      control: { type: 'number', min: 1 },
      description: 'The step number (1-indexed)',
    },
    title: {
      control: 'text',
      description: 'Optional step title',
    },
    description: {
      control: 'text',
      description: 'Step instructions/description',
    },
    ingredients: {
      description: 'Ingredients needed for this step',
    },
    stepOutputUses: {
      description: 'References to outputs from previous steps',
    },
    scaleFactor: {
      control: { type: 'number', min: 0.25, max: 10, step: 0.25 },
      description: 'Scale factor for ingredient quantities',
    },
    checkedIngredientIds: {
      description: 'Set of checked ingredient IDs',
    },
    onIngredientToggle: {
      action: 'ingredientToggled',
      description: 'Callback when an ingredient is toggled',
    },
    onStepReferenceClick: {
      action: 'stepReferenceClicked',
      description: 'Callback when a step reference is clicked',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Sample data
const sampleIngredients: Ingredient[] = [
  { id: 'ing-1', quantity: 2, unit: 'cups', name: 'all-purpose flour' },
  { id: 'ing-2', quantity: 1, unit: 'tsp', name: 'baking powder' },
  { id: 'ing-3', quantity: 0.5, unit: 'tsp', name: 'salt' },
]

const sampleStepOutputUses: StepReference[] = [
  { id: 'ref-1', stepNumber: 1, stepTitle: 'Make the dough' },
]

const multipleStepOutputUses: StepReference[] = [
  { id: 'ref-1', stepNumber: 1, stepTitle: 'Prepare the base' },
  { id: 'ref-2', stepNumber: 2, stepTitle: null },
]

// =============================================================================
// BASIC STORIES
// =============================================================================

/**
 * A complete step with all elements: title, ingredients, and description.
 */
export const Default: Story = {
  args: {
    stepNumber: 1,
    title: 'Mix dry ingredients',
    description:
      'In a large bowl, whisk together the flour, baking powder, and salt until well combined. Make a well in the center for the wet ingredients.',
    ingredients: sampleIngredients,
    stepOutputUses: [],
    scaleFactor: 1,
    checkedIngredientIds: new Set(),
    onIngredientToggle: fn(),
  },
}

/**
 * A step without a title - shows step number only.
 */
export const WithoutTitle: Story = {
  args: {
    stepNumber: 2,
    description:
      'Gradually add the wet ingredients to the dry, stirring gently until just combined. Do not overmix.',
    ingredients: [],
    stepOutputUses: [],
    scaleFactor: 1,
    checkedIngredientIds: new Set(),
    onIngredientToggle: fn(),
  },
}

/**
 * A step without ingredients.
 */
export const WithoutIngredients: Story = {
  args: {
    stepNumber: 3,
    title: 'Let it rest',
    description:
      'Cover the bowl with a clean towel and let the batter rest for 10 minutes. This allows the gluten to relax and results in fluffier pancakes.',
    ingredients: [],
    stepOutputUses: [],
    scaleFactor: 1,
    checkedIngredientIds: new Set(),
    onIngredientToggle: fn(),
  },
}

/**
 * A step using output from a previous step.
 */
export const WithStepOutputUse: Story = {
  args: {
    stepNumber: 4,
    title: 'Shape and bake',
    description:
      'Take the rested dough and divide into 12 equal pieces. Roll each piece into a ball and place on a lined baking sheet.',
    ingredients: [],
    stepOutputUses: sampleStepOutputUses,
    scaleFactor: 1,
    checkedIngredientIds: new Set(),
    onIngredientToggle: fn(),
  },
}

/**
 * A step using output from multiple previous steps.
 */
export const WithMultipleStepOutputUses: Story = {
  args: {
    stepNumber: 5,
    title: 'Combine everything',
    description:
      'Gently fold the prepared base with the whipped cream until no streaks remain.',
    ingredients: [],
    stepOutputUses: multipleStepOutputUses,
    scaleFactor: 1,
    checkedIngredientIds: new Set(),
    onIngredientToggle: fn(),
  },
}

/**
 * A step with everything: title, ingredients, step uses, and description.
 */
export const FullyLoaded: Story = {
  args: {
    stepNumber: 3,
    title: 'Make the filling',
    description:
      'Combine all filling ingredients in a medium bowl. Taste and adjust seasoning as needed. The mixture should be smooth and creamy.',
    ingredients: [
      { id: 'ing-1', quantity: 1, unit: 'cup', name: 'ricotta cheese' },
      { id: 'ing-2', quantity: 0.5, unit: 'cup', name: 'parmesan, grated' },
      { id: 'ing-3', quantity: 1, unit: '', name: 'egg' },
      { id: 'ing-4', quantity: 0.25, unit: 'tsp', name: 'nutmeg' },
    ],
    stepOutputUses: [
      { id: 'ref-1', stepNumber: 1, stepTitle: 'Make the pasta dough' },
    ],
    scaleFactor: 1,
    checkedIngredientIds: new Set(),
    onIngredientToggle: fn(),
  },
}

// =============================================================================
// SCALING STORIES
// =============================================================================

/**
 * Step with doubled ingredients (2× scale).
 */
export const DoubleScale: Story = {
  args: {
    stepNumber: 1,
    title: 'Mix dry ingredients',
    description: 'Combine all dry ingredients in a large bowl.',
    ingredients: sampleIngredients,
    stepOutputUses: [],
    scaleFactor: 2,
    checkedIngredientIds: new Set(),
    onIngredientToggle: fn(),
  },
}

/**
 * Step with halved ingredients (0.5× scale).
 */
export const HalfScale: Story = {
  args: {
    stepNumber: 1,
    title: 'Mix dry ingredients',
    description: 'Combine all dry ingredients in a medium bowl.',
    ingredients: sampleIngredients,
    stepOutputUses: [],
    scaleFactor: 0.5,
    checkedIngredientIds: new Set(),
    onIngredientToggle: fn(),
  },
}

// =============================================================================
// INTERACTIVE WRAPPER
// =============================================================================

function InteractiveStepCard({
  initialChecked = new Set<string>(),
  ...props
}: Omit<StepCardProps, 'checkedIngredientIds' | 'onIngredientToggle'> & {
  initialChecked?: Set<string>
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
    <StepCard
      {...props}
      checkedIngredientIds={checkedIds}
      onIngredientToggle={handleToggle}
    />
  )
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * ## Displays Step Number Test
 *
 * Verify step number is displayed prominently.
 */
export const DisplaysStepNumberTest: Story = {
  args: {
    stepNumber: 5,
    description: 'Some instructions here.',
    ingredients: [],
    stepOutputUses: [],
    scaleFactor: 1,
    checkedIngredientIds: new Set(),
    onIngredientToggle: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Step number should be visible
    const stepBadge = canvas.getByTestId('step-number')
    await expect(stepBadge).toHaveTextContent('5')
  },
}

/**
 * ## Displays Title Test
 *
 * Verify title is displayed when provided.
 */
export const DisplaysTitleTest: Story = {
  args: {
    stepNumber: 1,
    title: 'Prepare the base',
    description: 'Some instructions here.',
    ingredients: [],
    stepOutputUses: [],
    scaleFactor: 1,
    checkedIngredientIds: new Set(),
    onIngredientToggle: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Title should be visible
    const title = canvas.getByRole('heading', { name: 'Prepare the base' })
    await expect(title).toBeInTheDocument()
  },
}

/**
 * ## Displays Description Test
 *
 * Verify description is displayed.
 */
export const DisplaysDescriptionTest: Story = {
  args: {
    stepNumber: 1,
    description: 'Mix everything together until smooth.',
    ingredients: [],
    stepOutputUses: [],
    scaleFactor: 1,
    checkedIngredientIds: new Set(),
    onIngredientToggle: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Description should be visible
    await expect(canvas.getByText('Mix everything together until smooth.')).toBeInTheDocument()
  },
}

/**
 * ## Contains IngredientList Test
 *
 * Verify ingredients are displayed via IngredientList.
 */
export const ContainsIngredientListTest: Story = {
  args: {
    stepNumber: 1,
    title: 'Mix ingredients',
    description: 'Combine all ingredients.',
    ingredients: sampleIngredients,
    stepOutputUses: [],
    scaleFactor: 1,
    checkedIngredientIds: new Set(),
    onIngredientToggle: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Ingredient list should be present
    const ingredientList = canvas.getByTestId('ingredient-list')
    await expect(ingredientList).toBeInTheDocument()

    // Should show ingredient names
    await expect(canvas.getByText(/all-purpose flour/)).toBeInTheDocument()
    await expect(canvas.getByText(/baking powder/)).toBeInTheDocument()
    await expect(canvas.getByText(/salt/)).toBeInTheDocument()
  },
}

/**
 * ## Contains StepOutputUseCallout Test
 *
 * Verify step output uses are displayed via StepOutputUseCallout.
 */
export const ContainsStepOutputUseCalloutTest: Story = {
  args: {
    stepNumber: 2,
    description: 'Use the prepared mixture.',
    ingredients: [],
    stepOutputUses: sampleStepOutputUses,
    scaleFactor: 1,
    checkedIngredientIds: new Set(),
    onIngredientToggle: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Step output callout should be present
    const callout = canvas.getByTestId('step-output-callout')
    await expect(callout).toBeInTheDocument()

    // Should show the step reference
    await expect(canvas.getByText(/Step 1/)).toBeInTheDocument()
    await expect(canvas.getByText(/Make the dough/)).toBeInTheDocument()
  },
}

/**
 * ## No StepOutputUseCallout When Empty Test
 *
 * Verify step output callout is not rendered when empty.
 */
export const NoStepOutputCalloutWhenEmptyTest: Story = {
  args: {
    stepNumber: 1,
    description: 'A simple step with no references.',
    ingredients: [],
    stepOutputUses: [],
    scaleFactor: 1,
    checkedIngredientIds: new Set(),
    onIngredientToggle: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Step output callout should NOT be present
    const callout = canvas.queryByTestId('step-output-callout')
    await expect(callout).not.toBeInTheDocument()
  },
}

/**
 * ## No IngredientList When Empty Test
 *
 * Verify ingredient list is not rendered when empty.
 */
export const NoIngredientListWhenEmptyTest: Story = {
  args: {
    stepNumber: 1,
    description: 'A step with no ingredients.',
    ingredients: [],
    stepOutputUses: [],
    scaleFactor: 1,
    checkedIngredientIds: new Set(),
    onIngredientToggle: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Ingredient list should NOT be present
    const ingredientList = canvas.queryByTestId('ingredient-list')
    await expect(ingredientList).not.toBeInTheDocument()
  },
}

/**
 * ## Ingredient Toggle Test
 *
 * Verify clicking an ingredient checkbox toggles its state.
 */
export const IngredientToggleTest: Story = {
  render: () => (
    <InteractiveStepCard
      stepNumber={1}
      title="Mix dry ingredients"
      description="Combine all dry ingredients."
      ingredients={sampleIngredients}
      stepOutputUses={[]}
      scaleFactor={1}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Find checkboxes
    const checkboxes = canvas.getAllByRole('checkbox')
    await expect(checkboxes.length).toBe(3)

    // First checkbox should be unchecked
    await expect(checkboxes[0]).not.toBeChecked()

    // Click first checkbox
    await userEvent.click(checkboxes[0])

    // First checkbox should now be checked
    await expect(checkboxes[0]).toBeChecked()

    // Click again to uncheck
    await userEvent.click(checkboxes[0])
    await expect(checkboxes[0]).not.toBeChecked()
  },
}

/**
 * ## Step Reference Click Test
 *
 * Verify clicking a step reference triggers the callback.
 */
export const StepReferenceClickTest: Story = {
  args: {
    stepNumber: 2,
    description: 'Use the prepared mixture.',
    ingredients: [],
    stepOutputUses: sampleStepOutputUses,
    scaleFactor: 1,
    checkedIngredientIds: new Set(),
    onIngredientToggle: fn(),
    onStepReferenceClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    // Find and click the step reference button
    const stepRefButton = canvas.getByRole('button', { name: /step 1/i })
    await userEvent.click(stepRefButton)

    // Callback should have been called with step number 1
    await expect(args.onStepReferenceClick).toHaveBeenCalledWith(1)
  },
}

// =============================================================================
// VISUAL STATES
// =============================================================================

/**
 * ## Mobile View
 *
 * How the card looks on a phone screen.
 */
export const MobileView: Story = {
  args: {
    stepNumber: 1,
    title: 'Make the batter',
    description:
      'Combine the dry ingredients in a large bowl. Create a well in the center and add the wet ingredients. Stir gently until just combined - some lumps are okay!',
    ingredients: sampleIngredients,
    stepOutputUses: [],
    scaleFactor: 1,
    checkedIngredientIds: new Set(),
    onIngredientToggle: fn(),
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
}

/**
 * ## Some Ingredients Checked
 *
 * Visual state with some ingredients checked off.
 */
export const SomeIngredientsChecked: Story = {
  args: {
    stepNumber: 1,
    title: 'Mix dry ingredients',
    description: 'Combine all dry ingredients in a bowl.',
    ingredients: sampleIngredients,
    stepOutputUses: [],
    scaleFactor: 1,
    checkedIngredientIds: new Set(['ing-1', 'ing-3']),
    onIngredientToggle: fn(),
  },
}

/**
 * ## Long Description
 *
 * Handling lengthy step descriptions.
 */
export const LongDescription: Story = {
  args: {
    stepNumber: 1,
    title: 'The critical folding step',
    description:
      "This is perhaps the most important step in making a perfect soufflé. Using a large rubber spatula, gently fold the meringue into the chocolate base in three additions. Start by stirring the first addition to lighten the base - this is okay. For the second and third additions, use the classic folding technique: cut down through the center of the mixture, scrape along the bottom of the bowl, and fold up and over. Rotate the bowl 90 degrees and repeat. Continue until no white streaks remain, but don't overdo it - you want to preserve as much air as possible. The mixture should be glossy and have increased in volume. Work quickly but gently.",
    ingredients: [],
    stepOutputUses: [],
    scaleFactor: 1,
    checkedIngredientIds: new Set(),
    onIngredientToggle: fn(),
  },
}

/**
 * ## All Visual States
 *
 * Overview of different states.
 */
export const AllVisualStates: Story = {
  render: () => (
    <div className="space-y-6 max-w-2xl mx-auto">
      <InteractiveStepCard
        stepNumber={1}
        title="With title and ingredients"
        description="A step with all the bells and whistles."
        ingredients={sampleIngredients}
        stepOutputUses={[]}
        scaleFactor={1}
      />
      <InteractiveStepCard
        stepNumber={2}
        description="A simple step without a title."
        ingredients={[]}
        stepOutputUses={[]}
        scaleFactor={1}
      />
      <InteractiveStepCard
        stepNumber={3}
        title="Using previous output"
        description="A step that references another step."
        ingredients={[]}
        stepOutputUses={sampleStepOutputUses}
        scaleFactor={1}
      />
      <InteractiveStepCard
        stepNumber={4}
        title="Everything at once"
        description="This step has ingredients, uses previous outputs, and a title."
        ingredients={sampleIngredients}
        stepOutputUses={sampleStepOutputUses}
        scaleFactor={2}
      />
    </div>
  ),
}
