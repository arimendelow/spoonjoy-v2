/**
 * Tests for useIngredientParser hook.
 *
 * This hook wraps useFetcher to provide:
 * - Debounced ingredient parsing (triggers after ~1s of inactivity)
 * - Loading state management
 * - Error state management
 * - Parsed ingredients result
 */

import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { createRoutesStub } from 'react-router'
import { useIngredientParser } from '~/hooks/useIngredientParser'

// Helper component to test the hook
function TestComponent({
  recipeId,
  stepId,
  onStateChange,
}: {
  recipeId: string
  stepId: string
  onStateChange?: (state: ReturnType<typeof useIngredientParser>) => void
}) {
  const parser = useIngredientParser({ recipeId, stepId })

  // Report state changes to test
  if (onStateChange) {
    onStateChange(parser)
  }

  return (
    <div>
      <input
        data-testid="input"
        value={parser.text}
        onChange={(e) => parser.setText(e.target.value)}
      />
      <button data-testid="parse" onClick={() => parser.parse()}>
        Parse
      </button>
      <button data-testid="clear" onClick={() => parser.clear()}>
        Clear
      </button>
      {parser.isLoading && <span data-testid="loading">Loading...</span>}
      {parser.error && <span data-testid="error">{parser.error}</span>}
      {parser.parsedIngredients && (
        <ul data-testid="results">
          {parser.parsedIngredients.map((ing, i) => (
            <li key={i}>
              {ing.quantity} {ing.unit} {ing.ingredientName}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// Create a test wrapper with router context
function createTestWrapper(actionHandler: (formData: FormData) => Promise<unknown>) {
  return createRoutesStub([
    {
      path: '/recipes/:id/steps/:stepId/edit',
      Component: () => <TestComponent recipeId="recipe-1" stepId="step-1" />,
      action: async ({ request }) => {
        const formData = await request.formData()
        return actionHandler(formData)
      },
    },
  ])
}

describe('useIngredientParser', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initialization', () => {
    it('initializes with empty text', () => {
      const Wrapper = createTestWrapper(async () => ({ parsedIngredients: [] }))
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      expect(screen.getByTestId('input')).toHaveValue('')
    })

    it('initializes with isLoading as false', () => {
      const Wrapper = createTestWrapper(async () => ({ parsedIngredients: [] }))
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
    })

    it('initializes with no error', () => {
      const Wrapper = createTestWrapper(async () => ({ parsedIngredients: [] }))
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      expect(screen.queryByTestId('error')).not.toBeInTheDocument()
    })

    it('initializes with no parsed ingredients', () => {
      const Wrapper = createTestWrapper(async () => ({ parsedIngredients: [] }))
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      expect(screen.queryByTestId('results')).not.toBeInTheDocument()
    })
  })

  describe('text input', () => {
    it('updates text when setText is called', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(async () => ({ parsedIngredients: [] }))
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      await user.type(screen.getByTestId('input'), '2 cups flour')

      expect(screen.getByTestId('input')).toHaveValue('2 cups flour')
    })

    it('clears text when clear is called', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(async () => ({ parsedIngredients: [] }))
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      await user.type(screen.getByTestId('input'), '2 cups flour')
      await user.click(screen.getByTestId('clear'))

      expect(screen.getByTestId('input')).toHaveValue('')
    })

    it('clears parsed ingredients when clear is called', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(async () => ({
        parsedIngredients: [{ quantity: 2, unit: 'cup', ingredientName: 'flour' }],
      }))
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      // Parse first
      await user.type(screen.getByTestId('input'), '2 cups flour')
      await user.click(screen.getByTestId('parse'))
      await waitFor(() => expect(screen.getByTestId('results')).toBeInTheDocument())

      // Clear
      await user.click(screen.getByTestId('clear'))

      expect(screen.queryByTestId('results')).not.toBeInTheDocument()
    })

    it('clears error when clear is called', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(async () => ({
        errors: { parse: 'Parse failed' },
      }))
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      // Trigger error
      await user.type(screen.getByTestId('input'), 'invalid')
      await user.click(screen.getByTestId('parse'))
      await waitFor(() => expect(screen.getByTestId('error')).toBeInTheDocument())

      // Clear
      await user.click(screen.getByTestId('clear'))

      expect(screen.queryByTestId('error')).not.toBeInTheDocument()
    })
  })

  describe('debounced parsing', () => {
    it('does not trigger parse immediately on text change', async () => {
      const actionHandler = vi.fn().mockResolvedValue({ parsedIngredients: [] })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(actionHandler)
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      await user.type(screen.getByTestId('input'), '2 cups flour')

      // Immediately after typing, action should not be called
      expect(actionHandler).not.toHaveBeenCalled()
    })

    it('triggers parse after debounce delay (1 second)', async () => {
      const actionHandler = vi.fn().mockResolvedValue({
        parsedIngredients: [{ quantity: 2, unit: 'cup', ingredientName: 'flour' }],
      })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(actionHandler)
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      await user.type(screen.getByTestId('input'), '2 cups flour')

      // Advance timers by 1 second
      await act(async () => {
        vi.advanceTimersByTime(1000)
      })

      await waitFor(() => {
        expect(actionHandler).toHaveBeenCalled()
      })
    })

    it('resets debounce timer on each keystroke', async () => {
      const actionHandler = vi.fn().mockResolvedValue({ parsedIngredients: [] })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(actionHandler)
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      // Type first character
      await user.type(screen.getByTestId('input'), '2')

      // Wait 500ms
      await act(async () => {
        vi.advanceTimersByTime(500)
      })

      // Type more
      await user.type(screen.getByTestId('input'), ' cups')

      // Wait 500ms more (total 1000ms from first char, but only 500ms from last)
      await act(async () => {
        vi.advanceTimersByTime(500)
      })

      // Should not have fired yet
      expect(actionHandler).not.toHaveBeenCalled()

      // Wait remaining 500ms
      await act(async () => {
        vi.advanceTimersByTime(500)
      })

      await waitFor(() => {
        expect(actionHandler).toHaveBeenCalled()
      })
    })

    it('does not trigger parse for empty text', async () => {
      const actionHandler = vi.fn().mockResolvedValue({ parsedIngredients: [] })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(actionHandler)
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      // Type then delete
      await user.type(screen.getByTestId('input'), 'a')
      await user.clear(screen.getByTestId('input'))

      // Wait for debounce
      await act(async () => {
        vi.advanceTimersByTime(1000)
      })

      expect(actionHandler).not.toHaveBeenCalled()
    })

    it('does not trigger parse for whitespace-only text', async () => {
      const actionHandler = vi.fn().mockResolvedValue({ parsedIngredients: [] })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(actionHandler)
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      await user.type(screen.getByTestId('input'), '   ')

      // Wait for debounce
      await act(async () => {
        vi.advanceTimersByTime(1000)
      })

      expect(actionHandler).not.toHaveBeenCalled()
    })
  })

  describe('manual parsing', () => {
    it('triggers parse immediately when parse() is called', async () => {
      const actionHandler = vi.fn().mockResolvedValue({
        parsedIngredients: [{ quantity: 2, unit: 'cup', ingredientName: 'flour' }],
      })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(actionHandler)
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      await user.type(screen.getByTestId('input'), '2 cups flour')
      await user.click(screen.getByTestId('parse'))

      await waitFor(() => {
        expect(actionHandler).toHaveBeenCalled()
      })
    })

    it('cancels pending debounce when parse() is called', async () => {
      const actionHandler = vi.fn().mockResolvedValue({ parsedIngredients: [] })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(actionHandler)
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      await user.type(screen.getByTestId('input'), '2 cups flour')
      await user.click(screen.getByTestId('parse'))

      // Even after debounce period, should only have been called once
      await act(async () => {
        vi.advanceTimersByTime(1000)
      })

      await waitFor(() => {
        expect(actionHandler).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('loading state', () => {
    it('sets isLoading to true while parsing', async () => {
      let resolveAction: (value: unknown) => void
      const actionPromise = new Promise((resolve) => {
        resolveAction = resolve
      })
      const actionHandler = vi.fn().mockImplementation(() => actionPromise)
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(actionHandler)
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      await user.type(screen.getByTestId('input'), '2 cups flour')
      await user.click(screen.getByTestId('parse'))

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toBeInTheDocument()
      })

      // Resolve to clean up
      await act(async () => {
        resolveAction!({ parsedIngredients: [] })
      })
    })

    it('sets isLoading to false when parsing completes', async () => {
      const actionHandler = vi.fn().mockResolvedValue({
        parsedIngredients: [{ quantity: 2, unit: 'cup', ingredientName: 'flour' }],
      })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(actionHandler)
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      await user.type(screen.getByTestId('input'), '2 cups flour')
      await user.click(screen.getByTestId('parse'))

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
        expect(screen.getByTestId('results')).toBeInTheDocument()
      })
    })

    it('sets isLoading to false when parsing fails', async () => {
      const actionHandler = vi.fn().mockResolvedValue({
        errors: { parse: 'Parse failed' },
      })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(actionHandler)
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      await user.type(screen.getByTestId('input'), 'invalid')
      await user.click(screen.getByTestId('parse'))

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
        expect(screen.getByTestId('error')).toBeInTheDocument()
      })
    })
  })

  describe('parsing results', () => {
    it('stores parsed ingredients on success', async () => {
      const actionHandler = vi.fn().mockResolvedValue({
        parsedIngredients: [
          { quantity: 2, unit: 'cup', ingredientName: 'flour' },
          { quantity: 0.5, unit: 'tsp', ingredientName: 'salt' },
        ],
      })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(actionHandler)
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      await user.type(screen.getByTestId('input'), '2 cups flour\n1/2 tsp salt')
      await user.click(screen.getByTestId('parse'))

      await waitFor(() => {
        const results = screen.getByTestId('results')
        expect(results).toHaveTextContent('2 cup flour')
        expect(results).toHaveTextContent('0.5 tsp salt')
      })
    })

    it('clears previous results on new parse', async () => {
      let parseCount = 0
      const actionHandler = vi.fn().mockImplementation(async () => {
        parseCount++
        return {
          parsedIngredients: [
            { quantity: parseCount, unit: 'cup', ingredientName: parseCount === 1 ? 'flour' : 'sugar' },
          ],
        }
      })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(actionHandler)
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      // First parse
      await user.type(screen.getByTestId('input'), '1 cup flour')
      await user.click(screen.getByTestId('parse'))
      await waitFor(() => expect(screen.getByTestId('results')).toHaveTextContent('flour'))

      // Clear and parse again
      await user.clear(screen.getByTestId('input'))
      await user.type(screen.getByTestId('input'), '2 cups sugar')
      await user.click(screen.getByTestId('parse'))

      await waitFor(() => {
        const results = screen.getByTestId('results')
        expect(results).toHaveTextContent('sugar')
        expect(results).not.toHaveTextContent('flour')
      })
    })
  })

  describe('error handling', () => {
    it('stores error message on parse failure', async () => {
      const actionHandler = vi.fn().mockResolvedValue({
        errors: { parse: 'Failed to parse: API rate limited' },
      })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(actionHandler)
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      await user.type(screen.getByTestId('input'), 'invalid')
      await user.click(screen.getByTestId('parse'))

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Failed to parse: API rate limited')
      })
    })

    it('clears error on new successful parse', async () => {
      let shouldFail = true
      const actionHandler = vi.fn().mockImplementation(async () => {
        if (shouldFail) {
          return { errors: { parse: 'Parse failed' } }
        }
        return { parsedIngredients: [{ quantity: 2, unit: 'cup', ingredientName: 'flour' }] }
      })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(actionHandler)
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      // Trigger error
      await user.type(screen.getByTestId('input'), 'invalid')
      await user.click(screen.getByTestId('parse'))
      await waitFor(() => expect(screen.getByTestId('error')).toBeInTheDocument())

      // Parse again successfully
      shouldFail = false
      await user.clear(screen.getByTestId('input'))
      await user.type(screen.getByTestId('input'), '2 cups flour')
      await user.click(screen.getByTestId('parse'))

      await waitFor(() => {
        expect(screen.queryByTestId('error')).not.toBeInTheDocument()
        expect(screen.getByTestId('results')).toBeInTheDocument()
      })
    })

    it('clears parsed ingredients on parse failure', async () => {
      let shouldFail = false
      const actionHandler = vi.fn().mockImplementation(async () => {
        if (shouldFail) {
          return { errors: { parse: 'Parse failed' } }
        }
        return { parsedIngredients: [{ quantity: 2, unit: 'cup', ingredientName: 'flour' }] }
      })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(actionHandler)
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      // Parse successfully first
      await user.type(screen.getByTestId('input'), '2 cups flour')
      await user.click(screen.getByTestId('parse'))
      await waitFor(() => expect(screen.getByTestId('results')).toBeInTheDocument())

      // Parse with failure
      shouldFail = true
      await user.clear(screen.getByTestId('input'))
      await user.type(screen.getByTestId('input'), 'bad input')
      await user.click(screen.getByTestId('parse'))

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument()
        expect(screen.queryByTestId('results')).not.toBeInTheDocument()
      })
    })
  })

  describe('fetcher data', () => {
    it('sends correct form data to action', async () => {
      const actionHandler = vi.fn().mockResolvedValue({ parsedIngredients: [] })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(actionHandler)
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      await user.type(screen.getByTestId('input'), '2 cups flour')
      await user.click(screen.getByTestId('parse'))

      await waitFor(() => {
        expect(actionHandler).toHaveBeenCalled()
        const formData = actionHandler.mock.calls[0][0] as FormData
        expect(formData.get('intent')).toBe('parseIngredients')
        expect(formData.get('ingredientText')).toBe('2 cups flour')
      })
    })

    it('preserves multi-line ingredient text', async () => {
      const actionHandler = vi.fn().mockResolvedValue({ parsedIngredients: [] })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(actionHandler)
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      await user.type(screen.getByTestId('input'), '2 cups flour\n1/2 tsp salt\n3 eggs')
      await user.click(screen.getByTestId('parse'))

      await waitFor(() => {
        const formData = actionHandler.mock.calls[0][0] as FormData
        expect(formData.get('ingredientText')).toBe('2 cups flour\n1/2 tsp salt\n3 eggs')
      })
    })
  })
})
