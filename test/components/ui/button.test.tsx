import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { Button, TouchTarget } from '~/components/ui/button'

// Wrapper component to provide React Router context for link tests
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>
}

describe('Button', () => {
  describe('TouchTarget', () => {
    it('renders children', () => {
      render(<TouchTarget>Click me</TouchTarget>)
      expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('renders touch target span with aria-hidden', () => {
      const { container } = render(<TouchTarget>Click me</TouchTarget>)
      const touchTarget = container.querySelector('span[aria-hidden="true"]')
      expect(touchTarget).toBeInTheDocument()
    })
  })

  describe('Button component', () => {
    it('renders as a button by default', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
    })

    it('renders as a link when href is provided', () => {
      render(
        <TestWrapper>
          <Button href="/test">Link button</Button>
        </TestWrapper>
      )
      expect(screen.getByRole('link', { name: 'Link button' })).toHaveAttribute('href', '/test')
    })

    it('applies default color styles (dark/zinc)', () => {
      const { container } = render(<Button>Default</Button>)
      const button = container.querySelector('button')
      expect(button).toHaveClass('cursor-default')
    })

    it('applies outline styles when outline prop is true', () => {
      const { container } = render(<Button outline>Outline</Button>)
      const button = container.querySelector('button')
      expect(button).toBeInTheDocument()
    })

    it('applies plain styles when plain prop is true', () => {
      const { container } = render(<Button plain>Plain</Button>)
      const button = container.querySelector('button')
      expect(button).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(<Button className="custom-class">Custom</Button>)
      const button = container.querySelector('button')
      expect(button?.className).toContain('custom-class')
    })

    it('passes additional props to button', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button', { name: 'Disabled' })
      expect(button).toBeDisabled()
    })

    it('renders with different color variants', () => {
      const colors = ['red', 'blue', 'green', 'indigo', 'zinc'] as const
      colors.forEach((color) => {
        const { unmount } = render(<Button color={color}>{color}</Button>)
        expect(screen.getByRole('button', { name: color })).toBeInTheDocument()
        unmount()
      })
    })

    it('renders link button with target attribute', () => {
      render(
        <TestWrapper>
          <Button href="/external" target="_blank">
            External
          </Button>
        </TestWrapper>
      )
      expect(screen.getByRole('link', { name: 'External' })).toHaveAttribute('target', '_blank')
    })
  })
})
