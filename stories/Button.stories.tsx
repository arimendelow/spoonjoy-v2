import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { Heart, Plus, Trash2, ChefHat, Sparkles, Send, ArrowRight } from 'lucide-react'
import { Button } from '../app/components/ui/button'

/**
 * # Button
 *
 * Buttons. The unsung heroes of user interaction. Without them, your users would
 * just... stare at the screen. Possibly drool. Definitely not accomplish anything.
 *
 * Our Button component is built on HeadlessUI and comes in more flavors than a
 * Baskin-Robbins. You've got **solid colors** (21 of them, because we're extra),
 * **outline** for when you want to be subtle about it, and **plain** for when
 * even borders are too much commitment.
 *
 * ## The Three Laws of Buttonics
 *
 * 1. A button may not confuse a user, or through inaction, allow a user to become confused
 * 2. A button must respond to clicks given by users, except where such response would conflict with the First Law
 * 3. A button must look good, as long as such styling does not conflict with the First or Second Law
 *
 * ## Features
 *
 * - **21 color variants** - More colors than your average rainbow
 * - **Outline & Plain modes** - For the minimalists among us
 * - **Icon support** - Because sometimes words aren't enough
 * - **Link mode** - It's a button! No wait, it's a link! It's both!
 * - **Touch-friendly** - 44×44px touch targets, because fingers are fat
 * - **Dark mode support** - For the night owls and the dramatically inclined
 */
const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Buttons. The unsung heroes of user interaction. Without them, your users would just... stare at the screen.

Built on HeadlessUI with 21 color variants, outline & plain modes, icon support, and automatic touch target expansion.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: [
        'dark/zinc', 'light', 'dark/white', 'dark', 'white', 'zinc',
        'indigo', 'cyan', 'red', 'orange', 'amber', 'yellow', 'lime',
        'green', 'emerald', 'teal', 'sky', 'blue', 'violet', 'purple',
        'fuchsia', 'pink', 'rose',
      ],
      description: 'The color variant. Only applies to solid buttons.',
    },
    outline: {
      control: 'boolean',
      description: 'Renders an outline-style button. Cannot be combined with color or plain.',
    },
    plain: {
      control: 'boolean',
      description: 'Renders a plain button with no border. Cannot be combined with color or outline.',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button. Users will be sad.',
    },
    href: {
      control: 'text',
      description: 'If provided, renders as a link. Surprise!',
    },
    children: {
      control: 'text',
      description: 'The button content. Usually text, but we don\'t judge.',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// BASIC STORIES
// =============================================================================

/**
 * The default button. Simple. Elegant. Gets the job done.
 * Like a good cup of coffee, it doesn't need to be fancy.
 */
export const Default: Story = {
  args: {
    children: 'Click me',
  },
}

/**
 * When you want your button to blend in with the cool kids.
 * Outline buttons say "I'm here, but I'm not trying too hard."
 */
export const Outline: Story = {
  args: {
    outline: true,
    children: 'Outline Button',
  },
}

/**
 * For the Marie Kondo enthusiasts. Does this button spark joy?
 * It doesn't even have a border. Pure minimalism.
 */
export const Plain: Story = {
  args: {
    plain: true,
    children: 'Plain Button',
  },
}

// =============================================================================
// COLOR VARIANTS
// =============================================================================

/**
 * ## The Color Palette
 *
 * We've got 21 colors. TWENTY-ONE. That's more than most people can name.
 * Here they all are, in their full chromatic glory.
 *
 * Pro tip: Use colors with intention. Red for danger, green for success,
 * and indigo when you want to feel fancy.
 */
export const AllColors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 max-w-4xl">
      <Button color="dark/zinc">dark/zinc (default)</Button>
      <Button color="light">light</Button>
      <Button color="dark/white">dark/white</Button>
      <Button color="dark">dark</Button>
      <Button color="white">white</Button>
      <Button color="zinc">zinc</Button>
      <Button color="indigo">indigo</Button>
      <Button color="cyan">cyan</Button>
      <Button color="red">red</Button>
      <Button color="orange">orange</Button>
      <Button color="amber">amber</Button>
      <Button color="yellow">yellow</Button>
      <Button color="lime">lime</Button>
      <Button color="green">green</Button>
      <Button color="emerald">emerald</Button>
      <Button color="teal">teal</Button>
      <Button color="sky">sky</Button>
      <Button color="blue">blue</Button>
      <Button color="violet">violet</Button>
      <Button color="purple">purple</Button>
      <Button color="fuchsia">fuchsia</Button>
      <Button color="pink">pink</Button>
      <Button color="rose">rose</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All 21 color variants. Yes, we counted. Twice.',
      },
    },
  },
}

