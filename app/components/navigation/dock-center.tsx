'use client'

import clsx from 'clsx'
import { motion, useReducedMotion } from 'framer-motion'
import { Link } from '~/components/ui/link'
import { SpoonjoyLogo } from '~/components/ui/spoonjoy-logo'

/**
 * DockCenter - SJ Logo center element for the SpoonDock
 * 
 * Features a subtle breathing/glow idle animation that makes the dock
 * feel alive without being distracting. Tapping navigates to home.
 * 
 * ## Animation Specs
 * - Breathing: scale 0.98 → 1.02
 * - Duration: ~2s continuous
 * - Easing: ease-in-out
 * - Reduced motion: static
 */

export interface DockCenterProps {
  /** Route to navigate to on tap (defaults to /) */
  href?: string
  /** Additional CSS classes */
  className?: string
  /** Callback when tapped */
  onClick?: () => void
}

export function DockCenter({
  href = '/',
  className,
  onClick,
}: DockCenterProps) {
  const prefersReducedMotion = useReducedMotion()

  // Breathing animation variants
  const breathingAnimation = prefersReducedMotion
    ? {}
    : {
        scale: [0.98, 1.02, 0.98],
        transition: {
          duration: 2,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatType: 'loop' as const,
        },
      }

  return (
    <motion.div
      data-testid="dock-center"
      animate={breathingAnimation}
      className={clsx(
        // Size - larger than regular items (48px vs 44px)
        'w-14 h-14',
        'min-w-[44px] min-h-[44px]',
        
        // Flexbox centering
        'flex items-center justify-center',
        
        // Shape - rounded circle
        'rounded-full',
        
        // Background - subtle glass distinction
        'bg-white/10',
        
        // Custom class
        className
      )}
    >
      <Link
        href={href}
        onClick={onClick}
        aria-label="Go to home"
        className={clsx(
          // Full size of parent
          'w-full h-full',
          
          // Flexbox centering
          'flex items-center justify-center',
          
          // Shape
          'rounded-full',
          
          // No underline
          'no-underline',
        )}
      >
        <SpoonjoyLogo
          size={28}
          variant="white"
          className="text-white"
        />
      </Link>
    </motion.div>
  )
}
