import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import type React from 'react'

export function SwitchGroup({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
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

export function SwitchField({
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
        'grid grid-cols-[1fr_auto] gap-x-8 gap-y-1 sm:grid-cols-[1fr_auto]',
        // Control layout
        '*:data-[slot=control]:col-start-2 *:data-[slot=control]:self-start sm:*:data-[slot=control]:mt-0.5',
        // Label layout
        '*:data-[slot=label]:col-start-1 *:data-[slot=label]:row-start-1',
        // Description layout
        '*:data-[slot=description]:col-start-1 *:data-[slot=description]:row-start-2',
        // With description
        'has-data-[slot=description]:**:data-[slot=label]:font-medium'
      )}
    />
  )
}

const neutralSwitch = [
  '[--switch-bg-ring:var(--sj-charcoal)] [--switch-bg:var(--sj-charcoal)]',
  '[--switch:var(--sj-paper)] [--switch-ring:var(--sj-charcoal)] [--switch-shadow:color-mix(in_srgb,var(--sj-charcoal)_12%,transparent)]',
]
const inverseSwitch = [
  '[--switch-bg-ring:var(--sj-border-strong)] [--switch-bg:var(--sj-paper)]',
  '[--switch:var(--sj-ink)] [--switch-ring:transparent] [--switch-shadow:color-mix(in_srgb,var(--sj-charcoal)_10%,transparent)]',
]
const actionSwitch = [
  '[--switch-bg-ring:var(--sj-tomato)] [--switch-bg:var(--sj-tomato)]',
  '[--switch:var(--sj-paper)] [--switch-ring:var(--sj-tomato)] [--switch-shadow:color-mix(in_srgb,var(--sj-tomato)_18%,transparent)]',
]
const attentionSwitch = [
  '[--switch-bg-ring:var(--sj-brass)] [--switch-bg:var(--sj-brass)]',
  '[--switch:var(--sj-paper)] [--switch-ring:var(--sj-brass)] [--switch-shadow:color-mix(in_srgb,var(--sj-brass)_18%,transparent)]',
]
const growthSwitch = [
  '[--switch-bg-ring:var(--sj-herb)] [--switch-bg:var(--sj-herb)]',
  '[--switch:var(--sj-paper)] [--switch-ring:var(--sj-herb)] [--switch-shadow:color-mix(in_srgb,var(--sj-herb)_18%,transparent)]',
]

const colors = {
  'dark/zinc': neutralSwitch,
  'dark/white': inverseSwitch,
  dark: neutralSwitch,
  zinc: neutralSwitch,
  white: inverseSwitch,
  red: actionSwitch,
  orange: actionSwitch,
  amber: attentionSwitch,
  yellow: attentionSwitch,
  lime: growthSwitch,
  green: growthSwitch,
  emerald: growthSwitch,
  teal: growthSwitch,
  cyan: neutralSwitch,
  sky: neutralSwitch,
  blue: neutralSwitch,
  indigo: neutralSwitch,
  violet: neutralSwitch,
  purple: neutralSwitch,
  fuchsia: actionSwitch,
  pink: actionSwitch,
  rose: actionSwitch,
}

type Color = keyof typeof colors

export function Switch({
  color = 'dark/zinc',
  className,
  ...props
}: {
  color?: Color
  className?: string
} & Omit<Headless.SwitchProps, 'as' | 'className' | 'children'>) {
  return (
    <Headless.Switch
      data-slot="control"
      {...props}
      className={clsx(
        className,
        // Base styles
        'group relative isolate inline-flex h-6 w-10 cursor-default rounded-full p-[3px] sm:h-5 sm:w-8',
        // Transitions
        'transition duration-0 ease-in-out data-changing:duration-200',
        // Outline and background color in forced-colors mode so switch is still visible
        'forced-colors:outline forced-colors:[--switch-bg:Highlight] dark:forced-colors:[--switch-bg:Highlight]',
        // Unchecked
        'bg-[color-mix(in_srgb,var(--sj-charcoal)_12%,var(--sj-panel-solid))] ring-1 ring-[var(--sj-border)] ring-inset',
        // Checked
        'data-checked:bg-(--switch-bg) data-checked:ring-(--switch-bg-ring) dark:data-checked:bg-(--switch-bg) dark:data-checked:ring-(--switch-bg-ring)',
        // Focus
        'focus:not-data-focus:outline-hidden data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-[var(--sj-brass)]',
        // Hover
        'data-hover:ring-[var(--sj-border-strong)] data-hover:data-checked:ring-(--switch-bg-ring)',
        // Disabled
        'data-disabled:bg-[color-mix(in_srgb,var(--sj-charcoal)_10%,var(--sj-panel-solid))] data-disabled:opacity-50 data-disabled:data-checked:bg-[color-mix(in_srgb,var(--sj-charcoal)_10%,var(--sj-panel-solid))] data-disabled:data-checked:ring-[var(--sj-border)]',
        // Color specific styles
        colors[color]
      )}
    >
      <span
        aria-hidden="true"
        className={clsx(
          // Basic layout
          'pointer-events-none relative inline-block size-4.5 rounded-full sm:size-3.5',
          // Transition
          'translate-x-0 transition duration-200 ease-in-out',
          // Invisible border so the switch is still visible in forced-colors mode
          'border border-transparent',
          // Unchecked
          'bg-[var(--sj-panel-solid)] shadow-sm ring-1 ring-[var(--sj-border)]',
          // Checked
          'group-data-checked:bg-(--switch) group-data-checked:shadow-(--switch-shadow) group-data-checked:ring-(--switch-ring)',
          'group-data-checked:translate-x-4 sm:group-data-checked:translate-x-3',
          // Disabled
          'group-data-checked:group-data-disabled:bg-[var(--sj-panel-solid)] group-data-checked:group-data-disabled:shadow-sm group-data-checked:group-data-disabled:ring-[var(--sj-border)]'
        )}
      />
      <span
        data-slot="touch-target"
        className="absolute top-1/2 left-1/2 size-[max(100%,2.75rem)] -translate-x-1/2 -translate-y-1/2 pointer-fine:hidden"
        aria-hidden="true"
      />
    </Headless.Switch>
  )
}
