import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { Mail, Lock, Search as SearchIcon, Eye, EyeOff, User, Phone, Globe, Hash, Calendar, Clock } from 'lucide-react'
import { Input, InputGroup } from '../app/components/ui/input'
import { useState } from 'react'

/**
 * # Input
 *
 * The humble text input. The blank canvas of forms. The "tell me about yourself"
 * of user interfaces. Where buttons scream "DO SOMETHING!", inputs quietly whisper
 * "I'm listening..."
 *
 * Our Input component is built on HeadlessUI and styled with the kind of attention
 * to detail usually reserved for artisanal cheese. It supports all the input types
 * you'd expect, plus some you probably forgot existed (looking at you, `datetime-local`).
 *
 * ## The Input Manifesto
 *
 * 1. **Be obvious** - Users should know what to type before they type it
 * 2. **Be forgiving** - Validate gently, not like an angry bouncer
 * 3. **Be accessible** - Screen readers are users too, Karen
 * 4. **Be pretty** - Even form fields deserve to look good
 *
 * ## Features
 *
 * - **Multiple types** - text, email, password, search, tel, url, number, and all the date types
 * - **InputGroup support** - Add icons to make inputs feel less lonely
 * - **Focus states** - That satisfying blue ring when you click in
 * - **Invalid states** - Red borders for when users get creative with their "email addresses"
 * - **Disabled states** - For when you need to say "not yet, friend"
 * - **Dark mode** - Because developers code at 2am
 */
const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The humble text input. Where buttons scream "DO SOMETHING!", inputs quietly whisper "I'm listening..."

Built on HeadlessUI with support for all standard input types, icons via InputGroup, and automatic focus/invalid/disabled styling.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'search', 'tel', 'url', 'number', 'date', 'datetime-local', 'month', 'time', 'week'],
      description: 'The input type. Choose wisely.',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text. The ghost of inputs past.',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the input. Users will need to wait.',
    },
    invalid: {
      control: 'boolean',
      description: 'Marks the input as invalid. Time for the red border of shame.',
    },
    required: {
      control: 'boolean',
      description: 'Makes the input required. No empty allowed!',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
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
 * The default input. A blank slate. An empty vessel waiting to be filled
 * with user data, hopes, and dreams. Mostly email addresses though.
 */
export const Default: Story = {
  args: {
    placeholder: 'Type something...',
  },
}

/**
 * An input with a value already in it. Like finding a gift card
 * with money still on it.
 */
export const WithValue: Story = {
  args: {
    defaultValue: 'Hello, Storybook!',
  },
}

/**
 * Placeholder text is like a helpful ghost whispering suggestions.
 * It disappears the moment you start typing, like any good assistant.
 */
export const WithPlaceholder: Story = {
  args: {
    placeholder: 'Enter your recipe name',
  },
}

// =============================================================================
// INPUT TYPES
// =============================================================================

/**
 * ## The Input Type Buffet
 *
 * HTML gives us many input types. MANY. Some are useful (email, password),
 * some are obscure (week?), and some are just showing off (datetime-local).
 *
 * Here's the complete menu.
 */
export const AllTypes: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Text (the classic)</label>
        <Input type="text" placeholder="Just regular text" />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Email</label>
        <Input type="email" placeholder="you@example.com" />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Password</label>
        <Input type="password" placeholder="Super secret" />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Search</label>
        <Input type="search" placeholder="Find recipes..." />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Tel</label>
        <Input type="tel" placeholder="+1 (555) 123-4567" />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">URL</label>
        <Input type="url" placeholder="https://example.com" />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Number</label>
        <Input type="number" placeholder="42" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All the common input types. Each one triggers different keyboard layouts on mobile. Magic!',
      },
    },
  },
}

/**
 * For collecting email addresses. The browser will helpfully
 * yell at users who try to enter "notanemail" as their email.
 */
export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'chef@spoonjoy.com',
  },
  parameters: {
    docs: {
      description: {
        story: 'Email inputs get browser validation for free. No regex required!',
      },
    },
  },
}

/**
 * The password input. Where your "password123" transforms into
 * beautiful dots of security theater.
 */
export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
  parameters: {
    docs: {
      description: {
        story: 'Passwords are masked by default. Your secrets are safe... from shoulder surfers at least.',
      },
    },
  },
}

/**
 * For when users need to find things. Often paired with a
 * magnifying glass icon and crushing disappointment when
 * no results are found.
 */
export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search recipes...',
  },
  parameters: {
    docs: {
      description: {
        story: 'Search inputs get a clear button on some browsers. Fancy!',
      },
    },
  },
}

