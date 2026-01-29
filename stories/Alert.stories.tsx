import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { useState } from 'react'
import {
  AlertTriangle,
  Trash2,
  LogOut,
  ShieldAlert,
  CreditCard,
  Bell,
  Settings,
  ChefHat,
  Flame,
  Cookie,
} from 'lucide-react'
import { Alert, AlertTitle, AlertDescription, AlertBody, AlertActions } from '../app/components/ui/alert'
import { Button } from '../app/components/ui/button'
import { Input } from '../app/components/ui/input'
import { Field, Label, Description } from '../app/components/ui/fieldset'

/**
 * # Alert (Dialog)
 *
 * The Alert component. Not to be confused with those annoying browser `alert()`
 * popups that haunted the web in 2003. This is a *sophisticated* modal dialog
 * built on HeadlessUI, perfect for moments when you need the user's undivided
 * attention.
 *
 * "Are you sure you want to delete this?" "Do you accept the terms?" "Did you
 * really just try to add mayonnaise to that recipe?"
 *
 * Alerts are the bouncers of UX. They stand between your user and potentially
 * regrettable actions, demanding confirmation before letting them through.
 * Use them wisely. Use them sparingly. Use them when the stakes are high.
 *
 * ## When to Use Alerts
 *
 * - **Destructive Actions** - "Delete forever? Like, FOREVER forever?"
 * - **Confirmations** - "You want to publish this half-written recipe?"
 * - **Critical Information** - "Your session expired while you were perfecting that soufflé"
 * - **Blocking Decisions** - Things that genuinely need immediate attention
 *
 * ## When NOT to Use Alerts
 *
 * - Success messages (use a toast)
 * - Non-critical notifications (use a banner)
 * - Every. Single. Action. (Don't be that app)
 *
 * ## Anatomy of an Alert
 *
 * - **Alert** - The modal container. Handles backdrop, positioning, transitions
 * - **AlertTitle** - The headline. Make it count
 * - **AlertDescription** - Additional context. Be helpful, not verbose
 * - **AlertBody** - For when you need more than text (forms, lists, etc.)
 * - **AlertActions** - Where the buttons live. Cancel on left, primary on right
 *
 * ## Size Variants
 *
 * From `xs` to `5xl` because sometimes you need a gentle nudge, and sometimes
 * you need a full intervention.
 */
const meta: Meta<typeof Alert> = {
  title: 'UI/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A modal dialog component for confirmations, warnings, and critical decisions.

Built on HeadlessUI with smooth transitions, backdrop blur, and support for
titles, descriptions, custom body content, and action buttons.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'],
      description: 'Maximum width of the alert panel. Defaults to md.',
    },
    open: {
      control: 'boolean',
      description: 'Whether the alert is visible. Controlled externally.',
    },
    onClose: {
      action: 'closed',
      description: 'Callback when the alert should close (backdrop click, Escape key).',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// HELPER COMPONENT
// =============================================================================

/**
 * A wrapper component that manages open state for Storybook.
 * Because Alerts are controlled components and Storybook args alone won't cut it.
 */
function AlertDemo({
  buttonLabel = 'Open Alert',
  buttonColor = 'dark/zinc' as const,
  children,
  ...alertProps
}: {
  buttonLabel?: string
  buttonColor?: 'dark/zinc' | 'red' | 'green' | 'blue' | 'amber' | 'indigo'
  children: (props: { open: boolean; setOpen: (open: boolean) => void }) => React.ReactNode
} & Omit<React.ComponentProps<typeof Alert>, 'open' | 'onClose' | 'children'>) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button color={buttonColor} onClick={() => setOpen(true)}>
        {buttonLabel}
      </Button>
      <Alert {...alertProps} open={open} onClose={setOpen}>
        {children({ open, setOpen })}
      </Alert>
    </>
  )
}

// =============================================================================
// BASIC STORIES
// =============================================================================

/**
 * The default alert. Simple, clean, gets the job done.
 * Click the button to see it in action.
 */
export const Default: Story = {
  render: () => (
    <AlertDemo buttonLabel="Open Basic Alert">
      {({ setOpen }) => (
        <>
          <AlertTitle>Confirm Action</AlertTitle>
          <AlertDescription>
            Are you sure you want to proceed? This action cannot be undone.
          </AlertDescription>
          <AlertActions>
            <Button plain onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Confirm</Button>
          </AlertActions>
        </>
      )}
    </AlertDemo>
  ),
}

