import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { useState } from 'react'
import { ChefHat } from 'lucide-react'
import {
  OAuthButton,
  OAuthButtonGroup,
  OAuthDivider,
  OAuthError,
} from '../app/components/ui/oauth'
import { AuthLayout } from '../app/components/ui/auth-layout'
import { Button } from '../app/components/ui/button'
import { Input } from '../app/components/ui/input'
import { Field, Label } from '../app/components/ui/fieldset'
import { Heading } from '../app/components/ui/heading'
import { Text } from '../app/components/ui/text'
import { Link } from '../app/components/ui/link'

/**
 * # OAuth
 *
 * The "I don't want to remember another password" components. OAuth buttons
 * are the express lane of authentication — skip the form, click a button,
 * let someone else deal with password security.
 *
 * Google knows everything about you anyway. Apple pretends it doesn't. Either
 * way, your users get in faster, and you don't have to worry about storing
 * passwords. Everyone wins (except privacy, probably).
 *
 * ## The OAuth Cinematic Universe
 *
 * - **OAuthButton** — Individual provider buttons. Google is white and
 *   friendly. Apple is dark and mysterious. Just like their companies.
 *
 * - **OAuthButtonGroup** — All providers, stacked. The "I'm giving you
 *   options" approach.
 *
 * - **OAuthDivider** — The dramatic "or" that separates social login from
 *   the peasant email/password form below.
 *
 * - **OAuthError** — For when the OAuth gods reject your offering. Account
 *   already exists? Wrong provider? We've got messages for that.
 *
 * ## Design Philosophy
 *
 * OAuth buttons should look trustworthy. Users are about to hand over their
 * identity to you via a third party — the least we can do is make the
 * buttons look legitimate. Full-width for prominence, provider-specific
 * colors for recognition.
 *
 * ## When to Use
 *
 * - Login pages (obviously)
 * - Signup flows (reduce friction)
 * - Account linking (connect more providers to existing account)
 * - Anywhere you want users to authenticate without creating yet another
 *   password they'll forget
 *
 * ## Security Notes
 *
 * These components render `<form>` elements that POST to `/auth/{provider}`.
 * The actual OAuth flow happens server-side. Never put client secrets in
 * your frontend. That's not a suggestion, it's a commandment.
 */
const meta: Meta<typeof OAuthButton> = {
  title: 'UI/OAuth',
  component: OAuthButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
OAuth authentication components for social login. Includes provider buttons (Google, Apple), button groups, dividers, and error states.

Because remembering passwords is so 2005.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    provider: {
      control: 'select',
      options: ['google', 'apple'],
      description: 'The OAuth provider. Determines styling and label.',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes. For when you need more flair.',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// INDIVIDUAL BUTTONS
// =============================================================================

/**
 * The Google button. White background, friendly vibes.
 * "Don't be evil" they said. "We'll take care of your users" they said.
 */
export const GoogleButton: Story = {
  args: {
    provider: 'google',
  },
  parameters: {
    docs: {
      description: {
        story: 'Google OAuth button. White background because Google likes to be bright and optimistic.',
      },
    },
  },
}

/**
 * The Apple button. Dark, sleek, premium.
 * For users who think $1000 is a reasonable price for a phone stand.
 */
export const AppleButton: Story = {
  args: {
    provider: 'apple',
  },
  parameters: {
    docs: {
      description: {
        story: 'Apple OAuth button. Dark mode energy, even in light mode. Very on-brand.',
      },
    },
  },
}

/**
 * ## Both Providers Side by Side
 *
 * A comparison shot. Google is the extrovert at the party.
 * Apple is the one in black turtleneck judging everyone's font choices.
 */
export const BothProviders: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-72">
      <OAuthButton provider="google" />
      <OAuthButton provider="apple" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Both OAuth providers. Notice how they have completely opposite aesthetics.',
      },
    },
  },
}

// =============================================================================
// BUTTON GROUP
// =============================================================================

/**
 * ## OAuthButtonGroup
 *
 * The "here are all your options" component. Stacks all available OAuth
 * providers vertically. Currently that's Google and Apple, because we're
 * not monsters who'd add Facebook login.
 */
