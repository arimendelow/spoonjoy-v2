import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { ValidationError } from '../app/components/ui/validation-error'
import { Input, InputGroup } from '../app/components/ui/input'
import { Fieldset, Legend, FieldGroup, Field, Label } from '../app/components/ui/fieldset'
import { Textarea } from '../app/components/ui/textarea'
import { Select } from '../app/components/ui/select'
import { Mail, Lock, User } from 'lucide-react'
import { useState } from 'react'

/**
 * # ValidationError
 *
 * The bearer of bad news. The red flag of forms. The component that tells users
 * "you tried, but not quite." ValidationError is the diplomatic envoy between
 * your validation logic and users who think "asdf" is a valid email address.
 *
 * Unlike ErrorMessage in Fieldset (which is for individual field hints),
 * ValidationError is a standalone component for displaying validation failures
 * in a prominent, accessible way. It's the difference between a whisper
 * ("hey, this field needs attention") and a polite announcement
 * ("ATTENTION: The following items require your reconsideration").
 *
 * ## The Philosophy of Errors
 *
 * Good error messages are like good feedback from a friend:
 * - **Specific** - "Password too short" beats "Invalid input"
 * - **Helpful** - Tell them HOW to fix it, not just that it's broken
 * - **Human** - "We need a valid email" > "ERR_EMAIL_VALIDATION_FAILED_CODE_42"
 *
 * ## Features
 *
 * - **Flexible input** - Accepts string, array, null, or undefined
 * - **Auto-filters** - Empty strings are quietly ignored
 * - **Accessible** - Uses `role="alert"` so screen readers announce errors
 * - **Dark mode** - Even error messages deserve to look good at 2am
 * - **Smart rendering** - Single error? Plain text. Multiple? Bulleted list.
 *
 * ## The Error Type Hierarchy
 *
 * ```typescript
 * type ValidationErrorType = string | string[] | null | undefined
 * ```
 *
 * Pass whatever you have. We'll figure it out.
 */
const meta: Meta<typeof ValidationError> = {
  title: 'UI/ValidationError',
  component: ValidationError,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The bearer of bad news for your forms. Displays validation errors in a prominent, accessible alert box.

Accepts strings, arrays, null, or undefined. Smart enough to show a single error as text and multiple errors as a bulleted list. Uses role="alert" for screen reader announcement.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    error: {
      control: 'text',
      description: 'The error(s) to display. String for single, array for multiple.',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes. For when red isn\'t red enough.',
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
// BASIC STORIES - SINGLE ERRORS
// =============================================================================

/**
 * A single validation error. Clean, simple, to the point.
 *
 * When there's just one thing wrong, we don't need a bulleted list.
 * Just tell the user what happened and let them fix it.
 */
export const SingleError: Story = {
  args: {
    error: 'Please enter a valid email address.',
  },
  parameters: {
    docs: {
      description: {
        story: 'Single errors display as plain text. No bullets, no fanfare, just the message.',
      },
    },
  },
}

/**
 * A short, punchy error message. Sometimes less is more.
 */
export const ShortError: Story = {
  args: {
    error: 'Required field.',
  },
}

/**
 * A longer, more detailed error message. When context matters.
 */
export const DetailedError: Story = {
  args: {
    error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.',
  },
  parameters: {
    docs: {
      description: {
        story: 'Detailed errors help users understand exactly what\'s needed. Be specific!',
      },
    },
  },
}

// =============================================================================
// MULTIPLE ERRORS
// =============================================================================

/**
 * ## Multiple Errors: The Error Parade
 *
 * Sometimes things go really wrong. Multiple fields fail validation.
 * The user tried their best, but their best included "password123"
 * as a password and their phone number as an email.
 *
 * When you pass an array of errors, ValidationError automatically
 * renders them as a bulleted list. Order matters — put the most
 * important errors first.
 */
export const MultipleErrors: Story = {
  args: {
    error: [
      'Email address is required.',
      'Password must be at least 8 characters.',
      'Please accept the terms of service.',
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Multiple errors render as a bulleted list. Clear hierarchy, easy scanning.',
      },
    },
  },
}

/**
 * Two errors. The most common "oops" scenario.
 */
export const TwoErrors: Story = {
  args: {
    error: [
      'Username is already taken.',
      'Email address is invalid.',
    ],
  },
}

/**
 * Many errors. When the form submission really didn't go well.
 * Users may need emotional support after seeing this.
 */
export const ManyErrors: Story = {
  args: {
    error: [
      'First name is required.',
      'Last name is required.',
      'Email address is invalid.',
      'Password must be at least 8 characters.',
      'Password confirmation does not match.',
      'Phone number format is invalid.',
      'Please select a valid country.',
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Seven errors? Time to rethink your form design. But we\'ll display them all.',
      },
    },
  },
}

