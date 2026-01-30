import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
  DropdownItem,
  DropdownHeader,
  DropdownSection,
  DropdownHeading,
  DropdownDivider,
  DropdownLabel,
  DropdownDescription,
  DropdownShortcut,
} from '~/components/ui/dropdown'

// Wrapper component to provide React Router context for link tests
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>
}

describe('Dropdown', () => {
  describe('Dropdown component', () => {
    it('renders children', () => {
      render(
        <Dropdown>
          <DropdownButton>Open</DropdownButton>
          <DropdownMenu>
            <DropdownItem>Item</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )
      expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument()
    })
  })

  describe('DropdownButton', () => {
    it('renders as a button by default', () => {
      render(
        <Dropdown>
          <DropdownButton>Click me</DropdownButton>
          <DropdownMenu>
            <DropdownItem>Item</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <Dropdown>
          <DropdownButton className="custom-class">Button</DropdownButton>
          <DropdownMenu>
            <DropdownItem>Item</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )
      const button = screen.getByRole('button', { name: 'Button' })
      expect(button.className).toContain('custom-class')
    })

    it('renders with custom element via as prop', () => {
      render(
        <Dropdown>
          <DropdownButton as="div" data-testid="custom-trigger">
            Custom Trigger
          </DropdownButton>
          <DropdownMenu>
            <DropdownItem>Item</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )
      expect(screen.getByTestId('custom-trigger')).toBeInTheDocument()
    })
  })

  describe('DropdownMenu', () => {
    it('renders menu items when open', async () => {
      const user = userEvent.setup()
      render(
        <Dropdown>
          <DropdownButton>Open Menu</DropdownButton>
          <DropdownMenu>
            <DropdownItem>First Item</DropdownItem>
            <DropdownItem>Second Item</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      await user.click(screen.getByRole('button', { name: 'Open Menu' }))
      expect(screen.getByRole('menu')).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: 'First Item' })).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: 'Second Item' })).toBeInTheDocument()
    })

    it('applies custom className', async () => {
      const user = userEvent.setup()
      render(
        <Dropdown>
          <DropdownButton>Open</DropdownButton>
          <DropdownMenu className="custom-menu">
            <DropdownItem>Item</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      await user.click(screen.getByRole('button', { name: 'Open' }))
      const menu = screen.getByRole('menu')
      expect(menu.className).toContain('custom-menu')
    })

    it('supports different anchor positions', async () => {
      const user = userEvent.setup()
      render(
        <Dropdown>
          <DropdownButton>Open</DropdownButton>
          <DropdownMenu anchor="top">
            <DropdownItem>Item</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      await user.click(screen.getByRole('button', { name: 'Open' }))
      expect(screen.getByRole('menu')).toBeInTheDocument()
    })
  })

  describe('DropdownItem', () => {
    it('renders as a button by default', async () => {
      const user = userEvent.setup()
      render(
        <Dropdown>
          <DropdownButton>Open</DropdownButton>
          <DropdownMenu>
            <DropdownItem>Button Item</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      await user.click(screen.getByRole('button', { name: 'Open' }))
      const item = screen.getByRole('menuitem', { name: 'Button Item' })
      expect(item.tagName.toLowerCase()).toBe('button')
    })

    it('renders as a link when href is provided', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <Dropdown>
            <DropdownButton>Open</DropdownButton>
            <DropdownMenu>
              <DropdownItem href="/test">Link Item</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </TestWrapper>
      )

      await user.click(screen.getByRole('button', { name: 'Open' }))
      const item = screen.getByRole('menuitem', { name: 'Link Item' })
      expect(item.tagName.toLowerCase()).toBe('a')
      expect(item).toHaveAttribute('href', '/test')
    })

    it('applies custom className', async () => {
      const user = userEvent.setup()
      render(
        <Dropdown>
          <DropdownButton>Open</DropdownButton>
          <DropdownMenu>
            <DropdownItem className="custom-item">Item</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      await user.click(screen.getByRole('button', { name: 'Open' }))
      const item = screen.getByRole('menuitem', { name: 'Item' })
      expect(item.className).toContain('custom-item')
    })

    it('supports disabled state', async () => {
      const user = userEvent.setup()
      render(
        <Dropdown>
          <DropdownButton>Open</DropdownButton>
          <DropdownMenu>
            <DropdownItem disabled>Disabled Item</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      await user.click(screen.getByRole('button', { name: 'Open' }))
      const item = screen.getByRole('menuitem', { name: 'Disabled Item' })
      expect(item).toHaveAttribute('data-disabled', '')
    })
  })

  describe('DropdownHeader', () => {
    it('renders header content', async () => {
      const user = userEvent.setup()
      render(
        <Dropdown>
          <DropdownButton>Open</DropdownButton>
          <DropdownMenu>
            <DropdownHeader>Header Text</DropdownHeader>
            <DropdownItem>Item</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      await user.click(screen.getByRole('button', { name: 'Open' }))
      expect(screen.getByText('Header Text')).toBeInTheDocument()
    })

    it('applies custom className', async () => {
      const user = userEvent.setup()
      render(
        <Dropdown>
          <DropdownButton>Open</DropdownButton>
          <DropdownMenu>
            <DropdownHeader className="custom-header">Header</DropdownHeader>
            <DropdownItem>Item</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      await user.click(screen.getByRole('button', { name: 'Open' }))
      const header = screen.getByText('Header')
      expect(header.className).toContain('custom-header')
    })
  })

  describe('DropdownSection', () => {
    it('renders section with items', async () => {
      const user = userEvent.setup()
      render(
        <Dropdown>
          <DropdownButton>Open</DropdownButton>
          <DropdownMenu>
            <DropdownSection data-testid="section">
              <DropdownItem>Section Item</DropdownItem>
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>
      )

      await user.click(screen.getByRole('button', { name: 'Open' }))
      expect(screen.getByTestId('section')).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: 'Section Item' })).toBeInTheDocument()
    })

    it('applies custom className', async () => {
      const user = userEvent.setup()
      render(
        <Dropdown>
          <DropdownButton>Open</DropdownButton>
          <DropdownMenu>
            <DropdownSection className="custom-section" data-testid="section">
              <DropdownItem>Item</DropdownItem>
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>
      )

      await user.click(screen.getByRole('button', { name: 'Open' }))
      const section = screen.getByTestId('section')
      expect(section.className).toContain('custom-section')
    })
  })

  describe('DropdownHeading', () => {
    it('renders heading text', async () => {
      const user = userEvent.setup()
      render(
        <Dropdown>
          <DropdownButton>Open</DropdownButton>
          <DropdownMenu>
            <DropdownSection>
              <DropdownHeading>Section Heading</DropdownHeading>
              <DropdownItem>Item</DropdownItem>
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>
      )

      await user.click(screen.getByRole('button', { name: 'Open' }))
      expect(screen.getByText('Section Heading')).toBeInTheDocument()
    })

    it('applies custom className', async () => {
      const user = userEvent.setup()
      render(
        <Dropdown>
          <DropdownButton>Open</DropdownButton>
          <DropdownMenu>
            <DropdownSection>
              <DropdownHeading className="custom-heading">Heading</DropdownHeading>
              <DropdownItem>Item</DropdownItem>
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>
      )

      await user.click(screen.getByRole('button', { name: 'Open' }))
      const heading = screen.getByText('Heading')
      expect(heading.className).toContain('custom-heading')
    })
  })

  describe('DropdownDivider', () => {
    it('renders a separator', async () => {
      const user = userEvent.setup()
      render(
        <Dropdown>
          <DropdownButton>Open</DropdownButton>
          <DropdownMenu>
            <DropdownItem>Item 1</DropdownItem>
            <DropdownDivider />
            <DropdownItem>Item 2</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      await user.click(screen.getByRole('button', { name: 'Open' }))
      expect(screen.getByRole('separator')).toBeInTheDocument()
    })

    it('applies custom className', async () => {
      const user = userEvent.setup()
      render(
        <Dropdown>
          <DropdownButton>Open</DropdownButton>
          <DropdownMenu>
            <DropdownItem>Item 1</DropdownItem>
            <DropdownDivider className="custom-divider" />
            <DropdownItem>Item 2</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      await user.click(screen.getByRole('button', { name: 'Open' }))
      const divider = screen.getByRole('separator')
      expect(divider.className).toContain('custom-divider')
    })
  })

  describe('DropdownLabel', () => {
    it('renders label text', async () => {
      const user = userEvent.setup()
      render(
        <Dropdown>
          <DropdownButton>Open</DropdownButton>
          <DropdownMenu>
            <DropdownItem>
              <DropdownLabel>Label Text</DropdownLabel>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      await user.click(screen.getByRole('button', { name: 'Open' }))
      expect(screen.getByText('Label Text')).toBeInTheDocument()
    })

    it('applies custom className', async () => {
      const user = userEvent.setup()
      render(
        <Dropdown>
          <DropdownButton>Open</DropdownButton>
          <DropdownMenu>
            <DropdownItem>
              <DropdownLabel className="custom-label">Label</DropdownLabel>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      await user.click(screen.getByRole('button', { name: 'Open' }))
      const label = screen.getByText('Label')
      expect(label.className).toContain('custom-label')
    })

    it('has data-slot attribute', async () => {
      const user = userEvent.setup()
      render(
        <Dropdown>
          <DropdownButton>Open</DropdownButton>
          <DropdownMenu>
            <DropdownItem>
              <DropdownLabel>Label</DropdownLabel>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      await user.click(screen.getByRole('button', { name: 'Open' }))
      const label = screen.getByText('Label')
      expect(label).toHaveAttribute('data-slot', 'label')
    })
  })

  describe('DropdownDescription', () => {
    it('renders description text', async () => {
      const user = userEvent.setup()
      render(
        <Dropdown>
          <DropdownButton>Open</DropdownButton>
          <DropdownMenu>
            <DropdownItem>
              <DropdownLabel>Action</DropdownLabel>
              <DropdownDescription>Description text</DropdownDescription>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      await user.click(screen.getByRole('button', { name: 'Open' }))
      expect(screen.getByText('Description text')).toBeInTheDocument()
    })

    it('applies custom className', async () => {
      const user = userEvent.setup()
      render(
        <Dropdown>
          <DropdownButton>Open</DropdownButton>
          <DropdownMenu>
            <DropdownItem>
              <DropdownLabel>Action</DropdownLabel>
              <DropdownDescription className="custom-desc">Description</DropdownDescription>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      await user.click(screen.getByRole('button', { name: 'Open' }))
      const desc = screen.getByText('Description')
      expect(desc.className).toContain('custom-desc')
    })

    it('has data-slot attribute', async () => {
      const user = userEvent.setup()
      render(
        <Dropdown>
          <DropdownButton>Open</DropdownButton>
          <DropdownMenu>
            <DropdownItem>
              <DropdownLabel>Action</DropdownLabel>
              <DropdownDescription>Desc</DropdownDescription>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      await user.click(screen.getByRole('button', { name: 'Open' }))
      const desc = screen.getByText('Desc')
      expect(desc).toHaveAttribute('data-slot', 'description')
    })
  })

  describe('DropdownShortcut', () => {
    it('renders keyboard shortcut from string', async () => {
      const user = userEvent.setup()
      render(
        <Dropdown>
          <DropdownButton>Open</DropdownButton>
          <DropdownMenu>
            <DropdownItem>
              <DropdownLabel>Cut</DropdownLabel>
              <DropdownShortcut keys="⌘X" />
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      await user.click(screen.getByRole('button', { name: 'Open' }))
      expect(screen.getByText('⌘')).toBeInTheDocument()
      expect(screen.getByText('X')).toBeInTheDocument()
    })

    it('renders keyboard shortcut from array', async () => {
      const user = userEvent.setup()
      render(
        <Dropdown>
          <DropdownButton>Open</DropdownButton>
          <DropdownMenu>
            <DropdownItem>
              <DropdownLabel>Save</DropdownLabel>
              <DropdownShortcut keys={['⌘', 'S']} />
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      await user.click(screen.getByRole('button', { name: 'Open' }))
      expect(screen.getByText('⌘')).toBeInTheDocument()
      expect(screen.getByText('S')).toBeInTheDocument()
    })

    it('renders multi-key shortcuts', async () => {
      const user = userEvent.setup()
      render(
        <Dropdown>
          <DropdownButton>Open</DropdownButton>
          <DropdownMenu>
            <DropdownItem>
              <DropdownLabel>Select All</DropdownLabel>
              <DropdownShortcut keys={['⌘', 'Shift', 'A']} />
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      await user.click(screen.getByRole('button', { name: 'Open' }))
      expect(screen.getByText('⌘')).toBeInTheDocument()
      expect(screen.getByText('Shift')).toBeInTheDocument()
      expect(screen.getByText('A')).toBeInTheDocument()
    })

    it('applies custom className', async () => {
      const user = userEvent.setup()
      render(
        <Dropdown>
          <DropdownButton>Open</DropdownButton>
          <DropdownMenu>
            <DropdownItem>
              <DropdownLabel>Action</DropdownLabel>
              <DropdownShortcut keys="⌘K" className="custom-shortcut" data-testid="shortcut" />
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      await user.click(screen.getByRole('button', { name: 'Open' }))
      const shortcut = screen.getByTestId('shortcut')
      expect(shortcut.className).toContain('custom-shortcut')
    })
  })

  describe('Full dropdown composition', () => {
    it('renders a complete dropdown with all components', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <Dropdown>
            <DropdownButton>Actions</DropdownButton>
            <DropdownMenu>
              <DropdownHeader>User Actions</DropdownHeader>
              <DropdownSection>
                <DropdownHeading>Edit</DropdownHeading>
                <DropdownItem>
                  <DropdownLabel>Cut</DropdownLabel>
                  <DropdownShortcut keys="⌘X" />
                </DropdownItem>
                <DropdownItem>
                  <DropdownLabel>Copy</DropdownLabel>
                  <DropdownDescription>Copy to clipboard</DropdownDescription>
                  <DropdownShortcut keys="⌘C" />
                </DropdownItem>
              </DropdownSection>
              <DropdownDivider />
              <DropdownSection>
                <DropdownHeading>File</DropdownHeading>
                <DropdownItem href="/save">
                  <DropdownLabel>Save</DropdownLabel>
                </DropdownItem>
                <DropdownItem disabled>
                  <DropdownLabel>Delete</DropdownLabel>
                </DropdownItem>
              </DropdownSection>
            </DropdownMenu>
          </Dropdown>
        </TestWrapper>
      )

      await user.click(screen.getByRole('button', { name: 'Actions' }))

      expect(screen.getByText('User Actions')).toBeInTheDocument()
      expect(screen.getByText('Edit')).toBeInTheDocument()
      expect(screen.getByText('Cut')).toBeInTheDocument()
      expect(screen.getByText('Copy')).toBeInTheDocument()
      expect(screen.getByText('Copy to clipboard')).toBeInTheDocument()
      expect(screen.getByRole('separator')).toBeInTheDocument()
      expect(screen.getByText('File')).toBeInTheDocument()
      expect(screen.getByText('Save')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    it('closes menu when clicking outside', async () => {
      const user = userEvent.setup()
      render(
        <div>
          <Dropdown>
            <DropdownButton>Open</DropdownButton>
            <DropdownMenu>
              <DropdownItem>Item</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <div data-testid="outside">Outside</div>
        </div>
      )

      await user.click(screen.getByRole('button', { name: 'Open' }))
      expect(screen.getByRole('menu')).toBeInTheDocument()

      // Click on the outside element (use pointer events to bypass inert)
      await user.pointer({ target: screen.getByTestId('outside'), keys: '[MouseLeft]' })
      // Wait for the menu to close (transition animation)
      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      })
    })

    it('closes menu when pressing Escape', async () => {
      const user = userEvent.setup()
      render(
        <Dropdown>
          <DropdownButton>Open</DropdownButton>
          <DropdownMenu>
            <DropdownItem>Item</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      await user.click(screen.getByRole('button', { name: 'Open' }))
      expect(screen.getByRole('menu')).toBeInTheDocument()

      await user.keyboard('{Escape}')
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
  })
})
