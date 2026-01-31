import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within, waitFor } from 'storybook/test'
import { StepDependencySelector } from '../../../app/components/recipe/StepDependencySelector'

/**
 * # StepDependencySelector
 *
 * Allows users to specify which previous steps a current step depends on.
 * Used for recipe flow visualization and timing calculations.
 *
 * ## Use Case
 *
 * Some recipe steps use the output of previous steps. For example:
 * - Step 3 "Add sauce to pasta" depends on Step 1 "Make sauce" and Step 2 "Cook pasta"
 * - This information helps with parallel cooking and timing optimization
 *
 * ## Features
 *
 * - **Dependency selection**: Choose from previous steps via dropdown
 * - **Selected chips**: Visual display of selected dependencies with remove button
 * - **AI suggestions**: Smart recommendations based on step content
 * - **Accept/Dismiss**: User can accept or dismiss AI suggestions
 *
 * ## Constraints
 *
 * - Only steps BEFORE the current step can be dependencies
 * - Step 1 always shows "No previous steps" (can't have dependencies)
 */
const meta: Meta<typeof StepDependencySelector> = {
  title: 'Recipe/Input/StepDependencySelector',
  component: StepDependencySelector,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Select which previous steps the current step depends on.

Useful for recipe flow visualization and parallel cooking optimization.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    currentStepNum: {
      control: { type: 'number', min: 1 },
      description: 'The current step number',
    },
    allSteps: {
      control: 'object',
      description: 'All steps in the recipe',
    },
    selectedDependencies: {
      control: 'object',
      description: 'Currently selected dependency step numbers',
    },
    onChange: {
      action: 'changed',
      description: 'Callback when dependencies change',
    },
    aiSuggestions: {
      control: 'object',
      description: 'AI-suggested dependencies',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables all interactions',
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-xl mx-auto p-4 bg-white dark:bg-zinc-900 rounded-lg">
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

const sampleSteps = [
  { stepNum: 1, description: 'Make the tomato sauce from scratch.' },
  { stepNum: 2, description: 'Cook pasta until al dente.' },
  { stepNum: 3, description: 'Prepare the meatballs.' },
  { stepNum: 4, description: 'Combine pasta with sauce and meatballs.' },
  { stepNum: 5, description: 'Garnish and serve.' },
]

// =============================================================================
// BASIC STATES
// =============================================================================

/**
 * First step - no previous steps available.
 */
export const FirstStep: Story = {
  args: {
    currentStepNum: 1,
    allSteps: sampleSteps,
    selectedDependencies: [],
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Step 1 cannot have dependencies as there are no previous steps.',
      },
    },
  },
}

/**
 * No dependencies selected.
 */
export const NoDependencies: Story = {
  args: {
    currentStepNum: 4,
    allSteps: sampleSteps,
    selectedDependencies: [],
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Step 4 with no dependencies selected yet. User can add from steps 1-3.',
      },
    },
  },
}

/**
 * Single dependency selected.
 */
export const SingleDependency: Story = {
  args: {
    currentStepNum: 4,
    allSteps: sampleSteps,
    selectedDependencies: [1],
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Step 4 depends on Step 1 (the sauce).',
      },
    },
  },
}

/**
 * Multiple dependencies selected.
 */
export const MultipleDependencies: Story = {
  args: {
    currentStepNum: 4,
    allSteps: sampleSteps,
    selectedDependencies: [1, 2, 3],
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Step 4 depends on all three previous steps (sauce, pasta, meatballs).',
      },
    },
  },
}

/**
 * Disabled state.
 */
export const DisabledState: Story = {
  args: {
    currentStepNum: 4,
    allSteps: sampleSteps,
    selectedDependencies: [1, 2],
    onChange: fn(),
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'All interactions disabled.',
      },
    },
  },
}

// =============================================================================
// AI SUGGESTIONS
// =============================================================================

/**
 * With AI suggestion.
 */
export const WithAiSuggestion: Story = {
  args: {
    currentStepNum: 4,
    allSteps: sampleSteps,
    selectedDependencies: [],
    onChange: fn(),
    aiSuggestions: [
      { stepNum: 1, reason: 'Uses sauce from step 1' },
      { stepNum: 2, reason: 'Uses pasta from step 2' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'AI suggests that step 4 likely depends on steps 1 and 2.',
      },
    },
  },
}

/**
 * AI suggestion with some already selected.
 */
export const AiSuggestionPartiallyAccepted: Story = {
  args: {
    currentStepNum: 4,
    allSteps: sampleSteps,
    selectedDependencies: [1],
    onChange: fn(),
    aiSuggestions: [
      { stepNum: 1, reason: 'Uses sauce from step 1' },
      { stepNum: 2, reason: 'Uses pasta from step 2' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Step 1 already selected. AI still suggests step 2.',
      },
    },
  },
}

/**
 * AI suggestion for simple step.
 */
