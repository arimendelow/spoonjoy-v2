import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { Avatar, AvatarButton } from '../app/components/ui/avatar'

/**
 * # Avatar
 *
 * The humble avatar. A tiny circle (or square, if you're feeling edgy) that
 * represents a human being in all their complex, multifaceted glory. Because
 * nothing says "I contain multitudes" like a 40px circle with your initials.
 *
 * Avatars are the digital equivalent of name tags at a conference. They help
 * users recognize "oh, that's the person who posted the controversial take on
 * cilantro" without reading every username.
 *
 * ## The Avatar Philosophy
 *
 * A good avatar should:
 * - **Be recognizable** - Users should spot their own face (or initials) instantly
 * - **Degrade gracefully** - No photo? Show initials. No initials? Show... a sad void
 * - **Scale appropriately** - From tiny comment indicators to profile page heroes
 *
 * ## Components
 *
 * - **Avatar** - The static version. It just sits there, looking pretty.
 * - **AvatarButton** - For when you need to click on someone's face. Opens profiles,
 *   menus, or existential dread.
 *
 * ## The Great Round vs Square Debate
 *
 * - **Round (default)** - Classic. Friendly. Says "I'm a person, not a robot."
 * - **Square** - Modern. Edgy. Says "I'm a person, but I have opinions about design."
 */
const meta: Meta<typeof Avatar> = {
  title: 'UI/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Avatars represent users in the UI. Show an image when available, fall back to initials when not.

Supports both circular and square variants, clickable versions for navigation, and graceful degradation when images fail to load.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    src: {
      control: 'text',
      description: 'URL of the avatar image. When unavailable, falls back to initials.',
    },
    initials: {
      control: 'text',
      description: 'Text to show when no image is available. Keep it short (1-2 chars).',
    },
    square: {
      control: 'boolean',
      description: 'Use a square shape instead of circular. For the non-conformists.',
    },
    alt: {
      control: 'text',
      description: 'Alt text for accessibility. Describe the person, not the pixel arrangement.',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes. Size the avatar here (e.g., size-8, size-12).',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Sample avatar images (using UI Faces-style placeholders)
const sampleImages = {
  chef: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&h=100&fit=crop&crop=face',
  woman: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
  man: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  baker: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=100&h=100&fit=crop&crop=face',
}

// =============================================================================
// BASIC STORIES
// =============================================================================

/**
 * The default avatar with initials. No photo? No problem. Just throw some
 * letters in a circle and call it a day.
 */
export const Default: Story = {
  args: {
    initials: 'AM',
    className: 'size-10',
  },
}

/**
 * An avatar with an actual photo. Fancy! This is the ideal state—when users
 * actually upload a picture instead of leaving the default.
 */
export const WithImage: Story = {
  args: {
    src: sampleImages.woman,
    alt: 'Sarah Johnson',
    className: 'size-10',
  },
  parameters: {
    docs: {
      description: {
        story: 'An avatar with a real photo. The way it\'s meant to be used.',
      },
    },
  },
}

/**
 * The initials fallback. When users are too shy (or lazy) to upload a photo,
 * their initials step up to represent them.
 */
export const InitialsFallback: Story = {
  args: {
    initials: 'JD',
    alt: 'John Doe',
    className: 'size-10',
  },
  parameters: {
    docs: {
      description: {
        story: 'When no image is available, initials save the day. Usually 1-2 characters.',
      },
    },
  },
}

// =============================================================================
// SIZES
// =============================================================================

/**
 * ## Size Variations
 *
 * Avatars come in whatever size you want. Just slap a Tailwind size class on
 * there. The component doesn't judge.
 *
 * - **size-6 (24px)** - For dense UIs, comment threads, typing indicators
 * - **size-8 (32px)** - Compact lists, navigation items
 * - **size-10 (40px)** - Standard size for most contexts
 * - **size-12 (48px)** - Cards, slightly more prominent displays
 * - **size-16 (64px)** - Profile sections, user details
 * - **size-24 (96px)** - Profile pages, "look at me!" moments
 */
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <div className="flex flex-col items-center gap-1">
        <Avatar initials="XS" className="size-6" />
        <span className="text-xs text-zinc-500">6</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Avatar initials="SM" className="size-8" />
        <span className="text-xs text-zinc-500">8</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Avatar initials="MD" className="size-10" />
        <span className="text-xs text-zinc-500">10</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Avatar initials="LG" className="size-12" />
        <span className="text-xs text-zinc-500">12</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Avatar initials="XL" className="size-16" />
        <span className="text-xs text-zinc-500">16</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Avatar initials="2X" className="size-24" />
        <span className="text-xs text-zinc-500">24</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Size is controlled via className. Go from "who\'s that?" to "BEHOLD!" with Tailwind.',
      },
    },
  },
}

