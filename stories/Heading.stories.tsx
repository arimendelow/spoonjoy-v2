import type { Meta, StoryObj } from '@storybook/react-vite'
import { Heading, Subheading } from '../app/components/ui/heading'

/**
 * # Heading
 *
 * Typography. The silent conductor of your UI orchestra. While buttons get all the glory
 * and inputs hog the spotlight, headings are out here doing the thankless job of making
 * your content actually readable.
 *
 * Our Heading component is deceptively simple - it renders semantic heading elements
 * (`h1` through `h6`) while maintaining consistent styling. Because apparently browsers
 * decided in 1995 that each heading level should look wildly different, and we've been
 * fighting that decision ever since.
 *
 * ## The Heading Hierarchy
 *
 * Think of headings like a corporate org chart, except actually useful:
 *
 * - **h1**: The CEO. There should only be one per page. It's lonely at the top.
 * - **h2**: Department heads. The real workhorses of document structure.
 * - **h3-h6**: Middle management through interns. Important for organization, often overlooked.
 *
 * ## Why Two Components?
 *
 * We have `Heading` and `Subheading` because sometimes you need to **ANNOUNCE** something,
 * and sometimes you just need to quietly organize content. It's the difference between
 * a press release and a sticky note.
 *
 * ## Features
 *
 * - **Semantic HTML** - Screen readers rejoice, SEO improves, accessibility auditors smile
 * - **Dark mode** - Because headings need to brood sometimes too
 * - **Responsive sizing** - Slightly smaller on mobile, because screens are precious real estate
 * - **Custom className support** - For when our opinions aren't good enough
 */
