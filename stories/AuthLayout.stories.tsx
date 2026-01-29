import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import {
  ChefHat,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Github,
  Chrome,
} from 'lucide-react'
import { useState } from 'react'
import { AuthLayout } from '../app/components/ui/auth-layout'
import { Button } from '../app/components/ui/button'
import { Input } from '../app/components/ui/input'
import { Field, Label, Description } from '../app/components/ui/fieldset'
import { Checkbox, CheckboxField } from '../app/components/ui/checkbox'
import { Heading } from '../app/components/ui/heading'
import { Text } from '../app/components/ui/text'
import { Divider } from '../app/components/ui/divider'
import { Link } from '../app/components/ui/link'

/**
 * # AuthLayout
 *
 * The sacred gateway to your application. The velvet rope between anonymous
 * strangers and authenticated users. The "you shall not pass" of UX, except
 * when you have the right password.
 *
 * AuthLayout is dead simple on purpose. It's a centered container that makes
 * your login forms look good without you having to think about it. Full-screen
 * on mobile, elegant card treatment on desktop. No drama, just works.
 *
 * ## Design Philosophy
 *
 * Authentication pages have one job: get users in (or signed up) as quickly
 * as possible with minimal friction. That means:
 *
 * - **Clean, focused design** - No distractions. The form is the star.
 * - **Mobile-first** - Most signups happen on phones these days.
 * - **Forgiving** - Clear error states, helpful hints, password visibility toggles.
 *
 * ## What Goes Inside
 *
 * AuthLayout is just a wrapper. You provide the content:
 * - Logo/branding at the top
 * - Form fields (email, password, the usual suspects)
 * - Submit button
 * - Links (forgot password, sign up instead, etc.)
 * - Social login buttons if you're feeling fancy
 *
 * ## When to Use
 *
 * - Login pages (obviously)
 * - Sign up / registration flows
 * - Password reset screens
 * - Email verification pages
 * - Magic link confirmation
 * - Any page where you need focused, centered content with no navigation
 *
 * ## When NOT to Use
 *
 * - Authenticated pages (use SidebarLayout or StackedLayout)
 * - Landing pages (too simple for marketing)
 * - Anything that needs navigation (no nav = no distractions = the point)
 *
 * ## Responsive Behavior
 *
 * - **Mobile**: Full-screen, edge-to-edge content with padding
 * - **Desktop (lg+)**: Centered card with subtle shadow and rounded corners
 *
 * The card effect on desktop adds visual hierarchy and makes the form feel
 * like a deliberate destination rather than just... a page.
 */
