import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import {
  Home,
  Search,
  Book,
  Heart,
  Settings,
  User,
  Bell,
  LogOut,
  Plus,
  Utensils,
  Clock,
  Star,
  ShoppingCart,
  Calendar,
  TrendingUp,
  Users,
  FileText,
  BarChart3,
  MessageSquare,
  HelpCircle,
  CreditCard,
  Shield,
  Zap,
  Database,
  ChevronDown,
  Inbox,
  FolderOpen,
  Tag,
  Archive,
  Trash2,
  Send,
  Sparkles,
  Globe,
  Lock,
  ChevronsUpDown,
} from 'lucide-react'
import { SpoonjoyLogo } from '../app/components/ui/spoonjoy-logo'
import {
  Sidebar,
  SidebarBody,
  SidebarHeader,
  SidebarFooter,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
  SidebarHeading,
  SidebarDivider,
} from '../app/components/ui/sidebar'
import { Avatar } from '../app/components/ui/avatar'
import { Badge } from '../app/components/ui/badge'
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
  DropdownItem,
  DropdownLabel,
  DropdownDivider,
  DropdownHeader,
} from '../app/components/ui/dropdown'

/**
 * # Sidebar
 *
 * The vertical navigation overlord. The "I have opinions about where you should
 * go and I'm going to list them all" component.
 *
 * While the Navbar spreads itself thin across the top like avocado toast, the
 * Sidebar commits to the side. It's tall. It's proud. It doesn't care that
 * horizontal space is at a premium on mobile — that's a problem for the
 * SidebarLayout to solve with its fancy slide-in drawer.
 *
 * ## The Anatomy of a Sidebar
 *
 * - **Sidebar**: The container. A flex column that says "I'm here for the long haul."
 * - **SidebarHeader**: Top section with borders. Usually holds your logo or app name.
 * - **SidebarBody**: The scrollable middle. This is where the navigation lives.
 * - **SidebarFooter**: Bottom section with borders. Settings, user profile, that sort of thing.
 * - **SidebarSection**: Groups of related items. Uses LayoutGroup for animation magic.
 * - **SidebarHeading**: Tiny section titles. "Look, a category!"
 * - **SidebarItem**: The actual clickable things. Links or buttons, your choice.
 * - **SidebarLabel**: Text that truncates. Because your nav item names got too long.
 * - **SidebarSpacer**: The invisible pusher. Shoves things to the bottom.
 * - **SidebarDivider**: A horizontal line. When sections need visual separation.
 *
 * ## The Current Indicator
 *
 * When a SidebarItem has `current={true}`, it gets a snazzy animated vertical
 * line on the left. Using Framer Motion's `layoutId`, it slides between items
 * like butter on a hot pan. Chef's kiss.
 *
 * ## When to Use Sidebar
 *
 * - You have more than 5-6 navigation items
 * - Your app is a "power user" tool (dashboards, admin panels, IDEs)
 * - Users will spend significant time navigating between sections
 * - You want persistent navigation that doesn't require clicks to reveal
 *
 * ## When NOT to Use Sidebar
 *
 * - Simple marketing sites (use a Navbar)
 * - Mobile-first apps (sidebars don't belong on phones)
 * - When you have 3 navigation items (that's Navbar territory)
 *
 * ## The Icon Slot System
 *
 * Add `data-slot="icon"` to your Lucide icons and they'll magically size and
 * color themselves correctly. Same with `data-slot="avatar"` for avatars.
 * It's like CSS-in-JS but with data attributes and Tailwind arbitrary variants.
 */
