'use client'

import { useLocation } from 'react-router'
import { SpoonDock } from './spoon-dock'
import { DockItem } from './dock-item'
import { DockCenter } from './dock-center'
import { BookOpen, Book, ShoppingCart, User, Home } from 'lucide-react'

/**
 * MobileNav - Mobile navigation dock
 *
 * Uses the current route to determine the active navigation item.
 * Hidden on desktop (lg breakpoint and above).
 *
 * @param isAuthenticated - When false, shows unauthenticated variant (Home, Logo, Login)
 *                          When true or undefined, shows authenticated variant
 */

// Navigation items for authenticated users
const authenticatedNavItems = [
  { icon: BookOpen, label: 'Recipes', href: '/recipes', position: 'left' },
  { icon: Book, label: 'Cookbooks', href: '/cookbooks', position: 'left' },
  // Center is the logo
  { icon: ShoppingCart, label: 'List', href: '/shopping-list', position: 'right' },
  { icon: User, label: 'Profile', href: '/account/settings', position: 'right' },
] as const

// Navigation items for unauthenticated users
const unauthenticatedNavItems = [
  { icon: Home, label: 'Home', href: '/', position: 'left' },
  // Center is the logo
  { icon: User, label: 'Login', href: '/login', position: 'right' },
] as const

type NavItem = { icon: typeof Home; label: string; href: string; position: 'left' | 'right' }

/**
 * Determine which nav item is active based on current path
 */
function getActiveHref(pathname: string, navItems: readonly NavItem[]): string | null {
  // Check each nav item to see if current path starts with its href
  // For the home route, require exact match to avoid matching all routes
  for (const item of navItems) {
    if (item.href === '/') {
      if (pathname === '/') {
        return item.href
      }
    } else if (pathname.startsWith(item.href)) {
      return item.href
    }
  }
  return null
}

interface MobileNavProps {
  isAuthenticated?: boolean
}

export function MobileNav({ isAuthenticated = true }: MobileNavProps) {
  const location = useLocation()
  const navItems = isAuthenticated ? authenticatedNavItems : unauthenticatedNavItems
  const activeHref = getActiveHref(location.pathname, navItems)
  
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
