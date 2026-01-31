import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { IngredientInputToggle } from '../../../app/components/recipe/IngredientInputToggle'

// Mock localStorage with exposed store for proper reset
let localStorageStore: Record<string, string> = {}

const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageStore[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageStore[key]
  }),
  clear: vi.fn(() => {
    localStorageStore = {}
  }),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('IngredientInputToggle', () => {
  beforeEach(() => {
    // Clear the store
    localStorageStore = {}
    // Reset all mocks including implementations
    vi.resetAllMocks()
    // Restore default implementations after reset
    localStorageMock.getItem.mockImplementation((key: string) => localStorageStore[key] ?? null)
    localStorageMock.setItem.mockImplementation((key: string, value: string) => {
      localStorageStore[key] = value
    })
    localStorageMock.removeItem.mockImplementation((key: string) => {
      delete localStorageStore[key]
    })
    localStorageMock.clear.mockImplementation(() => {
      localStorageStore = {}
    })
  })

  afterEach(() => {
    localStorageMock.clear()
  })

  describe('rendering', () => {
    it('renders a switch control', () => {
      render(<IngredientInputToggle onChange={vi.fn()} />)

      expect(screen.getByRole('switch')).toBeInTheDocument()
    })

    it('renders with label text', () => {
      render(<IngredientInputToggle onChange={vi.fn()} />)

      expect(screen.getByText(/ai parse/i)).toBeInTheDocument()
    })

    it('renders with description text explaining the toggle', () => {
      render(<IngredientInputToggle onChange={vi.fn()} />)

      expect(
        screen.getByText(/use ai to parse ingredients/i)
      ).toBeInTheDocument()
    })

    it('defaults to AI mode (checked)', () => {
      render(<IngredientInputToggle onChange={vi.fn()} />)

      expect(screen.getByRole('switch')).toBeChecked()
    })

    it('renders in manual mode when defaultMode is manual', () => {
      render(<IngredientInputToggle onChange={vi.fn()} defaultMode="manual" />)

      expect(screen.getByRole('switch')).not.toBeChecked()
    })

    it('renders in AI mode when defaultMode is ai', () => {
      render(<IngredientInputToggle onChange={vi.fn()} defaultMode="ai" />)

      expect(screen.getByRole('switch')).toBeChecked()
    })
  })

  describe('mode switching', () => {
    it('calls onChange with "manual" when toggled off from AI mode', async () => {
      const onChange = vi.fn()
      render(<IngredientInputToggle onChange={onChange} defaultMode="ai" />)

      await userEvent.click(screen.getByRole('switch'))

      expect(onChange).toHaveBeenCalledWith('manual')
    })

    it('calls onChange with "ai" when toggled on from manual mode', async () => {
      const onChange = vi.fn()
      render(<IngredientInputToggle onChange={onChange} defaultMode="manual" />)

      await userEvent.click(screen.getByRole('switch'))

      expect(onChange).toHaveBeenCalledWith('ai')
    })

    it('updates visual state when toggled', async () => {
      render(<IngredientInputToggle onChange={vi.fn()} defaultMode="ai" />)

      const switchEl = screen.getByRole('switch')
      expect(switchEl).toBeChecked()

      await userEvent.click(switchEl)

      expect(switchEl).not.toBeChecked()
    })

    it('can toggle multiple times', async () => {
      const onChange = vi.fn()
      render(<IngredientInputToggle onChange={onChange} defaultMode="ai" />)

      const switchEl = screen.getByRole('switch')

      await userEvent.click(switchEl) // AI -> manual
      expect(onChange).toHaveBeenLastCalledWith('manual')

      await userEvent.click(switchEl) // manual -> AI
      expect(onChange).toHaveBeenLastCalledWith('ai')

      await userEvent.click(switchEl) // AI -> manual
      expect(onChange).toHaveBeenLastCalledWith('manual')

      // 1 call on mount + 3 clicks = 4 total
      expect(onChange).toHaveBeenCalledTimes(4)
    })
  })

  describe('localStorage persistence', () => {
    it('saves preference to localStorage when toggled to manual', async () => {
      render(<IngredientInputToggle onChange={vi.fn()} defaultMode="ai" />)

      await userEvent.click(screen.getByRole('switch'))

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ingredient-input-mode',
        'manual'
      )
    })

    it('saves preference to localStorage when toggled to AI', async () => {
      render(<IngredientInputToggle onChange={vi.fn()} defaultMode="manual" />)

      await userEvent.click(screen.getByRole('switch'))

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ingredient-input-mode',
        'ai'
      )
    })

    it('reads initial mode from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('manual')

      render(<IngredientInputToggle onChange={vi.fn()} />)

      expect(screen.getByRole('switch')).not.toBeChecked()
    })

    it('prefers localStorage over defaultMode prop', () => {
      localStorageMock.getItem.mockReturnValue('manual')

      render(<IngredientInputToggle onChange={vi.fn()} defaultMode="ai" />)

      expect(screen.getByRole('switch')).not.toBeChecked()
    })

    it('uses defaultMode when localStorage is empty', () => {
      localStorageMock.getItem.mockReturnValue(null)

      render(<IngredientInputToggle onChange={vi.fn()} defaultMode="manual" />)

      expect(screen.getByRole('switch')).not.toBeChecked()
    })

    it('calls onChange with initial mode from localStorage on mount', () => {
      localStorageMock.getItem.mockReturnValue('manual')
      const onChange = vi.fn()

      render(<IngredientInputToggle onChange={onChange} />)

      expect(onChange).toHaveBeenCalledWith('manual')
    })

    it('uses custom storage key when provided', async () => {
      render(
        <IngredientInputToggle
          onChange={vi.fn()}
          storageKey="custom-ingredient-mode"
          defaultMode="ai"
        />
      )

      await userEvent.click(screen.getByRole('switch'))

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'custom-ingredient-mode',
        'manual'
      )
    })
  })

  describe('disabled state', () => {
    it('disables the switch when disabled prop is true', () => {
      render(<IngredientInputToggle onChange={vi.fn()} disabled />)

      expect(screen.getByRole('switch')).toHaveAttribute('data-disabled')
    })

    it('does not call onChange when disabled', async () => {
      const onChange = vi.fn()
      render(<IngredientInputToggle onChange={onChange} disabled />)

      await userEvent.click(screen.getByRole('switch'))

      // onChange is called on mount, but not on click
      expect(onChange).toHaveBeenCalledTimes(1) // Only the initial call
    })

    it('does not save to localStorage when disabled', async () => {
      localStorageMock.setItem.mockClear()
      render(<IngredientInputToggle onChange={vi.fn()} disabled />)

      await userEvent.click(screen.getByRole('switch'))

      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })
  })

  describe('controlled mode', () => {
    it('respects controlled mode prop', () => {
      render(<IngredientInputToggle onChange={vi.fn()} mode="manual" />)

      expect(screen.getByRole('switch')).not.toBeChecked()
    })

    it('ignores localStorage when mode is controlled', () => {
      localStorageMock.getItem.mockReturnValue('manual')

      render(<IngredientInputToggle onChange={vi.fn()} mode="ai" />)

      expect(screen.getByRole('switch')).toBeChecked()
    })

    it('updates when controlled mode prop changes', () => {
      const { rerender } = render(
        <IngredientInputToggle onChange={vi.fn()} mode="ai" />
      )

      expect(screen.getByRole('switch')).toBeChecked()

      rerender(<IngredientInputToggle onChange={vi.fn()} mode="manual" />)

      expect(screen.getByRole('switch')).not.toBeChecked()
    })

    it('does not save to localStorage in controlled mode', async () => {
      localStorageMock.setItem.mockClear()
      render(<IngredientInputToggle onChange={vi.fn()} mode="ai" />)

      await userEvent.click(screen.getByRole('switch'))

      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })
  })

  describe('keyboard interaction', () => {
    it('toggles on Space key', async () => {
      const onChange = vi.fn()
      render(<IngredientInputToggle onChange={onChange} defaultMode="ai" />)

      const switchEl = screen.getByRole('switch')
      switchEl.focus()

      await userEvent.keyboard(' ')

      expect(onChange).toHaveBeenLastCalledWith('manual')
    })

    it('is focusable via Tab', async () => {
      render(<IngredientInputToggle onChange={vi.fn()} />)

      await userEvent.tab()

      expect(screen.getByRole('switch')).toHaveFocus()
    })
  })

  describe('accessibility', () => {
    it('has accessible label', () => {
      render(<IngredientInputToggle onChange={vi.fn()} />)

      const switchEl = screen.getByRole('switch')
      expect(switchEl).toHaveAccessibleName(/ai parse/i)
    })

    it('has accessible description', () => {
      render(<IngredientInputToggle onChange={vi.fn()} />)

      const switchEl = screen.getByRole('switch')
      expect(switchEl).toHaveAccessibleDescription(/use ai to parse/i)
    })

    it('announces state change', async () => {
      render(<IngredientInputToggle onChange={vi.fn()} defaultMode="ai" />)

      const switchEl = screen.getByRole('switch')
      expect(switchEl).toHaveAttribute('aria-checked', 'true')

      await userEvent.click(switchEl)

      expect(switchEl).toHaveAttribute('aria-checked', 'false')
    })
  })

  describe('edge cases', () => {
    it('handles invalid localStorage value gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid-value')

      render(<IngredientInputToggle onChange={vi.fn()} />)

      // Should default to AI mode when localStorage has invalid value
      expect(screen.getByRole('switch')).toBeChecked()
    })

    it('handles localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      // Should not throw
      expect(() => {
        render(<IngredientInputToggle onChange={vi.fn()} />)
      }).not.toThrow()

      // Should default to AI mode
      expect(screen.getByRole('switch')).toBeChecked()
    })

    it('handles setItem errors gracefully', async () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const onChange = vi.fn()
      render(<IngredientInputToggle onChange={onChange} defaultMode="ai" />)

      // Should not throw and still call onChange
      await userEvent.click(screen.getByRole('switch'))

      expect(onChange).toHaveBeenCalledWith('manual')
    })
  })
})