/**
 * Errors with varying lengths. Real validation messages aren't uniform.
 */
export const MixedLengthErrors: Story = {
  args: {
    error: [
      'Required.',
      'Email must be a valid email address containing an @ symbol and a domain.',
      'Too short.',
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Error messages can vary in length. The list formatting handles it gracefully.',
      },
    },
  },
}

// =============================================================================
// EDGE CASES - THE VOID HANDLERS
// =============================================================================

/**
 * ## Edge Cases: Embracing the Void
 *
 * ValidationError handles the messy reality of form validation.
 * Sometimes you have errors, sometimes you don't. Sometimes you
 * have an array that's technically not empty but contains nothing useful.
 *
 * In all these cases, ValidationError does the right thing: render nothing.
 */

/**
 * Null error. No news is good news.
 *
 * When error is null, the component renders nothing.
 * Your form is clean. Your validation passed. Celebrate.
 */
export const NullError: Story = {
  args: {
    error: null,
  },
  parameters: {
    docs: {
      description: {
        story: 'Null errors render nothing. The component gracefully disappears.',
      },
    },
  },
}

/**
 * Undefined error. The component handles this with grace.
 */
export const UndefinedError: Story = {
  args: {
    error: undefined,
  },
  parameters: {
    docs: {
      description: {
        story: 'Undefined is treated the same as null. No error, no render.',
      },
    },
  },
}

/**
 * Empty string error. Also renders nothing.
 *
 * Because "" is technically a string but contains no useful information.
 */
export const EmptyStringError: Story = {
  args: {
    error: '',
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty strings are filtered out. No empty error boxes cluttering your UI.',
      },
    },
  },
}

/**
 * Empty array. No errors in the list means no list to show.
 */
export const EmptyArrayError: Story = {
  args: {
    error: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'An empty array renders nothing. Logical, right?',
      },
    },
  },
}

/**
 * Array with only empty strings. All filtered, nothing rendered.
 */
export const ArrayOfEmptyStrings: Story = {
  args: {
    error: ['', '', ''],
  },
  parameters: {
    docs: {
      description: {
        story: 'Arrays containing only empty strings are fully filtered. Clean slate.',
      },
    },
  },
}

/**
 * Array with mixed empty and real errors. Only real ones shown.
 */
export const ArrayWithSomeEmptyStrings: Story = {
  args: {
    error: ['', 'This is a real error.', '', 'This one too.', ''],
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty strings in arrays are quietly removed. Only meaningful errors display.',
      },
    },
  },
}

// =============================================================================
// FORM FIELD INTEGRATION
// =============================================================================

/**
 * ## Form Field Integration
 *
 * ValidationError shines when paired with form fields. Here's how to
 * integrate it with various input types for a polished error experience.
 */

/**
 * With a simple input field. The classic pairing.
 */
export const WithInputField: Story = {
  render: () => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Email Address
      </label>
      <Input type="email" invalid defaultValue="not-an-email" />
      <ValidationError error="Please enter a valid email address." />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'ValidationError below an invalid input. The classic error display pattern.',
      },
    },
  },
}

/**
 * With InputGroup and icon. Extra visual polish.
 */
export const WithInputGroup: Story = {
  render: () => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Password
      </label>
      <InputGroup>
        <Lock data-slot="icon" />
        <Input type="password" invalid defaultValue="123" />
      </InputGroup>
      <ValidationError error="Password must be at least 8 characters." />
    </div>
  ),
}

/**
 * Integration with Fieldset. The full form experience.
 */
