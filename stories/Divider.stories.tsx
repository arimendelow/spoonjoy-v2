import type { Meta, StoryObj } from '@storybook/react-vite'
import { Divider } from '../app/components/ui/divider'
import { Text } from '../app/components/ui/text'

/**
 * # Divider
 *
 * The unsung hero of UI design. The line that says "these things? not the same
 * as those things." It's a horizontal rule with opinions about opacity.
 *
 * While other components strut around with their colors, animations, and
 * interactive states, the Divider just... draws a line. Literally. And honestly?
 * That's enough. Sometimes the most powerful design element is a simple stroke
 * that says "I am a boundary. Respect me."
 *
 * ## Philosophy of Separation
 *
 * Dividers are the punctuation of visual design. They create rhythm, establish
 * hierarchy, and prevent your content from becoming an undifferentiated wall of
 * stuff. Without dividers, your UI is just a run-on sentence that never ends
 * kind of like this paragraph is starting to feel.
 *
 * ## The Soft Touch
 *
 * The `soft` prop gives you a more subtle divider. Use it for minor separations
 * within a section—when you need a whisper instead of a statement. Regular
 * dividers are for bigger breaks: between sections, after headers, before footers.
 *
 * ## A Note on Accessibility
 *
 * This Divider uses `role="presentation"` because it's purely decorative. Screen
 * readers will politely ignore it, which is exactly what we want. The content
 * structure should make sense without visual separators.
 */
