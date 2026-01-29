import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { StepOutputUseDisplay, type StepOutputUse } from '../app/components/StepOutputUseDisplay'

/**
 * # StepOutputUseDisplay
 *
 * **The new hotness. The pièce de résistance. The component that finally makes
 * recipe dependencies *visual*.**
 *
 * You know that moment in cooking shows when the chef casually mentions
 * "now fold in the caramelized onions we made earlier"? And you're sitting there
 * thinking "WHAT caramelized onions? When did THAT happen?!" This component
 * exists so your users never have that moment.
 *
 * StepOutputUseDisplay shows users which previous steps they'll need outputs from
 * before starting the current step. It's the "Previously on..." recap for your
 * recipe, the "Here's what you'll need" before the boss fight.
 *
 * ## Why This Component Matters
 *
 * Complex recipes are orchestration problems. You're not just following steps
 * linearly—you're managing parallel workstreams, timing dependencies, and hoping
 * that thing you put in the oven 40 minutes ago didn't burn while you were
 * julienning carrots.
 *
 * This component surfaces those dependencies explicitly:
 *
 * - **Step 5**: "Mix the dough" → Uses output from Step 2 (Yeast mixture)
 * - **Step 8**: "Assemble lasagna" → Uses outputs from Steps 3, 5, and 6
 * - **Step 12**: "Pray" → Uses output from Step 11 (Your first soufflé attempt)
 *
 * ## The Philosophy
 *
 * Recipes are directed acyclic graphs pretending to be ordered lists. This
 * component helps users see the graph. It's not just about showing what comes
 * next—it's about showing what needs to come *together*.
 *
 * ## Features
 *
 * - **Smart empty handling** - No dependencies? No render. Clean UI.
 * - **Title or number** - Shows step title when available, falls back to number
 * - **Simple list** - Dependencies displayed as a clean, scannable list
 * - **Consistent styling** - Subtle background that doesn't compete with the main step
 *
 * ## Data Model
 *
 * ```typescript
 * type StepOutputUse = {
 *   id: string;                    // Unique identifier
 *   outputStepNum: number;         // The step number being referenced
 *   outputOfStep: {
 *     stepNum: number;             // Same as outputStepNum (for joins)
 *     stepTitle: string | null;    // Optional human-readable title
 *   };
 * };
 * ```
 */
const meta: Meta<typeof StepOutputUseDisplay> = {
  title: 'Components/StepOutputUseDisplay',
  component: StepOutputUseDisplay,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The recipe dependency whisperer. Shows users which previous step outputs they'll need before starting the current step.

When a step requires the output of earlier steps (like "add the reduced sauce from step 3"), this component makes those dependencies visible and clear. It's the difference between a recipe that works and a recipe that makes sense.

**This is our newest component!** Born from the realization that complex recipes are really just dependency graphs in disguise.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    usingSteps: {
      description: 'Array of step dependencies. Empty array = nothing rendered.',
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// MOCK DATA HELPERS
// =============================================================================

const createStepOutput = (
  id: string,
  stepNum: number,
  title: string | null = null
): StepOutputUse => ({
  id,
  outputStepNum: stepNum,
  outputOfStep: {
    stepNum,
    stepTitle: title,
  },
})

// =============================================================================
// BASIC STORIES
// =============================================================================

/**
 * ## Single Dependency
 *
 * The simplest case: one step depends on one previous step.
 *
 * "To make the sandwich, you'll need the bread you baked in step 1."
 * Groundbreaking stuff, truly.
 */
export const SingleDependency: Story = {
  args: {
    usingSteps: [createStepOutput('dep-1', 2, 'Caramelize the onions')],
  },
  parameters: {
    docs: {
      description: {
        story: 'A single dependency with a descriptive title. The most common case.',
      },
    },
  },
}

/**
 * Single dependency without a title. Just the step number.
 *
 * Sometimes steps don't have titles. That's fine. We'll just say
 * "output of step 3" and users can figure it out.
 */
export const SingleDependencyNoTitle: Story = {
  args: {
    usingSteps: [createStepOutput('dep-1', 3, null)],
  },
  parameters: {
    docs: {
      description: {
        story: 'When step titles are missing, we fall back to just the step number.',
      },
    },
  },
}

// =============================================================================
// MULTIPLE DEPENDENCIES
// =============================================================================

/**
 * ## Multiple Dependencies
 *
 * When your step is the assembly point. The culmination. The moment when
 * all those parallel workstreams finally converge into something beautiful
 * (or at least edible).
 *
 * Think: assembling a lasagna. You need:
 * - The meat sauce (Step 2)
 * - The béchamel (Step 4)
 * - The pasta sheets (Step 5)
 * - Your will to live (Steps 1-5)
 */
export const MultipleDependencies: Story = {
  args: {
    usingSteps: [
      createStepOutput('dep-1', 2, 'Prepare the meat sauce'),
      createStepOutput('dep-2', 4, 'Make the béchamel'),
      createStepOutput('dep-3', 5, 'Cook the pasta sheets'),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Multiple dependencies render as a clean list. Assembly steps often have several.',
      },
    },
  },
}

/**
 * Two dependencies. The sweet spot between "simple" and "complex".
 */
export const TwoDependencies: Story = {
  args: {
    usingSteps: [
      createStepOutput('dep-1', 1, 'Prepare the dough'),
      createStepOutput('dep-2', 3, 'Make the filling'),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Two dependencies. Common for combination steps like "fill the dough with the filling."',
      },
    },
  },
}

