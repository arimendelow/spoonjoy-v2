import type { Meta, StoryObj } from '@storybook/react-vite'
import { SpoonDock } from '../app/components/navigation/spoon-dock'
import { Home, Book, ShoppingCart, User, BookOpen } from 'lucide-react'

/**
 * # SpoonDock
 * 
 * The mobile-first bottom navigation dock for Spoonjoy. 
 * Designed for thumb-friendly interaction with glass morphism styling.
 * 
 * ## Key Features
 * 
 * - **Fixed bottom positioning** - Always accessible at the thumb zone
 * - **Glass morphism styling** - Semi-transparent with backdrop blur
 * - **Safe area handling** - Respects notches and home indicators
 * - **Responsive** - Hidden on desktop (lg breakpoint and above)
 * - **Pill shape** - Modern, floating appearance
 * 
 * ## Design Specs
 * 
 * - Background: `bg-black/60` with `backdrop-blur-xl`
 * - Border: `border border-white/10`
 * - Max width: `max-w-md` centered
 * - Height: 56-60px (thumb-friendly)
 * - Bottom margin: `max(1rem, env(safe-area-inset-bottom))`
 */
const meta: Meta<typeof SpoonDock> = {
  title: 'Navigation/SpoonDock',
  component: SpoonDock,
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
        { name: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
      ],
    },
    docs: {
      description: {
        component: `
The SpoonDock is Spoonjoy's mobile navigation component - a thumb-friendly bottom dock 
that replaces traditional hamburger menus with always-visible navigation.

Features glass morphism styling, safe area handling for notched devices, and responsive 
visibility (hidden on desktop).
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply to the dock',
    },
  },
  decorators: [
    (Story) => (
      <div className="h-screen w-full bg-zinc-900 relative">
        {/* Simulate page content */}
        <div className="p-4 text-white space-y-4">
          <h1 className="text-2xl font-bold">Page Content</h1>
          <p className="text-zinc-400">
            The dock should appear fixed at the bottom of the screen.
          </p>
          {/* Add enough content to scroll */}
          {Array.from({ length: 20 }).map((_, i) => (
            <p key={i} className="text-zinc-500">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          ))}
        </div>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// PLACEHOLDER DOCK ITEM
// =============================================================================

/**
 * Placeholder dock item for stories while DockItem component is not yet built.
 * This will be replaced by the actual DockItem component in Unit 2.
 */
function PlaceholderDockItem({ 
  icon: Icon, 
  label, 
  active = false 
}: { 
  icon: React.ElementType
  label: string
  active?: boolean 
}) {
  return (
    <button
      className={`
        flex flex-col items-center justify-center gap-1 px-3 py-2
        ${active ? 'text-white' : 'text-white/60'}
      `}
    >
      <Icon className="h-5 w-5" />
      <span className="text-[10px] tracking-wide">{label}</span>
    </button>
  )
}

// =============================================================================
// BASIC STORIES
// =============================================================================

/**
 * The default dock with placeholder navigation items.
 * 
 * **Note**: Currently the dock shell is a stub. The actual implementation
 * will be completed in Unit 1b. This story will render correctly once
 * the SpoonDock component is implemented.
 */
export const Default: Story = {
  render: () => (
    <SpoonDock>
      <PlaceholderDockItem icon={BookOpen} label="Recipes" />
      <PlaceholderDockItem icon={Book} label="Cookbooks" />
      <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-full">
        <span className="text-white font-bold text-sm">SJ</span>
      </div>
      <PlaceholderDockItem icon={ShoppingCart} label="List" />
      <PlaceholderDockItem icon={User} label="Profile" />
    </SpoonDock>
  ),
}

/**
 * Dock with an active item highlighted.
 */
export const WithActiveItem: Story = {
  render: () => (
    <SpoonDock>
      <PlaceholderDockItem icon={BookOpen} label="Recipes" active />
      <PlaceholderDockItem icon={Book} label="Cookbooks" />
      <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-full">
        <span className="text-white font-bold text-sm">SJ</span>
      </div>
      <PlaceholderDockItem icon={ShoppingCart} label="List" />
      <PlaceholderDockItem icon={User} label="Profile" />
    </SpoonDock>
  ),
}

/**
 * Empty dock shell - shows just the container without items.
 * Useful for testing the shell styling in isolation.
 */
export const EmptyShell: Story = {
  render: () => <SpoonDock />,
  parameters: {
    docs: {
      description: {
        story: 'The dock shell without any items. Shows the glass morphism container.',
      },
    },
  },
}

// =============================================================================
// RESPONSIVE STORIES
// =============================================================================

/**
 * Dock on a small mobile device (iPhone SE size).
 */
export const SmallMobile: Story = {
  ...Default,
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'How the dock appears on smaller mobile devices (320px wide).',
      },
    },
  },
}

/**
 * Dock on a larger mobile device (iPhone 12/13 Pro size).
 */
export const LargeMobile: Story = {
  ...Default,
  parameters: {
    viewport: {
      defaultViewport: 'mobile2',
    },
    docs: {
      description: {
        story: 'How the dock appears on larger mobile devices (414px wide).',
      },
    },
  },
}

/**
 * Dock on tablet - should still be visible.
 */
export const Tablet: Story = {
  ...Default,
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: 'The dock on tablet-sized screens. Still visible as it\'s below lg breakpoint.',
      },
    },
  },
}

/**
 * On desktop, the dock should be hidden (lg:hidden).
 * This story demonstrates that the dock disappears on larger screens.
 */
export const HiddenOnDesktop: Story = {
  ...Default,
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
    docs: {
      description: {
        story: `
On desktop screens (lg breakpoint and above), the dock is hidden.
Desktop users see the regular navbar instead.
        `,
      },
    },
  },
}

// =============================================================================
// SAFE AREA STORIES
// =============================================================================

/**
 * Simulates a device with a home indicator (like iPhone X+).
 * The dock should have extra bottom padding to avoid overlapping.
 */
export const WithSafeAreaInset: Story = {
  render: () => (
    <SpoonDock>
      <PlaceholderDockItem icon={BookOpen} label="Recipes" />
      <PlaceholderDockItem icon={Book} label="Cookbooks" />
      <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-full">
        <span className="text-white font-bold text-sm">SJ</span>
      </div>
      <PlaceholderDockItem icon={ShoppingCart} label="List" />
      <PlaceholderDockItem icon={User} label="Profile" />
    </SpoonDock>
  ),
  decorators: [
    (Story) => (
      <div className="h-screen w-full bg-zinc-900 relative">
        {/* Simulate page content */}
        <div className="p-4 text-white space-y-4 pb-32">
          <h1 className="text-2xl font-bold">Safe Area Test</h1>
          <p className="text-zinc-400">
            The dock should respect the home indicator area on notched devices.
          </p>
        </div>
        <Story />
        {/* Simulated home indicator */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full" />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: `
Demonstrates safe area handling. On devices with home indicators (iPhone X+), 
the dock uses \`env(safe-area-inset-bottom)\` to avoid overlapping the indicator.
        `,
      },
    },
  },
}

