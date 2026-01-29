import clsx from 'clsx'
import type { ElementType } from 'react'
import { Link } from '~/components/ui/link'

/**
 * DockItem - Individual navigation item in the SpoonDock
 * 
 * Features liquid glass label styling with icon + small translucent text.
 * Includes press feedback animation and distinct active state with glow.
 * 
 * ## Design Specs
 * - Label font: ~10px with letter-spacing
 * - Inactive label: rgba(255, 255, 255, 0.6)
 * - Active label: white with glow (text-shadow)
 * - Press: scale to 0.95 (100ms ease-out)
 * - Touch target: minimum 44×44px
 */

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

export function DockItem({
  icon: Icon,
  label,
  href,
  active = false,
  className,
  onClick,
}: DockItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={clsx(
        // Layout
        'flex flex-col items-center justify-center gap-1',
        
        // Touch target - minimum 44x44px for accessibility
        'min-w-[44px] min-h-[44px]',
        'px-2 py-1',
        
        // Press feedback animation
        'transition-transform duration-100 ease-out',
        'active:scale-95',
        
        // Remove default link styling
        'no-underline',
        
        // Active state marker for parent styling
        active && 'dock-item-active',
        
        className
      )}
    >
      {/* Icon */}
      <Icon
        className={clsx(
          'h-5 w-5',
          // Transition for icon color
          'transition-colors duration-150',
          active ? 'text-white' : 'text-white/60'
        )}
      />
      
      {/* Label with liquid glass styling */}
      <span
        className={clsx(
          // Small font size
          'text-[10px]',
          // Letter spacing
          'tracking-wide',
          // Uppercase for small caps effect
          'uppercase',
          // Font weight
          'font-medium',
          // Transition
          'transition-all duration-150',
          // Active vs inactive styling
          active
            ? [
                // Active: white with glow
                'text-white',
                // Add a subtle text shadow for glow effect
                // Using arbitrary value for text-shadow
              ]
            : [
                // Inactive: reduced opacity
                'text-white/60',
              ]
        )}
        style={active ? {
          // Glow effect via text-shadow
          textShadow: '0 0 8px rgba(255, 255, 255, 0.4)',
        } : undefined}
      >
        {label}
      </span>
    </Link>
  )
}
