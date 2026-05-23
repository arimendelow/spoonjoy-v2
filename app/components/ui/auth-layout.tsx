import type React from 'react'

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="sj-page flex min-h-dvh flex-col p-3">
      <div className="flex grow items-center justify-center p-4 sm:p-6 lg:p-10">
        <section className="sj-panel relative w-full max-w-md overflow-hidden rounded-[var(--sj-radius-hero)] p-6 sm:p-8">
          {children}
        </section>
      </div>
    </main>
  )
}
