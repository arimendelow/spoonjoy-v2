import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within, waitFor } from 'storybook/test'
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
  Palette,
  Database,
} from 'lucide-react'
import { SpoonjoyLogo } from '../app/components/ui/spoonjoy-logo'
import { SidebarLayout } from '../app/components/ui/sidebar-layout'
import {
  Navbar,
  NavbarItem,
  NavbarSection,
  NavbarSpacer,
  NavbarLabel,
  NavbarDivider,
} from '../app/components/ui/navbar'
import {
  Sidebar,
  SidebarBody,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarFooter,
  SidebarSpacer,
  SidebarHeading,
  SidebarDivider,
} from '../app/components/ui/sidebar'
import { Button } from '../app/components/ui/button'
import { Avatar } from '../app/components/ui/avatar'
import { Heading } from '../app/components/ui/heading'
import { Text } from '../app/components/ui/text'
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
 * # SidebarLayout
 *
 * The sidebar-first layout. The power user's choice. The "I have a lot of
 * navigation and I'm not afraid to show it" layout.
 *
 * While StackedLayout hides its sidebar on desktop like a socially anxious
 * teenager at a party, SidebarLayout puts that sidebar front and center.
 * It's fixed. It's always there. It's 64 pixels of persistent navigation
 * glory (256px, technically, but who's counting?).
 *
 * ## The Philosophical Difference
 *
 * - **StackedLayout**: "Here's a navbar. The sidebar is for mobile peasants."
 * - **SidebarLayout**: "The sidebar IS the navigation. The navbar is just
 *   for mobile overflow and maybe a search bar."
 *
 * Choose SidebarLayout when:
 * - You have deep navigation hierarchies
 * - Your users live in your app (dashboards, admin panels, IDEs)
 * - You want that sweet, sweet persistent navigation
 * - You're building the next Notion/Linear/Figma
 *
 * ## Anatomy
 *
 * - **sidebar**: The star of the show. Fixed on the left at 256px wide on desktop.
 *   Slides in on mobile. This is where your main navigation lives.
 * - **navbar**: Only visible on mobile, above the content. Usually just contains
 *   what doesn't fit in the sidebar on small screens.
 * - **children**: Your content. Lives to the right of the sidebar on desktop,
 *   below the navbar on mobile.
 *
 * ## The Technical Details Nobody Asked For
 *
 * Desktop (lg+):
 * - Sidebar: Fixed, 256px wide, full height
 * - Content: Offset by 256px, has that nice rounded card aesthetic
 * - Navbar: Hidden (but still rendered because React doesn't care about your feelings)
 *
 * Mobile (<lg):
 * - Hamburger menu in the top-left
 * - Sidebar slides in as an overlay (with backdrop)
 * - Navbar content visible at the top
 * - Content takes full width
 */
const meta: Meta<typeof SidebarLayout> = {
  title: 'Layout/SidebarLayout',
  component: SidebarLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
A sidebar-first layout with fixed navigation on desktop and slide-in panel on mobile. The workhorse of dashboard interfaces.

The sidebar is always visible on desktop (lg+), providing persistent navigation. On mobile, it transforms into a slide-in panel accessible via hamburger menu.

Content is displayed in a rounded card container with shadow, offset from the fixed sidebar on desktop.
        `,
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// SAMPLE SIDEBARS
// =============================================================================

function SimpleSidebar({ currentPage = 'home' }: { currentPage?: string }) {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarItem href="/">
          <SpoonjoyLogo />
          <SidebarLabel>Spoonjoy</SidebarLabel>
        </SidebarItem>
      </SidebarHeader>
      <SidebarBody>
        <SidebarSection>
          <SidebarItem href="/" current={currentPage === 'home'}>
            <Home data-slot="icon" />
            <SidebarLabel>Home</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/recipes" current={currentPage === 'recipes'}>
            <Utensils data-slot="icon" />
            <SidebarLabel>Recipes</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/cookbooks" current={currentPage === 'cookbooks'}>
            <Book data-slot="icon" />
            <SidebarLabel>Cookbooks</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/favorites" current={currentPage === 'favorites'}>
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
        <SidebarItem href="/account">
          <Avatar src="https://i.pravatar.cc/150?img=32" className="size-6" />
          <SidebarLabel>Chef Ari</SidebarLabel>
        </SidebarItem>
      </SidebarFooter>
    </Sidebar>
  )
}

function FullFeaturedSidebar({ currentPage = 'home' }: { currentPage?: string }) {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarItem href="/">
          <SpoonjoyLogo />
          <SidebarLabel>Spoonjoy</SidebarLabel>
        </SidebarItem>
      </SidebarHeader>
      <SidebarBody>
        <SidebarSection>
          <SidebarItem href="/" current={currentPage === 'home'}>
            <Home data-slot="icon" />
            <SidebarLabel>Dashboard</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/recipes" current={currentPage === 'recipes'}>
            <Utensils data-slot="icon" />
            <SidebarLabel>Recipes</SidebarLabel>
            <Badge>142</Badge>
          </SidebarItem>
          <SidebarItem href="/cookbooks" current={currentPage === 'cookbooks'}>
            <Book data-slot="icon" />
            <SidebarLabel>Cookbooks</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/favorites" current={currentPage === 'favorites'}>
            <Heart data-slot="icon" />
            <SidebarLabel>Favorites</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
        <SidebarSection>
          <SidebarHeading>Planning</SidebarHeading>
          <SidebarItem href="/meal-plans" current={currentPage === 'meal-plans'}>
            <Calendar data-slot="icon" />
            <SidebarLabel>Meal Plans</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/shopping-list" current={currentPage === 'shopping-list'}>
            <ShoppingCart data-slot="icon" />
            <SidebarLabel>Shopping List</SidebarLabel>
            <Badge color="amber">3</Badge>
          </SidebarItem>
          <SidebarItem href="/recent" current={currentPage === 'recent'}>
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
          </DropdownButton>
          <DropdownMenu anchor="top start">
            <DropdownHeader>
              <div className="px-1">
                <div className="text-sm font-medium text-zinc-900 dark:text-white">Chef Ari</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">ari@spoonjoy.com</div>
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
  )
}

function AdminSidebar({ currentPage = 'dashboard' }: { currentPage?: string }) {
  return (
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
          <SidebarItem href="/dashboard" current={currentPage === 'dashboard'}>
            <BarChart3 data-slot="icon" />
            <SidebarLabel>Dashboard</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/analytics" current={currentPage === 'analytics'}>
            <TrendingUp data-slot="icon" />
            <SidebarLabel>Analytics</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
        <SidebarSection>
          <SidebarHeading>Management</SidebarHeading>
          <SidebarItem href="/users" current={currentPage === 'users'}>
            <Users data-slot="icon" />
            <SidebarLabel>Users</SidebarLabel>
            <Badge>1,234</Badge>
          </SidebarItem>
          <SidebarItem href="/content" current={currentPage === 'content'}>
            <FileText data-slot="icon" />
            <SidebarLabel>Content</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/messages" current={currentPage === 'messages'}>
            <MessageSquare data-slot="icon" />
            <SidebarLabel>Messages</SidebarLabel>
            <Badge color="blue">12</Badge>
          </SidebarItem>
        </SidebarSection>
        <SidebarDivider />
        <SidebarSection>
          <SidebarHeading>System</SidebarHeading>
          <SidebarItem href="/billing" current={currentPage === 'billing'}>
            <CreditCard data-slot="icon" />
            <SidebarLabel>Billing</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/security" current={currentPage === 'security'}>
            <Shield data-slot="icon" />
            <SidebarLabel>Security</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/database" current={currentPage === 'database'}>
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
  )
}

// =============================================================================
// SAMPLE NAVBARS (for mobile)
// =============================================================================

function SimpleNavbar() {
  return (
    <Navbar>
      <NavbarSpacer />
      <NavbarSection>
        <NavbarItem href="/search" aria-label="Search">
          <Search data-slot="icon" />
        </NavbarItem>
        <NavbarItem href="/notifications" aria-label="Notifications">
          <Bell data-slot="icon" />
        </NavbarItem>
      </NavbarSection>
    </Navbar>
  )
}

function NavbarWithBreadcrumb() {
  return (
    <Navbar>
      <NavbarSection>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          Recipes / Italian / Pasta
        </span>
      </NavbarSection>
      <NavbarSpacer />
      <NavbarSection>
        <NavbarItem href="/search" aria-label="Search">
          <Search data-slot="icon" />
        </NavbarItem>
      </NavbarSection>
    </Navbar>
  )
}

// =============================================================================
// SAMPLE CONTENT
// =============================================================================

function DashboardContent() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <Heading>Dashboard</Heading>
          <Text className="mt-1">Welcome back! Here&apos;s what&apos;s happening.</Text>
        </div>
        <Button color="blue">
          <Plus data-slot="icon" />
          New Recipe
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Recipes', value: '142', change: '+12%' },
          { label: 'Cookbooks', value: '8', change: '+2' },
          { label: 'Favorites', value: '24', change: '+5' },
          { label: 'Views This Month', value: '1,234', change: '+18%' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
          >
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</p>
            <div className="mt-1 flex items-baseline gap-2">
              <p className="text-2xl font-semibold text-zinc-900 dark:text-white">
                {stat.value}
              </p>
              <span className="text-sm text-green-600 dark:text-green-400">
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Recent Activity
        </h2>
        <div className="mt-4 space-y-4">
          {[
            { action: 'Created', item: 'Perfect Pasta Carbonara', time: '2 hours ago' },
            { action: 'Updated', item: 'Grandma\'s Apple Pie', time: '5 hours ago' },
            { action: 'Added to cookbook', item: 'Quick Stir Fry', time: '1 day ago' },
            { action: 'Favorited', item: 'Homemade Pizza Dough', time: '2 days ago' },
          ].map((activity, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-zinc-100 pb-4 last:border-0 dark:border-zinc-800"
            >
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                  {activity.action} &ldquo;{activity.item}&rdquo;
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RecipeListContent() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <Heading>Recipes</Heading>
        <Button color="blue">
          <Plus data-slot="icon" />
          Add Recipe
        </Button>
      </div>
      <Text className="mt-2">Your collection of culinary masterpieces.</Text>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: 'Perfect Pasta Carbonara', time: '25 min', rating: 4.8, category: 'Italian' },
          { title: 'Grandma\'s Apple Pie', time: '90 min', rating: 4.9, category: 'Dessert' },
          { title: 'Quick Stir Fry', time: '15 min', rating: 4.5, category: 'Asian' },
          { title: 'Homemade Pizza Dough', time: '120 min', rating: 4.7, category: 'Italian' },
          { title: 'Classic French Omelette', time: '10 min', rating: 4.6, category: 'Breakfast' },
          { title: 'Beef Bourguignon', time: '180 min', rating: 4.9, category: 'French' },
        ].map((recipe) => (
          <div
            key={recipe.title}
            className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
          >
            <div className="h-32 rounded-md bg-zinc-100 dark:bg-zinc-800" />
            <div className="mt-3 flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-white">{recipe.title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{recipe.category}</p>
              </div>
              <Badge>{recipe.category}</Badge>
            </div>
            <div className="mt-2 flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1">
                <Clock className="size-4" />
                {recipe.time}
              </span>
              <span className="flex items-center gap-1">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                {recipe.rating}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SettingsContent() {
  return (
    <div>
      <Heading>Settings</Heading>
      <Text className="mt-2">Manage your account and preferences.</Text>

      <div className="mt-8 space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Profile</h2>
          <div className="mt-4 flex items-center gap-4">
            <Avatar src="https://i.pravatar.cc/150?img=32" className="size-16" />
            <div>
              <p className="font-medium text-zinc-900 dark:text-white">Chef Ari</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">ari@spoonjoy.com</p>
            </div>
            <Button outline className="ml-auto">
              Edit Profile
            </Button>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Preferences</h2>
          <div className="mt-4 space-y-4">
            {[
              { label: 'Email notifications', description: 'Receive updates about your recipes' },
              { label: 'Dark mode', description: 'Use dark theme across the app' },
              { label: 'Metric units', description: 'Display measurements in metric' },
            ].map((pref) => (
              <div
                key={pref.label}
                className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
              >
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">{pref.label}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{pref.description}</p>
                </div>
                <div className="size-6 rounded-full bg-zinc-200 dark:bg-zinc-700" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function MinimalContent() {
  return (
    <div className="flex h-96 flex-col items-center justify-center text-center">
      <div className="rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
        <Palette className="size-8 text-zinc-400" />
      </div>
      <Heading level={2} className="mt-4">
        Your Canvas Awaits
      </Heading>
      <Text className="mt-2 max-w-sm">
        This is where your content goes. The sidebar provides navigation,
        and this area is all yours.
      </Text>
    </div>
  )
}

// =============================================================================
// BASIC STORIES
// =============================================================================

/**
 * The default sidebar layout. Sidebar on the left, content on the right.
 * On mobile, the sidebar hides behind a hamburger menu.
 *
 * This is the layout you want for dashboards, admin panels, and apps where
 * users spend a lot of time navigating between sections.
 */
export const Default: Story = {
  render: () => (
    <SidebarLayout navbar={<SimpleNavbar />} sidebar={<SimpleSidebar />}>
      <DashboardContent />
    </SidebarLayout>
  ),
}

/**
 * With a full-featured sidebar including sections, badges, and user dropdown.
 * Because sometimes you need ALL the navigation.
 */
export const WithFullSidebar: Story = {
  render: () => (
    <SidebarLayout navbar={<SimpleNavbar />} sidebar={<FullFeaturedSidebar />}>
      <DashboardContent />
    </SidebarLayout>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'A sidebar with multiple sections, section headings, badges, and a user dropdown. The sidebar can handle complex navigation hierarchies without breaking a sweat.',
      },
    },
  },
}

// =============================================================================
// NAVIGATION PATTERNS
// =============================================================================

/**
 * ## Recipes Page
 *
 * Navigation highlighting the current page. The sidebar item gets that nice
 * animated indicator showing where you are.
 */
export const RecipesNavigation: Story = {
  render: () => (
    <SidebarLayout
      navbar={<SimpleNavbar />}
      sidebar={<FullFeaturedSidebar currentPage="recipes" />}
    >
      <RecipeListContent />
    </SidebarLayout>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The current page is indicated with a vertical bar on the left of the active item. This animated indicator slides between items when navigating.',
      },
    },
  },
}

/**
 * ## Settings Page
 *
 * Deep navigation state. Even when users are buried in settings,
 * they always know where they are.
 */
export const SettingsNavigation: Story = {
  render: () => (
    <SidebarLayout navbar={<SimpleNavbar />} sidebar={<SimpleSidebar currentPage="settings" />}>
      <SettingsContent />
    </SidebarLayout>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Settings navigation pattern. The sidebar footer items can also show current state.',
      },
    },
  },
}

// =============================================================================
// ADMIN/DASHBOARD PATTERNS
// =============================================================================

/**
 * ## Admin Dashboard
 *
 * A power-user interface with multiple navigation sections, grouped by purpose.
 * This is what you build when your users live in your app 8 hours a day.
 */
export const AdminDashboard: Story = {
  render: () => (
    <SidebarLayout
      navbar={
        <Navbar>
          <NavbarSection>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Admin / Dashboard</span>
          </NavbarSection>
          <NavbarSpacer />
          <NavbarSection>
            <NavbarItem href="/search" aria-label="Search">
              <Search data-slot="icon" />
            </NavbarItem>
            <NavbarItem href="/notifications" aria-label="Notifications">
              <Bell data-slot="icon" />
            </NavbarItem>
          </NavbarSection>
        </Navbar>
      }
      sidebar={<AdminSidebar />}
    >
      <div>
        <Heading>Admin Dashboard</Heading>
        <Text className="mt-2">System overview and quick actions.</Text>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Active Users', value: '1,234', icon: Users, color: 'blue' },
            { label: 'Revenue', value: '$12.4k', icon: TrendingUp, color: 'green' },
            { label: 'Messages', value: '56', icon: MessageSquare, color: 'amber' },
            { label: 'Issues', value: '3', icon: Shield, color: 'red' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
            >
              <div className="flex items-center gap-3">
                <stat.icon className="size-5 text-zinc-400" />
                <span className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-white">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </SidebarLayout>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'An admin panel layout with grouped navigation sections. The sidebar uses headings to organize related items and a divider to separate system settings.',
      },
    },
  },
}

/**
 * ## Users Management
 *
 * Another admin page, showing how the navigation state flows
 * through the entire sidebar.
 */
export const UsersManagement: Story = {
  render: () => (
    <SidebarLayout
      navbar={
        <Navbar>
          <NavbarSection>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Admin / Users</span>
          </NavbarSection>
          <NavbarSpacer />
          <NavbarSection>
            <Button>
              <Plus data-slot="icon" />
              Add User
            </Button>
          </NavbarSection>
        </Navbar>
      }
      sidebar={<AdminSidebar currentPage="users" />}
    >
      <div>
        <div className="flex items-center justify-between">
          <div>
            <Heading>Users</Heading>
            <Text className="mt-1">Manage user accounts and permissions.</Text>
          </div>
          <Button color="blue">
            <Plus data-slot="icon" />
            Add User
          </Button>
        </div>

        <div className="mt-8 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <div className="border-b border-zinc-200 p-4 dark:border-zinc-700">
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search users..."
                className="flex-1 rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              />
              <Button outline>Filter</Button>
            </div>
          </div>
          <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {[
              { name: 'Chef Ari', email: 'ari@spoonjoy.com', role: 'Admin', status: 'Active' },
              { name: 'Sous Chef Bob', email: 'bob@spoonjoy.com', role: 'Editor', status: 'Active' },
              { name: 'Line Cook Carol', email: 'carol@spoonjoy.com', role: 'Viewer', status: 'Pending' },
            ].map((user) => (
              <div key={user.email} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Avatar
                    initials={user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                    className="size-10"
                  />
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-white">{user.name}</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge>{user.role}</Badge>
                  <Badge color={user.status === 'Active' ? 'green' : 'amber'}>{user.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SidebarLayout>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'User management interface with search, filtering, and a data table. The navbar includes a contextual action button.',
      },
    },
  },
}

// =============================================================================
// RESPONSIVE BEHAVIOR
// =============================================================================

/**
 * ## Mobile View (Resize to Test)
 *
 * Resize your browser below 1024px to see the magic happen:
 * - Sidebar hides, hamburger menu appears
 * - Tap hamburger to reveal sidebar as overlay
 * - Content takes full width
 *
 * The sidebar slides in from the left with a backdrop.
 * Click outside or use the close button to dismiss.
 */
export const MobileResponsive: Story = {
  render: () => (
    <SidebarLayout navbar={<SimpleNavbar />} sidebar={<FullFeaturedSidebar />}>
      <div>
        <Heading>Responsive Layout Test</Heading>
        <Text className="mt-2">
          Resize your browser window below 1024px to see the mobile layout.
          The sidebar transforms into a slide-in panel accessible via the hamburger menu.
        </Text>
        <div className="mt-8 rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Pro tip:</strong> In Storybook, use the viewport addon (the phone icon in the
            toolbar) to quickly switch between device sizes without manually resizing.
          </p>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">What changes:</h2>
          <ul className="mt-4 space-y-2 text-zinc-600 dark:text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              Sidebar hides on screens smaller than 1024px
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              Hamburger menu button appears in the top-left
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              Navbar becomes visible above the content
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              Content takes full width instead of being offset
            </li>
          </ul>
        </div>
      </div>
    </SidebarLayout>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The sidebar layout is fully responsive. On mobile, navigation moves to a slide-in panel while the navbar provides quick access to common actions.',
      },
    },
  },
}

/**
 * ## With Breadcrumb Navbar
 *
 * The mobile navbar can show contextual information like breadcrumbs.
 * Useful for deep navigation hierarchies.
 */
export const WithBreadcrumbNavbar: Story = {
  render: () => (
    <SidebarLayout
      navbar={<NavbarWithBreadcrumb />}
      sidebar={<FullFeaturedSidebar currentPage="recipes" />}
    >
      <div>
        <Heading>Perfect Pasta Carbonara</Heading>
        <Text className="mt-2">The classic Roman pasta dish — creamy, porky, perfect.</Text>

        <div className="mt-8 aspect-video rounded-lg bg-zinc-100 dark:bg-zinc-800" />

        <div className="mt-6 flex gap-6 text-sm text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1">
            <Clock className="size-4" />
            25 minutes
          </span>
          <span className="flex items-center gap-1">
            <User className="size-4" />
            4 servings
          </span>
          <span className="flex items-center gap-1">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            4.8 (142 reviews)
          </span>
        </div>
      </div>
    </SidebarLayout>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The mobile navbar displays a breadcrumb trail. This helps users understand their location in the navigation hierarchy on mobile devices.',
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
 * Sometimes less is more. A stripped-down sidebar for focused experiences.
 * Just the essentials, no fluff.
 */
export const MinimalSidebar: Story = {
  render: () => (
    <SidebarLayout
      navbar={<SimpleNavbar />}
      sidebar={
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
      }
    >
      <MinimalContent />
    </SidebarLayout>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'A minimal sidebar with no header, footer, or sections — just the navigation items. Perfect for simple apps.',
      },
    },
  },
}

/**
 * ## Icon-Only Sidebar
 *
 * When you want navigation but don't want it taking up too much visual space.
 * The labels are still there for accessibility, they're just... shy.
 *
 * (Note: This is more of a concept — the actual component doesn't have
 * a collapsed mode, but you could build one!)
 */
export const SidebarWithIconEmphasis: Story = {
  render: () => (
    <SidebarLayout
      navbar={<SimpleNavbar />}
      sidebar={
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
              <SidebarItem href="/meal-plans">
                <Calendar data-slot="icon" />
                <SidebarLabel>Meal Plans</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/shopping">
                <ShoppingCart data-slot="icon" />
                <SidebarLabel>Shopping</SidebarLabel>
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
            <SidebarItem href="/account">
              <Avatar src="https://i.pravatar.cc/150?img=32" className="size-6" />
              <SidebarLabel>Chef Ari</SidebarLabel>
            </SidebarItem>
          </SidebarFooter>
        </Sidebar>
      }
    >
      <DashboardContent />
    </SidebarLayout>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'A sidebar with icons and labels. The icons provide quick visual scanning while labels ensure clarity.',
      },
    },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Tests that the mobile sidebar opens and closes correctly.
 * Best viewed at mobile viewport size.
 */
export const MobileSidebarInteraction: Story = {
  render: () => (
    <SidebarLayout navbar={<SimpleNavbar />} sidebar={<SimpleSidebar />}>
      <div>
        <Heading>Mobile Sidebar Test</Heading>
        <Text>This story tests the mobile sidebar open/close behavior.</Text>
      </div>
    </SidebarLayout>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    chromatic: {
      viewports: [375],
    },
    docs: {
      description: {
        story:
          'Interaction test for mobile sidebar. Click the hamburger menu to open, then close via the X button or by clicking outside.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Find the hamburger menu button
    const menuButton = canvas.getByRole('button', { name: /open navigation/i })
    await expect(menuButton).toBeInTheDocument()

    // Click to open the sidebar
    await userEvent.click(menuButton)

    // Wait for the dialog to appear
    await waitFor(() => {
      const dialog = within(document.body).queryByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })

    // Find and click the close button
    const closeButton = within(document.body).getByRole('button', { name: /close navigation/i })
    await userEvent.click(closeButton)

    // Wait for dialog to close
    await waitFor(() => {
      const dialog = within(document.body).queryByRole('dialog')
      expect(dialog).not.toBeInTheDocument()
    })
  },
}

/**
 * Tests keyboard navigation for the mobile sidebar.
 * Escape key should close the sidebar.
 */
export const MobileSidebarKeyboardNavigation: Story = {
  render: () => (
    <SidebarLayout navbar={<SimpleNavbar />} sidebar={<SimpleSidebar />}>
      <div>
        <Heading>Keyboard Navigation Test</Heading>
        <Text>This story tests keyboard accessibility of the mobile sidebar.</Text>
      </div>
    </SidebarLayout>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story:
          'Tests that the mobile sidebar responds to keyboard input. Open with Enter, close with Escape.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Find and focus the hamburger menu
    const menuButton = canvas.getByRole('button', { name: /open navigation/i })
    menuButton.focus()
    await expect(menuButton).toHaveFocus()

    // Press Enter to open
    await userEvent.keyboard('{Enter}')

    // Wait for dialog
    await waitFor(() => {
      const dialog = within(document.body).queryByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })

    // Press Escape to close
    await userEvent.keyboard('{Escape}')

    // Dialog should close
    await waitFor(() => {
      const dialog = within(document.body).queryByRole('dialog')
      expect(dialog).not.toBeInTheDocument()
    })
  },
}

/**
 * Tests that sidebar navigation items display current state correctly.
 */
export const SidebarNavigationState: Story = {
  render: () => (
    <SidebarLayout
      navbar={<SimpleNavbar />}
      sidebar={
        <Sidebar>
          <SidebarBody>
            <SidebarSection>
              <SidebarItem href="/" data-testid="nav-home">
                <Home data-slot="icon" />
                <SidebarLabel>Home</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/recipes" current data-testid="nav-recipes">
                <Utensils data-slot="icon" />
                <SidebarLabel>Recipes</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/cookbooks" data-testid="nav-cookbooks">
                <Book data-slot="icon" />
                <SidebarLabel>Cookbooks</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarBody>
        </Sidebar>
      }
    >
      <div>
        <Heading>Navigation State Test</Heading>
        <Text>This story tests that the current navigation item is properly indicated.</Text>
      </div>
    </SidebarLayout>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Find navigation items
    const recipesItem = canvas.getByTestId('nav-recipes')

    // The current item should have data-current attribute
    const recipesLink = recipesItem.querySelector('[data-current="true"]')
    await expect(recipesLink).toBeInTheDocument()

    // Other items should not have current state
    const homeItem = canvas.getByTestId('nav-home')
    const homeLink = homeItem.querySelector('[data-current="true"]')
    await expect(homeLink).not.toBeInTheDocument()
  },
  parameters: {
    docs: {
      description: {
        story:
          'Tests that the current navigation state is properly reflected with the data-current attribute.',
      },
    },
  },
}
