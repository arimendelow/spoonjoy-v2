import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import {
  Star,
  Flame,
  Clock,
  Leaf,
  Sparkles,
  Check,
  AlertTriangle,
  Zap,
  Heart,
  Crown,
  ChefHat,
  Timer,
} from 'lucide-react'
import { Badge, BadgeButton } from '../app/components/ui/badge'

/**
 * # Badge
 *
 * The humble badge. The participation trophy of UI components. It sits there,
 * looking colorful and smug, conveying tiny bits of information that somehow
 * feel incredibly important.
 *
 * "New!" it screams. "Sale!" it whispers. "Vegan!" it virtue signals.
 *
 * Badges are the Post-it notes of the digital world. They annotate, categorize,
 * and occasionally judge your content. Without them, how would users know which
 * recipe is "Chef's Pick" or which dish will send them to the emergency room
 * ("Contains: Tree Nuts, Shellfish, Existential Dread")?
 *
 * ## The Badge Philosophy
 *
 * Badges should be:
 * - **Brief** - If your badge needs a line break, it's a paragraph
 * - **Clear** - Users should instantly understand what it means
 * - **Consistent** - Red means danger. Green means go. Don't mess with this.
 *
 * ## Variants
 *
 * - **Badge** - The static, informational badge. It just sits there. Judging.
 * - **BadgeButton** - For when your badge needs to *do* something. Click it.
 *
 * ## Color Psychology (According to Us)
 *
 * - 🔴 Red/Rose/Pink - Danger, spicy, love, or "please notice me"
 * - 🟠 Orange/Amber - Warnings, autumn vibes, pumpkin spice season
 * - 🟡 Yellow/Lime - Caution, freshness, "this might be sour"
 * - 🟢 Green/Emerald/Teal - Healthy, vegan, money, envy
 * - 🔵 Blue/Sky/Cyan - Trust, calm, "this is definitely fine"
 * - 🟣 Indigo/Violet/Purple - Royalty, luxury, pretentiousness
 * - ⚪ Zinc - Default, neutral, "I couldn't decide on a color"
 */
const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Badges are small, colorful labels for categorizing, tagging, and annotating content.

With 18 color variants and support for icons, they're perfect for status indicators, tags, labels, and "New!" callouts that marketing insists on adding everywhere.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: [
        'zinc',
        'red',
        'orange',
        'amber',
        'yellow',
        'lime',
        'green',
        'emerald',
        'teal',
        'cyan',
        'sky',
        'blue',
        'indigo',
        'violet',
        'purple',
        'fuchsia',
        'pink',
        'rose',
      ],
      description: 'The color variant. Defaults to zinc for the commitment-phobes.',
    },
    children: {
      control: 'text',
      description: 'Badge content. Keep it short. This is a badge, not a biography.',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// BASIC STORIES
// =============================================================================

/**
 * The default badge. Zinc-colored, unassuming, and refreshingly neutral.
 * Like Switzerland, but smaller.
 */
export const Default: Story = {
  args: {
    children: 'Badge',
  },
}

/**
 * A badge with actual meaningful content.
 * Because "Badge" as label text is about as useful as "Button" on a button.
 */
export const WithLabel: Story = {
  args: {
    color: 'green',
    children: 'Vegetarian',
  },
  parameters: {
    docs: {
      description: {
        story: 'A badge with content that actually means something.',
      },
    },
  },
}

// =============================================================================
// ALL COLORS
// =============================================================================

/**
 * ## The Full Spectrum
 *
 * 18 colors. Because apparently 17 wasn't enough and 19 was just showing off.
 *
 * Each color is carefully calibrated for both light and dark modes, with
 * subtle hover effects that appear when badges become buttons. These colors
 * were chosen by someone with more opinions about color theory than is
 * probably healthy.
 */
export const AllColors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2 max-w-2xl">
      <Badge color="zinc">zinc (default)</Badge>
      <Badge color="red">red</Badge>
      <Badge color="orange">orange</Badge>
      <Badge color="amber">amber</Badge>
      <Badge color="yellow">yellow</Badge>
      <Badge color="lime">lime</Badge>
      <Badge color="green">green</Badge>
      <Badge color="emerald">emerald</Badge>
      <Badge color="teal">teal</Badge>
      <Badge color="cyan">cyan</Badge>
      <Badge color="sky">sky</Badge>
      <Badge color="blue">blue</Badge>
      <Badge color="indigo">indigo</Badge>
      <Badge color="violet">violet</Badge>
      <Badge color="purple">purple</Badge>
      <Badge color="fuchsia">fuchsia</Badge>
      <Badge color="pink">pink</Badge>
      <Badge color="rose">rose</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All 18 color variants. Pick wisely, or just use zinc and call it a day.',
      },
    },
  },
}

