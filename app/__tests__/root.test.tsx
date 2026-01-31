import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

// Mock framer-motion
vi.mock('motion/react', () => ({
  motion: {
    span: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <span {...props}>{children}</span>
    ),
  },
  LayoutGroup: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

import { StackedLayout } from '~/components/ui/stacked-layout'
import { MobileNav } from '~/components/navigation/mobile-nav'
import { ThemeProvider } from '~/components/ui/theme-provider'

/**
 * Test component that simulates the root layout structure
 * This mirrors what root.tsx renders for different auth states
 */
function RootLayoutSimulation({ userId }: { userId: string | null }) {
  const isAuthenticated = !!userId

  return (
    <ThemeProvider>
      <StackedLayout
        navbar={<nav data-testid="desktop-navbar">Desktop Navbar</nav>}
        sidebar={<nav data-testid="sidebar">Sidebar</nav>}
      >
        {/* Main content with bottom padding for mobile dock */}
        <div className="pb-20 lg:pb-0" data-testid="content-wrapper">
          <div data-testid="outlet">Page Content</div>
        </div>
      </StackedLayout>
      {/* Mobile navigation dock */}
      <MobileNav isAuthenticated={isAuthenticated} />
    </ThemeProvider>
  )
}

/**
 * Test component that simulates CURRENT root.tsx behavior
 * (only shows MobileNav for authenticated users)
 */
function CurrentRootLayoutBehavior({ userId }: { userId: string | null }) {
  return (
    <ThemeProvider>
      <StackedLayout
        navbar={<nav data-testid="desktop-navbar">Desktop Navbar</nav>}
        sidebar={<nav data-testid="sidebar">Sidebar</nav>}
      >
        {/* Main content with bottom padding for mobile dock */}
        <div className="pb-20 lg:pb-0" data-testid="content-wrapper">
          <div data-testid="outlet">Page Content</div>
        </div>
      </StackedLayout>
      {/* Current behavior: MobileNav only for authenticated users */}
      {userId && <MobileNav />}
    </ThemeProvider>
  )
}

describe('Root layout responsive behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('SpoonDock (MobileNav) rendering', () => {
    it('renders SpoonDock on mobile for authenticated users', () => {
      render(
        <MemoryRouter>
          <CurrentRootLayoutBehavior userId="test-user" />
        </MemoryRouter>
      )

      // SpoonDock should be present for authenticated users
      // MobileNav wraps SpoonDock which has role="navigation" and lg:hidden class
      const navigations = screen.getAllByRole('navigation')
      const mobileNav = navigations.find(nav => nav.className.includes('lg:hidden'))
      expect(mobileNav).toBeInTheDocument()
    })

    it('renders SpoonDock on mobile for unauthenticated users', () => {
      render(
        <MemoryRouter>
          <CurrentRootLayoutBehavior userId={null} />
        </MemoryRouter>
      )

      // SpoonDock should also be present for unauthenticated users
      // This test should FAIL initially because current root.tsx only renders MobileNav for authenticated users
      const navigations = screen.getAllByRole('navigation')
      const mobileNav = navigations.find(nav => nav.className.includes('lg:hidden'))
      expect(mobileNav).toBeInTheDocument()
    })

    it('shows authenticated nav items in SpoonDock for authenticated users', () => {
      render(
        <MemoryRouter>
          <CurrentRootLayoutBehavior userId="test-user" />
        </MemoryRouter>
      )

      // Authenticated users should see Recipes, Cookbooks, List, Profile
      expect(screen.getByText('Recipes')).toBeInTheDocument()
      expect(screen.getByText('Cookbooks')).toBeInTheDocument()
      expect(screen.getByText('List')).toBeInTheDocument()
      expect(screen.getByText('Profile')).toBeInTheDocument()
    })

    it('shows unauthenticated nav items in SpoonDock for unauthenticated users', () => {
      render(
        <MemoryRouter>
          <CurrentRootLayoutBehavior userId={null} />
        </MemoryRouter>
      )

      // Unauthenticated users should see Home and Login in the SpoonDock
      // This test should FAIL initially because current behavior only shows MobileNav for authenticated
      const navigations = screen.getAllByRole('navigation')
      const mobileNav = navigations.find(nav => nav.className.includes('lg:hidden'))

      // MobileNav with isAuthenticated=false shows Home and Login
      expect(mobileNav).toBeInTheDocument()
      // Check for the nav items specific to unauthenticated users
      expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument()
    })
  })

  describe('StackedLayout navbar visibility', () => {
    it('navbar is hidden on mobile (hamburger menu wrapper has lg:hidden)', () => {
      render(
        <MemoryRouter>
          <CurrentRootLayoutBehavior userId="test-user" />
        </MemoryRouter>
      )

      // The hamburger menu button wrapper in StackedLayout has lg:hidden class
      // This means on mobile, only the hamburger is shown, not the full navbar
      const openNavButton = screen.getByRole('button', { name: 'Open navigation' })
      const buttonWrapper = openNavButton.closest('.lg\\:hidden')
      expect(buttonWrapper).toBeInTheDocument()
    })

    it('navbar is visible on desktop (navbar content present)', () => {
      render(
        <MemoryRouter>
          <CurrentRootLayoutBehavior userId="test-user" />
        </MemoryRouter>
      )

      // On desktop, the full navbar should be visible with navigation items
      // The Navbar component is always rendered, just the hamburger wrapper is hidden on desktop
      const header = screen.getByRole('banner')
      expect(header).toBeInTheDocument()

      // Navbar should contain the desktop navbar content
      expect(screen.getByTestId('desktop-navbar')).toBeInTheDocument()
    })
  })

  describe('hamburger menu on mobile', () => {
    it('hamburger menu does NOT render on mobile when SpoonDock is present', () => {
      render(
        <MemoryRouter>
          <CurrentRootLayoutBehavior userId="test-user" />
        </MemoryRouter>
      )

      // Expected behavior: hamburger menu should NOT be shown on mobile
      // because SpoonDock provides the primary mobile navigation
      // The hamburger button has a wrapper with lg:hidden class
      // But we expect it to be completely hidden on mobile (not just responsive)

      // This test should FAIL initially because the current implementation
      // still shows the hamburger menu on mobile
      const openNavButton = screen.queryByRole('button', { name: 'Open navigation' })

      // The hamburger should NOT be present when SpoonDock is the primary mobile nav
      // Currently it exists, so this assertion will fail
      expect(openNavButton).not.toBeInTheDocument()
    })

    it('hamburger menu wrapper has hidden class on mobile (no hamburger for SpoonDock users)', () => {
      const { container } = render(
        <MemoryRouter>
          <CurrentRootLayoutBehavior userId="test-user" />
        </MemoryRouter>
      )

      // The hamburger wrapper should be hidden on mobile when SpoonDock is present
      // Expected: the hamburger wrapper should have 'hidden lg:block' or similar
      // to hide it on mobile but show on desktop (or not render at all)
      const hamburgerWrapper = container.querySelector('.py-2\\.5.lg\\:hidden')

      // This test expects the hamburger wrapper to NOT exist or have 'hidden' class
      // Currently, hamburger exists with lg:hidden (hidden on desktop, visible on mobile)
      // We want the opposite: hidden on mobile when SpoonDock is present
      expect(hamburgerWrapper).toBeNull()
    })
  })

  describe('content bottom padding for SpoonDock clearance', () => {
    it('content has correct bottom padding on mobile for SpoonDock clearance', () => {
      const { container } = render(
        <MemoryRouter>
          <CurrentRootLayoutBehavior userId="test-user" />
        </MemoryRouter>
      )

      // The content wrapper should have pb-20 for mobile to clear the SpoonDock
      // and lg:pb-0 for desktop where SpoonDock is hidden
      const contentWrapper = container.querySelector('.pb-20.lg\\:pb-0')
      expect(contentWrapper).toBeInTheDocument()
    })

    it('content padding wrapper contains the Outlet content', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <CurrentRootLayoutBehavior userId="test-user" />
        </MemoryRouter>
      )

      // The main content area should exist and have the padding classes applied
      const main = screen.getByRole('main')
      expect(main).toBeInTheDocument()
    })
  })

  describe('unauthenticated user navigation', () => {
    it('unauthenticated users see SpoonDock with Home and Login', () => {
      render(
        <MemoryRouter>
          <CurrentRootLayoutBehavior userId={null} />
        </MemoryRouter>
      )

      // For unauthenticated users, SpoonDock should show:
      // - Home (left side)
      // - Center logo (SJ)
      // - Login (right side)

      // This test should FAIL initially because MobileNav is only rendered for authenticated users
      const navigations = screen.getAllByRole('navigation')
      const mobileNav = navigations.find(nav => nav.className.includes('lg:hidden'))
      expect(mobileNav).toBeInTheDocument()

      // Check for dock-center (the SJ logo)
      expect(screen.getByTestId('dock-center')).toBeInTheDocument()
    })

    it('unauthenticated users do NOT see authenticated nav items in SpoonDock', () => {
      render(
        <MemoryRouter>
          <CurrentRootLayoutBehavior userId={null} />
        </MemoryRouter>
      )

      // Unauthenticated users should NOT see Recipes, Cookbooks, List, Profile
      // They should only see Home and Login
      // This test should FAIL initially because MobileNav isn't rendered for unauth users
      expect(screen.queryByText('Recipes')).not.toBeInTheDocument()
      expect(screen.queryByText('Cookbooks')).not.toBeInTheDocument()
      expect(screen.queryByText('List')).not.toBeInTheDocument()
      expect(screen.queryByText('Profile')).not.toBeInTheDocument()
    })
  })
})
