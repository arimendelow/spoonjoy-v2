import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ValidationError } from '~/components/ui/validation-error'

describe('ValidationError', () => {
  describe('rendering behavior', () => {
    it('renders nothing when error is undefined', () => {
      const { container } = render(<ValidationError error={undefined} />)
      expect(container).toBeEmptyDOMElement()
    })

    it('renders nothing when error is null', () => {
      const { container } = render(<ValidationError error={null} />)
      expect(container).toBeEmptyDOMElement()
    })

    it('renders nothing when error is an empty string', () => {
      const { container } = render(<ValidationError error="" />)
      expect(container).toBeEmptyDOMElement()
    })

    it('renders nothing when error is an empty array', () => {
      const { container } = render(<ValidationError error={[]} />)
      expect(container).toBeEmptyDOMElement()
    })

    it('renders when error is a non-empty string', () => {
      render(<ValidationError error="Something went wrong" />)
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('renders when error is a non-empty array', () => {
      render(<ValidationError error={['Error 1', 'Error 2']} />)
      expect(screen.getByText('Error 1')).toBeInTheDocument()
      expect(screen.getByText('Error 2')).toBeInTheDocument()
    })
  })

  describe('single error display', () => {
    it('displays the error message', () => {
      render(<ValidationError error="Invalid email address" />)
      expect(screen.getByText('Invalid email address')).toBeInTheDocument()
    })
  })

  describe('multiple errors display', () => {
    it('displays all error messages', () => {
      const errors = ['Field is required', 'Must be at least 3 characters', 'Cannot contain spaces']
      render(<ValidationError error={errors} />)

      errors.forEach((error) => {
        expect(screen.getByText(error)).toBeInTheDocument()
      })
    })

    it('renders errors as a list', () => {
      render(<ValidationError error={['Error 1', 'Error 2']} />)
      const list = screen.getByRole('list')
      expect(list).toBeInTheDocument()
      expect(list.children).toHaveLength(2)
    })

    it('filters out empty strings from error array', () => {
      render(<ValidationError error={['Error 1', '', 'Error 2']} />)
      const list = screen.getByRole('list')
      expect(list.children).toHaveLength(2)
      expect(screen.getByText('Error 1')).toBeInTheDocument()
      expect(screen.getByText('Error 2')).toBeInTheDocument()
    })

    it('renders nothing when error array contains only empty strings', () => {
      const { container } = render(<ValidationError error={['', '', '']} />)
      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('accessibility', () => {
    it('has role="alert" for screen readers', () => {
      render(<ValidationError error="Error message" />)
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('has role="alert" when displaying multiple errors', () => {
      render(<ValidationError error={['Error 1', 'Error 2']} />)
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  describe('styling', () => {
    it('applies red text color', () => {
      render(<ValidationError error="Error message" />)
      const alert = screen.getByRole('alert')
      expect(alert.className).toContain('text-red')
    })

    it('applies red border', () => {
      render(<ValidationError error="Error message" />)
      const alert = screen.getByRole('alert')
      expect(alert.className).toContain('border-red')
    })

    it('applies red background', () => {
      render(<ValidationError error="Error message" />)
      const alert = screen.getByRole('alert')
      expect(alert.className).toContain('bg-red')
    })

    it('applies rounded corners', () => {
      render(<ValidationError error="Error message" />)
      const alert = screen.getByRole('alert')
      expect(alert.className).toContain('rounded')
    })

    it('applies custom className', () => {
      render(<ValidationError error="Error message" className="custom-class" />)
      const alert = screen.getByRole('alert')
      expect(alert.className).toContain('custom-class')
    })
  })

  describe('data attributes', () => {
    it('has data-slot="validation-error" attribute', () => {
      render(<ValidationError error="Error message" />)
      const alert = screen.getByRole('alert')
      expect(alert).toHaveAttribute('data-slot', 'validation-error')
    })
  })
})
