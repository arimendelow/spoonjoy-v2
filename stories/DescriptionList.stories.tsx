import type { Meta, StoryObj } from '@storybook/react-vite'
import { DescriptionList, DescriptionTerm, DescriptionDetails } from '../app/components/ui/description-list'
import { Badge } from '../app/components/ui/badge'
import { Link } from '../app/components/ui/link'
import {
  Clock,
  ChefHat,
  Flame,
  Users,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Globe,
  Star,
  Leaf,
  AlertTriangle,
} from 'lucide-react'

/**
 * # Description List
 *
 * The description list. The unsung hero of "here's a bunch of related facts"
 * UI patterns. It's like a table's artsy cousin who went to liberal arts school
 * and now presents data in term-description pairs because "it's more semantic."
 *
 * Description lists (`<dl>`) have been around since HTML 2.0, making them older
 * than most of your coworkers. They're the original key-value store of the web,
 * predating JSON by about 15 years. Show some respect.
 *
 * ## When to Use Description Lists
 *
 * - **Metadata displays** - Recipe info, user profiles, product specs
 * - **Glossaries** - Term and definition pairs (that's literally what `<dt>` and `<dd>` stand for)
 * - **Contact info** - Name, email, phone... the classics
 * - **Order summaries** - Item details before checkout
 *
 * ## When NOT to Use Description Lists
 *
 * - **Tabular data** - Use a Table. That's what they're for.
 * - **Lists without terms** - Just use `<ul>` or `<ol>`. Simple.
 * - **Single items** - A one-item description list is just showing off.
 *
 * ## The Anatomy
 *
 * - **DescriptionList** - The container. Sets up the responsive grid magic.
 * - **DescriptionTerm** - The label/key. "What is this piece of info called?"
 * - **DescriptionDetails** - The value. "What is the actual info?"
 *
 * ## Responsive Behavior
 *
 * On mobile, terms and details stack vertically. On larger screens, they arrange
 * in a proper grid with the term taking up to 50% (max 320px) and the details
 * filling the rest. It's responsive design that actually makes sense.
 */
const meta: Meta<typeof DescriptionList> = {
  title: 'UI/DescriptionList',
  component: DescriptionList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A semantic description list component for displaying term-detail pairs.

Responsive grid layout: stacked on mobile, side-by-side on larger screens. Perfect for metadata, specs, contact info, and anywhere you need to show key-value data that isn't tabular.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes for the container.',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// BASIC STORIES
// =============================================================================

/**
 * The default description list. Simple, semantic, satisfying.
 * Just terms and their corresponding details, living their best lives.
 */
export const Default: Story = {
  render: () => (
    <DescriptionList>
      <DescriptionTerm>Name</DescriptionTerm>
      <DescriptionDetails>Thai Coconut Curry</DescriptionDetails>

      <DescriptionTerm>Chef</DescriptionTerm>
      <DescriptionDetails>Gordon Ramsay</DescriptionDetails>

      <DescriptionTerm>Prep Time</DescriptionTerm>
      <DescriptionDetails>15 minutes</DescriptionDetails>

      <DescriptionTerm>Cook Time</DescriptionTerm>
      <DescriptionDetails>30 minutes</DescriptionDetails>
    </DescriptionList>
  ),
}

/**
 * ## With More Content
 *
 * A fuller example showing various types of content in the details.
 * Text, numbers, whatever. The description list doesn't judge.
 */
export const WithVariedContent: Story = {
  render: () => (
    <DescriptionList>
      <DescriptionTerm>Recipe Name</DescriptionTerm>
      <DescriptionDetails>Grandmother's Secret Meatballs</DescriptionDetails>

      <DescriptionTerm>Origin</DescriptionTerm>
      <DescriptionDetails>Passed down through four generations of Italian-American disappointment</DescriptionDetails>

      <DescriptionTerm>Servings</DescriptionTerm>
      <DescriptionDetails>6-8 (or 1, if you're having that kind of day)</DescriptionDetails>

      <DescriptionTerm>Difficulty</DescriptionTerm>
      <DescriptionDetails>Medium - requires patience you probably don't have</DescriptionDetails>

      <DescriptionTerm>Secret Ingredient</DescriptionTerm>
      <DescriptionDetails>Nice try</DescriptionDetails>
    </DescriptionList>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Description details can contain any length of text. The grid adapts.',
      },
    },
  },
}

