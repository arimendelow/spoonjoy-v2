'use client'

import { createContext, useContext, type ReactNode, type ElementType } from 'react'

/**
 * DockContext - Context provider for contextual dock navigation
 * 
 * This is a stub placeholder. Implementation pending in Unit 7b.
 * Tests should FAIL until implementation is complete.
 */

/** Action definition for contextual dock items */
export interface DockAction {
  /** Unique identifier for the action */
  id: string
  /** Lucide icon component */
  icon: ElementType
  /** Label text */
  label: string
  /** Action handler or route href */
  onAction: (() => void) | string
  /** Position in dock (left of center or right of center) */
  position: 'left' | 'right'
}

/** Context value type */
export interface DockContextValue {
  /** Current contextual actions (null = use default nav) */
  actions: DockAction[] | null
  /** Register contextual actions */
  setActions: (actions: DockAction[] | null) => void
  /** Whether the dock is in contextual mode */
  isContextual: boolean
}

/** Default context value */
const defaultValue: DockContextValue = {
  actions: null,
  setActions: () => {},
  isContextual: false,
}

/** The React context */
export const DockContext = createContext<DockContextValue>(defaultValue)

/** Provider props */
export interface DockContextProviderProps {
  children: ReactNode
}

/** Provider component - STUB */
export function DockContextProvider({ children }: DockContextProviderProps) {
  // STUB: No implementation yet - tests should fail
  return <>{children}</>
}

/** Hook to access dock context */
export function useDockContext(): DockContextValue {
  const context = useContext(DockContext)
  return context
}

/** Hook to register contextual actions (for pages) */
export function useDockActions(_actions: DockAction[] | null): void {
  // STUB: No implementation yet
}
