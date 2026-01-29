import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { Textarea } from '../app/components/ui/textarea'
import { useState } from 'react'

/**
 * # Textarea
 *
 * The Input's bigger, more talkative cousin. When a single line just isn't enough
 * to contain your user's thoughts, feelings, or that recipe's elaborate backstory
 * about their grandmother's kitchen in Tuscany.
 *
 * Textareas are where users pour their hearts out. Recipe descriptions, cooking
 * instructions, notes, reviews — basically any time you need more than "password123"
 * worth of text.
 *
 * ## The Textarea Philosophy
 *
 * 1. **Give users room to breathe** - Nobody likes typing an essay into a postage stamp
 * 2. **Resize gracefully** - Let users expand if they're feeling verbose
 * 3. **Stay accessible** - Screen readers deserve novels too
 * 4. **Look consistent** - Match the Input styling because design systems matter
 *
 * ## Features
 *
 * - **Resizable by default** - Users can drag to expand (or you can disable this)
 * - **HeadlessUI powered** - All the accessibility goodness baked in
 * - **Invalid states** - Red borders for when the essay needs revision
 * - **Disabled states** - For read-only manifestos
 * - **Dark mode** - Because recipe blogging at midnight is a thing
 */
const meta: Meta<typeof Textarea> = {
  title: 'UI/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The Input's bigger, more talkative cousin. For when a single line just isn't enough.

Built on HeadlessUI with resize support, focus/invalid/disabled styling, and the same attention to detail as our Input component.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text. The "lorem ipsum" of user prompts.',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the textarea. No typing allowed!',
    },
    invalid: {
      control: 'boolean',
      description: 'Marks the textarea as invalid. Time for constructive criticism.',
    },
    resizable: {
      control: 'boolean',
      description: 'Whether users can resize the textarea. Default is true.',
    },
    rows: {
      control: 'number',
      description: 'Number of visible text rows. Controls initial height.',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-96">
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
 * The default textarea. A vast empty expanse waiting to be filled
 * with prose, poetry, or step-by-step cooking instructions.
 */
export const Default: Story = {
  args: {
    placeholder: 'Write something...',
  },
}

/**
 * A textarea pre-filled with content. Like opening a document
 * you forgot you started writing.
 */
export const WithValue: Story = {
  args: {
    defaultValue: 'This is a pre-filled textarea with some content. It could be a recipe description, cooking notes, or that novel you\'ve been meaning to finish.',
  },
}

/**
 * Placeholder text guides users on what to write.
 * Think of it as a gentle nudge in the right direction.
 */
export const WithPlaceholder: Story = {
  args: {
    placeholder: 'Describe your recipe in a few sentences. What inspired you? What makes it special?',
    rows: 4,
  },
}

// =============================================================================
// SIZE VARIATIONS (ROWS)
// =============================================================================

/**
 * ## Sizing with Rows
 *
 * The `rows` attribute controls the initial visible height of the textarea.
 * More rows = more initial space. Choose wisely based on expected content length.
 *
 * - 2-3 rows: Quick notes, short descriptions
 * - 4-6 rows: Recipe descriptions, moderate content
 * - 8+ rows: Full instructions, detailed content
 */
export const SizeVariations: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          2 rows (compact)
        </label>
        <Textarea rows={2} placeholder="Quick notes..." />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          3 rows (default)
        </label>
        <Textarea rows={3} placeholder="Standard textarea..." />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          5 rows (medium)
        </label>
        <Textarea rows={5} placeholder="More room to breathe..." />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          8 rows (spacious)
        </label>
        <Textarea rows={8} placeholder="Write that novel..." />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different row counts for different content needs. From sticky notes to full manuscripts.',
      },
    },
  },
}

/**
 * A compact 2-row textarea. Perfect for short descriptions
 * or single-line-ish content that might occasionally overflow.
 */
export const Compact: Story = {
  args: {
    rows: 2,
    placeholder: 'Brief description...',
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact textareas for short content. When an input feels too small but a full textarea feels excessive.',
      },
    },
  },
}

/**
 * A spacious textarea for longer content. Recipe instructions,
 * detailed notes, or that sourdough starter story.
 */
export const Spacious: Story = {
  args: {
    rows: 8,
    placeholder: 'Tell us the full story...',
  },
  parameters: {
    docs: {
      description: {
        story: 'Spacious textareas invite longer content. Users see the space and think "I should write more."',
      },
    },
  },
}

// =============================================================================
// RESIZE BEHAVIOR
// =============================================================================