// =============================================================================
// RECIPE EXAMPLES
// =============================================================================

/**
 * ## Recipe Information
 *
 * The most common use case in a recipe app: showing recipe metadata.
 * Cook time, servings, difficulty... all the things users need to know
 * before they commit to 45 minutes of chopping onions while crying.
 */
export const RecipeInfo: Story = {
  render: () => (
    <DescriptionList>
      <DescriptionTerm>Prep Time</DescriptionTerm>
      <DescriptionDetails className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-zinc-400" />
        15 minutes
      </DescriptionDetails>

      <DescriptionTerm>Cook Time</DescriptionTerm>
      <DescriptionDetails className="flex items-center gap-2">
        <Flame className="w-4 h-4 text-orange-500" />
        45 minutes
      </DescriptionDetails>

      <DescriptionTerm>Servings</DescriptionTerm>
      <DescriptionDetails className="flex items-center gap-2">
        <Users className="w-4 h-4 text-zinc-400" />4 people
      </DescriptionDetails>

      <DescriptionTerm>Difficulty</DescriptionTerm>
      <DescriptionDetails>
        <Badge color="amber">Medium</Badge>
      </DescriptionDetails>

      <DescriptionTerm>Cuisine</DescriptionTerm>
      <DescriptionDetails>Thai</DescriptionDetails>
    </DescriptionList>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Recipe metadata with icons and badges. The quintessential use case.',
      },
    },
  },
}

/**
 * ## Nutritional Information
 *
 * Because apparently some people care about calories when looking at recipes.
 * We don't understand it either, but here's a pattern for it.
 */
export const NutritionalInfo: Story = {
  render: () => (
    <DescriptionList>
      <DescriptionTerm>Calories</DescriptionTerm>
      <DescriptionDetails className="tabular-nums">450 kcal</DescriptionDetails>

      <DescriptionTerm>Protein</DescriptionTerm>
      <DescriptionDetails className="tabular-nums">28g</DescriptionDetails>

      <DescriptionTerm>Carbohydrates</DescriptionTerm>
      <DescriptionDetails className="tabular-nums">35g</DescriptionDetails>

      <DescriptionTerm>Fat</DescriptionTerm>
      <DescriptionDetails className="tabular-nums">22g</DescriptionDetails>

      <DescriptionTerm>Fiber</DescriptionTerm>
      <DescriptionDetails className="tabular-nums">4g</DescriptionDetails>

      <DescriptionTerm>Sodium</DescriptionTerm>
      <DescriptionDetails className="tabular-nums">680mg</DescriptionDetails>
    </DescriptionList>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Nutritional facts. Use tabular-nums for aligned numbers.',
      },
    },
  },
}

/**
 * ## Dietary Information
 *
 * Allergens, dietary tags, and all the things that determine whether
 * this recipe will send someone to the hospital.
 */
export const DietaryInfo: Story = {
  render: () => (
    <DescriptionList>
      <DescriptionTerm>Diet</DescriptionTerm>
      <DescriptionDetails className="flex flex-wrap gap-1.5">
        <Badge color="green">
          <Leaf className="w-3 h-3" />
          Vegetarian
        </Badge>
        <Badge color="teal">Gluten-Free</Badge>
      </DescriptionDetails>

      <DescriptionTerm>Allergens</DescriptionTerm>
      <DescriptionDetails className="flex flex-wrap gap-1.5">
        <Badge color="red">
          <AlertTriangle className="w-3 h-3" />
          Tree Nuts
        </Badge>
        <Badge color="red">
          <AlertTriangle className="w-3 h-3" />
          Soy
        </Badge>
      </DescriptionDetails>

      <DescriptionTerm>May Contain</DescriptionTerm>
      <DescriptionDetails className="flex flex-wrap gap-1.5">
        <Badge color="amber">Sesame</Badge>
      </DescriptionDetails>

      <DescriptionTerm>Verified</DescriptionTerm>
      <DescriptionDetails>
        <span className="text-green-600 dark:text-green-400">✓ Nutritionist reviewed</span>
      </DescriptionDetails>
    </DescriptionList>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Dietary restrictions and allergens. Red badges for danger. This information saves lives.',
      },
    },
  },
}

