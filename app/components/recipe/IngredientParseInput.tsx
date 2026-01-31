import clsx from 'clsx'
import { RefreshCw } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'
import { Textarea } from '~/components/ui/textarea'
import { useIngredientParser } from '~/hooks/useIngredientParser'
import type { ParsedIngredient } from '~/lib/ingredient-parse.server'

// Button styles extracted for native button compatibility
const buttonBaseStyles = [
  'relative isolate inline-flex items-center justify-center gap-x-2 rounded-lg border text-sm/6 font-semibold',
  'px-3 py-1.5',
  'focus:outline-2 focus:outline-offset-2 focus:outline-blue-500',
  'disabled:opacity-50 disabled:cursor-not-allowed',
]

const buttonOutlineStyles = [
  'border-zinc-950/10 dark:border-white/15',
  'text-zinc-950 dark:text-white',
  'hover:bg-zinc-950/5 dark:hover:bg-white/5',
]

export interface IngredientParseInputProps {
  recipeId: string
  stepId: string
  onParsed?: (ingredients: ParsedIngredient[]) => void
  onSwitchToManual?: () => void
  disabled?: boolean
  defaultValue?: string
}

/**
 * Converts technical error messages to user-friendly, actionable messages.
 */
function getActionableErrorMessage(error: string): { message: string; isRetryable: boolean } {
  // API key missing - not retryable, suggest manual mode
  if (error.includes('API key is required')) {
    return {
      message: 'AI parsing is unavailable. You can add ingredients manually using the form below.',
      isRetryable: false,
    }
  }

  // Network or connection errors - retryable
  if (
    error.includes('Failed to parse') ||
    error.includes('connection') ||
    error.includes('network') ||
    error.includes('timeout')
  ) {
    return {
      message: 'Unable to connect to AI service. Please try again or add ingredients manually.',
      isRetryable: true,
    }
  }

  // API response errors - retryable
  if (
    error.includes('No response') ||
    error.includes('Empty response') ||
    error.includes('Invalid JSON')
  ) {
    return {
      message: 'AI parsing failed to process your ingredients. Please try again or add ingredients manually.',
      isRetryable: true,
    }
  }

  // Schema validation errors - retryable (LLM might give better output)
  if (error.includes('schema')) {
    return {
      message: 'AI returned unexpected results. Please try again or add ingredients manually.',
      isRetryable: true,
    }
  }

  // Default fallback - assume retryable
  return {
    message: 'Something went wrong. Please try again or add ingredients manually.',
    isRetryable: true,
  }
}

export function IngredientParseInput({
  recipeId,
  stepId,
  onParsed,
  onSwitchToManual,
  disabled = false,
  defaultValue = '',
}: IngredientParseInputProps) {
  const id = useId()
  const labelId = `${id}-label`
  const descriptionId = `${id}-description`
  const errorId = `${id}-error`

  const parser = useIngredientParser({ recipeId, stepId })
  const hasInitialized = useRef(false)
  const prevParsedIngredients = useRef<ParsedIngredient[] | null>(null)

  // Initialize with default value
  useEffect(() => {
    if (defaultValue && !hasInitialized.current) {
      hasInitialized.current = true
      parser.setText(defaultValue)
    }
  }, [defaultValue, parser])

  // Call onParsed when parsing succeeds
  useEffect(() => {
    if (parser.parsedIngredients && parser.parsedIngredients !== prevParsedIngredients.current) {
      prevParsedIngredients.current = parser.parsedIngredients
      onParsed?.(parser.parsedIngredients)
    }
  }, [parser.parsedIngredients, onParsed])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    parser.setText(e.target.value)

    // Clear error on typing
    if (parser.error) {
      parser.clear()
      parser.setText(e.target.value)
    }

    // If text is cleared, notify parent with empty array
    if (!e.target.value.trim() && onParsed) {
      onParsed([])
    }
  }

  const isDisabled = disabled || parser.isLoading
  const hasError = !!parser.error

  // Get actionable error info
  const errorInfo = hasError ? getActionableErrorMessage(parser.error!) : null

  // Build aria-describedby based on current state
  const describedByIds = [descriptionId]
  if (hasError) {
    describedByIds.push(errorId)
  }

  const handleTryAgain = () => {
    parser.parse()
  }

  const handleSwitchToManual = () => {
    onSwitchToManual?.()
  }

  return (
    <div aria-busy={parser.isLoading}>
      <label id={labelId} htmlFor={id} className="block mb-2 text-sm font-bold">
        Ingredients
      </label>
      <Textarea
        id={id}
        rows={5}
        value={parser.text}
        onChange={handleChange}
        disabled={isDisabled}
        placeholder="Enter ingredients (e.g., 2 cups flour, 1/2 tsp salt)"
        aria-labelledby={labelId}
        aria-describedby={describedByIds.join(' ')}
        invalid={hasError}
        resizable
      />
      <p id={descriptionId} className="mt-2 text-sm text-zinc-500">
        AI will parse your ingredients automatically after you stop typing.
      </p>
      {parser.isLoading && (
        <div
          data-testid="loading-indicator"
          aria-live="polite"
          className="mt-2 flex items-center gap-2 text-sm text-zinc-500"
        >
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Parsing ingredients...
        </div>
      )}
      {hasError && errorInfo && (
        <div
          id={errorId}
          role="alert"
          className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <p className="text-sm text-red-700 dark:text-red-300 mb-2">
            {errorInfo.message}
          </p>
          <div className="flex gap-2">
            {errorInfo.isRetryable && parser.text.trim() && (
              <button
                type="button"
                onClick={handleTryAgain}
                disabled={parser.isLoading}
                className={clsx(buttonBaseStyles, buttonOutlineStyles, 'cursor-default')}
                data-testid="try-again-button"
                aria-label="Try parsing ingredients again"
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                Try Again
              </button>
            )}
            {onSwitchToManual && (
              <button
                type="button"
                onClick={handleSwitchToManual}
                className={clsx(buttonBaseStyles, buttonOutlineStyles, 'cursor-default')}
                data-testid="switch-to-manual-button"
                aria-label="Switch to manual ingredient entry"
              >
                Add Manually
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