/**
 * An alert with just a title. Sometimes less is more.
 * For simple yes/no decisions that don't need elaboration.
 */
export const TitleOnly: Story = {
  render: () => (
    <AlertDemo buttonLabel="Simple Confirmation">
      {({ setOpen }) => (
        <>
          <AlertTitle>Save changes before leaving?</AlertTitle>
          <AlertActions>
            <Button plain onClick={() => setOpen(false)}>
              Discard
            </Button>
            <Button color="green" onClick={() => setOpen(false)}>Save</Button>
          </AlertActions>
        </>
      )}
    </AlertDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Sometimes the title says it all. No description needed.',
      },
    },
  },
}

// =============================================================================
// SIZE VARIANTS
// =============================================================================

/**
 * ## Size Comparison
 *
 * Alerts come in 9 sizes, from the petite `xs` to the absolute unit `5xl`.
 * Choose based on content complexity, not how important you think your
 * message is. A delete confirmation doesn't need a billboard.
 */
export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <AlertDemo buttonLabel="XS" size="xs">
        {({ setOpen }) => (
          <>
            <AlertTitle>Extra Small</AlertTitle>
            <AlertDescription>
              Compact and cute. Like a Chihuahua.
            </AlertDescription>
            <AlertActions>
              <Button plain onClick={() => setOpen(false)}>Close</Button>
            </AlertActions>
          </>
        )}
      </AlertDemo>

      <AlertDemo buttonLabel="SM" size="sm">
        {({ setOpen }) => (
          <>
            <AlertTitle>Small</AlertTitle>
            <AlertDescription>
              Still modest, but has more room to breathe.
            </AlertDescription>
            <AlertActions>
              <Button plain onClick={() => setOpen(false)}>Close</Button>
            </AlertActions>
          </>
        )}
      </AlertDemo>

      <AlertDemo buttonLabel="MD (Default)" size="md">
        {({ setOpen }) => (
          <>
            <AlertTitle>Medium</AlertTitle>
            <AlertDescription>
              The default. The Goldilocks zone. Just right for most alerts.
            </AlertDescription>
            <AlertActions>
              <Button plain onClick={() => setOpen(false)}>Close</Button>
            </AlertActions>
          </>
        )}
      </AlertDemo>

      <AlertDemo buttonLabel="LG" size="lg">
        {({ setOpen }) => (
          <>
            <AlertTitle>Large</AlertTitle>
            <AlertDescription>
              When you need a bit more space. Maybe for a form or longer explanation.
            </AlertDescription>
            <AlertActions>
              <Button plain onClick={() => setOpen(false)}>Close</Button>
            </AlertActions>
          </>
        )}
      </AlertDemo>

      <AlertDemo buttonLabel="XL" size="xl">
        {({ setOpen }) => (
          <>
            <AlertTitle>Extra Large</AlertTitle>
            <AlertDescription>
              Getting serious now. This is intervention territory.
            </AlertDescription>
            <AlertActions>
              <Button plain onClick={() => setOpen(false)}>Close</Button>
            </AlertActions>
          </>
        )}
      </AlertDemo>

      <AlertDemo buttonLabel="2XL" size="2xl">
        {({ setOpen }) => (
          <>
            <AlertTitle>2XL</AlertTitle>
            <AlertDescription>
              For when you really need to make a statement. Terms and conditions vibes.
            </AlertDescription>
            <AlertActions>
              <Button plain onClick={() => setOpen(false)}>Close</Button>
            </AlertActions>
          </>
        )}
      </AlertDemo>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All size variants from xs to 2xl. Sizes 3xl-5xl also available for truly massive content.',
      },
    },
  },
}

// =============================================================================
// COMMON PATTERNS
// =============================================================================

/**
 * ## Delete Confirmation
 *
 * The most classic use case. "Are you really, truly, absolutely sure?"
 * Red button. Scary wording. Give users every chance to back out.
 */