// =============================================================================
// USER/PROFILE EXAMPLES
// =============================================================================

/**
 * ## User Profile
 *
 * Description lists excel at profile pages. All those personal details,
 * neatly organized in semantic HTML that screen readers actually understand.
 */
export const UserProfile: Story = {
  render: () => (
    <DescriptionList>
      <DescriptionTerm>Full Name</DescriptionTerm>
      <DescriptionDetails>Julia Child</DescriptionDetails>

      <DescriptionTerm>Username</DescriptionTerm>
      <DescriptionDetails>@butterislife</DescriptionDetails>

      <DescriptionTerm>Email</DescriptionTerm>
      <DescriptionDetails className="flex items-center gap-2">
        <Mail className="w-4 h-4 text-zinc-400" />
        <Link href="mailto:julia@example.com">julia@example.com</Link>
      </DescriptionDetails>

      <DescriptionTerm>Location</DescriptionTerm>
      <DescriptionDetails className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-zinc-400" />
        Cambridge, Massachusetts
      </DescriptionDetails>

      <DescriptionTerm>Member Since</DescriptionTerm>
      <DescriptionDetails className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-zinc-400" />
        August 15, 1961
      </DescriptionDetails>

      <DescriptionTerm>Specialty</DescriptionTerm>
      <DescriptionDetails>French Cuisine (making it accessible to Americans)</DescriptionDetails>
    </DescriptionList>
  ),
  parameters: {
    docs: {
      description: {
        story: 'User profile with icons and links. The classic settings page layout.',
      },
    },
  },
}

/**
 * ## Chef Profile Stats
 *
 * Stats and achievements for a chef profile. Numbers that make
 * someone feel validated about their life choices.
 */
export const ChefStats: Story = {
  render: () => (
    <DescriptionList>
      <DescriptionTerm>Recipes Published</DescriptionTerm>
      <DescriptionDetails className="tabular-nums font-semibold">247</DescriptionDetails>

      <DescriptionTerm>Total Followers</DescriptionTerm>
      <DescriptionDetails className="tabular-nums font-semibold">12,847</DescriptionDetails>

      <DescriptionTerm>Average Rating</DescriptionTerm>
      <DescriptionDetails className="flex items-center gap-1">
        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
        <span className="tabular-nums font-semibold">4.8</span>
        <span className="text-zinc-500">(2,341 reviews)</span>
      </DescriptionDetails>

      <DescriptionTerm>Most Popular Recipe</DescriptionTerm>
      <DescriptionDetails>
        <Link href="#">Boeuf Bourguignon</Link>
        <span className="text-zinc-500 text-sm ml-2">• 15.2k saves</span>
      </DescriptionDetails>

      <DescriptionTerm>Badges</DescriptionTerm>
      <DescriptionDetails className="flex flex-wrap gap-1.5">
        <Badge color="purple">
          <ChefHat className="w-3 h-3" />
          Master Chef
        </Badge>
        <Badge color="amber">
          <Star className="w-3 h-3" />
          Top Creator
        </Badge>
        <Badge color="blue">Verified</Badge>
      </DescriptionDetails>
    </DescriptionList>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Profile statistics with formatted numbers and achievement badges.',
      },
    },
  },
}

// =============================================================================
// CONTACT/BUSINESS EXAMPLES
// =============================================================================

