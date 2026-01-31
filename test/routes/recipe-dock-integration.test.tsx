import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MemoryRouter, useNavigate } from 'react-router'
import {
  DockContextProvider,
  useDockContext,
  useRecipeDetailActions,
  useRecipeEditActions,
  type DockAction,
} from '~/components/navigation'

// Mock useNavigate
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useNavigate: vi.fn(),
  }
})

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
      <div data-testid="action-positions">{actions?.map(a => `${a.id}:${a.position}`).join(',') ?? ''}</div>
    </div>
  )
}

describe('Recipe Page Dock Integration', () => {
  const mockNavigate = vi.fn()

  beforeEach(() => {
    capturedActions = null
    mockNavigate.mockClear()
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)
  })

  describe('Recipe Detail Page (/recipes/:id)', () => {
    function RecipeDetailPage({
      recipeId,
      onAddToList,
      onShare,
    }: {
      recipeId: string
      onAddToList?: () => void
      onShare?: () => void
    }) {
      useRecipeDetailActions({ recipeId, onAddToList, onShare })
      return <div data-testid="recipe-detail">Recipe Detail Page for {recipeId}</div>
    }

    it('should register Back, Edit, Add to List, Share actions via useRecipeDetailActions', () => {
      render(
        <MemoryRouter>
          <DockContextProvider>
            <ContextDisplay />
            <RecipeDetailPage recipeId="recipe-123" />
          </DockContextProvider>
        </MemoryRouter>
      )

      expect(screen.getByTestId('is-contextual')).toHaveTextContent('yes')
      expect(screen.getByTestId('action-count')).toHaveTextContent('4')
      expect(screen.getByTestId('action-ids')).toHaveTextContent('back,edit,add-to-list,share')
    })

    it('should have Back and Edit on the left, Add to List and Share on the right', () => {
      render(
        <MemoryRouter>
          <DockContextProvider>
            <ContextDisplay />
            <RecipeDetailPage recipeId="recipe-123" />
          </DockContextProvider>
        </MemoryRouter>
      )

      const leftActions = capturedActions?.filter(a => a.position === 'left')
      const rightActions = capturedActions?.filter(a => a.position === 'right')

      expect(leftActions?.map(a => a.id)).toEqual(['back', 'edit'])
      expect(rightActions?.map(a => a.id)).toEqual(['add-to-list', 'share'])
    })

    it('Back action should navigate to /recipes', () => {
      render(
        <MemoryRouter>
          <DockContextProvider>
            <ContextDisplay />
            <RecipeDetailPage recipeId="recipe-123" />
          </DockContextProvider>
        </MemoryRouter>
      )

      const backAction = capturedActions?.find(a => a.id === 'back')
      expect(backAction?.onAction).toBe('/recipes')
    })

    it('Edit action should navigate to /recipes/:id/edit', async () => {
      render(
        <MemoryRouter>
          <DockContextProvider>
            <ContextDisplay />
            <RecipeDetailPage recipeId="recipe-456" />
          </DockContextProvider>
        </MemoryRouter>
      )

      const editAction = capturedActions?.find(a => a.id === 'edit')
      expect(typeof editAction?.onAction).toBe('function')

      // Execute the action
      await act(async () => {
        if (typeof editAction?.onAction === 'function') {
          editAction.onAction()
        }
      })

      expect(mockNavigate).toHaveBeenCalledWith('/recipes/recipe-456/edit')
    })

    it('actions are cleared on unmount (cleanup)', () => {
      function App({ showDetail }: { showDetail: boolean }) {
        return (
          <DockContextProvider>
            <ContextDisplay />
            {showDetail && <RecipeDetailPage recipeId="recipe-123" />}
          </DockContextProvider>
        )
      }

      const { rerender } = render(
        <MemoryRouter>
          <App showDetail={true} />
        </MemoryRouter>
      )

      expect(screen.getByTestId('is-contextual')).toHaveTextContent('yes')
      expect(screen.getByTestId('action-count')).toHaveTextContent('4')

      rerender(
        <MemoryRouter>
          <App showDetail={false} />
        </MemoryRouter>
      )

      expect(screen.getByTestId('is-contextual')).toHaveTextContent('no')
      expect(screen.getByTestId('action-count')).toHaveTextContent('0')
    })

    it('Add to List action calls provided handler', () => {
      const onAddToList = vi.fn()

      render(
        <MemoryRouter>
          <DockContextProvider>
            <ContextDisplay />
            <RecipeDetailPage recipeId="recipe-123" onAddToList={onAddToList} />
          </DockContextProvider>
        </MemoryRouter>
      )

      const addAction = capturedActions?.find(a => a.id === 'add-to-list')
      if (typeof addAction?.onAction === 'function') {
        addAction.onAction()
      }

      expect(onAddToList).toHaveBeenCalled()
    })

    it('Share action calls provided handler', () => {
      const onShare = vi.fn()

      render(
        <MemoryRouter>
          <DockContextProvider>
            <ContextDisplay />
            <RecipeDetailPage recipeId="recipe-123" onShare={onShare} />
          </DockContextProvider>
        </MemoryRouter>
      )

      const shareAction = capturedActions?.find(a => a.id === 'share')
      if (typeof shareAction?.onAction === 'function') {
        shareAction.onAction()
      }

      expect(onShare).toHaveBeenCalled()
    })
  })

  describe('Recipe Edit Page (/recipes/:id/edit)', () => {
    function RecipeEditPage({
      recipeId,
      onSave,
    }: {
      recipeId: string
      onSave?: () => void
    }) {
      useRecipeEditActions({ recipeId, onSave })
      return <div data-testid="recipe-edit">Recipe Edit Page for {recipeId}</div>
    }

    it('should register Cancel, Save actions via useRecipeEditActions', () => {
      render(
        <MemoryRouter>
          <DockContextProvider>
            <ContextDisplay />
            <RecipeEditPage recipeId="recipe-123" />
          </DockContextProvider>
        </MemoryRouter>
      )

      expect(screen.getByTestId('is-contextual')).toHaveTextContent('yes')
      expect(screen.getByTestId('action-count')).toHaveTextContent('2')
      expect(screen.getByTestId('action-ids')).toHaveTextContent('cancel,save')
    })

    it('should have Cancel on the left, Save on the right', () => {
      render(
        <MemoryRouter>
          <DockContextProvider>
            <ContextDisplay />
            <RecipeEditPage recipeId="recipe-123" />
          </DockContextProvider>
        </MemoryRouter>
      )

      const leftActions = capturedActions?.filter(a => a.position === 'left')
      const rightActions = capturedActions?.filter(a => a.position === 'right')

      expect(leftActions?.map(a => a.id)).toEqual(['cancel'])
      expect(rightActions?.map(a => a.id)).toEqual(['save'])
    })

    it('Cancel action should navigate back to detail page (/recipes/:id)', () => {
      render(
        <MemoryRouter>
          <DockContextProvider>
            <ContextDisplay />
            <RecipeEditPage recipeId="recipe-789" />
          </DockContextProvider>
        </MemoryRouter>
      )

      const cancelAction = capturedActions?.find(a => a.id === 'cancel')
      expect(cancelAction?.onAction).toBe('/recipes/recipe-789')
    })

    it('Save action calls provided handler', () => {
      const onSave = vi.fn()

      render(
        <MemoryRouter>
          <DockContextProvider>
            <ContextDisplay />
            <RecipeEditPage recipeId="recipe-123" onSave={onSave} />
          </DockContextProvider>
        </MemoryRouter>
      )

      const saveAction = capturedActions?.find(a => a.id === 'save')
      if (typeof saveAction?.onAction === 'function') {
        saveAction.onAction()
      }

      expect(onSave).toHaveBeenCalled()
    })

    it('actions are cleared on unmount (cleanup)', () => {
      function App({ showEdit }: { showEdit: boolean }) {
        return (
          <DockContextProvider>
            <ContextDisplay />
            {showEdit && <RecipeEditPage recipeId="recipe-123" />}
          </DockContextProvider>
        )
      }

      const { rerender } = render(
        <MemoryRouter>
          <App showEdit={true} />
        </MemoryRouter>
      )

      expect(screen.getByTestId('is-contextual')).toHaveTextContent('yes')
      expect(screen.getByTestId('action-count')).toHaveTextContent('2')

      rerender(
        <MemoryRouter>
          <App showEdit={false} />
        </MemoryRouter>
      )

      expect(screen.getByTestId('is-contextual')).toHaveTextContent('no')
      expect(screen.getByTestId('action-count')).toHaveTextContent('0')
    })
  })

  describe('Navigation between pages', () => {
    function RecipeDetailPage({ recipeId }: { recipeId: string }) {
      useRecipeDetailActions({ recipeId })
      return <div data-testid="recipe-detail">Detail</div>
    }

    function RecipeEditPage({ recipeId }: { recipeId: string }) {
      useRecipeEditActions({ recipeId })
      return <div data-testid="recipe-edit">Edit</div>
    }

    it('switching from detail to edit page updates actions', () => {
      function App({ page }: { page: 'detail' | 'edit' }) {
        return (
          <DockContextProvider>
            <ContextDisplay />
            {page === 'detail' && <RecipeDetailPage recipeId="recipe-123" />}
            {page === 'edit' && <RecipeEditPage recipeId="recipe-123" />}
          </DockContextProvider>
        )
      }

      const { rerender } = render(
        <MemoryRouter>
          <App page="detail" />
        </MemoryRouter>
      )

      expect(screen.getByTestId('action-ids')).toHaveTextContent('back,edit,add-to-list,share')

      rerender(
        <MemoryRouter>
          <App page="edit" />
        </MemoryRouter>
      )

      expect(screen.getByTestId('action-ids')).toHaveTextContent('cancel,save')
    })

    it('switching from edit to detail page updates actions', () => {
      function App({ page }: { page: 'detail' | 'edit' }) {
        return (
          <DockContextProvider>
            <ContextDisplay />
            {page === 'detail' && <RecipeDetailPage recipeId="recipe-123" />}
            {page === 'edit' && <RecipeEditPage recipeId="recipe-123" />}
          </DockContextProvider>
        )
      }

      const { rerender } = render(
        <MemoryRouter>
          <App page="edit" />
        </MemoryRouter>
      )

      expect(screen.getByTestId('action-ids')).toHaveTextContent('cancel,save')

      rerender(
        <MemoryRouter>
          <App page="detail" />
        </MemoryRouter>
      )

      expect(screen.getByTestId('action-ids')).toHaveTextContent('back,edit,add-to-list,share')
    })
  })
})