/**
 * The same sizes, but with actual photos. Because initials are cute,
 * but faces are better for recognition.
 */
export const AllSizesWithImages: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <div className="flex flex-col items-center gap-1">
        <Avatar src={sampleImages.woman} alt="User" className="size-6" />
        <span className="text-xs text-zinc-500">6</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Avatar src={sampleImages.man} alt="User" className="size-8" />
        <span className="text-xs text-zinc-500">8</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Avatar src={sampleImages.chef} alt="User" className="size-10" />
        <span className="text-xs text-zinc-500">10</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Avatar src={sampleImages.baker} alt="User" className="size-12" />
        <span className="text-xs text-zinc-500">12</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Avatar src={sampleImages.woman} alt="User" className="size-16" />
        <span className="text-xs text-zinc-500">16</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Avatar src={sampleImages.man} alt="User" className="size-24" />
        <span className="text-xs text-zinc-500">24</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Photographic avatars at various sizes. Images scale beautifully.',
      },
    },
  },
}

// =============================================================================
// SHAPES
// =============================================================================

/**
 * ## Round vs Square
 *
 * The eternal debate. Circles feel friendlier and more human. Squares feel
 * more modern and app-like. Choose based on your brand's personality.
 *
 * (Just kidding, your designer already chose for you.)
 */
export const RoundVsSquare: Story = {
  render: () => (
    <div className="flex gap-8">
      <div className="flex flex-col items-center gap-2">
        <Avatar initials="RD" className="size-12" />
        <span className="text-sm text-zinc-500">Round</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Avatar initials="SQ" square className="size-12" />
        <span className="text-sm text-zinc-500">Square</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Round is the default. Set `square={true}` to join the square club.',
      },
    },
  },
}

/**
 * Square avatars with images. Some platforms use these for groups, organizations,
 * or bots. Or maybe they just like rectangles.
 */
export const SquareWithImages: Story = {
  render: () => (
    <div className="flex gap-4">
      <Avatar src={sampleImages.chef} square alt="Chef Mike" className="size-12" />
      <Avatar src={sampleImages.woman} square alt="Sarah J" className="size-12" />
      <Avatar src={sampleImages.man} square alt="John D" className="size-12" />
      <Avatar src={sampleImages.baker} square alt="Baker Sue" className="size-12" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Square avatars work great with photos too. The corners get a subtle radius.',
      },
    },
  },
}

// =============================================================================
// AVATAR BUTTON
// =============================================================================

/**
 * ## AvatarButton
 *
 * For when clicking on someone's face should do something. Opens a menu,
 * navigates to a profile, or triggers an existential crisis about why
 * we click on tiny circles to interact with humans.
 *
 * Can be a button (for actions) or a link (for navigation).
 */
export const ButtonVariant: Story = {
  render: () => (
    <div className="flex gap-4">
      <AvatarButton initials="CK" className="size-10" />
      <AvatarButton src={sampleImages.woman} alt="View profile" className="size-10" />
      <AvatarButton src={sampleImages.man} square alt="View profile" className="size-10" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'AvatarButton wraps Avatar with a clickable touch target. Hover to see the effect.',
      },
    },
  },
}

/**
 * AvatarButton as a link. Semantically correct navigation to profile pages.
 */
export const AsLink: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <AvatarButton href="#" src={sampleImages.chef} alt="Chef Mike's profile" className="size-10" />
      <span className="text-sm text-zinc-600 dark:text-zinc-400">Click to visit profile</span>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Pass `href` to render as a link. Perfect for navigation to user profiles.',
      },
    },
  },
}

// =============================================================================
// REAL-WORLD EXAMPLES
// =============================================================================

/**
 * ## Comment Thread
 *
 * Avatars in their natural habitat: a comment section where people
 * argue about whether pineapple belongs on pizza. (It does. Fight me.)
 */
