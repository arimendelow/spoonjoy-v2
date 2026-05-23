import * as Headless from '@headlessui/react'
import clsx from 'clsx'

export function RadioGroup({
  className,
  ...props
}: { className?: string } & Omit<Headless.RadioGroupProps, 'as' | 'className'>) {
  return (
    <Headless.RadioGroup
      data-slot="control"
      {...props}
      className={clsx(
        className,
        // Basic groups
        'space-y-3 **:data-[slot=label]:font-normal',
        // With descriptions
        'has-data-[slot=description]:space-y-6 has-data-[slot=description]:**:data-[slot=label]:font-medium'
      )}
    />
  )
}

export function RadioField({
  className,
  ...props
}: { className?: string } & Omit<Headless.FieldProps, 'as' | 'className'>) {
  return (
    <Headless.Field
      data-slot="field"
      {...props}
      className={clsx(
        className,
        // Base layout
        'grid grid-cols-[1.125rem_1fr] gap-x-4 gap-y-1 sm:grid-cols-[1rem_1fr]',
        // Control layout
        '*:data-[slot=control]:col-start-1 *:data-[slot=control]:row-start-1 *:data-[slot=control]:mt-0.75 sm:*:data-[slot=control]:mt-1',
        // Label layout
        '*:data-[slot=label]:col-start-2 *:data-[slot=label]:row-start-1',
        // Description layout
        '*:data-[slot=description]:col-start-2 *:data-[slot=description]:row-start-2',
        // With description
        'has-data-[slot=description]:**:data-[slot=label]:font-medium'
      )}
    />
  )
}

const base = [
  // Basic layout
  'relative isolate flex size-4.75 shrink-0 rounded-full sm:size-4.25',
  // Background color + shadow applied to inset pseudo element, so shadow blends with border in light mode
  'before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-[var(--sj-field)] before:shadow-sm',
  // Background color when checked
  'group-data-checked:before:bg-(--radio-checked-bg)',
  // Background color is moved to control and shadow is removed in dark mode so hide `before` pseudo
  'dark:before:hidden',
  // Background color applied to control in dark mode
  'dark:bg-[color-mix(in_srgb,var(--sj-bone)_5%,transparent)] dark:group-data-checked:bg-(--radio-checked-bg)',
  // Border
  'border border-[var(--sj-border)] group-data-checked:border-transparent group-data-hover:group-data-checked:border-transparent group-data-hover:border-[var(--sj-border-strong)] group-data-checked:bg-(--radio-checked-border)',
  'dark:border-[var(--sj-border)] dark:group-data-checked:border-[var(--sj-border)] dark:group-data-hover:group-data-checked:border-[var(--sj-border)] dark:group-data-hover:border-[var(--sj-border-strong)]',
  // Inner highlight shadow
  'after:absolute after:inset-0 after:rounded-full after:shadow-[inset_0_1px_color-mix(in_srgb,var(--sj-bone)_18%,transparent)]',
  'dark:after:-inset-px dark:after:hidden dark:after:rounded-full dark:group-data-checked:after:block',
  // Indicator color (light mode)
  '[--radio-indicator:transparent] group-data-checked:[--radio-indicator:var(--radio-checked-indicator)] group-data-hover:group-data-checked:[--radio-indicator:var(--radio-checked-indicator)] group-data-hover:[--radio-indicator:color-mix(in_srgb,var(--sj-charcoal)_10%,transparent)]',
  // Indicator color (dark mode)
  'dark:group-data-hover:group-data-checked:[--radio-indicator:var(--radio-checked-indicator)] dark:group-data-hover:[--radio-indicator:color-mix(in_srgb,var(--sj-bone)_18%,transparent)]',
  // Focus ring
  'group-data-focus:outline group-data-focus:outline-2 group-data-focus:outline-offset-2 group-data-focus:outline-[var(--sj-brass)]',
  // Disabled state
  'group-data-disabled:opacity-50',
  'group-data-disabled:border-[var(--sj-border-strong)] group-data-disabled:bg-[color-mix(in_srgb,var(--sj-charcoal)_5%,transparent)] group-data-disabled:[--radio-checked-indicator:color-mix(in_srgb,var(--sj-charcoal)_50%,transparent)] group-data-disabled:before:bg-transparent',
  'dark:group-data-disabled:border-[var(--sj-border)] dark:group-data-disabled:bg-[color-mix(in_srgb,var(--sj-bone)_4%,transparent)] dark:group-data-disabled:[--radio-checked-indicator:color-mix(in_srgb,var(--sj-bone)_50%,transparent)] dark:group-data-checked:group-data-disabled:after:hidden',
]

const neutralRadio = '[--radio-checked-bg:var(--sj-charcoal)] [--radio-checked-border:var(--sj-charcoal)] [--radio-checked-indicator:var(--sj-paper)]'
const inverseRadio = '[--radio-checked-bg:var(--sj-paper)] [--radio-checked-border:var(--sj-border-strong)] [--radio-checked-indicator:var(--sj-ink)]'
const actionRadio = '[--radio-checked-bg:var(--sj-tomato)] [--radio-checked-border:var(--sj-tomato)] [--radio-checked-indicator:var(--sj-paper)]'
const attentionRadio = '[--radio-checked-bg:var(--sj-brass)] [--radio-checked-border:var(--sj-brass)] [--radio-checked-indicator:var(--sj-paper)]'
const growthRadio = '[--radio-checked-bg:var(--sj-herb)] [--radio-checked-border:var(--sj-herb)] [--radio-checked-indicator:var(--sj-paper)]'

const colors = {
  'dark/zinc': neutralRadio,
  'dark/white': inverseRadio,
  white: inverseRadio,
  dark: neutralRadio,
  zinc: neutralRadio,
  red: actionRadio,
  orange: actionRadio,
  amber: attentionRadio,
  yellow: attentionRadio,
  lime: growthRadio,
  green: growthRadio,
  emerald: growthRadio,
  teal: growthRadio,
  cyan: neutralRadio,
  sky: neutralRadio,
  blue: neutralRadio,
  indigo: neutralRadio,
  violet: neutralRadio,
  purple: neutralRadio,
  fuchsia: actionRadio,
  pink: actionRadio,
  rose: actionRadio,
}

type Color = keyof typeof colors

export function Radio({
  color = 'dark/zinc',
  className,
  ...props
}: { color?: Color; className?: string } & Omit<Headless.RadioProps, 'as' | 'className' | 'children'>) {
  return (
    <Headless.Radio
      data-slot="control"
      {...props}
      className={clsx(className, 'group inline-flex focus:outline-hidden')}
    >
      <span className={clsx([base, colors[color]])}>
        <span
          className={clsx(
            'size-full rounded-full border-[4.5px] border-transparent bg-(--radio-indicator) bg-clip-padding',
            // Forced colors mode
            'forced-colors:border-[Canvas] forced-colors:group-data-checked:border-[Highlight]'
          )}
        />
      </span>
    </Headless.Radio>
  )
}