/**
 * ## Date & Time Inputs
 *
 * The date inputs. Where browsers finally decided to help us
 * instead of making us build date pickers from scratch.
 *
 * (Results may vary by browser. Looking at you, Safari.)
 */
export const DateTypes: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Date</label>
        <Input type="date" />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Time</label>
        <Input type="time" />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Datetime Local</label>
        <Input type="datetime-local" />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Month</label>
        <Input type="month" />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Week</label>
        <Input type="week" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Native date/time inputs. The browser does the heavy lifting. Your mileage may vary.',
      },
    },
  },
}

// =============================================================================
// STATES
// =============================================================================

/**
 * The disabled input. It's there, you can see it, but you can't touch it.
 * Like a museum exhibit. Or a cat that doesn't want pets.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'You cannot type here',
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled inputs get 50% opacity and refuse all interaction. Very aloof.',
      },
    },
  },
}

/**
 * A disabled input that already has a value. Sometimes you need to
 * show information without letting users mess with it.
 */
export const DisabledWithValue: Story = {
  args: {
    disabled: true,
    defaultValue: 'This value is locked',
  },
}

/**
 * The invalid state. The red border of shame. The "please try again"
 * of user interfaces. Use this when validation fails.
 */
export const Invalid: Story = {
  args: {
    invalid: true,
    defaultValue: 'not-a-valid-email',
    type: 'email',
  },
  parameters: {
    docs: {
      description: {
        story: 'Invalid inputs get a red border. Gentle but firm disapproval.',
      },
    },
  },
}

/**
 * All the states an input can be in, side by side.
 * Like a police lineup, but for form fields.
 */
export const AllStates: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Normal</label>
        <Input placeholder="I'm just a regular input" />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">With Value</label>
        <Input defaultValue="I have content!" />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Disabled</label>
        <Input disabled placeholder="I'm taking a break" />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Disabled with Value</label>
        <Input disabled defaultValue="I'm read-only-ish" />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Invalid</label>
        <Input invalid defaultValue="Something's wrong here" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The complete state spectrum. From healthy to "needs attention".',
      },
    },
  },
}

// =============================================================================
// WITH ICONS (InputGroup)
// =============================================================================

/**
 * ## InputGroup: Icons Make Everything Better
 *
 * Inputs with icons are like inputs with tiny helpers. The icon gives
 * users a visual hint about what to type. Plus they look cool.
 *
 * Wrap your Input in an InputGroup, add icons with `data-slot="icon"`,
 * and let the CSS magic happen.
 */
export const WithLeadingIcon: Story = {
  render: () => (
    <InputGroup>
      <Mail data-slot="icon" />
      <Input type="email" placeholder="chef@spoonjoy.com" />
    </InputGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Leading icons appear on the left. Perfect for email, search, and user inputs.',
      },
    },
  },
}

/**
 * Icons can go at the end too. Great for password visibility toggles
 * or input status indicators.
 */
export const WithTrailingIcon: Story = {
  render: () => (
    <InputGroup>
      <Input type="password" placeholder="Enter password" />
      <EyeOff data-slot="icon" />
    </InputGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Trailing icons on the right. The EyeOff icon here is just decorative - for a real toggle, you\'d need state.',
      },
    },
  },
}

/**
 * Icons on both sides? Why not! Live your best input life.
 */
export const WithBothIcons: Story = {
  render: () => (
    <InputGroup>
      <Lock data-slot="icon" />
      <Input type="password" placeholder="Enter password" />
      <Eye data-slot="icon" />
    </InputGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Lock icon for security vibes, eye icon for "show password" (implementation not included, batteries sold separately).',
      },
    },
  },
}

/**
 * A sampling of common icon + input combinations.
 * Because good UI patterns are worth showing off.
 */
export const IconExamples: Story = {
  render: () => (
    <div className="space-y-4">
      <InputGroup>
        <User data-slot="icon" />
        <Input type="text" placeholder="Username" />
      </InputGroup>
      <InputGroup>
        <Mail data-slot="icon" />
        <Input type="email" placeholder="Email address" />
      </InputGroup>
      <InputGroup>
        <Lock data-slot="icon" />
        <Input type="password" placeholder="Password" />
      </InputGroup>
      <InputGroup>
        <SearchIcon data-slot="icon" />
        <Input type="search" placeholder="Search recipes..." />
      </InputGroup>
      <InputGroup>
        <Phone data-slot="icon" />
        <Input type="tel" placeholder="Phone number" />
      </InputGroup>
      <InputGroup>
        <Globe data-slot="icon" />
        <Input type="url" placeholder="Website URL" />
      </InputGroup>
      <InputGroup>
        <Hash data-slot="icon" />
        <Input type="number" placeholder="Quantity" />
      </InputGroup>
      <InputGroup>
        <Calendar data-slot="icon" />
        <Input type="date" />
      </InputGroup>
      <InputGroup>
        <Clock data-slot="icon" />
        <Input type="time" />
      </InputGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The icon gallery. Match icons to input types for maximum clarity.',
      },
    },
  },
}

