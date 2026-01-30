import { Checkbox, CheckboxField } from '../ui/checkbox'
import { ScaledQuantity } from './ScaledQuantity'

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
}

/**
 * A checkable ingredient list with scaled quantities.
 *
 * Features:
 * - Checkboxes for tracking cooking progress
 * - Scaled quantities using ScaledQuantity component
 * - Strikethrough styling for checked items
 * - Large touch targets for kitchen use
 */
export function IngredientList({
  ingredients,
  scaleFactor = 1,
  checkedIds = new Set(),
  onToggle,
  showCheckboxes = true,
}: IngredientListProps) {
  // Return nothing for empty list
  if (ingredients.length === 0) {
    return null
  }

  return (
    <ul
      data-testid="ingredient-list"
      className="space-y-2"
    >
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
                <span
                  className={
                    isChecked
                      ? 'line-through text-zinc-500 dark:text-zinc-500'
                      : 'text-zinc-900 dark:text-white'
                  }
                >
                  <ScaledQuantity
                    quantity={ingredient.quantity}
                    unit={ingredient.unit}
                    name={ingredient.name}
                    scaleFactor={scaleFactor}
                  />
                </span>
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