export const CommentThread: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <div className="flex gap-3">
        <Avatar src={sampleImages.chef} alt="Chef Mike" className="size-8 shrink-0" />
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-white">Chef Mike</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            This recipe changed my life. Well, at least my lunch.
          </p>
        </div>
      </div>
      <div className="flex gap-3 ml-8">
        <Avatar initials="SJ" className="size-8 shrink-0" />
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-white">Sarah J</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Same! Though I substituted 5 ingredients. Still counts, right?
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <Avatar src={sampleImages.man} alt="John D" className="size-8 shrink-0" />
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-white">John D</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            I burned it. Still delicious. 10/10 would burn again.
          </p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A classic comment thread. Mix of photos and initials, because not everyone uploads a picture.',
      },
    },
  },
}

/**
 * ## User Profile Header
 *
 * The big hero moment for avatars. This is where they get to be large and in charge.
 */
export const ProfileHeader: Story = {
  render: () => (
    <div className="flex items-center gap-4 p-4 border border-zinc-200 rounded-lg dark:border-zinc-700">
      <AvatarButton href="#" src={sampleImages.chef} alt="Chef Mike" className="size-16" />
      <div>
        <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Chef Mike</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Professional Recipe Ruiner</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">42 recipes · 1.2k followers</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Profile headers call for larger avatars. This is their time to shine.',
      },
    },
  },
}

/**
 * ## Recipe Attribution
 *
 * Small avatars for showing who created a recipe. Because credit where credit's due.
 */
export const RecipeAttribution: Story = {
  render: () => (
    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
      <span>Recipe by</span>
      <AvatarButton href="#" src={sampleImages.baker} alt="Baker Sue" className="size-6" />
      <span className="font-medium text-zinc-900 dark:text-white">Baker Sue</span>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tiny avatars for inline attribution. Small but mighty.',
      },
    },
  },
}

/**
 * ## Avatar Stack
 *
 * Multiple people worked on this recipe? Show them all in a compact stack.
 * Common for collaborative features or showing who liked/saved something.
 */
export const AvatarStack: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Contributors:</p>
        <div className="flex -space-x-2">
          <Avatar src={sampleImages.chef} alt="Chef Mike" className="size-8 ring-2 ring-white dark:ring-zinc-900" />
          <Avatar src={sampleImages.woman} alt="Sarah J" className="size-8 ring-2 ring-white dark:ring-zinc-900" />
          <Avatar src={sampleImages.man} alt="John D" className="size-8 ring-2 ring-white dark:ring-zinc-900" />
          <Avatar initials="+5" className="size-8 ring-2 ring-white dark:ring-zinc-900 bg-zinc-200 dark:bg-zinc-700" />
        </div>
      </div>
      <div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Saved by:</p>
        <div className="flex -space-x-1">
          <Avatar src={sampleImages.baker} alt="User" className="size-6 ring-2 ring-white dark:ring-zinc-900" />
          <Avatar initials="AK" className="size-6 ring-2 ring-white dark:ring-zinc-900" />
          <Avatar src={sampleImages.woman} alt="User" className="size-6 ring-2 ring-white dark:ring-zinc-900" />
          <Avatar initials="+12" className="size-6 ring-2 ring-white dark:ring-zinc-900 bg-zinc-200 dark:bg-zinc-700" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Avatar stacks for showing multiple users. Use negative margin and ring for the overlapping effect.',
      },
    },
  },
}

/**
 * ## Navigation Menu
 *
 * A common pattern: clickable avatar in the navigation that opens a user menu.
 */
export const NavigationExample: Story = {
  render: () => (
    <div className="flex items-center justify-between p-4 border border-zinc-200 rounded-lg dark:border-zinc-700 min-w-80">
      <span className="font-semibold text-zinc-900 dark:text-white">Spoonjoy</span>
      <AvatarButton src={sampleImages.woman} alt="Open user menu" className="size-8" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The classic nav bar avatar. Click to access your profile, settings, or log out.',
      },
    },
  },
}

// =============================================================================
// EDGE CASES
// =============================================================================

/**
 * ## Long Initials
 *
 * Someone named "Alexandra Bartholomew-Worthington III" wants their initials
 * shown. What do you do? Ideally, keep it to 1-2 characters.
 */