const meta: Meta<typeof Sidebar> = {
  title: 'UI/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A vertical navigation component with animated current-page indicator. Built with HeadlessUI and Framer Motion.

The Sidebar is composed of multiple sub-components: SidebarHeader, SidebarBody, SidebarFooter, SidebarSection, SidebarItem, and more. The \`current\` prop on SidebarItem triggers an animated vertical indicator.

Typically used within SidebarLayout for full responsive behavior, but can be styled standalone for custom layouts.
        `,
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="h-[600px] w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
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
 * The simplest sidebar. Header, body, footer. Navigation in its most
 * fundamental form. No frills, no badges, no dropdown menus — just
 * good old-fashioned links.
 */
export const Default: Story = {
  render: () => (
    <Sidebar>
      <SidebarHeader>
        <SidebarItem href="/">
          <SpoonjoyLogo />
          <SidebarLabel>Spoonjoy</SidebarLabel>
        </SidebarItem>
      </SidebarHeader>
      <SidebarBody>
        <SidebarSection>
          <SidebarItem href="/" current>
            <Home data-slot="icon" />
            <SidebarLabel>Home</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/recipes">
            <Utensils data-slot="icon" />
            <SidebarLabel>Recipes</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/cookbooks">
            <Book data-slot="icon" />
            <SidebarLabel>Cookbooks</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/favorites">
            <Heart data-slot="icon" />
            <SidebarLabel>Favorites</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
      </SidebarBody>
      <SidebarFooter>
        <SidebarItem href="/settings">
          <Settings data-slot="icon" />
          <SidebarLabel>Settings</SidebarLabel>
        </SidebarItem>
      </SidebarFooter>
    </Sidebar>
  ),
}

/**
 * ## With Section Headings
 *
 * When your navigation has categories, use SidebarHeading to label them.
 * Small, muted text that says "here's a group of related things."
 */
export const WithSectionHeadings: Story = {
  render: () => (
    <Sidebar>
      <SidebarHeader>
        <SidebarItem href="/">
          <SpoonjoyLogo />
          <SidebarLabel>Spoonjoy</SidebarLabel>
        </SidebarItem>
      </SidebarHeader>
      <SidebarBody>
        <SidebarSection>
          <SidebarHeading>Browse</SidebarHeading>
          <SidebarItem href="/" current>
            <Home data-slot="icon" />
            <SidebarLabel>Home</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/recipes">
            <Utensils data-slot="icon" />
            <SidebarLabel>Recipes</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/cookbooks">
            <Book data-slot="icon" />
            <SidebarLabel>Cookbooks</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
        <SidebarSection>
          <SidebarHeading>Planning</SidebarHeading>
          <SidebarItem href="/meal-plans">
            <Calendar data-slot="icon" />
            <SidebarLabel>Meal Plans</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/shopping-list">
            <ShoppingCart data-slot="icon" />
            <SidebarLabel>Shopping List</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
      </SidebarBody>
      <SidebarFooter>
        <SidebarItem href="/settings">
          <Settings data-slot="icon" />
          <SidebarLabel>Settings</SidebarLabel>
        </SidebarItem>
      </SidebarFooter>
    </Sidebar>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'SidebarHeading provides tiny section labels. Each SidebarSection can have its own heading to group related navigation items.',
      },
    },
  },
}

/**
 * ## With Badges
 *
 * Numbers are important. Unread counts, item totals, notification badges —
 * the sidebar can show them all. Just drop a Badge component after the label.
 */
export const WithBadges: Story = {
  render: () => (
    <Sidebar>
      <SidebarHeader>
        <SidebarItem href="/">
          <SpoonjoyLogo />
          <SidebarLabel>Spoonjoy</SidebarLabel>
        </SidebarItem>
      </SidebarHeader>
      <SidebarBody>
        <SidebarSection>
          <SidebarItem href="/" current>
            <Home data-slot="icon" />
            <SidebarLabel>Dashboard</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/recipes">
            <Utensils data-slot="icon" />
            <SidebarLabel>Recipes</SidebarLabel>
            <Badge>142</Badge>
          </SidebarItem>
          <SidebarItem href="/cookbooks">
            <Book data-slot="icon" />
            <SidebarLabel>Cookbooks</SidebarLabel>
            <Badge color="zinc">8</Badge>
          </SidebarItem>
          <SidebarItem href="/favorites">
            <Heart data-slot="icon" />
            <SidebarLabel>Favorites</SidebarLabel>
            <Badge color="pink">24</Badge>
          </SidebarItem>
        </SidebarSection>
        <SidebarSection>
          <SidebarHeading>Activity</SidebarHeading>
          <SidebarItem href="/notifications">
            <Bell data-slot="icon" />
            <SidebarLabel>Notifications</SidebarLabel>
            <Badge color="red">3</Badge>
          </SidebarItem>
          <SidebarItem href="/messages">
            <MessageSquare data-slot="icon" />
            <SidebarLabel>Messages</SidebarLabel>
            <Badge color="blue">12</Badge>
          </SidebarItem>
        </SidebarSection>
      </SidebarBody>
      <SidebarFooter>
        <SidebarItem href="/settings">
          <Settings data-slot="icon" />
          <SidebarLabel>Settings</SidebarLabel>
        </SidebarItem>
      </SidebarFooter>
    </Sidebar>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Badges sit naturally after labels. Use different colors to indicate importance: red for urgent, blue for informational, etc.',
      },
    },
  },
}

// =============================================================================
// CURRENT INDICATOR
// =============================================================================

/**
 * ## The Current Indicator
 *
 * The animated vertical bar that shows which page you're on. It uses
 * Framer Motion's layoutId to smoothly animate between positions.
 *
 * In a real app, only one item per section would be current.
 * Here we show different states for documentation purposes.
 */
export const CurrentIndicator: Story = {
  render: () => (
    <div className="flex h-full">
      <div className="flex-1 border-r border-zinc-200 dark:border-zinc-700">
        <Sidebar>
          <SidebarBody>
            <SidebarSection>
              <SidebarItem href="/" current>
                <Home data-slot="icon" />
                <SidebarLabel>Home</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/recipes">
                <Utensils data-slot="icon" />
                <SidebarLabel>Recipes</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/settings">
                <Settings data-slot="icon" />
                <SidebarLabel>Settings</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarBody>
        </Sidebar>
      </div>
      <div className="flex-1">
        <Sidebar>
          <SidebarBody>
            <SidebarSection>
              <SidebarItem href="/">
                <Home data-slot="icon" />
                <SidebarLabel>Home</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/recipes" current>
                <Utensils data-slot="icon" />
                <SidebarLabel>Recipes</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/settings">
                <Settings data-slot="icon" />
                <SidebarLabel>Settings</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarBody>
        </Sidebar>
      </div>
    </div>
  ),
  decorators: [
    (Story) => (
      <div className="h-[400px] w-[500px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          'The current indicator is a vertical bar on the left edge. In these examples, the left sidebar has "Home" current, and the right has "Recipes" current.',
      },
    },
  },
}

