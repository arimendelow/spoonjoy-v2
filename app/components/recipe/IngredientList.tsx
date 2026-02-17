import { AnimatePresence, motion } from 'framer-motion'
import type React from 'react'
import { Checkbox } from '../ui/checkbox'
import type { StepReference } from './StepOutputUseCallout'
import { INGREDIENT_ICON_COMPONENTS, type IngredientIconKey } from '~/lib/ingredient-affordances'
import { formatQuantity, scaleQuantity } from '~/lib/quantity'

export interface Ingredient {
  /** Unique identifier */
  id: string
  /** Base quantity (before scaling) */
  quantity: number | null
  /** Unit of measurement (e.g., "cups", "tbsp") */
  unit: string
  /** Ingredient name */
  name: string
  /** Optional shopping affordance category label */
  categoryLabel?: string
  /** Optional shopping affordance icon key */
  iconKey?: IngredientIconKey
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
  const orderedIngredients = ingredients
    .map((ingredient, index) => ({
      ingredient,
      index,
      checked: checkedIds.has(ingredient.id),
    }))
    .sort((a, b) => {
      if (a.checked === b.checked) {
        return a.index - b.index
      }
      return a.checked ? 1 : -1
    })

  // Return nothing for empty list (no ingredients and no step outputs)
  if (!hasIngredients && !hasStepOutputUses) {
    return null
  }

  return (
    <ul
      data-testid="ingredient-list"
      className="space-y-2"
    >
      {hasStepOutputUses && (
        <li data-testid="step-output-uses-section" className="border-l border-zinc-300 pl-4 dark:border-zinc-600">
          <ul className="space-y-2 py-1">
            {stepOutputUses.map((ref) => {
              const isChecked = checkedStepOutputIds.has(ref.id)
              const shouldShowCheckbox = showCheckboxes && onStepOutputToggle

              if (shouldShowCheckbox) {
                return (
                  <li key={ref.id}>
                    <div className="grid min-h-11 grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                      <button
                        type="button"
                        onClick={() => onStepOutputToggle(ref.id)}
                        className={`min-h-11 min-w-0 text-left text-sm transition-colors ${
                          isChecked
                            ? 'line-through text-zinc-500 dark:text-zinc-500'
                            : 'text-zinc-600 dark:text-zinc-300'
                        }`}
                      >
                        <StepReferenceText reference={ref} />
                      </button>
                      <Checkbox
                        checked={isChecked}
                        onChange={() => onStepOutputToggle(ref.id)}
                        aria-label={`Mark Step ${ref.stepNumber}${ref.stepTitle ? `: ${ref.stepTitle}` : ''} as used`}
                      />
                    </div>
                  </li>
                )
              }

              return (
                <li key={ref.id}>
                  <span className="text-sm text-zinc-600 dark:text-zinc-300">
                    <StepReferenceText reference={ref} />
                  </span>
                </li>
              )
            })}
          </ul>
        </li>
      )}

      <AnimatePresence initial={false}>
        {orderedIngredients.map(({ ingredient, checked }) => (
          <motion.li
            key={ingredient.id}
            layout
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ type: 'spring', stiffness: 520, damping: 42, mass: 0.5 }}
            className="border-b border-zinc-200 py-2 dark:border-zinc-700"
            data-testid={`ingredient-item-${ingredient.id}`}
          >
            <IngredientRow
              ingredient={ingredient}
              scaleFactor={scaleFactor}
              isChecked={checked}
              showCheckboxes={showCheckboxes}
              onToggle={onToggle}
            />
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  )
}

function IngredientRow({
  ingredient,
  scaleFactor,
  isChecked,
  showCheckboxes,
  onToggle,
}: {
  ingredient: Ingredient
  scaleFactor: number
  isChecked: boolean
  showCheckboxes: boolean
  onToggle?: (id: string) => void
}) {
  const Icon = ingredient.iconKey ? INGREDIENT_ICON_COMPONENTS[ingredient.iconKey] : null
  const quantityText = getScaledAmountLabel(ingredient, scaleFactor)
  const shouldShowCheckbox = showCheckboxes && onToggle

  return (
    <div className={`grid min-h-11 items-center gap-3 ${shouldShowCheckbox ? 'grid-cols-[minmax(0,1fr)_auto_auto]' : 'grid-cols-[minmax(0,1fr)_auto]'}`}>
      {shouldShowCheckbox ? (
        <button
          type="button"
          onClick={() => onToggle(ingredient.id)}
          className="flex min-h-11 min-w-0 items-center gap-2 text-left"
        >
          <IngredientIcon Icon={Icon} />
          <span
            className={`truncate text-base ${
              isChecked
                ? 'line-through text-zinc-500 dark:text-zinc-500'
                : 'text-zinc-900 dark:text-zinc-100'
            }`}
          >
            {ingredient.name}
          </span>
        </button>
      ) : (
        <div className="flex min-w-0 items-center gap-2">
          <IngredientIcon Icon={Icon} />
          <span
            className={`truncate text-base ${
              isChecked
                ? 'line-through text-zinc-500 dark:text-zinc-500'
                : 'text-zinc-900 dark:text-zinc-100'
            }`}
          >
            {ingredient.name}
          </span>
        </div>
      )}
      <span
        data-testid={`ingredient-quantity-${ingredient.id}`}
        className={`whitespace-nowrap text-right text-sm tabular-nums ${
          isChecked
            ? 'line-through text-zinc-400 dark:text-zinc-600'
            : 'text-zinc-600 dark:text-zinc-300'
        }`}
      >
        {quantityText || '\u00A0'}
      </span>
      {shouldShowCheckbox && (
        <Checkbox
          checked={isChecked}
          onChange={() => onToggle(ingredient.id)}
          aria-label={`Mark ${ingredient.name} as used`}
        />
      )}
    </div>
  )
}

function IngredientIcon({ Icon }: { Icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }> | null }) {
  if (Icon) {
    return <Icon className="h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-400" aria-hidden />
  }

  return (
    <span
      className="flex h-4 w-4 shrink-0 items-center justify-center text-zinc-400 dark:text-zinc-500"
      aria-hidden="true"
    >
      •
    </span>
  )
}

function getScaledAmountLabel(ingredient: Ingredient, scaleFactor: number) {
  const hasQuantity = ingredient.quantity != null && !Number.isNaN(ingredient.quantity)
  const scaledQuantity = hasQuantity ? scaleQuantity(ingredient.quantity as number, scaleFactor) : null
  const formattedQuantity = scaledQuantity != null ? formatQuantity(scaledQuantity) : ''

  return [formattedQuantity, ingredient.unit].filter(Boolean).join(' ').trim()
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
