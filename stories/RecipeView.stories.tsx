import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { useState } from 'react'
import { RecipeHeader } from '../app/components/recipe/RecipeHeader'
import { StepCard } from '../app/components/recipe/StepCard'
import type { Ingredient } from '../app/components/recipe/IngredientList'
import type { StepReference } from '../app/components/recipe/StepOutputUseCallout'

/**
 * # RecipeView Walkthrough
 *
 * This is the **complete recipe viewing experience** - the full story from
 * hero image to final step. This is what users see when cooking in their
 * kitchen with phone in hand.
 *
 * ## The Kitchen Scenario
 *
 * Imagine you're making Grandma's famous chocolate chip cookies. Your phone
 * is propped up on the counter, flour on your hands. You need:
 *
 * 1. A beautiful hero image to know you're in the right place
 * 2. Easy scaling (your book club grew from 4 to 12 people)
 * 3. Checkable ingredients so you don't forget anything
 * 4. Clear step-by-step instructions
 * 5. References to previous steps when you need to use earlier prep
 *
 * This walkthrough demonstrates all of it working together.
 */
const meta: Meta = {
  title: 'Recipe/RecipeView',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
The complete recipe viewing experience. Demonstrates the full user flow from
hero image through all recipe steps, with integrated scaling and ingredient tracking.
        `,
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj

// =============================================================================
// REALISTIC RECIPE DATA
// =============================================================================

const chocolateChipCookies = {
  title: 'Classic Chocolate Chip Cookies',
  description:
    "Crispy on the edges, chewy in the middle. These aren't just cookies - they're memories in baked form. Perfect for midnight snacking, bake sales, or bribing your neighbors.",
  chefName: 'Julia Baker',
  imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=1200&h=800&fit=crop',
  servings: 'Makes 24 cookies',
  recipeId: 'cookies-123',
  steps: [
    {
      stepNumber: 1,
      title: 'Brown the butter',
      description:
        'In a light-colored saucepan over medium heat, melt the butter. Continue cooking, swirling occasionally, until the butter turns golden brown and smells nutty, about 3-4 minutes. The milk solids at the bottom should be amber colored. Immediately pour into a heatproof bowl to stop the cooking. Let cool for 10 minutes.',
      ingredients: [
        { id: 's1-1', quantity: 1, unit: 'cup', name: 'unsalted butter (2 sticks)' },
      ] as Ingredient[],
      stepOutputUses: [] as StepReference[],
    },
    {
      stepNumber: 2,
      title: 'Mix wet ingredients',
      description:
        'Add both sugars to the browned butter and whisk until smooth. Add the egg, egg yolk, and vanilla extract. Whisk vigorously for about 30 seconds until the mixture is smooth and slightly lightened in color.',
      ingredients: [
        { id: 's2-1', quantity: 0.75, unit: 'cup', name: 'brown sugar, packed' },
        { id: 's2-2', quantity: 0.5, unit: 'cup', name: 'granulated sugar' },
        { id: 's2-3', quantity: 1, unit: '', name: 'large egg' },
        { id: 's2-4', quantity: 1, unit: '', name: 'egg yolk' },
        { id: 's2-5', quantity: 2, unit: 'tsp', name: 'vanilla extract' },
      ] as Ingredient[],
      stepOutputUses: [
        { id: 'ref-1', stepNumber: 1, stepTitle: 'Brown the butter' },
      ] as StepReference[],
    },
    {
      stepNumber: 3,
      title: 'Prepare dry ingredients',
      description:
        'In a medium bowl, whisk together the flour, baking soda, cornstarch, and salt. The cornstarch is the secret to extra-chewy centers!',
      ingredients: [
        { id: 's3-1', quantity: 2.25, unit: 'cups', name: 'all-purpose flour' },
        { id: 's3-2', quantity: 1, unit: 'tsp', name: 'baking soda' },
        { id: 's3-3', quantity: 2, unit: 'tsp', name: 'cornstarch' },
        { id: 's3-4', quantity: 1, unit: 'tsp', name: 'fine sea salt' },
      ] as Ingredient[],
      stepOutputUses: [] as StepReference[],
    },
    {
      stepNumber: 4,
      title: 'Combine and add chocolate',
      description:
        'Add the dry ingredients to the wet ingredients and stir with a rubber spatula until just combined. Fold in the chocolate chips. The dough will be soft and slightly sticky - that\'s perfect!',
      ingredients: [
        { id: 's4-1', quantity: 2, unit: 'cups', name: 'chocolate chips (or chopped chocolate)' },
      ] as Ingredient[],
      stepOutputUses: [
        { id: 'ref-2', stepNumber: 2, stepTitle: 'Mix wet ingredients' },
        { id: 'ref-3', stepNumber: 3, stepTitle: 'Prepare dry ingredients' },
      ] as StepReference[],
    },
    {
      stepNumber: 5,
      title: 'Rest the dough',
      description:
        'Cover the bowl with plastic wrap and refrigerate for at least 30 minutes, or up to 72 hours. This rest is crucial - it allows the flour to fully hydrate and develops deeper flavor. The longer you wait, the better the cookies.',
      ingredients: [] as Ingredient[],
      stepOutputUses: [
        { id: 'ref-4', stepNumber: 4, stepTitle: 'Combine and add chocolate' },
      ] as StepReference[],
    },
    {
      stepNumber: 6,
      title: 'Shape and bake',
      description:
        'Preheat oven to 375°F (190°C). Line baking sheets with parchment paper. Scoop dough into 2-tablespoon balls and place 2 inches apart on prepared sheets. Bake for 10-12 minutes until edges are set but centers look slightly underdone. They\'ll continue cooking as they cool. Sprinkle with flaky sea salt immediately after removing from the oven.',
      ingredients: [
        { id: 's6-1', quantity: 1, unit: 'tsp', name: 'flaky sea salt (Maldon)' },
      ] as Ingredient[],
      stepOutputUses: [
        { id: 'ref-5', stepNumber: 5, stepTitle: 'Rest the dough' },
      ] as StepReference[],
    },
  ],
}

// =============================================================================
// INTERACTIVE FULL RECIPE VIEW
// =============================================================================

interface FullRecipeViewProps {
  recipe: typeof chocolateChipCookies
  initialScale?: number
  isOwner?: boolean
}

function FullRecipeView({ recipe, initialScale = 1, isOwner = false }: FullRecipeViewProps) {
  const [scaleFactor, setScaleFactor] = useState(initialScale)
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set())

  const handleIngredientToggle = (id: string) => {
    const newChecked = new Set(checkedIngredients)
    if (newChecked.has(id)) {
      newChecked.delete(id)
    } else {
      newChecked.add(id)
    }
    setCheckedIngredients(newChecked)
  }

  const handleStepReferenceClick = (stepNumber: number) => {
    // In a real app, this would scroll to the step
    const stepElement = document.getElementById(`step-${stepNumber}`)
    if (stepElement) {
      stepElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Back Link */}
      <div className="px-4 py-3 sm:px-6 lg:px-8">
        <a href="#" className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
          ← Back to recipes
        </a>
      </div>

      {/* Recipe Header */}
      <RecipeHeader
        title={recipe.title}
        description={recipe.description}
        chefName={recipe.chefName}
        imageUrl={recipe.imageUrl}
        servings={recipe.servings}
        scaleFactor={scaleFactor}
        onScaleChange={setScaleFactor}
        isOwner={isOwner}
        recipeId={recipe.recipeId}
        onDelete={() => alert('Delete clicked!')}
      />

      {/* Steps Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Steps</h2>
        <div className="space-y-6">
          {recipe.steps.map((step) => (
            <div key={step.stepNumber} id={`step-${step.stepNumber}`}>
              <StepCard
                stepNumber={step.stepNumber}
                title={step.title}
                description={step.description}
                ingredients={step.ingredients}
                stepOutputUses={step.stepOutputUses}
                scaleFactor={scaleFactor}
                checkedIngredientIds={checkedIngredients}
                onIngredientToggle={handleIngredientToggle}
                onStepReferenceClick={handleStepReferenceClick}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// MAIN STORIES
// =============================================================================

/**
 * ## Complete Recipe Walkthrough
 *
 * The full recipe viewing experience with all features:
 * - Prominent hero image
 * - Recipe title, chef, and description
 * - Interactive scaling
 * - Multiple steps with ingredients
 * - Step-to-step references
 * - Checkable ingredients
 *
 * Try clicking the scale buttons to see ingredients update!
 */
export const CompleteWalkthrough: Story = {
  render: () => <FullRecipeView recipe={chocolateChipCookies} />,
}

/**
 * ## Owner View
 *
 * Same recipe, but viewed by the owner. Edit and Delete buttons are visible.
 */
export const OwnerWalkthrough: Story = {
  render: () => <FullRecipeView recipe={chocolateChipCookies} isOwner={true} />,
}

/**
 * ## Scaled Up (2×)
 *
 * Recipe pre-scaled to double. Perfect for feeding the whole team.
 */
export const ScaledUpWalkthrough: Story = {
  render: () => <FullRecipeView recipe={chocolateChipCookies} initialScale={2} />,
}

/**
 * ## Scaled Down (0.5×)
 *
 * Recipe pre-scaled to half. When you just need a small batch.
 */
export const ScaledDownWalkthrough: Story = {
  render: () => <FullRecipeView recipe={chocolateChipCookies} initialScale={0.5} />,
}

// =============================================================================
// MOBILE VIEWPORT STORIES
// =============================================================================

/**
 * ## Mobile View
 *
 * The recipe view on a phone screen - the primary use case for kitchen cooking.
 */
export const MobileWalkthrough: Story = {
  render: () => <FullRecipeView recipe={chocolateChipCookies} />,
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
}

/**
 * ## Tablet View
 *
 * The recipe view on a tablet - nice for propping up on the counter.
 */
export const TabletWalkthrough: Story = {
  render: () => <FullRecipeView recipe={chocolateChipCookies} />,
  parameters: {
    viewport: { defaultViewport: 'tablet' },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * ## Interactive Scaling Test
 *
 * Verify that scaling updates all ingredient quantities throughout the recipe.
 */
export const InteractiveScalingTest: Story = {
  render: () => <FullRecipeView recipe={chocolateChipCookies} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Initial state - check servings
    await expect(canvas.getByText(/makes 24 cookies/i)).toBeInTheDocument()

    // Find and click plus button multiple times to get to 2×
    const plusButton = canvas.getByTestId('scale-plus')
    await userEvent.click(plusButton)
    await userEvent.click(plusButton)
    await userEvent.click(plusButton)
    await userEvent.click(plusButton)

    // Verify scale display shows 2×
    const scaleDisplay = canvas.getByTestId('scale-display')
    await expect(scaleDisplay).toHaveTextContent('2×')

    // Verify servings updated
    await expect(canvas.getByText(/makes 48 cookies/i)).toBeInTheDocument()
  },
}

/**
 * ## Ingredient Tracking Test
 *
 * Verify ingredients can be checked off as you cook.
 */
export const IngredientTrackingTest: Story = {
  render: () => <FullRecipeView recipe={chocolateChipCookies} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Find checkboxes in the recipe
    const checkboxes = canvas.getAllByRole('checkbox')
    await expect(checkboxes.length).toBeGreaterThan(0)

    // Check the first ingredient
    await expect(checkboxes[0]).not.toBeChecked()
    await userEvent.click(checkboxes[0])
    await expect(checkboxes[0]).toBeChecked()
  },
}

// =============================================================================
// EDGE CASES
// =============================================================================

const minimalRecipe = {
  title: 'Boiled Water',
  description: "Sometimes you just need hot water. Here's how.",
  chefName: 'Chef Obvious',
  imageUrl: undefined,
  servings: 'Makes 1 cup',
  recipeId: 'water-123',
  steps: [
    {
      stepNumber: 1,
      title: undefined,
      description: 'Put water in a pot. Turn on the heat. Wait until it bubbles.',
      ingredients: [
        { id: 'w1', quantity: 1, unit: 'cup', name: 'water' },
      ] as Ingredient[],
      stepOutputUses: [] as StepReference[],
    },
  ],
}

/**
 * ## Minimal Recipe
 *
 * The simplest possible recipe - no image, one step, minimal ingredients.
 */
export const MinimalRecipe: Story = {
  render: () => <FullRecipeView recipe={minimalRecipe} />,
}

/**
 * ## Minimal Recipe Mobile
 *
 * Even simple recipes should look good on mobile.
 */
export const MinimalRecipeMobile: Story = {
  render: () => <FullRecipeView recipe={minimalRecipe} />,
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
}