export const SingleAiSuggestion: Story = {
  args: {
    currentStepNum: 5,
    allSteps: sampleSteps,
    selectedDependencies: [],
    onChange: fn(),
    aiSuggestions: [
      { stepNum: 4, reason: 'Garnishes the combined dish' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'AI suggests a single dependency for the final step.',
      },
    },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Test: Add dependency via dropdown.
 */
export const Test_AddDependency: Story = {
  args: {
    currentStepNum: 4,
    allSteps: sampleSteps,
    selectedDependencies: [],
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    // Click the dropdown trigger
    const dropdownButton = canvas.getByRole('combobox')
    await userEvent.click(dropdownButton)

    // Select Step 1
    const option = canvas.getByRole('option', { name: /step 1/i })
    await userEvent.click(option)

    // Verify onChange was called with Step 1
    await expect(args.onChange).toHaveBeenCalledWith([1])
  },
  parameters: {
    docs: {
      description: {
        story: 'Selecting a step from dropdown adds it as a dependency.',
      },
    },
  },
}

/**
 * Test: Remove dependency.
 */
export const Test_RemoveDependency: Story = {
  args: {
    currentStepNum: 4,
    allSteps: sampleSteps,
    selectedDependencies: [1, 2],
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    // Find and click remove button on Step 1 chip
    const removeButtons = canvas.getAllByRole('button', { name: /remove/i })
    await userEvent.click(removeButtons[0])

    // Verify onChange was called without Step 1
    await expect(args.onChange).toHaveBeenCalledWith([2])
  },
  parameters: {
    docs: {
      description: {
        story: 'Clicking X on a chip removes that dependency.',
      },
    },
  },
}

/**
 * Test: Accept AI suggestion.
 */
export const Test_AcceptAiSuggestion: Story = {
  args: {
    currentStepNum: 4,
    allSteps: sampleSteps,
    selectedDependencies: [],
    onChange: fn(),
    aiSuggestions: [
      { stepNum: 1, reason: 'Uses sauce' },
    ],
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    // Click "Add it" button
    const addButton = canvas.getByRole('button', { name: /add it/i })
    await userEvent.click(addButton)

    // Verify onChange was called with the suggested step
    await expect(args.onChange).toHaveBeenCalledWith([1])
  },
  parameters: {
    docs: {
      description: {
        story: 'Clicking "Add it" on an AI suggestion adds it as a dependency.',
      },
    },
  },
}

/**
 * Test: Dismiss AI suggestion.
 */
export const Test_DismissAiSuggestion: Story = {
  args: {
    currentStepNum: 4,
    allSteps: sampleSteps,
    selectedDependencies: [],
    onChange: fn(),
    aiSuggestions: [
      { stepNum: 1, reason: 'Uses sauce' },
    ],
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    // Click "Dismiss" button
    const dismissButton = canvas.getByRole('button', { name: /dismiss/i })
    await userEvent.click(dismissButton)

    // Suggestion should disappear
    await waitFor(() => {
      expect(canvas.queryByText(/looks like a dependency/i)).not.toBeInTheDocument()
    })

    // onChange should NOT have been called
    await expect(args.onChange).not.toHaveBeenCalled()
  },
  parameters: {
    docs: {
      description: {
        story: 'Dismissing an AI suggestion removes it without adding the dependency.',
      },
    },
  },
}

/**
 * Test: Disabled state prevents interaction.
 */
export const Test_DisabledState: Story = {
  args: {
    currentStepNum: 4,
    allSteps: sampleSteps,
    selectedDependencies: [1],
    onChange: fn(),
    aiSuggestions: [{ stepNum: 2 }],
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Dropdown should be disabled
    const dropdownButton = canvas.getByRole('combobox')
    await expect(dropdownButton).toBeDisabled()

    // Remove button should be disabled
    const removeButton = canvas.getByRole('button', { name: /remove/i })
    await expect(removeButton).toBeDisabled()

    // AI suggestion buttons should be disabled
    const addButton = canvas.getByRole('button', { name: /add it/i })
    await expect(addButton).toBeDisabled()
  },
  parameters: {
    docs: {
      description: {
        story: 'When disabled, no interactions are possible.',
      },
    },
  },
}

// =============================================================================
// EDGE CASES
// =============================================================================

/**
 * Second step - only one option.
 */
export const SecondStep: Story = {
  args: {
    currentStepNum: 2,
    allSteps: sampleSteps,
    selectedDependencies: [],
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Step 2 can only depend on Step 1.',
      },
    },
  },
}

/**
 * Many previous steps.
 */
export const ManyPreviousSteps: Story = {
  args: {
    currentStepNum: 10,
    allSteps: [
      { stepNum: 1, description: 'Step 1 description' },
      { stepNum: 2, description: 'Step 2 description' },
      { stepNum: 3, description: 'Step 3 description' },
      { stepNum: 4, description: 'Step 4 description' },
      { stepNum: 5, description: 'Step 5 description' },
      { stepNum: 6, description: 'Step 6 description' },
      { stepNum: 7, description: 'Step 7 description' },
      { stepNum: 8, description: 'Step 8 description' },
      { stepNum: 9, description: 'Step 9 description' },
      { stepNum: 10, description: 'Step 10 description' },
    ],
    selectedDependencies: [3, 5, 7],
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Step 10 with many previous steps available and some selected.',
      },
    },
  },
}

/**
 * All previous steps selected.
 */
export const AllSelected: Story = {
  args: {
    currentStepNum: 4,
    allSteps: sampleSteps,
    selectedDependencies: [1, 2, 3],
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'All previous steps are selected as dependencies.',
      },
    },
  },
}

/**
 * Long step descriptions in dropdown.
 */
export const LongDescriptions: Story = {
  args: {
    currentStepNum: 3,
    allSteps: [
      { stepNum: 1, description: 'This is a very long step description that explains in great detail what needs to be done and why it is important for the final result.' },
      { stepNum: 2, description: 'Another extremely verbose step with lots of detailed instructions about technique and timing.' },
      { stepNum: 3, description: 'Current step' },
    ],
    selectedDependencies: [],
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests dropdown display with very long step descriptions.',
      },
    },
  },
}
