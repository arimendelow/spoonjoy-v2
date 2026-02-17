import clsx from 'clsx'
import type { ElementType } from 'react'
import { Link } from '~/components/ui/link'

export interface DockItemProps {
  icon: ElementType
  label: string
  href?: string
  active?: boolean
  className?: string
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
  const baseClassName = clsx(
    'flex flex-col items-center justify-center gap-1',
    'min-w-[44px] min-h-[44px]',
    'px-2 py-1',
    'transition-transform duration-100 ease-out',
    'active:scale-95',
    'no-underline',
    active && 'dock-item-active',
    className
  )

  const content = (
    <>
      <Icon
        className={clsx(
          'h-5 w-5',
          'transition-colors duration-150',
          active ? 'text-white' : 'text-white/60'
        )}
      />
      <span
        className={clsx(
          'text-[10px]',
          'tracking-wide',
          'uppercase',
          'font-medium',
          'transition-all duration-150',
          active ? 'text-white' : 'text-white/60'
        )}
        style={active ? { textShadow: '0 0 8px rgba(255, 255, 255, 0.4)' } : undefined}
      >
        {label}
      </span>
    </>
  )

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={baseClassName}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={baseClassName}>
      {content}
    </button>
  )
}
