import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Alert, AlertTitle, AlertDescription, AlertBody, AlertActions } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'

describe('Alert', () => {
  describe('Alert component', () => {
    it('renders children when open', async () => {
      render(
        <Alert open={true} onClose={() => {}}>
          <AlertTitle>Test Alert</AlertTitle>
        </Alert>
      )
      await waitFor(() => {
        expect(screen.getByText('Test Alert')).toBeInTheDocument()
      })
    })

    it('does not render children when closed', () => {
      render(
        <Alert open={false} onClose={() => {}}>
          <AlertTitle>Hidden Alert</AlertTitle>
        </Alert>
      )
      expect(screen.queryByText('Hidden Alert')).not.toBeInTheDocument()
    })

    it('applies custom className', async () => {
      render(
        <Alert open={true} onClose={() => {}} className="custom-alert">
          <AlertTitle>Styled Alert</AlertTitle>
        </Alert>
      )
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
    })

    it('renders with different size variants', async () => {
      const sizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'] as const
      for (const size of sizes) {
        const { unmount } = render(
          <Alert open={true} onClose={() => {}} size={size}>
            <AlertTitle>{size} Alert</AlertTitle>
          </Alert>
        )
        await waitFor(() => {
          expect(screen.getByText(`${size} Alert`)).toBeInTheDocument()
        })
        unmount()
      }
    })
  })

  describe('AlertTitle', () => {
    it('renders title text', async () => {
      render(
        <Alert open={true} onClose={() => {}}>
          <AlertTitle>My Title</AlertTitle>
        </Alert>
      )
      await waitFor(() => {
        expect(screen.getByText('My Title')).toBeInTheDocument()
      })
    })

    it('applies custom className', async () => {
      render(
        <Alert open={true} onClose={() => {}}>
          <AlertTitle className="custom-title">Custom Title</AlertTitle>
        </Alert>
      )
      await waitFor(() => {
        const title = screen.getByText('Custom Title')
        expect(title.className).toContain('custom-title')
      })
    })
  })

  describe('AlertDescription', () => {
    it('renders description text', async () => {
      render(
        <Alert open={true} onClose={() => {}}>
          <AlertDescription>This is a description</AlertDescription>
        </Alert>
      )
      await waitFor(() => {
        expect(screen.getByText('This is a description')).toBeInTheDocument()
      })
    })

    it('applies custom className', async () => {
      render(
        <Alert open={true} onClose={() => {}}>
          <AlertDescription className="custom-desc">Description</AlertDescription>
        </Alert>
      )
      await waitFor(() => {
        const desc = screen.getByText('Description')
        expect(desc.className).toContain('custom-desc')
      })
    })
  })

  describe('AlertBody', () => {
    it('renders body content', async () => {
      render(
        <Alert open={true} onClose={() => {}}>
          <AlertBody>Body content here</AlertBody>
        </Alert>
      )
      await waitFor(() => {
        expect(screen.getByText('Body content here')).toBeInTheDocument()
      })
    })

    it('applies custom className', async () => {
      render(
        <Alert open={true} onClose={() => {}}>
          <AlertBody className="custom-body">Body</AlertBody>
        </Alert>
      )
      await waitFor(() => {
        const body = screen.getByText('Body')
        expect(body.className).toContain('custom-body')
      })
    })

    it('applies default mt-4 class', async () => {
      render(
        <Alert open={true} onClose={() => {}}>
          <AlertBody>Body</AlertBody>
        </Alert>
      )
      await waitFor(() => {
        const body = screen.getByText('Body')
        expect(body.className).toContain('mt-4')
      })
    })
  })

  describe('AlertActions', () => {
    it('renders action buttons', async () => {
      render(
        <Alert open={true} onClose={() => {}}>
          <AlertActions>
            <Button>Cancel</Button>
            <Button>Confirm</Button>
          </AlertActions>
        </Alert>
      )
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
      })
    })

    it('applies custom className', async () => {
      render(
        <Alert open={true} onClose={() => {}}>
          <AlertActions className="custom-actions" data-testid="alert-actions">
            <Button>Action</Button>
          </AlertActions>
        </Alert>
      )
      await waitFor(() => {
        const actions = screen.getByTestId('alert-actions')
        expect(actions.className).toContain('custom-actions')
      })
    })

    it('applies default flex layout classes', async () => {
      render(
        <Alert open={true} onClose={() => {}}>
          <AlertActions data-testid="alert-actions">
            <Button>Action</Button>
          </AlertActions>
        </Alert>
      )
      await waitFor(() => {
        const actions = screen.getByTestId('alert-actions')
        expect(actions.className).toContain('mt-6')
        expect(actions.className).toContain('flex')
      })
    })
  })

  describe('Full alert composition', () => {
    it('renders a complete alert with all components', async () => {
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

      await waitFor(() => {
        expect(screen.getByText('Delete Item')).toBeInTheDocument()
        expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument()
        expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
      })
    })
  })
})
