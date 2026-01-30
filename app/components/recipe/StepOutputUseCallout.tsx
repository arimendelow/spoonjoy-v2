import { ArrowUp } from 'lucide-react'

export interface StepReference {
  /** Unique identifier */
  id: string
  /** The step number being referenced */
  stepNumber: number
  /** Optional human-readable step title */
  stepTitle: string | null
}

export interface StepOutputUseCalloutProps {
  /** Array of step references to display */
  references: StepReference[]
  /** Optional callback when a step reference is clicked */
  onStepClick?: (stepNumber: number) => void
}

/**
 * A visually distinctive callout showing step output references.
 *
 * Features:
 * - Colored left border for visual distinction
 * - Arrow icon indicating reference direction
 * - Shows step title when available, falls back to step number
 * - Returns null for empty references (no render)
 * - Optional click handler for navigation
 */
export function StepOutputUseCallout({
  references,
  onStepClick,
}: StepOutputUseCalloutProps) {
  // Don't render anything for empty references
  if (references.length === 0) {
    return null
  }

  return (
    <div
      data-testid="step-output-callout"
      className="border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-500 rounded-r-lg px-4 py-3 my-3"
    >
      <div className="flex items-start gap-2">
        <ArrowUp
          className="h-4 w-4 mt-0.5 text-amber-600 dark:text-amber-400 flex-shrink-0"
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Using output from:
          </span>
          <ul className="mt-1 space-y-1">
            {references.map((ref) => (
              <li key={ref.id}>
                {onStepClick ? (
                  <button
                    type="button"
                    onClick={() => onStepClick(ref.stepNumber)}
                    className="text-sm text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 hover:underline focus:outline-none focus:underline"
                  >
                    <StepReferenceText reference={ref} />
                  </button>
                ) : (
                  <span className="text-sm text-amber-700 dark:text-amber-300">
                    <StepReferenceText reference={ref} />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function StepReferenceText({ reference }: { reference: StepReference }) {
  if (reference.stepTitle) {
    return (
      <>
        <span className="font-medium">Step {reference.stepNumber}</span>
        {': '}
        {reference.stepTitle}
      </>
    )
  }

  return <span className="font-medium">Step {reference.stepNumber}</span>
}