/**
 * ## Warm Colors
 *
 * For when you need to convey urgency, danger, or the fact that something
 * is very, very spicy. Use responsibly. Or don't. We're not your mom.
 */
export const WarmColors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge color="red">Spicy</Badge>
      <Badge color="orange">Limited Time</Badge>
      <Badge color="amber">Warning</Badge>
      <Badge color="yellow">New Recipe</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Warm colors demand attention. Use them for warnings, urgency, or spice levels.',
      },
    },
  },
}

/**
 * ## Cool Colors
 *
 * Calming. Professional. The colors that say "trust us, we know what we're doing."
 * Perfect for dietary info that doesn't involve allergens or fire.
 */
export const CoolColors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge color="lime">Fresh</Badge>
      <Badge color="green">Organic</Badge>
      <Badge color="emerald">Vegan</Badge>
      <Badge color="teal">Healthy</Badge>
      <Badge color="cyan">Light</Badge>
      <Badge color="sky">Low Sodium</Badge>
      <Badge color="blue">Verified</Badge>
      <Badge color="indigo">Premium</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Cool colors feel trustworthy. Perfect for health claims and premium labels.',
      },
    },
  },
}

/**
 * ## Fancy Colors
 *
 * For when your content needs to feel special. Luxurious. Like it went to
 * finishing school and learned which fork to use for salad.
 */
export const FancyColors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge color="violet">Exclusive</Badge>
      <Badge color="purple">Chef's Choice</Badge>
      <Badge color="fuchsia">Trending</Badge>
      <Badge color="pink">Popular</Badge>
      <Badge color="rose">Featured</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Purple and pink badges for when you want to feel fancy. Use sparingly.',
      },
    },
  },
}

// =============================================================================
// WITH ICONS
// =============================================================================

/**
 * ## Badges with Icons
 *
 * Icons make badges more scannable. The eye catches the symbol before reading
 * the text. It's science. Or UX design. Same thing, really.
 *
 * Note: Unlike buttons, badges don't use `data-slot="icon"` for styling.
 * Just drop your icon in and size it appropriately (w-3 h-3 works well).
 */
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2 items-center">
      <Badge color="amber">
        <Star className="w-3 h-3" />
        Featured
      </Badge>
      <Badge color="red">
        <Flame className="w-3 h-3" />
        Hot
      </Badge>
      <Badge color="green">
        <Leaf className="w-3 h-3" />
        Vegan
      </Badge>
      <Badge color="blue">
        <Clock className="w-3 h-3" />
        30 min
      </Badge>
      <Badge color="purple">
        <Sparkles className="w-3 h-3" />
        AI Generated
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Add icons to badges for visual scanning. Size them at w-3 h-3 for best results.',
      },
    },
  },
}

/**
 * ## Status Indicators
 *
 * Badges excel at showing status. Completed, pending, error, success...
 * all the emotional states of your data, visualized in tiny colorful pills.
 */
export const StatusIndicators: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2 items-center">
      <Badge color="green">
        <Check className="w-3 h-3" />
        Completed
      </Badge>
      <Badge color="amber">
        <Timer className="w-3 h-3" />
        In Progress
      </Badge>
      <Badge color="red">
        <AlertTriangle className="w-3 h-3" />
        Error
      </Badge>
      <Badge color="blue">
        <Zap className="w-3 h-3" />
        Active
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Perfect for showing workflow states, order status, or recipe completion.',
      },
    },
  },
}

/**
 * ## Icon-Only Badges
 *
 * When the icon says it all. Use these for very compact status indicators
 * where hover text or surrounding context provides meaning.
 */
export const IconOnly: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2 items-center">
      <Badge color="pink" aria-label="Favorited">
        <Heart className="w-3 h-3" />
      </Badge>
      <Badge color="amber" aria-label="Featured">
        <Star className="w-3 h-3" />
      </Badge>
      <Badge color="purple" aria-label="Premium">
        <Crown className="w-3 h-3" />
      </Badge>
      <Badge color="green" aria-label="Verified">
        <Check className="w-3 h-3" />
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Icon-only badges for compact displays. Add aria-label for accessibility.',
      },
    },
  },
}

// =============================================================================
// BADGE BUTTON
// =============================================================================

/**
 * ## BadgeButton
 *
 * For when your badge needs to *do* something. Click it, and things happen.
 * It's a badge! It's a button! It's a BadgeButton!
 *
 * BadgeButton wraps Badge with a clickable touch target. It can be a button
 * (for actions) or a link (for navigation). Same styling, different behavior.
 */
export const ButtonVariant: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2 items-center">
      <BadgeButton color="blue">Clickable</BadgeButton>
      <BadgeButton color="green">Filter: Vegan</BadgeButton>
      <BadgeButton color="purple">Remove Tag</BadgeButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'BadgeButton makes badges interactive. Hover to see the effect.',
      },
    },
  },
}