// =============================================================================
// WITH AVATARS
// =============================================================================

/**
 * ## With Avatar
 *
 * User profiles belong in the sidebar. Avatars have special styling to
 * look right at home next to icons and labels.
 */
export const WithAvatar: Story = {
  render: () => (
    <Sidebar>
      <SidebarHeader>
        <SidebarItem href="/">
          <SpoonjoyLogo />
          <SidebarLabel>Spoonjoy</SidebarLabel>
        </SidebarItem>
      </SidebarHeader>
      <SidebarBody>
        <SidebarSection>
          <SidebarItem href="/" current>
            <Home data-slot="icon" />
            <SidebarLabel>Home</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/recipes">
            <Utensils data-slot="icon" />
            <SidebarLabel>Recipes</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/favorites">
            <Heart data-slot="icon" />
            <SidebarLabel>Favorites</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
      </SidebarBody>
      <SidebarFooter>
        <SidebarItem href="/settings">
          <Settings data-slot="icon" />
          <SidebarLabel>Settings</SidebarLabel>
        </SidebarItem>
        <SidebarItem href="/profile">
          <Avatar src="https://i.pravatar.cc/150?img=32" className="size-6" />
          <SidebarLabel>Chef Ari</SidebarLabel>
        </SidebarItem>
      </SidebarFooter>
    </Sidebar>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Avatars use `data-slot="avatar"` styling automatically. They work great for user profile links in the footer.',
      },
    },
  },
}

/**
 * ## With User Dropdown
 *
 * For more user options, wrap the footer item in a Dropdown.
 * Click to reveal profile, settings, and sign out options.
 */
export const WithUserDropdown: Story = {
  render: () => (
    <Sidebar>
      <SidebarHeader>
        <SidebarItem href="/">
          <SpoonjoyLogo />
          <SidebarLabel>Spoonjoy</SidebarLabel>
        </SidebarItem>
      </SidebarHeader>
      <SidebarBody>
        <SidebarSection>
          <SidebarItem href="/" current>
            <Home data-slot="icon" />
            <SidebarLabel>Home</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/recipes">
            <Utensils data-slot="icon" />
            <SidebarLabel>Recipes</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/favorites">
            <Heart data-slot="icon" />
            <SidebarLabel>Favorites</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
        <SidebarSpacer />
        <SidebarSection>
          <SidebarItem href="/settings">
            <Settings data-slot="icon" />
            <SidebarLabel>Settings</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
      </SidebarBody>
      <SidebarFooter>
        <Dropdown>
          <DropdownButton as={SidebarItem}>
            <Avatar src="https://i.pravatar.cc/150?img=32" className="size-6" />
            <SidebarLabel>Chef Ari</SidebarLabel>
            <ChevronDown data-slot="icon" />
          </DropdownButton>
          <DropdownMenu anchor="top start">
            <DropdownHeader>
              <div className="px-1">
                <div className="text-sm font-medium text-zinc-900 dark:text-white">
                  Chef Ari
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  ari@spoonjoy.com
                </div>
              </div>
            </DropdownHeader>
            <DropdownDivider />
            <DropdownItem href="/profile">
              <User data-slot="icon" />
              <DropdownLabel>Profile</DropdownLabel>
            </DropdownItem>
            <DropdownItem href="/settings">
              <Settings data-slot="icon" />
              <DropdownLabel>Settings</DropdownLabel>
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem>
              <LogOut data-slot="icon" />
              <DropdownLabel>Sign out</DropdownLabel>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </SidebarFooter>
    </Sidebar>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The SidebarItem can be used as a DropdownButton. Click the user to see profile, settings, and sign out options.',
      },
    },
  },
}

// =============================================================================
// DIVIDERS AND SPACERS
// =============================================================================

/**
 * ## With Divider
 *
 * SidebarDivider creates visual separation between groups.
 * It's a horizontal line that extends into the sidebar padding.
 */
export const WithDivider: Story = {
  render: () => (
    <Sidebar>
      <SidebarHeader>
        <SidebarItem href="/">
          <SpoonjoyLogo />
          <SidebarLabel>Spoonjoy</SidebarLabel>
        </SidebarItem>
      </SidebarHeader>
      <SidebarBody>
        <SidebarSection>
          <SidebarItem href="/" current>
            <Home data-slot="icon" />
            <SidebarLabel>Dashboard</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/recipes">
            <Utensils data-slot="icon" />
            <SidebarLabel>Recipes</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
        <SidebarDivider />
        <SidebarSection>
          <SidebarItem href="/analytics">
            <BarChart3 data-slot="icon" />
            <SidebarLabel>Analytics</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/reports">
            <FileText data-slot="icon" />
            <SidebarLabel>Reports</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
        <SidebarDivider />
        <SidebarSection>
          <SidebarItem href="/help">
            <HelpCircle data-slot="icon" />
            <SidebarLabel>Help & Support</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
      </SidebarBody>
      <SidebarFooter>
        <SidebarItem href="/settings">
          <Settings data-slot="icon" />
          <SidebarLabel>Settings</SidebarLabel>
        </SidebarItem>
      </SidebarFooter>
    </Sidebar>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'SidebarDivider is an `<hr>` that creates horizontal separation. It extends into the padding for a full-width look.',
      },
    },
  },
}