// =============================================================================
// BACKGROUND VARIATIONS
// =============================================================================

/**
 * Dock over a light background - tests glass morphism visibility.
 */
export const OverLightBackground: Story = {
  render: () => (
    <SpoonDock>
      <PlaceholderDockItem icon={BookOpen} label="Recipes" />
      <PlaceholderDockItem icon={Book} label="Cookbooks" />
      <div className="flex items-center justify-center w-12 h-12 bg-black/10 rounded-full">
        <span className="text-black font-bold text-sm">SJ</span>
      </div>
      <PlaceholderDockItem icon={ShoppingCart} label="List" />
      <PlaceholderDockItem icon={User} label="Profile" />
    </SpoonDock>
  ),
  decorators: [
    (Story) => (
      <div className="h-screen w-full bg-white relative">
        <div className="p-4 text-zinc-900 space-y-4">
          <h1 className="text-2xl font-bold">Light Background</h1>
          <p className="text-zinc-600">
            The dock should still be visible with glass morphism over light content.
          </p>
        </div>
        <Story />
      </div>
    ),
  ],
  parameters: {
    backgrounds: { default: 'light' },
    docs: {
      description: {
        story: 'Tests how the glass morphism effect looks over light content.',
      },
    },
  },
}

/**
 * Dock over an image - demonstrates the backdrop blur effect.
 */
export const OverImage: Story = {
  ...Default,
  decorators: [
    (Story) => (
      <div 
        className="h-screen w-full bg-cover bg-center relative"
        style={{ 
          backgroundImage: 'url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800)'
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative p-4 text-white space-y-4">
          <h1 className="text-2xl font-bold">Over Image</h1>
          <p className="text-white/80">
            The backdrop blur creates a frosted glass effect.
          </p>
        </div>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'The backdrop-blur effect creates a beautiful frosted glass appearance over images.',
      },
    },
  },
}
