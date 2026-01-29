import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { ExternalLink, Mail, Github, ArrowUpRight, Download, FileText } from 'lucide-react'
import { Link } from '../app/components/ui/link'

/**
 * # Link
 *
 * Ah, the humble hyperlink. The web's original killer feature. The reason Tim
 * Berners-Lee is a knight and you're still arguing about whether to use underlines.
 *
 * This Link component wraps a standard `<a>` tag with HeadlessUI's `DataInteractive`
 * wrapper, which handles all the focus state magic that makes your links play nice
 * with HeadlessUI components. It's like putting a fancy tuxedo on a regular guy -
 * same person, classier entrance.
 *
 * ## Why This Exists
 *
 * You might be thinking "it's literally just an anchor tag with extra steps."
 * And you'd be right! But those extra steps matter:
 *
 * 1. **Focus management** - HeadlessUI's DataInteractive ensures proper focus states
 * 2. **Consistency** - One Link to rule them all, one Link to find them
 * 3. **Future-proofing** - When you integrate with React Router, you only change this file
 *
 * ## The TODO in the Room
 *
 * Yes, there's a TODO at the top of the component file. It's been there since the
 * beginning. It's become part of the family. We don't talk about the TODO.
 *
 * (Actually, it's a reminder to integrate with React Router's Link component for
 * client-side navigation. Currently this renders a standard anchor tag, which
 * causes full page reloads. The horror!)
 *
 * ## Usage Tips
 *
 * - Use descriptive link text ("Read the documentation" not "Click here")
 * - External links should indicate they open in a new tab
 * - Don't make links look like buttons unless they act like buttons
 * - When in doubt, underline it
 */
const meta: Meta<typeof Link> = {
  title: 'UI/Link',
  component: Link,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A Link component wrapped with HeadlessUI's DataInteractive for proper focus management.

Currently renders a standard anchor tag - integrate with your router's Link component for client-side navigation.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    href: {
      control: 'text',
      description: 'The destination URL. You know, where the link goes.',
    },
    target: {
      control: 'select',
      options: ['_self', '_blank', '_parent', '_top'],
      description: 'Where to open the link. _blank for new tabs, _self for masochists who hate their users.',
    },
    rel: {
      control: 'text',
      description: 'Link relationship. Use "noopener noreferrer" with target="_blank" to avoid security issues.',
    },
    children: {
      control: 'text',
      description: 'The link text. Make it descriptive. "Click here" is a crime against accessibility.',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes. Because the defaults are suggestions, not rules.',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// BASIC STORIES
// =============================================================================

/**
 * The default Link. No styling, no opinions, just pure navigation potential.
 * It's unstyled because styling is your job. We just provide the infrastructure.
 */
export const Default: Story = {
  args: {
    href: '#',
    children: 'A simple link',
  },
}

/**
 * Links with actual styling. Because unstyled links are just sad blue text
 * from the 90s.
 */
export const StyledLink: Story = {
  render: () => (
    <Link
      href="#"
      className="text-indigo-600 hover:text-indigo-800 underline underline-offset-2 dark:text-indigo-400 dark:hover:text-indigo-300"
    >
      A properly styled link
    </Link>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Add your own classes for colors, underlines, and hover states. The Link component is a blank canvas.',
      },
    },
  },
}

// =============================================================================
// EXTERNAL LINKS
// =============================================================================

/**
 * ## External Links
 *
 * When your link takes users outside your cozy little website, it's polite
 * to let them know. Visual indicators (icons) and proper attributes
 * (`target="_blank"` with `rel="noopener noreferrer"`) are table stakes.
 *
 * The `noopener noreferrer` bit prevents the new page from accessing your
 * `window.opener` object. It's a security thing. Just do it.
 */
export const ExternalLinkExample: Story = {
  render: () => (
    <Link
      href="https://github.com"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline underline-offset-2 dark:text-blue-400 dark:hover:text-blue-300"
    >
      Visit GitHub
      <ExternalLink className="h-4 w-4" aria-hidden="true" />
    </Link>
  ),
  parameters: {
    docs: {
      description: {
        story: 'External links should use `target="_blank"` and `rel="noopener noreferrer"` for security. Add an icon to indicate the link opens in a new tab.',
      },
    },
  },
}

/**
 * Various external link styles. Pick your poison.
 */