/**
 * ## With Spacer
 *
 * SidebarSpacer pushes content to the bottom. Perfect for separating
 * primary navigation from secondary items like notifications.
 */
export const WithSpacer: Story = {
  render: () => (
    <Sidebar>
      <SidebarHeader>
        <SidebarItem href="/">
          <SpoonjoyLogo />
          <SidebarLabel>Spoonjoy</SidebarLabel>
        </SidebarItem>
      </SidebarHeader>
      <SidebarBody>
        <SidebarSection>
          <SidebarItem href="/" current>
            <Home data-slot="icon" />
            <SidebarLabel>Home</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/recipes">
            <Utensils data-slot="icon" />
            <SidebarLabel>Recipes</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/cookbooks">
            <Book data-slot="icon" />
            <SidebarLabel>Cookbooks</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/favorites">
            <Heart data-slot="icon" />
            <SidebarLabel>Favorites</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
        <SidebarSpacer />
        <SidebarSection>
          <SidebarItem href="/notifications">
            <Bell data-slot="icon" />
            <SidebarLabel>Notifications</SidebarLabel>
            <Badge color="red">5</Badge>
          </SidebarItem>
          <SidebarItem href="/help">
            <HelpCircle data-slot="icon" />
            <SidebarLabel>Help</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
      </SidebarBody>
      <SidebarFooter>
        <SidebarItem href="/settings">
          <Settings data-slot="icon" />
          <SidebarLabel>Settings</SidebarLabel>
        </SidebarItem>
      </SidebarFooter>
    </Sidebar>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'SidebarSpacer is an invisible `flex-1` div. It pushes everything after it to the bottom of the scrollable area.',
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
 * Not every sidebar item needs to navigate. Omit `href` to get a button.
 * Useful for actions like "New Recipe" or triggering modals.
 */
export const WithButtons: Story = {
  render: () => (
    <Sidebar>
      <SidebarHeader>
        <SidebarItem href="/">
          <SpoonjoyLogo />
          <SidebarLabel>Spoonjoy</SidebarLabel>
        </SidebarItem>
      </SidebarHeader>
      <SidebarBody>
        <SidebarSection>
          <SidebarItem onClick={() => alert('Creating new recipe!')}>
            <Plus data-slot="icon" />
            <SidebarLabel>New Recipe</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
        <SidebarSection>
          <SidebarHeading>Navigation</SidebarHeading>
          <SidebarItem href="/" current>
            <Home data-slot="icon" />
            <SidebarLabel>Home</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/recipes">
            <Utensils data-slot="icon" />
            <SidebarLabel>Recipes</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/cookbooks">
            <Book data-slot="icon" />
            <SidebarLabel>Cookbooks</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
        <SidebarSpacer />
        <SidebarSection>
          <SidebarItem onClick={() => alert('Opening search...')}>
            <Search data-slot="icon" />
            <SidebarLabel>Search</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
      </SidebarBody>
      <SidebarFooter>
        <SidebarItem href="/settings">
          <Settings data-slot="icon" />
          <SidebarLabel>Settings</SidebarLabel>
        </SidebarItem>
      </SidebarFooter>
    </Sidebar>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Items without `href` render as HeadlessUI buttons. They have the same styling but trigger onClick handlers instead of navigation.',
      },
    },
  },
}

// =============================================================================
// REAL-WORLD EXAMPLES
// =============================================================================

/**
 * ## Recipe App Sidebar
 *
 * A complete sidebar for a recipe management application.
 * Multiple sections, badges, spacer, and user dropdown.
 */
