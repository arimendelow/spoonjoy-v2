import clsx from 'clsx'

export type ValidationErrorType = string | string[] | null | undefined

interface ValidationErrorProps {
  error: ValidationErrorType
  className?: string
}

export function ValidationError({ error, className }: ValidationErrorProps) {
  // Handle null, undefined, empty string, or empty array
  if (!error || (Array.isArray(error) && error.length === 0) || error === '') {
    return null
  }

  // Filter out empty strings from arrays
  const errors = Array.isArray(error) ? error.filter((e) => e !== '') : [error]

  // Return null if all errors were empty strings
  if (errors.length === 0) {
    return null
  }

  return (
    <div
      role="alert"
      data-slot="validation-error"
      className={clsx(
        'rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700',
        'dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400',
        className
      )}
    >
      {errors.length === 1 ? (
        errors[0]
      ) : (
        <ul className="list-disc pl-4 space-y-1">
          {errors.map((err, index) => (
            <li key={index}>{err}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
