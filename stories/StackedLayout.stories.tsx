import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within, waitFor } from 'storybook/test'
import {
  Home,
  Search,
  ChefHat,
  Book,
  Heart,
  Settings,
  User,
  Bell,
  LogOut,
  Plus,
  Menu,
  Utensils,
  Clock,
  Star,
  ShoppingCart,
  Calendar,
} from 'lucide-react'
import { StackedLayout } from '../app/components/ui/stacked-layout'
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer, NavbarLabel, NavbarDivider } from '../app/components/ui/navbar'
import { Sidebar, SidebarBody, SidebarHeader, SidebarItem, SidebarLabel, SidebarSection, SidebarFooter, SidebarSpacer } from '../app/components/ui/sidebar'
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
 * # StackedLayout
 *
 * The "navbar on top, content below" layout. The classic. The one your users
 * expect because literally every website they've ever used has one. Sometimes
 * clichés exist for a reason.
 *
 * Unlike its sibling SidebarLayout (which shoves navigation to the side like
 * a socially awkward cousin at Thanksgiving), StackedLayout puts your navigation
 * front and center at the top of the page. It's direct. It's bold. It says
 * "here's how to get around, now let me show you the content."
 *
 * ## Stacked vs Sidebar: Choose Your Fighter
 *
 * - **StackedLayout**: Best for content-heavy sites, blogs, recipe views,
 *   marketing pages. When vertical space matters more than sidebar real estate.
 * - **SidebarLayout**: Best for apps with lots of navigation, dashboards,
 *   admin panels. When you need that persistent nav always visible.
 *
 * Both support mobile-responsive sidebars that slide in from the left.
 * Because on mobile, everyone's a sidebar person whether they like it or not.
 *
 * ## The Anatomy
 *
 * - **navbar**: The top navigation bar. Visible on all screen sizes.
 * - **sidebar**: The mobile navigation that slides in when you tap the hamburger.
 *   Hidden on desktop (because you have the navbar, remember?).
 * - **children**: Your actual content. The reason anyone came here.
 *
 * ## Mobile Behavior
 *
 * On screens smaller than `lg` (1024px):
 * - A hamburger menu appears on the left
 * - Tapping it reveals the sidebar as an overlay
 * - The sidebar includes a close button because we're civilized
 * - Backdrop click or close button dismisses it
 *
 * ## Desktop Behavior
 *
 * On `lg` screens and above:
 * - The navbar stretches across the full width
 * - No hamburger menu (the navbar IS the navigation)
 * - Content gets that nice card treatment with rounded corners and shadow
 * - The sidebar prop still needs to be provided but won't be visible
 */