export const RecipeAppSidebar: Story = {
  render: () => (
    <Sidebar>
      <SidebarHeader>
        <SidebarItem href="/">
          <SpoonjoyLogo />
          <SidebarLabel>Spoonjoy</SidebarLabel>
        </SidebarItem>
      </SidebarHeader>
      <SidebarBody>
        <SidebarSection>
          <SidebarItem href="/" current>
            <Home data-slot="icon" />
            <SidebarLabel>Dashboard</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/recipes">
            <Utensils data-slot="icon" />
            <SidebarLabel>Recipes</SidebarLabel>
            <Badge>142</Badge>
          </SidebarItem>
          <SidebarItem href="/cookbooks">
            <Book data-slot="icon" />
            <SidebarLabel>Cookbooks</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/favorites">
            <Heart data-slot="icon" />
            <SidebarLabel>Favorites</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
        <SidebarSection>
          <SidebarHeading>Planning</SidebarHeading>
          <SidebarItem href="/meal-plans">
            <Calendar data-slot="icon" />
            <SidebarLabel>Meal Plans</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/shopping-list">
            <ShoppingCart data-slot="icon" />
            <SidebarLabel>Shopping List</SidebarLabel>
            <Badge color="amber">3</Badge>
          </SidebarItem>
          <SidebarItem href="/recent">
            <Clock data-slot="icon" />
            <SidebarLabel>Recently Viewed</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
        <SidebarSpacer />
        <SidebarSection>
          <SidebarItem href="/notifications">
            <Bell data-slot="icon" />
            <SidebarLabel>Notifications</SidebarLabel>
            <Badge color="red">2</Badge>
          </SidebarItem>
        </SidebarSection>
      </SidebarBody>
      <SidebarFooter>
        <SidebarItem href="/settings">
          <Settings data-slot="icon" />
          <SidebarLabel>Settings</SidebarLabel>
        </SidebarItem>
        <Dropdown>
          <DropdownButton as={SidebarItem}>
            <Avatar src="https://i.pravatar.cc/150?img=32" className="size-6" />
            <SidebarLabel>Chef Ari</SidebarLabel>
            <ChevronsUpDown data-slot="icon" />
          </DropdownButton>
          <DropdownMenu anchor="top start">
            <DropdownHeader>
              <div className="px-1">
                <div className="text-sm font-medium text-zinc-900 dark:text-white">
                  Chef Ari
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  ari@spoonjoy.com
                </div>
              </div>
            </DropdownHeader>
            <DropdownDivider />
            <DropdownItem href="/profile">
              <User data-slot="icon" />
              <DropdownLabel>Profile</DropdownLabel>
            </DropdownItem>
            <DropdownItem href="/settings">
              <Settings data-slot="icon" />
              <DropdownLabel>Settings</DropdownLabel>
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem>
              <LogOut data-slot="icon" />
              <DropdownLabel>Sign out</DropdownLabel>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </SidebarFooter>
    </Sidebar>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'A fully-featured recipe app sidebar with browsing, planning, and user sections. This is the pattern used in the main Spoonjoy application.',
      },
    },
  },
}

/**
 * ## Admin Dashboard
 *
 * An admin panel sidebar with overview, management, and system sections.
 * The kind of sidebar that makes power users feel powerful.
 */
export const AdminDashboard: Story = {
  render: () => (
    <Sidebar>
      <SidebarHeader>
        <SidebarItem href="/">
          <div className="flex size-6 items-center justify-center rounded-md bg-zinc-900 dark:bg-white">
            <Zap className="size-4 text-white dark:text-zinc-900" />
          </div>
          <SidebarLabel>Admin Panel</SidebarLabel>
        </SidebarItem>
      </SidebarHeader>
      <SidebarBody>
        <SidebarSection>
          <SidebarHeading>Overview</SidebarHeading>
          <SidebarItem href="/dashboard" current>
            <BarChart3 data-slot="icon" />
            <SidebarLabel>Dashboard</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/analytics">
            <TrendingUp data-slot="icon" />
            <SidebarLabel>Analytics</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
        <SidebarSection>
          <SidebarHeading>Management</SidebarHeading>
          <SidebarItem href="/users">
            <Users data-slot="icon" />
            <SidebarLabel>Users</SidebarLabel>
            <Badge>1,234</Badge>
          </SidebarItem>
          <SidebarItem href="/content">
            <FileText data-slot="icon" />
            <SidebarLabel>Content</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/messages">
            <MessageSquare data-slot="icon" />
            <SidebarLabel>Messages</SidebarLabel>
            <Badge color="blue">12</Badge>
          </SidebarItem>
        </SidebarSection>
        <SidebarDivider />
        <SidebarSection>
          <SidebarHeading>System</SidebarHeading>
          <SidebarItem href="/billing">
            <CreditCard data-slot="icon" />
            <SidebarLabel>Billing</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/security">
            <Shield data-slot="icon" />
            <SidebarLabel>Security</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/database">
            <Database data-slot="icon" />
            <SidebarLabel>Database</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
        <SidebarSpacer />
        <SidebarSection>
          <SidebarItem href="/help">
            <HelpCircle data-slot="icon" />
            <SidebarLabel>Help & Support</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
      </SidebarBody>
      <SidebarFooter>
        <SidebarItem href="/settings">
          <Settings data-slot="icon" />
          <SidebarLabel>Settings</SidebarLabel>
        </SidebarItem>
        <SidebarItem href="/account">
          <Avatar src="https://i.pravatar.cc/150?img=68" className="size-6" />
          <SidebarLabel>Admin User</SidebarLabel>
        </SidebarItem>
      </SidebarFooter>
    </Sidebar>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'A comprehensive admin panel sidebar. Three logical groups: Overview for metrics, Management for CRUD, System for infrastructure.',
      },
    },
  },
}

/**
 * ## Email Client
 *
 * An email-style sidebar with folders and labels.
 * Because email clients pioneered the sidebar pattern.
 */
