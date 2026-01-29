import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import {
  Home,
  Search,
  Book,
  Heart,
  Settings,
  User,
  Bell,
  Plus,
  UtensilsCrossed,
  ShoppingCart,
  Calendar,
  Sparkles,
} from 'lucide-react'
import { SpoonjoyLogo } from '../app/components/ui/spoonjoy-logo'
import {
  Navbar,
  NavbarSection,
  NavbarItem,
  NavbarLabel,
  NavbarSpacer,
  NavbarDivider,
} from '../app/components/ui/navbar'
import { Avatar } from '../app/components/ui/avatar'

/**
 * # Navbar
 *
 * The horizontal navigation bar. The "I know where I am and where I can go" of
 * user interfaces. The strip of links that makes your single-page app feel like
 * an actual website.
 *
 * Unlike its vertical cousin the Sidebar, the Navbar lives at the top of your
 * layout and is always visible. It's prime real estate — use it wisely.
 *
 * ## The Anatomy
 *
 * - **Navbar**: The container. It's a flex row with gap, so things space out nicely.
 * - **NavbarSection**: Groups of related items. Use LayoutGroup for that sweet animation magic.
 * - **NavbarItem**: Individual nav items. Can be links or buttons.
 * - **NavbarLabel**: Text inside items, truncates when needed.
 * - **NavbarSpacer**: The invisible hero. Pushes things apart with flex-1.
 * - **NavbarDivider**: A vertical line. Visual separation for when you need it.
 *
 * ## The Current Indicator
 *
 * When a NavbarItem has `current={true}`, it gets a snazzy animated underline
 * using Framer Motion's `layoutId`. Navigate between items and watch it slide.
 * It's the little things.
 *
 * ## When to Use Navbar
 *
 * - **Desktop navigation**: Primary nav for apps with a handful of top-level routes
 * - **Secondary nav**: Sub-navigation within a section
 * - **Tool bars**: Row of action buttons in an app header
 *
 * ## When NOT to Use Navbar
 *
 * - When you have many nav items (use a sidebar instead)
 * - On mobile (this is a desktop component — use a mobile menu pattern)
 * - For vertical navigation (that's what Sidebar is for)
 *
 * ## Responsive Reality Check
 *
 * This component is designed for desktop viewports. On mobile, you'll want to
 * hide it and show a hamburger menu or bottom navigation instead. The Navbar
 * doesn't magically become a drawer when the screen shrinks — that's your job.
 */
const meta: Meta<typeof Navbar> = {
  title: 'UI/Navbar',
  component: Navbar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A horizontal navigation component with animated current-page indicator. Built with HeadlessUI and Framer Motion.

Use NavbarSection to group items, NavbarSpacer to push items apart, and NavbarDivider for visual separation. The \`current\` prop on NavbarItem triggers an animated underline indicator.
        `,
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// BASIC EXAMPLES
// =============================================================================

/**
 * The simplest navbar. A few links, one is current.
 * Navigation in its purest form.
 */
export const Default: Story = {
  render: () => (
    <Navbar>
      <NavbarSection>
        <NavbarItem href="/" current>
          <NavbarLabel>Home</NavbarLabel>
        </NavbarItem>
        <NavbarItem href="/recipes">
          <NavbarLabel>Recipes</NavbarLabel>
        </NavbarItem>
        <NavbarItem href="/collections">
          <NavbarLabel>Collections</NavbarLabel>
        </NavbarItem>
        <NavbarItem href="/about">
          <NavbarLabel>About</NavbarLabel>
        </NavbarItem>
      </NavbarSection>
    </Navbar>
  ),
}

/**
 * With icons, because plain text is so 2005.
 * Icons make navigation instantly scannable.
 */
export const WithIcons: Story = {
  render: () => (
    <Navbar>
      <NavbarSection>
        <NavbarItem href="/" current>
          <Home data-slot="icon" />
          <NavbarLabel>Home</NavbarLabel>
        </NavbarItem>
        <NavbarItem href="/recipes">
          <Book data-slot="icon" />
          <NavbarLabel>Recipes</NavbarLabel>
        </NavbarItem>
        <NavbarItem href="/favorites">
          <Heart data-slot="icon" />
          <NavbarLabel>Favorites</NavbarLabel>
        </NavbarItem>
        <NavbarItem href="/settings">
          <Settings data-slot="icon" />
          <NavbarLabel>Settings</NavbarLabel>
        </NavbarItem>
      </NavbarSection>
    </Navbar>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Icons use `data-slot="icon"` for proper sizing and color. They appear before the label.',
      },
    },
  },
}

