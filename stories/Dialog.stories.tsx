import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { useState } from 'react'
import {
  Settings,
  ChefHat,
  Users,
  Mail,
  Lock,
  CreditCard,
  FileEdit,
  Share2,
  X,
} from 'lucide-react'
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from '../app/components/ui/dialog'
import { Button } from '../app/components/ui/button'
import { Input } from '../app/components/ui/input'
import { Textarea } from '../app/components/ui/textarea'
import { Field, Label, Description } from '../app/components/ui/fieldset'
import { Select } from '../app/components/ui/select'
import { Checkbox, CheckboxField } from '../app/components/ui/checkbox'

/**
 * # Dialog
 *
 * The Dialog component. Not to be confused with your inner monologue or that
 * imaginary argument you keep rehearsing in the shower. This is a *modal* dialog,
 * the kind that politely demands attention and won't let you click anywhere else
 * until you've dealt with it.
 *
 * Think of dialogs as the velvet rope of UI. They section off a portion of the
 * interface and say "excuse me, we need to talk about something before you go
 * wandering off."
 *
 * ## Dialog vs Alert: The Eternal Debate
 *
 * - **Alert** is for quick confirmations and warnings. "Are you sure?" energy.
 * - **Dialog** is for actual tasks and forms. "Let's sit down and do this" energy.
 *
 * Use Alert when you need a yes/no answer. Use Dialog when you need actual input
 * or want to present complex content without leaving the page.
 *
 * ## When to Use Dialogs
 *
 * - **Forms that don't need their own page** - Edit profile, quick settings
 * - **Multi-step wizards** - One step at a time, wizard
 * - **Preview content** - "Here's what that looks like"
 * - **Focused tasks** - When context-switching would be jarring
 *
 * ## When NOT to Use Dialogs
 *
 * - Simple confirmations (use Alert)
 * - Showing a ton of content (just use a page)
 * - Anything that requires leaving the dialog to complete (awkward)
 * - Mobile users who will curse your name (test on mobile!)
 *
 * ## Anatomy of a Dialog
 *
 * - **Dialog** - The modal container. Backdrop, positioning, transitions
 * - **DialogTitle** - The headline. Make it descriptive
 * - **DialogDescription** - Optional context. Keep it short
 * - **DialogBody** - The main content area. Forms, lists, whatever you need
 * - **DialogActions** - Footer buttons. Cancel on left, primary on right
 *
 * ## Size Variants
 *
 * From `xs` (tight squeeze) to `5xl` (are you sure this isn't a page?).
 * The default is `lg`, which works for most things. Choose based on content,
 * not importance.
 */
const meta: Meta<typeof Dialog> = {
  title: 'UI/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A modal dialog component for forms, complex interactions, and focused tasks.

Built on HeadlessUI with smooth transitions, backdrop blur, focus trapping,
and support for titles, descriptions, custom body content, and action buttons.

Unlike Alert (for quick confirmations), Dialog is for tasks that require actual input or complex content.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'],
      description: 'Maximum width of the dialog panel. Defaults to lg.',
    },
    open: {
      control: 'boolean',
      description: 'Whether the dialog is visible. Controlled externally.',
    },
    onClose: {
      action: 'closed',
      description: 'Callback when the dialog should close (backdrop click, Escape key).',
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
 * Because Dialogs are controlled components and Storybook args won't cut it.
 */
function DialogDemo({
  buttonLabel = 'Open Dialog',
  buttonColor = 'dark/zinc' as const,
  children,
  ...dialogProps
}: {
  buttonLabel?: string
  buttonColor?: 'dark/zinc' | 'red' | 'green' | 'blue' | 'amber' | 'indigo' | 'violet'
  children: (props: { open: boolean; setOpen: (open: boolean) => void }) => React.ReactNode
} & Omit<React.ComponentProps<typeof Dialog>, 'open' | 'onClose' | 'children'>) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button color={buttonColor} onClick={() => setOpen(true)}>
        {buttonLabel}
      </Button>
      <Dialog {...dialogProps} open={open} onClose={setOpen}>
        {children({ open, setOpen })}
      </Dialog>
    </>
  )
}