export const ExternalLinkVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Link
        href="https://github.com"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
      >
        <Github className="h-5 w-5" />
        GitHub
        <ArrowUpRight className="h-3 w-3" />
      </Link>

      <Link
        href="mailto:hello@example.com"
        className="inline-flex items-center gap-1.5 text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
      >
        <Mail className="h-5 w-5" />
        hello@example.com
      </Link>

      <Link
        href="https://docs.example.com"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 underline decoration-emerald-600/30 hover:decoration-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300"
      >
        <FileText className="h-4 w-4" />
        Documentation
        <ExternalLink className="h-3 w-3" />
      </Link>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different styles for different contexts. Icons help users understand what clicking will do.',
      },
    },
  },
}

// =============================================================================
// LINK PATTERNS
// =============================================================================

/**
 * ## Download Links
 *
 * When your link downloads a file instead of navigating somewhere,
 * the `download` attribute is your friend. You can even suggest a filename.
 */
export const DownloadLink: Story = {
  render: () => (
    <Link
      href="/recipe.pdf"
      download="grandmas-secret-recipe.pdf"
      className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-zinc-700 transition-colors dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200"
    >
      <Download className="h-4 w-4" />
      Download Recipe (PDF)
    </Link>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Use the `download` attribute to trigger file downloads. Style it like a button if it acts like one.',
      },
    },
  },
}

/**
 * ## Inline Links
 *
 * Links that live within paragraphs. The most common use case.
 * Make sure they're visually distinct from surrounding text.
 */
export const InlineLinks: Story = {
  render: () => (
    <p className="max-w-md text-zinc-700 dark:text-zinc-300">
      This is a paragraph with{' '}
      <Link
        href="#"
        className="text-indigo-600 hover:text-indigo-800 underline underline-offset-2 dark:text-indigo-400 dark:hover:text-indigo-300"
      >
        an inline link
      </Link>{' '}
      embedded within the text. Notice how it stands out while still feeling
      natural. There's also{' '}
      <Link
        href="#"
        className="text-indigo-600 hover:text-indigo-800 underline underline-offset-2 dark:text-indigo-400 dark:hover:text-indigo-300"
      >
        another link here
      </Link>{' '}
      for good measure.
    </p>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Links within text should be clearly distinguishable. Underlines are the gold standard.',
      },
    },
  },
}

/**
 * ## Navigation Links
 *
 * Links styled for navigation menus. Less ornate, more functional.
 */
export const NavigationLinks: Story = {
  render: () => (
    <nav className="flex gap-6">
      <Link
        href="#"
        className="text-zinc-600 hover:text-zinc-900 font-medium transition-colors dark:text-zinc-400 dark:hover:text-white"
      >
        Home
      </Link>
      <Link
        href="#"
        className="text-zinc-600 hover:text-zinc-900 font-medium transition-colors dark:text-zinc-400 dark:hover:text-white"
      >
        Recipes
      </Link>
      <Link
        href="#"
        className="text-zinc-600 hover:text-zinc-900 font-medium transition-colors dark:text-zinc-400 dark:hover:text-white"
      >
        Collections
      </Link>
      <Link
        href="#"
        className="text-zinc-900 font-medium border-b-2 border-indigo-500 dark:text-white"
        aria-current="page"
      >
        About
      </Link>
    </nav>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Navigation links are typically undecorated with hover states. Use `aria-current` to indicate the active page.',
      },
    },
  },
}

// =============================================================================
// COLOR VARIANTS
// =============================================================================

/**
 * ## Color Options
 *
 * Links can be any color, but some colors have meaning:
 * - Blue/Indigo: Standard, trusted, "I'm definitely a link"
 * - Green: Positive action, "this is good for you"
 * - Red: Danger zone, proceed with caution
 *
 * Choose wisely. Color is communication.
 */