/**
 * ## Contact Information
 *
 * The classic contact card layout. Name, phone, email, website.
 * Every business website since 1997 has needed this pattern.
 */
export const ContactInfo: Story = {
  render: () => (
    <DescriptionList>
      <DescriptionTerm>Name</DescriptionTerm>
      <DescriptionDetails>Spoonjoy Headquarters</DescriptionDetails>

      <DescriptionTerm>Phone</DescriptionTerm>
      <DescriptionDetails className="flex items-center gap-2">
        <Phone className="w-4 h-4 text-zinc-400" />
        <Link href="tel:+1-555-RECIPES">+1-555-RECIPES</Link>
      </DescriptionDetails>

      <DescriptionTerm>Email</DescriptionTerm>
      <DescriptionDetails className="flex items-center gap-2">
        <Mail className="w-4 h-4 text-zinc-400" />
        <Link href="mailto:hello@spoonjoy.com">hello@spoonjoy.com</Link>
      </DescriptionDetails>

      <DescriptionTerm>Website</DescriptionTerm>
      <DescriptionDetails className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-zinc-400" />
        <Link href="#">spoonjoy.com</Link>
      </DescriptionDetails>

      <DescriptionTerm>Address</DescriptionTerm>
      <DescriptionDetails className="flex items-start gap-2">
        <MapPin className="w-4 h-4 text-zinc-400 mt-0.5" />
        <span>
          123 Recipe Lane
          <br />
          Culinary District
          <br />
          Foodville, FC 12345
        </span>
      </DescriptionDetails>
    </DescriptionList>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Contact information with icons and clickable links. Timeless pattern.',
      },
    },
  },
}

// =============================================================================
// ORDER/TRANSACTION EXAMPLES
// =============================================================================

/**
 * ## Order Summary
 *
 * Pre-checkout order details. What you're buying, how much it costs,
 * and where it's going. The anxiety-inducing final review before
 * you click "Place Order."
 */
export const OrderSummary: Story = {
  render: () => (
    <DescriptionList>
      <DescriptionTerm>Order Number</DescriptionTerm>
      <DescriptionDetails className="font-mono">ORD-2024-00847</DescriptionDetails>

      <DescriptionTerm>Items</DescriptionTerm>
      <DescriptionDetails>3 items</DescriptionDetails>

      <DescriptionTerm>Subtotal</DescriptionTerm>
      <DescriptionDetails className="tabular-nums">$45.97</DescriptionDetails>

      <DescriptionTerm>Shipping</DescriptionTerm>
      <DescriptionDetails className="tabular-nums">$5.99</DescriptionDetails>

      <DescriptionTerm>Tax</DescriptionTerm>
      <DescriptionDetails className="tabular-nums">$4.14</DescriptionDetails>

      <DescriptionTerm>Total</DescriptionTerm>
      <DescriptionDetails className="tabular-nums font-semibold text-lg">$56.10</DescriptionDetails>

      <DescriptionTerm>Status</DescriptionTerm>
      <DescriptionDetails>
        <Badge color="blue">Processing</Badge>
      </DescriptionDetails>
    </DescriptionList>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Order summary with aligned currency values. Use tabular-nums for numbers.',
      },
    },
  },
}

/**
 * ## Shipping Details
 *
 * Where the stuff is going and how it's getting there.
 * The logistical poetry of e-commerce.
 */
export const ShippingDetails: Story = {
  render: () => (
    <DescriptionList>
      <DescriptionTerm>Ship To</DescriptionTerm>
      <DescriptionDetails>
        <div>Anthony Bourdain</div>
        <div className="text-zinc-500 dark:text-zinc-400">123 Kitchen Confidential Blvd</div>
        <div className="text-zinc-500 dark:text-zinc-400">New York, NY 10013</div>
      </DescriptionDetails>

      <DescriptionTerm>Shipping Method</DescriptionTerm>
      <DescriptionDetails>Express (2-3 business days)</DescriptionDetails>

      <DescriptionTerm>Estimated Delivery</DescriptionTerm>
      <DescriptionDetails>Friday, January 31, 2025</DescriptionDetails>

      <DescriptionTerm>Tracking Number</DescriptionTerm>
      <DescriptionDetails>
        <Link href="#" className="font-mono">
          1Z999AA10123456784
        </Link>
      </DescriptionDetails>

      <DescriptionTerm>Carrier</DescriptionTerm>
      <DescriptionDetails>UPS Ground</DescriptionDetails>
    </DescriptionList>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Shipping details with multi-line address and tracking link.',
      },
    },
  },
}

