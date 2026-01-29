import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within, waitFor } from 'storybook/test'
import {
  ChefHat,
  Copy,
  Edit,
  Eye,
  Heart,
  LogOut,
  MoreHorizontal,
  Plus,
  Settings,
  Share2,
  Trash2,
  User,
  Users,
  Archive,
  Star,
  Download,
  Clock,
  Utensils,
  Book,
} from 'lucide-react'
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
  DropdownItem,
  DropdownLabel,
  DropdownDescription,
  DropdownShortcut,
  DropdownDivider,
  DropdownSection,
  DropdownHeading,
  DropdownHeader,
} from '../app/components/ui/dropdown'
import { Button } from '../app/components/ui/button'
import { Avatar } from '../app/components/ui/avatar'

/**
 * # Dropdown
 *
 * The action menu. The "click here for options" of user interfaces. The three dots
 * that whisper "there's more where that came from."
 *
 * Dropdowns are the Swiss Army knife of UIs — they pack a lot of actions into a
 * tiny trigger. Perfect for when you have too many buttons but refuse to admit
 * your design needs a rethink.
 *
 * ## Dropdown vs Select vs Listbox: The Trilogy
 *
 * - **Select/Listbox**: For choosing a value in a form. The answer to "what do you want?"
 * - **Dropdown**: For triggering actions. The answer to "what do you want to *do*?"
 *
 * If clicking an option navigates somewhere or performs an action, use Dropdown.
 * If clicking an option changes a form field's value, use Select or Listbox.
 *
 * ## The Anatomy of a Good Dropdown
 *
 * - **DropdownButton**: The trigger. Usually a button with an icon or "⋮"
 * - **DropdownMenu**: The container that appears on click
 * - **DropdownItem**: Each action in the menu. Can be a button or link
 * - **DropdownLabel**: The action text
 * - **DropdownDescription**: Optional secondary text (use sparingly)
 * - **DropdownShortcut**: Keyboard shortcuts, for power users who judge you
 * - **DropdownDivider**: Visual separator between groups
 * - **DropdownSection**: Logical grouping with optional heading
 * - **DropdownHeading**: Section title
 * - **DropdownHeader**: Custom header content
 *
 * ## When to Use Dropdowns
 *
 * - **Overflow actions**: When a row or card has more actions than visible buttons
 * - **User menus**: Profile, settings, logout. The classic trio
 * - **Context menus**: Right-click alternatives (please, not on mobile)
 * - **Bulk actions**: "With selected items..." scenarios
 *
 * ## When NOT to Use Dropdowns
 *
 * - Primary actions — those deserve their own buttons
 * - Form inputs — use Select or Listbox instead
 * - Navigation — use actual nav components
 * - When you have 2-3 options — just show them as buttons
 */