/**
 * ## Resize Control
 *
 * By default, textareas are resizable vertically. This lets users
 * expand the field if they need more space. But sometimes you want
 * a fixed size — that's where `resizable={false}` comes in.
 */
export const ResizeBehavior: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Resizable (default)
        </label>
        <Textarea
          rows={3}
          placeholder="Drag the corner to resize me..."
          resizable={true}
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Drag the bottom-right corner to resize
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Non-resizable
        </label>
        <Textarea
          rows={3}
          placeholder="I'm fixed. No dragging allowed."
          resizable={false}
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          This textarea maintains its size
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Resizable textareas let users control their own destiny. Non-resizable ones enforce design constraints.',
      },
    },
  },
}

/**
 * A resizable textarea (the default). Users can drag to expand.
 * Great for variable-length content.
 */
export const Resizable: Story = {
  args: {
    rows: 3,
    placeholder: 'Drag my corner to resize...',
    resizable: true,
  },
}

/**
 * A fixed-size textarea that can't be resized.
 * For when you need layout consistency.
 */
export const NonResizable: Story = {
  args: {
    rows: 4,
    placeholder: 'My size is non-negotiable.',
    resizable: false,
  },
}

// =============================================================================
// STATES
// =============================================================================

/**
 * The disabled textarea. Visible but untouchable.
 * Like a recipe you're not allowed to edit.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'You cannot type here',
    rows: 3,
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled textareas get 50% opacity. They\'re for display only.',
      },
    },
  },
}

/**
 * A disabled textarea with content. For showing
 * read-only information that shouldn't be modified.
 */
export const DisabledWithValue: Story = {
  args: {
    disabled: true,
    defaultValue: 'This recipe has been archived and cannot be edited. It belongs to history now.',
    rows: 3,
  },
}

/**
 * The invalid state. The red border of "your essay needs work."
 * Use this when validation fails.
 */
export const Invalid: Story = {
  args: {
    invalid: true,
    defaultValue: 'This description is too short. Please elaborate on your culinary creation.',
    rows: 3,
  },
  parameters: {
    docs: {
      description: {
        story: 'Invalid textareas get a red border. Gentle but firm feedback.',
      },
    },
  },
}

/**
 * All the states a textarea can be in, lined up for comparison.
 * The full emotional spectrum of form fields.
 */
export const AllStates: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Normal
        </label>
        <Textarea rows={2} placeholder="Ready and waiting..." />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          With Value
        </label>
        <Textarea rows={2} defaultValue="I have content in me!" />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Disabled
        </label>
        <Textarea rows={2} disabled placeholder="I'm on vacation" />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Disabled with Value
        </label>
        <Textarea rows={2} disabled defaultValue="Archived for posterity" />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Invalid
        </label>
        <Textarea rows={2} invalid defaultValue="This needs revision" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The complete state gallery. Every mood a textarea can have.',
      },
    },
  },
}

// =============================================================================
// CHARACTER COUNTER EXAMPLE
// =============================================================================

/**
 * ## Character Counter Pattern
 *
 * While Textarea doesn't have a built-in character limit, you can
 * easily build one. Here's a pattern showing how to track and
 * display character counts.
 */
export const CharacterCounter: Story = {
  render: function CharacterCounterStory() {
    const [value, setValue] = useState('')
    const maxLength = 280 // Twitter vibes
    const remaining = maxLength - value.length
    const isOverLimit = remaining < 0
    const isNearLimit = remaining <= 20 && remaining >= 0

    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Recipe Tweet
        </label>
        <Textarea
          rows={3}
          placeholder="Describe your recipe in 280 characters or less..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          invalid={isOverLimit}
        />
        <div className="flex justify-end">
          <span
            className={
              isOverLimit
                ? 'text-sm text-red-600 dark:text-red-400 font-medium'
                : isNearLimit
                  ? 'text-sm text-amber-600 dark:text-amber-400'
                  : 'text-sm text-zinc-500 dark:text-zinc-400'
            }
          >
            {remaining} characters remaining
          </span>
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'A character counter implementation. The number turns amber when close, red when over. Try it!',
      },
    },
  },
}

/**
 * A longer character limit example. For recipe descriptions
 * that need a bit more breathing room.
 */