/**
 * ## Many Dependencies
 *
 * For those ambitious recipes where a single step pulls from everywhere.
 *
 * This is the moment in the cooking competition where the contestant
 * realizes they have 15 components and 10 minutes left.
 */
export const ManyDependencies: Story = {
  args: {
    usingSteps: [
      createStepOutput('dep-1', 1, 'Marinated chicken'),
      createStepOutput('dep-2', 2, 'Garlic paste'),
      createStepOutput('dep-3', 4, 'Reduced tomato sauce'),
      createStepOutput('dep-4', 5, 'Toasted spices'),
      createStepOutput('dep-5', 7, 'Sautéed vegetables'),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Five dependencies? Someone\'s making a complex curry. Or a very ambitious Tuesday.',
      },
    },
  },
}

/**
 * Mixed dependencies: some with titles, some without.
 *
 * Real data is messy. Some steps get lovingly named. Others are just
 * "step 4" because the recipe author gave up on creativity.
 */
export const MixedTitles: Story = {
  args: {
    usingSteps: [
      createStepOutput('dep-1', 2, 'The really good sauce'),
      createStepOutput('dep-2', 4, null),
      createStepOutput('dep-3', 6, 'Crispy shallots'),
      createStepOutput('dep-4', 8, null),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Real-world data: some steps have titles, some don\'t. Both display gracefully.',
      },
    },
  },
}

// =============================================================================
// EMPTY STATE
// =============================================================================

/**
 * ## Empty State: The Sound of Silence
 *
 * No dependencies? No component. Clean, simple, elegant.
 *
 * This step stands alone. It needs nothing from the past. It is self-sufficient.
 * It is "chop the onion." Truly independent.
 *
 * When `usingSteps` is empty, the component returns `null`. No DOM elements,
 * no empty boxes, no sad placeholders. Just... nothing. As it should be.
 */
export const EmptyState: Story = {
  args: {
    usingSteps: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'No dependencies = nothing rendered. The cleanest state.',
      },
    },
  },
}

// =============================================================================
// REAL-WORLD EXAMPLES
// =============================================================================

/**
 * ## Real Recipe Context: Beef Bourguignon Assembly
 *
 * Here's how this component might appear in an actual recipe.
 * Step 8: "Combine everything in the Dutch oven" — the moment of truth.
 */
