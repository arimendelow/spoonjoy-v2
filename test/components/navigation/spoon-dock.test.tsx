import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SpoonDock } from '~/components/navigation/spoon-dock'

// Mock matchMedia for prefers-reduced-motion tests
const mockMatchMedia = (matches: boolean) => {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: query === '(prefers-reduced-motion: reduce)' ? matches : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

describe('SpoonDock', () => {
  describe('rendering', () => {
    it('renders as a navigation element', () => {
      render(<SpoonDock />)
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('has aria-label for accessibility', () => {
      render(<SpoonDock />)
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveAttribute('aria-label')
    })

    it('renders children', () => {
      render(
        <SpoonDock>
          <button>Test Item</button>
        </SpoonDock>
      )
      expect(screen.getByRole('button', { name: 'Test Item' })).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<SpoonDock className="custom-class" />)
      const nav = screen.getByRole('navigation')
      expect(nav.className).toContain('custom-class')
    })
  })

  describe('positioning', () => {
    it('has fixed positioning', () => {
      render(<SpoonDock />)
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('fixed')
    })

    it('is positioned at the bottom of the viewport', () => {
      render(<SpoonDock />)
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('bottom-0')
    })

    it('is horizontally centered', () => {
      render(<SpoonDock />)
      const nav = screen.getByRole('navigation')
      // Should have centering classes
      expect(nav).toHaveClass('left-0')
      expect(nav).toHaveClass('right-0')
    })
  })

  describe('glass morphism styling', () => {
    it('has backdrop blur for glass effect', () => {
      render(<SpoonDock />)
      const nav = screen.getByRole('navigation')
      expect(nav.className).toMatch(/backdrop-blur/)
    })

    it('has semi-transparent background', () => {
      render(<SpoonDock />)
      const nav = screen.getByRole('navigation')
      // Should have bg-black/60 or similar opacity
      expect(nav.className).toMatch(/bg-.*\/\d+/)
    })

    it('has subtle border for glass edge', () => {
      render(<SpoonDock />)
      const nav = screen.getByRole('navigation')
      expect(nav.className).toMatch(/border/)
    })
  })

  describe('safe area handling', () => {
    it('has safe-area-inset-bottom handling in styles', () => {
      const { container } = render(<SpoonDock />)
      const nav = container.querySelector('nav')
      
      // Check for CSS that includes env(safe-area-inset-bottom)
      // This can be checked via computed styles or inline styles
      const styles = nav?.getAttribute('style') || ''
      const className = nav?.className || ''
      
      // Should either have inline style with env() or a class that sets margin/padding bottom
      // Using pb-safe or mb-safe pattern, or inline style
      const hasSafeAreaHandling = 
        styles.includes('safe-area-inset-bottom') ||
        className.includes('pb-[') ||
        className.includes('mb-[')
      
      expect(hasSafeAreaHandling).toBe(true)
    })
  })

  describe('responsive visibility', () => {
    it('is hidden on desktop (lg breakpoint and above)', () => {
      render(<SpoonDock />)
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('lg:hidden')
    })
  })

  describe('dimensions', () => {
    it('has a max-width constraint', () => {
      render(<SpoonDock />)
      const nav = screen.getByRole('navigation')
      expect(nav.className).toMatch(/max-w-/)
    })

    it('has horizontal margins from screen edges', () => {
      render(<SpoonDock />)
      const nav = screen.getByRole('navigation')
      expect(nav.className).toMatch(/mx-\d+/)
    })

    it('has a pill/rounded shape', () => {
      render(<SpoonDock />)
      const nav = screen.getByRole('navigation')
      expect(nav.className).toMatch(/rounded-full|rounded-\d+xl/)
    })
  })

  describe('layout', () => {
    it('uses flexbox for item layout', () => {
      render(<SpoonDock />)
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('flex')
    })

    it('centers items horizontally', () => {
      render(<SpoonDock />)
      const nav = screen.getByRole('navigation')
      expect(nav.className).toMatch(/justify-around|justify-evenly|justify-between/)
    })

    it('centers items vertically', () => {
      render(<SpoonDock />)
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('items-center')
    })
  })
})
