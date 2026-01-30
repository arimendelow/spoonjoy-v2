import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { useState } from 'react'
import { RecipeHeader, type RecipeHeaderProps } from '../app/components/recipe/RecipeHeader'

/**
 * # RecipeHeader
 *
 * The hero section of every recipe page. Features a **prominent, beautiful recipe image**
 * because food is visual and images make everything more appetizing.
 *
 * This component handles the recipe's "above the fold" content — the image, title,
 * chef credit, servings info with scaling, and owner actions.
 *
 * ## Design Principles
 *
 * - **PROMINENT IMAGE**: Large hero-style display, images are pretty, use them!
 * - **Mobile-first**: Looks great on phone screens in the kitchen
 * - **Clear hierarchy**: Title stands out, supporting info is accessible but secondary
 * - **Integrated scaling**: ScaleSelector + scaled servings text work together
 * - **Owner actions**: Edit/delete only visible to recipe owners
 */
const meta: Meta<typeof RecipeHeader> = {
  title: 'Recipe/RecipeHeader',
  component: RecipeHeader,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
The hero section of a recipe page featuring a prominent image, title, chef info,
servings with scaling controls, and owner actions.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Recipe title',
    },
    description: {
      control: 'text',
      description: 'Recipe description (optional)',
    },
    chefName: {
      control: 'text',
      description: "Chef's display name",
    },
    imageUrl: {
      control: 'text',
      description: 'URL to recipe image (optional)',
    },
    servings: {
      control: 'text',
      description: 'Servings text (e.g., "Serves 4")',
    },
    scaleFactor: {
      control: { type: 'number', min: 0.25, max: 10, step: 0.25 },
      description: 'Current scale factor',
    },
    onScaleChange: {
      action: 'scaleChanged',
      description: 'Callback when scale factor changes',
    },
    isOwner: {
      control: 'boolean',
      description: 'Whether current user owns this recipe',
    },
    recipeId: {
      control: 'text',
      description: 'Recipe ID for edit/delete actions',
    },
    onDelete: {
      action: 'delete',
      description: 'Callback when delete is confirmed',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Sample data
const sampleRecipe = {
  title: 'Classic Chocolate Chip Cookies',
  description:
    'Crispy on the edges, chewy in the middle. These cookies are the perfect balance of sweet and salty, with pools of melted chocolate in every bite.',
  chefName: 'Julia Baker',
  imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=1200&h=800&fit=crop',
  servings: 'Makes 24 cookies',
  recipeId: 'recipe-123',
}

// =============================================================================
// BASIC STORIES
// =============================================================================

/**
 * Default recipe header with all fields populated.
 */
export const Default: Story = {
  args: {
    ...sampleRecipe,
    scaleFactor: 1,
    onScaleChange: fn(),
    isOwner: false,
  },
}

/**
 * Owner view with edit/delete buttons visible.
 */
export const OwnerView: Story = {
  args: {
    ...sampleRecipe,
    scaleFactor: 1,
    onScaleChange: fn(),
    isOwner: true,
    onDelete: fn(),
  },
}

/**
 * Non-owner view - edit/delete buttons should NOT be visible.
 */
export const NonOwnerView: Story = {
  args: {
    ...sampleRecipe,
    scaleFactor: 1,
    onScaleChange: fn(),
    isOwner: false,
  },
}

/**
 * Recipe without an image - should show a placeholder.
 */
export const NoImage: Story = {
  args: {
    ...sampleRecipe,
    imageUrl: undefined,
    scaleFactor: 1,
    onScaleChange: fn(),
    isOwner: false,
  },
}

/**
 * Recipe without a description.
 */
export const NoDescription: Story = {
  args: {
    ...sampleRecipe,
    description: undefined,
    scaleFactor: 1,
    onScaleChange: fn(),
    isOwner: false,
  },
}

/**
 * Recipe without servings information.
 */
export const NoServings: Story = {
  args: {
    ...sampleRecipe,
    servings: undefined,
    scaleFactor: 1,
    onScaleChange: fn(),
    isOwner: false,
  },
}

// =============================================================================
// SCALING STORIES
// =============================================================================

/**
 * Scaled to 2× - servings text should double.
 */
export const ScaledDouble: Story = {
  args: {
    ...sampleRecipe,
    scaleFactor: 2,
    onScaleChange: fn(),
    isOwner: false,
  },
}

/**
 * Scaled to 0.5× - servings text should halve.
 */
export const ScaledHalf: Story = {
  args: {
    ...sampleRecipe,
    scaleFactor: 0.5,
    onScaleChange: fn(),
    isOwner: false,
  },
}

/**
 * Range-based servings text (e.g., "Feeds 2-4 people").
 */
export const RangeServings: Story = {
  args: {
    ...sampleRecipe,
    servings: 'Feeds 2-4 people',
    scaleFactor: 2,
    onScaleChange: fn(),
    isOwner: false,
  },
}

// =============================================================================
// INTERACTIVE WRAPPER
// =============================================================================

function InteractiveRecipeHeader({
  initialScale = 1,
  ...props
}: Omit<RecipeHeaderProps, 'scaleFactor' | 'onScaleChange'> & {
  initialScale?: number
}) {
  const [scaleFactor, setScaleFactor] = useState(initialScale)

  return (
    <RecipeHeader
      {...props}
      scaleFactor={scaleFactor}
      onScaleChange={setScaleFactor}
    />
  )
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * ## Displays Title Test
 *
 * Verify title is displayed prominently.
 */
export const DisplaysTitleTest: Story = {
  args: {
    ...sampleRecipe,
    scaleFactor: 1,
    onScaleChange: fn(),
    isOwner: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Title should be visible as a heading
    const title = canvas.getByRole('heading', { name: sampleRecipe.title })
    await expect(title).toBeInTheDocument()
  },
}

/**
 * ## Displays Chef Name Test
 *
 * Verify chef name is displayed.
 */
export const DisplaysChefNameTest: Story = {
  args: {
    ...sampleRecipe,
    scaleFactor: 1,
    onScaleChange: fn(),
    isOwner: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Chef name should be visible
    await expect(canvas.getByText(sampleRecipe.chefName)).toBeInTheDocument()
  },
}

/**
 * ## Displays Description Test
 *
 * Verify description is displayed when provided.
 */
export const DisplaysDescriptionTest: Story = {
  args: {
    ...sampleRecipe,
    scaleFactor: 1,
    onScaleChange: fn(),
    isOwner: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Description should be visible
    await expect(canvas.getByText(sampleRecipe.description)).toBeInTheDocument()
  },
}

/**
 * ## Displays Servings Test
 *
 * Verify servings text is displayed with scaling.
 */
export const DisplaysServingsTest: Story = {
  args: {
    ...sampleRecipe,
    scaleFactor: 1,
    onScaleChange: fn(),
    isOwner: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Original servings should be visible at 1× scale
    await expect(canvas.getByText(/makes 24 cookies/i)).toBeInTheDocument()
  },
}

/**
 * ## Scaled Servings Test
 *
 * Verify servings text scales with scaleFactor.
 */
export const ScaledServingsTest: Story = {
  args: {
    ...sampleRecipe,
    scaleFactor: 2,
    onScaleChange: fn(),
    isOwner: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // At 2× scale, "Makes 24 cookies" should become "Makes 48 cookies"
    await expect(canvas.getByText(/makes 48 cookies/i)).toBeInTheDocument()
  },
}

/**
 * ## Contains ScaleSelector Test
 *
 * Verify ScaleSelector is present and functional.
 */
export const ContainsScaleSelectorTest: Story = {
  render: () => (
    <InteractiveRecipeHeader
      {...sampleRecipe}
      initialScale={1}
      isOwner={false}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // ScaleSelector elements should be present
    const scaleDisplay = canvas.getByTestId('scale-display')
    await expect(scaleDisplay).toHaveTextContent('1×')

    // Plus and minus buttons should be present
    const plusButton = canvas.getByTestId('scale-plus')
    const minusButton = canvas.getByTestId('scale-minus')
    await expect(plusButton).toBeInTheDocument()
    await expect(minusButton).toBeInTheDocument()
  },
}

/**
 * ## ScaleSelector Changes Scale Test
 *
 * Verify clicking ScaleSelector changes the scale factor.
 */
export const ScaleSelectorChangesScaleTest: Story = {
  render: () => (
    <InteractiveRecipeHeader
      {...sampleRecipe}
      initialScale={1}
      isOwner={false}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Initial state
    const scaleDisplay = canvas.getByTestId('scale-display')
    await expect(scaleDisplay).toHaveTextContent('1×')
    await expect(canvas.getByText(/makes 24 cookies/i)).toBeInTheDocument()

    // Click plus to scale up
    const plusButton = canvas.getByTestId('scale-plus')
    await userEvent.click(plusButton)
    await userEvent.click(plusButton)
    await userEvent.click(plusButton)
    await userEvent.click(plusButton)

    // Now at 2× scale
    await expect(scaleDisplay).toHaveTextContent('2×')
    await expect(canvas.getByText(/makes 48 cookies/i)).toBeInTheDocument()
  },
}

/**
 * ## Image Display Test
 *
 * Verify image is displayed when provided.
 */
export const ImageDisplayTest: Story = {
  args: {
    ...sampleRecipe,
    scaleFactor: 1,
    onScaleChange: fn(),
    isOwner: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Image should be present
    const image = canvas.getByTestId('recipe-image')
    await expect(image).toBeInTheDocument()
  },
}

/**
 * ## Image Placeholder Test
 *
 * Verify placeholder is shown when no image provided.
 */
export const ImagePlaceholderTest: Story = {
  args: {
    ...sampleRecipe,
    imageUrl: undefined,
    scaleFactor: 1,
    onScaleChange: fn(),
    isOwner: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Placeholder should be present
    const placeholder = canvas.getByTestId('recipe-image-placeholder')
    await expect(placeholder).toBeInTheDocument()
  },
}

/**
 * ## Owner Sees Edit Button Test
 *
 * Verify edit button is visible for owners.
 */
export const OwnerSeesEditButtonTest: Story = {
  args: {
    ...sampleRecipe,
    scaleFactor: 1,
    onScaleChange: fn(),
    isOwner: true,
    onDelete: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Edit button should be visible
    const editButton = canvas.getByRole('link', { name: /edit/i })
    await expect(editButton).toBeInTheDocument()
    await expect(editButton).toHaveAttribute('href', `/recipes/${sampleRecipe.recipeId}/edit`)
  },
}

/**
 * ## Owner Sees Delete Button Test
 *
 * Verify delete button is visible for owners.
 */
export const OwnerSeesDeleteButtonTest: Story = {
  args: {
    ...sampleRecipe,
    scaleFactor: 1,
    onScaleChange: fn(),
    isOwner: true,
    onDelete: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Delete button should be visible
    const deleteButton = canvas.getByRole('button', { name: /delete/i })
    await expect(deleteButton).toBeInTheDocument()
  },
}

/**
 * ## Non-Owner No Edit Delete Test
 *
 * Verify edit/delete buttons are NOT visible for non-owners.
 */
export const NonOwnerNoEditDeleteTest: Story = {
  args: {
    ...sampleRecipe,
    scaleFactor: 1,
    onScaleChange: fn(),
    isOwner: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Edit and delete buttons should NOT be visible
    const editButton = canvas.queryByRole('link', { name: /edit/i })
    const deleteButton = canvas.queryByRole('button', { name: /delete/i })
    await expect(editButton).not.toBeInTheDocument()
    await expect(deleteButton).not.toBeInTheDocument()
  },
}

/**
 * ## Share Button Renders Test
 *
 * Verify share button is always visible (for all users).
 */
export const ShareButtonRendersTest: Story = {
  args: {
    ...sampleRecipe,
    scaleFactor: 1,
    onScaleChange: fn(),
    isOwner: false,
    onShare: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Share button should be visible
    const shareButton = canvas.getByRole('button', { name: /share/i })
    await expect(shareButton).toBeInTheDocument()
  },
}

/**
 * ## Share Button Calls onShare Test
 *
 * Verify clicking share button calls the onShare callback.
 */
export const ShareButtonCallsOnShareTest: Story = {
  args: {
    ...sampleRecipe,
    scaleFactor: 1,
    onScaleChange: fn(),
    isOwner: false,
    onShare: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    // Click the share button
    const shareButton = canvas.getByRole('button', { name: /share/i })
    await userEvent.click(shareButton)

    // onShare should have been called
    await expect(args.onShare).toHaveBeenCalled()
  },
}

// =============================================================================
// VISUAL STATES
// =============================================================================

/**
 * ## Mobile View
 *
 * How the header looks on a phone screen (kitchen use case).
 */
export const MobileView: Story = {
  args: {
    ...sampleRecipe,
    scaleFactor: 1,
    onScaleChange: fn(),
    isOwner: true,
    onDelete: fn(),
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
}

/**
 * ## Mobile View No Image
 *
 * Mobile view with placeholder instead of image.
 */
export const MobileViewNoImage: Story = {
  args: {
    ...sampleRecipe,
    imageUrl: undefined,
    scaleFactor: 1,
    onScaleChange: fn(),
    isOwner: false,
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
}

/**
 * ## Desktop View
 *
 * Full desktop experience.
 */
export const DesktopView: Story = {
  args: {
    ...sampleRecipe,
    scaleFactor: 1,
    onScaleChange: fn(),
    isOwner: true,
    onDelete: fn(),
  },
  parameters: {
    viewport: { defaultViewport: 'desktop' },
  },
}

/**
 * ## Long Title
 *
 * Handling very long recipe titles.
 */
export const LongTitle: Story = {
  args: {
    ...sampleRecipe,
    title: "Grandma's Famous Super Delicious World-Renowned Award-Winning Chocolate Chip Cookies",
    scaleFactor: 1,
    onScaleChange: fn(),
    isOwner: false,
  },
}

/**
 * ## Long Description
 *
 * Handling lengthy descriptions.
 */
export const LongDescription: Story = {
  args: {
    ...sampleRecipe,
    description:
      "These aren't just any cookies - they're a labor of love passed down through four generations. " +
      "Starting with my great-grandmother's original recipe from 1923, each generation has added their own twist. " +
      "My grandmother added the brown butter technique, my mother perfected the chocolate ratio, " +
      "and I've optimized the resting time. The result is a cookie that's crispy on the edges, " +
      "impossibly chewy in the middle, with deep notes of caramel from the browned butter " +
      "and pools of melted chocolate in every bite.",
    scaleFactor: 1,
    onScaleChange: fn(),
    isOwner: false,
  },
}

/**
 * ## All Visual States
 *
 * Overview of different states side by side.
 */
export const AllVisualStates: Story = {
  render: () => (
    <div className="space-y-12">
      <div>
        <p className="text-sm text-zinc-500 mb-2 px-4">With image, owner:</p>
        <InteractiveRecipeHeader
          {...sampleRecipe}
          isOwner={true}
          onDelete={() => {}}
        />
      </div>
      <div>
        <p className="text-sm text-zinc-500 mb-2 px-4">Without image, non-owner:</p>
        <InteractiveRecipeHeader
          {...sampleRecipe}
          imageUrl={undefined}
          isOwner={false}
        />
      </div>
      <div>
        <p className="text-sm text-zinc-500 mb-2 px-4">Minimal (no description, no servings):</p>
        <InteractiveRecipeHeader
          title={sampleRecipe.title}
          chefName={sampleRecipe.chefName}
          recipeId={sampleRecipe.recipeId}
          isOwner={false}
        />
      </div>
    </div>
  ),
}
