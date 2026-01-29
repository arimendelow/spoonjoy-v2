import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { useState } from 'react'
import { ChevronDown, ChevronUp, ExternalLink, Star, Trash2 } from 'lucide-react'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../app/components/ui/table'
import { Badge } from '../app/components/ui/badge'

/**
 * # Table
 *
 * The table component. The spreadsheet's cool younger sibling who actually
 * knows how to dress for a party. Tables display data in rows and columns,
 * which sounds boring until you realize that's basically how humanity has
 * organized information since the invention of papyrus.
 *
 * Tables are the backbone of every admin panel, dashboard, and "we need to
 * show users a list of things" conversation. They're unglamorous workhorses
 * that nobody appreciates until they're gone.
 *
 * ## The Table Philosophy
 *
 * A good table should be:
 * - **Scannable** - Users should find what they need without reading everything
 * - **Consistent** - Same column, same type of data, every time
 * - **Responsive** - Graceful horizontal scrolling beats broken layouts
 *
 * ## Component Anatomy
 *
 * - **Table** - The container. Controls layout options like bleed, dense, grid, and striped
 * - **TableHead** - The header section. Usually contains TableHeader cells
 * - **TableBody** - The data section. Where TableRows live their best lives
 * - **TableRow** - A row of data. Can be clickable with an href prop
 * - **TableHeader** - Column headers. They're like the labels on jars - technically optional but chaos without them
 * - **TableCell** - Individual data cells. The humble bricks of your data wall
 *
 * ## Variants
 *
 * - **bleed** - Extends to the edge. For that full-width dramatic effect
 * - **dense** - Tighter spacing. When you've got data and you're not afraid to show it
 * - **grid** - Adds vertical dividers. For the grid-obsessed among us
 * - **striped** - Alternating row colors. Zebra mode activated
 *
 * ## Pro Tips
 *
 * - Don't show 47 columns. Just because you can doesn't mean you should
 * - Right-align numbers. Left-align text. Trust us on this one
 * - Make rows clickable with href for natural navigation patterns
 */