// =============================================================================
// BASIC STORIES
// =============================================================================

/**
 * The default dialog. Clean, focused, ready for action.
 * Click the button to see it slide into view.
 */
export const Default: Story = {
  render: () => (
    <DialogDemo buttonLabel="Open Basic Dialog">
      {({ setOpen }) => (
        <>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>
            This is a basic dialog with a title, description, and action buttons.
            Use it for focused tasks that don't require a full page.
          </DialogDescription>
          <DialogActions>
            <Button plain onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Continue</Button>
          </DialogActions>
        </>
      )}
    </DialogDemo>
  ),
}

/**
 * A dialog with body content. When you need more than just text,
 * DialogBody gives you a structured container for forms, lists,
 * or whatever else you're cooking up.
 */
export const WithBody: Story = {
  render: () => (
    <DialogDemo buttonLabel="Open Dialog with Body">
      {({ setOpen }) => (
        <>
          <DialogTitle>Recipe Settings</DialogTitle>
          <DialogDescription>
            Customize how this recipe is displayed and shared.
          </DialogDescription>
          <DialogBody>
            <div className="space-y-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Body content goes here. You can put anything you want - forms,
                lists, images, or that novel you've been meaning to write.
              </p>
              <ul className="text-sm text-zinc-600 dark:text-zinc-400 list-disc pl-5 space-y-1">
                <li>Feature one</li>
                <li>Feature two</li>
                <li>The third and final feature</li>
              </ul>
            </div>
          </DialogBody>
          <DialogActions>
            <Button plain onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button onClick={() => setOpen(false)}>Save</Button>
          </DialogActions>
        </>
      )}
    </DialogDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'DialogBody provides a container for custom content between the description and actions.',
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
 * Dialogs come in 9 sizes, from the compact `xs` to the room-filling `5xl`.
 * Choose based on your content, not on how much attention you think you deserve.
 *
 * Generally:
 * - `xs`-`sm`: Simple forms, quick actions
 * - `md`-`lg`: Standard dialogs, most use cases
 * - `xl`-`5xl`: Complex forms, multi-column layouts
 */
export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <DialogDemo buttonLabel="XS" size="xs">
        {({ setOpen }) => (
          <>
            <DialogTitle>Extra Small</DialogTitle>
            <DialogDescription>
              Cozy. Like a studio apartment for dialogs.
            </DialogDescription>
            <DialogActions>
              <Button plain onClick={() => setOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </DialogDemo>

      <DialogDemo buttonLabel="SM" size="sm">
        {({ setOpen }) => (
          <>
            <DialogTitle>Small</DialogTitle>
            <DialogDescription>
              A bit more breathing room. Still intimate.
            </DialogDescription>
            <DialogActions>
              <Button plain onClick={() => setOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </DialogDemo>

      <DialogDemo buttonLabel="MD" size="md">
        {({ setOpen }) => (
          <>
            <DialogTitle>Medium</DialogTitle>
            <DialogDescription>
              The Goldilocks zone. Not too big, not too small.
            </DialogDescription>
            <DialogActions>
              <Button plain onClick={() => setOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </DialogDemo>

      <DialogDemo buttonLabel="LG (Default)" size="lg">
        {({ setOpen }) => (
          <>
            <DialogTitle>Large</DialogTitle>
            <DialogDescription>
              The default. Room for forms, explanations, and the occasional tangent.
            </DialogDescription>
            <DialogActions>
              <Button plain onClick={() => setOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </DialogDemo>

      <DialogDemo buttonLabel="XL" size="xl">
        {({ setOpen }) => (
          <>
            <DialogTitle>Extra Large</DialogTitle>
            <DialogDescription>
              Getting serious now. Complex forms territory.
            </DialogDescription>
            <DialogActions>
              <Button plain onClick={() => setOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </DialogDemo>

      <DialogDemo buttonLabel="2XL" size="2xl">
        {({ setOpen }) => (
          <>
            <DialogTitle>2XL</DialogTitle>
            <DialogDescription>
              For when you really need to spread out. Multi-column layouts welcome.
            </DialogDescription>
            <DialogActions>
              <Button plain onClick={() => setOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </DialogDemo>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Size variants from xs to 2xl. Sizes 3xl-5xl also available for truly expansive content.',
      },
    },
  },
}

// =============================================================================
// WITH FORM CONTENT
// =============================================================================

/**
 * ## Simple Form
 *
 * The classic use case: a form in a dialog. Edit profile, change settings,
 * collect info. Keep forms short - if you need a scroll bar, consider a page.
 */
export const SimpleForm: Story = {
  render: () => (
    <DialogDemo buttonLabel="Edit Profile" buttonColor="indigo" size="sm">
      {({ setOpen }) => (
        <>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your display name and bio. Your email can't be changed here.
          </DialogDescription>
          <DialogBody>
            <div className="space-y-4">
              <Field>
                <Label>Display Name</Label>
                <Input defaultValue="Chef Extraordinaire" />
              </Field>
              <Field>
                <Label>Bio</Label>
                <Textarea
                  defaultValue="I make food. Sometimes it's even edible."
                  rows={3}
                />
                <Description>Keep it under 160 characters for best results.</Description>
              </Field>
            </div>
          </DialogBody>
          <DialogActions>
            <Button plain onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button color="indigo" onClick={() => setOpen(false)}>
              Save Changes
            </Button>
          </DialogActions>
        </>
      )}
    </DialogDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A simple profile edit form. Short, sweet, and to the point.',
      },
    },
  },
}

/**
 * ## Login Form
 *
 * Forms in dialogs are great for authentication flows that don't need
 * a full page redirect. Keep the user in context while they sign in.
 */
export const LoginForm: Story = {
  render: () => (
    <DialogDemo buttonLabel="Sign In" buttonColor="blue" size="sm">
      {({ setOpen }) => (
        <>
          <DialogTitle>Welcome Back</DialogTitle>
          <DialogDescription>
            Sign in to access your recipes, collections, and meal plans.
          </DialogDescription>
          <DialogBody>
            <div className="space-y-4">
              <Field>
                <Label>Email</Label>
                <Input type="email" placeholder="chef@example.com" />
              </Field>
              <Field>
                <Label>Password</Label>
                <Input type="password" placeholder="••••••••" />
              </Field>
              <div className="flex items-center justify-between">
                <CheckboxField>
                  <Checkbox name="remember" />
                  <Label>Remember me</Label>
                </CheckboxField>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  Forgot password?
                </button>
              </div>
            </div>
          </DialogBody>
          <DialogActions>
            <Button plain onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button color="blue" onClick={() => setOpen(false)}>
              <Lock data-slot="icon" />
              Sign In
            </Button>
          </DialogActions>
        </>
      )}
    </DialogDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'An in-context login form. No page redirect needed.',
      },
    },
  },
}

/**
 * ## Complex Form
 *
 * Multi-section forms with validation, hints, and structure.
 * When your form gets this complex, make sure you really need a dialog.
 */
export const ComplexForm: Story = {
  render: () => (
    <DialogDemo buttonLabel="Create Recipe" buttonColor="green" size="xl">
      {({ setOpen }) => (
        <>
          <DialogTitle>
            <span className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-green-500" />
              New Recipe
            </span>
          </DialogTitle>
          <DialogDescription>
            Fill in the basics to get started. You can add ingredients and steps later.
          </DialogDescription>
          <DialogBody>
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field className="sm:col-span-2">
                  <Label>Recipe Title</Label>
                  <Input placeholder="e.g., Grandma's Famous Cookies" />
                </Field>
                <Field>
                  <Label>Category</Label>
                  <Select defaultValue="">
                    <option value="" disabled>Select a category</option>
                    <option value="appetizer">Appetizer</option>
                    <option value="main">Main Course</option>
                    <option value="dessert">Dessert</option>
                    <option value="beverage">Beverage</option>
                  </Select>
                </Field>
                <Field>
                  <Label>Servings</Label>
                  <Input type="number" placeholder="4" min={1} />
                </Field>
                <Field>
                  <Label>Prep Time (minutes)</Label>
                  <Input type="number" placeholder="15" min={0} />
                </Field>
                <Field>
                  <Label>Cook Time (minutes)</Label>
                  <Input type="number" placeholder="30" min={0} />
                </Field>
              </div>
              <Field>
                <Label>Description</Label>
                <Textarea
                  placeholder="A brief description of your dish..."
                  rows={3}
                />
                <Description>
                  Tell people what makes this recipe special.
                </Description>
              </Field>
            </div>
          </DialogBody>
          <DialogActions>
            <Button plain onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button color="green" onClick={() => setOpen(false)}>
              Create Recipe
            </Button>
          </DialogActions>
        </>
      )}
    </DialogDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A multi-field form with grid layout. Use larger dialog sizes for complex forms.',
      },
    },
  },
}

/**
 * ## Settings Form
 *
 * Account or app settings in a quick-access dialog.
 * Perfect for things that don't need their own page.
 */
export const SettingsForm: Story = {
  render: () => (
    <DialogDemo buttonLabel="Settings" buttonColor="dark/zinc" size="md">
      {({ setOpen }) => (
        <>
          <DialogTitle>
            <span className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Notification Settings
            </span>
          </DialogTitle>
          <DialogDescription>
            Choose how and when we bother you about things.
          </DialogDescription>
          <DialogBody>
            <div className="space-y-4">
              <CheckboxField>
                <Checkbox name="email" defaultChecked />
                <Label>Email notifications</Label>
                <Description>Get notified when someone comments on your recipes.</Description>
              </CheckboxField>
              <CheckboxField>
                <Checkbox name="weekly" defaultChecked />
                <Label>Weekly digest</Label>
                <Description>A summary of activity on your recipes, sent every Sunday.</Description>
              </CheckboxField>
              <CheckboxField>
                <Checkbox name="marketing" />
                <Label>Marketing emails</Label>
                <Description>Tips, new features, and the occasional dad joke.</Description>
              </CheckboxField>
              <CheckboxField>
                <Checkbox name="push" />
                <Label>Push notifications</Label>
                <Description>Get alerts on your device. Use responsibly.</Description>
              </CheckboxField>
            </div>
          </DialogBody>
          <DialogActions>
            <Button plain onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Save Preferences</Button>
          </DialogActions>
        </>
      )}
    </DialogDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Settings dialogs with checkboxes. Quick access to preferences without a page navigation.',
      },
    },
  },
}

// =============================================================================
// REAL-WORLD EXAMPLES
// =============================================================================

/**
 * ## Share Recipe
 *
 * A common pattern: sharing content with others.
 * Includes form for recipient and optional message.
 */
export const ShareRecipe: Story = {
  render: () => (
    <DialogDemo buttonLabel="Share Recipe" buttonColor="blue" size="sm">
      {({ setOpen }) => (
        <>
          <DialogTitle>
            <span className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-blue-500" />
              Share Recipe
            </span>
          </DialogTitle>
          <DialogDescription>
            Send "Perfect Pasta Carbonara" to a friend via email.
          </DialogDescription>
          <DialogBody>
            <div className="space-y-4">
              <Field>
                <Label>Recipient's Email</Label>
                <Input type="email" placeholder="friend@example.com" />
              </Field>
              <Field>
                <Label>Message (optional)</Label>
                <Textarea
                  placeholder="You have to try this recipe!"
                  rows={3}
                />
              </Field>
            </div>
          </DialogBody>
          <DialogActions>
            <Button plain onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button color="blue" onClick={() => setOpen(false)}>
              <Mail data-slot="icon" />
              Send
            </Button>
          </DialogActions>
        </>
      )}
    </DialogDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Sharing content via email. Form in dialog keeps user in context.',
      },
    },
  },
}

/**
 * ## Invite Team Member
 *
 * Collaborative features like inviting users to shared spaces.
 */
export const InviteTeamMember: Story = {
  render: () => (
    <DialogDemo buttonLabel="Invite Member" buttonColor="violet" size="sm">
      {({ setOpen }) => (
        <>
          <DialogTitle>
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5 text-violet-500" />
              Invite to Kitchen
            </span>
          </DialogTitle>
          <DialogDescription>
            Add a collaborator to "Family Recipes" cookbook.
          </DialogDescription>
          <DialogBody>
            <div className="space-y-4">
              <Field>
                <Label>Email Address</Label>
                <Input type="email" placeholder="collaborator@example.com" />
              </Field>
              <Field>
                <Label>Role</Label>
                <Select defaultValue="editor">
                  <option value="viewer">Viewer - Can view recipes</option>
                  <option value="editor">Editor - Can add and edit recipes</option>
                  <option value="admin">Admin - Full access</option>
                </Select>
                <Description>
                  Editors can add and modify recipes. Admins can manage members.
                </Description>
              </Field>
            </div>
          </DialogBody>
          <DialogActions>
            <Button plain onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button color="violet" onClick={() => setOpen(false)}>
              Send Invitation
            </Button>
          </DialogActions>
        </>
      )}
    </DialogDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Team/collaboration invitation flow with role selection.',
      },
    },
  },
}

/**
 * ## Payment Details
 *
 * Collecting sensitive information requires trust.
 * Dialogs can feel more secure than full page redirects for quick updates.
 */
export const PaymentForm: Story = {
  render: () => (
    <DialogDemo buttonLabel="Update Payment" buttonColor="green" size="md">
      {({ setOpen }) => (
        <>
          <DialogTitle>
            <span className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-500" />
              Update Payment Method
            </span>
          </DialogTitle>
          <DialogDescription>
            Your card ending in 4242 will be replaced.
          </DialogDescription>
          <DialogBody>
            <div className="space-y-4">
              <Field>
                <Label>Cardholder Name</Label>
                <Input placeholder="Name on card" />
              </Field>
              <Field>
                <Label>Card Number</Label>
                <Input placeholder="1234 5678 9012 3456" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <Label>Expiry Date</Label>
                  <Input placeholder="MM/YY" />
                </Field>
                <Field>
                  <Label>CVC</Label>
                  <Input placeholder="123" />
                </Field>
              </div>
            </div>
          </DialogBody>
          <DialogActions>
            <Button plain onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button color="green" onClick={() => setOpen(false)}>
              Update Card
            </Button>
          </DialogActions>
        </>
      )}
    </DialogDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Payment form in a dialog. Feels secure and focused.',
      },
    },
  },
}

/**
 * ## Quick Edit
 *
 * Inline editing via dialog. Click an item, make a quick change,
 * get back to what you were doing. No page navigation needed.
 */
export const QuickEdit: Story = {
  render: () => (
    <DialogDemo buttonLabel="Edit Note" buttonColor="amber" size="sm">
      {({ setOpen }) => (
        <>
          <DialogTitle>
            <span className="flex items-center gap-2">
              <FileEdit className="h-5 w-5 text-amber-500" />
              Edit Recipe Note
            </span>
          </DialogTitle>
          <DialogBody>
            <Field>
              <Label>Note</Label>
              <Textarea
                defaultValue="Use extra virgin olive oil for best results. Regular olive oil works too, but the flavor won't be as rich."
                rows={4}
              />
              <Description>
                Notes are visible only to you.
              </Description>
            </Field>
          </DialogBody>
          <DialogActions>
            <Button plain onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button color="amber" onClick={() => setOpen(false)}>
              Save Note
            </Button>
          </DialogActions>
        </>
      )}
    </DialogDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Quick inline edits without leaving the current page.',
      },
    },
  },
}