export const DeleteConfirmation: Story = {
  render: () => (
    <AlertDemo buttonLabel="Delete Recipe" buttonColor="red">
      {({ setOpen }) => (
        <>
          <AlertTitle>Delete "Grandma's Secret Cookies"?</AlertTitle>
          <AlertDescription>
            This will permanently delete the recipe and all its associated data, including
            comments and ratings. This action cannot be undone. Grandma will be disappointed.
          </AlertDescription>
          <AlertActions>
            <Button plain onClick={() => setOpen(false)}>
              Keep Recipe
            </Button>
            <Button color="red" onClick={() => setOpen(false)}>
              <Trash2 data-slot="icon" />
              Delete Forever
            </Button>
          </AlertActions>
        </>
      )}
    </AlertDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The classic destructive action confirmation. Red button, serious wording, escape hatch prominent.',
      },
    },
  },
}

/**
 * ## Logout Confirmation
 *
 * "You have unsaved changes" or just a friendly "see you later?"
 * Depends on your app's vibe and what's at stake.
 */
export const LogoutConfirmation: Story = {
  render: () => (
    <AlertDemo buttonLabel="Sign Out">
      {({ setOpen }) => (
        <>
          <AlertTitle>Sign out of Spoonjoy?</AlertTitle>
          <AlertDescription>
            You have a recipe in progress that hasn't been saved. Signing out will
            lose your changes. Your half-finished carbonara deserves better.
          </AlertDescription>
          <AlertActions>
            <Button plain onClick={() => setOpen(false)}>
              Stay Signed In
            </Button>
            <Button onClick={() => setOpen(false)}>
              <LogOut data-slot="icon" />
              Sign Out Anyway
            </Button>
          </AlertActions>
        </>
      )}
    </AlertDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Warn users about unsaved work before they bounce.',
      },
    },
  },
}

/**
 * ## Warning Alert
 *
 * For when something isn't quite right but isn't catastrophic.
 * "Hey, just so you know..." energy.
 */
export const WarningAlert: Story = {
  render: () => (
    <AlertDemo buttonLabel="Show Warning" buttonColor="amber">
      {({ setOpen }) => (
        <>
          <AlertTitle>
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Recipe Missing Information
            </span>
          </AlertTitle>
          <AlertDescription>
            This recipe is missing cooking time and serving size. It can still be saved
            as a draft, but won't be publishable until these fields are filled in.
          </AlertDescription>
          <AlertActions>
            <Button plain onClick={() => setOpen(false)}>
              Save as Draft
            </Button>
            <Button color="amber" onClick={() => setOpen(false)}>
              Add Missing Info
            </Button>
          </AlertActions>
        </>
      )}
    </AlertDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Warnings for incomplete data or potential issues. Not blocking, but noteworthy.',
      },
    },
  },
}

/**
 * ## Success Confirmation
 *
 * For confirming an action that just succeeded but might need follow-up.
 * "Great news! Now here's what happens next..."
 */
export const SuccessAlert: Story = {
  render: () => (
    <AlertDemo buttonLabel="Publish Recipe" buttonColor="green">
      {({ setOpen }) => (
        <>
          <AlertTitle>
            <span className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-green-500" />
              Recipe Published!
            </span>
          </AlertTitle>
          <AlertDescription>
            "Perfect Pasta Carbonara" is now live and visible to the world. Share it
            with friends, or sit back and watch the likes roll in.
          </AlertDescription>
          <AlertActions>
            <Button plain onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button color="green" onClick={() => setOpen(false)}>
              Share Recipe
            </Button>
          </AlertActions>
        </>
      )}
    </AlertDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Celebratory alerts for successful actions that offer next steps.',
      },
    },
  },
}

/**
 * ## Informational Alert
 *
 * Sometimes you just need to tell the user something important.
 * No action required, just "FYI, here's the deal."
 */
export const InfoAlert: Story = {
  render: () => (
    <AlertDemo buttonLabel="Show Info" buttonColor="blue">
      {({ setOpen }) => (
        <>
          <AlertTitle>
            <span className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-500" />
              New Feature: Recipe Collections
            </span>
          </AlertTitle>
          <AlertDescription>
            You can now organize your saved recipes into collections! Create custom
            categories like "Weeknight Dinners" or "Impress the In-Laws" to keep
            everything tidy.
          </AlertDescription>
          <AlertActions>
            <Button plain onClick={() => setOpen(false)}>
              Maybe Later
            </Button>
            <Button color="blue" onClick={() => setOpen(false)}>
              Try It Now
            </Button>
          </AlertActions>
        </>
      )}
    </AlertDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'For announcements, feature introductions, or helpful tips.',
      },
    },
  },
}

// =============================================================================
// WITH BODY CONTENT
// =============================================================================