/**
 * Icon-only items for a more compact look.
 * Perfect for secondary actions or when space is tight.
 */
export const IconOnly: Story = {
  render: () => (
    <Navbar>
      <NavbarSection>
        <NavbarItem href="/" aria-label="Home" current>
          <Home data-slot="icon" />
        </NavbarItem>
        <NavbarItem href="/search" aria-label="Search">
          <Search data-slot="icon" />
        </NavbarItem>
        <NavbarItem href="/favorites" aria-label="Favorites">
          <Heart data-slot="icon" />
        </NavbarItem>
        <NavbarItem href="/notifications" aria-label="Notifications">
          <Bell data-slot="icon" />
        </NavbarItem>
      </NavbarSection>
    </Navbar>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Always add `aria-label` to icon-only items. Screen readers need words, not pictures.',
      },
    },
  },
}

// =============================================================================
// WITH SPACER AND DIVIDER
// =============================================================================

/**
 * ## The Classic Layout
 *
 * Logo on the left, main nav in the middle-ish, user stuff on the right.
 * This is the pattern you've seen a thousand times because it works.
 */
export const WithSpacer: Story = {
  render: () => (
    <Navbar>
      <NavbarSection>
        <NavbarItem href="/">
          <SpoonjoyLogo />
          <NavbarLabel className="font-semibold">Spoonjoy</NavbarLabel>
        </NavbarItem>
      </NavbarSection>
      <NavbarSpacer />
      <NavbarSection>
        <NavbarItem href="/recipes" current>
          <NavbarLabel>Recipes</NavbarLabel>
        </NavbarItem>
        <NavbarItem href="/collections">
          <NavbarLabel>Collections</NavbarLabel>
        </NavbarItem>
        <NavbarItem href="/meal-plans">
          <NavbarLabel>Meal Plans</NavbarLabel>
        </NavbarItem>
      </NavbarSection>
      <NavbarSpacer />
      <NavbarSection>
        <NavbarItem href="/profile">
          <Avatar
            src="https://i.pravatar.cc/150?img=32"
            className="size-6"
            initials="CA"
          />
        </NavbarItem>
      </NavbarSection>
    </Navbar>
  ),
  parameters: {
    docs: {
      description: {
        story: 'NavbarSpacer uses `flex-1` to push sections apart. Use two spacers for center alignment.',
      },
    },
  },
}

/**
 * Dividers create visual separation without spacing things out.
 * Useful when sections are related but distinct.
 */
export const WithDivider: Story = {
  render: () => (
    <Navbar>
      <NavbarSection>
        <NavbarItem href="/recipes" current>
          <Book data-slot="icon" />
          <NavbarLabel>Recipes</NavbarLabel>
        </NavbarItem>
        <NavbarItem href="/collections">
          <Heart data-slot="icon" />
          <NavbarLabel>Collections</NavbarLabel>
        </NavbarItem>
      </NavbarSection>
      <NavbarDivider />
      <NavbarSection>
        <NavbarItem href="/shopping-list">
          <ShoppingCart data-slot="icon" />
          <NavbarLabel>Shopping</NavbarLabel>
        </NavbarItem>
        <NavbarItem href="/meal-plans">
          <Calendar data-slot="icon" />
          <NavbarLabel>Meal Plans</NavbarLabel>
        </NavbarItem>
      </NavbarSection>
    </Navbar>
  ),
  parameters: {
    docs: {
      description: {
        story: 'NavbarDivider is a vertical line. It\'s `aria-hidden` because it\'s purely decorative.',
      },
    },
  },
}

