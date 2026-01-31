import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn, expect, userEvent, within, waitFor } from 'storybook/test'
import { useState } from 'react'
import {
  shareContent,
  isNativeShareSupported,
  addToShoppingList,
  type ShareOptions,
  type ShareResult,
  type AddToListOptions,
  type AddToListResult,
} from '../app/components/navigation/quick-actions'
import { Share, ShoppingCart, Check, X, Clipboard, Link } from 'lucide-react'

/**
 * # QuickActions
 * 
 * Utility functions for common contextual actions in the dock.
 * Provides share functionality (native share API with clipboard fallback)
 * and shopping list integration.
 * 
 * ## Key Features
 * 
 * - **Share Content** - Native share API with clipboard fallback
 * - **Add to Shopping List** - Add recipe ingredients
 * - **Cross-browser support** - Graceful fallbacks
 * 
 * ## Usage
 * 
 * ```tsx
 * import { shareContent, addToShoppingList } from './quick-actions'
 * 
 * // Share a recipe
 * const result = await shareContent({
 *   title: 'Delicious Pasta',
 *   text: 'Check out this recipe!',
 *   url: 'https://spoonjoy.com/recipes/123',
 * })
 * 
 * // Add to shopping list
 * const result = await addToShoppingList({
 *   recipeId: '123',
 *   ingredientIds: ['ing-1', 'ing-2'],
 * })
 * ```
 */