/**
 * ## BadgeButton as Link
 *
 * Pass `href` and the BadgeButton becomes an anchor tag. Same look, proper
 * semantic HTML. Screen readers and SEO bots approve.
 */
export const AsLink: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2 items-center">
      <BadgeButton href="#" color="indigo">
        View All
      </BadgeButton>
      <BadgeButton href="#" color="teal">
        Healthy Recipes
      </BadgeButton>
      <BadgeButton href="#" color="rose">
        Popular This Week
      </BadgeButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'BadgeButton with href renders as an anchor tag. Perfect for tag navigation.',
      },
    },
  },
}

/**
 * ## BadgeButton with Icons
 *
 * Buttons with icons. Because clicking a badge is more fun when
 * there's a little picture next to the text.
 */
export const ButtonWithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2 items-center">
      <BadgeButton color="amber">
        <Star className="w-3 h-3" />
        Add to Favorites
      </BadgeButton>
      <BadgeButton color="green">
        <Leaf className="w-3 h-3" />
        Vegan
      </BadgeButton>
      <BadgeButton href="#" color="blue">
        <ChefHat className="w-3 h-3" />
        View Chef
      </BadgeButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'BadgeButtons work great with icons too.',
      },
    },
  },
}

// =============================================================================
// REAL-WORLD EXAMPLES
// =============================================================================

/**
 * ## Recipe Card Example
 *
 * Here's how badges might appear on a recipe card. Multiple badges,
 * working together in harmony, telling you everything you need to know
 * before you commit to 45 minutes of chopping.
 */
export const RecipeCardExample: Story = {
  render: () => (
    <div className="p-4 border border-zinc-200 rounded-lg max-w-sm dark:border-zinc-700">
      <div className="flex flex-wrap gap-1.5 mb-3">
        <Badge color="amber">
          <Star className="w-3 h-3" />
          Featured
        </Badge>
        <Badge color="green">
          <Leaf className="w-3 h-3" />
          Vegan
        </Badge>
        <Badge color="blue">
          <Clock className="w-3 h-3" />
          30 min
        </Badge>
      </div>
      <h3 className="font-semibold text-zinc-900 dark:text-white">
        Thai Coconut Curry
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
        A creamy, aromatic curry that'll make you wonder why you ever ordered takeout.
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badges on a recipe card. The holy trinity: dietary info, cook time, and "look at me I\'m special."',
      },
    },
  },
}

/**
 * ## Dietary Tags
 *
 * The tags every recipe app needs. Dietary restrictions are serious business,
 * and badges make them immediately visible.
 */
export const DietaryTags: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Diets:</p>
        <div className="flex flex-wrap gap-2">
          <Badge color="green">Vegan</Badge>
          <Badge color="emerald">Vegetarian</Badge>
          <Badge color="sky">Pescatarian</Badge>
          <Badge color="amber">Keto</Badge>
          <Badge color="orange">Paleo</Badge>
        </div>
      </div>
      <div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Allergens:</p>
        <div className="flex flex-wrap gap-2">
          <Badge color="red">Contains Nuts</Badge>
          <Badge color="red">Contains Gluten</Badge>
          <Badge color="red">Contains Dairy</Badge>
          <Badge color="red">Contains Shellfish</Badge>
        </div>
      </div>
      <div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Safe For:</p>
        <div className="flex flex-wrap gap-2">
          <Badge color="teal">Gluten-Free</Badge>
          <Badge color="teal">Dairy-Free</Badge>
          <Badge color="teal">Nut-Free</Badge>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Dietary badges. Red for danger (allergens), green/teal for safety.',
      },
    },
  },
}

/**
 * ## Filter Tags with Remove
 *
 * Interactive badges for filtering. Click to remove. Very satisfying.
 */
export const FilterTags: Story = {
  render: () => (
    <div className="space-y-2">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">Active Filters:</p>
      <div className="flex flex-wrap gap-2">
        <BadgeButton color="blue">
          Vegetarian
          <span className="ml-1">&times;</span>
        </BadgeButton>
        <BadgeButton color="blue">
          Under 30 min
          <span className="ml-1">&times;</span>
        </BadgeButton>
        <BadgeButton color="blue">
          Beginner Friendly
          <span className="ml-1">&times;</span>
        </BadgeButton>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Clickable filter badges. The × suggests removability.',
      },
    },
  },
}

/**
 * ## Difficulty Levels
 *
 * Because not everyone is a Michelin-starred chef. Some of us just want
 * to boil pasta without setting off the smoke alarm.
 */