// =============================================================================
// OPEN/CLOSE STATES
// =============================================================================

/**
 * ## Controlled State
 *
 * Dialogs are controlled components - you manage the open state.
 * This story demonstrates the closed state (just the trigger button).
 */
export const ClosedState: Story = {
  render: () => (
    <div className="text-center">
      <p className="text-sm text-zinc-500 mb-4 dark:text-zinc-400">
        The dialog is currently closed. Click the button to open it.
      </p>
      <DialogDemo buttonLabel="Open Dialog">
        {({ setOpen }) => (
          <>
            <DialogTitle>You opened the dialog!</DialogTitle>
            <DialogDescription>
              The dialog was closed, now it's open. Magic.
            </DialogDescription>
            <DialogActions>
              <Button onClick={() => setOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </DialogDemo>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The default closed state shows only the trigger. Dialog appears on click.',
      },
    },
  },
}

/**
 * ## Open State Demo
 *
 * This story shows a dialog that starts in the open state.
 * Useful for development and testing.
 */
export const OpenState: Story = {
  render: () => {
    const [open, setOpen] = useState(true)

    return (
      <>
        <Button onClick={() => setOpen(true)}>
          Reopen Dialog
        </Button>
        <Dialog open={open} onClose={setOpen}>
          <DialogTitle>This dialog starts open</DialogTitle>
          <DialogDescription>
            For testing or when you need to show a dialog immediately on page load.
          </DialogDescription>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'A dialog that renders in the open state. The button reopens it after closing.',
      },
    },
  },
}