export const ColorVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Link
        href="#"
        className="text-indigo-600 hover:text-indigo-800 underline dark:text-indigo-400 dark:hover:text-indigo-300"
      >
        Indigo link (default vibes)
      </Link>
      <Link
        href="#"
        className="text-blue-600 hover:text-blue-800 underline dark:text-blue-400 dark:hover:text-blue-300"
      >
        Blue link (classic internet)
      </Link>
      <Link
        href="#"
        className="text-emerald-600 hover:text-emerald-800 underline dark:text-emerald-400 dark:hover:text-emerald-300"
      >
        Emerald link (eco-friendly energy)
      </Link>
      <Link
        href="#"
        className="text-purple-600 hover:text-purple-800 underline dark:text-purple-400 dark:hover:text-purple-300"
      >
        Purple link (mysterious)
      </Link>
      <Link
        href="#"
        className="text-red-600 hover:text-red-800 underline dark:text-red-400 dark:hover:text-red-300"
      >
        Red link (danger zone)
      </Link>
      <Link
        href="#"
        className="text-zinc-600 hover:text-zinc-900 underline dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        Zinc link (neutral territory)
      </Link>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different colors for different contexts. Red for destructive actions, green for positive ones, blue for "I don\'t know, it\'s a link."',
      },
    },
  },
}

// =============================================================================
// UNDERLINE STYLES
// =============================================================================

/**
 * ## Underline Variations
 *
 * The Great Underline Debate: to underline or not to underline?
 * The answer is usually "underline," but here are your options.
 */
export const UnderlineStyles: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Link
        href="#"
        className="text-indigo-600 underline dark:text-indigo-400"
      >
        Always underlined (accessibility approved)
      </Link>

      <Link
        href="#"
        className="text-indigo-600 no-underline hover:underline dark:text-indigo-400"
      >
        Underline on hover (risky but acceptable)
      </Link>

      <Link
        href="#"
        className="text-indigo-600 underline decoration-dotted dark:text-indigo-400"
      >
        Dotted underline (for abbreviations or definitions)
      </Link>

      <Link
        href="#"
        className="text-indigo-600 underline decoration-wavy dark:text-indigo-400"
      >
        Wavy underline (whimsical, use sparingly)
      </Link>

      <Link
        href="#"
        className="text-indigo-600 underline decoration-2 underline-offset-4 dark:text-indigo-400"
      >
        Thick underline with offset (chunky but charming)
      </Link>

      <Link
        href="#"
        className="text-indigo-600 underline decoration-indigo-300 hover:decoration-indigo-600 dark:text-indigo-400 dark:decoration-indigo-700 dark:hover:decoration-indigo-400"
      >
        Subtle underline that intensifies on hover (sophisticated)
      </Link>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tailwind provides endless underline customization. Use your powers responsibly.',
      },
    },
  },
}

// =============================================================================
// REAL-WORLD EXAMPLES
// =============================================================================

/**
 * ## Footer Links
 *
 * Links as they might appear in a site footer. Typically more subdued,
 * organized in groups, and including the legally-required nonsense.
 */
export const FooterLinks: Story = {
  render: () => (
    <footer className="p-8 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
      <div className="grid grid-cols-3 gap-8">
        <div className="space-y-3">
          <h4 className="font-semibold text-zinc-900 dark:text-white">Product</h4>
          <div className="flex flex-col gap-2">
            <Link href="#" className="text-zinc-600 hover:text-zinc-900 text-sm dark:text-zinc-400 dark:hover:text-white">
              Features
            </Link>
            <Link href="#" className="text-zinc-600 hover:text-zinc-900 text-sm dark:text-zinc-400 dark:hover:text-white">
              Pricing
            </Link>
            <Link href="#" className="text-zinc-600 hover:text-zinc-900 text-sm dark:text-zinc-400 dark:hover:text-white">
              Changelog
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-zinc-900 dark:text-white">Company</h4>
          <div className="flex flex-col gap-2">
            <Link href="#" className="text-zinc-600 hover:text-zinc-900 text-sm dark:text-zinc-400 dark:hover:text-white">
              About
            </Link>
            <Link href="#" className="text-zinc-600 hover:text-zinc-900 text-sm dark:text-zinc-400 dark:hover:text-white">
              Blog
            </Link>
            <Link href="#" className="text-zinc-600 hover:text-zinc-900 text-sm dark:text-zinc-400 dark:hover:text-white">
              Careers
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-zinc-900 dark:text-white">Legal</h4>
          <div className="flex flex-col gap-2">
            <Link href="#" className="text-zinc-600 hover:text-zinc-900 text-sm dark:text-zinc-400 dark:hover:text-white">
              Privacy Policy
            </Link>
            <Link href="#" className="text-zinc-600 hover:text-zinc-900 text-sm dark:text-zinc-400 dark:hover:text-white">
              Terms of Service
            </Link>
            <Link href="#" className="text-zinc-600 hover:text-zinc-900 text-sm dark:text-zinc-400 dark:hover:text-white">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Footer links are typically smaller, less colorful, and grouped by category. The legal section is mandatory (thanks, lawyers).',
      },
    },
  },
}

