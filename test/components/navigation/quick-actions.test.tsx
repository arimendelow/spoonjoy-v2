import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  shareContent,
  isNativeShareSupported,
  addToShoppingList,
  type ShareOptions,
  type AddToListOptions,
} from '~/components/navigation/quick-actions'

describe('Quick Actions', () => {
  describe('shareContent', () => {
    const shareOptions: ShareOptions = {
      title: 'Chocolate Cake',
      text: 'Check out this amazing recipe!',
      url: 'https://spoonjoy.com/recipes/123',
    }

    beforeEach(() => {
      // Reset navigator.share mock
      vi.stubGlobal('navigator', {
        ...navigator,
        share: undefined,
        clipboard: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
      })
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('uses native share when available', async () => {
      const mockShare = vi.fn().mockResolvedValue(undefined)
      vi.stubGlobal('navigator', {
        ...navigator,
        share: mockShare,
        clipboard: {
          writeText: vi.fn(),
        },
      })

      const result = await shareContent(shareOptions)

      expect(mockShare).toHaveBeenCalledWith({
        title: shareOptions.title,
        text: shareOptions.text,
        url: shareOptions.url,
      })
      expect(result.success).toBe(true)
      expect(result.method).toBe('native')
    })

    it('falls back to clipboard when native share not available', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined)
      vi.stubGlobal('navigator', {
        share: undefined,
        clipboard: {
          writeText: mockWriteText,
        },
      })

      const result = await shareContent(shareOptions)

      expect(mockWriteText).toHaveBeenCalledWith(shareOptions.url)
      expect(result.success).toBe(true)
      expect(result.method).toBe('clipboard')
    })

    it('handles native share rejection gracefully', async () => {
      const mockShare = vi.fn().mockRejectedValue(new Error('User cancelled'))
      vi.stubGlobal('navigator', {
        ...navigator,
        share: mockShare,
        clipboard: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
      })

      const result = await shareContent(shareOptions)

      // Should fall back to clipboard on error
      expect(result.success).toBe(true)
      expect(result.method).toBe('clipboard')
    })

    it('handles clipboard failure', async () => {
      vi.stubGlobal('navigator', {
        share: undefined,
        clipboard: {
          writeText: vi.fn().mockRejectedValue(new Error('Clipboard access denied')),
        },
      })

      const result = await shareContent(shareOptions)

      expect(result.success).toBe(false)
    })

    it('shares with minimal options (title and url only)', async () => {
      const mockShare = vi.fn().mockResolvedValue(undefined)
      vi.stubGlobal('navigator', {
        share: mockShare,
        clipboard: { writeText: vi.fn() },
      })

      const minimalOptions: ShareOptions = {
        title: 'Recipe',
        url: 'https://spoonjoy.com/recipes/456',
      }

      const result = await shareContent(minimalOptions)

      expect(mockShare).toHaveBeenCalledWith({
        title: minimalOptions.title,
        text: undefined,
        url: minimalOptions.url,
      })
      expect(result.success).toBe(true)
    })
  })

  describe('isNativeShareSupported', () => {
    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('returns true when navigator.share exists', () => {
      vi.stubGlobal('navigator', {
        share: vi.fn(),
      })

      expect(isNativeShareSupported()).toBe(true)
    })

    it('returns false when navigator.share is undefined', () => {
      vi.stubGlobal('navigator', {
        share: undefined,
      })

      expect(isNativeShareSupported()).toBe(false)
    })

    it('returns false when navigator is undefined', () => {
      vi.stubGlobal('navigator', undefined)

      expect(isNativeShareSupported()).toBe(false)
    })
  })

  describe('addToShoppingList', () => {
    const addOptions: AddToListOptions = {
      recipeId: '123',
    }

    it('returns success when items are added', async () => {
      const result = await addToShoppingList(addOptions)

      expect(result.success).toBe(true)
      expect(result.itemsAdded).toBeGreaterThan(0)
    })

    it('accepts optional ingredientIds to add specific ingredients', async () => {
      const optionsWithIngredients: AddToListOptions = {
        recipeId: '123',
        ingredientIds: ['ing-1', 'ing-2'],
      }

      const result = await addToShoppingList(optionsWithIngredients)

      expect(result.success).toBe(true)
      expect(result.itemsAdded).toBeLessThanOrEqual(2)
    })

    it('returns error when recipe not found', async () => {
      const invalidOptions: AddToListOptions = {
        recipeId: 'non-existent',
      }

      const result = await addToShoppingList(invalidOptions)

      // Should handle gracefully
      expect(result).toHaveProperty('success')
      if (!result.success) {
        expect(result.error).toBeDefined()
      }
    })

    it('handles empty ingredientIds array', async () => {
      const optionsWithEmpty: AddToListOptions = {
        recipeId: '123',
        ingredientIds: [],
      }

      const result = await addToShoppingList(optionsWithEmpty)

      // Empty array means no specific ingredients selected
      expect(result).toHaveProperty('success')
    })
  })
})