// =============================================================================
// REAL-WORLD EXAMPLES
// =============================================================================

/**
 * A login form. The gateway to every app. The "prove you're human" of UX.
 */
export const LoginForm: Story = {
  render: () => (
    <div className="space-y-4 p-6 border border-zinc-200 rounded-lg dark:border-zinc-700">
      <h3 className="font-semibold text-zinc-900 dark:text-white text-lg">Welcome back, chef!</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Email</label>
          <InputGroup>
            <Mail data-slot="icon" />
            <Input type="email" placeholder="chef@spoonjoy.com" />
          </InputGroup>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Password</label>
          <InputGroup>
            <Lock data-slot="icon" />
            <Input type="password" placeholder="Enter password" />
          </InputGroup>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A typical login form. Icons help users know what goes where.',
      },
    },
  },
}

/**
 * A recipe search with that big search input energy.
 */
export const SearchInput: Story = {
  render: () => (
    <div className="space-y-2">
      <InputGroup>
        <SearchIcon data-slot="icon" />
        <Input type="search" placeholder="Search for pasta, tacos, or that thing you saw on TikTok..." />
      </InputGroup>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">Try "chocolate chip cookies" or "quick dinner"</p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Search inputs deserve to be the star. Give them room to shine.',
      },
    },
  },
}

/**
 * Form validation in action. The red border of "please try again".
 */
export const FormValidation: Story = {
  render: () => (
    <div className="space-y-4 p-6 border border-zinc-200 rounded-lg dark:border-zinc-700">
      <h3 className="font-semibold text-zinc-900 dark:text-white text-lg">Create Account</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Email</label>
          <InputGroup>
            <Mail data-slot="icon" />
            <Input type="email" invalid defaultValue="not-an-email" />
          </InputGroup>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">Please enter a valid email address</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Password</label>
          <InputGroup>
            <Lock data-slot="icon" />
            <Input type="password" invalid defaultValue="123" />
          </InputGroup>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">Password must be at least 8 characters</p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Validation errors with helpful messages. Be kind with your error copy!',
      },
    },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Testing that users can actually type in the input.
 * You know, the one thing inputs are supposed to do.
 */
export const TypeInteraction: Story = {
  args: {
    placeholder: 'Type here...',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByPlaceholderText('Type here...')

    // Verify input exists and is empty
    await expect(input).toBeInTheDocument()
    await expect(input).toHaveValue('')

    // Type something
    await userEvent.type(input, 'Hello, Spoonjoy!')

    // Verify the value
    await expect(input).toHaveValue('Hello, Spoonjoy!')
  },
  parameters: {
    docs: {
      description: {
        story: 'Watch the Interactions panel as we type into the input. Robots can type too!',
      },
    },
  },
}

/**
 * Testing focus and blur events. The input's "look at me" and "I'm done" moments.
 */
export const FocusBlurInteraction: Story = {
  args: {
    placeholder: 'Focus me',
    onFocus: fn(),
    onBlur: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByPlaceholderText('Focus me')

    // Click to focus
    await userEvent.click(input)
    await expect(input).toHaveFocus()
    await expect(args.onFocus).toHaveBeenCalledTimes(1)

    // Tab away to blur
    await userEvent.tab()
    await expect(input).not.toHaveFocus()
    await expect(args.onBlur).toHaveBeenCalledTimes(1)
  },
  parameters: {
    docs: {
      description: {
        story: 'Focus and blur events fire correctly. Essential for form validation timing.',
      },
    },
  },
}

/**
 * Testing that disabled inputs ignore all attempts at interaction.
 * They're not being rude, they're just... unavailable.
 */
export const DisabledInteraction: Story = {
  args: {
    disabled: true,
    placeholder: 'Nice try',
    onFocus: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByPlaceholderText('Nice try')

    // Verify input is disabled
    await expect(input).toBeDisabled()

    // Try to click (shouldn't focus)
    await userEvent.click(input)
    await expect(args.onFocus).not.toHaveBeenCalled()
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled inputs ignore clicks. No events, no typing, no nothing.',
      },
    },
  },
}

/**
 * Testing keyboard navigation. Tab to focus, type to... type.
 */