// =============================================================================
// DISMISSAL BEHAVIORS
// =============================================================================

/**
 * ## Backdrop Click Dismissal
 *
 * Click the dark backdrop to close the dialog.
 * This is the default behavior from HeadlessUI.
 */
export const BackdropDismiss: Story = {
  render: () => (
    <DialogDemo buttonLabel="Open (Click Backdrop to Close)">
      {({ setOpen }) => (
        <>
          <DialogTitle>Click Outside to Close</DialogTitle>
          <DialogDescription>
            Click anywhere on the dark backdrop surrounding this dialog to dismiss it.
            HeadlessUI handles this automatically through the onClose callback.
          </DialogDescription>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Got It</Button>
          </DialogActions>
        </>
      )}
    </DialogDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Backdrop click dismissal is built-in. Click the dark overlay to close.',
      },
    },
  },
}

/**
 * ## Escape Key Dismissal
 *
 * Press Escape to close the dialog.
 * Another HeadlessUI accessibility freebie.
 */
export const EscapeKeyDismiss: Story = {
  render: () => (
    <DialogDemo buttonLabel="Open (Press Escape to Close)">
      {({ setOpen }) => (
        <>
          <DialogTitle>Press Escape to Close</DialogTitle>
          <DialogDescription>
            Hit the Escape key on your keyboard to dismiss this dialog.
            Keyboard accessibility comes standard with HeadlessUI.
          </DialogDescription>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Got It</Button>
          </DialogActions>
        </>
      )}
    </DialogDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Escape key dismissal is automatic. Keyboard users will thank you.',
      },
    },
  },
}