/**
 * ## Card with Links
 *
 * A recipe card showing how links work in context.
 * The whole card could be a link, or just specific elements.
 */
export const CardWithLinks: Story = {
  render: () => (
    <div className="max-w-sm p-6 bg-white border border-zinc-200 rounded-xl shadow-sm dark:bg-zinc-800 dark:border-zinc-700">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
        <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">
          Spicy Thai Basil Chicken
        </Link>
      </h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
        A quick weeknight dinner that packs a punch. Ready in 20 minutes.
      </p>
      <div className="flex items-center gap-4 text-sm">
        <Link
          href="#"
          className="text-indigo-600 hover:text-indigo-800 font-medium dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          View Recipe
        </Link>
        <Link
          href="#"
          className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
        >
          Save for Later
        </Link>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Links within cards. The title is often a link to the full content.',
      },
    },
  },
}

/**
 * ## Breadcrumb Navigation
 *
 * Links as breadcrumbs. Because users need to know where they are
 * and how to get back to civilization.
 */
export const BreadcrumbLinks: Story = {
  render: () => (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
      <Link href="#" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
        Home
      </Link>
      <span className="text-zinc-400" aria-hidden="true">/</span>
      <Link href="#" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
        Recipes
      </Link>
      <span className="text-zinc-400" aria-hidden="true">/</span>
      <Link href="#" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
        Thai Cuisine
      </Link>
      <span className="text-zinc-400" aria-hidden="true">/</span>
      <span className="text-zinc-900 font-medium dark:text-white" aria-current="page">
        Pad Thai
      </span>
    </nav>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Breadcrumbs help users understand their location. The current page isn\'t a link - you\'re already there.',
      },
    },
  },
}

// =============================================================================
// ACCESSIBILITY
// =============================================================================

/**
 * ## Screen Reader Friendly
 *
 * When your link text isn't descriptive enough, aria-label to the rescue.
 * "Read more" is useless without context. "Read more about pad thai recipe"? Chef's kiss.
 */
export const AccessibleLinks: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <article className="space-y-2">
        <h3 className="font-semibold text-zinc-900 dark:text-white">Grandma's Cookies</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          The secret family recipe, finally revealed to the world.
        </p>
        <Link
          href="#"
          aria-label="Read more about Grandma's Cookies recipe"
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium dark:text-indigo-400"
        >
          Read more &rarr;
        </Link>
      </article>

      <article className="space-y-2">
        <h3 className="font-semibold text-zinc-900 dark:text-white">Sourdough Starter</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          How to create and maintain your very own fermented friend.
        </p>
        <Link
          href="#"
          aria-label="Read more about Sourdough Starter guide"
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium dark:text-indigo-400"
        >
          Read more &rarr;
        </Link>
      </article>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Use `aria-label` when link text alone isn\'t descriptive enough. Screen reader users will thank you.',
      },
    },
  },
}

/**
 * ## Skip Links
 *
 * Skip links let keyboard users jump past navigation to the main content.
 * They're invisible until focused. It's accessibility magic.
 */
export const SkipLink: Story = {
  render: () => (
    <div className="relative">
      <Link
        href="#main-content"
        className="absolute left-0 top-0 -translate-y-full focus:translate-y-0 bg-indigo-600 text-white px-4 py-2 font-medium transition-transform z-50"
      >
        Skip to main content
      </Link>
      <nav className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Tab to reveal the skip link above. It appears on focus and lets keyboard
          users bypass repetitive navigation.
        </p>
      </nav>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Skip links are hidden until focused. Tab into this story to see it appear.',
      },
    },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Testing that links can be focused via keyboard.
 * Because some people don't use mice. Shocking, we know.
 */