// =============================================================================
// BUTTON ITEMS
// =============================================================================

/**
 * ## Button Items
 *
 * Not every nav item needs to navigate. Some trigger actions.
 * Omit `href` to get a button instead of a link.
 */
export const WithButtons: Story = {
  render: () => (
    <Navbar>
      <NavbarSection>
        <NavbarItem href="/">
          <SpoonjoyLogo />
          <NavbarLabel className="font-semibold">Spoonjoy</NavbarLabel>
        </NavbarItem>
      </NavbarSection>
      <NavbarSpacer />
      <NavbarSection>
        <NavbarItem href="/recipes" current>
          <NavbarLabel>Recipes</NavbarLabel>
        </NavbarItem>
        <NavbarItem href="/collections">
          <NavbarLabel>Collections</NavbarLabel>
        </NavbarItem>
      </NavbarSection>
      <NavbarSpacer />
      <NavbarSection>
        <NavbarItem onClick={() => alert('New recipe modal would open')}>
          <Plus data-slot="icon" />
          <NavbarLabel>New Recipe</NavbarLabel>
        </NavbarItem>
        <NavbarDivider />
        <NavbarItem onClick={() => alert('Search modal would open')}>
          <Search data-slot="icon" />
        </NavbarItem>
        <NavbarItem href="/profile">
          <Avatar
            src="https://i.pravatar.cc/150?img=32"
            className="size-6"
            initials="CA"
          />
        </NavbarItem>
      </NavbarSection>
    </Navbar>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Mix links and buttons freely. Items without `href` render as HeadlessUI buttons.',
      },
    },
  },
}

// =============================================================================
// WITH AVATAR
// =============================================================================

/**
 * ## Avatar in Navigation
 *
 * Avatars have special styling in NavbarItem — slightly negative margin
 * and a specific size. They look right at home.
 */
export const WithAvatar: Story = {
  render: () => (
    <Navbar>
      <NavbarSection>
        <NavbarItem href="/" current>
          <Home data-slot="icon" />
          <NavbarLabel>Dashboard</NavbarLabel>
        </NavbarItem>
        <NavbarItem href="/recipes">
          <Book data-slot="icon" />
          <NavbarLabel>Recipes</NavbarLabel>
        </NavbarItem>
      </NavbarSection>
      <NavbarSpacer />
      <NavbarSection>
        <NavbarItem href="/chef/gordon">
          <Avatar
            src="https://i.pravatar.cc/150?img=60"
            className="size-6"
            initials="GR"
          />
          <NavbarLabel>Chef Gordon</NavbarLabel>
        </NavbarItem>
      </NavbarSection>
    </Navbar>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Avatars use `data-slot="avatar"` styling automatically. They work as both standalone items and paired with labels.',
      },
    },
  },
}

// =============================================================================
// CURRENT STATE
// =============================================================================

/**
 * ## The Current Indicator
 *
 * The magic line that shows where you are. It animates between items
 * using Framer Motion's `layoutId`. Watch it slide!
 */