const meta: Meta = {
  title: 'Navigation/QuickActions',
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#18181b' }],
    },
    docs: {
      description: {
        component: `
QuickActions provides utility functions for common dock actions like sharing
content and adding items to the shopping list.

These are pure functions (not React components) that can be called from
dock action handlers.
        `,
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj

// =============================================================================
// DEMO COMPONENTS
// =============================================================================

/**
 * Interactive demo component for shareContent
 */
function ShareDemo() {
  const [result, setResult] = useState<ShareResult | null>(null)
  const [loading, setLoading] = useState(false)
  const nativeSupported = isNativeShareSupported()

  const handleShare = async () => {
    setLoading(true)
    setResult(null)

    const shareOptions: ShareOptions = {
      title: 'Amazing Pasta Recipe',
      text: 'Check out this delicious pasta recipe from Spoonjoy!',
      url: 'https://spoonjoy.com/recipes/pasta-carbonara',
    }

    const shareResult = await shareContent(shareOptions)
    setResult(shareResult)
    setLoading(false)
  }

  return (
    <div className="bg-zinc-800 rounded-xl p-6 w-80 space-y-4">
      <div className="flex items-center gap-3">
        <Share className="h-6 w-6 text-white" />
        <h3 className="text-white font-semibold">Share Content</h3>
      </div>

      <div className="text-zinc-400 text-sm space-y-1">
        <p>Native Share API: {nativeSupported ? '✅ Supported' : '❌ Not supported'}</p>
        <p>Fallback: Clipboard copy</p>
      </div>

      <button
        onClick={handleShare}
        disabled={loading}
        className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
      >
        {loading ? (
          'Sharing...'
        ) : (
          <>
            <Share className="h-4 w-4" />
            Share Recipe
          </>
        )}
      </button>

      {result && (
        <div
          className={`p-3 rounded-lg flex items-center gap-2 ${
            result.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}
        >
          {result.success ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          <div>
            <p className="font-medium">{result.success ? 'Shared!' : 'Failed'}</p>
            <p className="text-xs opacity-80">
              Method: {result.method === 'native' ? 'Native Share' : 'Copied to Clipboard'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Interactive demo component for addToShoppingList
 */
function AddToListDemoComponent() {
  const [result, setResult] = useState<AddToListResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [ingredientCount, setIngredientCount] = useState(3)

  const handleAddToList = async () => {
    setLoading(true)
    setResult(null)

    const options: AddToListOptions = {
      recipeId: 'pasta-carbonara',
      ingredientIds: Array.from({ length: ingredientCount }, (_, i) => `ing-${i + 1}`),
    }

    const addResult = await addToShoppingList(options)
    setResult(addResult)
    setLoading(false)
  }

  return (
    <div className="bg-zinc-800 rounded-xl p-6 w-80 space-y-4">
      <div className="flex items-center gap-3">
        <ShoppingCart className="h-6 w-6 text-white" />
        <h3 className="text-white font-semibold">Add to Shopping List</h3>
      </div>

      <div className="space-y-2">
        <label className="text-zinc-400 text-sm">Ingredients to add:</label>
        <input
          type="number"
          min="0"
          max="10"
          value={ingredientCount}
          onChange={(e) => setIngredientCount(parseInt(e.target.value) || 0)}
          className="w-full bg-zinc-700 text-white px-3 py-2 rounded-lg"
        />
      </div>

      <button
        onClick={handleAddToList}
        disabled={loading}
        className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
      >
        {loading ? (
          'Adding...'
        ) : (
          <>
            <ShoppingCart className="h-4 w-4" />
            Add to List
          </>
        )}
      </button>

      {result && (
        <div
          className={`p-3 rounded-lg flex items-center gap-2 ${
            result.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}
        >
          {result.success ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          <div>
            <p className="font-medium">{result.success ? 'Added!' : 'Failed'}</p>
            <p className="text-xs opacity-80">
              {result.success
                ? `${result.itemsAdded} items added to list`
                : result.error || 'Unknown error'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// SHARE CONTENT STORIES
// =============================================================================

/**
 * Interactive share demo - test sharing content.
 */
export const ShareContentDemo: Story = {
  render: () => <ShareDemo />,
  parameters: {
    docs: {
      description: {
        story: `
Interactive demo of the shareContent function. Click the button to share.
- On mobile: Uses native share API
- On desktop: Falls back to clipboard copy
        `,
      },
    },
  },
}

/**
 * Share result states visualization
 */
export const ShareResultStates: Story = {
  render: () => (
    <div className="space-y-4">
      {/* Success - Native */}
      <div className="bg-zinc-800 rounded-xl p-4 w-80">
        <div className="flex items-center gap-2 mb-2">
          <Share className="h-4 w-4 text-white" />
          <span className="text-white font-medium">Native Share Success</span>
        </div>
        <div className="p-3 rounded-lg bg-green-500/20 text-green-400 flex items-center gap-2">
          <Check className="h-4 w-4" />
          <div>
            <p className="font-medium">Shared!</p>
            <p className="text-xs opacity-80">Method: Native Share</p>
          </div>
        </div>
      </div>

      {/* Success - Clipboard */}
      <div className="bg-zinc-800 rounded-xl p-4 w-80">
        <div className="flex items-center gap-2 mb-2">
          <Clipboard className="h-4 w-4 text-white" />
          <span className="text-white font-medium">Clipboard Fallback Success</span>
        </div>
        <div className="p-3 rounded-lg bg-green-500/20 text-green-400 flex items-center gap-2">
          <Check className="h-4 w-4" />
          <div>
            <p className="font-medium">Link Copied!</p>
            <p className="text-xs opacity-80">Method: Copied to Clipboard</p>
          </div>
        </div>
      </div>

      {/* Failure */}
      <div className="bg-zinc-800 rounded-xl p-4 w-80">
        <div className="flex items-center gap-2 mb-2">
          <X className="h-4 w-4 text-white" />
          <span className="text-white font-medium">Share Failed</span>
        </div>
        <div className="p-3 rounded-lg bg-red-500/20 text-red-400 flex items-center gap-2">
          <X className="h-4 w-4" />
          <div>
            <p className="font-medium">Failed to share</p>
            <p className="text-xs opacity-80">Unable to copy to clipboard</p>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Visual representation of all possible share result states.',
      },
    },
  },
}

// =============================================================================
// ADD TO LIST STORIES
// =============================================================================

/**
 * Interactive add to list demo
 */
export const AddToListDemo: Story = {
  render: () => <AddToListDemoComponent />,
  parameters: {
    docs: {
      description: {
        story: `
Interactive demo of the addToShoppingList function. 
Adjust the number of ingredients and click to add.
        `,
      },
    },
  },
}

/**
 * Add to list result states
 */
export const AddToListResultStates: Story = {
  render: () => (
    <div className="space-y-4">
      {/* Success - Multiple items */}
      <div className="bg-zinc-800 rounded-xl p-4 w-80">
        <div className="flex items-center gap-2 mb-2">
          <ShoppingCart className="h-4 w-4 text-white" />
          <span className="text-white font-medium">Multiple Items Added</span>
        </div>
        <div className="p-3 rounded-lg bg-green-500/20 text-green-400 flex items-center gap-2">
          <Check className="h-4 w-4" />
          <div>
            <p className="font-medium">Added!</p>
            <p className="text-xs opacity-80">5 items added to list</p>
          </div>
        </div>
      </div>

      {/* Success - Zero items (empty selection) */}
      <div className="bg-zinc-800 rounded-xl p-4 w-80">
        <div className="flex items-center gap-2 mb-2">
          <ShoppingCart className="h-4 w-4 text-white" />
          <span className="text-white font-medium">Empty Selection</span>
        </div>
        <div className="p-3 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center gap-2">
          <Check className="h-4 w-4" />
          <div>
            <p className="font-medium">No items selected</p>
            <p className="text-xs opacity-80">0 items added to list</p>
          </div>
        </div>
      </div>

      {/* Failure - Recipe not found */}
      <div className="bg-zinc-800 rounded-xl p-4 w-80">
        <div className="flex items-center gap-2 mb-2">
          <X className="h-4 w-4 text-white" />
          <span className="text-white font-medium">Recipe Not Found</span>
        </div>
        <div className="p-3 rounded-lg bg-red-500/20 text-red-400 flex items-center gap-2">
          <X className="h-4 w-4" />
          <div>
            <p className="font-medium">Failed</p>
            <p className="text-xs opacity-80">Recipe not found</p>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Visual representation of all possible add-to-list result states.',
      },
    },
  },
}

// =============================================================================
// COMBINED DEMO
// =============================================================================

/**
 * Both actions side by side
 */
export const AllActions: Story = {
  render: () => (
    <div className="flex gap-4">
      <ShareDemo />
      <AddToListDemoComponent />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Both quick actions side by side for comparison.',
      },
    },
  },
}

// =============================================================================
// FUNCTION TESTS
// =============================================================================

/**
 * Test the isNativeShareSupported function
 */
export const NativeShareDetection: Story = {
  render: () => {
    const supported = isNativeShareSupported()
    return (
      <div className="bg-zinc-800 rounded-xl p-6 w-80 space-y-4">
        <h3 className="text-white font-semibold">Native Share Detection</h3>
        <div
          className={`p-4 rounded-lg ${
            supported ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
          }`}
        >
          <p className="font-medium">
            {supported ? '✅ Native Share Supported' : '⚠️ Native Share Not Supported'}
          </p>
          <p className="text-sm opacity-80 mt-1">
            {supported
              ? 'This browser supports navigator.share()'
              : 'Will fall back to clipboard copy'}
          </p>
        </div>
        <p className="text-zinc-500 text-xs">
          Note: Native share is typically available on mobile browsers and some desktop browsers.
        </p>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows whether the current browser supports the native Web Share API.',
      },
    },
  },
}

/**
 * Test addToShoppingList with non-existent recipe
 */
export const AddToListErrorHandling: Story = {
  render: () => {
    const [results, setResults] = useState<Array<{ label: string; result: AddToListResult }>>([])

    const runTests = async () => {
      const tests = [
        { label: 'Valid recipe', options: { recipeId: 'valid-123' } },
        { label: 'Empty ingredientIds', options: { recipeId: 'valid-123', ingredientIds: [] } },
        { label: 'Non-existent recipe', options: { recipeId: 'non-existent' } },
        { label: 'Empty recipeId', options: { recipeId: '' } },
      ]

      const newResults: Array<{ label: string; result: AddToListResult }> = []
      for (const test of tests) {
        const result = await addToShoppingList(test.options)
        newResults.push({ label: test.label, result })
      }
      setResults(newResults)
    }

    return (
      <div className="bg-zinc-800 rounded-xl p-6 w-96 space-y-4">
        <h3 className="text-white font-semibold">Error Handling Tests</h3>
        <button
          onClick={runTests}
          className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg"
        >
          Run Tests
        </button>
        {results.length > 0 && (
          <div className="space-y-2">
            {results.map(({ label, result }) => (
              <div
                key={label}
                className={`p-2 rounded text-sm ${
                  result.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}
              >
                <span className="font-medium">{label}:</span>{' '}
                {result.success ? `✅ ${result.itemsAdded} items` : `❌ ${result.error}`}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests various edge cases for the addToShoppingList function.',
      },
    },
  },
}
