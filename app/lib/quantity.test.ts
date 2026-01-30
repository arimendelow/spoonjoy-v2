import { describe, expect, it } from 'vitest'
import {
  formatQuantity,
  scaleQuantity,
  scaleServingsText,
} from './quantity'

describe('quantity utilities', () => {
  describe('formatQuantity', () => {
    describe('whole numbers', () => {
      it('formats 1 as "1"', () => {
        expect(formatQuantity(1)).toBe('1')
      })

      it('formats 2 as "2"', () => {
        expect(formatQuantity(2)).toBe('2')
      })

      it('formats 10 as "10"', () => {
        expect(formatQuantity(10)).toBe('10')
      })

      it('formats 0 as "0"', () => {
        expect(formatQuantity(0)).toBe('0')
      })
    })

    describe('common fractions', () => {
      it('formats 0.5 as "½"', () => {
        expect(formatQuantity(0.5)).toBe('½')
      })

      it('formats 0.25 as "¼"', () => {
        expect(formatQuantity(0.25)).toBe('¼')
      })

      it('formats 0.75 as "¾"', () => {
        expect(formatQuantity(0.75)).toBe('¾')
      })

      it('formats 0.125 as "⅛"', () => {
        expect(formatQuantity(0.125)).toBe('⅛')
      })

      it('formats 0.375 as "⅜"', () => {
        expect(formatQuantity(0.375)).toBe('⅜')
      })

      it('formats 0.625 as "⅝"', () => {
        expect(formatQuantity(0.625)).toBe('⅝')
      })

      it('formats 0.875 as "⅞"', () => {
        expect(formatQuantity(0.875)).toBe('⅞')
      })
    })

    describe('thirds', () => {
      it('formats 0.333... as "⅓"', () => {
        expect(formatQuantity(1 / 3)).toBe('⅓')
      })

      it('formats 0.666... as "⅔"', () => {
        expect(formatQuantity(2 / 3)).toBe('⅔')
      })

      it('formats 0.333 (truncated) as "⅓"', () => {
        expect(formatQuantity(0.333)).toBe('⅓')
      })

      it('formats 0.3333 as "⅓"', () => {
        expect(formatQuantity(0.3333)).toBe('⅓')
      })
    })

    describe('sixths', () => {
      it('formats 0.166... as "⅙"', () => {
        expect(formatQuantity(1 / 6)).toBe('⅙')
      })

      it('formats 0.833... as "⅚"', () => {
        expect(formatQuantity(5 / 6)).toBe('⅚')
      })
    })

    describe('mixed numbers', () => {
      it('formats 1.5 as "1 ½"', () => {
        expect(formatQuantity(1.5)).toBe('1 ½')
      })

      it('formats 2.75 as "2 ¾"', () => {
        expect(formatQuantity(2.75)).toBe('2 ¾')
      })

      it('formats 3.25 as "3 ¼"', () => {
        expect(formatQuantity(3.25)).toBe('3 ¼')
      })

      it('formats 1.333... as "1 ⅓"', () => {
        expect(formatQuantity(4 / 3)).toBe('1 ⅓')
      })

      it('formats 2.666... as "2 ⅔"', () => {
        expect(formatQuantity(8 / 3)).toBe('2 ⅔')
      })

      it('formats 1.125 as "1 ⅛"', () => {
        expect(formatQuantity(1.125)).toBe('1 ⅛')
      })

      it('formats 5.5 as "5 ½"', () => {
        expect(formatQuantity(5.5)).toBe('5 ½')
      })
    })

    describe('edge cases', () => {
      it('returns empty string for null', () => {
        expect(formatQuantity(null as unknown as number)).toBe('')
      })

      it('returns empty string for undefined', () => {
        expect(formatQuantity(undefined as unknown as number)).toBe('')
      })

      it('returns empty string for NaN', () => {
        expect(formatQuantity(NaN)).toBe('')
      })

      it('handles very small numbers by rounding', () => {
        // Very small values should round to nearest fraction
        expect(formatQuantity(0.01)).toBe('0')
      })

      it('handles negative numbers', () => {
        // Negative numbers should still format correctly (edge case)
        expect(formatQuantity(-0.5)).toBe('-½')
      })

      it('handles very large numbers', () => {
        expect(formatQuantity(100)).toBe('100')
      })

      it('handles decimals that round to common fractions', () => {
        // 0.24 should round to 1/4
        expect(formatQuantity(0.24)).toBe('¼')
        // 0.26 should round to 1/4
        expect(formatQuantity(0.26)).toBe('¼')
      })

      it('handles decimals close to thirds', () => {
        expect(formatQuantity(0.34)).toBe('⅓')
      })
    })

    describe('uncommon fractions fallback', () => {
      it('formats 0.2 (1/5) as decimal or nearest fraction', () => {
        // 1/5 isn't a common cooking fraction, should round to nearest
        const result = formatQuantity(0.2)
        // Could be "⅙" or a decimal representation
        expect(result).toMatch(/^(⅙|0\.2|¼)$/)
      })

      it('handles fractions not in Unicode map (like 2/7)', () => {
        // 2/7 ≈ 0.2857, which is close to 1/3 (0.333)
        const result = formatQuantity(2 / 7)
        // Should round to ⅓ (closest common fraction)
        expect(result).toBe('⅓')
      })
    })
  })

  describe('scaleQuantity', () => {
    it('scales 2 by 1.5 to get 3', () => {
      expect(scaleQuantity(2, 1.5)).toBe(3)
    })

    it('scales 1 by 2 to get 2', () => {
      expect(scaleQuantity(1, 2)).toBe(2)
    })

    it('scales 4 by 0.5 to get 2', () => {
      expect(scaleQuantity(4, 0.5)).toBe(2)
    })

    it('scales 3 by 0.333... to get ~1', () => {
      expect(scaleQuantity(3, 1 / 3)).toBeCloseTo(1)
    })

    it('returns 0 when quantity is 0', () => {
      expect(scaleQuantity(0, 2)).toBe(0)
    })

    it('returns original when scale is 1', () => {
      expect(scaleQuantity(2.5, 1)).toBe(2.5)
    })

    it('handles null quantity', () => {
      expect(scaleQuantity(null as unknown as number, 2)).toBe(0)
    })

    it('handles undefined quantity', () => {
      expect(scaleQuantity(undefined as unknown as number, 2)).toBe(0)
    })

    it('handles null scale factor', () => {
      expect(scaleQuantity(2, null as unknown as number)).toBe(0)
    })

    it('handles decimal quantities', () => {
      expect(scaleQuantity(0.5, 2)).toBe(1)
    })

    it('handles very small scale factors', () => {
      expect(scaleQuantity(8, 0.25)).toBe(2)
    })

    it('handles very large scale factors', () => {
      expect(scaleQuantity(1, 50)).toBe(50)
    })
  })

  describe('scaleServingsText', () => {
    describe('simple servings', () => {
      it('scales "Serves 4" by 2 to "Serves 8"', () => {
        expect(scaleServingsText('Serves 4', 2)).toBe('Serves 8')
      })

      it('scales "Serves 4" by 0.5 to "Serves 2"', () => {
        expect(scaleServingsText('Serves 4', 0.5)).toBe('Serves 2')
      })

      it('scales "Serves 2" by 1.5 to "Serves 3"', () => {
        expect(scaleServingsText('Serves 2', 1.5)).toBe('Serves 3')
      })
    })

    describe('makes/yields format', () => {
      it('scales "Makes 12 cookies" by 0.5 to "Makes 6 cookies"', () => {
        expect(scaleServingsText('Makes 12 cookies', 0.5)).toBe('Makes 6 cookies')
      })

      it('scales "Makes 24 muffins" by 2 to "Makes 48 muffins"', () => {
        expect(scaleServingsText('Makes 24 muffins', 2)).toBe('Makes 48 muffins')
      })

      it('scales "Yields 8 portions" by 1.5 to "Yields 12 portions"', () => {
        expect(scaleServingsText('Yields 8 portions', 1.5)).toBe('Yields 12 portions')
      })
    })

    describe('range format', () => {
      it('scales "Feeds 2-4 people" by 2 to "Feeds 4-8 people"', () => {
        expect(scaleServingsText('Feeds 2-4 people', 2)).toBe('Feeds 4-8 people')
      })

      it('scales "Serves 4-6" by 0.5 to "Serves 2-3"', () => {
        expect(scaleServingsText('Serves 4-6', 0.5)).toBe('Serves 2-3')
      })

      it('scales "Makes 10-12 servings" by 2 to "Makes 20-24 servings"', () => {
        expect(scaleServingsText('Makes 10-12 servings', 2)).toBe('Makes 20-24 servings')
      })
    })

    describe('fractional results', () => {
      it('formats fractional results as fractions', () => {
        const result = scaleServingsText('Serves 4', 0.75)
        expect(result).toBe('Serves 3')
      })

      it('handles results that are mixed numbers', () => {
        const result = scaleServingsText('Serves 2', 1.25)
        expect(result).toBe('Serves 2 ½')
      })
    })

    describe('edge cases', () => {
      it('returns original text when scale is 1', () => {
        expect(scaleServingsText('Serves 4', 1)).toBe('Serves 4')
      })

      it('handles text with no numbers', () => {
        expect(scaleServingsText('For the whole family', 2)).toBe('For the whole family')
      })

      it('handles empty string', () => {
        expect(scaleServingsText('', 2)).toBe('')
      })

      it('handles null text', () => {
        expect(scaleServingsText(null as unknown as string, 2)).toBe('')
      })

      it('handles undefined text', () => {
        expect(scaleServingsText(undefined as unknown as string, 2)).toBe('')
      })

      it('handles decimal numbers in text', () => {
        expect(scaleServingsText('Serves 1.5', 2)).toBe('Serves 3')
      })

      it('handles multiple separate numbers', () => {
        expect(scaleServingsText('Makes 12 cookies in 30 minutes', 2)).toBe('Makes 24 cookies in 60 minutes')
      })
    })

    describe('real-world examples', () => {
      it('handles "4 servings"', () => {
        expect(scaleServingsText('4 servings', 2)).toBe('8 servings')
      })

      it('handles "Serves: 6"', () => {
        expect(scaleServingsText('Serves: 6', 0.5)).toBe('Serves: 3')
      })

      it('handles "Makes about 20"', () => {
        expect(scaleServingsText('Makes about 20', 1.5)).toBe('Makes about 30')
      })
    })
  })
})
