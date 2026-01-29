import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn, expect, userEvent, within } from 'storybook/test'
import { DockCenter } from '../app/components/navigation/dock-center'
import { DockItem } from '../app/components/navigation/dock-item'
import { SpoonDock } from '../app/components/navigation/spoon-dock'
import { BookOpen, Book, ShoppingCart, User } from 'lucide-react'

/**
 * # DockCenter
 * 
 * The SJ logo center element for the SpoonDock navigation.
 * Features a subtle breathing/glow idle animation and navigates to home on tap.
 * 
 * ## Key Features
 * 
 * - **SJ Logo** - The Spoonjoy brand mark
 * - **Home Navigation** - Tapping navigates to `/`
 * - **Idle Animation** - Subtle breathing/scale animation
 * - **Visual Prominence** - Larger than other items
 * - **Reduced Motion** - Static when user prefers
 * 
 * ## Animation Specs
 * 
 * - Breathing: scale 0.98 → 1.02
 * - Duration: ~2s continuous
 * - Easing: ease-in-out
 * - Reduced motion: static
 */
const meta: Meta<typeof DockCenter> = {
  title: 'Navigation/DockCenter',
  component: DockCenter,
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
The center element of the SpoonDock featuring the Spoonjoy logo.
Tapping navigates to the home page. Features a subtle idle breathing 
animation that makes the dock feel alive without being distracting.

Respects reduced motion preference - becomes static when user prefers reduced motion.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    href: {
      control: 'text',
      description: 'Navigation destination (defaults to /)',
    },
    onClick: {
      action: 'clicked',
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-black/60 backdrop-blur-xl rounded-full p-4 border border-white/10">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// BASIC STATES
// =============================================================================

/**
 * Default DockCenter with idle animation.
 * Watch for the subtle breathing effect.
 */
export const Default: Story = {
  args: {
    href: '/',
  },
}

/**
 * DockCenter with a custom navigation target.
 */
export const CustomHref: Story = {
  args: {
    href: '/dashboard',
  },
}

// =============================================================================
// WITH FULL DOCK
// =============================================================================

/**
 * DockCenter in context with other dock items.
 * Shows the visual prominence compared to regular items.
 */
export const InContext: Story = {
  render: () => (
    <div className="h-14 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 flex items-center justify-around px-2 w-80">
      <DockItem icon={BookOpen} label="Recipes" href="/recipes" />
      <DockItem icon={Book} label="Cookbooks" href="/cookbooks" />
      <DockCenter href="/" />
      <DockItem icon={ShoppingCart} label="List" href="/shopping-list" />
      <DockItem icon={User} label="Profile" href="/account/settings" />
    </div>
  ),
  decorators: [], // Remove default decorator
  parameters: {
    docs: {
      description: {
        story: 'The logo center positioned among regular dock items. Note the larger size and distinct styling.',
      },
    },
  },
}

/**
 * Full SpoonDock assembly with all components.
 */
export const FullDock: Story = {
  render: () => (
    <div className="h-screen w-full bg-zinc-900 relative">
      <div className="p-4 text-white">
        <h1 className="text-xl font-bold">Spoonjoy</h1>
        <p className="text-zinc-400">Watch the logo breathe...</p>
      </div>
      <SpoonDock>
        <DockItem icon={BookOpen} label="Recipes" href="/recipes" />
        <DockItem icon={Book} label="Cookbooks" href="/cookbooks" />
        <DockCenter href="/" />
        <DockItem icon={ShoppingCart} label="List" href="/shopping-list" />
        <DockItem icon={User} label="Profile" href="/account/settings" />
      </SpoonDock>
    </div>
  ),
  decorators: [], // Remove default decorator
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'mobile1' },
    docs: {
      description: {
        story: 'Complete SpoonDock with all items. The center logo anchors the navigation.',
      },
    },
  },
}

// =============================================================================
// ANIMATION STATES
// =============================================================================

/**
 * Static logo for reduced motion preference.
 * 
 * Note: In the browser, this is controlled by system preferences.
 * This story shows what the logo looks like without animation.
 */
export const ReducedMotion: Story = {
  args: {
    href: '/',
  },
  parameters: {
    docs: {
      description: {
        story: `
When users have \`prefers-reduced-motion: reduce\` enabled, the breathing 
animation is disabled and the logo remains static.

To test in browser:
- macOS: System Preferences → Accessibility → Display → Reduce motion
- Chrome DevTools: Rendering panel → Emulate CSS media feature
        `,
      },
    },
  },
}

// =============================================================================
// SIZE VARIATIONS
// =============================================================================

/**
 * Different sizes for tuning the logo prominence.
 */
export const SizeVariations: Story = {
  render: () => (
    <div className="flex flex-col gap-8 items-center">
      <div className="text-white/60 text-sm">Small (12)</div>
      <div className="bg-black/60 backdrop-blur-xl rounded-full p-3 border border-white/10">
        <DockCenter href="/" className="w-12 h-12" />
      </div>
      
      <div className="text-white/60 text-sm">Medium (14) - Default</div>
      <div className="bg-black/60 backdrop-blur-xl rounded-full p-3 border border-white/10">
        <DockCenter href="/" />
      </div>
      
      <div className="text-white/60 text-sm">Large (16)</div>
      <div className="bg-black/60 backdrop-blur-xl rounded-full p-3 border border-white/10">
        <DockCenter href="/" className="w-16 h-16" />
      </div>
    </div>
  ),
  decorators: [], // Remove default decorator
  parameters: {
    docs: {
      description: {
        story: 'Different sizes to tune the visual prominence of the logo.',
      },
    },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Test click interaction.
 */
export const ClickInteraction: Story = {
  args: {
    href: '/',
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const link = canvas.getByRole('link')
    
    await userEvent.click(link)
    await expect(args.onClick).toHaveBeenCalledTimes(1)
  },
  parameters: {
    docs: {
      description: {
        story: 'Click the logo to verify the onClick handler is called.',
      },
    },
  },
}

/**
 * Test keyboard navigation.
 */
export const KeyboardNavigation: Story = {
  args: {
    href: '/',
    onClick: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const link = canvas.getByRole('link')
    
    await userEvent.tab()
    await expect(link).toHaveFocus()
  },
  parameters: {
    docs: {
      description: {
        story: 'The logo is keyboard accessible and receives focus on tab.',
      },
    },
  },
}

// =============================================================================
// STYLING VARIATIONS
// =============================================================================

/**
 * Different background treatments.
 */
export const BackgroundVariations: Story = {
  render: () => (
    <div className="flex gap-8 items-center">
      <div className="flex flex-col items-center gap-2">
        <div className="text-white/60 text-xs">Subtle glass</div>
        <div className="bg-white/5 rounded-full p-2">
          <DockCenter href="/" />
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <div className="text-white/60 text-xs">Medium glass</div>
        <div className="bg-white/10 rounded-full p-2">
          <DockCenter href="/" />
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <div className="text-white/60 text-xs">Strong glass</div>
        <div className="bg-white/20 rounded-full p-2">
          <DockCenter href="/" />
        </div>
      </div>
    </div>
  ),
  decorators: [], // Remove default decorator
  parameters: {
    docs: {
      description: {
        story: 'Different background opacity levels for the logo container.',
      },
    },
  },
}
