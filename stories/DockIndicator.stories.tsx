import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn, expect, userEvent, within } from 'storybook/test'
import { DockIndicator } from '../app/components/navigation/dock-indicator'
import { DockItem } from '../app/components/navigation/dock-item'
import { SpoonDock } from '../app/components/navigation/spoon-dock'
import { Home, BookOpen, Book, ShoppingCart, User } from 'lucide-react'
import { MemoryRouter } from 'react-router'

/**
 * # DockIndicator
 * 
 * A sliding pill indicator that shows which navigation item is currently active.
 * Uses Framer Motion's layoutId for smooth shared layout animations.
 * 
 * ## Key Features
 * 
 * - **Smooth Animation** - Spring physics for natural feel
 * - **layoutId** - Framer Motion for seamless transitions
 * - **Reduced Motion** - Respects user preference for less motion
 * - **Single Instance** - Only one pill exists, animates to new position
 * 
 * ## Animation Specs
 * 
 * - Spring: `stiffness: 400, damping: 30`
 * - Duration: ~300ms
 * - Reduced motion: instant position change
 */
const meta: Meta<typeof DockIndicator> = {
  title: 'Navigation/DockIndicator',
  component: DockIndicator,
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
The sliding indicator pill for the SpoonDock. When the active navigation item 
changes, this pill smoothly animates to the new position using Framer Motion's 
layoutId for shared layout animations.

Supports reduced motion preference - disables animation when user prefers reduced motion.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    activeIndex: {
      control: { type: 'number', min: 0, max: 3 },
      description: 'Index of the currently active item (0-based)',
    },
    itemCount: {
      control: { type: 'number', min: 1, max: 5 },
      description: 'Total number of items in the dock',
    },
  },
  decorators: [
    (Story) => (
      <div className="relative h-14 w-80 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 flex items-center justify-around px-4">
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
 * Default indicator at the first position.
 */
export const Default: Story = {
  args: {
    activeIndex: 0,
    itemCount: 4,
  },
}

/**
 * Indicator at the second position.
 */
export const SecondPosition: Story = {
  args: {
    activeIndex: 1,
    itemCount: 4,
  },
}

/**
 * Indicator at the last position.
 */
export const LastPosition: Story = {
  args: {
    activeIndex: 3,
    itemCount: 4,
  },
}

// =============================================================================
// INTERACTIVE STORIES
// =============================================================================

/**
 * Interactive story - click items to see the pill slide.
 * This demonstrates the smooth spring animation.
 */
export const Interactive: Story = {
  render: function InteractiveStory() {
    const [activeIndex, setActiveIndex] = useState(0)
    const items = ['Home', 'Recipes', 'List', 'Profile']
    
    return (
      <MemoryRouter>
        <div className="relative h-14 w-80 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 flex items-center justify-around px-2">
          <DockIndicator activeIndex={activeIndex} itemCount={items.length} />
          {items.map((label, index) => (
            <button
              key={label}
              onClick={() => setActiveIndex(index)}
              className={`
                flex flex-col items-center justify-center gap-1 px-2 py-1 z-10
                min-w-[44px] min-h-[44px] transition-colors
                ${index === activeIndex ? 'text-white' : 'text-white/60'}
              `}
            >
              <span className="text-[10px] tracking-wide uppercase font-medium">
                {label}
              </span>
            </button>
          ))}
        </div>
      </MemoryRouter>
    )
  },
  decorators: [], // Remove default decorator
  parameters: {
    docs: {
      description: {
        story: 'Click on different items to see the indicator slide smoothly. The spring physics create a natural, bouncy feel.',
      },
    },
  },
}

/**
 * Full dock with icons - shows how the indicator looks in context.
 */
export const WithFullDock: Story = {
  render: function FullDockStory() {
    const [activeIndex, setActiveIndex] = useState(0)
    const items = [
      { icon: BookOpen, label: 'Recipes', href: '/recipes' },
      { icon: Book, label: 'Cookbooks', href: '/cookbooks' },
      { icon: ShoppingCart, label: 'List', href: '/shopping-list' },
      { icon: User, label: 'Profile', href: '/account/settings' },
    ]
    
    return (
      <MemoryRouter>
        <div className="relative h-14 w-80 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 flex items-center justify-around px-2">
          <DockIndicator activeIndex={activeIndex} itemCount={items.length} />
          {items.map((item, index) => (
            <div key={item.label} onClick={() => setActiveIndex(index)} className="z-10">
              <DockItem
                icon={item.icon}
                label={item.label}
                href={item.href}
                active={index === activeIndex}
              />
            </div>
          ))}
        </div>
      </MemoryRouter>
    )
  },
  decorators: [], // Remove default decorator
  parameters: {
    docs: {
      description: {
        story: 'The indicator with actual DockItem components. Shows the complete visual effect.',
      },
    },
  },
}

// =============================================================================
// ANIMATION TUNING
// =============================================================================

/**
 * Rapid switching to test animation queuing.
 */
export const RapidSwitching: Story = {
  render: function RapidSwitchingStory() {
    const [activeIndex, setActiveIndex] = useState(0)
    
    return (
      <MemoryRouter>
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-14 w-80 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 flex items-center justify-around px-2">
            <DockIndicator activeIndex={activeIndex} itemCount={4} />
            {[0, 1, 2, 3].map((index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`
                  flex items-center justify-center z-10
                  w-11 h-11 rounded-full transition-colors
                  ${index === activeIndex ? 'text-white' : 'text-white/60'}
                `}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className="px-3 py-1 bg-white/10 rounded text-white text-sm"
              >
                Go to {index + 1}
              </button>
            ))}
          </div>
          <p className="text-white/60 text-sm">Click buttons rapidly to test animation handling</p>
        </div>
      </MemoryRouter>
    )
  },
  decorators: [], // Remove default decorator
  parameters: {
    docs: {
      description: {
        story: 'Test how the animation handles rapid position changes. Should interrupt and retarget smoothly.',
      },
    },
  },
}

// =============================================================================
// REDUCED MOTION
// =============================================================================

/**
 * Story simulating reduced motion preference.
 * 
 * Note: This is a simulation for visual testing. In the actual browser,
 * the component will detect the system preference automatically.
 */
export const ReducedMotion: Story = {
  args: {
    activeIndex: 0,
    itemCount: 4,
  },
  parameters: {
    docs: {
      description: {
        story: `
When users have \`prefers-reduced-motion: reduce\` enabled, the indicator 
should instantly appear at the new position without animating.

To test this in your browser:
- macOS: System Preferences → Accessibility → Display → Reduce motion
- Windows: Settings → Ease of Access → Display → Show animations
- Chrome DevTools: Rendering panel → Emulate CSS media feature
        `,
      },
    },
  },
}

// =============================================================================
// DIFFERENT ITEM COUNTS
// =============================================================================

/**
 * Dock with 3 items.
 */
export const ThreeItems: Story = {
  args: {
    activeIndex: 1,
    itemCount: 3,
  },
  decorators: [
    (Story) => (
      <div className="relative h-14 w-60 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 flex items-center justify-around px-4">
        <Story />
      </div>
    ),
  ],
}

/**
 * Dock with 5 items.
 */
export const FiveItems: Story = {
  args: {
    activeIndex: 2,
    itemCount: 5,
  },
  decorators: [
    (Story) => (
      <div className="relative h-14 w-96 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 flex items-center justify-around px-4">
        <Story />
      </div>
    ),
  ],
}

// =============================================================================
// STYLING VARIATIONS
// =============================================================================

/**
 * Different pill colors and styles.
 */
export const StylingVariations: Story = {
  render: () => (
    <MemoryRouter>
      <div className="flex flex-col gap-4">
        <div className="relative h-14 w-80 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 flex items-center justify-around px-2">
          <DockIndicator activeIndex={1} itemCount={4} className="bg-white/10" />
          {['A', 'B', 'C', 'D'].map((label, i) => (
            <span key={label} className={`z-10 ${i === 1 ? 'text-white' : 'text-white/60'}`}>{label}</span>
          ))}
        </div>
        <div className="relative h-14 w-80 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 flex items-center justify-around px-2">
          <DockIndicator activeIndex={2} itemCount={4} className="bg-white/20" />
          {['A', 'B', 'C', 'D'].map((label, i) => (
            <span key={label} className={`z-10 ${i === 2 ? 'text-white' : 'text-white/60'}`}>{label}</span>
          ))}
        </div>
      </div>
    </MemoryRouter>
  ),
  decorators: [], // Remove default decorator
  parameters: {
    docs: {
      description: {
        story: 'Different background opacity variations for the indicator pill.',
      },
    },
  },
}