const meta: Meta<typeof Divider> = {
  title: 'UI/Divider',
  component: Divider,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A horizontal divider for separating content sections. Comes in regular and soft variants.

The \`soft\` prop reduces the divider's opacity for more subtle separations. Use regular dividers between major sections, soft dividers for minor breaks within sections.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    soft: {
      control: 'boolean',
      description: 'Use a softer, more subtle divider. For when you want to whisper "separation" instead of shouting it.',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes for customization.',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// BASIC STORIES
// =============================================================================

/**
 * The default divider. A clean, confident line that says "these sections are
 * different and I'm not afraid to show it."
 */
export const Default: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    ),
  ],
}

/**
 * The soft divider. Same line, less attitude. Perfect for subtle separations
 * where you need structure without drama.
 *
 * Use soft dividers within sections. Think of them as the semicolons of visual
 * design; technically optional, but useful for the discerning designer.
 */
export const Soft: Story = {
  args: {
    soft: true,
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'A softer divider with reduced opacity. Subtle but present, like good background music.',
      },
    },
  },
}

// =============================================================================
// COMPARISON
// =============================================================================

/**
 * ## Side by Side
 *
 * Here's both variants together so you can see the difference. Regular dividers
 * are bolder, soft dividers are subtler. Revolutionary observations, we know.
 */
export const Comparison: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Regular:</p>
        <Divider />
      </div>
      <div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Soft:</p>
        <Divider soft />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Regular vs. soft dividers. The difference is subtle but meaningful.',
      },
    },
  },
}

// =============================================================================
// CONTEXTUAL USAGE
// =============================================================================

/**
 * ## Between Content Sections
 *
 * Dividers shine when separating distinct content areas. They tell users
 * "okay, that part is done, here comes something new."
 */
export const BetweenSections: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <div>
        <h3 className="font-semibold text-zinc-900 dark:text-white">Recipe Overview</h3>
        <Text>
          A quick weeknight pasta that comes together in 20 minutes. Perfect for
          when you're tired but still want something homemade.
        </Text>
      </div>

      <Divider />

      <div>
        <h3 className="font-semibold text-zinc-900 dark:text-white">Ingredients</h3>
        <Text>
          1 lb pasta, 3 cloves garlic, olive oil, red pepper flakes, parsley, and
          parmesan. That's it. Simple.
        </Text>
      </div>

      <Divider />

      <div>
        <h3 className="font-semibold text-zinc-900 dark:text-white">Instructions</h3>
        <Text>
          Boil pasta. Sauté garlic. Combine. Pretend you're a chef. Sprinkle parsley
          and call it "garnishing."
        </Text>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Regular dividers create clear breaks between major content sections.',
      },
    },
  },
}

/**
 * ## Within Lists
 *
 * Soft dividers work great between list items. They add structure without
 * making every item feel like a new section.
 */
export const WithinList: Story = {
  render: () => (
    <div className="max-w-md">
      <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Recent Recipes</h3>
      <ul className="space-y-0">
        <li className="py-3">
          <div className="font-medium text-zinc-900 dark:text-white">Garlic Butter Shrimp</div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">15 min • Easy</div>
        </li>
        <Divider soft />
        <li className="py-3">
          <div className="font-medium text-zinc-900 dark:text-white">Mushroom Risotto</div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">45 min • Medium</div>
        </li>
        <Divider soft />
        <li className="py-3">
          <div className="font-medium text-zinc-900 dark:text-white">Thai Green Curry</div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">30 min • Medium</div>
        </li>
        <Divider soft />
        <li className="py-3">
          <div className="font-medium text-zinc-900 dark:text-white">Chocolate Lava Cake</div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">25 min • Hard</div>
        </li>
      </ul>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Soft dividers between list items provide structure without heaviness.',
      },
    },
  },
}

/**
 * ## Card Separator
 *
 * Dividers inside cards help organize content without adding visual noise.
 * Soft is usually the right choice here.
 */
export const InCard: Story = {
  render: () => (
    <div className="max-w-sm rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        <div>
          <div className="font-medium text-zinc-900 dark:text-white">Julia Child</div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">Master Chef</div>
        </div>
      </div>

      <Divider soft className="my-4" />

      <Text>
        "The only time to eat diet food is while you're waiting for the steak to cook."
      </Text>

      <Divider soft className="my-4" />

      <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
        <span>142 recipes</span>
        <span>12.4k followers</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Soft dividers inside cards organize content without adding visual weight.',
      },
    },
  },
}

// =============================================================================
// REAL-WORLD EXAMPLES
// =============================================================================

/**
 * ## Recipe Page Layout
 *
 * Here's how dividers might appear on an actual recipe page. Notice the mix
 * of regular and soft dividers creating visual hierarchy.
 */
export const RecipePageExample: Story = {
  render: () => (
    <article className="max-w-lg space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Perfect Scrambled Eggs
        </h1>
        <Text>
          The secret to perfect scrambled eggs is patience and butter. Lots of butter.
        </Text>
      </header>

      <Divider />

      <section className="space-y-4">
        <h2 className="font-semibold text-zinc-900 dark:text-white">Ingredients</h2>
        <ul className="text-sm text-zinc-600 dark:text-zinc-300 space-y-1">
          <li>• 3 large eggs</li>
          <li>• 1 tablespoon butter</li>
          <li>• Salt and pepper to taste</li>
          <li>• 1 tablespoon heavy cream (optional, but not really)</li>
        </ul>
      </section>

      <Divider />

      <section className="space-y-4">
        <h2 className="font-semibold text-zinc-900 dark:text-white">Steps</h2>
        <div className="space-y-4">
          <div>
            <div className="font-medium text-zinc-900 dark:text-white">1. Prep</div>
            <Text>Crack eggs into a bowl. Don't get shell in there. We believe in you.</Text>
          </div>
          <Divider soft />
          <div>
            <div className="font-medium text-zinc-900 dark:text-white">2. Cook</div>
            <Text>Low heat. Seriously, lower than that. Stir constantly. Be patient.</Text>
          </div>
          <Divider soft />
          <div>
            <div className="font-medium text-zinc-900 dark:text-white">3. Serve</div>
            <Text>Remove from heat while still slightly wet. They'll finish cooking on the plate.</Text>
          </div>
        </div>
      </section>

      <Divider />

      <footer className="text-sm text-zinc-500 dark:text-zinc-400">
        Recipe by Gordon Ramsay, simplified for people who don't want to be yelled at
      </footer>
    </article>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A complete recipe page showing strategic use of regular and soft dividers.',
      },
    },
  },
}

/**
 * ## Settings Panel
 *
 * Dividers help organize settings into logical groups. Users can scan
 * the structure quickly thanks to clear visual boundaries.
 */
export const SettingsPanel: Story = {
  render: () => (
    <div className="max-w-sm space-y-4">
      <h2 className="font-semibold text-zinc-900 dark:text-white">Account Settings</h2>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-zinc-700 dark:text-zinc-300">Email notifications</span>
          <span className="text-sm text-zinc-500">On</span>
        </div>
        <Divider soft />
        <div className="flex justify-between items-center">
          <span className="text-zinc-700 dark:text-zinc-300">Recipe recommendations</span>
          <span className="text-sm text-zinc-500">On</span>
        </div>
        <Divider soft />
        <div className="flex justify-between items-center">
          <span className="text-zinc-700 dark:text-zinc-300">Weekly digest</span>
          <span className="text-sm text-zinc-500">Off</span>
        </div>
      </div>

      <Divider />

      <h2 className="font-semibold text-zinc-900 dark:text-white">Privacy</h2>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-zinc-700 dark:text-zinc-300">Profile visibility</span>
          <span className="text-sm text-zinc-500">Public</span>
        </div>
        <Divider soft />
        <div className="flex justify-between items-center">
          <span className="text-zinc-700 dark:text-zinc-300">Show activity status</span>
          <span className="text-sm text-zinc-500">On</span>
        </div>
      </div>

      <Divider />

      <div className="pt-2">
        <button className="text-red-600 dark:text-red-400 text-sm font-medium">
          Delete Account
        </button>
        <Text className="text-sm mt-1">
          This will permanently delete your account and all your recipes.
        </Text>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Settings panels use dividers to group related options. Soft for items, regular for groups.',
      },
    },
  },
}

// =============================================================================
// STYLING VARIATIONS
// =============================================================================

/**
 * ## Custom Width
 *
 * Dividers are full-width by default, but you can constrain them with
 * container classes or custom widths.
 */
export const CustomWidth: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Full width (default):</p>
        <Divider />
      </div>
      <div className="flex justify-center">
        <div className="w-1/2">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Half width (centered container):</p>
          <Divider />
        </div>
      </div>
      <div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Custom width (w-32):</p>
        <Divider className="w-32" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Control divider width through containers or custom classes.',
      },
    },
  },
}

/**
 * ## Custom Margins
 *
 * Add margin classes for custom spacing. The divider itself is just a line—
 * you control the whitespace around it.
 */
export const CustomMargins: Story = {
  render: () => (
    <div className="max-w-md">
      <Text>Content above the divider.</Text>
      <Divider className="my-8" />
      <Text>Content below the divider with extra spacing (my-8).</Text>
      <Divider className="my-2" />
      <Text>Content with tight spacing (my-2).</Text>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Use margin utilities to control spacing around dividers.',
      },
    },
  },
}

// =============================================================================
// EDGE CASES
// =============================================================================

/**
 * ## Multiple Consecutive Dividers
 *
 * Don't do this. But if you do, they'll stack. It looks intentional, like
 * some kind of minimalist art. Probably.
 */
export const ConsecutiveDividers: Story = {
  render: () => (
    <div className="max-w-md space-y-2">
      <Text>Three dividers in a row:</Text>
      <Divider />
      <Divider soft />
      <Divider />
      <Text>Why would you do this? We don't know. But you can.</Text>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple dividers stack as expected. An unusual choice, but technically valid.',
      },
    },
  },
}

/**
 * ## In Dark Containers
 *
 * Dividers adapt to their context. They look good on both light and dark
 * backgrounds thanks to careful color choices.
 */
export const DarkBackground: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="p-4 bg-white rounded-lg">
        <p className="text-sm text-zinc-600 mb-2">Light background:</p>
        <Divider />
        <p className="text-sm text-zinc-600 mt-2">Regular divider</p>
        <Divider soft className="mt-2" />
        <p className="text-sm text-zinc-600 mt-2">Soft divider</p>
      </div>
      <div className="p-4 bg-zinc-900 rounded-lg">
        <p className="text-sm text-zinc-400 mb-2">Dark background:</p>
        <Divider />
        <p className="text-sm text-zinc-400 mt-2">Regular divider</p>
        <Divider soft className="mt-2" />
        <p className="text-sm text-zinc-400 mt-2">Soft divider</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Dividers work on both light and dark backgrounds with appropriate contrast.',
      },
    },
  },
}

/**
 * ## Nested in Flexbox
 *
 * Dividers work fine in flex containers. They'll take up the full width
 * of their container, which in a flex context is determined by the layout.
 */
export const InFlexbox: Story = {
  render: () => (
    <div className="flex flex-col max-w-md">
      <div className="p-4 bg-zinc-100 dark:bg-zinc-800">Section 1</div>
      <Divider />
      <div className="p-4 bg-zinc-100 dark:bg-zinc-800">Section 2</div>
      <Divider soft />
      <div className="p-4 bg-zinc-100 dark:bg-zinc-800">Section 3</div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Dividers behave correctly in flex containers.',
      },
    },
  },
}
