import { useEffect, useId, useRef } from 'react'
import { Textarea } from '~/components/ui/textarea'
import { useIngredientParser } from '~/hooks/useIngredientParser'
import type { ParsedIngredient } from '~/lib/ingredient-parse.server'

export interface IngredientParseInputProps {
  recipeId: string
  stepId: string
  onParsed?: (ingredients: ParsedIngredient[]) => void
  disabled?: boolean
  defaultValue?: string
}

export function IngredientParseInput({
  recipeId,
  stepId,
  onParsed,
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

  // Build aria-describedby based on current state
  const describedByIds = [descriptionId]
  if (hasError) {
    describedByIds.push(errorId)
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
      {hasError && (
        <p id={errorId} role="alert" className="mt-2 text-sm text-red-600">
          {parser.error}
        </p>
      )}
    </div>
  )
}
