import clsx from 'clsx'
import type { ElementType } from 'react'
import { Link } from '~/components/ui/link'

export interface DockItemProps {
  icon: ElementType
  label: string
  ariaLabel?: string
  href?: string
  active?: boolean
  className?: string
  iconClassName?: string
  labelClassName?: string
  onClick?: () => void
}

export function DockItem({
  icon: Icon,
  label,
  ariaLabel,
  href,
  active = false,
  className,
  iconClassName,
  labelClassName,
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
          active ? 'text-[var(--sj-on-photo)]' : 'text-[var(--sj-on-photo-soft)]',
          iconClassName
        )}
      />
      <span
        className={clsx(
          'text-[10px]',
          'tracking-wide',
          'uppercase',
          'font-medium',
          'transition-all duration-150',
          active ? 'text-[var(--sj-on-photo)]' : 'text-[var(--sj-on-photo-soft)]',
          labelClassName
        )}
        style={active ? { textShadow: '0 0 8px color-mix(in srgb, var(--sj-on-photo) 40%, transparent)' } : undefined}
      >
        {label}
      </span>
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={baseClassName}
        aria-current={active ? 'page' : undefined}
        aria-label={ariaLabel}
      >
        {content}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={baseClassName} aria-label={ariaLabel}>
      {content}
    </button>
  )
}
