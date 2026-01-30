import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { StepOutputUseCallout, type StepReference } from '../app/components/recipe/StepOutputUseCallout'

/**
 * # StepOutputUseCallout
 *
 * A visually distinctive callout that shows when a step uses outputs from
 * previous steps. Think of it as the "Previously, on your cooking adventure..."
 * moment before each step.
 *
 * This is the enhanced version of StepOutputUseDisplay, designed for the
 * recipe view experience with better visual hierarchy and kitchen readability.
 *
 * ## Design Principles
 *
 * - **Stand out but don't overwhelm**: Subtle colored border + icon
 * - **Clear reference**: Shows step number and title when available
 * - **Mobile-friendly**: Readable on phone screens at arm's length
 * - **Optional click-to-scroll**: For future navigation enhancement
 */
const meta: Meta<typeof StepOutputUseCallout> = {
  title: 'Recipe/StepOutputUseCallout',
  component: StepOutputUseCallout,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A callout component that displays step output references with enhanced styling.
Shows "Using output from Step X" with an optional step title.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    references: {
      description: 'Array of step references to display',
    },
    onStepClick: {
      action: 'stepClicked',
      description: 'Optional callback when a step reference is clicked',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// BASIC STORIES
// =============================================================================

/**
 * A single reference to a previous step with a title.
 */
export const SingleWithTitle: Story = {
  args: {
    references: [
      {
        id: '1',
        stepNumber: 2,
        stepTitle: 'Prepare the sauce',
      },
    ],
  },
}

/**
 * A single reference without a title (just the step number).
 */
export const SingleWithoutTitle: Story = {
  args: {
    references: [
      {
        id: '1',
        stepNumber: 3,
        stepTitle: null,
      },
    ],
  },
}

/**
 * Multiple references from different steps.
 */
export const MultipleReferences: Story = {
  args: {
    references: [
      {
        id: '1',
        stepNumber: 2,
        stepTitle: 'Caramelize the onions',
      },
      {
        id: '2',
        stepNumber: 4,
        stepTitle: 'Prepare the dough',
      },
      {
        id: '3',
        stepNumber: 5,
        stepTitle: null,
      },
    ],
  },
}

/**
 * Empty array should render nothing.
 */
export const EmptyReferences: Story = {
  args: {
    references: [],
  },
}

// =============================================================================
// VISUAL VARIANTS
// =============================================================================

/**
 * Shows how the callout looks in context (simulated step card).
 */
export const InContext: Story = {
  render: () => (
    <div className="max-w-md space-y-4">
      <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
        <div className="text-lg font-semibold mb-2">Step 5: Assemble the dish</div>
        <StepOutputUseCallout
          references={[
            { id: '1', stepNumber: 2, stepTitle: 'Prepare the sauce' },
            { id: '2', stepNumber: 3, stepTitle: 'Cook the pasta' },
          ]}
        />
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          Combine the pasta with the sauce, tossing gently to coat each strand...
        </p>
      </div>
    </div>
  ),
}

/**
 * Long step titles should wrap nicely.
 */
export const LongTitles: Story = {
  args: {
    references: [
      {
        id: '1',
        stepNumber: 2,
        stepTitle: 'Caramelize the onions slowly over low heat until deeply golden brown',
      },
      {
        id: '2',
        stepNumber: 4,
        stepTitle: 'Prepare the sourdough starter and let it proof overnight',
      },
    ],
  },
}

/**
 * Mobile viewport to verify readability.
 */
export const MobileView: Story = {
  args: {
    references: [
      { id: '1', stepNumber: 2, stepTitle: 'Prepare the sauce' },
      { id: '2', stepNumber: 3, stepTitle: 'Cook the pasta' },
    ],
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * ## Renders Step Numbers
 *
 * Verify that step numbers are displayed correctly.
 */
export const RendersStepNumbers: Story = {
  args: {
    references: [
      { id: '1', stepNumber: 3, stepTitle: null },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const content = canvas.getByTestId('step-output-callout')
    await expect(content).toHaveTextContent('Step 3')
  },
}

/**
 * ## Renders With Title
 *
 * Verify that step title is displayed when provided.
 */
export const RendersWithTitle: Story = {
  args: {
    references: [
      { id: '1', stepNumber: 2, stepTitle: 'Make the roux' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const content = canvas.getByTestId('step-output-callout')
    await expect(content).toHaveTextContent('Step 2')
    await expect(content).toHaveTextContent('Make the roux')
  },
}

/**
 * ## Empty Array Renders Nothing
 *
 * Verify that empty references array doesn't render anything.
 */
export const EmptyRendersNothing: Story = {
  args: {
    references: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Should not find the callout element
    const callout = canvas.queryByTestId('step-output-callout')
    await expect(callout).toBeNull()
  },
}

/**
 * ## Multiple Items Render
 *
 * Verify multiple references all render correctly.
 */
export const MultipleItemsRender: Story = {
  args: {
    references: [
      { id: '1', stepNumber: 1, stepTitle: 'First step' },
      { id: '2', stepNumber: 2, stepTitle: 'Second step' },
      { id: '3', stepNumber: 3, stepTitle: 'Third step' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const content = canvas.getByTestId('step-output-callout')
    await expect(content).toHaveTextContent('Step 1')
    await expect(content).toHaveTextContent('Step 2')
    await expect(content).toHaveTextContent('Step 3')
  },
}

// =============================================================================
// VISUAL SHOWCASE
// =============================================================================

/**
 * ## All Variants
 *
 * Shows all visual states together for comparison.
 */
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <span className="text-sm text-zinc-500 block mb-2">Single with title:</span>
        <StepOutputUseCallout
          references={[{ id: '1', stepNumber: 2, stepTitle: 'Prepare the sauce' }]}
        />
      </div>
      <div>
        <span className="text-sm text-zinc-500 block mb-2">Single without title:</span>
        <StepOutputUseCallout
          references={[{ id: '1', stepNumber: 3, stepTitle: null }]}
        />
      </div>
      <div>
        <span className="text-sm text-zinc-500 block mb-2">Multiple references:</span>
        <StepOutputUseCallout
          references={[
            { id: '1', stepNumber: 2, stepTitle: 'Caramelize the onions' },
            { id: '2', stepNumber: 4, stepTitle: 'Prepare the dough' },
          ]}
        />
      </div>
    </div>
  ),
}
