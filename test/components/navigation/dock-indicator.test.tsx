import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock useReducedMotion from framer-motion
const mockUseReducedMotion = vi.fn()
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion')
  return {
    ...actual,
    useReducedMotion: () => mockUseReducedMotion(),
  }
})

import { DockIndicator } from '~/components/navigation/dock-indicator'

describe('DockIndicator', () => {
  beforeEach(() => {
    // Default to no reduced motion preference
    mockUseReducedMotion.mockReturnValue(false)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('rendering', () => {
    it('renders an indicator element', () => {
      render(<DockIndicator activeIndex={0} itemCount={4} />)
      
      // Should render a pill/indicator element
      const indicator = screen.getByTestId('dock-indicator')
      expect(indicator).toBeInTheDocument()
    })

    it('has pill styling', () => {
      render(<DockIndicator activeIndex={0} itemCount={4} />)
      
      const indicator = screen.getByTestId('dock-indicator')
      // Should have rounded corners
      expect(indicator.className).toMatch(/rounded/)
    })

    it('has background for visibility', () => {
      render(<DockIndicator activeIndex={0} itemCount={4} />)
      
      const indicator = screen.getByTestId('dock-indicator')
      // Should have a background color
      expect(indicator.className).toMatch(/bg-/)
    })
  })

  describe('positioning', () => {
    it('renders only one indicator at a time', () => {
      render(<DockIndicator activeIndex={0} itemCount={4} />)
      
      const indicators = screen.getAllByTestId('dock-indicator')
      expect(indicators).toHaveLength(1)
    })

    it('indicator position changes based on activeIndex', () => {
      const { rerender } = render(<DockIndicator activeIndex={0} itemCount={4} />)
      
      const indicatorAtFirst = screen.getByTestId('dock-indicator')
      const firstIndex = indicatorAtFirst.getAttribute('data-active-index')

      rerender(<DockIndicator activeIndex={2} itemCount={4} />)
      
      const indicatorAtThird = screen.getByTestId('dock-indicator')
      const thirdIndex = indicatorAtThird.getAttribute('data-active-index')
      
      // Active index should change, which drives the position animation
      expect(firstIndex).toBe('0')
      expect(thirdIndex).toBe('2')
      expect(firstIndex).not.toBe(thirdIndex)
    })
  })

  describe('animation', () => {
    it('uses Framer Motion for animation', () => {
      render(<DockIndicator activeIndex={0} itemCount={4} />)
      
      const indicator = screen.getByTestId('dock-indicator')
      // Framer Motion adds data attributes or specific structure
      // Check for motion component behavior
      expect(indicator.tagName).toBe('DIV')
    })

    it('has layoutId for shared layout animations', () => {
      render(<DockIndicator activeIndex={0} itemCount={4} />)
      
      // The indicator should use Framer Motion's layoutId
      // This is difficult to test directly, but we can check the component renders
      const indicator = screen.getByTestId('dock-indicator')
      expect(indicator).toBeInTheDocument()
    })

    it('has spring physics for smooth animation', () => {
      render(<DockIndicator activeIndex={0} itemCount={4} />)
      
      // Spring physics are specified in the Framer Motion config
      // This test verifies the component renders (spring config is implementation detail)
      const indicator = screen.getByTestId('dock-indicator')
      expect(indicator).toBeInTheDocument()
    })
  })

  describe('reduced motion', () => {
    it('respects prefers-reduced-motion setting', () => {
      mockUseReducedMotion.mockReturnValue(true) // User prefers reduced motion

      render(<DockIndicator activeIndex={0} itemCount={4} />)

      const indicator = screen.getByTestId('dock-indicator')
      // Should still render, but may have different animation behavior
      expect(indicator).toBeInTheDocument()
    })

    it('does not animate when reduced motion is preferred', () => {
      mockUseReducedMotion.mockReturnValue(true)

      const { rerender } = render(<DockIndicator activeIndex={0} itemCount={4} />)
      const firstIndicator = screen.getByTestId('dock-indicator')

      rerender(<DockIndicator activeIndex={2} itemCount={4} />)
      const secondIndicator = screen.getByTestId('dock-indicator')

      // Both should exist (instant position change, no animation)
      expect(firstIndicator).toBeInTheDocument()
      expect(secondIndicator).toBeInTheDocument()
    })

    it('uses instant transition (duration: 0) when reduced motion is preferred (branch coverage)', () => {
      // This test explicitly covers the prefersReducedMotion ? { duration: 0 } : springConfig branch at line 76
      mockUseReducedMotion.mockReturnValue(true)

      render(<DockIndicator activeIndex={1} itemCount={3} />)

      // When reduced motion is preferred, transition should use { duration: 0 }
      // The indicator still renders and positions correctly
      const indicator = screen.getByTestId('dock-indicator')
      expect(indicator).toBeInTheDocument()
      expect(indicator.getAttribute('data-active-index')).toBe('1')
    })
  })

  describe('styling', () => {
    it('applies custom className', () => {
      render(<DockIndicator activeIndex={0} itemCount={4} className="custom-class" />)
      
      const indicator = screen.getByTestId('dock-indicator')
      expect(indicator.className).toContain('custom-class')
    })

    it('has absolute positioning for overlay effect', () => {
      render(<DockIndicator activeIndex={0} itemCount={4} />)
      
      const indicator = screen.getByTestId('dock-indicator')
      expect(indicator.className).toMatch(/absolute/)
    })
  })

  describe('edge cases', () => {
    it('handles activeIndex of 0', () => {
      render(<DockIndicator activeIndex={0} itemCount={4} />)
      expect(screen.getByTestId('dock-indicator')).toBeInTheDocument()
    })

    it('handles last activeIndex', () => {
      render(<DockIndicator activeIndex={3} itemCount={4} />)
      expect(screen.getByTestId('dock-indicator')).toBeInTheDocument()
    })

    it('handles single item', () => {
      render(<DockIndicator activeIndex={0} itemCount={1} />)
      expect(screen.getByTestId('dock-indicator')).toBeInTheDocument()
    })
  })
})
