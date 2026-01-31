import clsx from 'clsx'
import { Plus } from 'lucide-react'
import { ParsedIngredientRow } from './ParsedIngredientRow'
import type { ParsedIngredient } from '~/lib/ingredient-parse.server'

// Button styles extracted from ~/components/ui/button.tsx for native button compatibility
const buttonBaseStyles = [
  'relative isolate inline-flex items-center justify-center gap-x-2 rounded-lg border text-base/6 font-semibold',
  'px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] sm:px-[calc(--spacing(3)-1px)] sm:py-[calc(--spacing(1.5)-1px)] sm:text-sm/6',
  'focus:outline-2 focus:outline-offset-2 focus:outline-blue-500',
  'disabled:opacity-50 disabled:cursor-not-allowed',
]

const buttonSolidStyles = [
  'border-transparent bg-(--btn-border)',
  'dark:bg-(--btn-bg)',
  'before:absolute before:inset-0 before:-z-10 before:rounded-[calc(var(--radius-lg)-1px)] before:bg-(--btn-bg)',
  'before:shadow-sm',
  'dark:before:hidden',
  'dark:border-white/5',
  'after:absolute after:inset-0 after:-z-10 after:rounded-[calc(var(--radius-lg)-1px)]',
  'after:shadow-[inset_0_1px_--theme(--color-white/15%)]',
  'hover:after:bg-(--btn-hover-overlay)',
  'dark:after:-inset-px dark:after:rounded-lg',
  'disabled:before:shadow-none disabled:after:shadow-none',
]

const buttonGreenStyles = [
  'text-white [--btn-hover-overlay:var(--color-white)]/10 [--btn-bg:var(--color-green-600)] [--btn-border:var(--color-green-700)]/90',
  '[--btn-icon:var(--color-white)]/60 hover:[--btn-icon:var(--color-white)]/80',
]

export interface ParsedIngredientListProps {
  ingredients: ParsedIngredient[]
  onEdit: (index: number, ingredient: ParsedIngredient) => void
  onRemove: (index: number) => void
  onAddAll: (ingredients: ParsedIngredient[]) => void
  disabled?: boolean
  loading?: boolean
}

export function ParsedIngredientList({
  ingredients,
  onEdit,
  onRemove,
  onAddAll,
  disabled = false,
  loading = false,
}: ParsedIngredientListProps) {
  const isDisabled = disabled || loading

  const handleRowEdit = (index: number) => (updatedIngredient: ParsedIngredient) => {
    onEdit(index, updatedIngredient)
  }

  const handleRowRemove = (index: number) => () => {
    onRemove(index)
  }

  const handleAddAll = () => {
    onAddAll(ingredients)
  }

  if (ingredients.length === 0) {
    return (
      <div className="py-4">
        <p className="text-zinc-500 dark:text-zinc-400 text-center">No ingredients parsed yet</p>
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">
        Parsed Ingredients ({ingredients.length})
      </h3>
      <ul className="list-none p-0 m-0 divide-y divide-zinc-200 dark:divide-zinc-700" role="list">
        {ingredients.map((ingredient, index) => (
          <ParsedIngredientRow
            key={index}
            ingredient={ingredient}
            onEdit={handleRowEdit(index)}
            onRemove={handleRowRemove(index)}
            disabled={isDisabled}
          />
        ))}
      </ul>
      <div className="mt-4">
        <button
          type="button"
          onClick={handleAddAll}
          disabled={isDisabled}
          aria-busy={loading}
          className={clsx(buttonBaseStyles, buttonSolidStyles, buttonGreenStyles, 'cursor-default')}
        >
          <Plus className="size-4" />
          Add All ({ingredients.length})
        </button>
      </div>
    </div>
  )
}
