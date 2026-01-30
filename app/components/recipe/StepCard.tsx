import { Subheading } from '../ui/heading'
import { Text } from '../ui/text'
import { IngredientList, type Ingredient } from './IngredientList'
import { StepOutputUseCallout, type StepReference } from './StepOutputUseCallout'

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
 * A single recipe step card showing step number, ingredients, step uses, and instructions.
 *
 * Features:
 * - Prominent step number badge
 * - Optional step title
 * - StepOutputUseCallout for references to previous steps
 * - IngredientList with checkboxes and scaling
 * - Clear visual hierarchy
 * - Mobile-first design
 */
export function StepCard({
  stepNumber,
  title,
  description,
  ingredients,
  stepOutputUses,
  scaleFactor = 1,
  checkedIngredientIds = new Set(),
  onIngredientToggle,
  checkedStepOutputIds = new Set(),
  onStepOutputToggle,
  onStepReferenceClick,
}: StepCardProps) {
  return (
    <article
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden shadow-sm"
      aria-labelledby={`step-${stepNumber}-heading`}
    >
      {/* Step Header */}
      <div className="flex items-start gap-4 p-4 sm:p-6">
        {/* Step Number Badge */}
        <div
          data-testid="step-number"
          className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg sm:text-xl"
          aria-label={`Step ${stepNumber}`}
        >
          {stepNumber}
        </div>

        {/* Title (optional) */}
        <div className="flex-1 min-w-0 pt-1 sm:pt-2">
          {title && (
            <Subheading
              level={3}
              id={`step-${stepNumber}-heading`}
              className="text-lg sm:text-xl font-semibold m-0 truncate"
            >
              {title}
            </Subheading>
          )}
          {!title && (
            <span
              id={`step-${stepNumber}-heading`}
              className="sr-only"
            >
              Step {stepNumber}
            </span>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
        {/* Step Output Uses - shows references to previous steps */}
        <StepOutputUseCallout
          references={stepOutputUses}
          onStepClick={onStepReferenceClick}
          checkedIds={checkedStepOutputIds}
          onToggle={onStepOutputToggle}
          showCheckboxes={!!onStepOutputToggle}
        />

        {/* Ingredients Section */}
        {ingredients.length > 0 && (
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
              Ingredients
            </div>
            <IngredientList
              ingredients={ingredients}
              scaleFactor={scaleFactor}
              checkedIds={checkedIngredientIds}
              onToggle={onIngredientToggle}
              showCheckboxes={!!onIngredientToggle}
            />
          </div>
        )}

        {/* Description */}
        <Text className="text-base leading-relaxed m-0 whitespace-pre-wrap">
          {description}
        </Text>
      </div>
    </article>
  )
}