export const CurrentIndicator: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Home is current:</p>
        <Navbar>
          <NavbarSection>
            <NavbarItem href="/" current>
              <NavbarLabel>Home</NavbarLabel>
            </NavbarItem>
            <NavbarItem href="/recipes">
              <NavbarLabel>Recipes</NavbarLabel>
            </NavbarItem>
            <NavbarItem href="/collections">
              <NavbarLabel>Collections</NavbarLabel>
            </NavbarItem>
          </NavbarSection>
        </Navbar>
      </div>
      <div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Recipes is current:</p>
        <Navbar>
          <NavbarSection>
            <NavbarItem href="/">
              <NavbarLabel>Home</NavbarLabel>
            </NavbarItem>
            <NavbarItem href="/recipes" current>
              <NavbarLabel>Recipes</NavbarLabel>
            </NavbarItem>
            <NavbarItem href="/collections">
              <NavbarLabel>Collections</NavbarLabel>
            </NavbarItem>
          </NavbarSection>
        </Navbar>
      </div>
      <div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Collections is current:</p>
        <Navbar>
          <NavbarSection>
            <NavbarItem href="/">
              <NavbarLabel>Home</NavbarLabel>
            </NavbarItem>
            <NavbarItem href="/recipes">
              <NavbarLabel>Recipes</NavbarLabel>
            </NavbarItem>
            <NavbarItem href="/collections" current>
              <NavbarLabel>Collections</NavbarLabel>
            </NavbarItem>
          </NavbarSection>
        </Navbar>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The current indicator is an animated underline. In a real app, only one item per NavbarSection should be current.',
      },
    },
  },
}

// =============================================================================
// REAL-WORLD EXAMPLES
// =============================================================================

/**
 * ## Recipe App Header
 *
 * A complete navbar for a recipe application.
 * Logo, main nav, actions, and user menu.
 */
export const RecipeAppHeader: Story = {
  render: () => (
    <Navbar>
      <NavbarSection>
        <NavbarItem href="/">
          <UtensilsCrossed data-slot="icon" />
          <NavbarLabel className="font-bold text-lg">Spoonjoy</NavbarLabel>
        </NavbarItem>
      </NavbarSection>
      <NavbarDivider />
      <NavbarSection>
        <NavbarItem href="/recipes" current>
          <Book data-slot="icon" />
          <NavbarLabel>Recipes</NavbarLabel>
        </NavbarItem>
        <NavbarItem href="/collections">
          <Heart data-slot="icon" />
          <NavbarLabel>Collections</NavbarLabel>
        </NavbarItem>
        <NavbarItem href="/meal-plans">
          <Calendar data-slot="icon" />
          <NavbarLabel>Meal Plans</NavbarLabel>
        </NavbarItem>
        <NavbarItem href="/shopping-list">
          <ShoppingCart data-slot="icon" />
          <NavbarLabel>Shopping</NavbarLabel>
        </NavbarItem>
      </NavbarSection>
      <NavbarSpacer />
      <NavbarSection>
        <NavbarItem onClick={() => alert('AI recipe suggestions!')}>
          <Sparkles data-slot="icon" />
          <NavbarLabel>Inspire Me</NavbarLabel>
        </NavbarItem>
        <NavbarItem onClick={() => alert('Create new recipe')}>
          <Plus data-slot="icon" />
        </NavbarItem>
        <NavbarItem onClick={() => alert('Search')}>
          <Search data-slot="icon" />
        </NavbarItem>
        <NavbarDivider />
        <NavbarItem href="/profile">
          <Avatar
            src="https://i.pravatar.cc/150?img=32"
            className="size-6"
            initials="CA"
          />
        </NavbarItem>
      </NavbarSection>
    </Navbar>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A complete recipe app header: branding, navigation, actions, and user avatar. Everything in its place.',
      },
    },
  },
}

/**
 * ## Sub-Navigation
 *
 * A secondary navbar for navigating within a section.
 * Simpler, more focused.
 */
export const SubNavigation: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="text-sm text-zinc-500 dark:text-zinc-400">
        You're viewing: My Cookbooks → Italian Favorites
      </div>
      <Navbar className="border-b border-zinc-200 dark:border-zinc-700 pb-2.5">
        <NavbarSection>
          <NavbarItem href="/cookbook/1" current>
            <NavbarLabel>All Recipes</NavbarLabel>
          </NavbarItem>
          <NavbarItem href="/cookbook/1/recent">
            <NavbarLabel>Recently Added</NavbarLabel>
          </NavbarItem>
          <NavbarItem href="/cookbook/1/favorites">
            <NavbarLabel>My Favorites</NavbarLabel>
          </NavbarItem>
          <NavbarItem href="/cookbook/1/shared">
            <NavbarLabel>Shared with Me</NavbarLabel>
          </NavbarItem>
        </NavbarSection>
      </Navbar>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Sub-navigation for filtering within a section. The current indicator works the same way.',
      },
    },
  },
}