export const LongFormCounter: Story = {
  render: function LongFormCounterStory() {
    const [value, setValue] = useState('')
    const maxLength = 1000
    const remaining = maxLength - value.length
    const isOverLimit = remaining < 0
    const isNearLimit = remaining <= 100 && remaining >= 0

    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Recipe Description
        </label>
        <Textarea
          rows={6}
          placeholder="Tell us about your recipe. What inspired it? What makes it special? Share the story behind the dish..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          invalid={isOverLimit}
        />
        <div className="flex justify-between">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {value.length.toLocaleString()} / {maxLength.toLocaleString()}
          </span>
          <span
            className={
              isOverLimit
                ? 'text-sm text-red-600 dark:text-red-400 font-medium'
                : isNearLimit
                  ? 'text-sm text-amber-600 dark:text-amber-400'
                  : 'text-sm text-zinc-500 dark:text-zinc-400'
            }
          >
            {isOverLimit ? `${Math.abs(remaining)} over limit` : `${remaining} remaining`}
          </span>
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'For longer content, show both the current count and the limit. Transparency is key.',
      },
    },
  },
}

// =============================================================================
// REAL-WORLD EXAMPLES
// =============================================================================

/**
 * ## Recipe Form Example
 *
 * How textareas might look in a real recipe editing form.
 * Multiple fields with different row counts based on expected content.
 */
export const RecipeForm: Story = {
  render: () => (
    <div className="space-y-6 p-6 border border-zinc-200 rounded-lg dark:border-zinc-700">
      <h3 className="font-semibold text-zinc-900 dark:text-white text-lg">Recipe Details</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Short Description
          </label>
          <Textarea
            rows={2}
            placeholder="A brief one-liner about your recipe..."
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            This appears in recipe cards and search results
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Full Description
          </label>
          <Textarea
            rows={4}
            placeholder="Tell the story of this recipe. What inspired it? What makes it special?"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Instructions
          </label>
          <Textarea
            rows={8}
            placeholder="Step-by-step cooking instructions..."
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Be specific! Include temperatures, times, and techniques
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Chef's Notes (optional)
          </label>
          <Textarea
            rows={3}
            placeholder="Tips, variations, or personal notes..."
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A real recipe form with multiple textareas. Different row counts for different content expectations.',
      },
    },
  },
}

/**
 * A review form. Because everyone has opinions about recipes.
 */
export const ReviewForm: Story = {
  render: () => (
    <div className="space-y-4 p-6 border border-zinc-200 rounded-lg dark:border-zinc-700">
      <h3 className="font-semibold text-zinc-900 dark:text-white text-lg">Write a Review</h3>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Your Review
        </label>
        <Textarea
          rows={5}
          placeholder="What did you think of this recipe? Did you make any modifications?"
        />
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Your review helps other cooks decide whether to try this recipe
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Review forms need enough space for thoughtful feedback.',
      },
    },
  },
}

/**
 * Feedback form with validation. The classic "what went wrong?" scenario.
 */
export const FeedbackWithValidation: Story = {
  render: () => (
    <div className="space-y-4 p-6 border border-zinc-200 rounded-lg dark:border-zinc-700">
      <h3 className="font-semibold text-zinc-900 dark:text-white text-lg">Report an Issue</h3>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Describe the problem
        </label>
        <Textarea
          rows={4}
          invalid
          defaultValue="It doesn't work"
        />
        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
          Please provide more detail. What were you trying to do? What happened instead?
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Validation in action. "It doesn\'t work" is not helpful feedback, Karen.',
      },
    },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Testing that users can type in the textarea.
 * The fundamental textarea contract.
 */
export const TypeInteraction: Story = {
  args: {
    placeholder: 'Type here...',
    rows: 3,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const textarea = canvas.getByPlaceholderText('Type here...')

    // Verify textarea exists and is empty
    await expect(textarea).toBeInTheDocument()
    await expect(textarea).toHaveValue('')

    // Type something
    await userEvent.type(textarea, 'Hello, this is a textarea test!')

    // Verify the value
    await expect(textarea).toHaveValue('Hello, this is a textarea test!')
  },
  parameters: {
    docs: {
      description: {
        story: 'The basic typing test. Textareas accept text. Shocking!',
      },
    },
  },
}

/**
 * Testing multiline input. The whole point of textareas.
 */
export const MultilineInteraction: Story = {
  args: {
    placeholder: 'Write multiple lines...',
    rows: 4,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const textarea = canvas.getByPlaceholderText('Write multiple lines...')

    // Type multiple lines using Enter key
    await userEvent.type(textarea, 'Line 1{enter}Line 2{enter}Line 3')

    // Verify the multiline value
    await expect(textarea).toHaveValue('Line 1\nLine 2\nLine 3')
  },
  parameters: {
    docs: {
      description: {
        story: 'Textareas handle line breaks. Press Enter to go to a new line.',
      },
    },
  },
}

