import clsx from 'clsx'

/**
 * SpoonDock - Mobile navigation dock component
 * 
 * A thumb-friendly bottom navigation dock with glass morphism styling.
 * Positioned fixed at the bottom of the viewport with safe area handling.
 * 
 * ## Design Specs
 * - Fixed bottom position, floating (not edge-to-edge)
 * - Width: max-w-md centered, inset from screen edges
 * - Height: ~56px (thumb-friendly)
 * - Shape: Pill/rounded-full
 * - Glass morphism: bg-black/60 backdrop-blur-xl border-white/10
 * - Safe area: mb-[max(1rem,env(safe-area-inset-bottom))]
 * - Hidden on desktop: lg:hidden
 */

export interface SpoonDockProps {
  children?: React.ReactNode
  className?: string
  /** Accessible label for the navigation landmark */
  'aria-label'?: string
}

export function SpoonDock({ 
  children, 
  className,
  'aria-label': ariaLabel = 'Main navigation',
  ...props 
}: SpoonDockProps) {
  return (
    <nav
      role="navigation"
      aria-label={ariaLabel}
      className={clsx(
        // Positioning - fixed at bottom, centered horizontally
        'fixed bottom-0 left-[max(1rem,env(safe-area-inset-left))] right-[max(1rem,env(safe-area-inset-right))]',
        
        // Layout
        'flex items-center justify-around',
        
        // Sizing
        'max-w-md mx-auto',
        'h-14', // 56px - thumb-friendly
        'px-2',
        
        // Shape - pill/rounded
        'rounded-full',
        
        // Glass morphism styling
        'bg-black/60',
        'backdrop-blur-xl',
        'border border-white/10',
        
        // Responsive - hidden on desktop
        'lg:hidden',
        
        // Z-index to stay above content
        'z-50',
        
        // Safe area handling - margin bottom accounts for home indicators
        // Uses Tailwind arbitrary value with CSS max() function
        'mb-[max(1rem,env(safe-area-inset-bottom))]',
        
        // Custom class
        className
      )}
      {...props}
    >
      {children}
    </nav>
  )
}
