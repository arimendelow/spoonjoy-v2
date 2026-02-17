import { Minus, Plus } from 'lucide-react'
import { Button } from '../ui/button'

export interface ScaleSelectorProps {
  /** Current scale factor */
  value: number
  /** Optional custom display text instead of the formatted scale factor */
  displayValue?: string
  /** Callback when scale changes */
  onChange: (value: number) => void
  /** Minimum scale factor (default: 0.25) */
  min?: number
  /** Maximum scale factor (default: 50) */
  max?: number
  /** Increment step (default: 0.25) */
  step?: number
}

/**
 * A scale factor selector with +/− buttons for recipe scaling.
 *
 * Features:
 * - Large 44×44px touch targets for kitchen use
 * - 0.25 increments for recipe-friendly scaling
 * - Clear scale display with "×" suffix
 * - Disabled state at min/max boundaries
 */
export function ScaleSelector({
  value,
  displayValue,
  onChange,
  min = 0.25,
  max = 50,
  step = 0.25,
}: ScaleSelectorProps) {
  const isAtMin = value <= min
  const isAtMax = value >= max

  const handleDecrement = () => {
    /* istanbul ignore next -- @preserve decrement button is disabled at min boundary */
    if (!isAtMin) {
      // Round to avoid floating point issues
      const newValue = Math.round((value - step) * 100) / 100
      onChange(Math.max(min, newValue))
    }
  }

  const handleIncrement = () => {
    /* istanbul ignore next -- @preserve increment button is disabled at max boundary */
    if (!isAtMax) {
      // Round to avoid floating point issues
      const newValue = Math.round((value + step) * 100) / 100
      onChange(Math.min(max, newValue))
    }
  }

  // Format the display value, removing unnecessary decimal places
  const formatDisplayValue = (v: number): string => {
    // If it's a whole number, show without decimals
    if (Number.isInteger(v)) {
      return `${v}×`
    }
    // Otherwise show up to 2 decimal places, trimming trailing zeros
    return `${parseFloat(v.toFixed(2))}×`
  }

  return (
    <div className="inline-flex items-center gap-0.5">
      {/* Minus button */}
      <Button
        type="button"
        plain
        disabled={isAtMin}
        onClick={handleDecrement}
        aria-label="Decrease scale"
        data-testid="scale-minus"
        className="!p-1.5 !min-w-7 !min-h-7 flex items-center justify-center"
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </Button>

      {/* Scale display */}
      <span
        data-testid="scale-display"
        className="min-w-[2.5rem] text-center text-sm font-semibold tabular-nums text-zinc-900 dark:text-white"
      >
        {displayValue ?? formatDisplayValue(value)}
      </span>

      {/* Plus button */}
      <Button
        type="button"
        plain
        disabled={isAtMax}
        onClick={handleIncrement}
        aria-label="Increase scale"
        data-testid="scale-plus"
        className="!p-1.5 !min-w-7 !min-h-7 flex items-center justify-center"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  )
}