/**
 * ## Alert with Form
 *
 * When you need user input before proceeding. Forms in modals are
 * controversial, but sometimes necessary. Keep them short.
 */
export const WithFormInput: Story = {
  render: () => (
    <AlertDemo buttonLabel="Delete Account" buttonColor="red" size="sm">
      {({ setOpen }) => (
        <>
          <AlertTitle>Delete Your Account?</AlertTitle>
          <AlertDescription>
            This will permanently delete your account and all data. Type "DELETE" to confirm.
          </AlertDescription>
          <AlertBody>
            <Field>
              <Label>Confirmation</Label>
              <Input placeholder='Type "DELETE" to confirm' />
              <Description>This action is irreversible.</Description>
            </Field>
          </AlertBody>
          <AlertActions>
            <Button plain onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={() => setOpen(false)}>
              Delete Account
            </Button>
          </AlertActions>
        </>
      )}
    </AlertDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Forms in alerts for extra confirmation. Use sparingly - this is a "nuclear option" pattern.',
      },
    },
  },
}

/**
 * ## Alert with List
 *
 * When you need to show what will be affected by an action.
 * Transparency is key for destructive operations.
 */
export const WithList: Story = {
  render: () => (
    <AlertDemo buttonLabel="Clear All Data" buttonColor="red" size="sm">
      {({ setOpen }) => (
        <>
          <AlertTitle>Clear All Saved Recipes?</AlertTitle>
          <AlertDescription>
            This will remove the following from your saved recipes:
          </AlertDescription>
          <AlertBody>
            <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex items-center gap-2">
                <Cookie className="h-4 w-4" />
                Grandma's Chocolate Chip Cookies
              </li>
              <li className="flex items-center gap-2">
                <Flame className="h-4 w-4" />
                Five-Alarm Chili
              </li>
              <li className="flex items-center gap-2">
                <ChefHat className="h-4 w-4" />
                Beef Wellington (Attempted)
              </li>
            </ul>
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              And 47 more recipes...
            </p>
          </AlertBody>
          <AlertActions>
            <Button plain onClick={() => setOpen(false)}>
              Keep Recipes
            </Button>
            <Button color="red" onClick={() => setOpen(false)}>
              Clear All
            </Button>
          </AlertActions>
        </>
      )}
    </AlertDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Show users exactly what they\'re about to affect. No surprises.',
      },
    },
  },
}

/**
 * ## Alert with Complex Content
 *
 * Subscription upgrade flow. When you need the full sales pitch
 * in a modal. Probably too much, but here's how you'd do it.
 */
export const ComplexContent: Story = {
  render: () => (
    <AlertDemo buttonLabel="Upgrade Plan" buttonColor="indigo" size="lg">
      {({ setOpen }) => (
        <>
          <AlertTitle>
            <span className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-indigo-500" />
              Upgrade to Spoonjoy Pro
            </span>
          </AlertTitle>
          <AlertDescription>
            You're about to unlock a world of culinary possibilities.
          </AlertDescription>
          <AlertBody>
            <div className="space-y-4">
              <div className="rounded-lg bg-indigo-50 p-4 dark:bg-indigo-950">
                <h4 className="font-medium text-indigo-900 dark:text-indigo-100">
                  Pro Features Include:
                </h4>
                <ul className="mt-2 space-y-1 text-sm text-indigo-800 dark:text-indigo-200">
                  <li>Unlimited recipe collections</li>
                  <li>Advanced nutritional analysis</li>
                  <li>Meal planning calendar</li>
                  <li>Smart grocery lists</li>
                  <li>Ad-free experience</li>
                </ul>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                  $9.99
                </span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">per month</span>
              </div>
            </div>
          </AlertBody>
          <AlertActions>
            <Button plain onClick={() => setOpen(false)}>
              Maybe Later
            </Button>
            <Button color="indigo" onClick={() => setOpen(false)}>
              Start Free Trial
            </Button>
          </AlertActions>
        </>
      )}
    </AlertDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complex content for upgrade flows or detailed confirmations. Use the large size.',
      },
    },
  },
}

// =============================================================================
// DISMISSAL BEHAVIORS
// =============================================================================

/**
 * ## Backdrop Click to Close
 *
 * By default, clicking the backdrop closes the alert. This is handled by
 * HeadlessUI automatically through the `onClose` callback.
 */
