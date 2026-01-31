import clsx from 'clsx'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { useState } from 'react'
import { Input } from '~/components/ui/input'
import type { ParsedIngredient } from '~/lib/ingredient-parse.server'

// Button styles extracted from ~/components/ui/button.tsx for native button compatibility
const iconButtonBaseStyles = [
  'relative isolate inline-flex items-center justify-center rounded-lg border text-sm/6 font-semibold',
  'p-1.5',
  'focus:outline-2 focus:outline-offset-2 focus:outline-blue-500',
  'disabled:opacity-50 disabled:cursor-not-allowed',
]

const iconButtonPlainStyles = [
  'border-transparent',
  'text-zinc-950 hover:bg-zinc-950/5',
  'dark:text-white dark:hover:bg-white/10',
]

const iconButtonGreenStyles = [
  'border-transparent',
  'text-green-600 hover:bg-green-600/10',
  'dark:text-green-400 dark:hover:bg-green-400/10',
]

const iconButtonRedStyles = [
  'border-transparent',
  'text-red-600 hover:bg-red-600/10',
  'dark:text-red-400 dark:hover:bg-red-400/10',
]

export interface ParsedIngredientRowProps {
  ingredient: ParsedIngredient
  onEdit: (ingredient: ParsedIngredient) => void
  onRemove: (ingredient: ParsedIngredient) => void
  disabled?: boolean
}

export function ParsedIngredientRow({
  ingredient,
  onEdit,
  onRemove,
  disabled = false,
}: ParsedIngredientRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editQuantity, setEditQuantity] = useState<string>(String(ingredient.quantity))
  const [editUnit, setEditUnit] = useState(ingredient.unit)
  const [editIngredientName, setEditIngredientName] = useState(ingredient.ingredientName)

  const handleEditClick = () => {
    // Reset edit values to current ingredient values
    setEditQuantity(String(ingredient.quantity))
    setEditUnit(ingredient.unit)
    setEditIngredientName(ingredient.ingredientName)
    setIsEditing(true)
  }

  const handleSave = () => {
    const trimmedUnit = editUnit.trim()
    const trimmedIngredientName = editIngredientName.trim()
    const parsedQuantity = parseFloat(editQuantity)

    // Validate
    if (!editQuantity || !trimmedUnit || !trimmedIngredientName) {
      return
    }
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return
    }

    onEdit({
      quantity: parsedQuantity,
      unit: trimmedUnit,
      ingredientName: trimmedIngredientName,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }

  // Format quantity - show decimals only if needed
  const formatQuantity = (qty: number): string => {
    return Number.isInteger(qty) ? String(qty) : String(qty)
  }

  if (isEditing) {
    return (
      <li className="flex items-center gap-2 py-2" onKeyDown={handleKeyDown}>
        <div className="flex-1 grid grid-cols-[1fr_1fr_2fr] gap-2">
          <div>
            <label htmlFor="edit-quantity" className="sr-only">
              Quantity
            </label>
            <Input
              type="number"
              id="edit-quantity"
              value={editQuantity}
              onChange={(e) => setEditQuantity(e.target.value)}
              step="any"
              min="0.001"
              required
              aria-label="Quantity"
            />
          </div>
          <div>
            <label htmlFor="edit-unit" className="sr-only">
              Unit
            </label>
            <Input
              type="text"
              id="edit-unit"
              value={editUnit}
              onChange={(e) => setEditUnit(e.target.value)}
              required
              aria-label="Unit"
            />
          </div>
          <div>
            <label htmlFor="edit-ingredient" className="sr-only">
              Ingredient
            </label>
            <Input
              type="text"
              id="edit-ingredient"
              value={editIngredientName}
              onChange={(e) => setEditIngredientName(e.target.value)}
              required
              aria-label="Ingredient"
            />
          </div>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={handleSave}
            className={clsx(iconButtonBaseStyles, iconButtonGreenStyles, 'cursor-default')}
            aria-label="Save"
          >
            <Check className="size-4" />
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className={clsx(iconButtonBaseStyles, iconButtonPlainStyles, 'cursor-default')}
            aria-label="Cancel"
          >
            <X className="size-4" />
          </button>
        </div>
      </li>
    )
  }

  return (
    <li className="flex items-center gap-2 py-2">
      <div className="flex-1 flex items-center gap-2">
        <span className="font-medium">{formatQuantity(ingredient.quantity)}</span>
        <span className="text-zinc-600 dark:text-zinc-400">{ingredient.unit}</span>
        <span>{ingredient.ingredientName}</span>
      </div>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={handleEditClick}
          disabled={disabled}
          className={clsx(iconButtonBaseStyles, iconButtonPlainStyles, 'cursor-default')}
          aria-label="Edit"
        >
          <Pencil className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => onRemove(ingredient)}
          disabled={disabled}
          className={clsx(iconButtonBaseStyles, iconButtonRedStyles, 'cursor-default')}
          aria-label="Remove"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </li>
  )
}