export const EmailClient: Story = {
  render: () => (
    <Sidebar>
      <SidebarHeader>
        <SidebarItem onClick={() => alert('Compose email')}>
          <Plus data-slot="icon" />
          <SidebarLabel>Compose</SidebarLabel>
        </SidebarItem>
      </SidebarHeader>
      <SidebarBody>
        <SidebarSection>
          <SidebarItem href="/inbox" current>
            <Inbox data-slot="icon" />
            <SidebarLabel>Inbox</SidebarLabel>
            <Badge color="blue">24</Badge>
          </SidebarItem>
          <SidebarItem href="/starred">
            <Star data-slot="icon" />
            <SidebarLabel>Starred</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/sent">
            <Send data-slot="icon" />
            <SidebarLabel>Sent</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/drafts">
            <FileText data-slot="icon" />
            <SidebarLabel>Drafts</SidebarLabel>
            <Badge color="zinc">3</Badge>
          </SidebarItem>
          <SidebarItem href="/archive">
            <Archive data-slot="icon" />
            <SidebarLabel>Archive</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/trash">
            <Trash2 data-slot="icon" />
            <SidebarLabel>Trash</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
        <SidebarDivider />
        <SidebarSection>
          <SidebarHeading>Folders</SidebarHeading>
          <SidebarItem href="/folders/work">
            <FolderOpen data-slot="icon" />
            <SidebarLabel>Work</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/folders/personal">
            <FolderOpen data-slot="icon" />
            <SidebarLabel>Personal</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/folders/receipts">
            <FolderOpen data-slot="icon" />
            <SidebarLabel>Receipts</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
        <SidebarSection>
          <SidebarHeading>Labels</SidebarHeading>
          <SidebarItem href="/labels/important">
            <Tag data-slot="icon" className="text-red-500" />
            <SidebarLabel>Important</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/labels/follow-up">
            <Tag data-slot="icon" className="text-amber-500" />
            <SidebarLabel>Follow Up</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/labels/waiting">
            <Tag data-slot="icon" className="text-blue-500" />
            <SidebarLabel>Waiting</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
      </SidebarBody>
      <SidebarFooter>
        <SidebarItem href="/settings">
          <Settings data-slot="icon" />
          <SidebarLabel>Settings</SidebarLabel>
        </SidebarItem>
      </SidebarFooter>
    </Sidebar>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Email-style navigation with folders and color-coded labels. The classic sidebar pattern that defined the paradigm.',
      },
    },
  },
}

/**
 * ## Project Management
 *
 * A sidebar for a project or task management app.
 * Workspaces, projects, and team features.
 */
export const ProjectManagement: Story = {
  render: () => (
    <Sidebar>
      <SidebarHeader>
        <Dropdown>
          <DropdownButton as={SidebarItem}>
            <div className="flex size-6 items-center justify-center rounded-md bg-violet-500">
              <Sparkles className="size-4 text-white" />
            </div>
            <SidebarLabel>Acme Inc</SidebarLabel>
            <ChevronsUpDown data-slot="icon" />
          </DropdownButton>
          <DropdownMenu anchor="bottom start">
            <DropdownItem>
              <div className="flex size-6 items-center justify-center rounded-md bg-violet-500">
                <Sparkles className="size-4 text-white" />
              </div>
              <DropdownLabel>Acme Inc</DropdownLabel>
            </DropdownItem>
            <DropdownItem>
              <div className="flex size-6 items-center justify-center rounded-md bg-emerald-500">
                <Globe className="size-4 text-white" />
              </div>
              <DropdownLabel>Globex Corp</DropdownLabel>
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem>
              <Plus data-slot="icon" />
              <DropdownLabel>Create workspace</DropdownLabel>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </SidebarHeader>
      <SidebarBody>
        <SidebarSection>
          <SidebarItem href="/" current>
            <Home data-slot="icon" />
            <SidebarLabel>Home</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/inbox">
            <Inbox data-slot="icon" />
            <SidebarLabel>Inbox</SidebarLabel>
            <Badge color="blue">8</Badge>
          </SidebarItem>
          <SidebarItem href="/my-tasks">
            <User data-slot="icon" />
            <SidebarLabel>My Tasks</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
        <SidebarSection>
          <SidebarHeading>Projects</SidebarHeading>
          <SidebarItem href="/projects/website">
            <div className="size-2 rounded-full bg-blue-500" />
            <SidebarLabel>Website Redesign</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/projects/mobile">
            <div className="size-2 rounded-full bg-green-500" />
            <SidebarLabel>Mobile App</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/projects/marketing">
            <div className="size-2 rounded-full bg-amber-500" />
            <SidebarLabel>Q1 Marketing</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/projects/new">
            <Plus data-slot="icon" />
            <SidebarLabel>New Project</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
        <SidebarSection>
          <SidebarHeading>Team</SidebarHeading>
          <SidebarItem href="/team">
            <Users data-slot="icon" />
            <SidebarLabel>Members</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/team/invite">
            <Plus data-slot="icon" />
            <SidebarLabel>Invite People</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
        <SidebarSpacer />
        <SidebarSection>
          <SidebarItem href="/help">
            <HelpCircle data-slot="icon" />
            <SidebarLabel>Help & Support</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
      </SidebarBody>
      <SidebarFooter>
        <SidebarItem href="/settings">
          <Settings data-slot="icon" />
          <SidebarLabel>Settings</SidebarLabel>
        </SidebarItem>
        <SidebarItem href="/profile">
          <Avatar
            src="https://i.pravatar.cc/150?img=45"
            className="size-6"
            initials="JD"
          />
          <SidebarLabel>Jane Doe</SidebarLabel>
        </SidebarItem>
      </SidebarFooter>
    </Sidebar>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Project management sidebar with workspace switcher, project list with color indicators, and team features. Linear/Asana-inspired.',
      },
    },
  },
}

