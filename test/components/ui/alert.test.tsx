import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Alert, AlertTitle, AlertDescription, AlertBody, AlertActions } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'

describe('Alert', () => {
  describe('Alert component', () => {
    it('renders children when open', () => {
      render(
        <Alert open={true} onClose={() => {}}>
          <AlertTitle>Test Alert</AlertTitle>
        </Alert>
      )
      expect(screen.getByText('Test Alert')).toBeInTheDocument()
    })

    it('does not render children when closed', () => {
      render(
        <Alert open={false} onClose={() => {}}>
          <AlertTitle>Hidden Alert</AlertTitle>
        </Alert>
      )
      expect(screen.queryByText('Hidden Alert')).not.toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <Alert open={true} onClose={() => {}} className="custom-alert">
          <AlertTitle>Styled Alert</AlertTitle>
        </Alert>
      )
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('renders with different size variants', () => {
      const sizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'] as const
      sizes.forEach((size) => {
        const { unmount } = render(
          <Alert open={true} onClose={() => {}} size={size}>
            <AlertTitle>{size} Alert</AlertTitle>
          </Alert>
        )
        expect(screen.getByText(`${size} Alert`)).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('AlertTitle', () => {
    it('renders title text', () => {
      render(
        <Alert open={true} onClose={() => {}}>
          <AlertTitle>My Title</AlertTitle>
        </Alert>
      )
      expect(screen.getByText('My Title')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <Alert open={true} onClose={() => {}}>
          <AlertTitle className="custom-title">Custom Title</AlertTitle>
        </Alert>
      )
      const title = screen.getByText('Custom Title')
      expect(title.className).toContain('custom-title')
    })
  })

  describe('AlertDescription', () => {
    it('renders description text', () => {
      render(
        <Alert open={true} onClose={() => {}}>
          <AlertDescription>This is a description</AlertDescription>
        </Alert>
      )
      expect(screen.getByText('This is a description')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <Alert open={true} onClose={() => {}}>
          <AlertDescription className="custom-desc">Description</AlertDescription>
        </Alert>
      )
      const desc = screen.getByText('Description')
      expect(desc.className).toContain('custom-desc')
    })
  })

  describe('AlertBody', () => {
    it('renders body content', () => {
      render(
        <Alert open={true} onClose={() => {}}>
          <AlertBody>Body content here</AlertBody>
        </Alert>
      )
      expect(screen.getByText('Body content here')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <Alert open={true} onClose={() => {}}>
          <AlertBody className="custom-body">Body</AlertBody>
        </Alert>
      )
      const body = screen.getByText('Body')
      expect(body.className).toContain('custom-body')
    })

    it('applies default mt-4 class', () => {
      render(
        <Alert open={true} onClose={() => {}}>
          <AlertBody>Body</AlertBody>
        </Alert>
      )
      const body = screen.getByText('Body')
      expect(body.className).toContain('mt-4')
    })
  })

  describe('AlertActions', () => {
    it('renders action buttons', () => {
      render(
        <Alert open={true} onClose={() => {}}>
          <AlertActions>
            <Button>Cancel</Button>
            <Button>Confirm</Button>
          </AlertActions>
        </Alert>
      )
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <Alert open={true} onClose={() => {}}>
          <AlertActions className="custom-actions" data-testid="alert-actions">
            <Button>Action</Button>
          </AlertActions>
        </Alert>
      )
      const actions = screen.getByTestId('alert-actions')
      expect(actions.className).toContain('custom-actions')
    })

    it('applies default flex layout classes', () => {
      render(
        <Alert open={true} onClose={() => {}}>
          <AlertActions data-testid="alert-actions">
            <Button>Action</Button>
          </AlertActions>
        </Alert>
      )
      const actions = screen.getByTestId('alert-actions')
      expect(actions.className).toContain('mt-6')
      expect(actions.className).toContain('flex')
    })
  })

  describe('Full alert composition', () => {
    it('renders a complete alert with all components', () => {
      const onClose = vi.fn()
      render(
        <Alert open={true} onClose={onClose}>
          <AlertTitle>Delete Item</AlertTitle>
          <AlertDescription>Are you sure you want to delete this item?</AlertDescription>
          <AlertBody>
            <p>This action cannot be undone.</p>
          </AlertBody>
          <AlertActions>
            <Button plain onClick={onClose}>
              Cancel
            </Button>
            <Button color="red">Delete</Button>
          </AlertActions>
        </Alert>
      )

      expect(screen.getByText('Delete Item')).toBeInTheDocument()
      expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument()
      expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    })
  })
})