/**
 * ## Dashboard Toolbar
 *
 * Not navigation, but a row of tools. Same component, different purpose.
 */
export const DashboardToolbar: Story = {
  render: () => (
    <Navbar className="bg-zinc-50 dark:bg-zinc-800 rounded-lg px-2">
      <NavbarSection>
        <NavbarItem onClick={() => alert('New recipe')}>
          <Plus data-slot="icon" />
          <NavbarLabel>New Recipe</NavbarLabel>
        </NavbarItem>
        <NavbarItem onClick={() => alert('Import')}>
          <Book data-slot="icon" />
          <NavbarLabel>Import</NavbarLabel>
        </NavbarItem>
      </NavbarSection>
      <NavbarDivider />
      <NavbarSection>
        <NavbarItem onClick={() => alert('AI suggestions')}>
          <Sparkles data-slot="icon" />
          <NavbarLabel>AI Suggest</NavbarLabel>
        </NavbarItem>
      </NavbarSection>
      <NavbarSpacer />
      <NavbarSection>
        <NavbarItem onClick={() => alert('Search')}>
          <Search data-slot="icon" />
          <NavbarLabel>Search</NavbarLabel>
        </NavbarItem>
        <NavbarItem onClick={() => alert('Settings')}>
          <Settings data-slot="icon" />
        </NavbarItem>
      </NavbarSection>
    </Navbar>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Navbar as a toolbar. All buttons, no navigation. Same great component.',
      },
    },
  },
}

/**
 * ## Minimal Header
 *
 * Sometimes less is more. Logo and user only.
 */
export const MinimalHeader: Story = {
  render: () => (
    <Navbar>
      <NavbarSection>
        <NavbarItem href="/">
          <SpoonjoyLogo />
          <NavbarLabel className="font-semibold">Spoonjoy</NavbarLabel>
        </NavbarItem>
      </NavbarSection>
      <NavbarSpacer />
      <NavbarSection>
        <NavbarItem href="/profile">
          <Avatar
            src="https://i.pravatar.cc/150?img=32"
            className="size-6"
            initials="CA"
          />
          <NavbarLabel>Chef Ari</NavbarLabel>
        </NavbarItem>
      </NavbarSection>
    </Navbar>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The minimalist approach. When your sidebar does the heavy lifting.',
      },
    },
  },
}

// =============================================================================
// RESPONSIVE CONSIDERATIONS
// =============================================================================

/**
 * ## Desktop Only
 *
 * This navbar is designed for desktop. On mobile, you'd typically:
 * 1. Hide this entire navbar
 * 2. Show a hamburger menu that opens a drawer
 * 3. Or use bottom navigation
 *
 * This story shows what NOT to do — a navbar that's too crowded on small screens.
 */