export const WithFieldset: Story = {
  render: () => (
    <Fieldset>
      <Legend>Create Account</Legend>
      <FieldGroup>
        <Field>
          <Label>Username</Label>
          <Input invalid defaultValue="ab" />
        </Field>
        <Field>
          <Label>Email</Label>
          <Input type="email" invalid defaultValue="nope" />
        </Field>
        <ValidationError
          error={[
            'Username must be at least 3 characters.',
            'Email address is not valid.',
          ]}
        />
      </FieldGroup>
    </Fieldset>
  ),
  parameters: {
    docs: {
      description: {
        story: 'ValidationError at the bottom of a Fieldset summarizes all errors in one place.',
      },
    },
  },
}

/**
 * Multiple fields, each with their own ValidationError.
 * For per-field inline validation display.
 */
export const PerFieldErrors: Story = {
  render: () => (
    <Fieldset>
      <Legend>Sign Up</Legend>
      <FieldGroup>
        <div className="space-y-1">
          <Field>
            <Label>Username</Label>
            <Input invalid defaultValue="x" />
          </Field>
          <ValidationError error="Username must be at least 3 characters." />
        </div>
        <div className="space-y-1">
          <Field>
            <Label>Email</Label>
            <Input type="email" invalid defaultValue="bad@" />
          </Field>
          <ValidationError error="Please enter a complete email address." />
        </div>
        <div className="space-y-1">
          <Field>
            <Label>Password</Label>
            <Input type="password" invalid defaultValue="abc" />
          </Field>
          <ValidationError
            error={[
              'Password must be at least 8 characters.',
              'Password must contain at least one number.',
            ]}
          />
        </div>
      </FieldGroup>
    </Fieldset>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Each field can have its own ValidationError for inline feedback. Users see errors right where they made them.',
      },
    },
  },
}

/**
 * With Textarea. Long-form validation.
 */
export const WithTextarea: Story = {
  render: () => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Recipe Description
      </label>
      <Textarea invalid defaultValue="ok" />
      <ValidationError error="Description must be at least 50 characters. You wrote 2." />
    </div>
  ),
}

/**
 * With Select. Choice validation.
 */
export const WithSelect: Story = {
  render: () => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Difficulty Level
      </label>
      <Select invalid defaultValue="">
        <option value="" disabled>Select difficulty</option>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </Select>
      <ValidationError error="Please select a difficulty level." />
    </div>
  ),
}

// =============================================================================
// REAL-WORLD EXAMPLES
// =============================================================================

/**
 * ## Real-World Scenarios
 *
 * Let's see ValidationError in action in actual form contexts.
 * Because demo components are nice, but real forms are where it matters.
 */

/**
 * Login form with validation. The most common error scenario.
 */
export const LoginFormValidation: Story = {
  render: () => (
    <div className="space-y-4 p-6 border border-zinc-200 dark:border-zinc-700 rounded-lg">
      <h3 className="font-semibold text-zinc-900 dark:text-white text-lg">Welcome back!</h3>
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
          <InputGroup>
            <Mail data-slot="icon" />
            <Input type="email" invalid defaultValue="user" />
          </InputGroup>
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
          <InputGroup>
            <Lock data-slot="icon" />
            <Input type="password" invalid defaultValue="" />
          </InputGroup>
        </div>
        <ValidationError
          error={[
            'Email address must include @ and a domain.',
            'Password is required.',
          ]}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A login form showing validation errors. Users need to fix both fields before proceeding.',
      },
    },
  },
}

/**
 * Registration form with comprehensive validation.
 */
export const RegistrationValidation: Story = {
  render: () => (
    <Fieldset>
      <Legend>Create Your Account</Legend>
      <FieldGroup>
        <div className="space-y-1">
          <Field>
            <Label>Full Name</Label>
            <InputGroup>
              <User data-slot="icon" />
              <Input invalid defaultValue="" />
            </InputGroup>
          </Field>
          <ValidationError error="Full name is required." />
        </div>
        <div className="space-y-1">
          <Field>
            <Label>Email</Label>
            <InputGroup>
              <Mail data-slot="icon" />
              <Input type="email" invalid defaultValue="test@" />
            </InputGroup>
          </Field>
          <ValidationError error="Please enter a complete email address." />
        </div>
        <div className="space-y-1">
          <Field>
            <Label>Password</Label>
            <InputGroup>
              <Lock data-slot="icon" />
              <Input type="password" invalid defaultValue="password" />
            </InputGroup>
          </Field>
          <ValidationError
            error={[
              'Password must contain at least one uppercase letter.',
              'Password must contain at least one number.',
            ]}
          />
        </div>
        <div className="space-y-1">
          <Field>
            <Label>Confirm Password</Label>
            <InputGroup>
              <Lock data-slot="icon" />
              <Input type="password" invalid defaultValue="passwor" />
            </InputGroup>
          </Field>
          <ValidationError error="Passwords do not match." />
        </div>
      </FieldGroup>
    </Fieldset>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A registration form with validation on each field. Real-world chaos, elegantly handled.',
      },
    },
  },
}