/**
 * Testing focus and blur events. Enter and exit gracefully.
 */
export const FocusBlurInteraction: Story = {
  args: {
    placeholder: 'Focus me',
    rows: 3,
    onFocus: fn(),
    onBlur: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const textarea = canvas.getByPlaceholderText('Focus me')

    // Click to focus
    await userEvent.click(textarea)
    await expect(textarea).toHaveFocus()
    await expect(args.onFocus).toHaveBeenCalledTimes(1)

    // Tab away to blur
    await userEvent.tab()
    await expect(textarea).not.toHaveFocus()
    await expect(args.onBlur).toHaveBeenCalledTimes(1)
  },
  parameters: {
    docs: {
      description: {
        story: 'Focus and blur events fire correctly. For real-time validation.',
      },
    },
  },
}

/**
 * Testing that disabled textareas ignore interaction.
 */
export const DisabledInteraction: Story = {
  args: {
    disabled: true,
    placeholder: 'Nice try',
    rows: 3,
    onFocus: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const textarea = canvas.getByPlaceholderText('Nice try')

    // Verify textarea is disabled
    await expect(textarea).toBeDisabled()

    // Try to click (shouldn't focus)
    await userEvent.click(textarea)
    await expect(args.onFocus).not.toHaveBeenCalled()
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled textareas are truly disabled. No clicking, no typing.',
      },
    },
  },
}

/**
 * Testing onChange event firing on each keystroke.
 */
export const OnChangeInteraction: Story = {
  args: {
    placeholder: 'Type to trigger onChange',
    rows: 3,
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const textarea = canvas.getByPlaceholderText('Type to trigger onChange')

    // Type character by character
    await userEvent.type(textarea, 'abc')

    // onChange should be called for each character
    await expect(args.onChange).toHaveBeenCalledTimes(3)
  },
  parameters: {
    docs: {
      description: {
        story: 'onChange fires for every keystroke. Essential for live character counting.',
      },
    },
  },
}

/**
 * Testing keyboard navigation with multiple textareas.
 */
export const KeyboardNavigation: Story = {
  render: () => (
    <div className="space-y-4">
      <Textarea rows={2} placeholder="First textarea" />
      <Textarea rows={2} placeholder="Second textarea" />
      <Textarea rows={2} placeholder="Third textarea" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const firstTextarea = canvas.getByPlaceholderText('First textarea')
    const secondTextarea = canvas.getByPlaceholderText('Second textarea')
    const thirdTextarea = canvas.getByPlaceholderText('Third textarea')

    // Tab to first textarea
    await userEvent.tab()
    await expect(firstTextarea).toHaveFocus()

    // Tab to second textarea
    await userEvent.tab()
    await expect(secondTextarea).toHaveFocus()

    // Tab to third textarea
    await userEvent.tab()
    await expect(thirdTextarea).toHaveFocus()

    // Type in the focused textarea
    await userEvent.type(thirdTextarea, 'Tabbed here!')
    await expect(thirdTextarea).toHaveValue('Tabbed here!')
  },
  parameters: {
    docs: {
      description: {
        story: 'Tab navigation works correctly. Keyboard accessibility FTW!',
      },
    },
  },
}

/**
 * Testing select all and replace functionality.
 */
export const SelectAllInteraction: Story = {
  args: {
    defaultValue: 'Select all of this text and replace it',
    rows: 3,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const textarea = canvas.getByDisplayValue('Select all of this text and replace it')

    // Focus the textarea
    await userEvent.click(textarea)

    // Select all (Ctrl+A)
    await userEvent.keyboard('{Control>}a{/Control}')

    // Type to replace the selection
    await userEvent.keyboard('Replaced!')

    await expect(textarea).toHaveValue('Replaced!')
  },
  parameters: {
    docs: {
      description: {
        story: 'Select all (Ctrl+A) works as expected. Replace content in one fell swoop.',
      },
    },
  },
}

/**
 * Testing paste functionality.
 */
export const PasteInteraction: Story = {
  args: {
    placeholder: 'Paste something here',
    rows: 3,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const textarea = canvas.getByPlaceholderText('Paste something here')

    // Focus the textarea
    await userEvent.click(textarea)

    // Type some text first
    await userEvent.type(textarea, 'Before ')

    // Simulate pasting (using type with paste option)
    await userEvent.paste('pasted content')

    await expect(textarea).toHaveValue('Before pasted content')
  },
  parameters: {
    docs: {
      description: {
        story: 'Paste works correctly. Copy-paste those recipe instructions!',
      },
    },
  },
}