const meta: Meta<typeof Table> = {
  title: 'UI/Table',
  component: Table,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A responsive table component for displaying structured data.

Supports variants like dense, grid, striped, and bleed. Rows can be made clickable
for navigation. Handles horizontal overflow gracefully with scroll.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    bleed: {
      control: 'boolean',
      description: 'Remove horizontal padding for edge-to-edge appearance.',
    },
    dense: {
      control: 'boolean',
      description: 'Reduce vertical padding for compact data display.',
    },
    grid: {
      control: 'boolean',
      description: 'Add vertical dividers between columns.',
    },
    striped: {
      control: 'boolean',
      description: 'Alternate row background colors for easier scanning.',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// SAMPLE DATA
// =============================================================================

const recipes = [
  { id: 1, name: 'Thai Coconut Curry', chef: 'Gordon Ramsay', time: '45 min', rating: 4.8, difficulty: 'Medium' },
  { id: 2, name: 'Classic Carbonara', chef: 'Jamie Oliver', time: '30 min', rating: 4.9, difficulty: 'Easy' },
  { id: 3, name: 'Beef Wellington', chef: 'Gordon Ramsay', time: '3 hrs', rating: 4.7, difficulty: 'Hard' },
  { id: 4, name: 'Fish and Chips', chef: 'Heston Blumenthal', time: '1 hr', rating: 4.5, difficulty: 'Medium' },
  { id: 5, name: 'Pad Thai', chef: 'Pok Pok', time: '25 min', rating: 4.6, difficulty: 'Medium' },
]

const ingredients = [
  { id: 1, name: 'All-Purpose Flour', category: 'Pantry', quantity: '2 kg', inStock: true },
  { id: 2, name: 'Eggs (Dozen)', category: 'Dairy', quantity: '24', inStock: true },
  { id: 3, name: 'Butter (Unsalted)', category: 'Dairy', quantity: '500g', inStock: false },
  { id: 4, name: 'Olive Oil', category: 'Pantry', quantity: '1L', inStock: true },
  { id: 5, name: 'Garlic', category: 'Produce', quantity: '3 heads', inStock: true },
]

const orders = [
  { id: 'ORD-001', customer: 'Alice Chen', items: 3, total: '$45.99', status: 'Delivered' },
  { id: 'ORD-002', customer: 'Bob Smith', items: 1, total: '$12.50', status: 'Processing' },
  { id: 'ORD-003', customer: 'Carol White', items: 5, total: '$89.00', status: 'Shipped' },
  { id: 'ORD-004', customer: 'David Brown', items: 2, total: '$34.75', status: 'Cancelled' },
  { id: 'ORD-005', customer: 'Eve Johnson', items: 4, total: '$67.25', status: 'Delivered' },
]

// =============================================================================
// BASIC STORIES
// =============================================================================

/**
 * The default table. Clean, simple, functional. Like a spreadsheet that
 * went to design school and learned about whitespace.
 */
export const Default: Story = {
  render: (args) => (
    <Table {...args}>
      <TableHead>
        <TableRow>
          <TableHeader>Recipe</TableHeader>
          <TableHeader>Chef</TableHeader>
          <TableHeader>Time</TableHeader>
          <TableHeader>Rating</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {recipes.map((recipe) => (
          <TableRow key={recipe.id}>
            <TableCell className="font-medium">{recipe.name}</TableCell>
            <TableCell>{recipe.chef}</TableCell>
            <TableCell>{recipe.time}</TableCell>
            <TableCell>{recipe.rating}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

/**
 * ## With Data
 *
 * A proper table with multiple columns and rows. This is what tables
 * were born to do. Organize data. Make it scannable. Look professional
 * in meetings when you say "as you can see in the table..."
 */
export const WithData: Story = {
  render: () => (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Recipe</TableHeader>
          <TableHeader>Chef</TableHeader>
          <TableHeader>Prep Time</TableHeader>
          <TableHeader>Difficulty</TableHeader>
          <TableHeader className="text-right">Rating</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {recipes.map((recipe) => (
          <TableRow key={recipe.id}>
            <TableCell className="font-medium">{recipe.name}</TableCell>
            <TableCell className="text-zinc-500 dark:text-zinc-400">{recipe.chef}</TableCell>
            <TableCell>{recipe.time}</TableCell>
            <TableCell>
              <Badge
                color={
                  recipe.difficulty === 'Easy' ? 'green' : recipe.difficulty === 'Medium' ? 'amber' : 'red'
                }
              >
                {recipe.difficulty}
              </Badge>
            </TableCell>
            <TableCell className="text-right tabular-nums">{recipe.rating}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A table with proper column formatting. Note: numbers right-aligned, text left-aligned. This is the way.',
      },
    },
  },
}

// =============================================================================
// VARIANTS
// =============================================================================

/**
 * ## Striped Rows
 *
 * Alternating row colors for easier horizontal scanning. Like a zebra,
 * but more useful for reading data and less useful for confusing lions.
 *
 * Striped tables are particularly helpful when rows are wide and users
 * need to track across many columns. The contrast helps the eye follow.
 */
export const Striped: Story = {
  render: () => (
    <Table striped>
      <TableHead>
        <TableRow>
          <TableHeader>Recipe</TableHeader>
          <TableHeader>Chef</TableHeader>
          <TableHeader>Time</TableHeader>
          <TableHeader>Rating</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {recipes.map((recipe) => (
          <TableRow key={recipe.id}>
            <TableCell className="font-medium">{recipe.name}</TableCell>
            <TableCell>{recipe.chef}</TableCell>
            <TableCell>{recipe.time}</TableCell>
            <TableCell>{recipe.rating}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Striped rows make it easier to track across wide tables. Zebra approved.',
      },
    },
  },
}

/**
 * ## Dense Table
 *
 * For when you've got a lot of data and not a lot of space. The dense
 * variant reduces padding so you can fit more rows on screen.
 *
 * Great for admin dashboards, inventory lists, and anywhere users need
 * to see many items at once without scrolling through miles of whitespace.
 */
export const Dense: Story = {
  render: () => (
    <Table dense>
      <TableHead>
        <TableRow>
          <TableHeader>Ingredient</TableHeader>
          <TableHeader>Category</TableHeader>
          <TableHeader>Quantity</TableHeader>
          <TableHeader>In Stock</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {ingredients.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>{item.category}</TableCell>
            <TableCell>{item.quantity}</TableCell>
            <TableCell>{item.inStock ? 'Yes' : 'No'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Dense mode for data-heavy displays. Less padding, more content.',
      },
    },
  },
}

/**
 * ## Grid Lines
 *
 * Vertical dividers between columns. For when horizontal lines aren't
 * enough structure and you need the full prison-cell aesthetic.
 *
 * Actually useful for tables with lots of numeric columns or when
 * clear column boundaries help with data entry tasks.
 */
export const Grid: Story = {
  render: () => (
    <Table grid>
      <TableHead>
        <TableRow>
          <TableHeader>Order ID</TableHeader>
          <TableHeader>Customer</TableHeader>
          <TableHeader>Items</TableHeader>
          <TableHeader>Total</TableHeader>
          <TableHeader>Status</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-mono text-sm">{order.id}</TableCell>
            <TableCell>{order.customer}</TableCell>
            <TableCell className="text-center">{order.items}</TableCell>
            <TableCell className="text-right tabular-nums">{order.total}</TableCell>
            <TableCell>
              <Badge
                color={
                  order.status === 'Delivered'
                    ? 'green'
                    : order.status === 'Shipped'
                      ? 'blue'
                      : order.status === 'Processing'
                        ? 'amber'
                        : 'red'
                }
              >
                {order.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Grid mode adds vertical column dividers. Very spreadsheet-y.',
      },
    },
  },
}

/**
 * ## Bleed Layout
 *
 * The bleed variant removes horizontal padding, letting the table
 * extend edge-to-edge. Dramatic. Cinematic. Very full-width.
 *
 * Use this when the table is the main content of a page and you
 * want that full-screen data visualization feel.
 */
export const Bleed: Story = {
  render: () => (
    <Table bleed>
      <TableHead>
        <TableRow>
          <TableHeader>Recipe</TableHeader>
          <TableHeader>Chef</TableHeader>
          <TableHeader>Time</TableHeader>
          <TableHeader>Rating</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {recipes.map((recipe) => (
          <TableRow key={recipe.id}>
            <TableCell className="font-medium">{recipe.name}</TableCell>
            <TableCell>{recipe.chef}</TableCell>
            <TableCell>{recipe.time}</TableCell>
            <TableCell>{recipe.rating}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Bleed mode removes horizontal padding for edge-to-edge tables.',
      },
    },
  },
}

/**
 * ## Combined Variants
 *
 * You can combine variants. Striped AND dense AND grid? Sure, why not.
 * Live your best data visualization life. We don't judge.
 *
 * (Okay, we judge a little. This looks like a 1998 Excel spreadsheet.)
 */
export const CombinedVariants: Story = {
  render: () => (
    <Table striped dense grid>
      <TableHead>
        <TableRow>
          <TableHeader>Order ID</TableHeader>
          <TableHeader>Customer</TableHeader>
          <TableHeader>Items</TableHeader>
          <TableHeader>Total</TableHeader>
          <TableHeader>Status</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-mono text-sm">{order.id}</TableCell>
            <TableCell>{order.customer}</TableCell>
            <TableCell className="text-center">{order.items}</TableCell>
            <TableCell className="text-right tabular-nums">{order.total}</TableCell>
            <TableCell>{order.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All the variants at once. Maximum data density. Spreadsheet nostalgia intensifies.',
      },
    },
  },
}

// =============================================================================
// CLICKABLE ROWS
// =============================================================================

/**
 * ## Clickable Rows
 *
 * Pass an `href` to TableRow to make the entire row clickable.
 * Hover effects appear automatically. Click and navigate. Simple.
 *
 * This is the pattern for list views where each row represents
 * an item that has its own detail page. No more "which column do I click?"
 */
export const ClickableRows: Story = {
  render: () => (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Recipe</TableHeader>
          <TableHeader>Chef</TableHeader>
          <TableHeader>Time</TableHeader>
          <TableHeader>Rating</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {recipes.map((recipe) => (
          <TableRow key={recipe.id} href={`#recipe-${recipe.id}`} title={`View ${recipe.name}`}>
            <TableCell className="font-medium">{recipe.name}</TableCell>
            <TableCell className="text-zinc-500 dark:text-zinc-400">{recipe.chef}</TableCell>
            <TableCell>{recipe.time}</TableCell>
            <TableCell>{recipe.rating}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Clickable rows navigate on click. Hover to see the effect.',
      },
    },
  },
}

/**
 * ## Clickable Rows with Striped
 *
 * Clickable rows work with striped tables too. The hover state
 * stands out from both the odd and even row backgrounds.
 */
export const ClickableStriped: Story = {
  render: () => (
    <Table striped>
      <TableHead>
        <TableRow>
          <TableHeader>Recipe</TableHeader>
          <TableHeader>Chef</TableHeader>
          <TableHeader>Time</TableHeader>
          <TableHeader>Rating</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {recipes.map((recipe) => (
          <TableRow key={recipe.id} href={`#recipe-${recipe.id}`} title={`View ${recipe.name}`}>
            <TableCell className="font-medium">{recipe.name}</TableCell>
            <TableCell>{recipe.chef}</TableCell>
            <TableCell>{recipe.time}</TableCell>
            <TableCell>{recipe.rating}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Clickable + striped. The hover state works with both row colors.',
      },
    },
  },
}

/**
 * ## External Links
 *
 * Rows can link to external URLs. Add `target="_blank"` for new tabs.
 * The ExternalLink icon is optional but helps users understand the behavior.
 */
export const ExternalLinks: Story = {
  render: () => (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Recipe</TableHeader>
          <TableHeader>Source</TableHeader>
          <TableHeader></TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow href="https://example.com/curry" target="_blank" title="Open Thai Coconut Curry recipe">
          <TableCell className="font-medium">Thai Coconut Curry</TableCell>
          <TableCell className="text-zinc-500 dark:text-zinc-400">Example Kitchen</TableCell>
          <TableCell className="w-8">
            <ExternalLink className="w-4 h-4 text-zinc-400" />
          </TableCell>
        </TableRow>
        <TableRow href="https://example.com/carbonara" target="_blank" title="Open Classic Carbonara recipe">
          <TableCell className="font-medium">Classic Carbonara</TableCell>
          <TableCell className="text-zinc-500 dark:text-zinc-400">Italian Masters</TableCell>
          <TableCell className="w-8">
            <ExternalLink className="w-4 h-4 text-zinc-400" />
          </TableCell>
        </TableRow>
        <TableRow href="https://example.com/wellington" target="_blank" title="Open Beef Wellington recipe">
          <TableCell className="font-medium">Beef Wellington</TableCell>
          <TableCell className="text-zinc-500 dark:text-zinc-400">Hell's Kitchen</TableCell>
          <TableCell className="w-8">
            <ExternalLink className="w-4 h-4 text-zinc-400" />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Rows linking to external URLs. The icon signals "opens in new tab."',
      },
    },
  },
}

// =============================================================================
// SORTABLE COLUMNS (Visual Only - No Built-in Sort)
// =============================================================================

/**
 * ## Sortable Columns (Visual)
 *
 * The Table component doesn't include built-in sorting (that's your job),
 * but here's how you'd implement sortable column headers. Click the headers
 * to toggle sort direction.
 *
 * Pro tip: Always show the current sort state. Users shouldn't have to
 * guess which column is sorted or in which direction.
 */
export const SortableColumns: Story = {
  render: function SortableDemo() {
    const [sortKey, setSortKey] = useState<'name' | 'time' | 'rating'>('name')
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

    const sortedRecipes = [...recipes].sort((a, b) => {
      let comparison = 0
      if (sortKey === 'name') {
        comparison = a.name.localeCompare(b.name)
      } else if (sortKey === 'time') {
        // Parse time for sorting (simplified)
        const parseTime = (t: string) => {
          if (t.includes('hr')) return parseInt(t) * 60
          return parseInt(t)
        }
        comparison = parseTime(a.time) - parseTime(b.time)
      } else if (sortKey === 'rating') {
        comparison = a.rating - b.rating
      }
      return sortDir === 'asc' ? comparison : -comparison
    })

    const handleSort = (key: 'name' | 'time' | 'rating') => {
      if (sortKey === key) {
        setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
      } else {
        setSortKey(key)
        setSortDir('asc')
      }
    }

    const SortIcon = ({ columnKey }: { columnKey: 'name' | 'time' | 'rating' }) => {
      if (sortKey !== columnKey) return null
      return sortDir === 'asc' ? (
        <ChevronUp className="w-4 h-4 inline ml-1" />
      ) : (
        <ChevronDown className="w-4 h-4 inline ml-1" />
      )
    }

    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>
              <button
                onClick={() => handleSort('name')}
                className="hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                data-testid="sort-name"
              >
                Recipe
                <SortIcon columnKey="name" />
              </button>
            </TableHeader>
            <TableHeader>Chef</TableHeader>
            <TableHeader>
              <button
                onClick={() => handleSort('time')}
                className="hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                data-testid="sort-time"
              >
                Time
                <SortIcon columnKey="time" />
              </button>
            </TableHeader>
            <TableHeader className="text-right">
              <button
                onClick={() => handleSort('rating')}
                className="hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                data-testid="sort-rating"
              >
                Rating
                <SortIcon columnKey="rating" />
              </button>
            </TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedRecipes.map((recipe) => (
            <TableRow key={recipe.id}>
              <TableCell className="font-medium" data-testid={`recipe-${recipe.id}`}>
                {recipe.name}
              </TableCell>
              <TableCell className="text-zinc-500 dark:text-zinc-400">{recipe.chef}</TableCell>
              <TableCell>{recipe.time}</TableCell>
              <TableCell className="text-right tabular-nums">{recipe.rating}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "Sorting isn't built in, but it's easy to implement. Click column headers to sort. Click again to reverse.",
      },
    },
  },
}

// =============================================================================
// EMPTY STATE
// =============================================================================

/**
 * ## Empty State
 *
 * No data? No problem. Show a helpful empty state instead of a sad,
 * empty table. Tell users what they can do to populate the table.
 *
 * An empty table with just headers looks broken. This looks intentional.
 */
export const EmptyState: Story = {
  render: () => (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Recipe</TableHeader>
          <TableHeader>Chef</TableHeader>
          <TableHeader>Time</TableHeader>
          <TableHeader>Rating</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell colSpan={4} className="text-center py-12">
            <div className="text-zinc-500 dark:text-zinc-400">
              <p className="text-lg font-medium">No recipes yet</p>
              <p className="text-sm mt-1">Start by adding your first recipe to see it here.</p>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Empty state for when there\'s no data. Better than an awkward blank space.',
      },
    },
  },
}

/**
 * ## Empty Search Results
 *
 * A different kind of empty: search came up with nothing.
 * Be helpful. Suggest what users might try next.
 */
export const EmptySearchResults: Story = {
  render: () => (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Recipe</TableHeader>
          <TableHeader>Chef</TableHeader>
          <TableHeader>Time</TableHeader>
          <TableHeader>Rating</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell colSpan={4} className="text-center py-12">
            <div className="text-zinc-500 dark:text-zinc-400">
              <p className="text-lg font-medium">No results found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters.</p>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-2">
                Searched for: "chocolate soufflé that's impossible to mess up"
              </p>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Empty state for search with no matches. Show what was searched for context.',
      },
    },
  },
}

// =============================================================================
// REAL-WORLD EXAMPLES
// =============================================================================

/**
 * ## Inventory Management
 *
 * A practical example: ingredient inventory with status indicators.
 * Out-of-stock items get highlighted. Quantities are right-aligned.
 * Action buttons at the end.
 */
export const InventoryExample: Story = {
  render: () => (
    <Table dense striped>
      <TableHead>
        <TableRow>
          <TableHeader>Ingredient</TableHeader>
          <TableHeader>Category</TableHeader>
          <TableHeader className="text-right">Quantity</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader className="text-right">Actions</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {ingredients.map((item) => (
          <TableRow key={item.id} className={!item.inStock ? 'bg-red-50 dark:bg-red-900/10' : ''}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell className="text-zinc-500 dark:text-zinc-400">{item.category}</TableCell>
            <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
            <TableCell>
              <Badge color={item.inStock ? 'green' : 'red'}>{item.inStock ? 'In Stock' : 'Out of Stock'}</Badge>
            </TableCell>
            <TableCell className="text-right">
              <button className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
                <Trash2 className="w-4 h-4" />
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Inventory table with status badges and action buttons. Out-of-stock rows get a highlight.',
      },
    },
  },
}

/**
 * ## Order History
 *
 * Orders with status badges, clickable rows for details, and proper
 * number formatting. The status colors follow semantic conventions:
 * green for success, amber for pending, red for cancelled.
 */
export const OrderHistory: Story = {
  render: () => (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Order ID</TableHeader>
          <TableHeader>Customer</TableHeader>
          <TableHeader className="text-center">Items</TableHeader>
          <TableHeader className="text-right">Total</TableHeader>
          <TableHeader>Status</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id} href={`#order-${order.id}`} title={`View order ${order.id}`}>
            <TableCell className="font-mono text-sm">{order.id}</TableCell>
            <TableCell className="font-medium">{order.customer}</TableCell>
            <TableCell className="text-center tabular-nums">{order.items}</TableCell>
            <TableCell className="text-right tabular-nums">{order.total}</TableCell>
            <TableCell>
              <Badge
                color={
                  order.status === 'Delivered'
                    ? 'green'
                    : order.status === 'Shipped'
                      ? 'blue'
                      : order.status === 'Processing'
                        ? 'amber'
                        : 'red'
                }
              >
                {order.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Order history with clickable rows and semantic status colors.',
      },
    },
  },
}

/**
 * ## Recipe Ratings
 *
 * A table featuring star ratings. Because sometimes numbers alone
 * don't capture the magic of 4.8 stars.
 */
export const RecipeRatings: Story = {
  render: () => (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Recipe</TableHeader>
          <TableHeader>Chef</TableHeader>
          <TableHeader className="text-right">Rating</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {recipes.map((recipe) => (
          <TableRow key={recipe.id}>
            <TableCell className="font-medium">{recipe.name}</TableCell>
            <TableCell className="text-zinc-500 dark:text-zinc-400">{recipe.chef}</TableCell>
            <TableCell className="text-right">
              <span className="inline-flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="tabular-nums">{recipe.rating}</span>
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Ratings with star icons. Visual flair for your data.',
      },
    },
  },
}

// =============================================================================
// ACCESSIBILITY
// =============================================================================

/**
 * ## Accessible Table
 *
 * Tables are inherently accessible when you use proper semantic elements
 * (which this component does). Headers associate with cells automatically.
 * Screen readers can navigate by row and column.
 *
 * The clickable rows use proper link semantics with aria-labels.
 */
export const AccessibleTable: Story = {
  render: () => (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Recipe</TableHeader>
          <TableHeader>Chef</TableHeader>
          <TableHeader>Time</TableHeader>
          <TableHeader>Rating</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {recipes.slice(0, 3).map((recipe) => (
          <TableRow key={recipe.id} href={`#recipe-${recipe.id}`} title={`View details for ${recipe.name}`}>
            <TableCell className="font-medium">{recipe.name}</TableCell>
            <TableCell>{recipe.chef}</TableCell>
            <TableCell>{recipe.time}</TableCell>
            <TableCell>{recipe.rating}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Proper semantic HTML means built-in accessibility. Screen readers navigate tables like pros.',
      },
    },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Tests that clickable rows have proper link behavior.
 */
export const ClickableRowInteraction: Story = {
  render: () => (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Recipe</TableHeader>
          <TableHeader>Rating</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow href="#recipe-1" title="View Thai Coconut Curry" data-testid="row-1">
          <TableCell className="font-medium">Thai Coconut Curry</TableCell>
          <TableCell>4.8</TableCell>
        </TableRow>
        <TableRow href="#recipe-2" title="View Classic Carbonara" data-testid="row-2">
          <TableCell className="font-medium">Classic Carbonara</TableCell>
          <TableCell>4.9</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Find the table and rows
    const table = canvas.getByRole('table')
    await expect(table).toBeInTheDocument()

    // Verify rows exist
    const row1 = canvas.getByTestId('row-1')
    await expect(row1).toBeInTheDocument()

    // Find the link within the first row (it's an invisible overlay)
    const link1 = canvas.getByLabelText('View Thai Coconut Curry')
    await expect(link1).toHaveAttribute('href', '#recipe-1')

    // Find the second row's link
    const link2 = canvas.getByLabelText('View Classic Carbonara')
    await expect(link2).toHaveAttribute('href', '#recipe-2')
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests that clickable rows have proper link elements with correct hrefs.',
      },
    },
  },
}

/**
 * Tests sorting interaction on column headers.
 */
export const SortInteraction: Story = {
  render: function SortableDemo() {
    const [sortKey, setSortKey] = useState<'name' | 'rating'>('name')
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

    const sortedRecipes = [...recipes].sort((a, b) => {
      let comparison = 0
      if (sortKey === 'name') {
        comparison = a.name.localeCompare(b.name)
      } else if (sortKey === 'rating') {
        comparison = a.rating - b.rating
      }
      return sortDir === 'asc' ? comparison : -comparison
    })

    const handleSort = (key: 'name' | 'rating') => {
      if (sortKey === key) {
        setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
      } else {
        setSortKey(key)
        setSortDir('asc')
      }
    }

    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>
              <button onClick={() => handleSort('name')} data-testid="sort-name">
                Recipe {sortKey === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </button>
            </TableHeader>
            <TableHeader className="text-right">
              <button onClick={() => handleSort('rating')} data-testid="sort-rating">
                Rating {sortKey === 'rating' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </button>
            </TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedRecipes.map((recipe, index) => (
            <TableRow key={recipe.id}>
              <TableCell className="font-medium" data-testid={`row-${index}-name`}>
                {recipe.name}
              </TableCell>
              <TableCell className="text-right" data-testid={`row-${index}-rating`}>
                {recipe.rating}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Initial state: sorted by name ascending
    const firstCell = canvas.getByTestId('row-0-name')
    await expect(firstCell).toHaveTextContent('Beef Wellington') // B comes first alphabetically

    // Click rating to sort by rating ascending
    const ratingButton = canvas.getByTestId('sort-rating')
    await userEvent.click(ratingButton)

    // After sorting by rating asc, Fish and Chips (4.5) should be first
    const firstCellAfterSort = canvas.getByTestId('row-0-name')
    await expect(firstCellAfterSort).toHaveTextContent('Fish and Chips')

    // Click rating again to sort descending
    await userEvent.click(ratingButton)

    // After sorting by rating desc, Classic Carbonara (4.9) should be first
    const firstCellDesc = canvas.getByTestId('row-0-name')
    await expect(firstCellDesc).toHaveTextContent('Classic Carbonara')
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests column sorting interactions. Click headers to sort, click again to reverse.',
      },
    },
  },
}

/**
 * Tests keyboard navigation through table.
 */
export const KeyboardNavigation: Story = {
  render: () => (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Recipe</TableHeader>
          <TableHeader>Rating</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow href="#recipe-1" title="View Recipe 1" data-testid="row-1">
          <TableCell className="font-medium">Thai Coconut Curry</TableCell>
          <TableCell>4.8</TableCell>
        </TableRow>
        <TableRow href="#recipe-2" title="View Recipe 2" data-testid="row-2">
          <TableCell className="font-medium">Classic Carbonara</TableCell>
          <TableCell>4.9</TableCell>
        </TableRow>
        <TableRow href="#recipe-3" title="View Recipe 3" data-testid="row-3">
          <TableCell className="font-medium">Beef Wellington</TableCell>
          <TableCell>4.7</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Tab to first focusable element (the link in first row)
    await userEvent.tab()

    // The first row's link should be focused
    const link1 = canvas.getByLabelText('View Recipe 1')
    await expect(link1).toHaveFocus()

    // Tab to next row - should skip to second row's first cell
    // (The remaining cells in row 1 have tabIndex=-1)
    await userEvent.tab()

    const link2 = canvas.getByLabelText('View Recipe 2')
    await expect(link2).toHaveFocus()

    // Tab to third row
    await userEvent.tab()

    const link3 = canvas.getByLabelText('View Recipe 3')
    await expect(link3).toHaveFocus()
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests keyboard navigation. Tab moves between clickable rows.',
      },
    },
  },
}