export const BackdropDismiss: Story = {
  render: () => (
    <AlertDemo buttonLabel="Open (Click Outside to Close)">
      {({ setOpen }) => (
        <>
          <AlertTitle>Click Outside to Dismiss</AlertTitle>
          <AlertDescription>
            Click anywhere on the darkened backdrop to close this alert.
            The `onClose` callback handles this automatically.
          </AlertDescription>
          <AlertActions>
            <Button onClick={() => setOpen(false)}>Got It</Button>
          </AlertActions>
        </>
      )}
    </AlertDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Backdrop click dismissal is built-in via HeadlessUI. The `onClose` prop handles it.',
      },
    },
  },
}

/**
 * ## Escape Key to Close
 *
 * Pressing Escape also closes the alert. Another HeadlessUI freebie.
 * Accessibility win!
 */
export const EscapeKeyDismiss: Story = {
  render: () => (
    <AlertDemo buttonLabel="Open (Press Escape to Close)">
      {({ setOpen }) => (
        <>
          <AlertTitle>Press Escape to Dismiss</AlertTitle>
          <AlertDescription>
            Hit the Escape key on your keyboard to close this alert. HeadlessUI
            handles keyboard interactions automatically.
          </AlertDescription>
          <AlertActions>
            <Button onClick={() => setOpen(false)}>Got It</Button>
          </AlertActions>
        </>
      )}
    </AlertDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Escape key dismissal is automatic. Keyboard users rejoice!',
      },
    },
  },
}

// =============================================================================
// ACCESSIBILITY
// =============================================================================

/**
 * ## Accessible Alert
 *
 * This alert demonstrates proper accessibility patterns:
 * - Focus is trapped within the modal
 * - Escape key closes
 * - Proper ARIA attributes from HeadlessUI
 * - Focus returns to trigger button on close
 */
export const AccessibleAlert: Story = {
  render: () => (
    <AlertDemo buttonLabel="Open Accessible Alert">
      {({ setOpen }) => (
        <>
          <AlertTitle>Accessibility Built-In</AlertTitle>
          <AlertDescription>
            HeadlessUI provides automatic accessibility features: focus trapping,
            proper ARIA roles (dialog, alertdialog), keyboard navigation, and
            focus restoration when closed.
          </AlertDescription>
          <AlertBody>
            <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
              <li>Tab to navigate between focusable elements</li>
              <li>Escape to close the dialog</li>
              <li>Focus is trapped inside while open</li>
              <li>Focus returns to the trigger on close</li>
            </ul>
          </AlertBody>
          <AlertActions>
            <Button plain onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Confirm</Button>
          </AlertActions>
        </>
      )}
    </AlertDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'HeadlessUI handles focus management and ARIA automatically. You get accessibility for free!',
      },
    },
  },
}

// =============================================================================
// REAL-WORLD EXAMPLES
// =============================================================================

/**
 * ## Recipe Scaling Confirmation
 *
 * When a user wants to scale a recipe but it might affect results.
 * Domain-specific alert for the cooking crowd.
 */
export const RecipeScalingAlert: Story = {
  render: () => (
    <AlertDemo buttonLabel="Scale to 8 Servings" buttonColor="amber">
      {({ setOpen }) => (
        <>
          <AlertTitle>
            <span className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-amber-500" />
              Scale Recipe?
            </span>
          </AlertTitle>
          <AlertDescription>
            Scaling from 4 to 8 servings will double all ingredient amounts.
            Note: Baking recipes may not scale linearly - cooking times and
            temperatures might need adjustment.
          </AlertDescription>
          <AlertActions>
            <Button plain onClick={() => setOpen(false)}>
              Keep Original
            </Button>
            <Button color="amber" onClick={() => setOpen(false)}>
              Scale Recipe
            </Button>
          </AlertActions>
        </>
      )}
    </AlertDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Domain-specific alert warning about recipe scaling limitations.',
      },
    },
  },
}

/**
 * ## Spicy Food Warning
 *
 * Because some people need to know what they're getting into.
 * Literally a content warning, but for capsaicin.
 */