const meta: Meta<typeof StackedLayout> = {
  title: 'Layout/StackedLayout',
  component: StackedLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
A top-navbar layout with mobile sidebar support. Perfect for content-focused pages where the navbar provides primary navigation and the sidebar serves as mobile overflow.

The navbar is always visible at the top. On mobile, a hamburger menu reveals the sidebar as a slide-in panel. On desktop (lg+), the sidebar is hidden and navigation relies entirely on the navbar.

Content is displayed in a centered container with max-width constraints for readability.
        `,
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// SAMPLE NAVBARS
// =============================================================================

function SimpleNavbar({ currentPage = 'home' }: { currentPage?: string }) {
  return (
    <Navbar>
      <NavbarSection>
        <NavbarItem href="/" current={currentPage === 'home'}>
          <ChefHat data-slot="icon" />
          <NavbarLabel>Spoonjoy</NavbarLabel>
        </NavbarItem>
      </NavbarSection>
      <NavbarDivider />
      <NavbarSection>
        <NavbarItem href="/recipes" current={currentPage === 'recipes'}>
          <NavbarLabel>Recipes</NavbarLabel>
        </NavbarItem>
        <NavbarItem href="/cookbooks" current={currentPage === 'cookbooks'}>
          <NavbarLabel>Cookbooks</NavbarLabel>
        </NavbarItem>
        <NavbarItem href="/meal-plans" current={currentPage === 'meal-plans'}>
          <NavbarLabel>Meal Plans</NavbarLabel>
        </NavbarItem>
      </NavbarSection>
      <NavbarSpacer />
      <NavbarSection>
        <NavbarItem href="/search" aria-label="Search">
          <Search data-slot="icon" />
        </NavbarItem>
        <NavbarItem href="/account">
          <Avatar src="https://i.pravatar.cc/150?img=32" className="size-6" />
        </NavbarItem>
      </NavbarSection>
    </Navbar>
  )
}

function NavbarWithDropdown() {
  return (
    <Navbar>
      <NavbarSection>
        <NavbarItem href="/">
          <ChefHat data-slot="icon" />
          <NavbarLabel>Spoonjoy</NavbarLabel>
        </NavbarItem>
      </NavbarSection>
      <NavbarDivider />
      <NavbarSection>
        <NavbarItem href="/recipes" current>
          <NavbarLabel>Recipes</NavbarLabel>
        </NavbarItem>
        <NavbarItem href="/cookbooks">
          <NavbarLabel>Cookbooks</NavbarLabel>
        </NavbarItem>
      </NavbarSection>
      <NavbarSpacer />
      <NavbarSection>
        <NavbarItem href="/search" aria-label="Search">
          <Search data-slot="icon" />
        </NavbarItem>
        <Dropdown>
          <DropdownButton as={NavbarItem}>
            <Avatar src="https://i.pravatar.cc/150?img=32" className="size-6" />
          </DropdownButton>
          <DropdownMenu anchor="bottom end">
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
      </NavbarSection>
    </Navbar>
  )
}

// =============================================================================
// SAMPLE SIDEBARS
// =============================================================================

function SimpleSidebar({ currentPage = 'home' }: { currentPage?: string }) {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarItem href="/">
          <ChefHat data-slot="icon" />
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
          <SidebarItem href="/meal-plans" current={currentPage === 'meal-plans'}>
            <Calendar data-slot="icon" />
            <SidebarLabel>Meal Plans</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/shopping-list" current={currentPage === 'shopping-list'}>
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
        <SidebarItem href="/account">
          <Avatar src="https://i.pravatar.cc/150?img=32" className="size-6" />
          <SidebarLabel>Chef Ari</SidebarLabel>
        </SidebarItem>
      </SidebarFooter>
    </Sidebar>
  )
}

function FullSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarItem href="/">
          <ChefHat data-slot="icon" />
          <SidebarLabel>Spoonjoy</SidebarLabel>
        </SidebarItem>
      </SidebarHeader>
      <SidebarBody>
        <SidebarSection>
          <SidebarItem href="/">
            <Home data-slot="icon" />
            <SidebarLabel>Dashboard</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/recipes" current>
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
          <SidebarItem href="/meal-plans">
            <Calendar data-slot="icon" />
            <SidebarLabel>Meal Plans</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/shopping-list">
            <ShoppingCart data-slot="icon" />
            <SidebarLabel>Shopping List</SidebarLabel>
            <Badge color="amber">3 items</Badge>
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
        <SidebarItem href="/account">
          <Avatar src="https://i.pravatar.cc/150?img=32" className="size-6" />
          <SidebarLabel>Chef Ari</SidebarLabel>
        </SidebarItem>
      </SidebarFooter>
    </Sidebar>
  )
}

// =============================================================================
// SAMPLE CONTENT
// =============================================================================

function SampleContent() {
  return (
    <div>
      <Heading>Welcome to Spoonjoy</Heading>
      <Text className="mt-2">
        Your personal recipe management platform. Organize, discover, and share
        your culinary creations.
      </Text>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: 'Perfect Pasta Carbonara', time: '25 min', rating: 4.8 },
          { title: 'Grandma\'s Apple Pie', time: '90 min', rating: 4.9 },
          { title: 'Quick Stir Fry', time: '15 min', rating: 4.5 },
          { title: 'Homemade Pizza Dough', time: '120 min', rating: 4.7 },
          { title: 'Classic French Omelette', time: '10 min', rating: 4.6 },
          { title: 'Beef Bourguignon', time: '180 min', rating: 4.9 },
        ].map((recipe) => (
          <div
            key={recipe.title}
            className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
          >
            <div className="h-32 rounded-md bg-zinc-100 dark:bg-zinc-800" />
            <h3 className="mt-3 font-semibold text-zinc-900 dark:text-white">
              {recipe.title}
            </h3>
            <div className="mt-1 flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
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

function RecipeDetailContent() {
  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <Heading>Perfect Pasta Carbonara</Heading>
          <Text className="mt-1">
            The classic Roman pasta dish — creamy, porky, perfect.
          </Text>
        </div>
        <div className="flex gap-2">
          <Button outline>
            <Heart data-slot="icon" />
            Save
          </Button>
          <Button>
            <Plus data-slot="icon" />
            Add to Meal Plan
          </Button>
        </div>
      </div>

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

      <div className="mt-8 aspect-video rounded-lg bg-zinc-100 dark:bg-zinc-800" />

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Ingredients</h2>
          <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li>400g spaghetti</li>
            <li>200g guanciale or pancetta</li>
            <li>4 egg yolks + 2 whole eggs</li>
            <li>100g Pecorino Romano, grated</li>
            <li>Freshly ground black pepper</li>
          </ul>
        </div>
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Instructions</h2>
          <ol className="mt-4 space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
            <li>1. Bring a large pot of salted water to boil. Cook pasta until al dente.</li>
            <li>2. Meanwhile, cut guanciale into small strips and cook in a cold pan over medium heat until crispy.</li>
            <li>3. Whisk egg yolks, whole eggs, and most of the Pecorino in a bowl.</li>
            <li>4. When pasta is ready, reserve 1 cup pasta water, then drain.</li>
            <li>5. Remove guanciale pan from heat. Add pasta, toss, then add egg mixture.</li>
            <li>6. Toss vigorously, adding pasta water as needed for creamy sauce.</li>
            <li>7. Top with remaining Pecorino and lots of black pepper. Serve immediately.</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

function EmptyStateContent() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
        <Book className="size-8 text-zinc-400" />
      </div>
      <Heading level={2} className="mt-4">No cookbooks yet</Heading>
      <Text className="mt-2 max-w-sm">
        Create your first cookbook to start organizing your recipes.
        Think of it as a digital recipe binder, minus the sauce stains.
      </Text>
      <Button className="mt-6" color="blue">
        <Plus data-slot="icon" />
        Create Cookbook
      </Button>
    </div>
  )
}

function LongContent() {
  return (
    <div>
      <Heading>The Art of Sourdough</Heading>
      <Text className="mt-2">A comprehensive guide to making sourdough bread from scratch.</Text>

      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="mt-8">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            {['Getting Started', 'Creating Your Starter', 'Feeding Schedule', 'Making the Dough', 'Bulk Fermentation', 'Shaping', 'Cold Proofing', 'Baking'][i]}
          </h2>
          <Text className="mt-2">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
            ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
            ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </Text>
          <Text className="mt-4">
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
            mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit
            voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab
            illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
          </Text>
        </div>
      ))}
    </div>
  )
}

// =============================================================================
// BASIC STORIES
// =============================================================================

/**
 * The default stacked layout. Navbar on top, content below.
 * On mobile, a hamburger reveals the sidebar. On desktop, it's all navbar, all the time.
 */
export const Default: Story = {
  render: () => (
    <StackedLayout
      navbar={<SimpleNavbar />}
      sidebar={<SimpleSidebar />}
    >
      <SampleContent />
    </StackedLayout>
  ),
}

/**
 * With a dropdown menu in the navbar for user actions.
 * Because sometimes you need more than just a profile link.
 */
export const WithUserDropdown: Story = {
  render: () => (
    <StackedLayout
      navbar={<NavbarWithDropdown />}
      sidebar={<SimpleSidebar />}
    >
      <SampleContent />
    </StackedLayout>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The navbar includes a dropdown menu for user account actions. A common pattern for authenticated apps.',
      },
    },
  },
}

// =============================================================================
// CONTENT EXAMPLES
// =============================================================================

/**
 * ## Recipe Detail Page
 *
 * A full recipe view with hero image, ingredients, and instructions.
 * This is what you're here for — the actual content.
 */
export const RecipeDetail: Story = {
  render: () => (
    <StackedLayout
      navbar={<SimpleNavbar currentPage="recipes" />}
      sidebar={<SimpleSidebar currentPage="recipes" />}
    >
      <RecipeDetailContent />
    </StackedLayout>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A recipe detail page with full content. The stacked layout gives maximum horizontal space for the recipe content.',
      },
    },
  },
}

/**
 * ## Empty State
 *
 * When there's nothing to show yet. The content area handles it gracefully
 * with a centered call-to-action.
 */
export const EmptyState: Story = {
  render: () => (
    <StackedLayout
      navbar={<SimpleNavbar currentPage="cookbooks" />}
      sidebar={<SimpleSidebar currentPage="cookbooks" />}
    >
      <EmptyStateContent />
    </StackedLayout>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Empty states are centered within the content area. A good opportunity to guide users toward their first action.',
      },
    },
  },
}

/**
 * ## Long Content
 *
 * A page with lots of scrollable content. The layout handles it —
 * the content scrolls while the navbar stays fixed... wait, no.
 * The whole page scrolls. We're not monsters.
 */
export const LongScrollableContent: Story = {
  render: () => (
    <StackedLayout
      navbar={<SimpleNavbar />}
      sidebar={<SimpleSidebar />}
    >
      <LongContent />
    </StackedLayout>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Long content scrolls naturally. The layout doesn\'t impose fixed heights or inner scroll containers.',
      },
    },
  },
}

// =============================================================================
// SIDEBAR VARIATIONS
// =============================================================================

/**
 * ## Full-Featured Sidebar
 *
 * A sidebar with sections, badges, and all the bells and whistles.
 * This is what mobile users will see when they tap the hamburger.
 */
export const WithFullSidebar: Story = {
  render: () => (
    <StackedLayout
      navbar={<SimpleNavbar currentPage="recipes" />}
      sidebar={<FullSidebar />}
    >
      <SampleContent />
    </StackedLayout>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The mobile sidebar can be as feature-rich as needed. It slides in from the left with a smooth transition.',
      },
    },
  },
}

/**
 * ## Minimal Sidebar
 *
 * Sometimes less is more. A stripped-down sidebar for focused experiences.
 */
export const MinimalSidebar: Story = {
  render: () => (
    <StackedLayout
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
      <SampleContent />
    </StackedLayout>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A minimal sidebar with just the essentials. Perfect for simple apps with focused navigation.',
      },
    },
  },
}

// =============================================================================
// NAVBAR VARIATIONS
// =============================================================================

/**
 * ## Centered Navbar
 *
 * Logo on left, navigation centered, user on right.
 * The SpacerS do all the heavy lifting.
 */
export const CenteredNavigation: Story = {
  render: () => (
    <StackedLayout
      navbar={
        <Navbar>
          <NavbarSection>
            <NavbarItem href="/">
              <ChefHat data-slot="icon" />
            </NavbarItem>
          </NavbarSection>
          <NavbarSpacer />
          <NavbarSection>
            <NavbarItem href="/recipes" current>
              <NavbarLabel>Recipes</NavbarLabel>
            </NavbarItem>
            <NavbarItem href="/cookbooks">
              <NavbarLabel>Cookbooks</NavbarLabel>
            </NavbarItem>
            <NavbarItem href="/meal-plans">
              <NavbarLabel>Meal Plans</NavbarLabel>
            </NavbarItem>
            <NavbarItem href="/community">
              <NavbarLabel>Community</NavbarLabel>
            </NavbarItem>
          </NavbarSection>
          <NavbarSpacer />
          <NavbarSection>
            <NavbarItem href="/search" aria-label="Search">
              <Search data-slot="icon" />
            </NavbarItem>
            <NavbarItem href="/account">
              <Avatar src="https://i.pravatar.cc/150?img=32" className="size-6" />
            </NavbarItem>
          </NavbarSection>
        </Navbar>
      }
      sidebar={<SimpleSidebar />}
    >
      <SampleContent />
    </StackedLayout>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Using NavbarSpacer on both sides of the navigation centers it. Logo left, user right, nav in the middle.',
      },
    },
  },
}

/**
 * ## Navbar with Icons
 *
 * Icon-only navigation items with tooltips (well, aria-labels — close enough).
 */
export const IconOnlyNavbar: Story = {
  render: () => (
    <StackedLayout
      navbar={
        <Navbar>
          <NavbarSection>
            <NavbarItem href="/">
              <ChefHat data-slot="icon" />
              <NavbarLabel>Spoonjoy</NavbarLabel>
            </NavbarItem>
          </NavbarSection>
          <NavbarSpacer />
          <NavbarSection>
            <NavbarItem href="/" aria-label="Home" current>
              <Home data-slot="icon" />
            </NavbarItem>
            <NavbarItem href="/recipes" aria-label="Recipes">
              <Utensils data-slot="icon" />
            </NavbarItem>
            <NavbarItem href="/cookbooks" aria-label="Cookbooks">
              <Book data-slot="icon" />
            </NavbarItem>
            <NavbarItem href="/favorites" aria-label="Favorites">
              <Heart data-slot="icon" />
            </NavbarItem>
          </NavbarSection>
          <NavbarSpacer />
          <NavbarSection>
            <NavbarItem href="/search" aria-label="Search">
              <Search data-slot="icon" />
            </NavbarItem>
            <NavbarItem href="/notifications" aria-label="Notifications">
              <Bell data-slot="icon" />
            </NavbarItem>
            <NavbarItem href="/account">
              <Avatar src="https://i.pravatar.cc/150?img=32" className="size-6" />
            </NavbarItem>
          </NavbarSection>
        </Navbar>
      }
      sidebar={<SimpleSidebar />}
    >
      <SampleContent />
    </StackedLayout>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Icon-only navigation saves space. Just make sure to include aria-labels for accessibility.',
      },
    },
  },
}

/**
 * ## Navbar with Actions
 *
 * Include primary action buttons right in the navbar.
 * Because sometimes you want that "New Recipe" button always visible.
 */
export const NavbarWithActions: Story = {
  render: () => (
    <StackedLayout
      navbar={
        <Navbar>
          <NavbarSection>
            <NavbarItem href="/">
              <ChefHat data-slot="icon" />
              <NavbarLabel>Spoonjoy</NavbarLabel>
            </NavbarItem>
          </NavbarSection>
          <NavbarDivider />
          <NavbarSection>
            <NavbarItem href="/recipes" current>
              <NavbarLabel>Recipes</NavbarLabel>
            </NavbarItem>
            <NavbarItem href="/cookbooks">
              <NavbarLabel>Cookbooks</NavbarLabel>
            </NavbarItem>
          </NavbarSection>
          <NavbarSpacer />
          <NavbarSection>
            <Button color="blue">
              <Plus data-slot="icon" />
              New Recipe
            </Button>
          </NavbarSection>
          <NavbarSection>
            <NavbarItem href="/search" aria-label="Search">
              <Search data-slot="icon" />
            </NavbarItem>
            <NavbarItem href="/account">
              <Avatar src="https://i.pravatar.cc/150?img=32" className="size-6" />
            </NavbarItem>
          </NavbarSection>
        </Navbar>
      }
      sidebar={<SimpleSidebar />}
    >
      <SampleContent />
    </StackedLayout>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Primary actions can live in the navbar for always-visible access. Great for "Create New" flows.',
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
 * Resize your browser below 1024px to see the mobile behavior:
 * - Hamburger menu appears
 * - Tap it to reveal the sidebar
 * - Content takes full width
 *
 * The sidebar slides in from the left with a backdrop overlay.
 */
export const MobileResponsive: Story = {
  render: () => (
    <StackedLayout
      navbar={<SimpleNavbar />}
      sidebar={<FullSidebar />}
    >
      <div>
        <Heading>Resize to Test Mobile</Heading>
        <Text className="mt-2">
          Make your browser window narrower than 1024px to see the mobile layout in action.
          The hamburger menu will appear on the left side of the navbar.
        </Text>
        <div className="mt-8 rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Tip:</strong> In Storybook, you can use the viewport addon (📱 icon in toolbar)
            to quickly switch between device sizes.
          </p>
        </div>
      </div>
    </StackedLayout>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The stacked layout is fully responsive. On mobile, the hamburger menu reveals the sidebar as a slide-in panel.',
      },
    },
  },
}

// =============================================================================
// REAL-WORLD EXAMPLES
// =============================================================================

/**
 * ## Recipe App Dashboard
 *
 * A complete dashboard layout with navigation, user menu, and content grid.
 * This is what a real app might look like.
 */
export const RecipeAppDashboard: Story = {
  render: () => (
    <StackedLayout
      navbar={
        <Navbar>
          <NavbarSection>
            <NavbarItem href="/">
              <ChefHat data-slot="icon" />
              <NavbarLabel>Spoonjoy</NavbarLabel>
            </NavbarItem>
          </NavbarSection>
          <NavbarDivider />
          <NavbarSection>
            <NavbarItem href="/" current>
              <NavbarLabel>Dashboard</NavbarLabel>
            </NavbarItem>
            <NavbarItem href="/recipes">
              <NavbarLabel>Recipes</NavbarLabel>
            </NavbarItem>
            <NavbarItem href="/cookbooks">
              <NavbarLabel>Cookbooks</NavbarLabel>
            </NavbarItem>
            <NavbarItem href="/meal-plans">
              <NavbarLabel>Meal Plans</NavbarLabel>
            </NavbarItem>
          </NavbarSection>
          <NavbarSpacer />
          <NavbarSection>
            <Button outline>
              <Plus data-slot="icon" />
              New Recipe
            </Button>
          </NavbarSection>
          <NavbarSection>
            <NavbarItem href="/search" aria-label="Search">
              <Search data-slot="icon" />
            </NavbarItem>
            <NavbarItem href="/notifications" aria-label="Notifications">
              <Bell data-slot="icon" />
            </NavbarItem>
            <Dropdown>
              <DropdownButton as={NavbarItem}>
                <Avatar src="https://i.pravatar.cc/150?img=32" className="size-6" />
              </DropdownButton>
              <DropdownMenu anchor="bottom end">
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
          </NavbarSection>
        </Navbar>
      }
      sidebar={<FullSidebar />}
    >
      <div>
        <div className="flex items-center justify-between">
          <div>
            <Heading>Good morning, Chef Ari</Heading>
            <Text className="mt-1">Here's what's cooking in your kitchen.</Text>
          </div>
          <Button color="blue">
            <Plus data-slot="icon" />
            Create Recipe
          </Button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Recipes', value: '142', icon: Utensils, color: 'blue' },
            { label: 'Cookbooks', value: '8', icon: Book, color: 'indigo' },
            { label: 'Favorites', value: '24', icon: Heart, color: 'red' },
            { label: 'This Week\'s Meals', value: '5', icon: Calendar, color: 'green' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg bg-${stat.color}-100 p-2 dark:bg-${stat.color}-900/20`}>
                  <stat.icon className={`size-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-zinc-900 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Recent Recipes</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Perfect Pasta Carbonara', time: '25 min', rating: 4.8 },
              { title: 'Grandma\'s Apple Pie', time: '90 min', rating: 4.9 },
              { title: 'Quick Stir Fry', time: '15 min', rating: 4.5 },
            ].map((recipe) => (
              <div
                key={recipe.title}
                className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
              >
                <div className="h-32 rounded-md bg-zinc-100 dark:bg-zinc-800" />
                <h3 className="mt-3 font-semibold text-zinc-900 dark:text-white">
                  {recipe.title}
                </h3>
                <div className="mt-1 flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
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
      </div>
    </StackedLayout>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A complete dashboard example showing how all the pieces fit together in a real application.',
      },
    },
  },
}

/**
 * ## Blog/Article Layout
 *
 * Stacked layouts shine for content-heavy pages like blogs.
 * Maximum width for content, navbar for navigation.
 */
export const BlogLayout: Story = {
  render: () => (
    <StackedLayout
      navbar={
        <Navbar>
          <NavbarSection>
            <NavbarItem href="/">
              <ChefHat data-slot="icon" />
              <NavbarLabel>Spoonjoy Blog</NavbarLabel>
            </NavbarItem>
          </NavbarSection>
          <NavbarSpacer />
          <NavbarSection>
            <NavbarItem href="/blog" current>
              <NavbarLabel>Articles</NavbarLabel>
            </NavbarItem>
            <NavbarItem href="/recipes">
              <NavbarLabel>Recipes</NavbarLabel>
            </NavbarItem>
            <NavbarItem href="/about">
              <NavbarLabel>About</NavbarLabel>
            </NavbarItem>
          </NavbarSection>
          <NavbarSpacer />
          <NavbarSection>
            <NavbarItem href="/search" aria-label="Search">
              <Search data-slot="icon" />
            </NavbarItem>
          </NavbarSection>
        </Navbar>
      }
      sidebar={
        <Sidebar>
          <SidebarBody>
            <SidebarSection>
              <SidebarItem href="/blog" current>
                <Home data-slot="icon" />
                <SidebarLabel>All Articles</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/blog/techniques">
                <ChefHat data-slot="icon" />
                <SidebarLabel>Techniques</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/blog/ingredients">
                <Utensils data-slot="icon" />
                <SidebarLabel>Ingredients</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/blog/stories">
                <Book data-slot="icon" />
                <SidebarLabel>Stories</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarBody>
        </Sidebar>
      }
    >
      <article className="prose prose-zinc dark:prose-invert max-w-none">
        <Heading>The Science of Sourdough: Why Your Starter is Alive</Heading>
        <Text className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
          A deep dive into the microbiology of sourdough and why that bubbly jar on your counter
          is basically a pet.
        </Text>

        <div className="mt-4 flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <Avatar src="https://i.pravatar.cc/150?img=32" className="size-8" />
            <span>Chef Ari</span>
          </div>
          <span>•</span>
          <span>January 15, 2024</span>
          <span>•</span>
          <span>8 min read</span>
        </div>

        <div className="mt-8 aspect-[2/1] rounded-lg bg-zinc-100 dark:bg-zinc-800" />

        <div className="mt-8 space-y-4 text-zinc-600 dark:text-zinc-400">
          <p>
            Every sourdough starter is a living ecosystem. Inside that humble jar of flour and water,
            billions of microorganisms are working together in a delicate balance that humans have
            exploited for thousands of years.
          </p>
          <p>
            The magic of sourdough comes from two types of organisms: wild yeast and lactic acid
            bacteria. The yeast produces carbon dioxide (those bubbles that make your bread rise),
            while the bacteria produce lactic and acetic acids (that tangy flavor you love).
          </p>
          <p>
            But here's where it gets interesting: these organisms don't just coexist — they depend
            on each other. The bacteria create an acidic environment that prevents harmful
            microorganisms from taking over, while the yeast breaks down complex sugars that the
            bacteria can't digest on their own.
          </p>
        </div>
      </article>
    </StackedLayout>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A blog/article layout demonstrating the stacked layout\'s strength for content-focused pages.',
      },
    },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Tests that the mobile sidebar opens and closes correctly.
 * Note: This test works best at mobile viewport sizes.
 */
export const MobileSidebarInteraction: Story = {
  render: () => (
    <StackedLayout
      navbar={<SimpleNavbar />}
      sidebar={<SimpleSidebar />}
    >
      <div>
        <Heading>Mobile Sidebar Test</Heading>
        <Text>This story tests the mobile sidebar interaction.</Text>
      </div>
    </StackedLayout>
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
        story: 'Tests the mobile sidebar open/close behavior. The hamburger menu should open the sidebar, and clicking outside or the close button should dismiss it.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Find the hamburger menu button (has aria-label "Open navigation")
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
 */
export const MobileSidebarKeyboardNavigation: Story = {
  render: () => (
    <StackedLayout
      navbar={<SimpleNavbar />}
      sidebar={<SimpleSidebar />}
    >
      <div>
        <Heading>Keyboard Navigation Test</Heading>
        <Text>This story tests keyboard accessibility of the mobile sidebar.</Text>
      </div>
    </StackedLayout>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Tests that the mobile sidebar can be opened with keyboard and closed with Escape.',
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
 * Tests that the navbar items work correctly.
 */
export const NavbarInteraction: Story = {
  render: () => (
    <StackedLayout
      navbar={
        <Navbar>
          <NavbarSection>
            <NavbarItem href="/">
              <ChefHat data-slot="icon" />
              <NavbarLabel>Spoonjoy</NavbarLabel>
            </NavbarItem>
          </NavbarSection>
          <NavbarDivider />
          <NavbarSection>
            <NavbarItem href="/recipes" current data-testid="nav-recipes">
              <NavbarLabel>Recipes</NavbarLabel>
            </NavbarItem>
            <NavbarItem href="/cookbooks" data-testid="nav-cookbooks">
              <NavbarLabel>Cookbooks</NavbarLabel>
            </NavbarItem>
          </NavbarSection>
          <NavbarSpacer />
          <NavbarSection>
            <NavbarItem href="/search" aria-label="Search" data-testid="nav-search">
              <Search data-slot="icon" />
            </NavbarItem>
          </NavbarSection>
        </Navbar>
      }
      sidebar={<SimpleSidebar />}
    >
      <div>
        <Heading>Navbar Interaction Test</Heading>
        <Text>This story tests navbar item interactions.</Text>
      </div>
    </StackedLayout>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Find navbar items
    const recipesLink = canvas.getByTestId('nav-recipes')
    const cookbooksLink = canvas.getByTestId('nav-cookbooks')
    const searchLink = canvas.getByTestId('nav-search')

    // Verify they exist and are accessible
    await expect(recipesLink).toBeInTheDocument()
    await expect(cookbooksLink).toBeInTheDocument()
    await expect(searchLink).toBeInTheDocument()

    // Verify current state
    await expect(recipesLink).toHaveAttribute('data-current', 'true')

    // Test hover states (focus as proxy)
    await userEvent.tab() // Focus first interactive element
    await userEvent.tab() // Focus recipes
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests that navbar items are interactive and properly indicate current state.',
      },
    },
  },
}
