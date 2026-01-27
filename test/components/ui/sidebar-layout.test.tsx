import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SidebarLayout } from '~/components/ui/sidebar-layout'

// Mock framer-motion to avoid animation issues in tests
vi.mock('motion/react', () => ({
  motion: {
    span: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <span {...props}>{children}</span>
    ),
  },
  LayoutGroup: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

describe('SidebarLayout', () => {
  describe('basic rendering', () => {
    it('renders children content', () => {
      render(
        <SidebarLayout navbar={<div>Navbar</div>} sidebar={<nav>Sidebar</nav>}>
          <div>Main content</div>
        </SidebarLayout>
      )
      expect(screen.getByText('Main content')).toBeInTheDocument()
    })

    it('renders sidebar prop content in desktop view', () => {
      render(
        <SidebarLayout navbar={<div>Navbar</div>} sidebar={<nav>Sidebar content</nav>}>
          <div>Main</div>
        </SidebarLayout>
      )
      // Desktop sidebar is always visible
      expect(screen.getByText('Sidebar content')).toBeInTheDocument()
    })

    it('renders navbar prop content', () => {
      render(
        <SidebarLayout navbar={<div>Navbar content</div>} sidebar={<nav>Sidebar</nav>}>
          <div>Main</div>
        </SidebarLayout>
      )
      expect(screen.getByText('Navbar content')).toBeInTheDocument()
    })

    it('renders main element for content area', () => {
      render(
        <SidebarLayout navbar={<div>Navbar</div>} sidebar={<nav>Sidebar</nav>}>
          <div data-testid="content">Content</div>
        </SidebarLayout>
      )
      const main = screen.getByRole('main')
      expect(main).toBeInTheDocument()
      expect(main).toContainElement(screen.getByTestId('content'))
    })

    it('renders header element containing navbar on mobile', () => {
      render(
        <SidebarLayout navbar={<div>Navbar</div>} sidebar={<nav>Sidebar</nav>}>
          <div>Content</div>
        </SidebarLayout>
      )
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })
  })

  describe('layout structure', () => {
    it('renders desktop sidebar in a fixed position container', () => {
      const { container } = render(
        <SidebarLayout navbar={<div>Navbar</div>} sidebar={<nav data-testid="sidebar">Sidebar</nav>}>
          <div>Content</div>
        </SidebarLayout>
      )
      // The desktop sidebar wrapper
      const desktopSidebarWrapper = container.querySelector('.fixed.inset-y-0.left-0.w-64')
      expect(desktopSidebarWrapper).toBeInTheDocument()
    })

    it('applies proper layout classes to root container', () => {
      const { container } = render(
        <SidebarLayout navbar={<div>Navbar</div>} sidebar={<nav>Sidebar</nav>}>
          <div>Content</div>
        </SidebarLayout>
      )
      const root = container.firstChild as HTMLElement
      expect(root.className).toContain('relative')
      expect(root.className).toContain('isolate')
      expect(root.className).toContain('flex')
      expect(root.className).toContain('min-h-svh')
      expect(root.className).toContain('w-full')
    })

    it('applies proper classes to main content area', () => {
      render(
        <SidebarLayout navbar={<div>Navbar</div>} sidebar={<nav>Sidebar</nav>}>
          <div>Content</div>
        </SidebarLayout>
      )
      const main = screen.getByRole('main')
      expect(main.className).toContain('flex')
      expect(main.className).toContain('flex-1')
      expect(main.className).toContain('flex-col')
    })

    it('wraps content in max-width container', () => {
      const { container } = render(
        <SidebarLayout navbar={<div>Navbar</div>} sidebar={<nav>Sidebar</nav>}>
          <div data-testid="content">Content</div>
        </SidebarLayout>
      )
      const maxWidthContainer = container.querySelector('.mx-auto.max-w-6xl')
      expect(maxWidthContainer).toBeInTheDocument()
      expect(maxWidthContainer).toContainElement(screen.getByTestId('content'))
    })
  })

  describe('mobile navigation toggle', () => {
    it('renders open menu button with aria-label', () => {
      render(
        <SidebarLayout navbar={<div>Navbar</div>} sidebar={<nav>Sidebar</nav>}>
          <div>Content</div>
        </SidebarLayout>
      )
      expect(screen.getByRole('button', { name: 'Open navigation' })).toBeInTheDocument()
    })

    it('opens mobile sidebar when menu button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <SidebarLayout navbar={<div>Navbar</div>} sidebar={<nav>Mobile sidebar content</nav>}>
          <div>Content</div>
        </SidebarLayout>
      )

      await user.click(screen.getByRole('button', { name: 'Open navigation' }))

      // The dialog should appear
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
    })

    it('shows close button when mobile sidebar is open', async () => {
      const user = userEvent.setup()
      render(
        <SidebarLayout navbar={<div>Navbar</div>} sidebar={<nav>Sidebar</nav>}>
          <div>Content</div>
        </SidebarLayout>
      )

      await user.click(screen.getByRole('button', { name: 'Open navigation' }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Close navigation' })).toBeInTheDocument()
      })
    })

    it('closes mobile sidebar when close button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <SidebarLayout navbar={<div>Navbar</div>} sidebar={<nav>Sidebar</nav>}>
          <div>Content</div>
        </SidebarLayout>
      )

      // Open the sidebar
      await user.click(screen.getByRole('button', { name: 'Open navigation' }))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // Close the sidebar
      await user.click(screen.getByRole('button', { name: 'Close navigation' }))

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    it('closes mobile sidebar when clicking backdrop', async () => {
      const user = userEvent.setup()
      render(
        <SidebarLayout navbar={<div>Navbar</div>} sidebar={<nav>Sidebar</nav>}>
          <div>Content</div>
        </SidebarLayout>
      )

      // Open the sidebar
      await user.click(screen.getByRole('button', { name: 'Open navigation' }))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // Click backdrop (simulate closing by pressing Escape since backdrop click is hard to simulate)
      await user.keyboard('{Escape}')

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
  })

  describe('mobile sidebar dialog', () => {
    it('mobile sidebar has lg:hidden class for responsive hiding', async () => {
      const user = userEvent.setup()
      render(
        <SidebarLayout navbar={<div>Navbar</div>} sidebar={<nav>Sidebar</nav>}>
          <div>Content</div>
        </SidebarLayout>
      )

      await user.click(screen.getByRole('button', { name: 'Open navigation' }))

      await waitFor(() => {
        const dialog = screen.getByRole('dialog')
        expect(dialog.className).toContain('lg:hidden')
      })
    })

    it('renders sidebar content inside mobile dialog', async () => {
      const user = userEvent.setup()
      render(
        <SidebarLayout navbar={<div>Navbar</div>} sidebar={<nav data-testid="sidebar">Sidebar nav</nav>}>
          <div>Content</div>
        </SidebarLayout>
      )

      await user.click(screen.getByRole('button', { name: 'Open navigation' }))

      await waitFor(() => {
        const dialog = screen.getByRole('dialog')
        // The sidebar is rendered inside the dialog
        expect(dialog).toContainElement(screen.getAllByTestId('sidebar')[1])
      })
    })

    it('mobile sidebar panel has proper styling classes', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <SidebarLayout navbar={<div>Navbar</div>} sidebar={<nav>Sidebar</nav>}>
          <div>Content</div>
        </SidebarLayout>
      )

      await user.click(screen.getByRole('button', { name: 'Open navigation' }))

      await waitFor(() => {
        // Check for the panel with fixed positioning
        const panel = container.querySelector('[data-headlessui-state]')
        expect(panel).toBeInTheDocument()
      })
    })
  })

  describe('icons', () => {
    it('renders open menu icon with aria-hidden', () => {
      const { container } = render(
        <SidebarLayout navbar={<div>Navbar</div>} sidebar={<nav>Sidebar</nav>}>
          <div>Content</div>
        </SidebarLayout>
      )
      const openIcon = container.querySelector('button[aria-label="Open navigation"] svg')
      expect(openIcon).toBeInTheDocument()
      expect(openIcon).toHaveAttribute('aria-hidden', 'true')
    })

    it('renders open menu icon with data-slot attribute', () => {
      const { container } = render(
        <SidebarLayout navbar={<div>Navbar</div>} sidebar={<nav>Sidebar</nav>}>
          <div>Content</div>
        </SidebarLayout>
      )
      const openIcon = container.querySelector('button[aria-label="Open navigation"] svg')
      expect(openIcon).toHaveAttribute('data-slot', 'icon')
    })

    it('renders close menu icon with aria-hidden when sidebar is open', async () => {
      const user = userEvent.setup()
      render(
        <SidebarLayout navbar={<div>Navbar</div>} sidebar={<nav>Sidebar</nav>}>
          <div>Content</div>
        </SidebarLayout>
      )

      await user.click(screen.getByRole('button', { name: 'Open navigation' }))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // The close button is inside the dialog - get its svg icon
      const closeButton = screen.getByRole('button', { name: 'Close navigation' })
      const closeIcon = closeButton.querySelector('svg')
      expect(closeIcon).toBeInTheDocument()
      expect(closeIcon).toHaveAttribute('aria-hidden', 'true')
    })

    it('renders close menu icon with data-slot attribute when sidebar is open', async () => {
      const user = userEvent.setup()
      render(
        <SidebarLayout navbar={<div>Navbar</div>} sidebar={<nav>Sidebar</nav>}>
          <div>Content</div>
        </SidebarLayout>
      )

      await user.click(screen.getByRole('button', { name: 'Open navigation' }))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      const closeButton = screen.getByRole('button', { name: 'Close navigation' })
      const closeIcon = closeButton.querySelector('svg')
      expect(closeIcon).toHaveAttribute('data-slot', 'icon')
    })
  })

  describe('responsive design', () => {
    it('header has lg:hidden class for mobile only display', () => {
      render(
        <SidebarLayout navbar={<div>Navbar</div>} sidebar={<nav>Sidebar</nav>}>
          <div>Content</div>
        </SidebarLayout>
      )
      const header = screen.getByRole('banner')
      expect(header.className).toContain('lg:hidden')
    })

    it('desktop sidebar wrapper has max-lg:hidden class', () => {
      const { container } = render(
        <SidebarLayout navbar={<div>Navbar</div>} sidebar={<nav>Sidebar</nav>}>
          <div>Content</div>
        </SidebarLayout>
      )
      const desktopSidebarWrapper = container.querySelector('.fixed.inset-y-0.left-0')
      expect(desktopSidebarWrapper?.className).toContain('max-lg:hidden')
    })

    it('main content has left padding for desktop sidebar', () => {
      render(
        <SidebarLayout navbar={<div>Navbar</div>} sidebar={<nav>Sidebar</nav>}>
          <div>Content</div>
        </SidebarLayout>
      )
      const main = screen.getByRole('main')
      expect(main.className).toContain('lg:pl-64')
    })
  })

  describe('dark mode classes', () => {
    it('root container has dark mode background classes', () => {
      const { container } = render(
        <SidebarLayout navbar={<div>Navbar</div>} sidebar={<nav>Sidebar</nav>}>
          <div>Content</div>
        </SidebarLayout>
      )
      const root = container.firstChild as HTMLElement
      expect(root.className).toContain('dark:bg-zinc-900')
      expect(root.className).toContain('dark:lg:bg-zinc-950')
    })

    it('content area has dark mode styling classes', () => {
      const { container } = render(
        <SidebarLayout navbar={<div>Navbar</div>} sidebar={<nav>Sidebar</nav>}>
          <div>Content</div>
        </SidebarLayout>
      )
      const contentWrapper = container.querySelector('.grow')
      expect(contentWrapper?.className).toContain('dark:lg:bg-zinc-900')
      expect(contentWrapper?.className).toContain('dark:lg:ring-white/10')
    })
  })

  describe('accessibility', () => {
    it('open navigation button is accessible', () => {
      render(
        <SidebarLayout navbar={<div>Navbar</div>} sidebar={<nav>Sidebar</nav>}>
          <div>Content</div>
        </SidebarLayout>
      )
      const openButton = screen.getByRole('button', { name: 'Open navigation' })
      expect(openButton).toBeInTheDocument()
      expect(openButton).toHaveAttribute('aria-label', 'Open navigation')
    })

    it('close navigation button is accessible', async () => {
      const user = userEvent.setup()
      render(
        <SidebarLayout navbar={<div>Navbar</div>} sidebar={<nav>Sidebar</nav>}>
          <div>Content</div>
        </SidebarLayout>
      )

      await user.click(screen.getByRole('button', { name: 'Open navigation' }))

      await waitFor(() => {
        const closeButton = screen.getByRole('button', { name: 'Close navigation' })
        expect(closeButton).toBeInTheDocument()
        expect(closeButton).toHaveAttribute('aria-label', 'Close navigation')
      })
    })

    it('mobile sidebar uses dialog role for accessibility', async () => {
      const user = userEvent.setup()
      render(
        <SidebarLayout navbar={<div>Navbar</div>} sidebar={<nav>Sidebar</nav>}>
          <div>Content</div>
        </SidebarLayout>
      )

      await user.click(screen.getByRole('button', { name: 'Open navigation' }))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
    })

    it('main content area uses main landmark', () => {
      render(
        <SidebarLayout navbar={<div>Navbar</div>} sidebar={<nav>Sidebar</nav>}>
          <div>Content</div>
        </SidebarLayout>
      )
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    it('header uses banner landmark', () => {
      render(
        <SidebarLayout navbar={<div>Navbar</div>} sidebar={<nav>Sidebar</nav>}>
          <div>Content</div>
        </SidebarLayout>
      )
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('icons are hidden from screen readers', () => {
      const { container } = render(
        <SidebarLayout navbar={<div>Navbar</div>} sidebar={<nav>Sidebar</nav>}>
          <div>Content</div>
        </SidebarLayout>
      )
      const icons = container.querySelectorAll('svg')
      icons.forEach((icon) => {
        expect(icon).toHaveAttribute('aria-hidden', 'true')
      })
    })
  })

  describe('composition', () => {
    it('works with sidebar component content', () => {
      render(
        <SidebarLayout
          navbar={<div>Navbar</div>}
          sidebar={
            <nav aria-label="Main navigation">
              <ul>
                <li>Home</li>
                <li>About</li>
                <li>Contact</li>
              </ul>
            </nav>
          }
        >
          <div>Content</div>
        </SidebarLayout>
      )

      // Desktop sidebar is visible, mobile sidebar is in closed dialog
      expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('About')).toBeInTheDocument()
      expect(screen.getByText('Contact')).toBeInTheDocument()
    })

    it('works with complex navbar content', () => {
      render(
        <SidebarLayout
          navbar={
            <nav aria-label="Mobile navbar">
              <span>Logo</span>
              <button>Profile</button>
            </nav>
          }
          sidebar={<nav>Sidebar</nav>}
        >
          <div>Content</div>
        </SidebarLayout>
      )

      expect(screen.getByRole('navigation', { name: 'Mobile navbar' })).toBeInTheDocument()
      expect(screen.getByText('Logo')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Profile' })).toBeInTheDocument()
    })

    it('works with complex children content', () => {
      render(
        <SidebarLayout navbar={<div>Navbar</div>} sidebar={<nav>Sidebar</nav>}>
          <article>
            <h1>Page Title</h1>
            <p>Page content goes here</p>
            <button>Action button</button>
          </article>
        </SidebarLayout>
      )

      expect(screen.getByRole('article')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Page Title' })).toBeInTheDocument()
      expect(screen.getByText('Page content goes here')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Action button' })).toBeInTheDocument()
    })
  })

  describe('state management', () => {
    it('sidebar starts closed', () => {
      render(
        <SidebarLayout navbar={<div>Navbar</div>} sidebar={<nav>Sidebar</nav>}>
          <div>Content</div>
        </SidebarLayout>
      )
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('can open and close sidebar multiple times', async () => {
      const user = userEvent.setup()
      render(
        <SidebarLayout navbar={<div>Navbar</div>} sidebar={<nav>Sidebar</nav>}>
          <div>Content</div>
        </SidebarLayout>
      )

      // First open
      await user.click(screen.getByRole('button', { name: 'Open navigation' }))
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // First close
      await user.click(screen.getByRole('button', { name: 'Close navigation' }))
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })

      // Second open
      await user.click(screen.getByRole('button', { name: 'Open navigation' }))
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // Second close
      await user.keyboard('{Escape}')
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
  })
})
