import { Checkbox, CheckboxField } from '../ui/checkbox'
import { Label } from '../ui/fieldset'
import { ScaledQuantity } from './ScaledQuantity'
import type { StepReference } from './StepOutputUseCallout'

export interface Ingredient {
  /** Unique identifier */
  id: string
  /** Base quantity (before scaling) */
  quantity: number | null
  /** Unit of measurement (e.g., "cups", "tbsp") */
  unit: string
  /** Ingredient name */
  name: string
}

export interface IngredientListProps {
  /** Array of ingredients to display */
  ingredients: Ingredient[]
  /** Scale factor for quantities (default: 1) */
  scaleFactor?: number
  /** Set of checked ingredient IDs */
  checkedIds?: Set<string>
  /** Callback when an ingredient is toggled */
  onToggle?: (id: string) => void
  /** Whether to show checkboxes (default: true) */
  showCheckboxes?: boolean
  /** Optional step output uses to render at the top of the list */
  stepOutputUses?: StepReference[]
  /** Set of checked step output IDs */
  checkedStepOutputIds?: Set<string>
  /** Callback when a step output is toggled */
  onStepOutputToggle?: (id: string) => void
}

/**
 * A checkable ingredient list with scaled quantities.
 *
 * Features:
 * - Checkboxes for tracking cooking progress
 * - Scaled quantities using ScaledQuantity component
 * - Strikethrough styling for checked items
 * - Large touch targets for kitchen use
 * - Optional step output uses rendered at the top with amber styling
 */
export function IngredientList({
  ingredients,
  scaleFactor = 1,
  checkedIds = new Set(),
  onToggle,
  showCheckboxes = true,
  stepOutputUses = [],
  checkedStepOutputIds = new Set(),
  onStepOutputToggle,
}: IngredientListProps) {
  const hasStepOutputUses = stepOutputUses.length > 0
  const hasIngredients = ingredients.length > 0

  // Return nothing for empty list (no ingredients and no step outputs)
  if (!hasIngredients && !hasStepOutputUses) {
    return null
  }

  return (
    <ul
      data-testid="ingredient-list"
      className="space-y-2"
    >
      {/* Step Output Uses (rendered at top with amber styling) */}
      {hasStepOutputUses && (
        <div
          data-testid="step-output-uses-section"
          className="bg-amber-50 dark:bg-amber-950/30 rounded-lg px-3 py-2 -mx-1 space-y-1"
        >
          {stepOutputUses.map((ref) => {
            const isChecked = checkedStepOutputIds.has(ref.id)
            const shouldShowCheckbox = showCheckboxes && onStepOutputToggle

            if (shouldShowCheckbox) {
              return (
                <li key={ref.id}>
                  <CheckboxField>
                    <Checkbox
                      checked={isChecked}
                      onChange={() => onStepOutputToggle(ref.id)}
                      aria-label={`Mark Step ${ref.stepNumber}${ref.stepTitle ? `: ${ref.stepTitle}` : ''} as used`}
                    />
                    <Label
                      className={`cursor-pointer text-sm ${
                        isChecked
                          ? 'line-through text-zinc-500 dark:text-zinc-500'
                          : 'text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      <StepReferenceText reference={ref} />
                    </Label>
                  </CheckboxField>
                </li>
              )
            }

            return (
              <li key={ref.id} className="py-1">
                <span className="text-sm text-amber-700 dark:text-amber-300">
                  <StepReferenceText reference={ref} />
                </span>
              </li>
            )
          })}
        </div>
      )}

      {/* Ingredients */}
      {ingredients.map((ingredient) => {
        const isChecked = checkedIds.has(ingredient.id)

        if (showCheckboxes && onToggle) {
          return (
            <li key={ingredient.id}>
              <CheckboxField>
                <Checkbox
                  checked={isChecked}
                  onChange={() => onToggle(ingredient.id)}
                  aria-label={`Mark ${ingredient.name} as used`}
                />
                <Label
                  className={`cursor-pointer ${
                    isChecked
                      ? 'line-through text-zinc-500 dark:text-zinc-500'
                      : 'text-zinc-900 dark:text-white'
                  }`}
                >
                  <ScaledQuantity
                    quantity={ingredient.quantity}
                    unit={ingredient.unit}
                    name={ingredient.name}
                    scaleFactor={scaleFactor}
                  />
                </Label>
              </CheckboxField>
            </li>
          )
        }

        return (
          <li key={ingredient.id} className="py-1">
            <ScaledQuantity
              quantity={ingredient.quantity}
              unit={ingredient.unit}
              name={ingredient.name}
              scaleFactor={scaleFactor}
            />
          </li>
        )
      })}
    </ul>
  )
}

function StepReferenceText({ reference }: { reference: StepReference }) {
  if (reference.stepTitle) {
    return (
      <>
        <span className="font-medium">Step {reference.stepNumber}</span>
        {': '}
        {reference.stepTitle}
      </>
    )
  }

  return <span className="font-medium">Step {reference.stepNumber}</span>
}
