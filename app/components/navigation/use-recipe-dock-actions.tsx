'use client'

import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, Edit, ShoppingCart, Share, X, Save } from 'lucide-react'
import { useDockActions, type DockAction } from './dock-context'

/**
 * Hook to register contextual dock actions for recipe detail pages.
 * 
 * On recipe detail (/recipes/:id):
 * - Back: Navigate to recipes list
 * - Edit: Navigate to edit page
 * - Add to List: Add ingredients to shopping list
 * - Share: Share recipe via native share or copy link
 * 
 * @param recipeId - The recipe ID
 * @param handlers - Action handlers
 */
export interface UseRecipeDetailActionsOptions {
  recipeId: string
  onAddToList?: () => void
  onShare?: () => void
}

export function useRecipeDetailActions({
  recipeId,
  onAddToList,
  onShare,
}: UseRecipeDetailActionsOptions): void {
  const navigate = useNavigate()

  const actions = useMemo<DockAction[]>(() => [
    {
      id: 'back',
      icon: ArrowLeft,
      label: 'Back',
      onAction: '/recipes',
      position: 'left',
    },
    {
      id: 'edit',
      icon: Edit,
      label: 'Edit',
      onAction: () => navigate(`/recipes/${recipeId}/edit`),
      position: 'left',
    },
    {
      id: 'add-to-list',
      icon: ShoppingCart,
      label: 'Add',
      onAction: onAddToList || (() => {}),
      position: 'right',
    },
    {
      id: 'share',
      icon: Share,
      label: 'Share',
      onAction: onShare || (() => {}),
      position: 'right',
    },
  ], [recipeId, navigate, onAddToList, onShare])

  useDockActions(actions)
}

/**
 * Hook to register contextual dock actions for recipe edit pages.
 * 
 * On recipe edit (/recipes/:id/edit):
 * - Cancel: Navigate back to detail view
 * - Save: Submit form
 * 
 * @param recipeId - The recipe ID
 * @param handlers - Action handlers
 */
export interface UseRecipeEditActionsOptions {
  recipeId: string
  onSave?: () => void
}

export function useRecipeEditActions({
  recipeId,
  onSave,
}: UseRecipeEditActionsOptions): void {
  const actions = useMemo<DockAction[]>(() => [
    {
      id: 'cancel',
      icon: X,
      label: 'Cancel',
      onAction: `/recipes/${recipeId}`,
      position: 'left',
    },
    {
      id: 'save',
      icon: Save,
      label: 'Save',
      onAction: onSave || (() => {}),
      position: 'right',
    },
  ], [recipeId, onSave])

  useDockActions(actions)
}