/**
 * The classics. Like a little black dress, but for buttons.
 */
export const NeutralColors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button color="dark/zinc">dark/zinc</Button>
      <Button color="light">light</Button>
      <Button color="dark/white">dark/white</Button>
      <Button color="dark">dark</Button>
      <Button color="white">white</Button>
      <Button color="zinc">zinc</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Neutral colors for when you want to keep it classy.',
      },
    },
  },
}

/**
 * For when you need to get someone's attention. Like a fire alarm,
 * but prettier and less likely to cause evacuation.
 */
export const WarmColors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button color="red">red</Button>
      <Button color="orange">orange</Button>
      <Button color="amber">amber</Button>
      <Button color="yellow">yellow</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Warm colors. Use red for destructive actions, because users respect the danger noodle.',
      },
    },
  },
}

/**
 * Calming, professional, and unlikely to cause panic.
 * Perfect for "Submit" buttons that won't delete anything important.
 */
export const CoolColors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button color="lime">lime</Button>
      <Button color="green">green</Button>
      <Button color="emerald">emerald</Button>
      <Button color="teal">teal</Button>
      <Button color="cyan">cyan</Button>
      <Button color="sky">sky</Button>
      <Button color="blue">blue</Button>
      <Button color="indigo">indigo</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Cool colors. Green means go, blue means trust us.',
      },
    },
  },
}

/**
 * For when you're feeling whimsical. These colors say
 * "I take my work seriously, but not myself."
 */
export const VibrantColors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button color="violet">violet</Button>
      <Button color="purple">purple</Button>
      <Button color="fuchsia">fuchsia</Button>
      <Button color="pink">pink</Button>
      <Button color="rose">rose</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The fun colors. Use responsibly.',
      },
    },
  },
}

// =============================================================================
// STATES
// =============================================================================

/**
 * Sometimes you need to tell users "No, not yet" or "You can't do that."
 * Disabled buttons are like velvet ropes at a nightclub - they exist for a reason.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'You shall not pass',
  },
}

/**
 * All the ways to say "nope" - disabled states across different variants.
 */
export const DisabledVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button disabled>Solid Disabled</Button>
      <Button disabled color="indigo">Indigo Disabled</Button>
      <Button disabled color="red">Red Disabled</Button>
      <Button disabled outline>Outline Disabled</Button>
      <Button disabled plain>Plain Disabled</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Disabled buttons get 50% opacity. They\'re still there, just... less so.',
      },
    },
  },
}

// =============================================================================
// WITH ICONS
// =============================================================================

/**
 * Icons make everything better. It's science.
 *
 * Add `data-slot="icon"` to your icon and it'll automatically get
 * styled to match the button. Magic? No, just good engineering.
 */
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 items-center">
      <Button color="red">
        <Trash2 data-slot="icon" />
        Delete
      </Button>
      <Button color="green">
        <Plus data-slot="icon" />
        Add Recipe
      </Button>
      <Button color="pink">
        <Heart data-slot="icon" />
        Favorite
      </Button>
      <Button color="indigo">
        <ChefHat data-slot="icon" />
        Start Cooking
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Icons are automatically sized and colored. Just add `data-slot="icon"` and let the CSS do its thing.',
      },
    },
  },
}

/**
 * Trailing icons work too. Perfect for "Next" buttons or
 * anything that implies forward momentum.
 */
export const TrailingIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 items-center">
      <Button color="blue">
        Continue
        <ArrowRight data-slot="icon" />
      </Button>
      <Button color="indigo">
        Send
        <Send data-slot="icon" />
      </Button>
      <Button color="violet">
        Generate
        <Sparkles data-slot="icon" />
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Put the icon after the text for "onward and upward" vibes.',
      },
    },
  },
}

/**
 * Icon-only buttons. When words fail you, let the icons do the talking.
 */
export const IconOnly: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 items-center">
      <Button color="red" aria-label="Delete">
        <Trash2 data-slot="icon" />
      </Button>
      <Button color="pink" aria-label="Favorite">
        <Heart data-slot="icon" />
      </Button>
      <Button color="green" aria-label="Add">
        <Plus data-slot="icon" />
      </Button>
      <Button outline aria-label="Delete">
        <Trash2 data-slot="icon" />
      </Button>
      <Button plain aria-label="More options">
        <ChefHat data-slot="icon" />
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Icon-only buttons should always have an `aria-label`. Screen readers can\'t see icons.',
      },
    },
  },
}

// =============================================================================
// AS LINKS
// =============================================================================

