import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within, waitFor } from 'storybook/test'
import { RecipeImageUpload } from '../../../app/components/recipe/RecipeImageUpload'

/**
 * # RecipeImageUpload
 *
 * A component for uploading and previewing recipe images.
 * Supports file picker, drag-and-drop (optional), preview, and clear functionality.
 *
 * ## Features
 *
 * - **File picker** - Click to select image from device
 * - **Preview** - Shows selected image before upload
 * - **Clear/Remove** - Remove selected or existing image
 * - **Validation** - Checks file type (images only) and size (max 5MB)
 * - **Accessible** - Proper labels, ARIA attributes, keyboard support
 *
 * ## Image Guidelines
 *
 * - Accepts: JPG, PNG, GIF, WebP
 * - Max size: 5MB
 * - Recommended: Square or 4:3 aspect ratio
 */
const meta: Meta<typeof RecipeImageUpload> = {
  title: 'Recipe/Input/RecipeImageUpload',
  component: RecipeImageUpload,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Upload component for recipe images. Adapted from the ProfilePhotoUpload pattern.

Preview area is larger than avatar (recipes need more visual space).
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onFileSelect: {
      action: 'fileSelected',
      description: 'Callback when a valid file is selected',
    },
    onClear: {
      action: 'cleared',
      description: 'Callback when the image is cleared/removed',
    },
    onValidationError: {
      action: 'validationError',
      description: 'Callback when file validation fails',
    },
    imageUrl: {
      control: 'text',
      description: 'URL of existing image to display',
    },
    alt: {
      control: 'text',
      description: 'Alt text for the image',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables all interactions',
    },
    loading: {
      control: 'boolean',
      description: 'Shows loading state',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// BASIC STORIES
// =============================================================================

/**
 * The default empty state. Ready for image upload.
 * Shows upload button and placeholder area.
 */
export const Default: Story = {
  args: {
    onFileSelect: fn(),
  },
}

/**
 * With an existing image URL.
 * Shows preview with "Change" and "Remove" buttons.
 */
export const WithImage: Story = {
  args: {
    onFileSelect: fn(),
    onClear: fn(),
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    alt: 'Fresh salad bowl',
  },
  parameters: {
    docs: {
      description: {
        story: 'When an image URL is provided, shows the preview with change/remove options.',
      },
    },
  },
}

/**
 * Disabled state - all interactions blocked.
 */
export const Disabled: Story = {
  args: {
    onFileSelect: fn(),
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Upload button is disabled. Used when form is submitting.',
      },
    },
  },
}

/**
 * Disabled with existing image.
 */
export const DisabledWithImage: Story = {
  args: {
    onFileSelect: fn(),
    onClear: fn(),
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Both change and remove buttons are disabled.',
      },
    },
  },
}

/**
 * Loading state - shows spinner, disables interactions.
 */
export const Loading: Story = {
  args: {
    onFileSelect: fn(),
    loading: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows loading indicator. Used while image is uploading to server.',
      },
    },
  },
}

/**
 * Error state - displays error message.
 */
export const WithError: Story = {
  args: {
    onFileSelect: fn(),
    error: 'File too large. Maximum size is 5MB.',
  },
  parameters: {
    docs: {
      description: {
        story: 'Error message displayed below the upload area.',
      },
    },
  },
}

/**
 * Error with existing image.
 */
