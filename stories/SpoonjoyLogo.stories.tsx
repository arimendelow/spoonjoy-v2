import type { Meta, StoryObj } from '@storybook/react-vite'
import { SpoonjoyLogo } from '../app/components/ui/spoonjoy-logo'

/**
 * # SpoonjoyLogo
 *
 * The Spoonjoy brand mark - an abstract "SJ" that looks like it could be
 * either a stylized spoon or a recipe card folded just right. Or both.
 * That's the magic of abstract logos.
 *
 * ## Features
 *
 * - **Scalable** — SVG-based, looks crisp at any size
 * - **Color variants** — Uses currentColor by default for seamless theming
 * - **Semantic** — Includes data-slot="icon" for navigation components
 *
 * ## Usage Notes
 *
 * The logo uses `fill-current!` to override any `fill-none` that might be
 * applied by navbar/sidebar icon containers. This is because it's a filled
 * logo (not stroke-based like Lucide icons).
 *
 * When used in navigation, it automatically adapts to the parent's text color.
 */
const meta: Meta<typeof SpoonjoyLogo> = {
  title: 'Brand/SpoonjoyLogo',
  component: SpoonjoyLogo,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The Spoonjoy logo - an abstract "SJ" mark used for branding throughout the app.

Uses currentColor by default so it inherits text color from the parent element,
making it seamlessly adapt to light/dark themes and navigation states.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'range', min: 16, max: 128, step: 8 },
      description: 'Size of the logo in pixels. Defaults to 24.',
    },
    variant: {
      control: 'select',
      options: ['current', 'black', 'white'],
      description: 'Color variant. "current" uses parent text color.',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply.',
    },
  },
}

export default meta
type Story = StoryObj<typeof SpoonjoyLogo>

/**
 * The default logo using currentColor. It inherits the text color
 * from its parent element, making it perfect for navigation.
 */
export const Default: Story = {
  args: {
    size: 48,
  },
}

/**
 * The logo at various sizes, showing how it scales gracefully.
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-6">
      <div className="text-center">
        <SpoonjoyLogo size={16} />
        <p className="mt-2 text-xs text-zinc-500">16px</p>
      </div>
      <div className="text-center">
        <SpoonjoyLogo size={24} />
        <p className="mt-2 text-xs text-zinc-500">24px</p>
      </div>
      <div className="text-center">
        <SpoonjoyLogo size={32} />
        <p className="mt-2 text-xs text-zinc-500">32px</p>
      </div>
      <div className="text-center">
        <SpoonjoyLogo size={48} />
        <p className="mt-2 text-xs text-zinc-500">48px</p>
      </div>
      <div className="text-center">
        <SpoonjoyLogo size={64} />
        <p className="mt-2 text-xs text-zinc-500">64px</p>
      </div>
      <div className="text-center">
        <SpoonjoyLogo size={96} />
        <p className="mt-2 text-xs text-zinc-500">96px</p>
      </div>
    </div>
  ),
}

/**
 * Color variants for different backgrounds.
 */
export const Variants: Story = {
  render: () => (
    <div className="flex gap-8">
      <div className="p-6 rounded-lg bg-white text-center border border-zinc-200">
        <SpoonjoyLogo size={48} variant="current" />
        <p className="mt-2 text-sm text-zinc-600">current (inherits)</p>
      </div>
      <div className="p-6 rounded-lg bg-zinc-100 text-center">
        <SpoonjoyLogo size={48} variant="black" />
        <p className="mt-2 text-sm text-zinc-600">black</p>
      </div>
      <div className="p-6 rounded-lg bg-zinc-800 text-center">
        <SpoonjoyLogo size={48} variant="white" />
        <p className="mt-2 text-sm text-zinc-300">white</p>
      </div>
    </div>
  ),
}

/**
 * Shows how the logo inherits color from its parent.
 * The "current" variant (default) uses currentColor, so it
 * matches whatever text color is set on the parent.
 */
export const InheritsParentColor: Story = {
  render: () => (
    <div className="flex gap-8">
      <div className="text-blue-600">
        <SpoonjoyLogo size={48} />
        <p className="text-sm mt-2">Blue parent</p>
      </div>
      <div className="text-green-600">
        <SpoonjoyLogo size={48} />
        <p className="text-sm mt-2">Green parent</p>
      </div>
      <div className="text-amber-600">
        <SpoonjoyLogo size={48} />
        <p className="text-sm mt-2">Amber parent</p>
      </div>
      <div className="text-purple-600">
        <SpoonjoyLogo size={48} />
        <p className="text-sm mt-2">Purple parent</p>
      </div>
    </div>
  ),
}

/**
 * The logo in a dark navigation context, similar to how it appears
 * in the actual app navbar.
 */
export const InNavbar: Story = {
  render: () => (
    <nav className="bg-zinc-800 dark:bg-zinc-950 text-white px-6 py-4 flex justify-between items-center rounded-lg min-w-[400px]">
      <div className="flex items-center gap-3">
        <SpoonjoyLogo size={24} />
        <span className="text-xl font-bold">Spoonjoy</span>
      </div>
      <div className="flex items-center gap-4 text-sm text-zinc-300">
        <span>Recipes</span>
        <span>Cookbooks</span>
      </div>
    </nav>
  ),
}

/**
 * The logo in a sidebar context with hover states.
 */
export const InSidebar: Story = {
  render: () => (
    <aside className="bg-zinc-100 dark:bg-zinc-900 w-64 p-4 rounded-lg">
      <div className="flex items-center gap-3 mb-6 px-2">
        <SpoonjoyLogo size={24} className="text-zinc-800 dark:text-white" />
        <span className="font-semibold text-zinc-800 dark:text-white">Spoonjoy</span>
      </div>
      <nav className="space-y-1">
        <div className="px-3 py-2 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium">
          Dashboard
        </div>
        <div className="px-3 py-2 rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800">
          My Recipes
        </div>
        <div className="px-3 py-2 rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800">
          Cookbooks
        </div>
      </nav>
    </aside>
  ),
}

/**
 * Using the logo as a loading indicator with animation.
 */
export const Animated: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <div className="text-center">
        <SpoonjoyLogo size={48} className="animate-pulse text-zinc-400" />
        <p className="mt-2 text-xs text-zinc-500">Pulse</p>
      </div>
      <div className="text-center">
        <SpoonjoyLogo size={48} className="animate-spin text-zinc-600" />
        <p className="mt-2 text-xs text-zinc-500">Spin (chaos mode)</p>
      </div>
      <div className="text-center">
        <SpoonjoyLogo size={48} className="animate-bounce text-zinc-600" />
        <p className="mt-2 text-xs text-zinc-500">Bounce</p>
      </div>
    </div>
  ),
}

/**
 * The logo responding to dark mode.
 */
export const DarkModeAdaptive: Story = {
  render: () => (
    <div className="flex gap-4">
      <div className="p-6 rounded-lg bg-white text-zinc-900 text-center border border-zinc-200">
        <SpoonjoyLogo size={48} />
        <p className="mt-2 text-sm">Light mode</p>
      </div>
      <div className="p-6 rounded-lg bg-zinc-900 text-white text-center">
        <SpoonjoyLogo size={48} />
        <p className="mt-2 text-sm">Dark mode</p>
      </div>
    </div>
  ),
}
