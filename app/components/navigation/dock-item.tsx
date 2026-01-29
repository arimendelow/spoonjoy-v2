/**
 * DockItem - Individual navigation item in the SpoonDock
 * 
 * This is a stub placeholder. Implementation pending in Unit 2b.
 * Tests should FAIL until implementation is complete.
 */

import type { ElementType } from 'react'

export interface DockItemProps {
  /** Lucide icon component */
  icon: ElementType
  /** Label text displayed below the icon */
  label: string
  /** Route path for navigation */
  href: string
  /** Whether this item is currently active */
  active?: boolean
  /** Additional CSS classes */
  className?: string
  /** Callback when pressed */
  onClick?: () => void
}

export function DockItem(_props: DockItemProps) {
  // STUB: No implementation yet - tests should fail
  return null
}
