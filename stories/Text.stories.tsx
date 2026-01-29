import type { Meta, StoryObj } from '@storybook/react-vite'
import { Text, TextLink, Strong, Code } from '../app/components/ui/text'

/**
 * # Text
 *
 * The humble paragraph. The workhorse of content. While Headings strut around
 * demanding attention and Buttons beg to be clicked, Text just... sits there.
 * Being readable. Conveying information. Not asking for much.
 *
 * But don't let its modest nature fool you. This little `<p>` tag is doing
 * heavy lifting: proper line height for readability, muted colors that don't
 * compete with your flashy UI elements, and responsive sizing because mobile
 * users deserve nice things too.
 *
 * ## The Text Extended Universe
 *
 * This file exports four components, because sometimes text needs accessories:
 *
 * - **Text** - Your standard paragraph. The plain yogurt of typography.
 * - **TextLink** - For when you need to send users somewhere else
 * - **Strong** - When you need to **emphasize** something
 * - **Code** - For `technical snippets` that need to look technical
 *
 * ## Design Philosophy
 *
 * Text is deliberately understated. It uses zinc-500 (zinc-400 in dark mode)
 * because body copy shouldn't scream at users. Save the high contrast for
 * headings and interactive elements. Your eyes will thank you after reading
 * that 3000-word recipe backstory about someone's grandmother.
 *
 * ## Accessibility Notes
 *
 * - Base text is 16px on mobile, 14px on larger screens
 * - Line height of 1.5 (24px/16px) ensures comfortable reading
 * - Color contrast meets WCAG AA for both light and dark modes
 * - Links are underlined because users shouldn't have to guess what's clickable
 */
const meta: Meta<typeof Text> = {
  title: 'UI/Text',
  component: Text,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Body text components for readable, accessible content. Includes Text, TextLink, Strong, and Code variants.

The foundation of any good UI is readable text. These components ensure your content looks good and is accessible.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes for customization.',
    },
    children: {
      control: 'text',
      description: 'The text content. Revolutionary, we know.',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// BASIC TEXT STORIES
// =============================================================================

/**
 * The default Text component. Simple, readable, and refreshingly unpretentious.
 *
 * This is what most of your content will look like. Embrace the mundane.
 */
export const Default: Story = {
  args: {
    children: 'This is a paragraph of text. It conveys information without demanding attention.',
  },
}

/**
 * A more realistic example with actual content.
 * Because "lorem ipsum" is so 1500s.
 */
export const Paragraph: Story = {
  render: () => (
    <Text>
      Welcome to Spoonjoy, where we believe that cooking should be fun, accessible,
      and maybe just a little bit chaotic. Whether you're a seasoned chef or someone
      who considers cereal a "meal," we've got recipes for you.
    </Text>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A typical paragraph with actual readable content.',
      },
    },
  },
}

/**
 * Multiple paragraphs showing proper spacing.
 * Text components know how to behave in groups.
 */
export const MultipleParagraphs: Story = {
  render: () => (
    <div className="space-y-4 max-w-prose">
      <Text>
        Cooking is an act of love. Or desperation. Sometimes both. The important
        thing is that you're making an effort to feed yourself or others, and
        that's genuinely admirable.
      </Text>
      <Text>
        This platform exists because we got tired of scrolling through 3000-word
        essays about someone's life story just to find out how many cups of flour
        go in a cookie recipe. (It's usually two. You're welcome.)
      </Text>
      <Text>
        So we built something better. Recipes without the fluff. Instructions that
        actually make sense. And yes, we still let you write backstories if you
        want to, but we put them where they belong: at the bottom.
      </Text>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple paragraphs with proper spacing. The space-y-4 utility keeps things tidy.',
      },
    },
  },
}

// =============================================================================
// TEXTLINK STORIES
// =============================================================================

/**
 * ## TextLink
 *
 * Links within text. They're underlined because we believe in honesty.
 *
 * None of that "blue text that might be a link but also might just be
 * decorative" nonsense. Our links are clearly links. Click them.
 */