// =============================================================================
// PRODUCT/SPEC EXAMPLES
// =============================================================================

/**
 * ## Product Specifications
 *
 * Technical specs for kitchen equipment. The kind of details that only
 * matter to enthusiasts and reviewers, but you'd better have them.
 */
export const ProductSpecs: Story = {
  render: () => (
    <DescriptionList>
      <DescriptionTerm>Product</DescriptionTerm>
      <DescriptionDetails>Professional Stand Mixer</DescriptionDetails>

      <DescriptionTerm>Model</DescriptionTerm>
      <DescriptionDetails className="font-mono">KSM-PRO-600</DescriptionDetails>

      <DescriptionTerm>Capacity</DescriptionTerm>
      <DescriptionDetails>6 Quarts</DescriptionDetails>

      <DescriptionTerm>Power</DescriptionTerm>
      <DescriptionDetails>575 Watts</DescriptionDetails>

      <DescriptionTerm>Dimensions</DescriptionTerm>
      <DescriptionDetails>16.5" × 11.3" × 14.6" (H × W × D)</DescriptionDetails>

      <DescriptionTerm>Weight</DescriptionTerm>
      <DescriptionDetails>26 lbs (11.8 kg)</DescriptionDetails>

      <DescriptionTerm>Warranty</DescriptionTerm>
      <DescriptionDetails>5-year limited manufacturer warranty</DescriptionDetails>

      <DescriptionTerm>Included Attachments</DescriptionTerm>
      <DescriptionDetails>Flat beater, dough hook, wire whip, pouring shield</DescriptionDetails>
    </DescriptionList>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Product specifications. For when people actually want to know the wattage.',
      },
    },
  },
}

// =============================================================================
// STYLING VARIATIONS
// =============================================================================

/**
 * ## Custom Styling
 *
 * The description list accepts className for custom styles.
 * Want more spacing? Different widths? Go wild.
 */
export const CustomStyling: Story = {
  render: () => (
    <DescriptionList className="max-w-lg bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-6">
      <DescriptionTerm className="font-semibold text-zinc-900 dark:text-white">Title</DescriptionTerm>
      <DescriptionDetails className="text-lg">Custom Styled Description List</DescriptionDetails>

      <DescriptionTerm className="font-semibold text-zinc-900 dark:text-white">Description</DescriptionTerm>
      <DescriptionDetails>
        You can pass className to any of the components to customize their appearance while keeping the semantic
        structure intact.
      </DescriptionDetails>

      <DescriptionTerm className="font-semibold text-zinc-900 dark:text-white">Note</DescriptionTerm>
      <DescriptionDetails className="italic">Styling with restraint is still styling.</DescriptionDetails>
    </DescriptionList>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Custom classes on the container and children for bespoke designs.',
      },
    },
  },
}

/**
 * ## In a Card
 *
 * Description lists often live inside cards. Here's that pattern,
 * with the list providing structure inside the card container.
 */
export const InCard: Story = {
  render: () => (
    <div className="max-w-md rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      <div className="bg-zinc-50 dark:bg-zinc-800 px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
        <h3 className="font-semibold text-zinc-900 dark:text-white">Recipe Details</h3>
      </div>
      <div className="p-6">
        <DescriptionList>
          <DescriptionTerm>Created</DescriptionTerm>
          <DescriptionDetails>January 15, 2025</DescriptionDetails>

          <DescriptionTerm>Last Updated</DescriptionTerm>
          <DescriptionDetails>January 28, 2025</DescriptionDetails>

          <DescriptionTerm>Status</DescriptionTerm>
          <DescriptionDetails>
            <Badge color="green">Published</Badge>
          </DescriptionDetails>

          <DescriptionTerm>Visibility</DescriptionTerm>
          <DescriptionDetails>Public</DescriptionDetails>
        </DescriptionList>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Description list inside a card component. A common composition.',
      },
    },
  },
}