export const DifficultyLevels: Story = {
  render: () => (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Badge color="green">Easy</Badge>
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          Perfect for beginners. Boiling water? You got this.
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Badge color="amber">Medium</Badge>
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          Some technique required. Maybe watch a YouTube video first.
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Badge color="red">Hard</Badge>
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          Advanced skills needed. Clear your schedule.
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Badge color="purple">
          <Crown className="w-3 h-3" />
          Expert
        </Badge>
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          Culinary school graduates only. Just kidding. But also not really.
        </span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Skill level badges. Be honest about difficulty. Burnt soufflés hurt.',
      },
    },
  },
}

// =============================================================================
// EDGE CASES
// =============================================================================

/**
 * ## Long Text
 *
 * Badges with too much text. Don't do this. But if you must, at least
 * know that the component won't explode.
 */
export const LongText: Story = {
  render: () => (
    <div className="space-y-2 max-w-md">
      <Badge color="blue">This badge has way too much text and should probably be a paragraph instead</Badge>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Please don't actually do this. Badges are for short labels. Use Text for paragraphs.
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Long text in badges. Technically possible. Aesthetically questionable.',
      },
    },
  },
}

/**
 * ## Empty Badge
 *
 * An empty badge. It's valid but pointless. Like an appendix.
 */
export const EmptyBadge: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge color="zinc">{''}</Badge>
      <span className="text-sm text-zinc-500 dark:text-zinc-400">
        An empty badge. It exists. That's about it.
      </span>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Empty badges render but contribute nothing. Like that coworker who\'s always "in meetings."',
      },
    },
  },
}

/**
 * ## Many Badges
 *
 * What happens when you go badge-crazy. Spoiler: visual chaos.
 * Use badges with restraint. This is a cautionary tale.
 */
export const BadgeOverload: Story = {
  render: () => (
    <div className="p-4 border border-zinc-200 rounded-lg max-w-md dark:border-zinc-700">
      <div className="flex flex-wrap gap-1 mb-3">
        <Badge color="amber">Featured</Badge>
        <Badge color="green">Vegan</Badge>
        <Badge color="emerald">Organic</Badge>
        <Badge color="teal">Gluten-Free</Badge>
        <Badge color="blue">Quick</Badge>
        <Badge color="purple">Premium</Badge>
        <Badge color="pink">Trending</Badge>
        <Badge color="rose">New</Badge>
        <Badge color="red">Spicy</Badge>
        <Badge color="orange">Limited</Badge>
      </div>
      <h3 className="font-semibold text-zinc-900 dark:text-white">
        The Most Special Recipe Ever
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
        So special it needs 10 badges to describe it. (Don't do this.)
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badge overload. When everything is special, nothing is special.',
      },
    },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Testing BadgeButton click interactions.
 * Check the Interactions panel to see the badge getting clicked.
 */
export const ClickInteraction: Story = {
  render: (args) => (
    <BadgeButton {...args} color="blue">
      Click me
    </BadgeButton>
  ),
  args: {
    onClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const badge = canvas.getByRole('button', { name: 'Click me' })

    // Verify badge button exists
    await expect(badge).toBeInTheDocument()

    // Click the badge
    await userEvent.click(badge)

    // Verify onClick was called
    await expect(args.onClick).toHaveBeenCalledTimes(1)

    // Click again
    await userEvent.click(badge)
    await expect(args.onClick).toHaveBeenCalledTimes(2)
  },
  parameters: {
    docs: {
      description: {
        story: 'BadgeButton responds to clicks. Watch the Interactions panel for the robot clicking.',
      },
    },
  },
}

/**
 * Testing keyboard accessibility for BadgeButton.
 * Because keyboard users deserve clickable badges too.
 */
export const KeyboardInteraction: Story = {
  render: (args) => (
    <BadgeButton {...args} color="green">
      Press Enter
    </BadgeButton>
  ),
  args: {
    onClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const badge = canvas.getByRole('button', { name: 'Press Enter' })

    // Focus the badge
    badge.focus()
    await expect(badge).toHaveFocus()

    // Press Enter
    await userEvent.keyboard('{Enter}')
    await expect(args.onClick).toHaveBeenCalledTimes(1)

    // Press Space
    await userEvent.keyboard(' ')
    await expect(args.onClick).toHaveBeenCalledTimes(2)
  },
  parameters: {
    docs: {
      description: {
        story: 'BadgeButton responds to Enter and Space keys. Accessibility matters.',
      },
    },
  },
}

/**
 * Testing focus states.
 * The focus ring should appear when tabbing to a BadgeButton.
 */
export const FocusState: Story = {
  render: () => (
    <BadgeButton color="purple">Tab to focus</BadgeButton>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const badge = canvas.getByRole('button', { name: 'Tab to focus' })

    // Tab to focus
    await userEvent.tab()

    // Verify focus
    await expect(badge).toHaveFocus()
  },
  parameters: {
    docs: {
      description: {
        story: 'Focus ring appears on keyboard navigation. Tab to see it.',
      },
    },
  },
}