export const LinkDefault: Story = {
  render: () => (
    <Text>
      Learn more about our <TextLink href="#">privacy policy</TextLink> or{' '}
      <TextLink href="#">terms of service</TextLink>. We promise they're not
      terrifying.
    </Text>
  ),
  parameters: {
    docs: {
      description: {
        story: 'TextLink provides styled links within body text. Underlined for clarity.',
      },
    },
  },
}

/**
 * Links with hover states. The underline gets bolder on hover because
 * feedback is important and users need validation.
 */
export const LinkHoverDemo: Story = {
  render: () => (
    <div className="space-y-4 max-w-prose">
      <Text>
        Hover over this <TextLink href="#">link</TextLink> to see the underline
        become more prominent. It's subtle, but satisfying.
      </Text>
      <Text>
        You can also check out our <TextLink href="#">recipe collection</TextLink>,
        read the <TextLink href="#">FAQ</TextLink>, or visit our{' '}
        <TextLink href="#">GitHub repository</TextLink> if you're into that sort
        of thing.
      </Text>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Hover states provide visual feedback. Try hovering over the links.',
      },
    },
  },
}

// =============================================================================
// STRONG STORIES
// =============================================================================

/**
 * ## Strong
 *
 * For when you need to **emphasize** something. Strong text is bolder and
 * uses a darker color to stand out from the surrounding content.
 *
 * Use it sparingly. If everything is bold, nothing is bold.
 */
export const StrongDefault: Story = {
  render: () => (
    <Text>
      This recipe is <Strong>gluten-free</Strong> and <Strong>vegan</Strong>,
      making it perfect for dinner parties where you don't know everyone's
      dietary restrictions.
    </Text>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Strong provides semantic emphasis with visual weight.',
      },
    },
  },
}

/**
 * Strong text in context. Notice how it draws the eye to important information
 * without being obnoxious about it.
 */
export const StrongInContext: Story = {
  render: () => (
    <div className="space-y-4 max-w-prose">
      <Text>
        <Strong>Important:</Strong> Preheat your oven to 350°F before starting.
        Yes, actually do this. We know you usually skip this step.
      </Text>
      <Text>
        The secret ingredient is <Strong>love</Strong>. Just kidding, it's
        <Strong> butter</Strong>. The secret ingredient is always butter.
      </Text>
      <Text>
        Please note that cooking times may vary based on your oven.
        <Strong> Do not</Strong> trust the timer blindly. Use your senses.
        That's why you have them.
      </Text>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Strong text draws attention to key information within paragraphs.',
      },
    },
  },
}

// =============================================================================
// CODE STORIES
// =============================================================================

/**
 * ## Code
 *
 * For inline code snippets. Because sometimes you need to talk about
 * `technical things` in a way that looks technical.
 *
 * Features a subtle background, border, and monospace font. It whispers
 * "I'm code" without shouting.
 */
export const CodeDefault: Story = {
  render: () => (
    <Text>
      Run <Code>npm install</Code> to install dependencies, then{' '}
      <Code>npm run dev</Code> to start the development server.
    </Text>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Code provides inline code styling with a subtle background and monospace font.',
      },
    },
  },
}

/**
 * Code in various contexts. From file paths to environment variables,
 * this component makes technical content readable.
 */
export const CodeVariations: Story = {
  render: () => (
    <div className="space-y-4 max-w-prose">
      <Text>
        The configuration file is located at <Code>~/.config/spoonjoy/settings.json</Code>.
        Don't worry, we create it automatically.
      </Text>
      <Text>
        Set <Code>NODE_ENV=production</Code> when deploying to production.
        Or don't. We're not your parents.
      </Text>
      <Text>
        The API endpoint is <Code>/api/v1/recipes</Code> and accepts both{' '}
        <Code>GET</Code> and <Code>POST</Code> requests.
      </Text>
      <Text>
        If you see <Code>Error: ENOENT</Code>, it means a file is missing.
        Check your paths. Then check them again.
      </Text>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Code works great for file paths, commands, environment variables, and technical terms.',
      },
    },
  },
}

// =============================================================================
// COMBINED USAGE
// =============================================================================