/**
 * Recipe form validation. Domain-specific errors.
 */
export const RecipeFormValidation: Story = {
  render: () => (
    <Fieldset>
      <Legend>Add New Recipe</Legend>
      <FieldGroup>
        <div className="space-y-1">
          <Field>
            <Label>Recipe Title</Label>
            <Input invalid defaultValue="" />
          </Field>
          <ValidationError error="Every recipe needs a name. What are we making?" />
        </div>
        <div className="space-y-1">
          <Field>
            <Label>Description</Label>
            <Textarea invalid defaultValue="Good food." />
          </Field>
          <ValidationError error="Description should be at least 20 characters. Sell us on this dish!" />
        </div>
        <div className="space-y-1">
          <Field>
            <Label>Prep Time (minutes)</Label>
            <Input type="number" invalid defaultValue="-5" />
          </Field>
          <ValidationError error="Prep time must be a positive number. Time travel isn't supported yet." />
        </div>
        <div className="space-y-1">
          <Field>
            <Label>Servings</Label>
            <Input type="number" invalid defaultValue="0" />
          </Field>
          <ValidationError error="Servings must be at least 1. Cooking for nobody?" />
        </div>
      </FieldGroup>
    </Fieldset>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Recipe-specific validation with personality. Error messages can have character!',
      },
    },
  },
}

/**
 * Form summary error. Top-of-form error summary pattern.
 */
export const FormSummaryError: Story = {
  render: () => (
    <div className="space-y-4">
      <ValidationError
        error={[
          'Please fix the following errors:',
          '• Email address is invalid',
          '• Password is too short',
          '• Terms of service must be accepted',
        ]}
      />
      <Fieldset>
        <Legend>Account Details</Legend>
        <FieldGroup>
          <Field>
            <Label>Email</Label>
            <Input type="email" invalid defaultValue="bad-email" />
          </Field>
          <Field>
            <Label>Password</Label>
            <Input type="password" invalid defaultValue="123" />
          </Field>
        </FieldGroup>
      </Fieldset>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Error summary at the top of a form. Users see all problems at a glance before scrolling.',
      },
    },
  },
}

// =============================================================================
// STYLING VARIANTS
// =============================================================================

/**
 * With custom className. Extend the styling when needed.
 */
