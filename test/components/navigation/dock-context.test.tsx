import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import {
  DockContextProvider,
  useDockContext,
  useDockActions,
  type DockAction,
} from '~/components/navigation/dock-context'
import { ArrowLeft, Edit, Share, ShoppingCart } from 'lucide-react'

// Sample contextual actions for testing
const sampleActions: DockAction[] = [
  { id: 'back', icon: ArrowLeft, label: 'Back', onAction: '/recipes', position: 'left' },
  { id: 'edit', icon: Edit, label: 'Edit', onAction: vi.fn(), position: 'left' },
  { id: 'add-to-list', icon: ShoppingCart, label: 'Add to List', onAction: vi.fn(), position: 'right' },
  { id: 'share', icon: Share, label: 'Share', onAction: vi.fn(), position: 'right' },
]

describe('DockContext', () => {
  describe('DockContextProvider', () => {
    it('renders children', () => {
      render(
        <DockContextProvider>
          <div data-testid="child">Child content</div>
        </DockContextProvider>
      )

      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('provides context to children', () => {
      function TestComponent() {
        const context = useDockContext()
        return <div data-testid="context-check">{context ? 'has context' : 'no context'}</div>
      }

      render(
        <DockContextProvider>
          <TestComponent />
        </DockContextProvider>
      )

      expect(screen.getByTestId('context-check')).toHaveTextContent('has context')
    })
  })

  describe('useDockContext', () => {
    it('returns default values when not in provider', () => {
      const { result } = renderHook(() => useDockContext())

      expect(result.current.actions).toBeNull()
      expect(result.current.isContextual).toBe(false)
      expect(typeof result.current.setActions).toBe('function')
    })

    it('default setActions is a no-op function (function coverage)', () => {
      // This test covers the default setActions: () => {} function in defaultValue
      const { result } = renderHook(() => useDockContext())

      // The default setActions should be callable but do nothing
      expect(() => {
        result.current.setActions(sampleActions)
      }).not.toThrow()

      // Since we're not in a provider, actions should still be null
      expect(result.current.actions).toBeNull()
    })

    it('returns context value when in provider', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DockContextProvider>{children}</DockContextProvider>
      )

      const { result } = renderHook(() => useDockContext(), { wrapper })

      expect(result.current.actions).toBeNull()
      expect(result.current.isContextual).toBe(false)
      expect(typeof result.current.setActions).toBe('function')
    })

    it('setActions updates the actions', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DockContextProvider>{children}</DockContextProvider>
      )

      const { result } = renderHook(() => useDockContext(), { wrapper })

      act(() => {
        result.current.setActions(sampleActions)
      })

      expect(result.current.actions).toEqual(sampleActions)
      expect(result.current.isContextual).toBe(true)
    })

    it('setActions(null) clears contextual mode', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DockContextProvider>{children}</DockContextProvider>
      )

      const { result } = renderHook(() => useDockContext(), { wrapper })

      // Set actions first
      act(() => {
        result.current.setActions(sampleActions)
      })
      expect(result.current.isContextual).toBe(true)

      // Clear actions
      act(() => {
        result.current.setActions(null)
      })
      expect(result.current.actions).toBeNull()
      expect(result.current.isContextual).toBe(false)
    })
  })

  describe('useDockActions', () => {
    it('registers actions when component mounts', () => {
      function TestPage() {
        useDockActions(sampleActions)
        return <div data-testid="page">Test Page</div>
      }

      function TestApp() {
        const context = useDockContext()
        return (
          <>
            <div data-testid="is-contextual">{context.isContextual ? 'yes' : 'no'}</div>
            <TestPage />
          </>
        )
      }

      render(
        <DockContextProvider>
          <TestApp />
        </DockContextProvider>
      )

      expect(screen.getByTestId('is-contextual')).toHaveTextContent('yes')
    })

    it('clears actions when component unmounts', () => {
      function TestPage() {
        useDockActions(sampleActions)
        return <div>Test Page</div>
      }

      function TestApp({ showPage }: { showPage: boolean }) {
        const context = useDockContext()
        return (
          <>
            <div data-testid="is-contextual">{context.isContextual ? 'yes' : 'no'}</div>
            {showPage && <TestPage />}
          </>
        )
      }

      const { rerender } = render(
        <DockContextProvider>
          <TestApp showPage={true} />
        </DockContextProvider>
      )

      expect(screen.getByTestId('is-contextual')).toHaveTextContent('yes')

      // Unmount the page
      rerender(
        <DockContextProvider>
          <TestApp showPage={false} />
        </DockContextProvider>
      )

      expect(screen.getByTestId('is-contextual')).toHaveTextContent('no')
    })

    it('updates actions when actions prop changes', () => {
      const newActions: DockAction[] = [
        { id: 'cancel', icon: ArrowLeft, label: 'Cancel', onAction: vi.fn(), position: 'left' },
        { id: 'save', icon: Edit, label: 'Save', onAction: vi.fn(), position: 'right' },
      ]

      function TestPage({ actions }: { actions: DockAction[] }) {
        useDockActions(actions)
        return <div>Test Page</div>
      }

      function TestApp({ actions }: { actions: DockAction[] }) {
        const context = useDockContext()
        return (
          <>
            <div data-testid="action-count">{context.actions?.length ?? 0}</div>
            <TestPage actions={actions} />
          </>
        )
      }

      const { rerender } = render(
        <DockContextProvider>
          <TestApp actions={sampleActions} />
        </DockContextProvider>
      )

      expect(screen.getByTestId('action-count')).toHaveTextContent('4')

      // Change actions
      rerender(
        <DockContextProvider>
          <TestApp actions={newActions} />
        </DockContextProvider>
      )

      expect(screen.getByTestId('action-count')).toHaveTextContent('2')
    })
  })

  describe('DockAction type', () => {
    it('supports function onAction', () => {
      const mockFn = vi.fn()
      const action: DockAction = {
        id: 'test',
        icon: Edit,
        label: 'Test',
        onAction: mockFn,
        position: 'left',
      }

      expect(typeof action.onAction).toBe('function')
      if (typeof action.onAction === 'function') {
        action.onAction()
        expect(mockFn).toHaveBeenCalled()
      }
    })

    it('supports string (href) onAction', () => {
      const action: DockAction = {
        id: 'test',
        icon: Edit,
        label: 'Test',
        onAction: '/some/route',
        position: 'right',
      }

      expect(typeof action.onAction).toBe('string')
      expect(action.onAction).toBe('/some/route')
    })
  })
})