// =============================================================================
// MINIMAL VARIANTS
// =============================================================================

/**
 * ## Minimal Sidebar
 *
 * No header, no footer, just the essentials.
 * For when you want navigation without ceremony.
 */
export const MinimalSidebar: Story = {
  render: () => (
    <Sidebar>
      <SidebarBody>
        <SidebarSection>
          <SidebarItem href="/" current>
            <Home data-slot="icon" />
            <SidebarLabel>Home</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/recipes">
            <Utensils data-slot="icon" />
            <SidebarLabel>Recipes</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/settings">
            <Settings data-slot="icon" />
            <SidebarLabel>Settings</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
      </SidebarBody>
    </Sidebar>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'A stripped-down sidebar with just body content. No header, no footer, no sections — just navigation items.',
      },
    },
  },
}

/**
 * ## Header Only
 *
 * Sometimes you just need a header. Maybe the body is dynamically populated,
 * or maybe you're showing an empty state.
 */
export const HeaderOnly: Story = {
  render: () => (
    <Sidebar>
      <SidebarHeader>
        <SidebarItem href="/">
          <SpoonjoyLogo />
          <SidebarLabel>Spoonjoy</SidebarLabel>
        </SidebarItem>
        <SidebarSection>
          <SidebarItem onClick={() => alert('Search')}>
            <Search data-slot="icon" />
            <SidebarLabel>Search</SidebarLabel>
          </SidebarItem>
          <SidebarItem onClick={() => alert('New')}>
            <Plus data-slot="icon" />
            <SidebarLabel>New Recipe</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
      </SidebarHeader>
      <SidebarBody>
        <div className="flex flex-1 items-center justify-center p-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
          No recipes yet. Create your first one!
        </div>
      </SidebarBody>
    </Sidebar>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'A sidebar with header content and an empty body state. The header can contain multiple sections.',
      },
    },
  },
}

// =============================================================================
// SCROLLING BEHAVIOR
// =============================================================================

/**
 * ## Long Navigation
 *
 * When you have many items, the body scrolls independently.
 * Header and footer stay fixed. Scroll to your heart's content.
 */
export const LongNavigation: Story = {
  render: () => (
    <Sidebar>
      <SidebarHeader>
        <SidebarItem href="/">
          <SpoonjoyLogo />
          <SidebarLabel>Spoonjoy</SidebarLabel>
        </SidebarItem>
      </SidebarHeader>
      <SidebarBody>
        <SidebarSection>
          <SidebarHeading>Recipes</SidebarHeading>
          {[
            'All Recipes',
            'Breakfast',
            'Lunch',
            'Dinner',
            'Appetizers',
            'Soups',
            'Salads',
            'Main Courses',
            'Side Dishes',
            'Desserts',
            'Beverages',
            'Snacks',
            'Vegan',
            'Vegetarian',
            'Gluten-Free',
            'Keto',
            'Quick & Easy',
            'Slow Cooker',
            'Instant Pot',
            'Grill & BBQ',
          ].map((item, index) => (
            <SidebarItem key={item} href={`/recipes/${item.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`} current={index === 0}>
              <Utensils data-slot="icon" />
              <SidebarLabel>{item}</SidebarLabel>
            </SidebarItem>
          ))}
        </SidebarSection>
      </SidebarBody>
      <SidebarFooter>
        <SidebarItem href="/settings">
          <Settings data-slot="icon" />
          <SidebarLabel>Settings</SidebarLabel>
        </SidebarItem>
      </SidebarFooter>
    </Sidebar>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'With many items, the SidebarBody becomes scrollable while header and footer remain fixed. Scroll down to see all the recipe categories.',
      },
    },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Tests that sidebar items have correct navigation attributes.
 */
export const NavigationAttributes: Story = {
  render: () => (
    <Sidebar>
      <SidebarBody>
        <SidebarSection>
          <SidebarItem href="/" data-testid="home" current>
            <Home data-slot="icon" />
            <SidebarLabel>Home</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/recipes" data-testid="recipes">
            <Utensils data-slot="icon" />
            <SidebarLabel>Recipes</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/settings?tab=profile" data-testid="settings">
            <Settings data-slot="icon" />
            <SidebarLabel>Settings</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
      </SidebarBody>
    </Sidebar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Check current item has data-current attribute
    const homeItem = canvas.getByTestId('home')
    const homeLink = homeItem.querySelector('[data-current="true"]')
    await expect(homeLink).toBeInTheDocument()

    // Check non-current items don't have data-current
    const recipesItem = canvas.getByTestId('recipes')
    const recipesLink = recipesItem.querySelector('[data-current="true"]')
    await expect(recipesLink).not.toBeInTheDocument()

    // Check href is preserved including query strings
    const settingsItem = canvas.getByTestId('settings')
    const settingsLink = settingsItem.querySelector('a')
    await expect(settingsLink).toHaveAttribute('href', '/settings?tab=profile')
  },
  parameters: {
    docs: {
      description: {
        story:
          'Tests that navigation items have correct `data-current` attributes and preserve href query strings.',
      },
    },
  },
}