export const ResponsiveConsiderations: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
          This navbar will overflow on small screens (resize your browser to see):
        </p>
        <div className="overflow-x-auto">
          <Navbar className="min-w-max">
            <NavbarSection>
              <NavbarItem href="/">
                <SpoonjoyLogo />
                <NavbarLabel>Spoonjoy</NavbarLabel>
              </NavbarItem>
            </NavbarSection>
            <NavbarSection>
              <NavbarItem href="/recipes" current>
                <NavbarLabel>Recipes</NavbarLabel>
              </NavbarItem>
              <NavbarItem href="/collections">
                <NavbarLabel>Collections</NavbarLabel>
              </NavbarItem>
              <NavbarItem href="/meal-plans">
                <NavbarLabel>Meal Plans</NavbarLabel>
              </NavbarItem>
              <NavbarItem href="/shopping">
                <NavbarLabel>Shopping List</NavbarLabel>
              </NavbarItem>
              <NavbarItem href="/nutrition">
                <NavbarLabel>Nutrition</NavbarLabel>
              </NavbarItem>
              <NavbarItem href="/settings">
                <NavbarLabel>Settings</NavbarLabel>
              </NavbarItem>
            </NavbarSection>
            <NavbarSpacer />
            <NavbarSection>
              <NavbarItem href="/profile">
                <Avatar src="https://i.pravatar.cc/150?img=32" className="size-6" />
              </NavbarItem>
            </NavbarSection>
          </Navbar>
        </div>
      </div>
      <div className="text-sm text-zinc-600 dark:text-zinc-400 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
        <strong>Pro tip:</strong> Use CSS to hide this navbar on mobile
        (<code>hidden lg:flex</code>) and show a mobile-friendly alternative instead.
        The Navbar component won't magically transform into a drawer — that's a different component.
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Navbar is inherently a desktop pattern. Plan your responsive strategy separately.',
      },
    },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Tests that navbar items can be focused via keyboard.
 */
export const KeyboardNavigation: Story = {
  render: () => (
    <Navbar>
      <NavbarSection>
        <NavbarItem href="/" data-testid="home" current>
          <NavbarLabel>Home</NavbarLabel>
        </NavbarItem>
        <NavbarItem href="/recipes" data-testid="recipes">
          <NavbarLabel>Recipes</NavbarLabel>
        </NavbarItem>
        <NavbarItem href="/about" data-testid="about">
          <NavbarLabel>About</NavbarLabel>
        </NavbarItem>
      </NavbarSection>
    </Navbar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Tab to first item
    await userEvent.tab()
    const homeLink = canvas.getByTestId('home').querySelector('a')
    await expect(homeLink).toHaveFocus()

    // Tab to second item
    await userEvent.tab()
    const recipesLink = canvas.getByTestId('recipes').querySelector('a')
    await expect(recipesLink).toHaveFocus()

    // Tab to third item
    await userEvent.tab()
    const aboutLink = canvas.getByTestId('about').querySelector('a')
    await expect(aboutLink).toHaveFocus()
  },
  parameters: {
    docs: {
      description: {
        story: 'Navbar items are focusable via Tab. Essential for keyboard users.',
      },
    },
  },
}

/**
 * Tests that the current item has the correct data attribute.
 */
export const CurrentItemAttribute: Story = {
  render: () => (
    <Navbar>
      <NavbarSection>
        <NavbarItem href="/" data-testid="home">
          <NavbarLabel>Home</NavbarLabel>
        </NavbarItem>
        <NavbarItem href="/recipes" data-testid="recipes" current>
          <NavbarLabel>Recipes</NavbarLabel>
        </NavbarItem>
        <NavbarItem href="/about" data-testid="about">
          <NavbarLabel>About</NavbarLabel>
        </NavbarItem>
      </NavbarSection>
    </Navbar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // The current item should have data-current="true"
    const recipesItem = canvas.getByTestId('recipes').querySelector('a')
    await expect(recipesItem).toHaveAttribute('data-current', 'true')

    // Non-current items should not have data-current
    const homeItem = canvas.getByTestId('home').querySelector('a')
    await expect(homeItem).not.toHaveAttribute('data-current')
  },
  parameters: {
    docs: {
      description: {
        story: 'Current items get `data-current="true"` attribute for styling and identification.',
      },
    },
  },
}

/**
 * Tests that button items (without href) work correctly.
 */
