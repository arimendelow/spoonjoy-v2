import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { DockItem } from '~/components/navigation/dock-item'
import { Home, BookOpen, ShoppingCart, User } from 'lucide-react'

// Wrapper component for routing context
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
)

describe('DockItem', () => {
  const defaultProps = {
    icon: Home,
    label: 'Home',
    href: '/',
  }

  describe('rendering', () => {
    it('renders icon and label', () => {
      render(
        <RouterWrapper>
          <DockItem {...defaultProps} />
        </RouterWrapper>
      )
      
      // Should render the label text
      expect(screen.getByText('Home')).toBeInTheDocument()
      
      // Should render an icon (SVG element from Lucide)
      const link = screen.getByRole('link')
      const svg = link.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('renders as a link with correct href', () => {
      render(
        <RouterWrapper>
          <DockItem {...defaultProps} href="/recipes" label="Recipes" />
        </RouterWrapper>
      )
      
      const link = screen.getByRole('link', { name: /recipes/i })
      expect(link).toHaveAttribute('href', '/recipes')
    })

    it('applies custom className', () => {
      render(
        <RouterWrapper>
          <DockItem {...defaultProps} className="custom-class" />
        </RouterWrapper>
      )
      
      const link = screen.getByRole('link')
      expect(link.className).toContain('custom-class')
    })
  })

  describe('touch target', () => {
    it('has minimum touch target of 44px', () => {
      render(
        <RouterWrapper>
          <DockItem {...defaultProps} />
        </RouterWrapper>
      )
      
      const link = screen.getByRole('link')
      // Should have min-h-[44px] and min-w-[44px] or equivalent
      expect(link.className).toMatch(/min-[wh]-\[44px\]|min-[wh]-11/)
    })

    it('touch target is clickable', () => {
      const onClick = vi.fn()
      render(
        <RouterWrapper>
          <DockItem {...defaultProps} onClick={onClick} />
        </RouterWrapper>
      )
      
      const link = screen.getByRole('link')
      fireEvent.click(link)
      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('active state', () => {
    it('visually distinguishes active state', () => {
      const { rerender } = render(
        <RouterWrapper>
          <DockItem {...defaultProps} active={false} />
        </RouterWrapper>
      )
      
      const inactiveLink = screen.getByRole('link')
      const inactiveClass = inactiveLink.className

      rerender(
        <RouterWrapper>
          <DockItem {...defaultProps} active={true} />
        </RouterWrapper>
      )
      
      const activeLink = screen.getByRole('link')
      const activeClass = activeLink.className
      
      // Active and inactive states should have different classes
      expect(activeClass).not.toBe(inactiveClass)
    })

    it('active label has glow effect', () => {
      render(
        <RouterWrapper>
          <DockItem {...defaultProps} active={true} />
        </RouterWrapper>
      )
      
      const label = screen.getByText('Home')
      // Should have text shadow for glow or specific glow class
      expect(label.className).toMatch(/text-white|glow|shadow/)
    })

    it('inactive label has reduced opacity', () => {
      render(
        <RouterWrapper>
          <DockItem {...defaultProps} active={false} />
        </RouterWrapper>
      )
      
      const label = screen.getByText('Home')
      // Should have reduced opacity class
      expect(label.className).toMatch(/text-white\/\d+|opacity-/)
    })
  })

  describe('press state', () => {
    it('has press feedback animation classes', () => {
      render(
        <RouterWrapper>
          <DockItem {...defaultProps} />
        </RouterWrapper>
      )
      
      const link = screen.getByRole('link')
      // Should have transition and active:scale classes for press feedback
      expect(link.className).toMatch(/active:scale|transition/)
    })
  })

  describe('liquid glass label styling', () => {
    it('has small font size', () => {
      render(
        <RouterWrapper>
          <DockItem {...defaultProps} />
        </RouterWrapper>
      )
      
      const label = screen.getByText('Home')
      // Should have text-xs or text-[10px] or similar
      expect(label.className).toMatch(/text-\[?\d+px\]?|text-xs/)
    })

    it('has letter spacing', () => {
      render(
        <RouterWrapper>
          <DockItem {...defaultProps} />
        </RouterWrapper>
      )
      
      const label = screen.getByText('Home')
      // Should have tracking-wide or similar
      expect(label.className).toMatch(/tracking-/)
    })
  })

  describe('different icons', () => {
    it('renders with BookOpen icon', () => {
      render(
        <RouterWrapper>
          <DockItem icon={BookOpen} label="Recipes" href="/recipes" />
        </RouterWrapper>
      )
      
      expect(screen.getByText('Recipes')).toBeInTheDocument()
      expect(screen.getByRole('link').querySelector('svg')).toBeInTheDocument()
    })

    it('renders with ShoppingCart icon', () => {
      render(
        <RouterWrapper>
          <DockItem icon={ShoppingCart} label="List" href="/shopping-list" />
        </RouterWrapper>
      )
      
      expect(screen.getByText('List')).toBeInTheDocument()
      expect(screen.getByRole('link').querySelector('svg')).toBeInTheDocument()
    })

    it('renders with User icon', () => {
      render(
        <RouterWrapper>
          <DockItem icon={User} label="Profile" href="/account/settings" />
        </RouterWrapper>
      )
      
      expect(screen.getByText('Profile')).toBeInTheDocument()
      expect(screen.getByRole('link').querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('link has accessible name', () => {
      render(
        <RouterWrapper>
          <DockItem {...defaultProps} />
        </RouterWrapper>
      )
      
      // Link should be findable by its label text
      expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
    })
  })
})
