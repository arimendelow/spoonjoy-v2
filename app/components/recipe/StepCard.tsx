import { Text } from '../ui/text'
import { IngredientList, type Ingredient } from './IngredientList'
import type { StepReference } from './StepOutputUseCallout'

export interface StepCardProps {
  /** Step number (1-indexed) */
  stepNumber: number
  /** Optional step title */
  title?: string
  /** Step instructions/description */
  description: string
  /** Ingredients needed for this step */
  ingredients: Ingredient[]
  /** References to outputs from previous steps */
  stepOutputUses: StepReference[]
  /** Scale factor for ingredient quantities (default: 1) */
  scaleFactor?: number
  /** Set of checked ingredient IDs */
  checkedIngredientIds?: Set<string>
  /** Callback when an ingredient is toggled */
  onIngredientToggle?: (id: string) => void
  /** Set of checked step output IDs */
  checkedStepOutputIds?: Set<string>
  /** Callback when a step output is toggled */
  onStepOutputToggle?: (id: string) => void
  /** Callback when a step reference is clicked */
  onStepReferenceClick?: (stepNumber: number) => void
}

/**
 * A single recipe step section showing step number, ingredients, step uses, and instructions.
 *
 * Features:
 * - Editorial step heading treatment
 * - Optional step title
 * - IngredientList with checkboxes and scaling
 * - Spacious vertical rhythm for reading
 */
export function StepCard({
  stepNumber,
  title,
  description,
  ingredients,
  stepOutputUses,
  scaleFactor,
  checkedIngredientIds,
  onIngredientToggle,
  checkedStepOutputIds,
  onStepOutputToggle,
  onStepReferenceClick,
}: StepCardProps) {
  /* istanbul ignore next -- @preserve optional prop fallback defaults */
  const resolvedScaleFactor = scaleFactor ?? 1
  /* istanbul ignore next -- @preserve optional prop fallback defaults */
  const resolvedCheckedIngredientIds = checkedIngredientIds ?? new Set<string>()
  /* istanbul ignore next -- @preserve optional prop fallback defaults */
  const resolvedCheckedStepOutputIds = checkedStepOutputIds ?? new Set<string>()

  return (
    <article
      className="py-10 sm:py-12"
      aria-labelledby={`step-${stepNumber}-heading`}
    >
      <div className="space-y-3">
        <p
          data-testid="step-number"
          className="m-0 font-serif text-xs uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400"
          aria-label={`Step ${stepNumber}`}
        >
          Step {stepNumber}
        </p>
        {title && (
          <h3
            id={`step-${stepNumber}-heading`}
            className="m-0 font-serif text-2xl font-medium tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100"
          >
            {title}
          </h3>
        )}
        {!title && <span id={`step-${stepNumber}-heading`} className="sr-only">Step {stepNumber}</span>}
      </div>

      <div className="mt-8 space-y-8">
        {(ingredients.length > 0 || stepOutputUses.length > 0) && (
          <div>
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
              Ingredients
            </div>
            <IngredientList
              ingredients={ingredients}
              scaleFactor={resolvedScaleFactor}
              checkedIds={resolvedCheckedIngredientIds}
              onToggle={onIngredientToggle}
              showCheckboxes={!!onIngredientToggle || !!onStepOutputToggle}
              stepOutputUses={stepOutputUses}
              checkedStepOutputIds={resolvedCheckedStepOutputIds}
              onStepOutputToggle={onStepOutputToggle}
            />
          </div>
        )}

        <Text className="m-0 whitespace-pre-wrap text-base leading-loose sm:text-lg">
          {description}
        </Text>
      </div>
    </article>
  )
}
