import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuthLayout } from '~/components/ui/auth-layout'

describe('AuthLayout', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(
        <AuthLayout>
          <h1>Login Form</h1>
        </AuthLayout>
      )
      expect(screen.getByRole('heading', { name: 'Login Form' })).toBeInTheDocument()
    })

    it('renders multiple children', () => {
      render(
        <AuthLayout>
          <h1>Sign Up</h1>
          <p>Create your account</p>
          <button>Submit</button>
        </AuthLayout>
      )
      expect(screen.getByRole('heading', { name: 'Sign Up' })).toBeInTheDocument()
      expect(screen.getByText('Create your account')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
    })

    it('renders complex nested children', () => {
      render(
        <AuthLayout>
          <div>
            <form>
              <label htmlFor="email">Email</label>
              <input id="email" type="email" />
              <button type="submit">Login</button>
            </form>
          </div>
        </AuthLayout>
      )
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
    })
  })

  describe('semantic structure', () => {
    it('renders a main element as the root', () => {
      render(
        <AuthLayout>
          <p>Content</p>
        </AuthLayout>
      )
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    it('contains children within the main element', () => {
      render(
        <AuthLayout>
          <p>Content inside main</p>
        </AuthLayout>
      )
      const main = screen.getByRole('main')
      expect(main).toContainElement(screen.getByText('Content inside main'))
    })
  })

  describe('layout classes', () => {
    it('applies flex layout classes to main element', () => {
      render(
        <AuthLayout>
          <p>Content</p>
        </AuthLayout>
      )
      const main = screen.getByRole('main')
      expect(main).toHaveClass('flex')
      expect(main).toHaveClass('min-h-dvh')
      expect(main).toHaveClass('flex-col')
      expect(main).toHaveClass('p-2')
    })

    it('applies centered content wrapper styles', () => {
      const { container } = render(
        <AuthLayout>
          <p>Content</p>
        </AuthLayout>
      )
      const wrapper = container.querySelector('main > div')
      expect(wrapper).toHaveClass('flex')
      expect(wrapper).toHaveClass('grow')
      expect(wrapper).toHaveClass('items-center')
      expect(wrapper).toHaveClass('justify-center')
      expect(wrapper).toHaveClass('p-6')
    })

    it('applies responsive lg breakpoint styles to wrapper', () => {
      const { container } = render(
        <AuthLayout>
          <p>Content</p>
        </AuthLayout>
      )
      const wrapper = container.querySelector('main > div')
      expect(wrapper).toHaveClass('lg:rounded-lg')
      expect(wrapper).toHaveClass('lg:bg-white')
      expect(wrapper).toHaveClass('lg:p-10')
      expect(wrapper).toHaveClass('lg:shadow-xs')
      expect(wrapper).toHaveClass('lg:ring-1')
      expect(wrapper).toHaveClass('lg:ring-zinc-950/5')
    })

    it('applies dark mode styles to wrapper', () => {
      const { container } = render(
        <AuthLayout>
          <p>Content</p>
        </AuthLayout>
      )
      const wrapper = container.querySelector('main > div')
      expect(wrapper).toHaveClass('dark:lg:bg-zinc-900')
      expect(wrapper).toHaveClass('dark:lg:ring-white/10')
    })
  })
})
