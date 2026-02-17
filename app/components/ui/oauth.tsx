import clsx from 'clsx'
import { Button } from './button'

type OAuthProvider = 'google' | 'apple'

const providerStyles: Record<OAuthProvider, { label: string }> = {
  google: {
    label: 'Continue with Google',
  },
  apple: {
    label: 'Continue with Apple',
  },
}

interface OAuthButtonProps {
  provider: OAuthProvider
  className?: string
}

export function OAuthButton({ provider, className }: OAuthButtonProps) {
  const { label } = providerStyles[provider]

  return (
    <form action={`/auth/${provider}`} method="post">
      <Button type="submit" className={clsx('w-full', className)}>
        {label}
      </Button>
    </form>
  )
}

interface OAuthDividerProps {
  className?: string
}

export function OAuthDivider({ className }: OAuthDividerProps) {
  return (
    <div
      data-testid="oauth-separator"
      className={clsx('flex items-center', className)}
    >
      <div className="flex-1 border-t border-zinc-950/10 dark:border-white/10" />
      <span className="px-4 text-sm text-zinc-500 dark:text-zinc-400">or</span>
      <div className="flex-1 border-t border-zinc-950/10 dark:border-white/10" />
    </div>
  )
}

interface OAuthButtonGroupProps {
  className?: string
}

export function OAuthButtonGroup({ className }: OAuthButtonGroupProps) {
  return (
    <div className={clsx('flex flex-col gap-3', className)}>
      <OAuthButton provider="google" />
      <OAuthButton provider="apple" />
    </div>
  )
}

interface OAuthErrorProps {
  error: string | undefined
  className?: string
}

export function OAuthError({ error, className }: OAuthErrorProps) {
  if (!error) return null

  const message =
    error === 'account_exists'
      ? 'An account with this email already exists. Please log in to link your account.'
      : 'Something went wrong. Please try again.'

  return (
    <div
      role="alert"
      className={clsx(
        'rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700',
        'dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400',
        className
      )}
    >
      {message}
    </div>
  )
}