/**
 * ## With Close Button
 *
 * Some dialogs benefit from an explicit close button in the corner.
 * This pattern is common for larger dialogs or those without footer actions.
 */
export const WithCloseButton: Story = {
  render: () => (
    <DialogDemo buttonLabel="Open Dialog with Close Button" size="md">
      {({ setOpen }) => (
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-0 top-0 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
          <DialogTitle>Dialog with Close Button</DialogTitle>
          <DialogDescription>
            The X button in the corner provides an explicit close action.
            Useful for dialogs that might not have footer buttons.
          </DialogDescription>
          <DialogBody>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              You can close this dialog by:
            </p>
            <ul className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 list-disc pl-5">
              <li>Clicking the X button</li>
              <li>Clicking the backdrop</li>
              <li>Pressing Escape</li>
              <li>Clicking the Close button below</li>
            </ul>
          </DialogBody>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </DialogActions>
        </div>
      )}
    </DialogDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'An explicit close button for those who prefer clicking an X.',
      },
    },
  },
}

// =============================================================================
// ACCESSIBILITY
// =============================================================================

/**
 * ## Focus Trap Demo
 *
 * When a dialog opens, focus is trapped within it. Tab cycles through
 * focusable elements without escaping to the page behind. This is
 * critical for accessibility - keyboard users shouldn't get lost.
 */