const meta: Meta<typeof Heading> = {
  title: 'UI/Heading',
  component: Heading,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Headings. The unsung heroes of document structure. Without them, your page would just be an unorganized wall of text.

Two components: \`Heading\` for primary titles and \`Subheading\` for secondary ones. Both support levels 1-6.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    level: {
      control: { type: 'select' },
      options: [1, 2, 3, 4, 5, 6],
      description: 'The semantic heading level (h1-h6). Defaults to 1 for Heading, 2 for Subheading.',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes. For when you need to override our impeccable taste.',
    },
    children: {
      control: 'text',
      description: 'The heading text. Make it count.',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// BASIC HEADING STORIES
// =============================================================================

/**
 * The default Heading. Big, bold, and ready to make a statement.
 * Like walking into a room and immediately commanding attention.
 */
export const Default: Story = {
  args: {
    children: 'Welcome to Spoonjoy',
  },
}

/**
 * All six heading levels with the `Heading` component.
 *
 * Notice how they all look the same? That's intentional. We believe in
 * equal opportunity styling. The level only affects semantics, not appearance.
 *
 * "But wait," you say, "shouldn't h1 be bigger than h6?"
 * And we say, "Should it though? Or have we just been conditioned by
 * decades of browser defaults?"
 */
export const AllLevels: Story = {
  render: () => (
    <div className="space-y-4">
      <Heading level={1}>Level 1: The Big Cheese</Heading>
      <Heading level={2}>Level 2: The Vice President</Heading>
      <Heading level={3}>Level 3: Senior Manager</Heading>
      <Heading level={4}>Level 4: Team Lead</Heading>
      <Heading level={5}>Level 5: Individual Contributor</Heading>
      <Heading level={6}>Level 6: The Intern</Heading>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All heading levels render with the same visual style. The level is semantic, not visual.',
      },
    },
  },
}

// =============================================================================
// SUBHEADING STORIES
// =============================================================================

/**
 * Meet `Subheading` - the Heading's more modest sibling.
 *
 * Same semantic power, smaller visual footprint. Perfect for section titles,
 * card headers, or anywhere you need hierarchy without the drama.
 */
export const SubheadingDefault: Story = {
  render: () => <Subheading>Your Saved Recipes</Subheading>,
  parameters: {
    docs: {
      description: {
        story: 'Subheading defaults to level 2 and has a smaller, more understated appearance.',
      },
    },
  },
}

/**
 * Subheadings at every level. Like regular headings, but with less ego.
 */
export const SubheadingAllLevels: Story = {
  render: () => (
    <div className="space-y-3">
      <Subheading level={1}>Subheading Level 1</Subheading>
      <Subheading level={2}>Subheading Level 2 (default)</Subheading>
      <Subheading level={3}>Subheading Level 3</Subheading>
      <Subheading level={4}>Subheading Level 4</Subheading>
      <Subheading level={5}>Subheading Level 5</Subheading>
      <Subheading level={6}>Subheading Level 6</Subheading>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All subheading levels. Same visual style, different semantic meanings.',
      },
    },
  },
}

// =============================================================================
// COMPARISON
// =============================================================================

/**
 * ## Heading vs Subheading: A Tale of Two Components
 *
 * Side by side, so you can see the difference. Heading is the extrovert,
 * Subheading is the introvert. Both are valid life choices.
 */
export const Comparison: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="p-4 border border-zinc-200 rounded-lg dark:border-zinc-700">
        <Heading>This is a Heading</Heading>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Big energy. Main title vibes. The thing users see first.
        </p>
      </div>
      <div className="p-4 border border-zinc-200 rounded-lg dark:border-zinc-700">
        <Subheading>This is a Subheading</Subheading>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          More subtle. Section title energy. Organizes without overwhelming.
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Visual comparison between Heading and Subheading components.',
      },
    },
  },
}

// =============================================================================
// WITH CUSTOM CLASSES
// =============================================================================

/**
 * Sometimes you need to override our styling. We won't take it personally.
 * (We will, but we'll pretend we didn't.)
 *
 * Pass additional classes via `className` to customize colors, sizes,
 * or add that gradient text effect your designer is obsessed with.
 */
export const WithCustomClasses: Story = {
  render: () => (
    <div className="space-y-4">
      <Heading className="text-indigo-600 dark:text-indigo-400">
        Custom Indigo Heading
      </Heading>
      <Heading className="text-4xl">
        Extra Large Heading
      </Heading>
      <Heading className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Gradient Text Because Why Not
      </Heading>
      <Subheading className="text-emerald-600 dark:text-emerald-400">
        Custom Emerald Subheading
      </Subheading>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Custom classes are merged with defaults. Go wild, we believe in you.',
      },
    },
  },
}

// =============================================================================
// REAL-WORLD EXAMPLES
// =============================================================================

/**
 * Here's how headings might appear in the wild. Context is everything.
 */
export const RealWorldExamples: Story = {
  render: () => (
    <div className="space-y-8 max-w-2xl">
      {/* Recipe page header */}
      <div className="space-y-2">
        <Heading>Grandma's Famous Lasagna</Heading>
        <p className="text-zinc-600 dark:text-zinc-400">
          A family recipe passed down through generations. Prepare to be judged
          if you don't finish your plate.
        </p>
      </div>

      {/* Section within a page */}
      <div className="p-4 bg-zinc-50 rounded-lg dark:bg-zinc-800">
        <Subheading level={2}>Ingredients</Subheading>
        <ul className="mt-3 space-y-1 text-zinc-700 dark:text-zinc-300">
          <li>• 1 lb ground beef (or plant-based alternative)</li>
          <li>• 15 lasagna noodles</li>
          <li>• 2 cups ricotta cheese</li>
          <li>• Love (quantity: generous)</li>
        </ul>
      </div>

      {/* Card-style content */}
      <div className="p-4 border border-zinc-200 rounded-lg dark:border-zinc-700">
        <Subheading level={3}>Pro Tips</Subheading>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Let the lasagna rest for 10-15 minutes before cutting. We know you're
          hungry, but patience is a virtue. Also, it won't turn into lava soup.
        </p>
      </div>

      {/* Dashboard stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg text-white">
          <Subheading level={4} className="text-white/90">
            Recipes Created
          </Subheading>
          <p className="text-3xl font-bold mt-1">42</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg text-white">
          <Subheading level={4} className="text-white/90">
            Cooking Streak
          </Subheading>
          <p className="text-3xl font-bold mt-1">7 days</p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Headings in their natural habitat. From page titles to card headers.',
      },
    },
  },
}

// =============================================================================
// DOCUMENT STRUCTURE
// =============================================================================

/**
 * A properly structured document. The kind that makes accessibility
 * auditors weep with joy.
 *
 * Notice how we use different levels to create a clear hierarchy.
 * This is what screen reader users actually experience when navigating
 * your page. Be kind to them.
 */
export const DocumentStructure: Story = {
  render: () => (
    <article className="max-w-2xl space-y-6">
      <Heading level={1}>The Complete Guide to Making Toast</Heading>
      <p className="text-zinc-600 dark:text-zinc-400">
        A comprehensive tutorial for the culinary curious.
      </p>

      <section className="space-y-3">
        <Heading level={2}>Chapter 1: Understanding Your Toaster</Heading>
        <p className="text-zinc-600 dark:text-zinc-400">
          Before we toast, we must first understand the tools of our trade.
        </p>

        <Subheading level={3}>Types of Toasters</Subheading>
        <p className="text-zinc-600 dark:text-zinc-400">
          Pop-up, toaster oven, and the controversial open-flame method.
        </p>

        <Subheading level={3}>Safety Considerations</Subheading>
        <p className="text-zinc-600 dark:text-zinc-400">
          Don't stick a fork in it. We really can't stress this enough.
        </p>
      </section>

      <section className="space-y-3">
        <Heading level={2}>Chapter 2: The Perfect Slice</Heading>
        <p className="text-zinc-600 dark:text-zinc-400">
          Not all bread is created equal.
        </p>

        <Subheading level={3}>Bread Selection</Subheading>
        <p className="text-zinc-600 dark:text-zinc-400">
          Sourdough for the sophisticated, white bread for the nostalgic.
        </p>
      </section>
    </article>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Proper document structure using semantic heading levels. Your screen reader users will thank you.',
      },
    },
  },
}

// =============================================================================
// EDGE CASES
// =============================================================================

/**
 * Long headings. Because sometimes you have a lot to say.
 *
 * Headings should remain readable even when they wrap to multiple lines.
 * If your heading is this long though, maybe consider editing?
 */
export const LongContent: Story = {
  render: () => (
    <div className="max-w-md space-y-6">
      <Heading>
        This is an Exceptionally Long Heading That Will Definitely Need to Wrap
        to Multiple Lines on Most Screen Sizes
      </Heading>
      <Subheading>
        A subheading that also has quite a bit of text because sometimes
        section titles need more context than just a few words
      </Subheading>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Long headings wrap naturally. Line height is set to keep things readable.',
      },
    },
  },
}

/**
 * Empty headings. Not recommended, but we handle them gracefully.
 * Like that one coworker who never speaks in meetings.
 */
export const EmptyHeading: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="p-4 border border-dashed border-zinc-300 rounded dark:border-zinc-600">
        <Heading>{''}</Heading>
        <p className="text-sm text-zinc-500 mt-2">
          An empty Heading. It exists, but contributes nothing. We all know someone like this.
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Empty headings render an empty element. Valid HTML, questionable life choices.',
      },
    },
  },
}

/**
 * Headings with special characters and emoji (if you must).
 */
export const SpecialContent: Story = {
  render: () => (
    <div className="space-y-4">
      <Heading>Recipe #1: Mom's "Secret" Sauce</Heading>
      <Heading>Cooking with C++ (Don't @ Me)</Heading>
      <Heading>{'<script>alert("nice try")</script>'}</Heading>
      <Subheading>Price: $29.99 — Limited Time!</Subheading>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Special characters, quotes, and even attempted XSS render safely. React escapes everything.',
      },
    },
  },
}
