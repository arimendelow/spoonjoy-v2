/**
 * StepEditorCard component stub.
 *
 * This is a placeholder that will be implemented in Unit 1b.
 * Tests in Unit 1a are expected to fail against this stub.
 */

import type { ParsedIngredient } from '~/lib/ingredient-parse.server'

export interface StepData {
  id: string
  stepNum: number
  stepTitle?: string
  description: string
  duration?: number
  ingredients: ParsedIngredient[]
}

export interface StepEditorCardProps {
  stepNumber: number
  step?: StepData
  recipeId: string
  onSave: (step: Omit<StepData, 'id' | 'stepNum'>) => void
  onRemove: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  disabled?: boolean
}

export function StepEditorCard(_props: StepEditorCardProps) {
  // Stub implementation - tests should fail
  return <div>StepEditorCard stub - not implemented</div>
}