/**
 * ## All Together Now
 *
 * The real power comes from combining these components. Text with links,
 * emphasis, and code snippets working in harmony. Like a well-rehearsed
 * orchestra, but for typography.
 */
export const CombinedUsage: Story = {
  render: () => (
    <div className="space-y-4 max-w-prose">
      <Text>
        <Strong>Getting Started:</Strong> First, clone the repository using{' '}
        <Code>git clone</Code>, then follow the instructions in the{' '}
        <TextLink href="#">setup guide</TextLink>. If you run into issues,
        check the <TextLink href="#">troubleshooting page</TextLink>.
      </Text>
      <Text>
        The <Code>prisma/schema.prisma</Code> file defines your database models.
        <Strong> Do not</Strong> edit this file unless you know what you're doing.
        And by "know what you're doing," we mean you've read the{' '}
        <TextLink href="#">Prisma documentation</TextLink> at least twice.
      </Text>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Text, TextLink, Strong, and Code working together in perfect harmony.',
      },
    },
  },
}

// =============================================================================
// REAL-WORLD EXAMPLES
// =============================================================================

/**
 * ## Recipe Context
 *
 * Here's how these text components might appear in an actual recipe.
 * Because context is everything.
 */
export const RecipeContext: Story = {
  render: () => (
    <article className="max-w-prose space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
          Grandma's Secret Chocolate Chip Cookies
        </h2>
        <Text>
          These cookies are <Strong>dangerously good</Strong>. The recipe has been
          in our family for generations, passed down from grandmother to grandchild
          with the sacred instruction: <Strong>never</Strong> share it online.
          We're doing it anyway.
        </Text>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Pro Tips</h3>
        <Text>
          For extra gooey cookies, refrigerate the dough for at least{' '}
          <Strong>24 hours</Strong> before baking. Yes, we know that requires
          patience. Consider it character building.
        </Text>
        <Text>
          Don't have brown sugar? Check out our{' '}
          <TextLink href="#">substitution guide</TextLink> for alternatives. Spoiler:
          you can make it with white sugar and molasses.
        </Text>
      </div>

      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 dark:bg-amber-950 dark:border-amber-800">
        <Text className="text-amber-800 dark:text-amber-200">
          <Strong>Chef's Note:</Strong> If your cookies spread too thin, your
          butter was too warm. Let it come to room temperature naturally, not in
          the microwave. The microwave is a liar.
        </Text>
      </div>
    </article>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Text components in a realistic recipe context.',
      },
    },
  },
}

/**
 * ## Technical Documentation
 *
 * Text components work great for documentation too.
 * Clear, readable, and professional-ish.
 */
export const TechnicalDocs: Story = {
  render: () => (
    <article className="max-w-prose space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
          Database Configuration
        </h2>
        <Text>
          This project uses <Strong>Prisma</Strong> with a D1 adapter for production
          and SQLite for local development. The database schema is defined in{' '}
          <Code>prisma/schema.prisma</Code>.
        </Text>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
          Running Migrations
        </h3>
        <Text>
          To create a new migration, run <Code>npx prisma migrate dev</Code> in
          your terminal. This will prompt you for a migration name and apply
          changes to your local database.
        </Text>
        <Text>
          <Strong>Warning:</Strong> Running migrations in production requires
          additional steps. See the{' '}
          <TextLink href="#">deployment guide</TextLink> for details.
        </Text>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
          Environment Variables
        </h3>
        <Text>
          Set <Code>DATABASE_URL</Code> in your <Code>.env</Code> file to configure
          the database connection. For local development, use{' '}
          <Code>file:./dev.db</Code>. For production, this will be provided by
          Cloudflare automatically.
        </Text>
      </div>
    </article>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Technical documentation using Text, Code, Strong, and TextLink.',
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
 * Need different colors? We've got className support.
 * Though honestly, the defaults are pretty great.
 */
export const CustomStyling: Story = {
  render: () => (
    <div className="space-y-4 max-w-prose">
      <Text className="text-emerald-600 dark:text-emerald-400">
        Success! Your recipe has been saved. Go forth and cook.
      </Text>
      <Text className="text-red-600 dark:text-red-400">
        Error: Something went wrong. But don't worry, your data is safe. Probably.
      </Text>
      <Text className="text-amber-600 dark:text-amber-400">
        Warning: This recipe contains nuts. And also opinions about pineapple on pizza.
      </Text>
      <Text className="text-sm">
        Fine print: By using this recipe, you agree that the chef is not responsible
        for any culinary disasters that may occur.
      </Text>
      <Text className="text-lg">
        Larger text for when you really need to make a point about portion sizes.
      </Text>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Custom classes can override colors, sizes, and other styles.',
      },
    },
  },
}

