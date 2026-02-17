'use client'

import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, Edit, ShoppingCart, Share, X, Save, Bookmark } from 'lucide-react'
import { useDockActions, type DockAction } from './dock-context'

export interface UseRecipeDetailActionsOptions {
  recipeId: string
  onSave?: () => void
  onAddToList?: () => void
  onShare?: () => void
}

export function useRecipeDetailActions({
  recipeId,
  onSave,
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
      id: 'save',
      icon: Bookmark,
      label: 'Save',
      onAction: onSave || (() => {}),
      position: 'right',
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
  ], [recipeId, navigate, onSave, onAddToList, onShare])

  useDockActions(actions)
}

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