export const FocusTrap: Story = {
  render: () => (
    <DialogDemo buttonLabel="Open Focus Trap Demo" size="sm">
      {({ setOpen }) => (
        <>
          <DialogTitle>Focus is Trapped Here</DialogTitle>
          <DialogDescription>
            Try pressing Tab repeatedly. Focus cycles through the form fields
            and buttons without escaping to the page behind.
          </DialogDescription>
          <DialogBody>
            <div className="space-y-4">
              <Field>
                <Label>First Field</Label>
                <Input placeholder="Tab here first" />
              </Field>
              <Field>
                <Label>Second Field</Label>
                <Input placeholder="Then here" />
              </Field>
              <Field>
                <Label>Third Field</Label>
                <Input placeholder="And here" />
              </Field>
            </div>
          </DialogBody>
          <DialogActions>
            <Button plain onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>
              Save
            </Button>
          </DialogActions>
        </>
      )}
    </DialogDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Focus is automatically trapped within the dialog. Tab cycles through focusable elements.',
      },
    },
  },
}

/**
 * ## Accessible Dialog
 *
 * Demonstrates all the accessibility features baked in:
 * - Focus trap
 * - Escape to close
 * - Proper ARIA roles
 * - Focus restoration on close
 */
export const AccessibleDialog: Story = {
  render: () => (
    <DialogDemo buttonLabel="Open Accessible Dialog">
      {({ setOpen }) => (
        <>
          <DialogTitle>Accessibility Built-In</DialogTitle>
          <DialogDescription>
            HeadlessUI provides automatic accessibility features that make
            dialogs usable for everyone, including screen reader users.
          </DialogDescription>
          <DialogBody>
            <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
              <li><strong>Focus trap:</strong> Tab stays within the dialog</li>
              <li><strong>Escape key:</strong> Closes the dialog</li>
              <li><strong>ARIA roles:</strong> Proper dialog semantics for screen readers</li>
              <li><strong>Focus restoration:</strong> Returns focus to trigger on close</li>
              <li><strong>Backdrop:</strong> Prevents interaction with page behind</li>
            </ul>
          </DialogBody>
          <DialogActions>
            <Button plain onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Confirm</Button>
          </DialogActions>
        </>
      )}
    </DialogDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'HeadlessUI handles focus management and ARIA automatically. Accessibility for free!',
      },
    },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Tests that the dialog opens and closes via button clicks.
 */