export const LongInitials: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Avatar initials="A" className="size-10" />
      <Avatar initials="AB" className="size-10" />
      <Avatar initials="ABC" className="size-10" />
      <Avatar initials="ABCD" className="size-10" />
      <span className="text-sm text-zinc-500 dark:text-zinc-400">
        (Stick to 1-2 characters. Please.)
      </span>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'More than 2 initials gets cramped. Abbreviate wisely.',
      },
    },
  },
}

/**
 * ## Empty Avatar
 *
 * No image, no initials. The avatar equivalent of ghosting.
 * Technically valid, visually sad.
 */
export const EmptyAvatar: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar className="size-10" />
      <span className="text-sm text-zinc-500 dark:text-zinc-400">
        The empty avatar. It exists. That's about it.
      </span>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'An avatar with neither image nor initials. A hollow shell. Don\'t do this.',
      },
    },
  },
}

/**
 * ## Broken Image
 *
 * What happens when the image URL is invalid? The component shows
 * whatever initials you provided as a fallback. Always provide initials!
 */
export const BrokenImage: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar
        src="https://this-url-definitely-does-not-exist.fake/image.jpg"
        initials="FB"
        alt="Fallback example"
        className="size-10"
      />
      <span className="text-sm text-zinc-500 dark:text-zinc-400">
        Image failed? Initials to the rescue!
      </span>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'When images fail, initials appear underneath. Always provide initials as backup.',
      },
    },
  },
}

/**
 * ## Various Colors via Background
 *
 * Want colored avatar backgrounds? Add a background color class.
 * Great for distinguishing users or teams.
 */
export const ColoredBackgrounds: Story = {
  render: () => (
    <div className="flex gap-3">
      <Avatar initials="AM" className="size-10 bg-red-500 text-white" />
      <Avatar initials="BN" className="size-10 bg-orange-500 text-white" />
      <Avatar initials="CO" className="size-10 bg-amber-500 text-white" />
      <Avatar initials="DP" className="size-10 bg-green-500 text-white" />
      <Avatar initials="EQ" className="size-10 bg-blue-500 text-white" />
      <Avatar initials="FR" className="size-10 bg-purple-500 text-white" />
      <Avatar initials="GS" className="size-10 bg-pink-500 text-white" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Add background colors via className. Deterministic colors based on user ID? Chef\'s kiss.',
      },
    },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Testing AvatarButton click interactions.
 * Because faces deserve to be clicked. Wait, that came out wrong.
 */
export const ClickInteraction: Story = {
  render: (args) => <AvatarButton {...args} initials="CK" className="size-10" />,
  args: {
    onClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const avatar = canvas.getByRole('button')

    // Verify avatar button exists
    await expect(avatar).toBeInTheDocument()

    // Click the avatar
    await userEvent.click(avatar)

    // Verify onClick was called
    await expect(args.onClick).toHaveBeenCalledTimes(1)

    // Click again
    await userEvent.click(avatar)
    await expect(args.onClick).toHaveBeenCalledTimes(2)
  },
  parameters: {
    docs: {
      description: {
        story: 'AvatarButton responds to clicks. Watch the Interactions panel for the robot clicking faces.',
      },
    },
  },
}

/**
 * Testing keyboard accessibility.
 * Because not everyone uses a mouse, and avatars should be inclusive.
 */
export const KeyboardInteraction: Story = {
  render: (args) => <AvatarButton {...args} initials="KB" className="size-10" />,
  args: {
    onClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const avatar = canvas.getByRole('button')

    // Focus the avatar
    avatar.focus()
    await expect(avatar).toHaveFocus()

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
        story: 'AvatarButton responds to Enter and Space keys. Accessibility: it\'s not optional.',
      },
    },
  },
}

/**
 * Testing focus states.
 * The focus ring should appear when tabbing to an AvatarButton.
 */
export const FocusState: Story = {
  render: () => <AvatarButton initials="FS" className="size-10" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const avatar = canvas.getByRole('button')

    // Tab to focus
    await userEvent.tab()

    // Verify focus
    await expect(avatar).toHaveFocus()
  },
  parameters: {
    docs: {
      description: {
        story: 'Focus ring appears on keyboard navigation. Tab to see it in action.',
      },
    },
  },
}
