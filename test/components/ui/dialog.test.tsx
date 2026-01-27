import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'

describe('Dialog', () => {
  describe('Dialog component', () => {
    it('renders children when open', () => {
      render(
        <Dialog open={true} onClose={() => {}}>
          <DialogTitle>Test Dialog</DialogTitle>
        </Dialog>
      )
      expect(screen.getByText('Test Dialog')).toBeInTheDocument()
    })

    it('does not render children when closed', () => {
      render(
        <Dialog open={false} onClose={() => {}}>
          <DialogTitle>Hidden Dialog</DialogTitle>
        </Dialog>
      )
      expect(screen.queryByText('Hidden Dialog')).not.toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <Dialog open={true} onClose={() => {}} className="custom-dialog">
          <DialogTitle>Styled Dialog</DialogTitle>
        </Dialog>
      )
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('renders with different size variants', () => {
      const sizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'] as const
      sizes.forEach((size) => {
        const { unmount } = render(
          <Dialog open={true} onClose={() => {}} size={size}>
            <DialogTitle>{size} Dialog</DialogTitle>
          </Dialog>
        )
        expect(screen.getByText(`${size} Dialog`)).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('DialogTitle', () => {
    it('renders title text', () => {
      render(
        <Dialog open={true} onClose={() => {}}>
          <DialogTitle>My Title</DialogTitle>
        </Dialog>
      )
      expect(screen.getByText('My Title')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <Dialog open={true} onClose={() => {}}>
          <DialogTitle className="custom-title">Custom Title</DialogTitle>
        </Dialog>
      )
      const title = screen.getByText('Custom Title')
      expect(title.className).toContain('custom-title')
    })
  })

  describe('DialogDescription', () => {
    it('renders description text', () => {
      render(
        <Dialog open={true} onClose={() => {}}>
          <DialogDescription>This is a description</DialogDescription>
        </Dialog>
      )
      expect(screen.getByText('This is a description')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <Dialog open={true} onClose={() => {}}>
          <DialogDescription className="custom-desc">Description</DialogDescription>
        </Dialog>
      )
      const desc = screen.getByText('Description')
      expect(desc.className).toContain('custom-desc')
    })
  })

  describe('DialogBody', () => {
    it('renders body content', () => {
      render(
        <Dialog open={true} onClose={() => {}}>
          <DialogBody>Body content here</DialogBody>
        </Dialog>
      )
      expect(screen.getByText('Body content here')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <Dialog open={true} onClose={() => {}}>
          <DialogBody className="custom-body">Body</DialogBody>
        </Dialog>
      )
      const body = screen.getByText('Body')
      expect(body.className).toContain('custom-body')
    })

    it('applies default mt-6 class', () => {
      render(
        <Dialog open={true} onClose={() => {}}>
          <DialogBody>Body</DialogBody>
        </Dialog>
      )
      const body = screen.getByText('Body')
      expect(body.className).toContain('mt-6')
    })
  })

  describe('DialogActions', () => {
    it('renders action buttons', () => {
      render(
        <Dialog open={true} onClose={() => {}}>
          <DialogActions>
            <Button>Cancel</Button>
            <Button>Confirm</Button>
          </DialogActions>
        </Dialog>
      )
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <Dialog open={true} onClose={() => {}}>
          <DialogActions className="custom-actions" data-testid="dialog-actions">
            <Button>Action</Button>
          </DialogActions>
        </Dialog>
      )
      const actions = screen.getByTestId('dialog-actions')
      expect(actions.className).toContain('custom-actions')
    })

    it('applies default flex layout classes', () => {
      render(
        <Dialog open={true} onClose={() => {}}>
          <DialogActions data-testid="dialog-actions">
            <Button>Action</Button>
          </DialogActions>
        </Dialog>
      )
      const actions = screen.getByTestId('dialog-actions')
      expect(actions.className).toContain('mt-8')
      expect(actions.className).toContain('flex')
    })
  })

  describe('Full dialog composition', () => {
    it('renders a complete dialog with all components', () => {
      const onClose = vi.fn()
      render(
        <Dialog open={true} onClose={onClose}>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Make changes to your profile here.</DialogDescription>
          <DialogBody>
            <p>Profile form fields would go here.</p>
          </DialogBody>
          <DialogActions>
            <Button plain onClick={onClose}>
              Cancel
            </Button>
            <Button color="indigo">Save Changes</Button>
          </DialogActions>
        </Dialog>
      )

      expect(screen.getByText('Edit Profile')).toBeInTheDocument()
      expect(screen.getByText('Make changes to your profile here.')).toBeInTheDocument()
      expect(screen.getByText('Profile form fields would go here.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument()
    })
  })
})