// =============================================================================
// EDGE CASES
// =============================================================================

/**
 * ## Long Content
 *
 * What happens when the details are... detailed? The text wraps
 * naturally within the grid cell. No explosions.
 */
export const LongContent: Story = {
  render: () => (
    <DescriptionList className="max-w-xl">
      <DescriptionTerm>Short Term</DescriptionTerm>
      <DescriptionDetails>Brief value.</DescriptionDetails>

      <DescriptionTerm>Medium Length Term</DescriptionTerm>
      <DescriptionDetails>
        This is a moderately long description that should wrap nicely within the available space without causing any
        layout issues.
      </DescriptionDetails>

      <DescriptionTerm>A Very Long Term That Might Wrap</DescriptionTerm>
      <DescriptionDetails>The term can wrap too if it needs to.</DescriptionDetails>

      <DescriptionTerm>Story</DescriptionTerm>
      <DescriptionDetails>
        This recipe has been in my family for generations. My great-grandmother brought it over from the old country,
        carefully written on a piece of paper that somehow survived the journey. She taught my grandmother, who taught
        my mother, who burned it the first seventeen times before finally getting it right. Now I'm carrying on the
        tradition of mild kitchen disasters followed by eventual success.
      </DescriptionDetails>
    </DescriptionList>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Long text in both terms and details. Everything wraps gracefully.',
      },
    },
  },
}

/**
 * ## Empty Values
 *
 * Sometimes data is missing. You can show placeholder text, "N/A",
 * or just leave it blank. The layout handles it fine.
 */
export const EmptyValues: Story = {
  render: () => (
    <DescriptionList>
      <DescriptionTerm>Name</DescriptionTerm>
      <DescriptionDetails>Mystery Recipe</DescriptionDetails>

      <DescriptionTerm>Author</DescriptionTerm>
      <DescriptionDetails className="text-zinc-400 dark:text-zinc-500 italic">Unknown</DescriptionDetails>

      <DescriptionTerm>Source</DescriptionTerm>
      <DescriptionDetails className="text-zinc-400 dark:text-zinc-500">—</DescriptionDetails>

      <DescriptionTerm>Notes</DescriptionTerm>
      <DescriptionDetails>{/* Intentionally empty */}</DescriptionDetails>

      <DescriptionTerm>Rating</DescriptionTerm>
      <DescriptionDetails>
        <Badge color="zinc">Not yet rated</Badge>
      </DescriptionDetails>
    </DescriptionList>
  ),
  parameters: {
    docs: {
      description: {
        story: "Missing or empty values. Handle gracefully with placeholders or just... nothing.",
      },
    },
  },
}

/**
 * ## Single Item
 *
 * A one-item description list. Technically valid. Philosophically questionable.
 * Like using a chainsaw to slice bread.
 */
export const SingleItem: Story = {
  render: () => (
    <DescriptionList>
      <DescriptionTerm>The Meaning of Life</DescriptionTerm>
      <DescriptionDetails>42 (also: good food)</DescriptionDetails>
    </DescriptionList>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Single term-detail pair. It works, but consider if you really need a description list for one item.',
      },
    },
  },
}

/**
 * ## Many Items
 *
 * A description list with many items. The borders help with scanning,
 * and the consistent layout keeps things readable even with lots of data.
 */