export const ButtonGroup: Story = {
  render: () => (
    <div className="w-72">
      <OAuthButtonGroup />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All OAuth buttons grouped together. One component to rule them all.',
      },
    },
  },
}

/**
 * ## Button Group with Custom Spacing
 *
 * Need more breathing room? Pass a className.
 */
export const ButtonGroupCustomSpacing: Story = {
  render: () => (
    <div className="w-72">
      <OAuthButtonGroup className="gap-4" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Button group with custom gap. Sometimes you need that extra margin for dramatic effect.',
      },
    },
  },
}

// =============================================================================
// DIVIDER
// =============================================================================

/**
 * ## OAuthDivider
 *
 * The dramatic pause between OAuth buttons and the email form.
 * "or" — the most passive-aggressive word in UI design.
 * It subtly implies that typing your email is the backup plan.
 */
export const Divider: Story = {
  render: () => (
    <div className="w-72">
      <OAuthDivider />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The "or" divider. Separates the easy path from the hard path.',
      },
    },
  },
}

/**
 * ## Divider in Context
 *
 * See how it looks between OAuth buttons and a form.
 * The full authentication experience.
 */
export const DividerInContext: Story = {
  render: () => (
    <div className="w-72 space-y-6">
      <OAuthButtonGroup />
      <OAuthDivider />
      <div className="space-y-4">
        <Field>
          <Label>Email</Label>
          <Input type="email" placeholder="chef@example.com" />
        </Field>
        <Button className="w-full" color="amber">
          Continue with email
        </Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The divider in its natural habitat: between OAuth buttons and the email form.',
      },
    },
  },
}

// =============================================================================
// ERROR STATES
// =============================================================================

/**
 * ## Account Already Exists Error
 *
 * When someone tries to sign up with Google but their email already
 * exists from a previous email/password signup. Classic mistake.
 * The error politely explains the situation.
 */
export const ErrorAccountExists: Story = {
  render: () => (
    <div className="w-72">
      <OAuthError error="account_exists" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Error shown when OAuth provider email matches an existing account. Gently guides user to log in instead.',
      },
    },
  },
}

/**
 * ## Generic OAuth Error
 *
 * For when things go wrong but we're not sure why.
 * Maybe the OAuth provider is having a bad day.
 * Maybe Mercury is in retrograde. Who knows.
 */
export const ErrorGeneric: Story = {
  render: () => (
    <div className="w-72">
      <OAuthError error="oauth_failed" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Generic error for unknown OAuth failures. Vague but reassuring.',
      },
    },
  },
}

/**
 * ## No Error (Hidden State)
 *
 * When `error` is undefined, the component renders nothing.
 * It's like a good referee — you don't notice it when it's doing its job.
 */
export const ErrorHidden: Story = {
  render: () => (
    <div className="w-72 p-4 border border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg">
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
        (OAuthError with undefined error — renders nothing)
      </p>
      <OAuthError error={undefined} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'When error is undefined or falsy, nothing renders. The component stays out of the way.',
      },
    },
  },
}

/**
 * ## Error in Login Context
 *
 * See how the error appears in a real login form.
 * Prominent but not panic-inducing.
 */
export const ErrorInContext: Story = {
  render: () => (
    <div className="w-72 space-y-6">
      <OAuthError error="account_exists" className="mb-4" />
      <OAuthButtonGroup />
      <OAuthDivider />
      <div className="space-y-4">
        <Field>
          <Label>Email</Label>
          <Input type="email" placeholder="chef@example.com" />
        </Field>
        <Button className="w-full" color="amber">
          Continue with email
        </Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'OAuth error displayed above the login options. Users see it immediately.',
      },
    },
  },
}

// =============================================================================
// COMPLETE FLOWS
// =============================================================================

/**
 * ## Complete Login with OAuth
 *
 * A full login page with OAuth options. This is how it all comes together
 * in the wild. OAuth buttons prominent at top, email form below for the
 * traditionalists.
 */
