import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn, expect, userEvent, within } from 'storybook/test'
import { DockItem } from '../app/components/navigation/dock-item'
import { Home, BookOpen, Book, ShoppingCart, User, Heart, Settings, Search, Bell, ChefHat } from 'lucide-react'
import { MemoryRouter } from 'react-router'

/**
 * # DockItem
 * 
 * Individual navigation item for the SpoonDock bottom navigation.
 * Features liquid glass label styling with icon + small translucent text.
 * 
 * ## Key Features
 * 
 * - **Icon + Label** - Lucide icon above small text label
 * - **Touch Target** - Minimum 44×44px for accessibility
 * - **Active State** - White label with glow effect
 * - **Press Feedback** - Scale animation on press
 * - **Liquid Glass Labels** - Small, translucent, with text shadow
 * 
 * ## Design Specs
 * 
 * - Label font: ~10px with letter-spacing
 * - Inactive label: `rgba(255, 255, 255, 0.6)`
 * - Active label: white with glow (`text-shadow: 0 0 8px rgba(255,255,255,0.4)`)
 * - Press: scale to 0.95 (100ms ease-out)
 */
const meta: Meta<typeof DockItem> = {
  title: 'Navigation/DockItem',
  component: DockItem,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#18181b' },
        { name: 'glass', value: 'rgba(0, 0, 0, 0.6)' },
      ],
    },
    docs: {
      description: {
        component: `
Individual navigation item for the SpoonDock. Features an icon above a small 
translucent label with "liquid glass" styling inspired by iOS 26.

Includes press feedback animation and distinct active state with glow effect.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: false,
      description: 'Lucide icon component to display',
    },
    label: {
      control: 'text',
      description: 'Label text displayed below the icon',
    },
    href: {
      control: 'text',
      description: 'Navigation destination',
    },
    active: {
      control: 'boolean',
      description: 'Whether this item represents the current route',
    },
    onClick: {
      action: 'clicked',
    },
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="bg-black/60 backdrop-blur-xl rounded-full p-4 border border-white/10">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// BASIC STATES
// =============================================================================

/**
 * Default inactive dock item.
 * Label appears slightly translucent.
 */
export const Default: Story = {
  args: {
    icon: Home,
    label: 'Home',
    href: '/',
    active: false,
  },
}

/**
 * Active dock item - represents the current route.
 * Label is white with a subtle glow effect.
 */
export const Active: Story = {
  args: {
    icon: Home,
    label: 'Home',
    href: '/',
    active: true,
  },
}

/**
 * Test press feedback by clicking the item.
 * Should scale down slightly on press.
 */
export const Pressed: Story = {
  args: {
    icon: Home,
    label: 'Home',
    href: '/',
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const link = canvas.getByRole('link')
    
    // Click the item
    await userEvent.click(link)
    
    // Verify onClick was called
    await expect(args.onClick).toHaveBeenCalledTimes(1)
  },
  parameters: {
    docs: {
      description: {
        story: 'Click to see the press feedback animation. The item should scale down slightly.',
      },
    },
  },
}

// =============================================================================
// NAVIGATION ITEMS
// =============================================================================

/**
 * All the main navigation items used in the SpoonDock.
 */
export const AllNavItems: Story = {
  render: () => (
    <MemoryRouter>
      <div className="flex items-center gap-4 bg-black/60 backdrop-blur-xl rounded-full p-4 border border-white/10">
        <DockItem icon={BookOpen} label="Recipes" href="/recipes" active />
        <DockItem icon={Book} label="Cookbooks" href="/cookbooks" />
        <DockItem icon={ShoppingCart} label="List" href="/shopping-list" />
        <DockItem icon={User} label="Profile" href="/account/settings" />
      </div>
    </MemoryRouter>
  ),
  decorators: [], // Remove default decorator
  parameters: {
    docs: {
      description: {
        story: 'The four main navigation items as they appear in the dock (without center logo).',
      },
    },
  },
}

// =============================================================================
// ICON VARIATIONS
// =============================================================================

/**
 * Different icon/label combinations.
 */
export const DifferentIcons: Story = {
  render: () => (
    <MemoryRouter>
      <div className="grid grid-cols-5 gap-4 bg-black/60 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
        <DockItem icon={Home} label="Home" href="/" />
        <DockItem icon={Search} label="Search" href="/search" />
        <DockItem icon={Heart} label="Favorites" href="/favorites" />
        <DockItem icon={Bell} label="Alerts" href="/notifications" />
        <DockItem icon={Settings} label="Settings" href="/settings" />
        <DockItem icon={BookOpen} label="Recipes" href="/recipes" />
        <DockItem icon={Book} label="Cookbooks" href="/cookbooks" />
        <DockItem icon={ShoppingCart} label="Cart" href="/cart" />
        <DockItem icon={User} label="Account" href="/account" />
        <DockItem icon={ChefHat} label="Cook" href="/cook" />
      </div>
    </MemoryRouter>
  ),
  decorators: [], // Remove default decorator
  parameters: {
    docs: {
      description: {
        story: 'Various icon and label combinations to show versatility.',
      },
    },
  },
}

// =============================================================================
// ACTIVE STATE COMPARISON
// =============================================================================

/**
 * Side-by-side comparison of inactive vs active states.
 */
export const ActiveComparison: Story = {
  render: () => (
    <MemoryRouter>
      <div className="flex items-center gap-8 bg-black/60 backdrop-blur-xl rounded-full p-4 border border-white/10">
        <div className="flex flex-col items-center gap-1">
          <DockItem icon={Home} label="Inactive" href="/" active={false} />
          <span className="text-[9px] text-white/40 mt-2">active=false</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <DockItem icon={Home} label="Active" href="/" active={true} />
          <span className="text-[9px] text-white/40 mt-2">active=true</span>
        </div>
      </div>
    </MemoryRouter>
  ),
  decorators: [], // Remove default decorator
  parameters: {
    docs: {
      description: {
        story: 'Comparison showing the visual difference between active and inactive states.',
      },
    },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Test keyboard navigation - items should be focusable.
 */
export const KeyboardNavigation: Story = {
  args: {
    icon: Home,
    label: 'Home',
    href: '/',
    onClick: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const link = canvas.getByRole('link')
    
    // Focus the item via tab
    await userEvent.tab()
    await expect(link).toHaveFocus()
  },
  parameters: {
    docs: {
      description: {
        story: 'Verify the dock item is keyboard accessible via tab navigation.',
      },
    },
  },
}

// =============================================================================
// LABEL VARIATIONS
// =============================================================================

/**
 * Items with longer labels - should truncate or wrap gracefully.
 */
export const LongLabels: Story = {
  render: () => (
    <MemoryRouter>
      <div className="flex items-center gap-4 bg-black/60 backdrop-blur-xl rounded-full p-4 border border-white/10">
        <DockItem icon={BookOpen} label="Recipes" href="/recipes" />
        <DockItem icon={Book} label="Cookbooks" href="/cookbooks" />
        <DockItem icon={ShoppingCart} label="Shopping" href="/shopping-list" />
        <DockItem icon={Settings} label="Settings" href="/settings" />
      </div>
    </MemoryRouter>
  ),
  decorators: [], // Remove default decorator
  parameters: {
    docs: {
      description: {
        story: 'Items with varying label lengths. Labels should be concise.',
      },
    },
  },
}

// =============================================================================
// DARK/LIGHT MODE
// =============================================================================

/**
 * Dock item over light background.
 * Note: The dock itself uses dark glass styling regardless of theme.
 */
export const OverLightContent: Story = {
  args: {
    icon: Home,
    label: 'Home',
    href: '/',
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="p-8 bg-white">
          <div className="bg-black/60 backdrop-blur-xl rounded-full p-4 border border-white/10">
            <Story />
          </div>
        </div>
      </MemoryRouter>
    ),
  ],
  parameters: {
    backgrounds: { default: 'light' },
    docs: {
      description: {
        story: 'The dock maintains dark glass styling regardless of page theme.',
      },
    },
  },
}
