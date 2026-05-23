import clsx from 'clsx'

export function Divider({
  soft = false,
  className,
  ...props
}: { soft?: boolean } & React.ComponentPropsWithoutRef<'hr'>) {
  return (
    <hr
      role="presentation"
      {...props}
      className={clsx(
        className,
        'w-full border-t',
        soft && 'border-[color-mix(in_srgb,var(--sj-charcoal)_7%,transparent)]',
        !soft && 'border-[var(--sj-border)]'
      )}
    />
  )
}
