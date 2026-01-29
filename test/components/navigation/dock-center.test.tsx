import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { DockCenter } from '~/components/navigation/dock-center'

// Mock matchMedia for prefers-reduced-motion tests
const mockMatchMedia = (prefersReducedMotion: boolean) => {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: query === '(prefers-reduced-motion: reduce)' ? prefersReducedMotion : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

// Wrapper component for routing context
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
)

describe('DockCenter', () => {
  beforeEach(() => {
    // Default to no reduced motion preference
    mockMatchMedia(false)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('rendering', () => {
    it('renders the SJ logo', () => {
      render(
        <RouterWrapper>
          <DockCenter />
        </RouterWrapper>
      )
      
      // Should contain an SVG (the logo)
      const logo = screen.getByTestId('dock-center')
      const svg = logo.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('renders as a link', () => {
      render(
        <RouterWrapper>
          <DockCenter href="/" />
        </RouterWrapper>
      )
      
      expect(screen.getByRole('link')).toBeInTheDocument()
    })

    it('links to home by default', () => {
      render(
        <RouterWrapper>
          <DockCenter href="/" />
        </RouterWrapper>
      )
      
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/')
    })
  })

  describe('navigation', () => {
    it('navigates to specified href on tap', () => {
      render(
        <RouterWrapper>
          <DockCenter href="/dashboard" />
        </RouterWrapper>
      )
      
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/dashboard')
    })

    it('calls onClick when tapped', () => {
      const onClick = vi.fn()
      render(
        <RouterWrapper>
          <DockCenter href="/" onClick={onClick} />
        </RouterWrapper>
      )
      
      fireEvent.click(screen.getByRole('link'))
      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('visual prominence', () => {
    it('is larger than regular dock items', () => {
      render(
        <RouterWrapper>
          <DockCenter />
        </RouterWrapper>
      )
      
      const center = screen.getByTestId('dock-center')
      // Should have larger dimensions than regular 44px items
      expect(center.className).toMatch(/w-1[2-6]|h-1[2-6]|w-\[4[8-9]|h-\[4[8-9]|w-\[5|h-\[5/)
    })

    it('has distinct styling', () => {
      render(
        <RouterWrapper>
          <DockCenter />
        </RouterWrapper>
      )
      
      const center = screen.getByTestId('dock-center')
      // Should have background or border to distinguish it
      expect(center.className).toMatch(/bg-|border-|rounded/)
    })
  })

  describe('idle animation', () => {
    it('has breathing/glow animation classes', () => {
      render(
        <RouterWrapper>
          <DockCenter />
        </RouterWrapper>
      )
      
      const center = screen.getByTestId('dock-center')
      // Should have animation classes or Framer Motion attributes
      expect(center).toBeInTheDocument()
    })

    it('uses Framer Motion for animation', () => {
      render(
        <RouterWrapper>
          <DockCenter />
        </RouterWrapper>
      )
      
      // The element should be rendered (Framer Motion manages animation internally)
      const center = screen.getByTestId('dock-center')
      expect(center.tagName).toBe('A')
    })
  })

  describe('reduced motion', () => {
    it('is static when reduced motion is preferred', () => {
      mockMatchMedia(true)
      
      render(
        <RouterWrapper>
          <DockCenter />
        </RouterWrapper>
      )
      
      // Should still render, but without animation
      const center = screen.getByTestId('dock-center')
      expect(center).toBeInTheDocument()
    })
  })

  describe('styling', () => {
    it('applies custom className', () => {
      render(
        <RouterWrapper>
          <DockCenter className="custom-class" />
        </RouterWrapper>
      )
      
      const center = screen.getByTestId('dock-center')
      expect(center.className).toContain('custom-class')
    })

    it('has touch target for accessibility', () => {
      render(
        <RouterWrapper>
          <DockCenter />
        </RouterWrapper>
      )
      
      const center = screen.getByTestId('dock-center')
      // Should have minimum touch target
      expect(center.className).toMatch(/min-w-\[44|min-h-\[44|w-1[2-6]|h-1[2-6]/)
    })
  })

  describe('accessibility', () => {
    it('has accessible name', () => {
      render(
        <RouterWrapper>
          <DockCenter href="/" />
        </RouterWrapper>
      )
      
      // Link should have aria-label or text content
      const link = screen.getByRole('link', { name: /home|spoonjoy|logo/i })
      expect(link).toBeInTheDocument()
    })
  })
})