export const BeefBourguignonAssembly: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="border-l-4 border-amber-500 pl-4">
        <h3 className="font-semibold text-zinc-900 dark:text-white">
          Step 8: Combine in Dutch Oven
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Layer the braised beef, glazed pearl onions, and sautéed mushrooms in
          the Dutch oven. Pour over the reduced wine sauce.
        </p>
      </div>
      <StepOutputUseDisplay
        usingSteps={[
          createStepOutput('dep-1', 3, 'Braise the beef chunks'),
          createStepOutput('dep-2', 5, 'Glaze the pearl onions'),
          createStepOutput('dep-3', 6, 'Sauté the mushrooms'),
          createStepOutput('dep-4', 7, 'Reduce the wine sauce'),
        ]}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A complex assembly step with four dependencies. Classic French cooking complexity.',
      },
    },
  },
}

/**
 * ## Real Recipe Context: Simple Pasta Step
 *
 * Not every step is complex. Sometimes you just need one thing.
 */
export const SimplePastaStep: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="border-l-4 border-green-500 pl-4">
        <h3 className="font-semibold text-zinc-900 dark:text-white">
          Step 6: Toss Pasta with Sauce
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Add the drained pasta to the sauce and toss to coat evenly.
          Reserve some pasta water.
        </p>
      </div>
      <StepOutputUseDisplay
        usingSteps={[createStepOutput('dep-1', 4, 'Make the garlic butter sauce')]}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A simple step with one dependency. Pasta + sauce = dinner.',
      },
    },
  },
}

/**
 * ## Real Recipe Context: Independent Step
 *
 * Some steps don't need anything from before. They're the starting points.
 * The genesis. "Dice the onions." No dependencies required.
 */
export const IndependentStep: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="border-l-4 border-blue-500 pl-4">
        <h3 className="font-semibold text-zinc-900 dark:text-white">
          Step 1: Prep the Vegetables
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Dice the onions, mince the garlic, and julienne the carrots.
        </p>
      </div>
      <StepOutputUseDisplay usingSteps={[]} />
      <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">
        (No dependency box rendered — this step needs nothing from before)
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Step 1 type scenarios: no dependencies, no box. Clean and logical.',
      },
    },
  },
}

/**
 * ## Complex Baking Scenario
 *
 * Baking is the ultimate dependency graph. This component was basically
 * designed for bakers who need to track their preferments, sponges,
 * and various temperature-controlled steps.
 */
export const ComplexBakingScenario: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="border-l-4 border-purple-500 pl-4">
        <h3 className="font-semibold text-zinc-900 dark:text-white">
          Step 9: Shape the Final Dough
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Combine the poolish with the final dough, incorporating the butter
          and the lamination folds.
        </p>
      </div>
      <StepOutputUseDisplay
        usingSteps={[
          createStepOutput('dep-1', 1, 'Prepare the poolish (overnight)'),
          createStepOutput('dep-2', 4, 'Mix the final dough'),
          createStepOutput('dep-3', 6, 'Complete first lamination'),
          createStepOutput('dep-4', 8, 'Complete second lamination'),
        ]}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Croissant-level complexity. Multiple dependencies including overnight steps.',
      },
    },
  },
}

// =============================================================================
// EDGE CASES
// =============================================================================

/**
 * ## Very Long Step Title
 *
 * What happens when someone writes a novel for their step title?
 * Let's find out. Spoiler: it wraps gracefully.
 */
export const LongStepTitle: Story = {
  args: {
    usingSteps: [
      createStepOutput(
        'dep-1',
        3,
        'Slowly caramelize the onions over medium-low heat for approximately 45 minutes until they are deeply golden brown and jammy'
      ),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Long titles wrap naturally. The component handles verbosity with grace.',
      },
    },
  },
}

/**
 * ## High Step Numbers
 *
 * For those 47-step recipes that really shouldn't exist but somehow do.
 */
export const HighStepNumbers: Story = {
  args: {
    usingSteps: [
      createStepOutput('dep-1', 23, 'Third round of proofing'),
      createStepOutput('dep-2', 31, 'Temper the chocolate'),
      createStepOutput('dep-3', 42, null),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'High step numbers display just fine. No artificial limits here.',
      },
    },
  },
}

