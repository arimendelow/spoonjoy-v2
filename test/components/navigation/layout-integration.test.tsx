import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router'
import { SpoonDock } from '~/components/navigation/spoon-dock'
import { DockItem } from '~/components/navigation/dock-item'
import { DockIndicator } from '~/components/navigation/dock-indicator'
import { DockCenter } from '~/components/navigation/dock-center'
import { BookOpen, Book, ShoppingCart, User } from 'lucide-react'

// Mock useLocation for route-aware testing
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useLocation: vi.fn(),
  }
})

const mockedUseLocation = vi.mocked(useLocation)

// Navigation items configuration
const navItems = [
  { icon: BookOpen, label: 'Recipes', href: '/recipes' },
  { icon: Book, label: 'Cookbooks', href: '/cookbooks' },
  // Center item (DockCenter) goes here
  { icon: ShoppingCart, label: 'List', href: '/shopping-list' },
  { icon: User, label: 'Profile', href: '/account/settings' },
]

/**
 * Assembled SpoonDock component for testing
 * This simulates what would be rendered in the root layout
 */
function AssembledSpoonDock({ currentPath = '/' }: { currentPath?: string }) {
  // Determine active index based on current path
  const getActiveIndex = (path: string) => {
    // Home is center (not in the index)
    if (path === '/') return -1
    
    const leftItems = navItems.slice(0, 2) // Recipes, Cookbooks
    const rightItems = navItems.slice(2) // List, Profile
    
    for (let i = 0; i < leftItems.length; i++) {
      if (path.startsWith(leftItems[i].href)) return i
    }
    
    for (let i = 0; i < rightItems.length; i++) {
      if (path.startsWith(rightItems[i].href)) return i + 3 // +3 to account for center
    }
    
    return -1
  }

  const activeIndex = getActiveIndex(currentPath)
  const leftItems = navItems.slice(0, 2)
  const rightItems = navItems.slice(2)

  return (
    <SpoonDock>
      {/* Left items */}
      {leftItems.map((item, index) => (
        <DockItem
          key={item.href}
          icon={item.icon}
          label={item.label}
          href={item.href}
          active={activeIndex === index}
        />
      ))}
      
      {/* Center logo */}
      <DockCenter href="/" />
      
      {/* Right items */}
      {rightItems.map((item, index) => (
        <DockItem
          key={item.href}
          icon={item.icon}
          label={item.label}
          href={item.href}
          active={activeIndex === index + 3}
        />
      ))}
    </SpoonDock>
  )
}

describe('SpoonDock Layout Integration', () => {
  beforeEach(() => {
    mockedUseLocation.mockReturnValue({ pathname: '/', search: '', hash: '', state: null, key: 'default' })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('dock rendering in layout', () => {
    it('renders SpoonDock with all items', () => {
      render(
        <MemoryRouter>
          <AssembledSpoonDock />
        </MemoryRouter>
      )

      // Should render navigation
      expect(screen.getByRole('navigation')).toBeInTheDocument()

      // Should render all nav items
      expect(screen.getByText('Recipes')).toBeInTheDocument()
      expect(screen.getByText('Cookbooks')).toBeInTheDocument()
      expect(screen.getByText('List')).toBeInTheDocument()
      expect(screen.getByText('Profile')).toBeInTheDocument()

      // Should render center logo
      expect(screen.getByTestId('dock-center')).toBeInTheDocument()
    })

    it('renders DockCenter with home link', () => {
      render(
        <MemoryRouter>
          <AssembledSpoonDock />
        </MemoryRouter>
      )

      const homeLink = screen.getByRole('link', { name: /home|spoonjoy|logo/i })
      expect(homeLink).toHaveAttribute('href', '/')
    })

    it('renders nav items as links', () => {
      render(
        <MemoryRouter>
          <AssembledSpoonDock />
        </MemoryRouter>
      )

      expect(screen.getByRole('link', { name: /recipes/i })).toHaveAttribute('href', '/recipes')
      expect(screen.getByRole('link', { name: /cookbooks/i })).toHaveAttribute('href', '/cookbooks')
      expect(screen.getByRole('link', { name: /list/i })).toHaveAttribute('href', '/shopping-list')
      expect(screen.getByRole('link', { name: /profile/i })).toHaveAttribute('href', '/account/settings')
    })
  })

  describe('route-aware active state', () => {
    it('marks Recipes as active on /recipes', () => {
      render(
        <MemoryRouter initialEntries={['/recipes']}>
          <AssembledSpoonDock currentPath="/recipes" />
        </MemoryRouter>
      )

      const recipesItem = screen.getByRole('link', { name: /recipes/i })
      expect(recipesItem.className).toContain('dock-item-active')
    })

    it('marks Cookbooks as active on /cookbooks', () => {
      render(
        <MemoryRouter initialEntries={['/cookbooks']}>
          <AssembledSpoonDock currentPath="/cookbooks" />
        </MemoryRouter>
      )

      const cookbooksItem = screen.getByRole('link', { name: /cookbooks/i })
      expect(cookbooksItem.className).toContain('dock-item-active')
    })

    it('marks List as active on /shopping-list', () => {
      render(
        <MemoryRouter initialEntries={['/shopping-list']}>
          <AssembledSpoonDock currentPath="/shopping-list" />
        </MemoryRouter>
      )

      const listItem = screen.getByRole('link', { name: /list/i })
      expect(listItem.className).toContain('dock-item-active')
    })

    it('marks Profile as active on /account/settings', () => {
      render(
        <MemoryRouter initialEntries={['/account/settings']}>
          <AssembledSpoonDock currentPath="/account/settings" />
        </MemoryRouter>
      )

      const profileItem = screen.getByRole('link', { name: /profile/i })
      expect(profileItem.className).toContain('dock-item-active')
    })

    it('no item is active on home (/)', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <AssembledSpoonDock currentPath="/" />
        </MemoryRouter>
      )

      // No dock-item-active class on any nav item
      const links = screen.getAllByRole('link')
      const activeLinks = links.filter(link => link.className.includes('dock-item-active'))
      // Only the home link (center) might have special styling, but regular items should not
      expect(activeLinks.filter(l => !l.getAttribute('aria-label')?.includes('home'))).toHaveLength(0)
    })

    it('handles nested routes (e.g., /recipes/123)', () => {
      render(
        <MemoryRouter initialEntries={['/recipes/123']}>
          <AssembledSpoonDock currentPath="/recipes/123" />
        </MemoryRouter>
      )

      const recipesItem = screen.getByRole('link', { name: /recipes/i })
      expect(recipesItem.className).toContain('dock-item-active')
    })
  })

  describe('responsive behavior', () => {
    it('dock has lg:hidden class for desktop hiding', () => {
      render(
        <MemoryRouter>
          <AssembledSpoonDock />
        </MemoryRouter>
      )

      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('lg:hidden')
    })
  })

  describe('bottom padding compatibility', () => {
    it('dock has z-50 to float above content', () => {
      render(
        <MemoryRouter>
          <AssembledSpoonDock />
        </MemoryRouter>
      )

      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('z-50')
    })
  })
})
