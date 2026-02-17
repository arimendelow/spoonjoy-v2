import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { MobileNav } from '~/components/navigation/mobile-nav'
import { DockContextProvider, DockContext, type DockAction } from '~/components/navigation'
import { ArrowLeft, Edit, Share2, Trash2 } from 'lucide-react'

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

  it('marks Home as active on home route (/)', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <MobileNav isAuthenticated={false} />
      </MemoryRouter>
    )

    // Find the Home nav item by its text label (not the center logo)
    const homeItem = screen.getByText('Home').closest('a')
    expect(homeItem?.className).toContain('dock-item-active')
  })

  it('does not mark Home as active on other routes', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <MobileNav isAuthenticated={false} />
      </MemoryRouter>
    )

    // Find the Home nav item by its text label (not the center logo)
    const homeItem = screen.getByText('Home').closest('a')
    expect(homeItem?.className).not.toContain('dock-item-active')
  })

  it('marks Login as active on /login route', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <MobileNav isAuthenticated={false} />
      </MemoryRouter>
    )

    const loginItem = screen.getByRole('link', { name: /login/i })
    expect(loginItem.className).toContain('dock-item-active')
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

  describe('contextual actions via useDockContext', () => {
    it('renders default nav items when context has no actions', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <DockContextProvider>
            <MobileNav />
          </DockContextProvider>
        </MemoryRouter>
      )

      // Default authenticated nav items should be present
      expect(screen.getByText('Recipes')).toBeInTheDocument()
      expect(screen.getByText('Cookbooks')).toBeInTheDocument()
      expect(screen.getByText('List')).toBeInTheDocument()
      expect(screen.getByText('Profile')).toBeInTheDocument()
    })

    it('renders contextual actions when context has actions (isContextual=true)', () => {
      const actions: DockAction[] = [
        { id: 'back', icon: ArrowLeft, label: 'Back', onAction: '/recipes', position: 'left' },
        { id: 'edit', icon: Edit, label: 'Edit', onAction: () => {}, position: 'right' },
      ]

      render(
        <MemoryRouter initialEntries={['/recipes/123']}>
          <DockContext.Provider value={{ actions, setActions: () => {}, isContextual: true }}>
            <MobileNav />
          </DockContext.Provider>
        </MemoryRouter>
      )

      // Contextual actions should be present
      expect(screen.getByText('Back')).toBeInTheDocument()
      expect(screen.getByText('Edit')).toBeInTheDocument()

      // Default nav items should NOT be present
      expect(screen.queryByText('Recipes')).not.toBeInTheDocument()
      expect(screen.queryByText('Cookbooks')).not.toBeInTheDocument()
      expect(screen.queryByText('List')).not.toBeInTheDocument()
      expect(screen.queryByText('Profile')).not.toBeInTheDocument()
    })

    it('renders left-position actions on left side of dock', () => {
      const actions: DockAction[] = [
        { id: 'back', icon: ArrowLeft, label: 'Back', onAction: '/recipes', position: 'left' },
        { id: 'share', icon: Share2, label: 'Share', onAction: () => {}, position: 'left' },
        { id: 'edit', icon: Edit, label: 'Edit', onAction: () => {}, position: 'right' },
      ]

      render(
        <MemoryRouter initialEntries={['/recipes/123']}>
          <DockContext.Provider value={{ actions, setActions: () => {}, isContextual: true }}>
            <MobileNav />
          </DockContext.Provider>
        </MemoryRouter>
      )

      const nav = screen.getByRole('navigation')
      const center = screen.getByTestId('dock-center')
      const backElement = screen.getByText('Back').closest('a, button')
      const shareElement = screen.getByText('Share').closest('a, button')

      // Back and Share should appear before center in DOM order
      expect(backElement).toBeInTheDocument()
      expect(shareElement).toBeInTheDocument()

      // Verify left items are before center
      const allElements = nav.querySelectorAll('a, button, [data-testid="dock-center"]')
      const elementsArray = Array.from(allElements)
      const centerIndex = elementsArray.findIndex(el => el.getAttribute('data-testid') === 'dock-center')
      const backIndex = elementsArray.indexOf(backElement as Element)
      const shareIndex = elementsArray.indexOf(shareElement as Element)

      expect(backIndex).toBeLessThan(centerIndex)
      expect(shareIndex).toBeLessThan(centerIndex)
    })

    it('renders right-position actions on right side of dock', () => {
      const actions: DockAction[] = [
        { id: 'back', icon: ArrowLeft, label: 'Back', onAction: '/recipes', position: 'left' },
        { id: 'edit', icon: Edit, label: 'Edit', onAction: () => {}, position: 'right' },
        { id: 'delete', icon: Trash2, label: 'Delete', onAction: () => {}, position: 'right' },
      ]

      render(
        <MemoryRouter initialEntries={['/recipes/123']}>
          <DockContext.Provider value={{ actions, setActions: () => {}, isContextual: true }}>
            <MobileNav />
          </DockContext.Provider>
        </MemoryRouter>
      )

      const nav = screen.getByRole('navigation')
      const editElement = screen.getByText('Edit').closest('a, button')
      const deleteElement = screen.getByText('Delete').closest('a, button')

      expect(editElement).toBeInTheDocument()
      expect(deleteElement).toBeInTheDocument()

      // Verify right items are after center
      const allElements = nav.querySelectorAll('a, button, [data-testid="dock-center"]')
      const elementsArray = Array.from(allElements)
      const centerIndex = elementsArray.findIndex(el => el.getAttribute('data-testid') === 'dock-center')
      const editIndex = elementsArray.indexOf(editElement as Element)
      const deleteIndex = elementsArray.indexOf(deleteElement as Element)

      expect(editIndex).toBeGreaterThan(centerIndex)
      expect(deleteIndex).toBeGreaterThan(centerIndex)
    })

    it('renders center logo regardless of context state', () => {
      const actions: DockAction[] = [
        { id: 'back', icon: ArrowLeft, label: 'Back', onAction: '/recipes', position: 'left' },
        { id: 'edit', icon: Edit, label: 'Edit', onAction: () => {}, position: 'right' },
      ]

      // With contextual actions
      const { unmount } = render(
        <MemoryRouter initialEntries={['/recipes/123']}>
          <DockContext.Provider value={{ actions, setActions: () => {}, isContextual: true }}>
            <MobileNav />
          </DockContext.Provider>
        </MemoryRouter>
      )
      expect(screen.getByTestId('dock-center')).toBeInTheDocument()
      unmount()

      // Without contextual actions
      render(
        <MemoryRouter initialEntries={['/']}>
          <DockContext.Provider value={{ actions: null, setActions: () => {}, isContextual: false }}>
            <MobileNav />
          </DockContext.Provider>
        </MemoryRouter>
      )
      expect(screen.getByTestId('dock-center')).toBeInTheDocument()
    })

    it('calls onAction function when action is clicked', async () => {
      const user = userEvent.setup()
      const handleEdit = vi.fn()
      const actions: DockAction[] = [
        { id: 'back', icon: ArrowLeft, label: 'Back', onAction: '/recipes', position: 'left' },
        { id: 'edit', icon: Edit, label: 'Edit', onAction: handleEdit, position: 'right' },
      ]

      render(
        <MemoryRouter initialEntries={['/recipes/123']}>
          <DockContext.Provider value={{ actions, setActions: () => {}, isContextual: true }}>
            <MobileNav />
          </DockContext.Provider>
        </MemoryRouter>
      )

      const editButton = screen.getByText('Edit').closest('a, button')!
      await user.click(editButton)

      expect(handleEdit).toHaveBeenCalledTimes(1)
    })

    it('navigates to href when onAction is a string', () => {
      const actions: DockAction[] = [
        { id: 'back', icon: ArrowLeft, label: 'Back', onAction: '/recipes', position: 'left' },
        { id: 'edit', icon: Edit, label: 'Edit', onAction: () => {}, position: 'right' },
      ]

      render(
        <MemoryRouter initialEntries={['/recipes/123']}>
          <DockContext.Provider value={{ actions, setActions: () => {}, isContextual: true }}>
            <MobileNav />
          </DockContext.Provider>
        </MemoryRouter>
      )

      const backLink = screen.getByText('Back').closest('a')
      expect(backLink).toHaveAttribute('href', '/recipes')
    })

    it('falls back to default nav when context is cleared', () => {
      const setActions = vi.fn()
      const actions: DockAction[] = [
        { id: 'back', icon: ArrowLeft, label: 'Back', onAction: '/recipes', position: 'left' },
        { id: 'edit', icon: Edit, label: 'Edit', onAction: () => {}, position: 'right' },
      ]

      const { rerender } = render(
        <MemoryRouter initialEntries={['/recipes/123']}>
          <DockContext.Provider value={{ actions, setActions, isContextual: true }}>
            <MobileNav />
          </DockContext.Provider>
        </MemoryRouter>
      )

      // Initially showing contextual actions
      expect(screen.getByText('Back')).toBeInTheDocument()
      expect(screen.queryByText('Recipes')).not.toBeInTheDocument()

      // Rerender with cleared context
      rerender(
        <MemoryRouter initialEntries={['/recipes/123']}>
          <DockContext.Provider value={{ actions: null, setActions, isContextual: false }}>
            <MobileNav />
          </DockContext.Provider>
        </MemoryRouter>
      )

      // Should now show default nav items
      expect(screen.queryByText('Back')).not.toBeInTheDocument()
      expect(screen.getByText('Recipes')).toBeInTheDocument()
      expect(screen.getByText('Cookbooks')).toBeInTheDocument()
      expect(screen.getByText('List')).toBeInTheDocument()
      expect(screen.getByText('Profile')).toBeInTheDocument()
    })

    it('renders left item with function onAction as button', async () => {
      const user = userEvent.setup()
      const handleShare = vi.fn()
      const actions: DockAction[] = [
        { id: 'share', icon: Share2, label: 'Share', onAction: handleShare, position: 'left' },
        { id: 'edit', icon: Edit, label: 'Edit', onAction: () => {}, position: 'right' },
      ]

      render(
        <MemoryRouter initialEntries={['/recipes/123']}>
          <DockContext.Provider value={{ actions, setActions: () => {}, isContextual: true }}>
            <MobileNav />
          </DockContext.Provider>
        </MemoryRouter>
      )

      const shareButton = screen.getByRole('button', { name: /share/i })
      expect(shareButton).toBeInTheDocument()

      await user.click(shareButton)
      expect(handleShare).toHaveBeenCalledTimes(1)
    })

    it('renders right item with string onAction as navigation link', () => {
      const actions: DockAction[] = [
        { id: 'back', icon: ArrowLeft, label: 'Back', onAction: '/recipes', position: 'left' },
        { id: 'details', icon: Edit, label: 'Details', onAction: '/recipes/123/details', position: 'right' },
      ]

      render(
        <MemoryRouter initialEntries={['/recipes/123']}>
          <DockContext.Provider value={{ actions, setActions: () => {}, isContextual: true }}>
            <MobileNav />
          </DockContext.Provider>
        </MemoryRouter>
      )

      const detailsLink = screen.getByText('Details').closest('a')
      expect(detailsLink).toBeInTheDocument()
      expect(detailsLink).toHaveAttribute('href', '/recipes/123/details')
    })

    it('handles null actions when isContextual is true', () => {
      render(
        <MemoryRouter initialEntries={['/recipes/123']}>
          <DockContext.Provider value={{ actions: null, setActions: () => {}, isContextual: true }}>
            <MobileNav />
          </DockContext.Provider>
        </MemoryRouter>
      )

      // Should render only center logo, no left/right items
      expect(screen.getByTestId('dock-center')).toBeInTheDocument()
      expect(screen.queryByText('Recipes')).not.toBeInTheDocument()
      expect(screen.queryByText('Back')).not.toBeInTheDocument()
    })
  })
})