/**
 * Plot twist: This button is actually a link.
 *
 * Pass an `href` prop and the Button transforms into an anchor tag,
 * maintaining all its good looks. It's like Clark Kent, but for UI components.
 */
export const AsLink: Story = {
  args: {
    href: '#',
    children: 'I\'m secretly a link',
  },
  parameters: {
    docs: {
      description: {
        story: 'Add `href` to render as a link. Same styling, different element. Accessibility win!',
      },
    },
  },
}

/**
 * Links in different outfits. Same link energy, different vibes.
 */
export const LinkVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 items-center">
      <Button href="#" color="indigo">Solid Link</Button>
      <Button href="#" outline>Outline Link</Button>
      <Button href="#" plain>Plain Link</Button>
      <Button href="#" color="blue">
        Learn More
        <ArrowRight data-slot="icon" />
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All button variants work as links. Use semantic HTML, kids.',
      },
    },
  },
}

// =============================================================================
// REAL-WORLD EXAMPLES
// =============================================================================

/**
 * A taste of how these buttons might look in the wild.
 * Because context is everything.
 */
export const RealWorldExamples: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      {/* Form actions */}
      <div className="p-4 border border-zinc-200 rounded-lg space-y-4 dark:border-zinc-700">
        <h3 className="font-semibold text-zinc-900 dark:text-white">Recipe Form</h3>
        <div className="flex gap-3 justify-end">
          <Button plain>Cancel</Button>
          <Button color="green">
            <Plus data-slot="icon" />
            Save Recipe
          </Button>
        </div>
      </div>

      {/* Destructive action */}
      <div className="p-4 border border-red-200 rounded-lg space-y-4 bg-red-50 dark:border-red-900 dark:bg-red-950">
        <h3 className="font-semibold text-red-900 dark:text-red-100">Danger Zone</h3>
        <p className="text-sm text-red-700 dark:text-red-300">
          This will permanently delete your recipe. No pressure.
        </p>
        <div className="flex gap-3">
          <Button outline>Keep it</Button>
          <Button color="red">
            <Trash2 data-slot="icon" />
            Delete Forever
          </Button>
        </div>
      </div>

      {/* Call to action */}
      <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg space-y-4">
        <h3 className="font-semibold text-white">Ready to cook?</h3>
        <Button color="white">
          <ChefHat data-slot="icon" />
          Start Your Culinary Journey
        </Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world usage patterns. Because seeing is believing.',
      },
    },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * This story includes a play function that tests click interactions.
 * Open the Interactions panel to see it in action!
 */
export const ClickInteraction: Story = {
  args: {
    children: 'Click me!',
    onClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Click me!' })

    // Verify button exists
    await expect(button).toBeInTheDocument()

    // Click the button
    await userEvent.click(button)

    // Verify onClick was called
    await expect(args.onClick).toHaveBeenCalledTimes(1)

    // Click again
    await userEvent.click(button)
    await expect(args.onClick).toHaveBeenCalledTimes(2)
  },
  parameters: {
    docs: {
      description: {
        story: 'Watch the Interactions panel to see the button being clicked programmatically. Robots are taking over!',
      },
    },
  },
}

/**
 * Testing that disabled buttons don't respond to clicks.
 * Because a disabled button that fires events is just a regular button with trust issues.
 */
export const DisabledInteraction: Story = {
  args: {
    children: 'Can\'t touch this',
    disabled: true,
    onClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: "Can't touch this" })

    // Verify button is disabled
    await expect(button).toBeDisabled()

    // Try to click (shouldn't do anything)
    await userEvent.click(button)

    // onClick should not have been called
    await expect(args.onClick).not.toHaveBeenCalled()
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled buttons ignore clicks. They\'re not being rude, they\'re just... disabled.',
      },
    },
  },
}

/**
 * Testing keyboard accessibility - buttons should respond to Enter and Space.
 */
export const KeyboardInteraction: Story = {
  args: {
    children: 'Press Enter or Space',
    onClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Press Enter or Space' })

    // Focus the button
    button.focus()
    await expect(button).toHaveFocus()

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
        story: 'Keyboard users are users too! Buttons respond to Enter and Space keys.',
      },
    },
  },
}

/**
 * Test that the focus outline appears correctly.
 */
export const FocusState: Story = {
  args: {
    children: 'Focus me',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Focus me' })

    // Tab to focus the button
    await userEvent.tab()

    // Verify button is focused
    await expect(button).toHaveFocus()
  },
  parameters: {
    docs: {
      description: {
        story: 'The focus ring appears when using keyboard navigation. Tab to see it!',
      },
    },
  },
}
