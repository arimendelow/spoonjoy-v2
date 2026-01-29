import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Trash2, Eraser, LogOut, Archive, Send } from 'lucide-react'
import { ConfirmationDialog } from '../app/components/confirmation-dialog'
import { Button } from '../app/components/ui/button'

/**
 * # ConfirmationDialog
 *
 * A reusable confirmation dialog that wraps Catalyst's Dialog component
 * with a standard confirmation pattern. Because `window.confirm()` is so 2003.
 *
 * This component exists to make confirmation dialogs:
 * - **Consistent** — Same look everywhere in the app
 * - **Accessible** — Focus trapping, keyboard navigation, screen reader support
 * - **Fun** — We can have playful copy instead of boring "Are you sure?"
 *
 * ## When to Use ConfirmationDialog
 *
 * - **Destructive actions** — Deleting recipes, clearing lists, removing items
 * - **Irreversible operations** — Actions that can't be undone
 * - **Important state changes** — Logging out, canceling in-progress work
 *
 * ## When NOT to Use ConfirmationDialog
 *
 * - Simple form submissions (just submit them)
 * - Saving data (just save it)
 * - Anything that can be easily undone (provide undo instead)
 *
 * ## Props
 *
 * - `open` — Whether the dialog is visible
 * - `onClose` — Called when user cancels or dismisses
 * - `onConfirm` — Called when user confirms the action
 * - `title` — The headline. Make it specific!
 * - `description` — Context about what will happen
 * - `confirmLabel` — Text for the confirm button (default: "Confirm")
 * - `cancelLabel` — Text for the cancel button (default: "Cancel")
 * - `destructive` — Makes the confirm button red for dangerous actions
 */