const meta: Meta<typeof Dropdown> = {
  title: 'UI/Dropdown',
  component: Dropdown,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
An action menu component for contextual actions and navigation. Built on HeadlessUI's Menu primitive with support for icons, descriptions, keyboard shortcuts, sections, and dividers.

Unlike Select/Listbox (for form values), Dropdown is for triggering actions — edit, delete, share, etc. If clicking does something rather than selects something, use Dropdown.
        `,
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="min-h-[300px] flex items-start justify-center pt-4">
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
 * The simplest dropdown. A button that reveals a menu of actions.
 * Click to see your options, click again to make it go away.
 * Revolutionary.
 */
export const Default: Story = {
  render: () => (
    <Dropdown>
      <DropdownButton as={Button}>Options</DropdownButton>
      <DropdownMenu>
        <DropdownItem>
          <DropdownLabel>View</DropdownLabel>
        </DropdownItem>
        <DropdownItem>
          <DropdownLabel>Edit</DropdownLabel>
        </DropdownItem>
        <DropdownItem>
          <DropdownLabel>Delete</DropdownLabel>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ),
}

/**
 * The iconic three-dot menu. When you have actions but no space for words.
 * Every mobile app designer's best friend and worst crutch.
 */
export const MoreMenu: Story = {
  render: () => (
    <Dropdown>
      <DropdownButton as={Button} plain aria-label="More options">
        <MoreHorizontal />
      </DropdownButton>
      <DropdownMenu>
        <DropdownItem>
          <DropdownLabel>View details</DropdownLabel>
        </DropdownItem>
        <DropdownItem>
          <DropdownLabel>Edit</DropdownLabel>
        </DropdownItem>
        <DropdownItem>
          <DropdownLabel>Duplicate</DropdownLabel>
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem>
          <DropdownLabel>Delete</DropdownLabel>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The classic overflow menu pattern. Three dots = "there\'s more". Used for secondary actions on cards, rows, and items.',
      },
    },
  },
}

// =============================================================================
// WITH ICONS
// =============================================================================

/**
 * ## Icons Make Everything Better
 *
 * Add icons to dropdown items using the `data-slot="icon"` attribute.
 * Icons appear on the left, making actions instantly recognizable.
 *
 * Pro tip: Don't icon every item. Icons for the 3-4 most used actions,
 * leave the rest text-only. Visual hierarchy matters.
 */
export const WithIcons: Story = {
  render: () => (
    <Dropdown>
      <DropdownButton as={Button}>
        <Settings data-slot="icon" />
        Actions
      </DropdownButton>
      <DropdownMenu>
        <DropdownItem>
          <Eye data-slot="icon" />
          <DropdownLabel>View</DropdownLabel>
        </DropdownItem>
        <DropdownItem>
          <Edit data-slot="icon" />
          <DropdownLabel>Edit</DropdownLabel>
        </DropdownItem>
        <DropdownItem>
          <Copy data-slot="icon" />
          <DropdownLabel>Duplicate</DropdownLabel>
        </DropdownItem>
        <DropdownItem>
          <Share2 data-slot="icon" />
          <DropdownLabel>Share</DropdownLabel>
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem>
          <Archive data-slot="icon" />
          <DropdownLabel>Archive</DropdownLabel>
        </DropdownItem>
        <DropdownItem>
          <Trash2 data-slot="icon" />
          <DropdownLabel>Delete</DropdownLabel>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Icons use the `data-slot="icon"` attribute. They\'re automatically positioned and styled.',
      },
    },
  },
}

/**
 * A more restrained icon usage. Icons only on primary actions.
 * The others can figure it out from context.
 */
export const SelectiveIcons: Story = {
  render: () => (
    <Dropdown>
      <DropdownButton as={Button} plain aria-label="Recipe actions">
        <MoreHorizontal />
      </DropdownButton>
      <DropdownMenu>
        <DropdownItem>
          <Edit data-slot="icon" />
          <DropdownLabel>Edit recipe</DropdownLabel>
        </DropdownItem>
        <DropdownItem>
          <Copy data-slot="icon" />
          <DropdownLabel>Duplicate</DropdownLabel>
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem>
          <DropdownLabel>Rename</DropdownLabel>
        </DropdownItem>
        <DropdownItem>
          <DropdownLabel>Move to collection</DropdownLabel>
        </DropdownItem>
        <DropdownItem>
          <DropdownLabel>Add tags</DropdownLabel>
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem>
          <Trash2 data-slot="icon" />
          <DropdownLabel>Delete</DropdownLabel>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ),
}

// =============================================================================
// WITH DESCRIPTIONS
// =============================================================================

/**
 * ## When Labels Aren't Enough
 *
 * Add descriptions to explain what an action does. Useful for
 * destructive actions, or when "Archive" could mean three things.
 */
export const WithDescriptions: Story = {
  render: () => (
    <Dropdown>
      <DropdownButton as={Button}>Share Recipe</DropdownButton>
      <DropdownMenu>
        <DropdownItem>
          <Copy data-slot="icon" />
          <DropdownLabel>Copy link</DropdownLabel>
          <DropdownDescription>Anyone with the link can view</DropdownDescription>
        </DropdownItem>
        <DropdownItem>
          <Users data-slot="icon" />
          <DropdownLabel>Share with collaborators</DropdownLabel>
          <DropdownDescription>Invite others to edit</DropdownDescription>
        </DropdownItem>
        <DropdownItem>
          <Download data-slot="icon" />
          <DropdownLabel>Export as PDF</DropdownLabel>
          <DropdownDescription>Download a printable version</DropdownDescription>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Use DropdownDescription to add context. Great for complex actions or when the label alone is ambiguous.',
      },
    },
  },
}

// =============================================================================
// WITH KEYBOARD SHORTCUTS
// =============================================================================

/**
 * ## Keyboard Shortcuts
 *
 * Show keyboard shortcuts with DropdownShortcut. Power users will
 * see these and know you care. Everyone else will ignore them.
 *
 * Note: The shortcuts are display-only. You need to implement
 * the actual keyboard handlers yourself. We're not magicians.
 */
export const WithShortcuts: Story = {
  render: () => (
    <Dropdown>
      <DropdownButton as={Button}>Edit</DropdownButton>
      <DropdownMenu>
        <DropdownItem>
          <Edit data-slot="icon" />
          <DropdownLabel>Edit</DropdownLabel>
          <DropdownShortcut keys="⌘E" />
        </DropdownItem>
        <DropdownItem>
          <Copy data-slot="icon" />
          <DropdownLabel>Duplicate</DropdownLabel>
          <DropdownShortcut keys="⌘D" />
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem>
          <DropdownLabel>Undo</DropdownLabel>
          <DropdownShortcut keys="⌘Z" />
        </DropdownItem>
        <DropdownItem>
          <DropdownLabel>Redo</DropdownLabel>
          <DropdownShortcut keys="⌘⇧Z" />
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem>
          <Trash2 data-slot="icon" />
          <DropdownLabel>Delete</DropdownLabel>
          <DropdownShortcut keys="⌫" />
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ),
  parameters: {
    docs: {
      description: {
        story: 'DropdownShortcut accepts a `keys` prop — string or array of strings for multi-key shortcuts like ["⌘", "⇧", "S"].',
      },
    },
  },
}

/**
 * Multi-key shortcuts displayed as individual keys.
 */
export const MultiKeyShortcuts: Story = {
  render: () => (
    <Dropdown>
      <DropdownButton as={Button}>Actions</DropdownButton>
      <DropdownMenu>
        <DropdownItem>
          <DropdownLabel>Save</DropdownLabel>
          <DropdownShortcut keys={['⌘', 'S']} />
        </DropdownItem>
        <DropdownItem>
          <DropdownLabel>Save As</DropdownLabel>
          <DropdownShortcut keys={['⌘', '⇧', 'S']} />
        </DropdownItem>
        <DropdownItem>
          <DropdownLabel>Export</DropdownLabel>
          <DropdownShortcut keys={['⌘', 'E']} />
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem>
          <DropdownLabel>Preferences</DropdownLabel>
          <DropdownShortcut keys={['⌘', ',']} />
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Pass an array of keys for proper spacing between modifier keys.',
      },
    },
  },
}

// =============================================================================
// WITH SECTIONS
// =============================================================================

/**
 * ## Organized Chaos
 *
 * Use DropdownSection and DropdownHeading to group related actions.
 * Sections provide visual and semantic grouping.
 */
export const WithSections: Story = {
  render: () => (
    <Dropdown>
      <DropdownButton as={Button}>Cookbook Actions</DropdownButton>
      <DropdownMenu>
        <DropdownSection>
          <DropdownHeading>Recipe</DropdownHeading>
          <DropdownItem>
            <Plus data-slot="icon" />
            <DropdownLabel>Add new recipe</DropdownLabel>
          </DropdownItem>
          <DropdownItem>
            <Copy data-slot="icon" />
            <DropdownLabel>Import recipe</DropdownLabel>
          </DropdownItem>
        </DropdownSection>
        <DropdownDivider />
        <DropdownSection>
          <DropdownHeading>Cookbook</DropdownHeading>
          <DropdownItem>
            <Edit data-slot="icon" />
            <DropdownLabel>Edit details</DropdownLabel>
          </DropdownItem>
          <DropdownItem>
            <Share2 data-slot="icon" />
            <DropdownLabel>Share cookbook</DropdownLabel>
          </DropdownItem>
          <DropdownItem>
            <Download data-slot="icon" />
            <DropdownLabel>Export all</DropdownLabel>
          </DropdownItem>
        </DropdownSection>
        <DropdownDivider />
        <DropdownSection>
          <DropdownHeading>Danger Zone</DropdownHeading>
          <DropdownItem>
            <Trash2 data-slot="icon" />
            <DropdownLabel>Delete cookbook</DropdownLabel>
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  ),
  parameters: {
    docs: {
      description: {
        story: 'DropdownSection groups items semantically. DropdownHeading labels the section. Use with DropdownDivider for visual separation.',
      },
    },
  },
}

// =============================================================================
// WITH HEADER
// =============================================================================

/**
 * ## Custom Headers
 *
 * DropdownHeader adds custom content at the top of the menu.
 * Great for user info, context, or just being fancy.
 */
export const WithHeader: Story = {
  render: () => (
    <Dropdown>
      <DropdownButton as={Button} plain aria-label="User menu">
        <Avatar src="https://i.pravatar.cc/150?img=32" className="size-8" />
      </DropdownButton>
      <DropdownMenu anchor="bottom end">
        <DropdownHeader>
          <div className="flex items-center gap-3">
            <Avatar src="https://i.pravatar.cc/150?img=32" className="size-10" />
            <div>
              <div className="text-sm font-medium text-zinc-900 dark:text-white">Chef Ari</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">ari@example.com</div>
            </div>
          </div>
        </DropdownHeader>
        <DropdownDivider />
        <DropdownItem>
          <User data-slot="icon" />
          <DropdownLabel>Profile</DropdownLabel>
        </DropdownItem>
        <DropdownItem>
          <Settings data-slot="icon" />
          <DropdownLabel>Settings</DropdownLabel>
        </DropdownItem>
        <DropdownItem>
          <Heart data-slot="icon" />
          <DropdownLabel>Favorites</DropdownLabel>
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem>
          <LogOut data-slot="icon" />
          <DropdownLabel>Sign out</DropdownLabel>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ),
  parameters: {
    docs: {
      description: {
        story: 'DropdownHeader is for custom content like user info. It\'s not focusable — purely informational.',
      },
    },
  },
}

// =============================================================================
// DISABLED STATES
// =============================================================================

/**
 * ## Disabled Items
 *
 * Some options aren't available right now. Maybe you need to
 * upgrade, maybe you haven't saved yet, maybe Mercury is in retrograde.
 * Whatever the reason, disabled items stay visible but unclickable.
 */
export const DisabledItems: Story = {
  render: () => (
    <Dropdown>
      <DropdownButton as={Button}>Recipe Actions</DropdownButton>
      <DropdownMenu>
        <DropdownItem>
          <Eye data-slot="icon" />
          <DropdownLabel>View</DropdownLabel>
        </DropdownItem>
        <DropdownItem>
          <Edit data-slot="icon" />
          <DropdownLabel>Edit</DropdownLabel>
        </DropdownItem>
        <DropdownItem disabled>
          <Share2 data-slot="icon" />
          <DropdownLabel>Share</DropdownLabel>
          <DropdownDescription>Save recipe first to share</DropdownDescription>
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem disabled>
          <Archive data-slot="icon" />
          <DropdownLabel>Archive</DropdownLabel>
          <DropdownDescription>Only published recipes can be archived</DropdownDescription>
        </DropdownItem>
        <DropdownItem>
          <Trash2 data-slot="icon" />
          <DropdownLabel>Delete</DropdownLabel>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Disabled items have reduced opacity and cannot be clicked. Use descriptions to explain why.',
      },
    },
  },
}

// =============================================================================
// LINK ITEMS
// =============================================================================

/**
 * ## Navigation Items
 *
 * DropdownItem can be a link by passing an `href` prop.
 * It renders as our Link component, supporting both internal
 * and external navigation.
 */
export const WithLinks: Story = {
  render: () => (
    <Dropdown>
      <DropdownButton as={Button}>Help</DropdownButton>
      <DropdownMenu>
        <DropdownItem href="/docs">
          <Book data-slot="icon" />
          <DropdownLabel>Documentation</DropdownLabel>
        </DropdownItem>
        <DropdownItem href="/tutorials">
          <ChefHat data-slot="icon" />
          <DropdownLabel>Tutorials</DropdownLabel>
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem href="https://github.com" target="_blank">
          <DropdownLabel>GitHub</DropdownLabel>
          <DropdownDescription>View source code</DropdownDescription>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Add `href` to make an item a link. It becomes an anchor tag styled like a menu item.',
      },
    },
  },
}

// =============================================================================
// ANCHOR POSITIONS
// =============================================================================

/**
 * ## Menu Positioning
 *
 * Control where the menu appears with the `anchor` prop.
 * HeadlessUI handles collision detection, so it'll flip if needed.
 */
export const AnchorPositions: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap justify-center items-start">
      <Dropdown>
        <DropdownButton as={Button} outline>Bottom Start</DropdownButton>
        <DropdownMenu anchor="bottom start">
          <DropdownItem><DropdownLabel>Option 1</DropdownLabel></DropdownItem>
          <DropdownItem><DropdownLabel>Option 2</DropdownLabel></DropdownItem>
          <DropdownItem><DropdownLabel>Option 3</DropdownLabel></DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <Dropdown>
        <DropdownButton as={Button} outline>Bottom End</DropdownButton>
        <DropdownMenu anchor="bottom end">
          <DropdownItem><DropdownLabel>Option 1</DropdownLabel></DropdownItem>
          <DropdownItem><DropdownLabel>Option 2</DropdownLabel></DropdownItem>
          <DropdownItem><DropdownLabel>Option 3</DropdownLabel></DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <Dropdown>
        <DropdownButton as={Button} outline>Top Start</DropdownButton>
        <DropdownMenu anchor="top start">
          <DropdownItem><DropdownLabel>Option 1</DropdownLabel></DropdownItem>
          <DropdownItem><DropdownLabel>Option 2</DropdownLabel></DropdownItem>
          <DropdownItem><DropdownLabel>Option 3</DropdownLabel></DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <Dropdown>
        <DropdownButton as={Button} outline>Top End</DropdownButton>
        <DropdownMenu anchor="top end">
          <DropdownItem><DropdownLabel>Option 1</DropdownLabel></DropdownItem>
          <DropdownItem><DropdownLabel>Option 2</DropdownLabel></DropdownItem>
          <DropdownItem><DropdownLabel>Option 3</DropdownLabel></DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The `anchor` prop controls placement. Options: "bottom", "bottom start", "bottom end", "top", "top start", "top end".',
      },
    },
  },
}

// =============================================================================
// REAL-WORLD EXAMPLES
// =============================================================================

/**
 * ## Recipe Card Menu
 *
 * The overflow menu on a recipe card. The "what can I do with this?" button.
 * Every recipe card has one, tucked away in the corner.
 */
export const RecipeCardMenu: Story = {
  render: () => (
    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-4 w-72">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-white">Perfect Pasta Carbonara</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Italian • 25 min</p>
        </div>
        <Dropdown>
          <DropdownButton as={Button} plain aria-label="Recipe options">
            <MoreHorizontal />
          </DropdownButton>
          <DropdownMenu anchor="bottom end">
            <DropdownItem>
              <Eye data-slot="icon" />
              <DropdownLabel>View recipe</DropdownLabel>
            </DropdownItem>
            <DropdownItem>
              <Edit data-slot="icon" />
              <DropdownLabel>Edit</DropdownLabel>
            </DropdownItem>
            <DropdownItem>
              <Copy data-slot="icon" />
              <DropdownLabel>Duplicate</DropdownLabel>
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem>
              <Heart data-slot="icon" />
              <DropdownLabel>Add to favorites</DropdownLabel>
            </DropdownItem>
            <DropdownItem>
              <Share2 data-slot="icon" />
              <DropdownLabel>Share</DropdownLabel>
            </DropdownItem>
            <DropdownItem>
              <Download data-slot="icon" />
              <DropdownLabel>Export as PDF</DropdownLabel>
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem>
              <Archive data-slot="icon" />
              <DropdownLabel>Archive</DropdownLabel>
            </DropdownItem>
            <DropdownItem>
              <Trash2 data-slot="icon" />
              <DropdownLabel>Delete</DropdownLabel>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A real-world recipe card with an overflow menu. All the actions, none of the clutter.',
      },
    },
  },
}

/**
 * ## User Account Menu
 *
 * The classic avatar dropdown. Click your face, see your options.
 * Every app has one. It's practically a design pattern at this point.
 */
export const UserAccountMenu: Story = {
  render: () => (
    <Dropdown>
      <DropdownButton as={Button} plain aria-label="Account menu">
        <Avatar
          src="https://i.pravatar.cc/150?img=32"
          className="size-8"
          initials="CA"
        />
      </DropdownButton>
      <DropdownMenu anchor="bottom end">
        <DropdownHeader>
          <div className="px-1">
            <div className="text-sm font-medium text-zinc-900 dark:text-white">Chef Ari</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">ari@spoonjoy.com</div>
          </div>
        </DropdownHeader>
        <DropdownDivider />
        <DropdownSection>
          <DropdownItem href="/profile">
            <User data-slot="icon" />
            <DropdownLabel>Your Profile</DropdownLabel>
          </DropdownItem>
          <DropdownItem href="/recipes">
            <Utensils data-slot="icon" />
            <DropdownLabel>Your Recipes</DropdownLabel>
          </DropdownItem>
          <DropdownItem href="/favorites">
            <Heart data-slot="icon" />
            <DropdownLabel>Favorites</DropdownLabel>
          </DropdownItem>
        </DropdownSection>
        <DropdownDivider />
        <DropdownSection>
          <DropdownItem href="/settings">
            <Settings data-slot="icon" />
            <DropdownLabel>Settings</DropdownLabel>
          </DropdownItem>
        </DropdownSection>
        <DropdownDivider />
        <DropdownItem>
          <LogOut data-slot="icon" />
          <DropdownLabel>Sign out</DropdownLabel>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The account dropdown: avatar trigger, user info header, navigation items, and sign out. The holy grail of user menus.',
      },
    },
  },
}

/**
 * ## Sort/Filter Menu
 *
 * Not all dropdowns are action menus. Some are for changing views.
 * This pattern shows a sort menu with the current selection indicated.
 */
export const SortMenu: Story = {
  render: () => (
    <Dropdown>
      <DropdownButton as={Button} outline>
        <Clock data-slot="icon" />
        Sort: Recent
      </DropdownButton>
      <DropdownMenu>
        <DropdownSection>
          <DropdownHeading>Sort by</DropdownHeading>
          <DropdownItem>
            <Clock data-slot="icon" />
            <DropdownLabel>Most Recent</DropdownLabel>
          </DropdownItem>
          <DropdownItem>
            <Star data-slot="icon" />
            <DropdownLabel>Highest Rated</DropdownLabel>
          </DropdownItem>
          <DropdownItem>
            <Heart data-slot="icon" />
            <DropdownLabel>Most Favorited</DropdownLabel>
          </DropdownItem>
          <DropdownItem>
            <DropdownLabel>Alphabetical (A-Z)</DropdownLabel>
          </DropdownItem>
          <DropdownItem>
            <DropdownLabel>Alphabetical (Z-A)</DropdownLabel>
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A sort menu that shows the current selection in the trigger. The button reflects state.',
      },
    },
  },
}

/**
 * ## Bulk Actions Menu
 *
 * When you've selected multiple items and need to act on them all.
 * The "do something with these" dropdown.
 */
export const BulkActionsMenu: Story = {
  render: () => (
    <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2">
      <span className="text-sm text-zinc-600 dark:text-zinc-400">3 recipes selected</span>
      <Dropdown>
        <DropdownButton as={Button} color="blue">
          Actions
        </DropdownButton>
        <DropdownMenu>
          <DropdownItem>
            <Plus data-slot="icon" />
            <DropdownLabel>Add to cookbook</DropdownLabel>
          </DropdownItem>
          <DropdownItem>
            <Heart data-slot="icon" />
            <DropdownLabel>Add to favorites</DropdownLabel>
          </DropdownItem>
          <DropdownItem>
            <Download data-slot="icon" />
            <DropdownLabel>Export selected</DropdownLabel>
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem>
            <Archive data-slot="icon" />
            <DropdownLabel>Archive selected</DropdownLabel>
          </DropdownItem>
          <DropdownItem>
            <Trash2 data-slot="icon" />
            <DropdownLabel>Delete selected</DropdownLabel>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Bulk actions for selected items. Show the count, provide the actions.',
      },
    },
  },
}

/**
 * ## Kitchen Sink
 *
 * Everything at once. Icons, descriptions, shortcuts, sections,
 * headers, dividers, and disabled states. A comprehensive example
 * of what's possible (and what's probably too much).
 */
export const KitchenSink: Story = {
  render: () => (
    <Dropdown>
      <DropdownButton as={Button}>
        <ChefHat data-slot="icon" />
        Full Menu
      </DropdownButton>
      <DropdownMenu>
        <DropdownHeader>
          <div className="flex items-center gap-3">
            <Avatar src="https://i.pravatar.cc/150?img=5" className="size-10" />
            <div>
              <div className="text-sm font-medium text-zinc-900 dark:text-white">Grandma's Cookbook</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">142 recipes</div>
            </div>
          </div>
        </DropdownHeader>
        <DropdownDivider />
        <DropdownSection>
          <DropdownHeading>Quick Actions</DropdownHeading>
          <DropdownItem>
            <Plus data-slot="icon" />
            <DropdownLabel>New Recipe</DropdownLabel>
            <DropdownShortcut keys="⌘N" />
          </DropdownItem>
          <DropdownItem>
            <Copy data-slot="icon" />
            <DropdownLabel>Import Recipe</DropdownLabel>
            <DropdownDescription>From URL or file</DropdownDescription>
          </DropdownItem>
        </DropdownSection>
        <DropdownDivider />
        <DropdownSection>
          <DropdownHeading>Cookbook</DropdownHeading>
          <DropdownItem>
            <Edit data-slot="icon" />
            <DropdownLabel>Edit Details</DropdownLabel>
          </DropdownItem>
          <DropdownItem>
            <Share2 data-slot="icon" />
            <DropdownLabel>Share</DropdownLabel>
            <DropdownShortcut keys={['⌘', '⇧', 'S']} />
          </DropdownItem>
          <DropdownItem disabled>
            <Download data-slot="icon" />
            <DropdownLabel>Export All</DropdownLabel>
            <DropdownDescription>Premium feature</DropdownDescription>
          </DropdownItem>
        </DropdownSection>
        <DropdownDivider />
        <DropdownItem>
          <Settings data-slot="icon" />
          <DropdownLabel>Preferences</DropdownLabel>
          <DropdownShortcut keys="⌘," />
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem>
          <Trash2 data-slot="icon" />
          <DropdownLabel>Delete Cookbook</DropdownLabel>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The complete feature showcase. In practice, you\'d probably use a subset of these features.',
      },
    },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Tests basic dropdown open/close behavior.
 */
export const OpenCloseInteraction: Story = {
  render: (args) => (
    <Dropdown>
      <DropdownButton as={Button} data-testid="trigger">Options</DropdownButton>
      <DropdownMenu>
        <DropdownItem onClick={args.onItemClick} data-testid="item-1">
          <DropdownLabel>First Option</DropdownLabel>
        </DropdownItem>
        <DropdownItem onClick={args.onItemClick} data-testid="item-2">
          <DropdownLabel>Second Option</DropdownLabel>
        </DropdownItem>
        <DropdownItem onClick={args.onItemClick} data-testid="item-3">
          <DropdownLabel>Third Option</DropdownLabel>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ),
  args: {
    onItemClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    // Find and click the trigger
    const trigger = canvas.getByTestId('trigger')
    await expect(trigger).toBeInTheDocument()
    await userEvent.click(trigger)

    // Wait for menu to appear
    await waitFor(() => {
      expect(canvas.getByRole('menu')).toBeInTheDocument()
    })

    // Find and click an item
    const item = canvas.getByTestId('item-2')
    await userEvent.click(item)

    // Verify onClick was called
    await expect(args.onItemClick).toHaveBeenCalled()

    // Menu should close after selection
    await waitFor(() => {
      expect(canvas.queryByRole('menu')).not.toBeInTheDocument()
    })
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests that clicking the trigger opens the menu and clicking an item closes it.',
      },
    },
  },
}

/**
 * Tests keyboard navigation: Arrow keys to navigate, Enter to select.
 */
export const KeyboardNavigationTest: Story = {
  render: (args) => (
    <Dropdown>
      <DropdownButton as={Button} data-testid="trigger">Navigate Me</DropdownButton>
      <DropdownMenu>
        <DropdownItem onClick={() => args.onSelect?.('first')} data-testid="item-1">
          <DropdownLabel>First</DropdownLabel>
        </DropdownItem>
        <DropdownItem onClick={() => args.onSelect?.('second')} data-testid="item-2">
          <DropdownLabel>Second</DropdownLabel>
        </DropdownItem>
        <DropdownItem onClick={() => args.onSelect?.('third')} data-testid="item-3">
          <DropdownLabel>Third</DropdownLabel>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ),
  args: {
    onSelect: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    const trigger = canvas.getByTestId('trigger')

    // Focus the trigger
    trigger.focus()
    await expect(trigger).toHaveFocus()

    // Press Enter to open
    await userEvent.keyboard('{Enter}')

    // Wait for menu
    await waitFor(() => {
      expect(canvas.getByRole('menu')).toBeInTheDocument()
    })

    // Arrow down twice to reach "Third"
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{ArrowDown}')

    // Press Enter to select
    await userEvent.keyboard('{Enter}')

    // Verify selection
    await expect(args.onSelect).toHaveBeenCalledWith('third')

    // Menu should close
    await waitFor(() => {
      expect(canvas.queryByRole('menu')).not.toBeInTheDocument()
    })
  },
  parameters: {
    docs: {
      description: {
        story: 'Keyboard navigation: Enter to open, Arrow keys to move, Enter to select.',
      },
    },
  },
}

/**
 * Tests that Escape key closes the menu without selecting.
 */
export const EscapeToClose: Story = {
  render: (args) => (
    <Dropdown>
      <DropdownButton as={Button} data-testid="trigger">Escape Me</DropdownButton>
      <DropdownMenu>
        <DropdownItem onClick={args.onSelect}>
          <DropdownLabel>Option 1</DropdownLabel>
        </DropdownItem>
        <DropdownItem onClick={args.onSelect}>
          <DropdownLabel>Option 2</DropdownLabel>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ),
  args: {
    onSelect: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    // Open the menu
    const trigger = canvas.getByTestId('trigger')
    await userEvent.click(trigger)

    await waitFor(() => {
      expect(canvas.getByRole('menu')).toBeInTheDocument()
    })

    // Press Escape
    await userEvent.keyboard('{Escape}')

    // Menu should close
    await waitFor(() => {
      expect(canvas.queryByRole('menu')).not.toBeInTheDocument()
    })

    // No selection should have been made
    await expect(args.onSelect).not.toHaveBeenCalled()
  },
  parameters: {
    docs: {
      description: {
        story: 'Escape closes the dropdown without triggering any action. The ultimate "never mind."',
      },
    },
  },
}

/**
 * Tests that disabled items cannot be selected.
 */
export const DisabledItemInteraction: Story = {
  render: (args) => (
    <Dropdown>
      <DropdownButton as={Button} data-testid="trigger">Has Disabled</DropdownButton>
      <DropdownMenu>
        <DropdownItem onClick={() => args.onSelect?.('enabled')} data-testid="enabled">
          <DropdownLabel>Enabled Option</DropdownLabel>
        </DropdownItem>
        <DropdownItem disabled onClick={() => args.onSelect?.('disabled')} data-testid="disabled">
          <DropdownLabel>Disabled Option</DropdownLabel>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ),
  args: {
    onSelect: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    // Open menu
    await userEvent.click(canvas.getByTestId('trigger'))

    await waitFor(() => {
      expect(canvas.getByRole('menu')).toBeInTheDocument()
    })

    // Try to click disabled item
    const disabledItem = canvas.getByTestId('disabled')
    await expect(disabledItem).toHaveAttribute('data-disabled', '')
    await userEvent.click(disabledItem)

    // onSelect should NOT have been called with 'disabled'
    await expect(args.onSelect).not.toHaveBeenCalledWith('disabled')

    // Menu should still be open (disabled items don't close menu on click)
    await expect(canvas.getByRole('menu')).toBeInTheDocument()

    // Now click enabled item
    await userEvent.click(canvas.getByTestId('enabled'))

    // This should work
    await expect(args.onSelect).toHaveBeenCalledWith('enabled')
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled items cannot be clicked. They\'re there to taunt you with what could be.',
      },
    },
  },
}

/**
 * Tests that clicking outside closes the menu.
 */
export const ClickOutsideToClose: Story = {
  render: (args) => (
    <div className="p-8" data-testid="outside">
      <Dropdown>
        <DropdownButton as={Button} data-testid="trigger">Click Outside</DropdownButton>
        <DropdownMenu>
          <DropdownItem onClick={args.onSelect}>
            <DropdownLabel>Option</DropdownLabel>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  ),
  args: {
    onSelect: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    // Open menu
    await userEvent.click(canvas.getByTestId('trigger'))

    await waitFor(() => {
      expect(canvas.getByRole('menu')).toBeInTheDocument()
    })

    // Click outside
    await userEvent.click(canvas.getByTestId('outside'))

    // Menu should close
    await waitFor(() => {
      expect(canvas.queryByRole('menu')).not.toBeInTheDocument()
    })

    // No selection
    await expect(args.onSelect).not.toHaveBeenCalled()
  },
  parameters: {
    docs: {
      description: {
        story: 'Clicking outside the dropdown closes it. A fundamental expectation.',
      },
    },
  },
}

/**
 * Tests focus restoration after closing.
 */
export const FocusRestoration: Story = {
  render: () => (
    <Dropdown>
      <DropdownButton as={Button} data-testid="trigger">Focus Test</DropdownButton>
      <DropdownMenu>
        <DropdownItem data-testid="item">
          <DropdownLabel>An Option</DropdownLabel>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const trigger = canvas.getByTestId('trigger')

    // Open with click
    await userEvent.click(trigger)

    await waitFor(() => {
      expect(canvas.getByRole('menu')).toBeInTheDocument()
    })

    // Close with Escape
    await userEvent.keyboard('{Escape}')

    await waitFor(() => {
      expect(canvas.queryByRole('menu')).not.toBeInTheDocument()
    })

    // Focus should return to trigger
    await expect(trigger).toHaveFocus()
  },
  parameters: {
    docs: {
      description: {
        story: 'When the dropdown closes, focus returns to the trigger button. Essential for keyboard users.',
      },
    },
  },
}

/**
 * Tests type-ahead search in the menu.
 */
export const TypeAheadSearch: Story = {
  render: () => (
    <Dropdown>
      <DropdownButton as={Button} data-testid="trigger">Type to Search</DropdownButton>
      <DropdownMenu>
        <DropdownItem data-testid="apple">
          <DropdownLabel>Apple</DropdownLabel>
        </DropdownItem>
        <DropdownItem data-testid="banana">
          <DropdownLabel>Banana</DropdownLabel>
        </DropdownItem>
        <DropdownItem data-testid="cherry">
          <DropdownLabel>Cherry</DropdownLabel>
        </DropdownItem>
        <DropdownItem data-testid="blueberry">
          <DropdownLabel>Blueberry</DropdownLabel>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Open menu
    await userEvent.click(canvas.getByTestId('trigger'))

    await waitFor(() => {
      expect(canvas.getByRole('menu')).toBeInTheDocument()
    })

    // Type "b" to jump to Banana
    await userEvent.keyboard('b')

    // Banana should be focused (has data-focus attribute from HeadlessUI)
    const banana = canvas.getByTestId('banana')
    await expect(banana).toHaveAttribute('data-focus', '')

    // Type "l" to jump to Blueberry (typing "bl")
    await userEvent.keyboard('l')

    const blueberry = canvas.getByTestId('blueberry')
    await expect(blueberry).toHaveAttribute('data-focus', '')
  },
  parameters: {
    docs: {
      description: {
        story: 'Type characters to jump to matching items. HeadlessUI\'s type-ahead search in action.',
      },
    },
  },
}

/**
 * Tests navigation between multiple dropdowns on the page.
 */
export const MultipleTriggers: Story = {
  render: () => (
    <div className="flex gap-4">
      <Dropdown>
        <DropdownButton as={Button} data-testid="trigger-1">Menu 1</DropdownButton>
        <DropdownMenu>
          <DropdownItem data-testid="menu-1-item">
            <DropdownLabel>Menu 1 Option</DropdownLabel>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <Dropdown>
        <DropdownButton as={Button} data-testid="trigger-2">Menu 2</DropdownButton>
        <DropdownMenu>
          <DropdownItem data-testid="menu-2-item">
            <DropdownLabel>Menu 2 Option</DropdownLabel>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Open first menu
    await userEvent.click(canvas.getByTestId('trigger-1'))

    await waitFor(() => {
      expect(canvas.getByTestId('menu-1-item')).toBeInTheDocument()
    })

    // Click second trigger (should close first and open second)
    await userEvent.click(canvas.getByTestId('trigger-2'))

    await waitFor(() => {
      expect(canvas.queryByTestId('menu-1-item')).not.toBeInTheDocument()
      expect(canvas.getByTestId('menu-2-item')).toBeInTheDocument()
    })
  },
  parameters: {
    docs: {
      description: {
        story: 'Only one dropdown can be open at a time. Opening another closes the first.',
      },
    },
  },
}