export const KeyboardNavigation: Story = {
  render: () => (
    <div className="flex gap-4">
      <Link href="#" className="text-indigo-600 hover:text-indigo-800 underline dark:text-indigo-400">
        First Link
      </Link>
      <Link href="#" className="text-indigo-600 hover:text-indigo-800 underline dark:text-indigo-400">
        Second Link
      </Link>
      <Link href="#" className="text-indigo-600 hover:text-indigo-800 underline dark:text-indigo-400">
        Third Link
      </Link>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Tab to first link
    await userEvent.tab()
    const firstLink = canvas.getByText('First Link')
    await expect(firstLink).toHaveFocus()

    // Tab to second link
    await userEvent.tab()
    const secondLink = canvas.getByText('Second Link')
    await expect(secondLink).toHaveFocus()

    // Tab to third link
    await userEvent.tab()
    const thirdLink = canvas.getByText('Third Link')
    await expect(thirdLink).toHaveFocus()
  },
  parameters: {
    docs: {
      description: {
        story: 'Links are focusable via Tab key. Watch the Interactions panel to see keyboard navigation in action.',
      },
    },
  },
}

/**
 * Verify that links have the correct attributes for external navigation.
 */
export const ExternalLinkAttributes: Story = {
  render: () => (
    <Link
      href="https://example.com"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400"
    >
      External site
      <ExternalLink className="h-4 w-4" />
    </Link>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const link = canvas.getByRole('link', { name: /external site/i })

    // Verify external link attributes
    await expect(link).toHaveAttribute('href', 'https://example.com')
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  },
  parameters: {
    docs: {
      description: {
        story: 'External links should have proper security attributes. The test verifies `target="_blank"` and `rel="noopener noreferrer"` are present.',
      },
    },
  },
}

/**
 * Test that links are rendered with the correct role.
 */
export const LinkRole: Story = {
  args: {
    href: '#',
    children: 'I am definitely a link',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const link = canvas.getByRole('link', { name: 'I am definitely a link' })

    await expect(link).toBeInTheDocument()
    await expect(link).toHaveAttribute('href', '#')
  },
  parameters: {
    docs: {
      description: {
        story: 'Links have the implicit role of "link". This test confirms the component renders as an accessible link.',
      },
    },
  },
}

// =============================================================================
// EDGE CASES
// =============================================================================

/**
 * ## Anchor Links
 *
 * Links that jump to sections on the same page.
 * The humble hash link, still doing its job after all these years.
 */
export const AnchorLinks: Story = {
  render: () => (
    <div className="space-y-4">
      <nav className="flex gap-4 text-sm">
        <Link href="#ingredients" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">
          Ingredients
        </Link>
        <Link href="#instructions" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">
          Instructions
        </Link>
        <Link href="#notes" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">
          Chef's Notes
        </Link>
      </nav>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        These links navigate to sections within the same page using fragment identifiers (#).
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Anchor links use `#fragment` hrefs to jump to page sections.',
      },
    },
  },
}

/**
 * Links that wrap multiple lines. The underline should continue
 * across the entire text, not break awkwardly.
 */
export const MultilineLink: Story = {
  render: () => (
    <div className="max-w-xs">
      <Link
        href="#"
        className="text-indigo-600 hover:text-indigo-800 underline dark:text-indigo-400"
      >
        This is a very long link that will wrap to multiple lines to test how
        the styling handles text that doesn't fit on a single line
      </Link>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Long links wrap naturally. The underline continues across all lines.',
      },
    },
  },
}

/**
 * ## Links with Complex Content
 *
 * Links can contain more than just text. Images, icons, even
 * entire card layouts can be wrapped in a link.
 */
export const ComplexContent: Story = {
  render: () => (
    <Link
      href="#"
      className="block p-4 border border-zinc-200 rounded-lg hover:border-indigo-500 hover:shadow-md transition-all dark:border-zinc-700 dark:hover:border-indigo-500"
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white text-2xl">
          🍜
        </div>
        <div>
          <h4 className="font-semibold text-zinc-900 dark:text-white">
            Homemade Ramen
          </h4>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Rich, savory, and worth the effort
          </p>
        </div>
      </div>
    </Link>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Links can wrap complex content. The entire card becomes clickable.',
      },
    },
  },
}

/**
 * What happens when you give a link an empty href?
 * It's still technically a link, but it goes nowhere. Philosophical.
 */
export const EmptyHref: Story = {
  render: () => (
    <div className="space-y-2">
      <Link
        href=""
        className="text-indigo-600 underline dark:text-indigo-400"
      >
        Link with empty href (stays on current page)
      </Link>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        An empty href reloads the current page. It's valid but usually not what you want.
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Empty href links reload the current page. Use `href="#"` to prevent navigation, or just use a button.',
      },
    },
  },
}
