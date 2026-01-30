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

// Test component that displays context state and captures actions
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
    function RecipeDetailPage({ 
      recipeId, 
      onAddToList, 
      onShare 
    }: { 
      recipeId: string
      onAddToList?: () => void
      onShare?: () => void
    }) {
      useRecipeDetailActions({ recipeId, onAddToList, onShare })
      return <div data-testid="recipe-detail">Recipe Detail</div>
    }

    it('registers contextual actions on mount', () => {
      render(
        <MemoryRouter>
          <DockContextProvider>
            <ContextDisplay />
            <RecipeDetailPage recipeId="123" />
          </DockContextProvider>
        </MemoryRouter>
      )

      expect(screen.getByTestId('is-contextual')).toHaveTextContent('yes')
    })

    it('registers 4 actions: Back, Edit, Add, Share', () => {
      render(
        <MemoryRouter>
          <DockContextProvider>
            <ContextDisplay />
            <RecipeDetailPage recipeId="123" />
          </DockContextProvider>
        </MemoryRouter>
      )

      expect(screen.getByTestId('action-count')).toHaveTextContent('4')
      expect(screen.getByTestId('action-ids')).toHaveTextContent('back,edit,add-to-list,share')
    })

    it('has correct labels', () => {
      render(
        <MemoryRouter>
          <DockContextProvider>
            <ContextDisplay />
            <RecipeDetailPage recipeId="123" />
          </DockContextProvider>
        </MemoryRouter>
      )

      expect(screen.getByTestId('action-labels')).toHaveTextContent('Back,Edit,Add,Share')
    })

    it('Back action links to /recipes', () => {
      render(
        <MemoryRouter>
          <DockContextProvider>
            <ContextDisplay />
            <RecipeDetailPage recipeId="123" />
          </DockContextProvider>
        </MemoryRouter>
      )

      const backAction = capturedActions?.find(a => a.id === 'back')
      expect(backAction?.onAction).toBe('/recipes')
    })

    it('Edit action is a function that navigates to edit page', async () => {
      render(
        <MemoryRouter>
          <DockContextProvider>
            <ContextDisplay />
            <RecipeDetailPage recipeId="123" />
          </DockContextProvider>
        </MemoryRouter>
      )

      const editAction = capturedActions?.find(a => a.id === 'edit')
      expect(typeof editAction?.onAction).toBe('function')
      // Call the edit action to ensure it executes without error
      await act(async () => {
        if (typeof editAction?.onAction === 'function') {
          editAction.onAction()
        }
      })
    })

    it('calls onAddToList handler when provided', () => {
      const onAddToList = vi.fn()
      
      render(
        <MemoryRouter>
          <DockContextProvider>
            <ContextDisplay />
            <RecipeDetailPage recipeId="123" onAddToList={onAddToList} />
          </DockContextProvider>
        </MemoryRouter>
      )

      const addAction = capturedActions?.find(a => a.id === 'add-to-list')
      if (typeof addAction?.onAction === 'function') {
        addAction.onAction()
      }
      expect(onAddToList).toHaveBeenCalled()
    })

    it('calls onShare handler when provided', () => {
      const onShare = vi.fn()
      
      render(
        <MemoryRouter>
          <DockContextProvider>
            <ContextDisplay />
            <RecipeDetailPage recipeId="123" onShare={onShare} />
          </DockContextProvider>
        </MemoryRouter>
      )

      const shareAction = capturedActions?.find(a => a.id === 'share')
      if (typeof shareAction?.onAction === 'function') {
        shareAction.onAction()
      }
      expect(onShare).toHaveBeenCalled()
    })

    it('clears actions on unmount', () => {
      function App({ showDetail }: { showDetail: boolean }) {
        return (
          <DockContextProvider>
            <ContextDisplay />
            {showDetail && <RecipeDetailPage recipeId="123" />}
          </DockContextProvider>
        )
      }

      const { rerender } = render(
        <MemoryRouter>
          <App showDetail={true} />
        </MemoryRouter>
      )

      expect(screen.getByTestId('is-contextual')).toHaveTextContent('yes')

      rerender(
        <MemoryRouter>
          <App showDetail={false} />
        </MemoryRouter>
      )

      expect(screen.getByTestId('is-contextual')).toHaveTextContent('no')
    })

    it('has left/right position correctly assigned', () => {
      render(
        <MemoryRouter>
          <DockContextProvider>
            <ContextDisplay />
            <RecipeDetailPage recipeId="123" />
          </DockContextProvider>
        </MemoryRouter>
      )

      const leftActions = capturedActions?.filter(a => a.position === 'left')
      const rightActions = capturedActions?.filter(a => a.position === 'right')

      expect(leftActions?.map(a => a.id)).toEqual(['back', 'edit'])
      expect(rightActions?.map(a => a.id)).toEqual(['add-to-list', 'share'])
    })

    it('uses no-op fallback when onAddToList is not provided (function coverage)', () => {
      // Test the () => {} fallback in onAddToList || (() => {})
      render(
        <MemoryRouter>
          <DockContextProvider>
            <ContextDisplay />
            <RecipeDetailPage recipeId="123" />
          </DockContextProvider>
        </MemoryRouter>
      )

      const addAction = capturedActions?.find(a => a.id === 'add-to-list')
      // Call the action without a handler provided - should use the no-op fallback
      expect(() => {
        if (typeof addAction?.onAction === 'function') {
          addAction.onAction()
        }
      }).not.toThrow()
    })

    it('uses no-op fallback when onShare is not provided (function coverage)', () => {
      // Test the () => {} fallback in onShare || (() => {})
      render(
        <MemoryRouter>
          <DockContextProvider>
            <ContextDisplay />
            <RecipeDetailPage recipeId="123" />
          </DockContextProvider>
        </MemoryRouter>
      )

      const shareAction = capturedActions?.find(a => a.id === 'share')
      // Call the action without a handler provided - should use the no-op fallback
      expect(() => {
        if (typeof shareAction?.onAction === 'function') {
          shareAction.onAction()
        }
      }).not.toThrow()
    })
  })

  describe('useRecipeEditActions', () => {
    function RecipeEditPage({ 
      recipeId, 
      onSave 
    }: { 
      recipeId: string
      onSave?: () => void
    }) {
      useRecipeEditActions({ recipeId, onSave })
      return <div data-testid="recipe-edit">Recipe Edit</div>
    }

    it('registers contextual actions on mount', () => {
      render(
        <MemoryRouter>
          <DockContextProvider>
            <ContextDisplay />
            <RecipeEditPage recipeId="123" />
          </DockContextProvider>
        </MemoryRouter>
      )

      expect(screen.getByTestId('is-contextual')).toHaveTextContent('yes')
    })

    it('registers 2 actions: Cancel, Save', () => {
      render(
        <MemoryRouter>
          <DockContextProvider>
            <ContextDisplay />
            <RecipeEditPage recipeId="123" />
          </DockContextProvider>
        </MemoryRouter>
      )

      expect(screen.getByTestId('action-count')).toHaveTextContent('2')
      expect(screen.getByTestId('action-ids')).toHaveTextContent('cancel,save')
    })

    it('has correct labels', () => {
      render(
        <MemoryRouter>
          <DockContextProvider>
            <ContextDisplay />
            <RecipeEditPage recipeId="123" />
          </DockContextProvider>
        </MemoryRouter>
      )

      expect(screen.getByTestId('action-labels')).toHaveTextContent('Cancel,Save')
    })

    it('Cancel action links to recipe detail page', () => {
      render(
        <MemoryRouter>
          <DockContextProvider>
            <ContextDisplay />
            <RecipeEditPage recipeId="456" />
          </DockContextProvider>
        </MemoryRouter>
      )

      const cancelAction = capturedActions?.find(a => a.id === 'cancel')
      expect(cancelAction?.onAction).toBe('/recipes/456')
    })

    it('calls onSave handler when provided', () => {
      const onSave = vi.fn()
      
      render(
        <MemoryRouter>
          <DockContextProvider>
            <ContextDisplay />
            <RecipeEditPage recipeId="123" onSave={onSave} />
          </DockContextProvider>
        </MemoryRouter>
      )

      const saveAction = capturedActions?.find(a => a.id === 'save')
      if (typeof saveAction?.onAction === 'function') {
        saveAction.onAction()
      }
      expect(onSave).toHaveBeenCalled()
    })

    it('clears actions on unmount', () => {
      function App({ showEdit }: { showEdit: boolean }) {
        return (
          <DockContextProvider>
            <ContextDisplay />
            {showEdit && <RecipeEditPage recipeId="123" />}
          </DockContextProvider>
        )
      }

      const { rerender } = render(
        <MemoryRouter>
          <App showEdit={true} />
        </MemoryRouter>
      )

      expect(screen.getByTestId('is-contextual')).toHaveTextContent('yes')

      rerender(
        <MemoryRouter>
          <App showEdit={false} />
        </MemoryRouter>
      )

      expect(screen.getByTestId('is-contextual')).toHaveTextContent('no')
    })

    it('has left/right position correctly assigned', () => {
      render(
        <MemoryRouter>
          <DockContextProvider>
            <ContextDisplay />
            <RecipeEditPage recipeId="123" />
          </DockContextProvider>
        </MemoryRouter>
      )

      const leftActions = capturedActions?.filter(a => a.position === 'left')
      const rightActions = capturedActions?.filter(a => a.position === 'right')

      expect(leftActions?.map(a => a.id)).toEqual(['cancel'])
      expect(rightActions?.map(a => a.id)).toEqual(['save'])
    })

    it('uses no-op fallback when onSave is not provided (function coverage)', () => {
      // Test the () => {} fallback in onSave || (() => {})
      render(
        <MemoryRouter>
          <DockContextProvider>
            <ContextDisplay />
            <RecipeEditPage recipeId="123" />
          </DockContextProvider>
        </MemoryRouter>
      )

      const saveAction = capturedActions?.find(a => a.id === 'save')
      // Call the action without a handler provided - should use the no-op fallback
      expect(() => {
        if (typeof saveAction?.onAction === 'function') {
          saveAction.onAction()
        }
      }).not.toThrow()
    })
  })
})