export const OpenCloseInteraction: Story = {
  render: () => {
    const [open, setOpen] = useState(false)

    return (
      <>
        <Button data-testid="trigger" onClick={() => setOpen(true)}>
          Open Dialog
        </Button>
        <Dialog open={open} onClose={setOpen}>
          <DialogTitle>Interactive Test</DialogTitle>
          <DialogDescription>
            Testing open/close interactions.
          </DialogDescription>
          <DialogBody>
            <Field>
              <Label>Test Input</Label>
              <Input data-testid="dialog-input" placeholder="Focus here" />
            </Field>
          </DialogBody>
          <DialogActions>
            <Button plain data-testid="cancel" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button data-testid="confirm" onClick={() => setOpen(false)}>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Find and click the trigger button
    const trigger = canvas.getByTestId('trigger')
    await expect(trigger).toBeInTheDocument()
    await userEvent.click(trigger)

    // Wait for the dialog to appear (renders in portal)
    const dialog = await within(document.body).findByRole('dialog')
    await expect(dialog).toBeInTheDocument()

    // Verify dialog content is present
    await expect(within(dialog).getByText('Interactive Test')).toBeInTheDocument()

    // Click the confirm button
    const confirmButton = within(dialog).getByTestId('confirm')
    await userEvent.click(confirmButton)

    // Wait for dialog to close
    await new Promise((resolve) => setTimeout(resolve, 200))
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests that clicking the trigger opens the dialog and clicking confirm closes it.',
      },
    },
  },
}

/**
 * Tests keyboard navigation and escape key dismissal.
 */
