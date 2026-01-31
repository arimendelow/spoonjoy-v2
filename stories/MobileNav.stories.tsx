import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn, expect, within } from 'storybook/test'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router'
import { MobileNav } from '../app/components/navigation/mobile-nav'
import { DockContextProvider, useDockActions, type DockAction } from '../app/components/navigation/dock-context'
import { ArrowLeft, Edit, ShoppingCart, Share, Heart, Bookmark } from 'lucide-react'

/**
 * # MobileNav
 * 
 * The complete mobile navigation dock, assembling SpoonDock, DockItems, and DockCenter.
 * Uses React Router's location to determine the active navigation item.
 * 
 * ## Key Features
 * 
 * - **Route-aware** - Automatically highlights the active navigation item
 * - **Contextual mode** - Pages can register custom actions via DockContext
 * - **Authentication states** - Different nav items for logged in vs logged out
 * - **Responsive** - Hidden on desktop (lg breakpoint and above)
 * 
 * ## Navigation Items
 * 
 * **Authenticated:**
 * - Recipes (left) | Cookbooks (left) | [Logo] | List (right) | Profile (right)
 * 
 * **Unauthenticated:**
 * - Home (left) | [Logo] | Login (right)
 */
const meta: Meta<typeof MobileNav> = {
  title: 'Navigation/MobileNav',
  component: MobileNav,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#18181b' },
        { name: 'light', value: '#ffffff' },
      ],
    },
    docs: {
      description: {
        component: `
MobileNav is the assembled mobile navigation dock that combines SpoonDock, DockItems, 
and DockCenter. It uses React Router for route awareness and DockContext for contextual actions.

Supports both authenticated and unauthenticated states with different navigation items.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isAuthenticated: {
      control: 'boolean',
      description: 'Whether user is authenticated (changes nav items)',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// WRAPPER COMPONENTS
// =============================================================================

/**
 * Wrapper that provides MemoryRouter and DockContextProvider
 */
function StoryWrapper({
  initialPath = '/recipes',
  children,
}: {
  initialPath?: string
  children: React.ReactNode
}) {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <DockContextProvider>
        <div className="h-screen w-full bg-zinc-900 relative">
          <div className="p-4 text-white space-y-4 pb-32">
            <CurrentPathDisplay />
            <p className="text-zinc-400">
              The dock appears fixed at the bottom of the screen.
            </p>
          </div>
          {children}
        </div>
      </DockContextProvider>
    </MemoryRouter>
  )
}

/**
 * Displays the current path for debugging
 */
function CurrentPathDisplay() {
  const location = useLocation()
  return (
    <div className="text-zinc-400 text-sm">
      Current path: <code className="text-white">{location.pathname}</code>
    </div>
  )
}

// =============================================================================
// BASIC STORIES
// =============================================================================

/**
 * Default authenticated navigation with Recipes active.
 */
export const Default: Story = {
  args: {
    isAuthenticated: true,
  },
  render: (args) => (
    <StoryWrapper initialPath="/recipes">
      <MobileNav {...args} />
    </StoryWrapper>
  ),
}

/**
 * Unauthenticated user sees Home and Login options.
 */
export const Unauthenticated: Story = {
  args: {
    isAuthenticated: false,
  },
  render: (args) => (
    <StoryWrapper initialPath="/">
      <MobileNav {...args} />
    </StoryWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: 'When not authenticated, shows simplified nav: Home | Logo | Login',
      },
    },
  },
}

// =============================================================================
// ACTIVE STATE STORIES
// =============================================================================

/**
 * Recipes tab active
 */
export const RecipesActive: Story = {
  args: { isAuthenticated: true },
  render: (args) => (
    <StoryWrapper initialPath="/recipes">
      <MobileNav {...args} />
    </StoryWrapper>
  ),
}

/**
 * Cookbooks tab active
 */
export const CookbooksActive: Story = {
  args: { isAuthenticated: true },
  render: (args) => (
    <StoryWrapper initialPath="/cookbooks">
      <MobileNav {...args} />
    </StoryWrapper>
  ),
}

/**
 * Shopping List tab active
 */
export const ShoppingListActive: Story = {
  args: { isAuthenticated: true },
  render: (args) => (
    <StoryWrapper initialPath="/shopping-list">
      <MobileNav {...args} />
    </StoryWrapper>
  ),
}

/**
 * Profile tab active
 */
export const ProfileActive: Story = {
  args: { isAuthenticated: true },
  render: (args) => (
    <StoryWrapper initialPath="/account/settings">
      <MobileNav {...args} />
    </StoryWrapper>
  ),
}

/**
 * Nested route still activates parent tab (e.g., /recipes/123)
 */
export const NestedRoute: Story = {
  args: { isAuthenticated: true },
  render: (args) => (
    <StoryWrapper initialPath="/recipes/123">
      <MobileNav {...args} />
    </StoryWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Nested routes like /recipes/123 still highlight the parent tab (Recipes).',
      },
    },
  },
}

// =============================================================================
// CONTEXTUAL MODE STORIES
// =============================================================================

/**
 * Component that registers contextual actions
 */
function ContextualPage({ actions }: { actions: DockAction[] }) {
  useDockActions(actions)
  return (
    <div className="p-4 text-white">
      <h2 className="text-lg font-semibold">Contextual Mode Active</h2>
      <p className="text-zinc-400 text-sm mt-2">
        This page has registered custom dock actions.
      </p>
    </div>
  )
}

/**
 * Recipe detail page with contextual actions.
 */
export const ContextualRecipeDetail: Story = {
  render: () => {
    const actions: DockAction[] = [
      { id: 'back', icon: ArrowLeft, label: 'Back', onAction: '/recipes', position: 'left' },
      { id: 'edit', icon: Edit, label: 'Edit', onAction: fn(), position: 'left' },
      { id: 'add-to-list', icon: ShoppingCart, label: 'Add', onAction: fn(), position: 'right' },
      { id: 'share', icon: Share, label: 'Share', onAction: fn(), position: 'right' },
    ]

    return (
      <MemoryRouter initialEntries={['/recipes/123']}>
        <DockContextProvider>
          <div className="h-screen w-full bg-zinc-900 relative">
            <ContextualPage actions={actions} />
            <MobileNav isAuthenticated={true} />
          </div>
        </DockContextProvider>
      </MemoryRouter>
    )
  },
  parameters: {
    docs: {
      description: {
        story: `
On recipe detail pages, the dock shows contextual actions:
- Back | Edit | [Logo] | Add to List | Share

These replace the default navigation items.
        `,
      },
    },
  },
}

/**
 * Custom contextual actions (e.g., a favorites page)
 */
export const ContextualFavorites: Story = {
  render: () => {
    const actions: DockAction[] = [
      { id: 'back', icon: ArrowLeft, label: 'Back', onAction: '/recipes', position: 'left' },
      { id: 'heart', icon: Heart, label: 'Favorite', onAction: fn(), position: 'right' },
      { id: 'save', icon: Bookmark, label: 'Save', onAction: fn(), position: 'right' },
    ]

    return (
      <MemoryRouter initialEntries={['/favorites']}>
        <DockContextProvider>
          <div className="h-screen w-full bg-zinc-900 relative">
            <ContextualPage actions={actions} />
            <MobileNav isAuthenticated={true} />
          </div>
        </DockContextProvider>
      </MemoryRouter>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Pages can register any set of contextual actions they need.',
      },
    },
  },
}

// =============================================================================
// RESPONSIVE STORIES
// =============================================================================

/**
 * Small mobile (iPhone SE)
 */
export const SmallMobile: Story = {
  ...Default,
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: {
      description: { story: 'Navigation on small mobile devices (320px).' },
    },
  },
}

/**
 * Large mobile (iPhone 12/13 Pro)
 */
export const LargeMobile: Story = {
  ...Default,
  parameters: {
    viewport: { defaultViewport: 'mobile2' },
    docs: {
      description: { story: 'Navigation on larger mobile devices (414px).' },
    },
  },
}

/**
 * Tablet - still shows the dock
 */
export const Tablet: Story = {
  ...Default,
  parameters: {
    viewport: { defaultViewport: 'tablet' },
    docs: {
      description: { story: 'Navigation on tablet (768px). Still visible below lg breakpoint.' },
    },
  },
}

/**
 * Desktop - dock is hidden (lg:hidden)
 */
export const HiddenOnDesktop: Story = {
  ...Default,
  parameters: {
    viewport: { defaultViewport: 'desktop' },
    docs: {
      description: { story: 'On desktop (lg+), the mobile dock is hidden. Users see the navbar.' },
    },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Verify all navigation items are rendered
 */
export const RendersAllItems: Story = {
  args: { isAuthenticated: true },
  render: (args) => (
    <StoryWrapper initialPath="/recipes">
      <MobileNav {...args} />
    </StoryWrapper>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    
    // Check that all nav items are present
    await expect(canvas.getByText('Recipes')).toBeInTheDocument()
    await expect(canvas.getByText('Cookbooks')).toBeInTheDocument()
    await expect(canvas.getByText('List')).toBeInTheDocument()
    await expect(canvas.getByText('Profile')).toBeInTheDocument()
  },
}

/**
 * Verify unauthenticated nav items
 */
export const RendersUnauthenticatedItems: Story = {
  args: { isAuthenticated: false },
  render: (args) => (
    <StoryWrapper initialPath="/">
      <MobileNav {...args} />
    </StoryWrapper>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    
    // Check unauthenticated items
    await expect(canvas.getByText('Home')).toBeInTheDocument()
    await expect(canvas.getByText('Login')).toBeInTheDocument()
    
    // Authenticated items should not be present
    expect(canvas.queryByText('Recipes')).not.toBeInTheDocument()
    expect(canvas.queryByText('Cookbooks')).not.toBeInTheDocument()
  },
}

// =============================================================================
// BACKGROUND VARIATIONS
// =============================================================================

/**
 * Navigation over light content
 */
export const OverLightBackground: Story = {
  args: { isAuthenticated: true },
  render: (args) => (
    <MemoryRouter initialEntries={['/recipes']}>
      <DockContextProvider>
        <div className="h-screen w-full bg-white relative">
          <div className="p-4 text-zinc-900 space-y-4">
            <h1 className="text-xl font-bold">Light Background</h1>
            <p className="text-zinc-600">
              The dock maintains its dark glass styling over light content.
            </p>
          </div>
          <MobileNav {...args} />
        </div>
      </DockContextProvider>
    </MemoryRouter>
  ),
  parameters: {
    backgrounds: { default: 'light' },
  },
}

/**
 * Navigation over an image
 */
export const OverImage: Story = {
  args: { isAuthenticated: true },
  render: (args) => (
    <MemoryRouter initialEntries={['/recipes']}>
      <DockContextProvider>
        <div
          className="h-screen w-full bg-cover bg-center relative"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800)',
          }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative p-4 text-white">
            <h1 className="text-xl font-bold">Over Image</h1>
            <p className="text-white/80">
              The backdrop blur creates a frosted glass effect.
            </p>
          </div>
          <MobileNav {...args} />
        </div>
      </DockContextProvider>
    </MemoryRouter>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The glass morphism effect looks beautiful over image backgrounds.',
      },
    },
  },
}
