import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { MobileNav } from '~/components/navigation/mobile-nav'

describe('MobileNav unauthenticated variant', () => {
  it('renders unauthenticated variant when isAuthenticated=false', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <MobileNav isAuthenticated={false} />
      </MemoryRouter>
    )

    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('shows Home and Login nav items for unauthenticated users', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <MobileNav isAuthenticated={false} />
      </MemoryRouter>
    )

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Login')).toBeInTheDocument()
    // Should NOT show authenticated items
    expect(screen.queryByText('Recipes')).not.toBeInTheDocument()
    expect(screen.queryByText('Cookbooks')).not.toBeInTheDocument()
    expect(screen.queryByText('List')).not.toBeInTheDocument()
    expect(screen.queryByText('Profile')).not.toBeInTheDocument()
  })

  it('shows SJ logo center', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <MobileNav isAuthenticated={false} />
      </MemoryRouter>
    )

    expect(screen.getByTestId('dock-center')).toBeInTheDocument()
  })

  it('has lg:hidden class for mobile-only', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <MobileNav isAuthenticated={false} />
      </MemoryRouter>
    )

    const nav = screen.getByRole('navigation')
    expect(nav.className).toContain('lg:hidden')
  })
})

describe('MobileNav', () => {
  describe('authenticated variant', () => {
    it('renders SpoonDock navigation', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <MobileNav />
        </MemoryRouter>
      )

      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('renders all navigation items', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <MobileNav />
        </MemoryRouter>
      )

      expect(screen.getByText('Recipes')).toBeInTheDocument()
      expect(screen.getByText('Cookbooks')).toBeInTheDocument()
      expect(screen.getByText('List')).toBeInTheDocument()
      expect(screen.getByText('Profile')).toBeInTheDocument()
    })

    it('renders center logo', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <MobileNav />
        </MemoryRouter>
      )

      expect(screen.getByTestId('dock-center')).toBeInTheDocument()
    })
  })

  describe('route-aware active state', () => {
    it('marks Recipes as active on /recipes', () => {
      render(
        <MemoryRouter initialEntries={['/recipes']}>
          <MobileNav />
        </MemoryRouter>
      )

      const recipesItem = screen.getByRole('link', { name: /recipes/i })
      expect(recipesItem.className).toContain('dock-item-active')
    })

    it('marks Cookbooks as active on /cookbooks', () => {
      render(
        <MemoryRouter initialEntries={['/cookbooks']}>
          <MobileNav />
        </MemoryRouter>
      )

      const cookbooksItem = screen.getByRole('link', { name: /cookbooks/i })
      expect(cookbooksItem.className).toContain('dock-item-active')
    })

    it('marks List as active on /shopping-list', () => {
      render(
        <MemoryRouter initialEntries={['/shopping-list']}>
          <MobileNav />
        </MemoryRouter>
      )

      const listItem = screen.getByRole('link', { name: /list/i })
      expect(listItem.className).toContain('dock-item-active')
    })

    it('marks Profile as active on /account/settings', () => {
      render(
        <MemoryRouter initialEntries={['/account/settings']}>
          <MobileNav />
        </MemoryRouter>
      )

      const profileItem = screen.getByRole('link', { name: /profile/i })
      expect(profileItem.className).toContain('dock-item-active')
    })

    it('handles nested routes', () => {
      render(
        <MemoryRouter initialEntries={['/recipes/123/edit']}>
          <MobileNav />
        </MemoryRouter>
      )

      const recipesItem = screen.getByRole('link', { name: /recipes/i })
      expect(recipesItem.className).toContain('dock-item-active')
    })

    it('has no active item on home (/)', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <MobileNav />
        </MemoryRouter>
      )

      // Regular nav items should not be active on home
      const recipesItem = screen.getByRole('link', { name: /recipes/i })
      expect(recipesItem.className).not.toContain('dock-item-active')
    })
  })
})