/**
 * ## Single Dependency From Step 1
 *
 * The humble callback to the very beginning.
 */
export const DependsOnStepOne: Story = {
  args: {
    usingSteps: [createStepOutput('dep-1', 1, 'Initial prep work')],
  },
  parameters: {
    docs: {
      description: {
        story: 'Depending on step 1 is totally valid. First steps often create foundational outputs.',
      },
    },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Testing that empty state renders nothing.
 */
export const EmptyRendersNothing: Story = {
  args: {
    usingSteps: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Should not find the "Using outputs from" heading
    const heading = canvas.queryByText(/Using outputs from/i)
    await expect(heading).not.toBeInTheDocument()
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty dependencies = nothing in the DOM. Verified by test.',
      },
    },
  },
}

/**
 * Testing that single dependency renders correctly.
 */
export const SingleDependencyRendersCorrectly: Story = {
  args: {
    usingSteps: [createStepOutput('dep-1', 3, 'Prepare the sauce')],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Should find the heading
    const heading = canvas.getByText(/Using outputs from/i)
    await expect(heading).toBeInTheDocument()

    // Should find the step reference with title
    const stepRef = canvas.getByText(/output of step 3: Prepare the sauce/i)
    await expect(stepRef).toBeInTheDocument()
  },
  parameters: {
    docs: {
      description: {
        story: 'Single dependency shows heading and step reference with title.',
      },
    },
  },
}

/**
 * Testing that step without title shows number only.
 */
export const NoTitleShowsNumberOnly: Story = {
  args: {
    usingSteps: [createStepOutput('dep-1', 5, null)],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Should show just the step number
    const stepRef = canvas.getByText(/output of step 5$/i)
    await expect(stepRef).toBeInTheDocument()

    // Should NOT include a colon (which would indicate a title)
    const withColon = canvas.queryByText(/output of step 5:/i)
    await expect(withColon).not.toBeInTheDocument()
  },
  parameters: {
    docs: {
      description: {
        story: 'Steps without titles display just the number, no awkward empty colon.',
      },
    },
  },
}

/**
 * Testing multiple dependencies render as list.
 */
export const MultipleDependenciesRenderAsList: Story = {
  args: {
    usingSteps: [
      createStepOutput('dep-1', 1, 'First step'),
      createStepOutput('dep-2', 3, 'Third step'),
      createStepOutput('dep-3', 5, null),
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Should find the heading
    const heading = canvas.getByText(/Using outputs from/i)
    await expect(heading).toBeInTheDocument()

    // Should find all three items
    await expect(canvas.getByText(/output of step 1: First step/i)).toBeInTheDocument()
    await expect(canvas.getByText(/output of step 3: Third step/i)).toBeInTheDocument()
    await expect(canvas.getByText(/output of step 5$/i)).toBeInTheDocument()

    // Should have a list with 3 items
    const list = canvasElement.querySelector('ul')
    await expect(list).toBeInTheDocument()
    const items = canvasElement.querySelectorAll('li')
    await expect(items.length).toBe(3)
  },
  parameters: {
    docs: {
      description: {
        story: 'Multiple dependencies render as an unordered list.',
      },
    },
  },
}

/**
 * Testing accessibility: the component should be readable.
 */
export const AccessibleStructure: Story = {
  args: {
    usingSteps: [
      createStepOutput('dep-1', 2, 'Sauté the aromatics'),
      createStepOutput('dep-2', 4, 'Reduce the stock'),
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Heading should be present and semantic
    const heading = canvas.getByText(/Using outputs from/i)
    await expect(heading).toBeInTheDocument()

    // List should exist for screen readers to announce
    const list = canvasElement.querySelector('ul')
    await expect(list).toBeInTheDocument()
  },
  parameters: {
    docs: {
      description: {
        story: 'Semantic HTML structure: heading + list for screen reader compatibility.',
      },
    },
  },
}