// =============================================================================
// EDGE CASES
// =============================================================================

/**
 * Long content that wraps naturally. The line height ensures
 * comfortable reading even with dense paragraphs.
 */
export const LongContent: Story = {
  render: () => (
    <div className="max-w-md">
      <Text>
        This is an extremely long paragraph that's designed to test how the Text
        component handles wrapping. It contains multiple sentences that flow together,
        creating the kind of dense content block that users might encounter when
        reading detailed instructions or lengthy descriptions. The line height is
        set to ensure that even when lines wrap, the text remains comfortable to
        read without feeling cramped or overwhelming. Notice how the spacing between
        lines creates a pleasant reading rhythm that guides your eye from one line
        to the next. This is typography doing its job.
      </Text>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Long paragraphs wrap naturally with comfortable line height.',
      },
    },
  },
}

/**
 * Empty Text component. Valid, but why would you do this?
 */
export const EmptyText: Story = {
  render: () => (
    <div className="p-4 border border-dashed border-zinc-300 rounded dark:border-zinc-600">
      <Text>{''}</Text>
      <p className="text-sm text-zinc-500 mt-2">
        An empty Text component. It renders, but contributes nothing. Like that
        one file in your codebase that nobody remembers creating.
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Empty Text components render empty paragraphs. Why? That\'s your business.',
      },
    },
  },
}

/**
 * Special characters and escaped content.
 * React handles this safely, because security matters.
 */
export const SpecialContent: Story = {
  render: () => (
    <div className="space-y-4 max-w-prose">
      <Text>
        Cooking temperature: 350°F (175°C) — that's Fahrenheit and Celsius for our
        international friends.
      </Text>
      <Text>
        Price: $19.99 per serving • Serves 4–6 people • Ready in ~30 minutes
      </Text>
      <Text>
        {"Special characters like <, >, &, and \"quotes\" render safely."}
      </Text>
      <Text>
        {'<script>alert("nice try")</script>'} — React escapes this automatically.
      </Text>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Special characters and potential XSS attempts are safely escaped.',
      },
    },
  },
}

// =============================================================================
// SEMANTIC STRUCTURE
// =============================================================================

/**
 * ## Proper Document Structure
 *
 * Text components with headings create proper semantic structure.
 * Screen readers and SEO bots appreciate this attention to detail.
 */
export const DocumentStructure: Story = {
  render: () => (
    <article className="max-w-prose space-y-8">
      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
          About Spoonjoy
        </h2>
        <Text>
          We're a recipe platform built by people who were tired of the status quo.
          No life stories before recipes. No pop-up ads. No dark patterns.
        </Text>
        <Text>
          Just good food, well documented, with a dash of personality. That's the
          Spoonjoy promise.
        </Text>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
          Our Mission
        </h2>
        <Text>
          To make cooking <Strong>accessible</Strong>, <Strong>enjoyable</Strong>,
          and maybe even a little <Strong>fun</Strong>. Whether you're a beginner
          learning to boil water or a seasoned chef looking for inspiration, we've
          got something for you.
        </Text>
        <Text>
          Read more about our story on the <TextLink href="#">About page</TextLink>,
          or jump straight into the <TextLink href="#">recipe collection</TextLink>.
        </Text>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
          Technical Details
        </h2>
        <Text>
          Spoonjoy is built with <Code>React Router v7</Code>, deployed on{' '}
          <Code>Cloudflare Pages</Code>, and uses <Code>D1</Code> for the database.
          It's fast, it's modern, and it doesn't track you.
        </Text>
      </section>
    </article>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Proper semantic structure with headings and Text components.',
      },
    },
  },
}