export const CompleteLoginFlow: Story = {
  render: () => (
    <AuthLayout>
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2">
          <ChefHat className="h-8 w-8 text-amber-500" />
          <span className="text-2xl font-bold text-zinc-900 dark:text-white">
            Spoonjoy
          </span>
        </div>
        <Heading level={2} className="mt-6 text-center">
          Welcome back
        </Heading>
        <Text className="mt-2 text-center">
          Sign in to access your recipes
        </Text>

        <div className="mt-8">
          <OAuthButtonGroup />
          <OAuthDivider className="my-6" />
          <form className="space-y-4">
            <Field>
              <Label>Email</Label>
              <Input type="email" placeholder="chef@example.com" />
            </Field>
            <Field>
              <Label>Password</Label>
              <Input type="password" placeholder="••••••••" />
            </Field>
            <Button type="submit" className="w-full" color="amber">
              Sign in with email
            </Button>
          </form>
        </div>

        <Text className="mt-6 text-center text-sm">
          New here?{' '}
          <Link href="/signup">Create an account</Link>
        </Text>
      </div>
    </AuthLayout>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Complete login page with OAuth and email options. The full authentication buffet.',
      },
    },
  },
}

/**
 * ## Signup with OAuth
 *
 * Same idea, different context. OAuth-first signup flow.
 * Get users in the door with minimal friction.
 */
export const CompleteSignupFlow: Story = {
  render: () => (
    <AuthLayout>
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2">
          <ChefHat className="h-8 w-8 text-amber-500" />
          <span className="text-2xl font-bold text-zinc-900 dark:text-white">
            Spoonjoy
          </span>
        </div>
        <Heading level={2} className="mt-6 text-center">
          Create your account
        </Heading>
        <Text className="mt-2 text-center">
          Start organizing your recipes today
        </Text>

        <div className="mt-8">
          <OAuthButtonGroup />
          <OAuthDivider className="my-6" />
          <form className="space-y-4">
            <Field>
              <Label>Email</Label>
              <Input type="email" placeholder="chef@example.com" />
            </Field>
            <Field>
              <Label>Create a password</Label>
              <Input type="password" placeholder="••••••••" />
            </Field>
            <Button type="submit" className="w-full" color="amber">
              Sign up with email
            </Button>
          </form>
        </div>

        <Text className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          By signing up, you agree to our{' '}
          <Link href="/terms">Terms</Link>
          {' '}and{' '}
          <Link href="/privacy">Privacy Policy</Link>
        </Text>
      </div>
    </AuthLayout>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Complete signup page with OAuth options. Less friction, more users.',
      },
    },
  },
}

/**
 * ## Login with OAuth Error
 *
 * When things go wrong during OAuth login.
 * The error appears prominently so users know what happened.
 */
export const LoginWithError: Story = {
  render: () => (
    <AuthLayout>
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2">
          <ChefHat className="h-8 w-8 text-amber-500" />
          <span className="text-2xl font-bold text-zinc-900 dark:text-white">
            Spoonjoy
          </span>
        </div>
        <Heading level={2} className="mt-6 text-center">
          Welcome back
        </Heading>

        <div className="mt-6">
          <OAuthError error="account_exists" />
        </div>

        <div className="mt-6">
          <OAuthButtonGroup />
          <OAuthDivider className="my-6" />
          <form className="space-y-4">
            <Field>
              <Label>Email</Label>
              <Input type="email" placeholder="chef@example.com" />
            </Field>
            <Field>
              <Label>Password</Label>
              <Input type="password" placeholder="••••••••" />
            </Field>
            <Button type="submit" className="w-full" color="amber">
              Sign in with email
            </Button>
          </form>
        </div>
      </div>
    </AuthLayout>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Login page showing an OAuth error. Account already exists with different provider.',
      },
    },
  },
}

// =============================================================================
// LOADING STATES
// =============================================================================

/**
 * ## Simulated Loading State
 *
 * While OAuth is in progress, you'd typically redirect to the provider.
 * But here's what a loading state might look like if you needed one.
 * Disabled buttons, maybe a spinner. The waiting game.
 */