export const ButtonItemInteraction: Story = {
  render: () => (
    <Navbar>
      <NavbarSection>
        <NavbarItem href="/">
          <NavbarLabel>Home</NavbarLabel>
        </NavbarItem>
        <NavbarItem data-testid="action-button" onClick={() => {}}>
          <Plus data-slot="icon" />
          <NavbarLabel>Add New</NavbarLabel>
        </NavbarItem>
      </NavbarSection>
    </Navbar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // The button item should be a button, not a link
    const buttonItem = canvas.getByTestId('action-button').querySelector('button')
    await expect(buttonItem).toBeInTheDocument()
    await expect(buttonItem).not.toHaveAttribute('href')
  },
  parameters: {
    docs: {
      description: {
        story: 'Items without `href` render as buttons. They\'re still keyboard accessible.',
      },
    },
  },
}

/**
 * Tests that links have correct href attributes.
 */
export const LinkHrefAttributes: Story = {
  render: () => (
    <Navbar>
      <NavbarSection>
        <NavbarItem href="/" data-testid="home">
          <NavbarLabel>Home</NavbarLabel>
        </NavbarItem>
        <NavbarItem href="/recipes?filter=recent" data-testid="recipes">
          <NavbarLabel>Recent Recipes</NavbarLabel>
        </NavbarItem>
        <NavbarItem href="/about#team" data-testid="team">
          <NavbarLabel>Our Team</NavbarLabel>
        </NavbarItem>
      </NavbarSection>
    </Navbar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Check href attributes
    const homeLink = canvas.getByTestId('home').querySelector('a')
    await expect(homeLink).toHaveAttribute('href', '/')

    const recipesLink = canvas.getByTestId('recipes').querySelector('a')
    await expect(recipesLink).toHaveAttribute('href', '/recipes?filter=recent')

    const teamLink = canvas.getByTestId('team').querySelector('a')
    await expect(teamLink).toHaveAttribute('href', '/about#team')
  },
  parameters: {
    docs: {
      description: {
        story: 'Links support full URLs including query strings and hash fragments.',
      },
    },
  },
}

/**
 * Tests that the divider is properly hidden from accessibility tree.
 */
export const DividerAccessibility: Story = {
  render: () => (
    <Navbar>
      <NavbarSection>
        <NavbarItem href="/">
          <NavbarLabel>Home</NavbarLabel>
        </NavbarItem>
      </NavbarSection>
      <NavbarDivider data-testid="divider" />
      <NavbarSection>
        <NavbarItem href="/about">
          <NavbarLabel>About</NavbarLabel>
        </NavbarItem>
      </NavbarSection>
    </Navbar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Divider should be aria-hidden
    const divider = canvas.getByTestId('divider')
    await expect(divider).toHaveAttribute('aria-hidden', 'true')
  },
  parameters: {
    docs: {
      description: {
        story: 'NavbarDivider has `aria-hidden="true"`. It\'s decorative, not semantic.',
      },
    },
  },
}

/**
 * Tests hover and focus states visually.
 */
export const HoverAndFocusStates: Story = {
  render: () => (
    <Navbar>
      <NavbarSection>
        <NavbarItem href="/" data-testid="home">
          <Home data-slot="icon" />
          <NavbarLabel>Home</NavbarLabel>
        </NavbarItem>
        <NavbarItem href="/recipes" data-testid="recipes" current>
          <Book data-slot="icon" />
          <NavbarLabel>Recipes</NavbarLabel>
        </NavbarItem>
        <NavbarItem href="/settings" data-testid="settings">
          <Settings data-slot="icon" />
          <NavbarLabel>Settings</NavbarLabel>
        </NavbarItem>
      </NavbarSection>
    </Navbar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Hover over an item
    const homeItem = canvas.getByTestId('home')
    await userEvent.hover(homeItem)

    // Item should still be accessible
    const homeLink = homeItem.querySelector('a')
    await expect(homeLink).toBeInTheDocument()
  },
  parameters: {
    docs: {
      description: {
        story: 'Items have hover and focus states. The background changes subtly on hover.',
      },
    },
  },
}