export const KeyboardNavigation: Story = {
  render: () => (
    <div className="space-y-4">
      <Input placeholder="First input" />
      <Input placeholder="Second input" />
      <Input placeholder="Third input" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const firstInput = canvas.getByPlaceholderText('First input')
    const secondInput = canvas.getByPlaceholderText('Second input')
    const thirdInput = canvas.getByPlaceholderText('Third input')

    // Tab to first input
    await userEvent.tab()
    await expect(firstInput).toHaveFocus()

    // Tab to second input
    await userEvent.tab()
    await expect(secondInput).toHaveFocus()

    // Tab to third input
    await userEvent.tab()
    await expect(thirdInput).toHaveFocus()

    // Type in the focused input
    await userEvent.type(thirdInput, 'Tabbed here!')
    await expect(thirdInput).toHaveValue('Tabbed here!')
  },
  parameters: {
    docs: {
      description: {
        story: 'Tab navigation works as expected. Keyboard users rejoice!',
      },
    },
  },
}

/**
 * Testing the password input. Can we type secrets? Yes. Can we see them? No.
 */
export const PasswordTyping: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter your secrets',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByPlaceholderText('Enter your secrets')

    // Verify it's a password input
    await expect(input).toHaveAttribute('type', 'password')

    // Type a password
    await userEvent.type(input, 'SuperSecret123!')

    // Verify the value is there (even though we can't see it)
    await expect(input).toHaveValue('SuperSecret123!')

    // Verify it's still a password type (not revealing the secret)
    await expect(input).toHaveAttribute('type', 'password')
  },
  parameters: {
    docs: {
      description: {
        story: 'Password inputs accept text but keep it masked. Your secrets are safe.',
      },
    },
  },
}

/**
 * Testing email input behavior. The browser helps validate email format.
 */
export const EmailTyping: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter your email',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByPlaceholderText('Enter your email')

    // Verify it's an email input
    await expect(input).toHaveAttribute('type', 'email')

    // Type an email
    await userEvent.type(input, 'chef@spoonjoy.com')

    // Verify the value
    await expect(input).toHaveValue('chef@spoonjoy.com')
  },
  parameters: {
    docs: {
      description: {
        story: 'Email inputs work just like text inputs, but mobile keyboards show the @ symbol prominently.',
      },
    },
  },
}

/**
 * Testing that onChange fires on each keystroke.
 * Because real-time validation needs real-time events.
 */
export const OnChangeInteraction: Story = {
  args: {
    placeholder: 'Type to trigger onChange',
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByPlaceholderText('Type to trigger onChange')

    // Type character by character
    await userEvent.type(input, 'abc')

    // onChange should be called for each character
    await expect(args.onChange).toHaveBeenCalledTimes(3)
  },
  parameters: {
    docs: {
      description: {
        story: 'onChange fires for every keystroke. Perfect for live search or character counters.',
      },
    },
  },
}

/**
 * Interactive password visibility toggle demo.
 * This one's actually functional - click the eye!
 */
export const PasswordToggle: Story = {
  render: function PasswordToggleStory() {
    const [showPassword, setShowPassword] = useState(false)

    return (
      <div className="space-y-2">
        <InputGroup>
          <Lock data-slot="icon" />
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter password"
            defaultValue="SuperSecret123!"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </InputGroup>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Click the eye icon to toggle visibility
        </p>
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByPlaceholderText('Enter password')
    const toggleButton = canvas.getByRole('button', { name: /password/i })

    // Initially password is hidden
    await expect(input).toHaveAttribute('type', 'password')

    // Click to show
    await userEvent.click(toggleButton)
    await expect(input).toHaveAttribute('type', 'text')

    // Click to hide again
    await userEvent.click(toggleButton)
    await expect(input).toHaveAttribute('type', 'password')
  },
  parameters: {
    docs: {
      description: {
        story: 'A real password toggle implementation. Click the eye to reveal your secrets (temporarily).',
      },
    },
  },
}

/**
 * Testing clear/select all keyboard shortcuts.
 * Because power users love their shortcuts.
 */
export const SelectAllInteraction: Story = {
  args: {
    defaultValue: 'Select all of this text',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByDisplayValue('Select all of this text')

    // Focus the input
    await userEvent.click(input)

    // Select all (Cmd+A on Mac, Ctrl+A on Windows)
    await userEvent.keyboard('{Control>}a{/Control}')

    // Type to replace the selection
    await userEvent.keyboard('Replaced!')

    await expect(input).toHaveValue('Replaced!')
  },
  parameters: {
    docs: {
      description: {
        story: 'Select all (Ctrl+A) works as expected. Power user shortcuts FTW!',
      },
    },
  },
}