export const LoadingState: Story = {
  render: function LoadingStateDemo() {
    const [isLoading, setIsLoading] = useState(false)

    return (
      <div className="w-72 space-y-4">
        <Text className="text-sm text-zinc-500 dark:text-zinc-400">
          Click a button to simulate loading state
        </Text>

        {isLoading ? (
          <div className="space-y-3">
            <Button color="white" className="w-full" disabled>
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Connecting to Google...
              </span>
            </Button>
            <Button color="dark" className="w-full" disabled>
              Continue with Apple
            </Button>
            <Button
              plain
              className="w-full text-sm"
              onClick={() => setIsLoading(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Button
              color="white"
              className="w-full"
              onClick={() => setIsLoading(true)}
            >
              Continue with Google
            </Button>
            <Button
              color="dark"
              className="w-full"
              onClick={() => setIsLoading(true)}
            >
              Continue with Apple
            </Button>
          </div>
        )}
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Simulated loading state during OAuth flow. In reality, users get redirected to the provider.',
      },
    },
  },
}

// =============================================================================
// DARK MODE
// =============================================================================

/**
 * ## Dark Mode Comparison
 *
 * OAuth buttons in dark mode. The Apple button finally feels at home.
 * The Google button... adapts.
 */
export const DarkModePreview: Story = {
  render: () => (
    <div className="flex gap-8">
      <div className="w-72 p-6 bg-white rounded-lg">
        <Text className="text-sm font-medium mb-4">Light Mode</Text>
        <OAuthButtonGroup />
        <OAuthDivider className="my-4" />
        <OAuthError error="account_exists" />
      </div>
      <div className="w-72 p-6 bg-zinc-900 rounded-lg">
        <Text className="text-sm font-medium mb-4 text-white">Dark Mode</Text>
        <div className="dark">
          <OAuthButtonGroup />
          <OAuthDivider className="my-4" />
          <OAuthError error="account_exists" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Side-by-side comparison of light and dark modes. Notice how the divider and error adapt.',
      },
    },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Tests that OAuth buttons are focusable and their forms have correct action.
 */
export const ButtonInteraction: Story = {
  render: () => (
    <div className="w-72 space-y-3">
      <OAuthButton provider="google" />
      <OAuthButton provider="apple" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Find the submit buttons within the OAuth button forms
    const googleButton = canvas.getByRole('button', { name: 'Continue with Google' })
    const appleButton = canvas.getByRole('button', { name: 'Continue with Apple' })

    // Verify buttons exist
    await expect(googleButton).toBeInTheDocument()
    await expect(appleButton).toBeInTheDocument()

    // Verify buttons are enabled
    await expect(googleButton).toBeEnabled()
    await expect(appleButton).toBeEnabled()

    // Verify the forms have correct actions
    const googleForm = googleButton.closest('form')
    const appleForm = appleButton.closest('form')

    await expect(googleForm).toHaveAttribute('action', '/auth/google')
    await expect(appleForm).toHaveAttribute('action', '/auth/apple')
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests OAuth button functionality: buttons exist, are enabled, and forms have correct action URLs.',
      },
    },
  },
}

/**
 * Tests keyboard navigation between OAuth buttons.
 */
export const KeyboardNavigation: Story = {
  render: () => (
    <div className="w-72">
      <OAuthButtonGroup />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const googleButton = canvas.getByRole('button', { name: 'Continue with Google' })
    const appleButton = canvas.getByRole('button', { name: 'Continue with Apple' })

    // Focus first button
    await userEvent.click(googleButton)
    await expect(googleButton).toHaveFocus()

    // Tab to next button
    await userEvent.tab()
    await expect(appleButton).toHaveFocus()
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests keyboard navigation between OAuth buttons using Tab key.',
      },
    },
  },
}

/**
 * Tests that error message is properly rendered and accessible.
 */
export const ErrorAccessibility: Story = {
  render: () => (
    <div className="w-72">
      <OAuthError error="account_exists" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Find the error alert by role
    const errorAlert = canvas.getByRole('alert')

    // Verify it exists and contains the expected message
    await expect(errorAlert).toBeInTheDocument()
    await expect(errorAlert).toHaveTextContent(
      'An account with this email already exists'
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests that OAuth errors have proper ARIA role and content for accessibility.',
      },
    },
  },
}

/**
 * Tests the OAuth divider renders correctly.
 */
export const DividerRendering: Story = {
  render: () => (
    <div className="w-72" data-testid="divider-container">
      <OAuthDivider />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Find the divider by test id
    const divider = canvas.getByTestId('oauth-separator')

    // Verify it exists and contains "or"
    await expect(divider).toBeInTheDocument()
    await expect(divider).toHaveTextContent('or')
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests that the OAuth divider renders with the "or" text.',
      },
    },
  },
}
