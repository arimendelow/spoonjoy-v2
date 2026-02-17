import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import {
  DockContextProvider,
  useDockContext,
  useRecipeDetailActions,
  useRecipeEditActions,
  type DockAction,
} from '~/components/navigation'

let capturedActions: DockAction[] | null = null

function ContextDisplay() {
  const { actions, isContextual } = useDockContext()
  capturedActions = actions
  return (
    <div>
      <div data-testid="is-contextual">{isContextual ? 'yes' : 'no'}</div>
      <div data-testid="action-count">{actions?.length ?? 0}</div>
      <div data-testid="action-ids">{actions?.map(a => a.id).join(',') ?? ''}</div>
      <div data-testid="action-labels">{actions?.map(a => a.label).join(',') ?? ''}</div>
    </div>
  )
}

describe('Recipe Dock Actions', () => {
  beforeEach(() => {
    capturedActions = null
  })

  describe('useRecipeDetailActions', () => {
    function RecipeDetailPage({ recipeId, isOwner, onSave, onAddToList, onShare }: {
      recipeId: string
      isOwner: boolean
      onSave?: () => void
      onAddToList?: () => void
      onShare?: () => void
    }) {
      useRecipeDetailActions({ recipeId, isOwner, onSave, onAddToList, onShare })
      return <div data-testid="recipe-detail">Recipe Detail</div>
    }

    it('owner layout is Back/Edit left and Save/Share right', () => {
      render(<MemoryRouter><DockContextProvider><ContextDisplay /><RecipeDetailPage recipeId="123" isOwner={true} /></DockContextProvider></MemoryRouter>)
      expect(screen.getByTestId('action-count')).toHaveTextContent('4')
      expect(screen.getByTestId('action-ids')).toHaveTextContent('back,edit,save,share')
      expect(screen.getByTestId('action-labels')).toHaveTextContent('Back,Edit,Save,Share')
    })

    it('non-owner layout is Back/Add left and Save/Share right', () => {
      render(<MemoryRouter><DockContextProvider><ContextDisplay /><RecipeDetailPage recipeId="123" isOwner={false} /></DockContextProvider></MemoryRouter>)
      expect(screen.getByTestId('action-count')).toHaveTextContent('4')
      expect(screen.getByTestId('action-ids')).toHaveTextContent('back,add-to-list,save,share')
      const left = capturedActions?.filter(a => a.position === 'left').map(a => a.id)
      const right = capturedActions?.filter(a => a.position === 'right').map(a => a.id)
      expect(left).toEqual(['back', 'add-to-list'])
      expect(right).toEqual(['save', 'share'])
    })

    it('edit action exists only for owner', async () => {
      render(<MemoryRouter><DockContextProvider><ContextDisplay /><RecipeDetailPage recipeId="123" isOwner={true} /></DockContextProvider></MemoryRouter>)
      const edit = capturedActions?.find(a => a.id === 'edit')
      expect(typeof edit?.onAction).toBe('function')
      await act(async () => { if (typeof edit?.onAction === 'function') edit.onAction() })

      render(<MemoryRouter><DockContextProvider><ContextDisplay /><RecipeDetailPage recipeId="123" isOwner={false} /></DockContextProvider></MemoryRouter>)
      expect(capturedActions?.some(a => a.id === 'edit')).toBe(false)
    })

    it('calls handlers when provided', () => {
      const onSave = vi.fn(); const onAddToList = vi.fn(); const onShare = vi.fn()
      render(<MemoryRouter><DockContextProvider><ContextDisplay /><RecipeDetailPage recipeId="123" isOwner={false} onSave={onSave} onAddToList={onAddToList} onShare={onShare} /></DockContextProvider></MemoryRouter>)
      capturedActions?.find(a => a.id === 'save')?.onAction?.()
      capturedActions?.find(a => a.id === 'add-to-list')?.onAction?.()
      capturedActions?.find(a => a.id === 'share')?.onAction?.()
      expect(onSave).toHaveBeenCalled()
      expect(onAddToList).toHaveBeenCalled()
      expect(onShare).toHaveBeenCalled()
    })
  })

  describe('useRecipeEditActions', () => {
    function RecipeEditPage({ recipeId, onSave }: { recipeId: string; onSave?: () => void }) {
      useRecipeEditActions({ recipeId, onSave })
      return <div data-testid="recipe-edit">Recipe Edit</div>
    }

    it('registers Cancel and Save', () => {
      render(<MemoryRouter><DockContextProvider><ContextDisplay /><RecipeEditPage recipeId="456" /></DockContextProvider></MemoryRouter>)
      expect(screen.getByTestId('action-ids')).toHaveTextContent('cancel,save')
      expect(capturedActions?.find(a => a.id === 'cancel')?.onAction).toBe('/recipes/456')
    })
  })
})