export const KeyboardNavigation: Story = {
  render: () => {
    const [open, setOpen] = useState(false)

    return (
      <>
        <Button data-testid="trigger" onClick={() => setOpen(true)}>
          Open Dialog
        </Button>
        <Dialog open={open} onClose={setOpen}>
          <DialogTitle>Keyboard Test</DialogTitle>
          <DialogDescription>
            Tab through the fields. Press Escape to close.
          </DialogDescription>
          <DialogBody>
            <div className="space-y-4">
              <Field>
                <Label>Field One</Label>
                <Input data-testid="field-1" placeholder="First field" />
              </Field>
              <Field>
                <Label>Field Two</Label>
                <Input data-testid="field-2" placeholder="Second field" />
              </Field>
            </div>
          </DialogBody>
          <DialogActions>
            <Button plain data-testid="cancel" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button data-testid="confirm" onClick={() => setOpen(false)}>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
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
    await userEvent.tab()

    // Press Escape to close
    await userEvent.keyboard('{Escape}')

    // Dialog should close
    await new Promise((resolve) => setTimeout(resolve, 200))
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests keyboard navigation: Tab cycles through elements, Escape closes.',
      },
    },
  },
}

/**
 * Tests focus trap behavior - focus should not escape the dialog.
 */
export const FocusTrapInteraction: Story = {
  render: () => {
    const [open, setOpen] = useState(false)

    return (
      <div>
        <Button data-testid="outside-button" className="mr-4">
          Outside Button
        </Button>
        <Button data-testid="trigger" onClick={() => setOpen(true)}>
          Open Dialog
        </Button>
        <Dialog open={open} onClose={setOpen}>
          <DialogTitle>Focus Trap Test</DialogTitle>
          <DialogDescription>
            Focus should stay trapped within this dialog.
          </DialogDescription>
          <DialogBody>
            <div className="space-y-4">
              <Field>
                <Label>First Input</Label>
                <Input data-testid="input-1" placeholder="First" />
              </Field>
              <Field>
                <Label>Second Input</Label>
                <Input data-testid="input-2" placeholder="Second" />
              </Field>
            </div>
          </DialogBody>
          <DialogActions>
            <Button plain data-testid="cancel" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button data-testid="confirm" onClick={() => setOpen(false)}>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </div>
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

    // Tab multiple times - focus should cycle within dialog
    // After opening, focus moves to first focusable element in dialog
    await userEvent.tab() // To input-1
    await userEvent.tab() // To input-2
    await userEvent.tab() // To cancel button
    await userEvent.tab() // To confirm button
    await userEvent.tab() // Should cycle back to first focusable element

    // Verify we're still in the dialog (focus didn't escape to outside button)
    const outsideButton = canvas.getByTestId('outside-button')
    await expect(outsideButton).not.toHaveFocus()

    // Close the dialog
    await userEvent.keyboard('{Escape}')
    await new Promise((resolve) => setTimeout(resolve, 200))
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests that focus is trapped within the dialog and cannot escape to elements behind.',
      },
    },
  },
}

/**
 * Tests that focus returns to the trigger button after closing.
 */
export const FocusRestoration: Story = {
  render: () => {
    const [open, setOpen] = useState(false)

    return (
      <>
        <Button data-testid="trigger" onClick={() => setOpen(true)}>
          Open Dialog
        </Button>
        <Dialog open={open} onClose={setOpen}>
          <DialogTitle>Focus Restoration Test</DialogTitle>
          <DialogDescription>
            Close this dialog and watch focus return to the trigger button.
          </DialogDescription>
          <DialogActions>
            <Button data-testid="close" onClick={() => setOpen(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Get the trigger button
    const trigger = canvas.getByTestId('trigger')

    // Open the dialog
    await userEvent.click(trigger)

    // Wait for dialog
    const dialog = await within(document.body).findByRole('dialog')
    await expect(dialog).toBeInTheDocument()

    // Close via Escape
    await userEvent.keyboard('{Escape}')

    // Wait for close animation
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Focus should return to trigger
    await expect(trigger).toHaveFocus()
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests that focus returns to the trigger button when the dialog closes.',
      },
    },
  },
}