const meta: Meta<typeof AuthLayout> = {
  title: 'Layout/AuthLayout',
  component: AuthLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
A minimal, centered layout for authentication flows. Login, signup, password reset — any page where the form is the only focus.

Mobile shows full-screen content. Desktop (lg+) wraps content in a subtle card with shadow and rounded corners. No navigation, no distractions, just the task at hand.
        `,
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// SAMPLE COMPONENTS
// =============================================================================

function Logo() {
  return (
    <div className="flex items-center justify-center gap-2">
      <ChefHat className="h-8 w-8 text-amber-500" />
      <span className="text-2xl font-bold text-zinc-900 dark:text-white">
        Spoonjoy
      </span>
    </div>
  )
}

function SocialButtons() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button outline className="w-full">
        <Github data-slot="icon" />
        GitHub
      </Button>
      <Button outline className="w-full">
        <Chrome data-slot="icon" />
        Google
      </Button>
    </div>
  )
}

function OrDivider() {
  return (
    <div className="relative">
      <Divider />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="bg-white px-2 text-sm text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
          or continue with
        </span>
      </div>
    </div>
  )
}

// =============================================================================
// BASIC STORIES
// =============================================================================

/**
 * The default AuthLayout. Just a container ready for your content.
 * Add your logo, form, and links — it handles the centering and styling.
 */
export const Default: Story = {
  render: () => (
    <AuthLayout>
      <div className="w-full max-w-sm">
        <Logo />
        <Text className="mt-2 text-center">
          Sign in to access your recipes, collections, and meal plans.
        </Text>
        <div className="mt-8 space-y-4">
          <Field>
            <Label>Email</Label>
            <Input type="email" placeholder="chef@example.com" />
          </Field>
          <Field>
            <Label>Password</Label>
            <Input type="password" placeholder="••••••••" />
          </Field>
          <Button className="w-full" color="amber">
            Sign In
          </Button>
        </div>
      </div>
    </AuthLayout>
  ),
}

// =============================================================================
// LOGIN VARIANTS
// =============================================================================

/**
 * ## Standard Login
 *
 * The most common login form you'll ever build. Email, password, forgot link.
 * Simple. Clean. Gets the job done.
 */
export const LoginForm: Story = {
  render: () => (
    <AuthLayout>
      <div className="w-full max-w-sm">
        <Logo />
        <Heading level={2} className="mt-6 text-center">
          Welcome back
        </Heading>
        <Text className="mt-2 text-center">
          Sign in to your account to continue
        </Text>

        <form className="mt-8 space-y-6">
          <div className="space-y-4">
            <Field>
              <Label>Email address</Label>
              <Input
                type="email"
                autoComplete="email"
                placeholder="chef@example.com"
              />
            </Field>
            <Field>
              <Label>Password</Label>
              <Input
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </Field>
          </div>

          <div className="flex items-center justify-between">
            <CheckboxField>
              <Checkbox name="remember" />
              <Label>Remember me</Label>
            </CheckboxField>
            <Link href="/forgot-password" className="text-sm">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" color="amber">
            <Lock data-slot="icon" />
            Sign in
          </Button>
        </form>

        <Text className="mt-6 text-center text-sm">
          Don't have an account?{' '}
          <Link href="/signup">Sign up for free</Link>
        </Text>
      </div>
    </AuthLayout>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The classic login form. Email, password, remember me, and a helpful forgot password link.',
      },
    },
  },
}

/**
 * ## Login with Social Options
 *
 * For when you want to let people skip the password dance.
 * OAuth buttons up top, traditional form below. The "or" divider
 * ties it all together.
 */
export const LoginWithSocial: Story = {
  render: () => (
    <AuthLayout>
      <div className="w-full max-w-sm">
        <Logo />
        <Heading level={2} className="mt-6 text-center">
          Sign in to Spoonjoy
        </Heading>
        <Text className="mt-2 text-center">
          Your recipes are waiting for you
        </Text>

        <div className="mt-8">
          <SocialButtons />

          <div className="my-6">
            <OrDivider />
          </div>

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
    docs: {
      description: {
        story: 'Login with social OAuth options. Quick access via GitHub/Google, or fall back to email.',
      },
    },
  },
}

/**
 * ## Login with Password Toggle
 *
 * Because nobody can remember if they typed `P@ssw0rd!` or `p@ssw0rd!`
 * on the first try. The eye icon lets users peek at what they've entered.
 */
export const LoginWithPasswordToggle: Story = {
  render: function LoginWithPasswordToggleRender() {
    const [showPassword, setShowPassword] = useState(false)

    return (
      <AuthLayout>
        <div className="w-full max-w-sm">
          <Logo />
          <Heading level={2} className="mt-6 text-center">
            Welcome back
          </Heading>

          <form className="mt-8 space-y-4">
            <Field>
              <Label>Email</Label>
              <Input type="email" placeholder="chef@example.com" />
            </Field>
            <Field>
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pr-10"
                  data-testid="password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  data-testid="toggle-password"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </Field>
            <Button type="submit" className="w-full" color="amber">
              Sign in
            </Button>
          </form>

          <Text className="mt-6 text-center text-sm">
            <Link href="/forgot-password">Forgot your password?</Link>
          </Text>
        </div>
      </AuthLayout>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Password field with visibility toggle. Click the eye to peek at your password.',
      },
    },
  },
}

// =============================================================================
// SIGNUP VARIANTS
// =============================================================================

/**
 * ## Simple Signup
 *
 * Name, email, password. The bare minimum to get someone in the door.
 * Don't ask for more than you need at signup — you can always collect
 * additional info later.
 */
export const SignupForm: Story = {
  render: () => (
    <AuthLayout>
      <div className="w-full max-w-sm">
        <Logo />
        <Heading level={2} className="mt-6 text-center">
          Create your account
        </Heading>
        <Text className="mt-2 text-center">
          Start organizing your recipes today
        </Text>

        <form className="mt-8 space-y-4">
          <Field>
            <Label>Full name</Label>
            <Input
              type="text"
              autoComplete="name"
              placeholder="Julia Child"
            />
          </Field>
          <Field>
            <Label>Email address</Label>
            <Input
              type="email"
              autoComplete="email"
              placeholder="chef@example.com"
            />
          </Field>
          <Field>
            <Label>Password</Label>
            <Input
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
            />
            <Description>At least 8 characters with a mix of letters and numbers</Description>
          </Field>
          <Button type="submit" className="w-full" color="amber">
            <User data-slot="icon" />
            Create account
          </Button>
        </form>

        <Text className="mt-6 text-center text-sm">
          Already have an account?{' '}
          <Link href="/login">Sign in</Link>
        </Text>
      </div>
    </AuthLayout>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Simple signup form. Name, email, password — just the essentials.',
      },
    },
  },
}

/**
 * ## Signup with Terms
 *
 * For when legal says you need a checkbox before they click "Create Account."
 * Nobody reads terms anyway, but at least they agreed to them.
 */
export const SignupWithTerms: Story = {
  render: () => (
    <AuthLayout>
      <div className="w-full max-w-sm">
        <Logo />
        <Heading level={2} className="mt-6 text-center">
          Join Spoonjoy
        </Heading>
        <Text className="mt-2 text-center">
          Create an account to save and share recipes
        </Text>

        <form className="mt-8 space-y-4">
          <Field>
            <Label>Email address</Label>
            <Input type="email" placeholder="chef@example.com" />
          </Field>
          <Field>
            <Label>Password</Label>
            <Input type="password" placeholder="••••••••" />
          </Field>
          <Field>
            <Label>Confirm password</Label>
            <Input type="password" placeholder="••••••••" />
          </Field>

          <CheckboxField>
            <Checkbox name="terms" />
            <Label>
              I agree to the{' '}
              <Link href="/terms">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy">Privacy Policy</Link>
            </Label>
          </CheckboxField>

          <Button type="submit" className="w-full" color="amber">
            Create account
          </Button>
        </form>

        <Text className="mt-6 text-center text-sm">
          Already cooking with us?{' '}
          <Link href="/login">Sign in</Link>
        </Text>
      </div>
    </AuthLayout>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Signup with terms agreement checkbox. Legal compliance in a nutshell.',
      },
    },
  },
}

/**
 * ## Signup with Social
 *
 * OAuth-first signup. Let users skip the form entirely if they want.
 * Less friction = more signups. It's not rocket science.
 */
export const SignupWithSocial: Story = {
  render: () => (
    <AuthLayout>
      <div className="w-full max-w-sm">
        <Logo />
        <Heading level={2} className="mt-6 text-center">
          Get started for free
        </Heading>
        <Text className="mt-2 text-center">
          No credit card required. Ever.
        </Text>

        <div className="mt-8">
          <SocialButtons />

          <div className="my-6">
            <OrDivider />
          </div>

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
    docs: {
      description: {
        story: 'OAuth-first signup flow. Quick social sign-in with email fallback.',
      },
    },
  },
}

// =============================================================================
// PASSWORD RESET FLOWS
// =============================================================================

/**
 * ## Forgot Password
 *
 * Step 1: User admits they can't remember their password.
 * We send them an email. They check their spam folder. Circle of life.
 */
export const ForgotPassword: Story = {
  render: () => (
    <AuthLayout>
      <div className="w-full max-w-sm">
        <Logo />
        <Heading level={2} className="mt-6 text-center">
          Forgot your password?
        </Heading>
        <Text className="mt-2 text-center">
          No worries. Enter your email and we'll send you a reset link.
        </Text>

        <form className="mt-8 space-y-4">
          <Field>
            <Label>Email address</Label>
            <Input type="email" placeholder="chef@example.com" />
            <Description>We'll send a password reset link to this email</Description>
          </Field>
          <Button type="submit" className="w-full" color="amber">
            <Mail data-slot="icon" />
            Send reset link
          </Button>
        </form>

        <Text className="mt-6 text-center text-sm">
          Remember your password?{' '}
          <Link href="/login">Back to sign in</Link>
        </Text>
      </div>
    </AuthLayout>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Password reset request form. Enter email, get a magic link.',
      },
    },
  },
}

/**
 * ## Reset Password
 *
 * Step 2: User clicked the email link and now gets to pick a new password.
 * Make them type it twice because fat fingers are real.
 */
export const ResetPassword: Story = {
  render: () => (
    <AuthLayout>
      <div className="w-full max-w-sm">
        <Logo />
        <Heading level={2} className="mt-6 text-center">
          Set new password
        </Heading>
        <Text className="mt-2 text-center">
          Choose a strong password you haven't used before
        </Text>

        <form className="mt-8 space-y-4">
          <Field>
            <Label>New password</Label>
            <Input type="password" placeholder="••••••••" />
            <Description>At least 8 characters</Description>
          </Field>
          <Field>
            <Label>Confirm new password</Label>
            <Input type="password" placeholder="••••••••" />
          </Field>
          <Button type="submit" className="w-full" color="amber">
            Reset password
          </Button>
        </form>
      </div>
    </AuthLayout>
  ),
  parameters: {
    docs: {
      description: {
        story: 'New password form after clicking the reset link.',
      },
    },
  },
}

/**
 * ## Check Your Email
 *
 * The "we sent you an email" confirmation page. Clear messaging about
 * what to do next, with a resend option for the impatient.
 */
export const CheckEmail: Story = {
  render: () => (
    <AuthLayout>
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
          <Mail className="h-6 w-6 text-amber-600 dark:text-amber-400" />
        </div>
        <Heading level={2} className="mt-4">
          Check your email
        </Heading>
        <Text className="mt-2">
          We sent a password reset link to{' '}
          <span className="font-medium text-zinc-900 dark:text-white">
            chef@example.com
          </span>
        </Text>

        <div className="mt-8 space-y-4">
          <Button className="w-full" color="amber">
            Open email app
          </Button>
          <Button outline className="w-full">
            Resend email
          </Button>
        </div>

        <Text className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
          Didn't receive it? Check your spam folder.
        </Text>

        <Text className="mt-4 text-sm">
          <Link href="/login">Back to sign in</Link>
        </Text>
      </div>
    </AuthLayout>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Email sent confirmation. Clear next steps and resend option.',
      },
    },
  },
}

// =============================================================================
// VERIFICATION & CONFIRMATION
// =============================================================================

/**
 * ## Email Verification
 *
 * The "please verify your email" page. Users hate this step but
 * bots hate it more, so here we are.
 */
export const EmailVerification: Story = {
  render: () => (
    <AuthLayout>
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
          <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <Heading level={2} className="mt-4">
          Verify your email
        </Heading>
        <Text className="mt-2">
          We sent a verification link to{' '}
          <span className="font-medium text-zinc-900 dark:text-white">
            newchef@example.com
          </span>
        </Text>
        <Text className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          Click the link in your email to verify your account and start using Spoonjoy.
        </Text>

        <div className="mt-8 space-y-3">
          <Button outline className="w-full">
            Resend verification email
          </Button>
          <Button plain className="w-full">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </div>
      </div>
    </AuthLayout>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Post-signup email verification prompt. Keeps the bots out.',
      },
    },
  },
}

/**
 * ## Account Verified
 *
 * The happy path! User clicked the link and we're good to go.
 * Time to start cooking.
 */
export const AccountVerified: Story = {
  render: () => (
    <AuthLayout>
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
          <ChefHat className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <Heading level={2} className="mt-4">
          You're all set!
        </Heading>
        <Text className="mt-2">
          Your email has been verified. Welcome to Spoonjoy!
        </Text>
        <Text className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          Time to start organizing your recipes and planning your meals.
        </Text>

        <div className="mt-8">
          <Button className="w-full" color="amber">
            Go to Dashboard
          </Button>
        </div>
      </div>
    </AuthLayout>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Successful verification confirmation. Welcome aboard!',
      },
    },
  },
}

// =============================================================================
// ERROR STATES
// =============================================================================

/**
 * ## Login Error
 *
 * When credentials don't match. Vague enough to not help attackers,
 * specific enough that users know something's wrong.
 */
export const LoginError: Story = {
  render: () => (
    <AuthLayout>
      <div className="w-full max-w-sm">
        <Logo />
        <Heading level={2} className="mt-6 text-center">
          Welcome back
        </Heading>

        <div className="mt-6 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-200">
            Invalid email or password. Please try again.
          </p>
        </div>

        <form className="mt-6 space-y-4">
          <Field>
            <Label>Email address</Label>
            <Input
              type="email"
              defaultValue="wrong@example.com"
              className="border-red-300 dark:border-red-700"
            />
          </Field>
          <Field>
            <Label>Password</Label>
            <Input
              type="password"
              defaultValue="wrongpassword"
              className="border-red-300 dark:border-red-700"
            />
          </Field>
          <Button type="submit" className="w-full" color="amber">
            Try again
          </Button>
        </form>

        <Text className="mt-6 text-center text-sm">
          <Link href="/forgot-password">Forgot your password?</Link>
        </Text>
      </div>
    </AuthLayout>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Login form with error state. Vague error message for security.',
      },
    },
  },
}

/**
 * ## Signup Validation Errors
 *
 * Inline validation for form fields. Show errors where they happen,
 * not in some banner at the top nobody reads.
 */
export const SignupErrors: Story = {
  render: () => (
    <AuthLayout>
      <div className="w-full max-w-sm">
        <Logo />
        <Heading level={2} className="mt-6 text-center">
          Create your account
        </Heading>

        <form className="mt-8 space-y-4">
          <Field>
            <Label>Email address</Label>
            <Input
              type="email"
              defaultValue="notanemail"
              className="border-red-300 dark:border-red-700"
            />
            <Description className="text-red-600 dark:text-red-400">
              Please enter a valid email address
            </Description>
          </Field>
          <Field>
            <Label>Password</Label>
            <Input
              type="password"
              defaultValue="short"
              className="border-red-300 dark:border-red-700"
            />
            <Description className="text-red-600 dark:text-red-400">
              Password must be at least 8 characters
            </Description>
          </Field>
          <Field>
            <Label>Confirm password</Label>
            <Input
              type="password"
              defaultValue="different"
              className="border-red-300 dark:border-red-700"
            />
            <Description className="text-red-600 dark:text-red-400">
              Passwords don't match
            </Description>
          </Field>
          <Button type="submit" className="w-full" color="amber">
            Create account
          </Button>
        </form>
      </div>
    </AuthLayout>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Signup form with inline validation errors on each field.',
      },
    },
  },
}

/**
 * ## Expired Link
 *
 * When the reset link has gone stale. Happens to the best of us.
 * Offer a way to get a fresh one.
 */
export const ExpiredLink: Story = {
  render: () => (
    <AuthLayout>
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
          <Lock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
        </div>
        <Heading level={2} className="mt-4">
          Link expired
        </Heading>
        <Text className="mt-2">
          This password reset link has expired. Links are valid for 24 hours
          for security reasons.
        </Text>

        <div className="mt-8 space-y-3">
          <Button className="w-full" color="amber">
            Request new link
          </Button>
          <Button plain className="w-full">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </div>
      </div>
    </AuthLayout>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Expired reset link error with option to request a new one.',
      },
    },
  },
}

// =============================================================================
// LOADING STATES
// =============================================================================

/**
 * ## Submitting Form
 *
 * Visual feedback while the form is being submitted.
 * Disabled button, maybe a spinner. Don't leave users wondering.
 */
export const SubmittingState: Story = {
  render: () => (
    <AuthLayout>
      <div className="w-full max-w-sm">
        <Logo />
        <Heading level={2} className="mt-6 text-center">
          Welcome back
        </Heading>

        <form className="mt-8 space-y-4">
          <Field>
            <Label>Email address</Label>
            <Input
              type="email"
              defaultValue="chef@example.com"
              disabled
            />
          </Field>
          <Field>
            <Label>Password</Label>
            <Input
              type="password"
              defaultValue="••••••••"
              disabled
            />
          </Field>
          <Button type="submit" className="w-full" color="amber" disabled>
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
              Signing in...
            </span>
          </Button>
        </form>
      </div>
    </AuthLayout>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Form in loading state while submitting. Disabled fields and spinner.',
      },
    },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Tests that form fields are focusable and can receive input.
 */
export const FormInteraction: Story = {
  render: () => (
    <AuthLayout>
      <div className="w-full max-w-sm">
        <Logo />
        <Heading level={2} className="mt-6 text-center">
          Sign in
        </Heading>
        <form className="mt-8 space-y-4">
          <Field>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="chef@example.com"
              data-testid="email-input"
            />
          </Field>
          <Field>
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              data-testid="password-input"
            />
          </Field>
          <Button
            type="submit"
            className="w-full"
            color="amber"
            data-testid="submit-button"
          >
            Sign in
          </Button>
        </form>
      </div>
    </AuthLayout>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Find form elements
    const emailInput = canvas.getByTestId('email-input')
    const passwordInput = canvas.getByTestId('password-input')
    const submitButton = canvas.getByTestId('submit-button')

    // Verify elements exist
    await expect(emailInput).toBeInTheDocument()
    await expect(passwordInput).toBeInTheDocument()
    await expect(submitButton).toBeInTheDocument()

    // Type in email field
    await userEvent.click(emailInput)
    await userEvent.type(emailInput, 'test@example.com')
    await expect(emailInput).toHaveValue('test@example.com')

    // Type in password field
    await userEvent.click(passwordInput)
    await userEvent.type(passwordInput, 'mypassword123')
    await expect(passwordInput).toHaveValue('mypassword123')

    // Verify submit button is clickable
    await expect(submitButton).toBeEnabled()
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests form field interactions: typing in email and password fields.',
      },
    },
  },
}

/**
 * Tests password visibility toggle interaction.
 */
export const PasswordToggleInteraction: Story = {
  render: function PasswordToggleInteractionRender() {
    const [showPassword, setShowPassword] = useState(false)

    return (
      <AuthLayout>
        <div className="w-full max-w-sm">
          <Logo />
          <form className="mt-8 space-y-4">
            <Field>
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  data-testid="password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  data-testid="toggle-button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </Field>
          </form>
        </div>
      </AuthLayout>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const passwordInput = canvas.getByTestId('password-input')
    const toggleButton = canvas.getByTestId('toggle-button')

    // Verify initial state is password (hidden)
    await expect(passwordInput).toHaveAttribute('type', 'password')

    // Type a password
    await userEvent.type(passwordInput, 'secretpassword')

    // Click toggle to show password
    await userEvent.click(toggleButton)
    await expect(passwordInput).toHaveAttribute('type', 'text')

    // Click toggle to hide password again
    await userEvent.click(toggleButton)
    await expect(passwordInput).toHaveAttribute('type', 'password')
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests password visibility toggle: click to show/hide password.',
      },
    },
  },
}

/**
 * Tests keyboard navigation through form fields.
 */
export const KeyboardNavigation: Story = {
  render: () => (
    <AuthLayout>
      <div className="w-full max-w-sm">
        <Logo />
        <form className="mt-8 space-y-4">
          <Field>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="chef@example.com"
              data-testid="email-input"
            />
          </Field>
          <Field>
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              data-testid="password-input"
            />
          </Field>
          <CheckboxField>
            <Checkbox name="remember" data-testid="remember-checkbox" />
            <Label>Remember me</Label>
          </CheckboxField>
          <Button
            type="submit"
            className="w-full"
            color="amber"
            data-testid="submit-button"
          >
            Sign in
          </Button>
        </form>
      </div>
    </AuthLayout>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const emailInput = canvas.getByTestId('email-input')

    // Focus first field
    await userEvent.click(emailInput)
    await expect(emailInput).toHaveFocus()

    // Tab to password
    await userEvent.tab()
    const passwordInput = canvas.getByTestId('password-input')
    await expect(passwordInput).toHaveFocus()

    // Tab to checkbox
    await userEvent.tab()
    const checkbox = canvas.getByTestId('remember-checkbox')
    await expect(checkbox).toHaveFocus()

    // Tab to submit button
    await userEvent.tab()
    const submitButton = canvas.getByTestId('submit-button')
    await expect(submitButton).toHaveFocus()
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests keyboard navigation through form fields using Tab key.',
      },
    },
  },
}