/**
 * Tests that button items (without href) render as buttons.
 */
export const ButtonItemTest: Story = {
  render: () => (
    <Sidebar>
      <SidebarBody>
        <SidebarSection>
          <SidebarItem href="/" data-testid="link-item">
            <Home data-slot="icon" />
            <SidebarLabel>Home (Link)</SidebarLabel>
          </SidebarItem>
          <SidebarItem data-testid="button-item" onClick={() => {}}>
            <Plus data-slot="icon" />
            <SidebarLabel>New (Button)</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
      </SidebarBody>
    </Sidebar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Link item should contain an anchor
    const linkItem = canvas.getByTestId('link-item')
    const anchor = linkItem.querySelector('a')
    await expect(anchor).toBeInTheDocument()

    // Button item should contain a button, not an anchor
    const buttonItem = canvas.getByTestId('button-item')
    const button = buttonItem.querySelector('button')
    await expect(button).toBeInTheDocument()
    const noAnchor = buttonItem.querySelector('a')
    await expect(noAnchor).not.toBeInTheDocument()
  },
  parameters: {
    docs: {
      description: {
        story:
          'Items with `href` render as links (`<a>`), items without `href` render as buttons (`<button>`).',
      },
    },
  },
}

/**
 * Tests that badges render correctly inside sidebar items.
 */
export const BadgeRenderingTest: Story = {
  render: () => (
    <Sidebar>
      <SidebarBody>
        <SidebarSection>
          <SidebarItem href="/inbox" data-testid="inbox">
            <Inbox data-slot="icon" />
            <SidebarLabel>Inbox</SidebarLabel>
            <Badge data-testid="inbox-badge" color="blue">
              24
            </Badge>
          </SidebarItem>
          <SidebarItem href="/notifications" data-testid="notifications">
            <Bell data-slot="icon" />
            <SidebarLabel>Notifications</SidebarLabel>
            <Badge data-testid="notifications-badge" color="red">
              3
            </Badge>
          </SidebarItem>
        </SidebarSection>
      </SidebarBody>
    </Sidebar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Check badges are rendered with correct content
    const inboxBadge = canvas.getByTestId('inbox-badge')
    await expect(inboxBadge).toHaveTextContent('24')

    const notificationsBadge = canvas.getByTestId('notifications-badge')
    await expect(notificationsBadge).toHaveTextContent('3')
  },
  parameters: {
    docs: {
      description: {
        story: 'Badges render inside sidebar items with correct content and styling.',
      },
    },
  },
}

/**
 * Tests that the sidebar structure has correct semantic hierarchy.
 */
export const StructureTest: Story = {
  render: () => (
    <Sidebar data-testid="sidebar">
      <SidebarHeader data-testid="header">
        <SidebarItem href="/">
          <SpoonjoyLogo />
          <SidebarLabel>App</SidebarLabel>
        </SidebarItem>
      </SidebarHeader>
      <SidebarBody data-testid="body">
        <SidebarSection data-testid="section">
          <SidebarHeading data-testid="heading">Navigation</SidebarHeading>
          <SidebarItem href="/">
            <Home data-slot="icon" />
            <SidebarLabel>Home</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
      </SidebarBody>
      <SidebarFooter data-testid="footer">
        <SidebarItem href="/settings">
          <Settings data-slot="icon" />
          <SidebarLabel>Settings</SidebarLabel>
        </SidebarItem>
      </SidebarFooter>
    </Sidebar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Sidebar should be a nav element
    const sidebar = canvas.getByTestId('sidebar')
    await expect(sidebar.tagName).toBe('NAV')

    // Heading should be an h3
    const heading = canvas.getByTestId('heading')
    await expect(heading.tagName).toBe('H3')
  },
  parameters: {
    docs: {
      description: {
        story:
          'The Sidebar renders as a `<nav>` element and SidebarHeading as `<h3>` for correct semantic structure.',
      },
    },
  },
}

/**
 * Tests that icons have the correct data-slot attribute.
 */
export const IconSlotTest: Story = {
  render: () => (
    <Sidebar>
      <SidebarBody>
        <SidebarSection>
          <SidebarItem href="/" data-testid="item-with-icon">
            <Home data-slot="icon" data-testid="home-icon" />
            <SidebarLabel>Home</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
      </SidebarBody>
    </Sidebar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Icon should have data-slot="icon"
    const icon = canvas.getByTestId('home-icon')
    await expect(icon).toHaveAttribute('data-slot', 'icon')
  },
  parameters: {
    docs: {
      description: {
        story:
          'Icons must have `data-slot="icon"` for proper sizing and coloring within sidebar items.',
      },
    },
  },
}