const meta: Meta<typeof ConfirmationDialog> = {
  title: 'Components/ConfirmationDialog',
  component: ConfirmationDialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A reusable confirmation dialog component that provides a consistent, accessible
way to confirm user actions. Replaces \`window.confirm()\` with a polished UI.

Built on top of Catalyst's Dialog component with support for destructive styling,
custom labels, and fun/playful copy.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Whether the dialog is visible.',
    },
    title: {
      control: 'text',
      description: 'The dialog title/headline.',
    },
    description: {
      control: 'text',
      description: 'Additional context about the action.',
    },
    confirmLabel: {
      control: 'text',
      description: 'Label for the confirm button.',
    },
    cancelLabel: {
      control: 'text',
      description: 'Label for the cancel button.',
    },
    destructive: {
      control: 'boolean',
      description: 'Whether to show destructive (red) styling on confirm button.',
    },
  },
}

export default meta
type Story = StoryObj<typeof ConfirmationDialog>

/**
 * A wrapper that manages dialog open state for Storybook demos.
 */
function ConfirmationDialogDemo({
  buttonLabel = 'Open Confirmation',
  buttonColor = 'dark/zinc' as const,
  icon: Icon,
  ...dialogProps
}: {
  buttonLabel?: string
  buttonColor?: 'dark/zinc' | 'red' | 'blue' | 'amber'
  icon?: typeof Trash2
} & Omit<React.ComponentProps<typeof ConfirmationDialog>, 'open' | 'onClose' | 'onConfirm'>) {
  const [open, setOpen] = useState(false)
  const [lastAction, setLastAction] = useState<string | null>(null)

  return (
    <div className="flex flex-col items-center gap-4">
      <Button color={buttonColor} onClick={() => setOpen(true)}>
        {Icon && <Icon className="h-4 w-4" />}
        {buttonLabel}
      </Button>
      <ConfirmationDialog
        {...dialogProps}
        open={open}
        onClose={() => {
          setOpen(false)
          setLastAction('Cancelled')
        }}
        onConfirm={() => {
          setOpen(false)
          setLastAction('Confirmed!')
        }}
      />
      {lastAction && (
        <p className="text-sm text-zinc-500">
          Last action: <span className="font-medium">{lastAction}</span>
        </p>
      )}
    </div>
  )
}

// =============================================================================
// BASIC STORIES
// =============================================================================

/**
 * The default confirmation dialog with standard copy.
 */
export const Default: Story = {
  render: () => (
    <ConfirmationDialogDemo
      title="Confirm Action"
      description="Are you sure you want to proceed with this action?"
    />
  ),
}

/**
 * A destructive confirmation dialog with red confirm button.
 * Use this for dangerous actions like deletion.
 */
export const Destructive: Story = {
  render: () => (
    <ConfirmationDialogDemo
      buttonLabel="Delete Item"
      buttonColor="red"
      icon={Trash2}
      title="Delete this item?"
      description="This action cannot be undone. The item will be permanently removed."
      confirmLabel="Delete"
      cancelLabel="Keep it"
      destructive
    />
  ),
}

// =============================================================================
// PLAYFUL COPY EXAMPLES
// =============================================================================

/**
 * The recipe deletion dialog used in the app.
 * Features playful "shadow realm" copy that makes deletion feel less scary.
 */
export const DeleteRecipe: Story = {
  render: () => (
    <ConfirmationDialogDemo
      buttonLabel="Delete Recipe"
      buttonColor="red"
      icon={Trash2}
      title="Banish this recipe?"
      description="This recipe will be sent to the shadow realm. There's no coming back!"
      confirmLabel="Send it!"
      cancelLabel="Spare it"
      destructive
    />
  ),
}

/**
 * The shopping list clear dialog used in the app.
 * Cheerful copy about starting fresh.
 */
export const ClearShoppingList: Story = {
  render: () => (
    <ConfirmationDialogDemo
      buttonLabel="Clear Shopping List"
      buttonColor="amber"
      icon={Eraser}
      title="Start fresh?"
      description="All items will be cleared. Your shopping list will be squeaky clean!"
      confirmLabel="Clear it all"
      cancelLabel="Keep my stuff"
    />
  ),
}

/**
 * A logout confirmation with friendly copy.
 */
export const Logout: Story = {
  render: () => (
    <ConfirmationDialogDemo
      buttonLabel="Log Out"
      icon={LogOut}
      title="Leaving so soon?"
      description="You'll need to sign in again next time. Any unsaved changes will be lost."
      confirmLabel="See ya!"
      cancelLabel="Stay a bit longer"
    />
  ),
}

/**
 * An archive confirmation with neutral tone.
 */
export const ArchiveCookbook: Story = {
  render: () => (
    <ConfirmationDialogDemo
      buttonLabel="Archive Cookbook"
      icon={Archive}
      title="Archive this cookbook?"
      description="The cookbook will be hidden from your main list but can be restored anytime."
      confirmLabel="Archive"
      cancelLabel="Keep visible"
    />
  ),
}

// =============================================================================
// EDGE CASES
// =============================================================================

/**
 * A dialog with very long content to test overflow handling.
 */
export const LongContent: Story = {
  render: () => (
    <ConfirmationDialogDemo
      title="This is a really long title that might wrap to multiple lines"
      description="This is an exceptionally long description that goes into great detail about what will happen when you confirm this action. It includes multiple sentences and might even wrap to several lines depending on the width of the dialog. The purpose is to ensure the dialog handles long content gracefully without breaking the layout or hiding important information from the user."
      confirmLabel="I understand and confirm"
      cancelLabel="Let me think about it"
    />
  ),
}

/**
 * A dialog with minimal content.
 */
export const Minimal: Story = {
  render: () => (
    <ConfirmationDialogDemo
      title="Proceed?"
      description=""
    />
  ),
}

// =============================================================================
// VARIANT COMPARISON
// =============================================================================

/**
 * Side-by-side comparison of destructive vs non-destructive styles.
 */
export const StyleComparison: Story = {
  render: () => (
    <div className="flex gap-8">
      <ConfirmationDialogDemo
        buttonLabel="Non-destructive"
        buttonColor="blue"
        title="Publish Recipe?"
        description="Your recipe will be visible to other users."
        confirmLabel="Publish"
        cancelLabel="Not yet"
      />
      <ConfirmationDialogDemo
        buttonLabel="Destructive"
        buttonColor="red"
        icon={Trash2}
        title="Delete Recipe?"
        description="This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
      />
    </div>
  ),
}

/**
 * Different button label styles to inspire playful copy.
 */
export const CopyInspiration: Story = {
  render: () => (
    <div className="space-y-4 text-sm">
      <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
        <p className="font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
          Instead of boring "OK / Cancel", try:
        </p>
        <ul className="space-y-1 text-zinc-600 dark:text-zinc-400">
          <li>• "Send it!" / "Spare it" (for deletion)</li>
          <li>• "Clear it all" / "Keep my stuff" (for clearing)</li>
          <li>• "See ya!" / "Stay a bit longer" (for logout)</li>
          <li>• "Let's go!" / "Hmm, maybe not" (for actions)</li>
          <li>• "Publish" / "Not yet" (for publishing)</li>
        </ul>
      </div>
      <div className="flex gap-4">
        <ConfirmationDialogDemo
          buttonLabel="Try Playful Copy"
          buttonColor="blue"
          icon={Send}
          title="Ready to publish?"
          description="Your recipe will go live and other chefs can try it out!"
          confirmLabel="Let's go!"
          cancelLabel="Hmm, maybe not"
        />
      </div>
    </div>
  ),
}