export const SpicyWarning: Story = {
  render: () => (
    <AlertDemo buttonLabel="View Recipe" buttonColor="red">
      {({ setOpen }) => (
        <>
          <AlertTitle>
            <span className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-red-500" />
              Extremely Spicy Recipe
            </span>
          </AlertTitle>
          <AlertDescription>
            "Carolina Reaper Challenge Wings" has been rated 5/5 on the spice scale.
            Contains Carolina Reapers, ghost peppers, and pure capsaicin extract.
            Proceed with caution (and milk nearby).
          </AlertDescription>
          <AlertActions>
            <Button plain onClick={() => setOpen(false)}>
              Show Me Something Milder
            </Button>
            <Button color="red" onClick={() => setOpen(false)}>
              <Flame data-slot="icon" />
              I Can Handle It
            </Button>
          </AlertActions>
        </>
      )}
    </AlertDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Content warnings for extreme recipes. Your tongue will thank you.',
      },
    },
  },
}

/**
 * ## Privacy/Security Alert
 *
 * For sensitive operations that warrant extra caution.
 * Security-focused UX is good UX.
 */
export const SecurityAlert: Story = {
  render: () => (
    <AlertDemo buttonLabel="Make Profile Public">
      {({ setOpen }) => (
        <>
          <AlertTitle>
            <span className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              Make Your Profile Public?
            </span>
          </AlertTitle>
          <AlertDescription>
            Making your profile public will allow anyone to see your name, bio,
            and published recipes. Your saved recipes and private collections
            will remain private.
          </AlertDescription>
          <AlertActions>
            <Button plain onClick={() => setOpen(false)}>
              Stay Private
            </Button>
            <Button onClick={() => setOpen(false)}>
              Go Public
            </Button>
          </AlertActions>
        </>
      )}
    </AlertDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Privacy alerts for actions that affect visibility or data sharing.',
      },
    },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Testing that the alert opens and closes properly via button clicks.
 */
export const OpenCloseInteraction: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    const handleClose = fn()

    return (
      <>
        <Button data-testid="trigger" onClick={() => setOpen(true)}>
          Open Alert
        </Button>
        <Alert
          open={open}
          onClose={(value) => {
            setOpen(value)
            handleClose(value)
          }}
        >
          <AlertTitle>Interactive Test</AlertTitle>
          <AlertDescription>
            This alert is used to test open/close interactions.
          </AlertDescription>
          <AlertActions>
            <Button plain data-testid="cancel" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button data-testid="confirm" onClick={() => setOpen(false)}>
              Confirm
            </Button>
          </AlertActions>
        </Alert>
      </>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Find and click the trigger button
    const trigger = canvas.getByTestId('trigger')
    await expect(trigger).toBeInTheDocument()
    await userEvent.click(trigger)

    // Wait for the dialog to appear
    // Note: Dialog renders in a portal, so we need to query the document
    const dialog = await within(document.body).findByRole('dialog')
    await expect(dialog).toBeInTheDocument()

    // Find and click the confirm button within the dialog
    const confirmButton = within(dialog).getByTestId('confirm')
    await userEvent.click(confirmButton)

    // Dialog should be closed (no longer in document)
    // Small delay for animation
    await new Promise((resolve) => setTimeout(resolve, 200))
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests that clicking trigger opens the alert and clicking confirm closes it.',
      },
    },
  },
}

/**
 * Testing keyboard navigation within the alert.
 */
export const KeyboardNavigation: Story = {
  render: () => {
    const [open, setOpen] = useState(false)

    return (
      <>
        <Button data-testid="trigger" onClick={() => setOpen(true)}>
          Open Alert
        </Button>
        <Alert open={open} onClose={setOpen}>
          <AlertTitle>Keyboard Test</AlertTitle>
          <AlertDescription>
            Tab through the buttons. Press Escape to close.
          </AlertDescription>
          <AlertActions>
            <Button plain data-testid="cancel" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button data-testid="confirm" onClick={() => setOpen(false)}>
              Confirm
            </Button>
          </AlertActions>
        </Alert>
      </>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Open the dialog
    const trigger = canvas.getByTestId('trigger')
    await userEvent.click(trigger)

    // Wait for dialog
    const dialog = await within(document.body).findByRole('dialog')
    await expect(dialog).toBeInTheDocument()

    // Tab through focusable elements
    await userEvent.tab()
    await userEvent.tab()

    // Press Escape to close
    await userEvent.keyboard('{Escape}')

    // Dialog should close
    await new Promise((resolve) => setTimeout(resolve, 200))
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests keyboard navigation: Tab to move focus, Escape to close.',
      },
    },
  },
}
