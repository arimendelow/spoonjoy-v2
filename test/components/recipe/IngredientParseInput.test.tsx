/**
 * Tests for IngredientParseInput component.
 *
 * This component provides a textarea/input for entering natural language
 * ingredient text that gets parsed by AI. It integrates with useIngredientParser
 * to provide debounced parsing with loading and error states.
 */

import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { createRoutesStub } from 'react-router'
import { IngredientParseInput } from '~/components/recipe/IngredientParseInput'

// Create a test wrapper with router context
function createTestWrapper(
  actionHandler: (formData: FormData) => Promise<unknown>,
  props: Partial<React.ComponentProps<typeof IngredientParseInput>> = {}
) {
  const defaultProps = {
    recipeId: 'recipe-1',
    stepId: 'step-1',
    onParsed: vi.fn(),
    ...props,
  }

  return createRoutesStub([
    {
      path: '/recipes/:id/steps/:stepId/edit',
      Component: () => <IngredientParseInput {...defaultProps} />,
      action: async ({ request }) => {
        const formData = await request.formData()
        return actionHandler(formData)
      },
    },
  ])
}

describe('IngredientParseInput', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('rendering', () => {
    it('renders a textarea for ingredient input', () => {
      const Wrapper = createTestWrapper(async () => ({ parsedIngredients: [] }))
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('renders with placeholder text', () => {
      const Wrapper = createTestWrapper(async () => ({ parsedIngredients: [] }))
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      expect(screen.getByPlaceholderText(/enter ingredients/i)).toBeInTheDocument()
    })

    it('renders label for textarea', () => {
      const Wrapper = createTestWrapper(async () => ({ parsedIngredients: [] }))
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      expect(screen.getByLabelText(/ingredients/i)).toBeInTheDocument()
    })

    it('renders helper text explaining the feature', () => {
      const Wrapper = createTestWrapper(async () => ({ parsedIngredients: [] }))
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      expect(screen.getByText(/ai will parse/i)).toBeInTheDocument()
    })

    it('textarea is multi-line (has rows attribute)', () => {
      const Wrapper = createTestWrapper(async () => ({ parsedIngredients: [] }))
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('rows')
      expect(parseInt(textarea.getAttribute('rows') || '0')).toBeGreaterThanOrEqual(3)
    })
  })

  describe('loading states', () => {
    it('shows loading indicator while parsing', async () => {
      let resolveAction: (value: unknown) => void
      const actionPromise = new Promise((resolve) => {
        resolveAction = resolve
      })
      const actionHandler = vi.fn().mockImplementation(() => actionPromise)
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(actionHandler)
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      await user.type(screen.getByRole('textbox'), '2 cups flour')

      // Trigger debounce
      await act(async () => {
        vi.advanceTimersByTime(1000)
      })

      await waitFor(() => {
        expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()
      })

      // Resolve to clean up
      await act(async () => {
        resolveAction!({ parsedIngredients: [] })
      })
    })

    it('hides loading indicator when parsing completes', async () => {
      const actionHandler = vi.fn().mockResolvedValue({
        parsedIngredients: [{ quantity: 2, unit: 'cup', ingredientName: 'flour' }],
      })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(actionHandler)
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      await user.type(screen.getByRole('textbox'), '2 cups flour')

      // Trigger debounce
      await act(async () => {
        vi.advanceTimersByTime(1000)
      })

      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument()
      })
    })

    it('disables textarea while loading', async () => {
      let resolveAction: (value: unknown) => void
      const actionPromise = new Promise((resolve) => {
        resolveAction = resolve
      })
      const actionHandler = vi.fn().mockImplementation(() => actionPromise)
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(actionHandler)
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      await user.type(screen.getByRole('textbox'), '2 cups flour')

      // Trigger debounce
      await act(async () => {
        vi.advanceTimersByTime(1000)
      })

      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeDisabled()
      })

      // Resolve to clean up
      await act(async () => {
        resolveAction!({ parsedIngredients: [] })
      })
    })

    it('shows aria-busy on container while loading', async () => {
      let resolveAction: (value: unknown) => void
      const actionPromise = new Promise((resolve) => {
        resolveAction = resolve
      })
      const actionHandler = vi.fn().mockImplementation(() => actionPromise)
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(actionHandler)
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      await user.type(screen.getByRole('textbox'), '2 cups flour')

      // Trigger debounce
      await act(async () => {
        vi.advanceTimersByTime(1000)
      })

      await waitFor(() => {
        const container = screen.getByRole('textbox').closest('[aria-busy]')
        expect(container).toHaveAttribute('aria-busy', 'true')
      })

      // Resolve to clean up
      await act(async () => {
        resolveAction!({ parsedIngredients: [] })
      })
    })
  })

  describe('error states', () => {
    it('displays error message when parsing fails', async () => {
      const actionHandler = vi.fn().mockResolvedValue({
        errors: { parse: 'Failed to parse ingredients' },
      })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(actionHandler)
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      await user.type(screen.getByRole('textbox'), 'invalid input')

      // Trigger debounce
      await act(async () => {
        vi.advanceTimersByTime(1000)
      })

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Failed to parse ingredients')
      })
    })

    it('clears error when user types again', async () => {
      let shouldFail = true
      const actionHandler = vi.fn().mockImplementation(async () => {
        if (shouldFail) {
          return { errors: { parse: 'Parse failed' } }
        }
        return { parsedIngredients: [] }
      })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(actionHandler)
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      // Trigger error
      await user.type(screen.getByRole('textbox'), 'bad')
      await act(async () => {
        vi.advanceTimersByTime(1000)
      })
      await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())

      // Type again - error should clear
      shouldFail = false
      await user.type(screen.getByRole('textbox'), ' more text')

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('marks textarea as invalid when error present', async () => {
      const actionHandler = vi.fn().mockResolvedValue({
        errors: { parse: 'Parse failed' },
      })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(actionHandler)
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      await user.type(screen.getByRole('textbox'), 'invalid')
      await act(async () => {
        vi.advanceTimersByTime(1000)
      })

      await waitFor(() => {
        expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('associates error message with textarea via aria-describedby', async () => {
      const actionHandler = vi.fn().mockResolvedValue({
        errors: { parse: 'Parse failed' },
      })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(actionHandler)
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      await user.type(screen.getByRole('textbox'), 'invalid')
      await act(async () => {
        vi.advanceTimersByTime(1000)
      })

      await waitFor(() => {
        const textarea = screen.getByRole('textbox')
        const errorId = screen.getByRole('alert').id
        expect(textarea.getAttribute('aria-describedby')).toContain(errorId)
      })
    })
  })

  describe('debounce behavior', () => {
    it('shows typing indicator before debounce triggers', async () => {
      const actionHandler = vi.fn().mockResolvedValue({ parsedIngredients: [] })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(actionHandler)
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      await user.type(screen.getByRole('textbox'), '2 cups')

      // Before debounce triggers
      expect(screen.getByText(/will parse/i)).toBeInTheDocument()
    })

    it('does not show loading indicator before debounce', async () => {
      const actionHandler = vi.fn().mockResolvedValue({ parsedIngredients: [] })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(actionHandler)
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      await user.type(screen.getByRole('textbox'), '2 cups flour')

      // Immediately after typing, no loading indicator
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument()
    })
  })

  describe('callback', () => {
    it('calls onParsed when parsing succeeds', async () => {
      const onParsed = vi.fn()
      const parsedIngredients = [
        { quantity: 2, unit: 'cup', ingredientName: 'flour' },
        { quantity: 0.5, unit: 'tsp', ingredientName: 'salt' },
      ]
      const actionHandler = vi.fn().mockResolvedValue({ parsedIngredients })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(actionHandler, { onParsed })
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      await user.type(screen.getByRole('textbox'), '2 cups flour')
      await act(async () => {
        vi.advanceTimersByTime(1000)
      })

      await waitFor(() => {
        expect(onParsed).toHaveBeenCalledWith(parsedIngredients)
      })
    })

    it('does not call onParsed when parsing fails', async () => {
      const onParsed = vi.fn()
      const actionHandler = vi.fn().mockResolvedValue({
        errors: { parse: 'Parse failed' },
      })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(actionHandler, { onParsed })
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      await user.type(screen.getByRole('textbox'), 'invalid')
      await act(async () => {
        vi.advanceTimersByTime(1000)
      })

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
      expect(onParsed).not.toHaveBeenCalled()
    })

    it('calls onParsed with empty array when text is cleared', async () => {
      const onParsed = vi.fn()
      const actionHandler = vi.fn().mockResolvedValue({
        parsedIngredients: [{ quantity: 2, unit: 'cup', ingredientName: 'flour' }],
      })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(actionHandler, { onParsed })
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      // Parse first
      await user.type(screen.getByRole('textbox'), '2 cups flour')
      await act(async () => {
        vi.advanceTimersByTime(1000)
      })
      await waitFor(() => expect(onParsed).toHaveBeenCalledTimes(1))

      // Clear
      await user.clear(screen.getByRole('textbox'))

      expect(onParsed).toHaveBeenCalledWith([])
    })
  })

  describe('disabled state', () => {
    it('disables textarea when disabled prop is true', () => {
      const Wrapper = createTestWrapper(async () => ({ parsedIngredients: [] }), {
        disabled: true,
      })
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('does not trigger parse when disabled', async () => {
      const actionHandler = vi.fn().mockResolvedValue({ parsedIngredients: [] })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(actionHandler, { disabled: true })
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      // Attempt to type (should not work when disabled)
      const textarea = screen.getByRole('textbox')
      await user.click(textarea)

      // Wait for debounce
      await act(async () => {
        vi.advanceTimersByTime(1000)
      })

      expect(actionHandler).not.toHaveBeenCalled()
    })
  })

  describe('controlled value', () => {
    it('accepts initial value via defaultValue prop', () => {
      const Wrapper = createTestWrapper(async () => ({ parsedIngredients: [] }), {
        defaultValue: '2 cups flour',
      })
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      expect(screen.getByRole('textbox')).toHaveValue('2 cups flour')
    })

    it('triggers parse for initial value after debounce', async () => {
      const actionHandler = vi.fn().mockResolvedValue({
        parsedIngredients: [{ quantity: 2, unit: 'cup', ingredientName: 'flour' }],
      })
      const Wrapper = createTestWrapper(actionHandler, {
        defaultValue: '2 cups flour',
      })
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      // Wait for debounce
      await act(async () => {
        vi.advanceTimersByTime(1000)
      })

      await waitFor(() => {
        expect(actionHandler).toHaveBeenCalled()
      })
    })
  })

  describe('accessibility', () => {
    it('has accessible label', () => {
      const Wrapper = createTestWrapper(async () => ({ parsedIngredients: [] }))
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      expect(screen.getByLabelText(/ingredients/i)).toBeInTheDocument()
    })

    it('has accessible description', () => {
      const Wrapper = createTestWrapper(async () => ({ parsedIngredients: [] }))
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('aria-describedby')
    })

    it('announces loading state to screen readers', async () => {
      let resolveAction: (value: unknown) => void
      const actionPromise = new Promise((resolve) => {
        resolveAction = resolve
      })
      const actionHandler = vi.fn().mockImplementation(() => actionPromise)
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(actionHandler)
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      await user.type(screen.getByRole('textbox'), '2 cups flour')
      await act(async () => {
        vi.advanceTimersByTime(1000)
      })

      await waitFor(() => {
        const loadingIndicator = screen.getByTestId('loading-indicator')
        expect(loadingIndicator).toHaveAttribute('aria-live', 'polite')
      })

      // Resolve to clean up
      await act(async () => {
        resolveAction!({ parsedIngredients: [] })
      })
    })
  })

  describe('keyboard interaction', () => {
    it('supports Enter key for new lines in textarea', async () => {
      const actionHandler = vi.fn().mockResolvedValue({ parsedIngredients: [] })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(actionHandler)
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      await user.type(screen.getByRole('textbox'), '2 cups flour{enter}1/2 tsp salt')

      expect(screen.getByRole('textbox')).toHaveValue('2 cups flour\n1/2 tsp salt')
    })

    it('does not submit form on Enter key', async () => {
      const actionHandler = vi.fn().mockResolvedValue({ parsedIngredients: [] })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const Wrapper = createTestWrapper(actionHandler)
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      await user.type(screen.getByRole('textbox'), '2 cups flour{enter}')

      // Enter should just add newline, not trigger immediate parse
      expect(actionHandler).not.toHaveBeenCalled()
    })
  })

  describe('example placeholder', () => {
    it('shows example format in placeholder', () => {
      const Wrapper = createTestWrapper(async () => ({ parsedIngredients: [] }))
      render(<Wrapper initialEntries={['/recipes/recipe-1/steps/step-1/edit']} />)

      const textarea = screen.getByRole('textbox')
      const placeholder = textarea.getAttribute('placeholder')
      expect(placeholder).toMatch(/\d+/)
      expect(placeholder?.toLowerCase()).toMatch(/cup|tbsp|tsp|oz/)
    })
  })
})
