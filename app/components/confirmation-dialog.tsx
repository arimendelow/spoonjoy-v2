/**
 * ConfirmationDialog - A reusable confirmation dialog component
 *
 * Wraps Catalyst Dialog with a standard confirmation pattern.
 * Use this instead of window.confirm() for a consistent, accessible,
 * and visually polished experience.
 */

import { Dialog, DialogTitle, DialogDescription, DialogActions } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";

export interface ConfirmationDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Called when the dialog should close (cancel, escape, click outside) */
  onClose: () => void;
  /** Called when the user confirms the action */
  onConfirm: () => void;
  /** The dialog title */
  title: string;
  /** The dialog description/message */
  description: string;
  /** Label for the confirm button (default: "Confirm") */
  confirmLabel?: string;
  /** Label for the cancel button (default: "Cancel") */
  cancelLabel?: string;
  /** Whether this is a destructive action (makes confirm button red) */
  destructive?: boolean;
}

export function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
}: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} size="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription>{description}</DialogDescription>
      <DialogActions>
        <Button plain onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button
          color={destructive ? "red" : "blue"}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