export const ErrorWithImage: Story = {
  args: {
    onFileSelect: fn(),
    onClear: fn(),
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    error: 'Failed to save image. Please try again.',
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Test: Click upload button triggers file selection.
 */
export const ClickUpload: Story = {
  args: {
    onFileSelect: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const uploadButton = canvas.getByRole('button', { name: /upload/i })
    await expect(uploadButton).toBeInTheDocument()
    await expect(uploadButton).toBeEnabled()

    // Clicking would trigger file dialog - we just verify button is functional
    await userEvent.click(uploadButton)
  },
  parameters: {
    docs: {
      description: {
        story: 'Click the upload button to open file picker dialog.',
      },
    },
  },
}

/**
 * Test: Clear existing image.
 */
export const ClearImage: Story = {
  args: {
    onFileSelect: fn(),
    onClear: fn(),
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    // Find and click clear/remove button
    const clearButton = canvas.getByRole('button', { name: /clear|remove/i })
    await userEvent.click(clearButton)

    // Verify callback was called
    await expect(args.onClear).toHaveBeenCalled()
  },
  parameters: {
    docs: {
      description: {
        story: 'Click the remove button to clear the image.',
      },
    },
  },
}

/**
 * Test: Keyboard navigation.
 */
export const KeyboardNavigation: Story = {
  args: {
    onFileSelect: fn(),
    onClear: fn(),
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Tab to first button
    await userEvent.tab()
    const changeButton = canvas.getByRole('button', { name: /change/i })
    await expect(changeButton).toHaveFocus()

    // Tab to clear button
    await userEvent.tab()
    const clearButton = canvas.getByRole('button', { name: /clear|remove/i })
    await expect(clearButton).toHaveFocus()
  },
  parameters: {
    docs: {
      description: {
        story: 'Tab navigates through interactive elements.',
      },
    },
  },
}

/**
 * Test: Disabled prevents interaction.
 */
export const DisabledInteraction: Story = {
  args: {
    onFileSelect: fn(),
    onClear: fn(),
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    disabled: true,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    // Both buttons should be disabled
    const changeButton = canvas.getByRole('button', { name: /change/i })
    const clearButton = canvas.getByRole('button', { name: /clear|remove/i })

    await expect(changeButton).toBeDisabled()
    await expect(clearButton).toBeDisabled()

    // Click should not trigger callbacks
    await userEvent.click(clearButton)
    await expect(args.onClear).not.toHaveBeenCalled()
  },
  parameters: {
    docs: {
      description: {
        story: 'When disabled, buttons cannot be clicked.',
      },
    },
  },
}

// =============================================================================
// REAL-WORLD EXAMPLES
// =============================================================================

/**
 * Example: Chocolate cake recipe image.
 */
export const ExampleChocolateCake: Story = {
  args: {
    onFileSelect: fn(),
    onClear: fn(),
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
    alt: 'Chocolate cake with chocolate ganache',
  },
  parameters: {
    docs: {
      description: {
        story: 'A delicious chocolate cake - perfect recipe hero image.',
      },
    },
  },
}

/**
 * Example: Pasta dish recipe image.
 */
export const ExamplePasta: Story = {
  args: {
    onFileSelect: fn(),
    onClear: fn(),
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop',
    alt: 'Creamy pasta with herbs',
  },
  parameters: {
    docs: {
      description: {
        story: 'Fresh pasta - appetizing recipe header.',
      },
    },
  },
}

/**
 * Example: Empty state for new recipe.
 */
export const ExampleNewRecipe: Story = {
  args: {
    onFileSelect: fn(),
  },
  decorators: [
    (Story) => (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Create New Recipe</h2>
        <Story />
        <p className="text-sm text-zinc-500">
          Add a photo to make your recipe stand out!
        </p>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'How the upload appears in the context of creating a new recipe.',
      },
    },
  },
}

// =============================================================================
// EDGE CASES
// =============================================================================

/**
 * Very long alt text.
 */
export const LongAltText: Story = {
  args: {
    onFileSelect: fn(),
    onClear: fn(),
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    alt: 'A beautifully plated fresh garden salad with mixed greens, cherry tomatoes, cucumber slices, red onion, and a light vinaigrette dressing served in a white ceramic bowl',
  },
}

/**
 * Very long error message.
 */
export const LongErrorMessage: Story = {
  args: {
    onFileSelect: fn(),
    error: 'The file you selected (very-long-filename-that-goes-on-and-on.jpg) is too large at 15.7MB. Please select an image smaller than 5MB, or compress your image before uploading.',
  },
}
