'use client'

import { useLocation } from 'react-router'
import { SpoonDock } from './spoon-dock'
import { DockItem } from './dock-item'
import { DockCenter } from './dock-center'
import { BookOpen, Book, ShoppingCart, User } from 'lucide-react'

/**
 * MobileNav - Mobile navigation dock for authenticated users
 * 
 * Uses the current route to determine the active navigation item.
 * Hidden on desktop (lg breakpoint and above).
 */

// Navigation items configuration
const navItems = [
  { icon: BookOpen, label: 'Recipes', href: '/recipes', position: 'left' },
  { icon: Book, label: 'Cookbooks', href: '/cookbooks', position: 'left' },
  // Center is the logo
  { icon: ShoppingCart, label: 'List', href: '/shopping-list', position: 'right' },
  { icon: User, label: 'Profile', href: '/account/settings', position: 'right' },
] as const

/**
 * Determine which nav item is active based on current path
 */
function getActiveHref(pathname: string): string | null {
  // Check each nav item to see if current path starts with its href
  for (const item of navItems) {
    if (pathname.startsWith(item.href)) {
      return item.href
    }
  }
  return null
}

export function MobileNav() {
  const location = useLocation()
  const activeHref = getActiveHref(location.pathname)
  
  const leftItems = navItems.filter(item => item.position === 'left')
  const rightItems = navItems.filter(item => item.position === 'right')

  return (
    <SpoonDock>
      {/* Left items */}
      {leftItems.map((item) => (
        <DockItem
          key={item.href}
          icon={item.icon}
          label={item.label}
          href={item.href}
          active={activeHref === item.href}
        />
      ))}
      
      {/* Center logo */}
      <DockCenter href="/" />
      
      {/* Right items */}
      {rightItems.map((item) => (
        <DockItem
          key={item.href}
          icon={item.icon}
          label={item.label}
          href={item.href}
          active={activeHref === item.href}
        />
      ))}
    </SpoonDock>
  )
}
