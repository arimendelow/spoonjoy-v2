'use client'

import { useMemo } from 'react'
import { Edit, ShoppingCart, Share, X, Save, Bookmark, User } from 'lucide-react'
import { useDockActions, type DockAction } from './dock-context'

export interface UseRecipeDetailActionsOptions {
  recipeId: string
  chefId: string
  isOwner: boolean
  onSave?: () => void
  onAddToList?: () => void
  onShare?: () => void
}

export function useRecipeDetailActions({
  recipeId,
  chefId,
  isOwner,
  onSave,
  onAddToList,
  onShare,
}: UseRecipeDetailActionsOptions): void {
  const actions = useMemo<DockAction[]>(() => {
    const leftActions: DockAction[] = isOwner
      ? [
          {
            id: 'edit',
            icon: Edit,
            label: 'Edit',
            onAction: `/recipes/${recipeId}/edit`,
            position: 'left',
          },
          {
            id: 'add-to-list',
            icon: ShoppingCart,
            label: 'Add to List',
            onAction: onAddToList || (() => {}),
            position: 'left',
          },
        ]
      : [
          {
            id: 'view-chef-profile',
            icon: User,
            label: 'View Chef Profile',
            onAction: `/users/${chefId}`,
            position: 'left',
          },
          {
            id: 'add-to-list',
            icon: ShoppingCart,
            label: 'Add to List',
            onAction: onAddToList || (() => {}),
            position: 'left',
          },
        ]

    return [
      ...leftActions,
      {
        id: 'save',
        icon: Bookmark,
        label: 'Save',
        onAction: onSave || (() => {}),
        position: 'right',
      },
      {
        id: 'share',
        icon: Share,
        label: 'Share',
        onAction: onShare || (() => {}),
        position: 'right',
      },
    ]
  }, [recipeId, chefId, isOwner, onSave, onAddToList, onShare])

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