export const ManyItems: Story = {
  render: () => (
    <DescriptionList>
      <DescriptionTerm>Recipe ID</DescriptionTerm>
      <DescriptionDetails className="font-mono text-sm">rec_k9x2mN7pLq3</DescriptionDetails>

      <DescriptionTerm>Title</DescriptionTerm>
      <DescriptionDetails>Ultimate Chocolate Chip Cookies</DescriptionDetails>

      <DescriptionTerm>Author</DescriptionTerm>
      <DescriptionDetails>Christina Tosi</DescriptionDetails>

      <DescriptionTerm>Created</DescriptionTerm>
      <DescriptionDetails>December 3, 2024</DescriptionDetails>

      <DescriptionTerm>Updated</DescriptionTerm>
      <DescriptionDetails>January 15, 2025</DescriptionDetails>

      <DescriptionTerm>Category</DescriptionTerm>
      <DescriptionDetails>Desserts → Cookies</DescriptionDetails>

      <DescriptionTerm>Cuisine</DescriptionTerm>
      <DescriptionDetails>American</DescriptionDetails>

      <DescriptionTerm>Prep Time</DescriptionTerm>
      <DescriptionDetails>20 minutes</DescriptionDetails>

      <DescriptionTerm>Cook Time</DescriptionTerm>
      <DescriptionDetails>12 minutes</DescriptionDetails>

      <DescriptionTerm>Total Time</DescriptionTerm>
      <DescriptionDetails>32 minutes</DescriptionDetails>

      <DescriptionTerm>Yield</DescriptionTerm>
      <DescriptionDetails>24 cookies</DescriptionDetails>

      <DescriptionTerm>Difficulty</DescriptionTerm>
      <DescriptionDetails>Easy</DescriptionDetails>

      <DescriptionTerm>Tags</DescriptionTerm>
      <DescriptionDetails className="flex flex-wrap gap-1">
        <Badge color="amber">dessert</Badge>
        <Badge color="amber">cookies</Badge>
        <Badge color="amber">chocolate</Badge>
        <Badge color="amber">baking</Badge>
        <Badge color="amber">comfort-food</Badge>
      </DescriptionDetails>

      <DescriptionTerm>Views</DescriptionTerm>
      <DescriptionDetails className="tabular-nums">247,832</DescriptionDetails>

      <DescriptionTerm>Saves</DescriptionTerm>
      <DescriptionDetails className="tabular-nums">18,293</DescriptionDetails>

      <DescriptionTerm>Rating</DescriptionTerm>
      <DescriptionDetails className="flex items-center gap-1">
        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
        <span className="tabular-nums">4.9</span>
        <span className="text-zinc-500 text-sm">(3,847 reviews)</span>
      </DescriptionDetails>
    </DescriptionList>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A lengthy description list. The subtle borders help scan through many items.',
      },
    },
  },
}

// =============================================================================
// RESPONSIVE DEMO
// =============================================================================

/**
 * ## Responsive Behavior
 *
 * Resize your browser to see the magic. On narrow screens, terms and
 * details stack vertically. On wider screens, they sit side-by-side
 * in a proper grid. No media query fiddling required.
 */
export const ResponsiveBehavior: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        ↔ Resize your browser window to see the responsive behavior
      </p>
      <DescriptionList>
        <DescriptionTerm>On Mobile</DescriptionTerm>
        <DescriptionDetails>Terms and details stack vertically. Each pair is a mini-section.</DescriptionDetails>

        <DescriptionTerm>On Desktop</DescriptionTerm>
        <DescriptionDetails>
          Terms take up to 50% (max 320px) on the left, details fill the remaining space on the right.
        </DescriptionDetails>

        <DescriptionTerm>The Breakpoint</DescriptionTerm>
        <DescriptionDetails>
          The sm breakpoint (640px) triggers the grid layout. Below that, it's stacked.
        </DescriptionDetails>

        <DescriptionTerm>Why This Matters</DescriptionTerm>
        <DescriptionDetails>
          Mobile-first design that actually works. No content is hidden, just rearranged to fit the available space.
        </DescriptionDetails>
      </DescriptionList>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The responsive grid in action. Stacked on mobile, side-by-side on larger screens.',
      },
    },
  },
}