export const WithCustomClass: Story = {
  args: {
    error: 'This error has extra top margin for spacing.',
    className: 'mt-4',
  },
  parameters: {
    docs: {
      description: {
        story: 'Pass className to add custom styles. The base styles are preserved.',
      },
    },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Testing accessibility role. Screen readers should announce errors.
 */
export const AccessibilityRole: Story = {
  args: {
    error: 'This error should be announced by screen readers.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const errorElement = canvas.getByRole('alert')

    // Should have role="alert" for screen reader announcement
    await expect(errorElement).toBeInTheDocument()
    await expect(errorElement).toHaveAttribute('role', 'alert')
  },
  parameters: {
    docs: {
      description: {
        story: 'ValidationError uses role="alert" so screen readers automatically announce errors.',
      },
    },
  },
}

/**
 * Testing that null renders nothing.
 */
export const NullRendersNothing: Story = {
  args: {
    error: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Should not find any alert role
    const errorElement = canvas.queryByRole('alert')
    await expect(errorElement).not.toBeInTheDocument()
  },
  parameters: {
    docs: {
      description: {
        story: 'Null errors render nothing. The DOM stays clean.',
      },
    },
  },
}

/**
 * Testing that empty array renders nothing.
 */
export const EmptyArrayRendersNothing: Story = {
  args: {
    error: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Should not find any alert role
    const errorElement = canvas.queryByRole('alert')
    await expect(errorElement).not.toBeInTheDocument()
  },
}

/**
 * Testing multiple errors render as list.
 */
export const MultipleErrorsRenderAsList: Story = {
  args: {
    error: ['First error', 'Second error', 'Third error'],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Should find the alert container
    const errorElement = canvas.getByRole('alert')
    await expect(errorElement).toBeInTheDocument()

    // Should find a list
    const list = errorElement.querySelector('ul')
    await expect(list).toBeInTheDocument()

    // Should have three list items
    const items = errorElement.querySelectorAll('li')
    await expect(items.length).toBe(3)

    // Check content
    await expect(items[0]).toHaveTextContent('First error')
    await expect(items[1]).toHaveTextContent('Second error')
    await expect(items[2]).toHaveTextContent('Third error')
  },
  parameters: {
    docs: {
      description: {
        story: 'Multiple errors create a bulleted list. Each error gets its own list item.',
      },
    },
  },
}

/**
 * Testing single error renders as plain text.
 */
export const SingleErrorRendersAsText: Story = {
  args: {
    error: 'Just one error here.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const errorElement = canvas.getByRole('alert')
    await expect(errorElement).toBeInTheDocument()

    // Should NOT have a list
    const list = errorElement.querySelector('ul')
    await expect(list).not.toBeInTheDocument()

    // Should have the text directly
    await expect(errorElement).toHaveTextContent('Just one error here.')
  },
  parameters: {
    docs: {
      description: {
        story: 'A single error displays as plain text, no list markup.',
      },
    },
  },
}

/**
 * Testing that array with one item after filtering renders as text.
 */
export const FilteredToSingleError: Story = {
  args: {
    error: ['', 'Only real error', ''],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const errorElement = canvas.getByRole('alert')
    await expect(errorElement).toBeInTheDocument()

    // Should NOT have a list (only one real error after filtering)
    const list = errorElement.querySelector('ul')
    await expect(list).not.toBeInTheDocument()

    // Should have just the text
    await expect(errorElement).toHaveTextContent('Only real error')
  },
  parameters: {
    docs: {
      description: {
        story: 'When filtering leaves one error, it renders as text, not a single-item list.',
      },
    },
  },
}

/**
 * Interactive demo: Form that shows/hides errors based on input.
 */
export const InteractiveValidation: Story = {
  render: function InteractiveValidationStory() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [touched, setTouched] = useState({ email: false, password: false })

    const errors: string[] = []

    if (touched.email && !email.includes('@')) {
      errors.push('Email must contain @ symbol.')
    }
    if (touched.password && password.length < 8) {
      errors.push('Password must be at least 8 characters.')
    }

    return (
      <div className="space-y-4 p-6 border border-zinc-200 dark:border-zinc-700 rounded-lg">
        <h3 className="font-semibold text-zinc-900 dark:text-white text-lg">Try it out!</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Type in the fields to see validation in action.
        </p>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Email
            </label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              invalid={touched.email && !email.includes('@')}
              data-testid="email-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Password
            </label>
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              invalid={touched.password && password.length < 8}
              data-testid="password-input"
            />
          </div>
        </div>
        <ValidationError error={errors.length > 0 ? errors : null} />
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const emailInput = canvas.getByTestId('email-input')
    const passwordInput = canvas.getByTestId('password-input')

    // Initially no errors
    let errorElement = canvas.queryByRole('alert')
    await expect(errorElement).not.toBeInTheDocument()

    // Type invalid email and blur
    await userEvent.type(emailInput, 'notvalid')
    await userEvent.tab() // blur email, focus password

    // Should show email error
    errorElement = canvas.getByRole('alert')
    await expect(errorElement).toHaveTextContent('Email must contain @ symbol')

    // Type short password and blur
    await userEvent.type(passwordInput, '123')
    await userEvent.tab()

    // Should show both errors as list
    errorElement = canvas.getByRole('alert')
    const list = errorElement.querySelector('ul')
    await expect(list).toBeInTheDocument()

    // Fix email
    await userEvent.clear(emailInput)
    await userEvent.type(emailInput, 'valid@email.com')
    await userEvent.tab()

    // Now only password error remains (as text, not list)
    errorElement = canvas.getByRole('alert')
    const listAfterFix = errorElement.querySelector('ul')
    await expect(listAfterFix).not.toBeInTheDocument()
    await expect(errorElement).toHaveTextContent('Password must be at least 8 characters')
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive form with live validation. Errors appear on blur and update as you type.',
      },
    },
  },
}
