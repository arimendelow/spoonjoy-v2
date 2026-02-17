import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MemoryRouter, useNavigate } from 'react-router'
import { DockContextProvider, useDockContext, useRecipeDetailActions, useRecipeEditActions, type DockAction } from '~/components/navigation'

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return { ...actual, useNavigate: vi.fn() }
})

let capturedActions: DockAction[] | null = null
function ContextDisplay() {
  const { actions, isContextual } = useDockContext()
  capturedActions = actions
  return <><div data-testid="is-contextual">{isContextual ? 'yes' : 'no'}</div><div data-testid="action-ids">{actions?.map(a => a.id).join(',') ?? ''}</div></>
}

describe('Recipe Page Dock Integration', () => {
  const mockNavigate = vi.fn()
  beforeEach(() => {
    capturedActions = null
    mockNavigate.mockClear()
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)
  })

  it('detail actions: back/edit/save/add/share', async () => {
    const onAddToList = vi.fn()
    const onSave = vi.fn()
    const onShare = vi.fn()

    function P() { useRecipeDetailActions({ recipeId: 'recipe-1', onSave, onAddToList, onShare }); return null }
    render(<MemoryRouter><DockContextProvider><ContextDisplay /><P /></DockContextProvider></MemoryRouter>)

    expect(screen.getByTestId('action-ids')).toHaveTextContent('back,edit,save,add-to-list,share')

    await act(async () => { (capturedActions?.find(a => a.id === 'edit')?.onAction as () => void)() })
    expect(mockNavigate).toHaveBeenCalledWith('/recipes/recipe-1/edit')

    capturedActions?.find(a => a.id === 'save')?.onAction?.()
    capturedActions?.find(a => a.id === 'add-to-list')?.onAction?.()
    capturedActions?.find(a => a.id === 'share')?.onAction?.()

    expect(onSave).toHaveBeenCalled()
    expect(onAddToList).toHaveBeenCalled()
    expect(onShare).toHaveBeenCalled()
  })

  it('detail actions use no-op fallbacks', () => {
    function P() { useRecipeDetailActions({ recipeId: 'recipe-1' }); return null }
    render(<MemoryRouter><DockContextProvider><ContextDisplay /><P /></DockContextProvider></MemoryRouter>)

    expect(() => capturedActions?.find(a => a.id === 'save')?.onAction?.()).not.toThrow()
    expect(() => capturedActions?.find(a => a.id === 'add-to-list')?.onAction?.()).not.toThrow()
    expect(() => capturedActions?.find(a => a.id === 'share')?.onAction?.()).not.toThrow()
  })

  it('edit page actions: cancel/save', () => {
    function P() { useRecipeEditActions({ recipeId: 'recipe-1' }); return null }
    render(<MemoryRouter><DockContextProvider><ContextDisplay /><P /></DockContextProvider></MemoryRouter>)
    expect(screen.getByTestId('action-ids')).toHaveTextContent('cancel,save')
  })
}
