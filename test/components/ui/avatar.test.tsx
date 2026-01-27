import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { Avatar, AvatarButton } from '~/components/ui/avatar'

describe('Avatar', () => {
  describe('Avatar component', () => {
    it('renders as a span with data-slot attribute', () => {
      const { container } = render(<Avatar />)
      const avatar = container.querySelector('span[data-slot="avatar"]')
      expect(avatar).toBeInTheDocument()
    })

    it('renders with initials', () => {
      render(<Avatar initials="AB" />)
      expect(screen.getByText('AB')).toBeInTheDocument()
    })

    it('renders with image when src is provided', () => {
      render(<Avatar src="/test-image.jpg" alt="Test user" />)
      const img = screen.getByRole('img', { name: 'Test user' })
      expect(img).toHaveAttribute('src', '/test-image.jpg')
    })

    it('renders both initials and image when both are provided', () => {
      render(<Avatar initials="AB" src="/test-image.jpg" alt="Test user" />)
      expect(screen.getByText('AB')).toBeInTheDocument()
      expect(screen.getByRole('img', { name: 'Test user' })).toBeInTheDocument()
    })

    it('applies rounded-full by default (non-square)', () => {
      const { container } = render(<Avatar initials="AB" />)
      const avatar = container.querySelector('span[data-slot="avatar"]')
      expect(avatar?.className).toContain('rounded-full')
    })

    it('applies square border radius when square prop is true', () => {
      const { container } = render(<Avatar initials="AB" square />)
      const avatar = container.querySelector('span[data-slot="avatar"]')
      expect(avatar?.className).toContain('rounded-(--avatar-radius)')
    })

    it('applies custom className', () => {
      const { container } = render(<Avatar initials="AB" className="custom-class" />)
      const avatar = container.querySelector('span[data-slot="avatar"]')
      expect(avatar?.className).toContain('custom-class')
    })

    it('passes additional props to span', () => {
      const { container } = render(<Avatar initials="AB" data-testid="test-avatar" />)
      expect(container.querySelector('[data-testid="test-avatar"]')).toBeInTheDocument()
    })

    it('renders initials svg with aria-hidden when no alt is provided', () => {
      const { container } = render(<Avatar initials="AB" />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('aria-hidden', 'true')
    })

    it('renders initials svg without aria-hidden when alt is provided', () => {
      const { container } = render(<Avatar initials="AB" alt="User AB" />)
      const svg = container.querySelector('svg')
      expect(svg).not.toHaveAttribute('aria-hidden')
    })

    it('renders title element in svg when alt is provided with initials', () => {
      const { container } = render(<Avatar initials="AB" alt="User AB" />)
      const title = container.querySelector('svg title')
      expect(title).toHaveTextContent('User AB')
    })

    it('handles null src gracefully', () => {
      const { container } = render(<Avatar src={null} initials="AB" />)
      expect(container.querySelector('img')).not.toBeInTheDocument()
      expect(screen.getByText('AB')).toBeInTheDocument()
    })

    it('applies inline-grid layout class', () => {
      const { container } = render(<Avatar initials="AB" />)
      const avatar = container.querySelector('span[data-slot="avatar"]')
      expect(avatar?.className).toContain('inline-grid')
    })
  })

  describe('AvatarButton component', () => {
    it('renders as a button by default', () => {
      render(<AvatarButton initials="AB" />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('renders as a link when href is provided', () => {
      render(
        <MemoryRouter>
          <AvatarButton initials="AB" href="/profile" />
        </MemoryRouter>
      )
      expect(screen.getByRole('link')).toHaveAttribute('href', '/profile')
    })

    it('renders Avatar inside button', () => {
      const { container } = render(<AvatarButton initials="AB" />)
      const avatar = container.querySelector('span[data-slot="avatar"]')
      expect(avatar).toBeInTheDocument()
      expect(screen.getByText('AB')).toBeInTheDocument()
    })

    it('renders Avatar inside link', () => {
      render(
        <MemoryRouter>
          <AvatarButton initials="CD" href="/user" />
        </MemoryRouter>
      )
      expect(screen.getByText('CD')).toBeInTheDocument()
    })

    it('passes avatar props to inner Avatar', () => {
      render(<AvatarButton src="/avatar.jpg" alt="User avatar" />)
      expect(screen.getByRole('img', { name: 'User avatar' })).toHaveAttribute('src', '/avatar.jpg')
    })

    it('applies rounded-full by default', () => {
      const { container } = render(<AvatarButton initials="AB" />)
      const button = container.querySelector('button')
      expect(button?.className).toContain('rounded-full')
    })

    it('applies square border radius when square prop is true', () => {
      const { container } = render(<AvatarButton initials="AB" square />)
      const button = container.querySelector('button')
      expect(button?.className).toContain('rounded-[20%]')
    })

    it('applies custom className to button', () => {
      const { container } = render(<AvatarButton initials="AB" className="custom-btn-class" />)
      const button = container.querySelector('button')
      expect(button?.className).toContain('custom-btn-class')
    })

    it('applies custom className to link', () => {
      const { container } = render(
        <MemoryRouter>
          <AvatarButton initials="AB" href="/test" className="custom-link-class" />
        </MemoryRouter>
      )
      const link = container.querySelector('a')
      expect(link?.className).toContain('custom-link-class')
    })

    it('includes TouchTarget wrapper', () => {
      const { container } = render(<AvatarButton initials="AB" />)
      const touchTarget = container.querySelector('span[aria-hidden="true"]')
      expect(touchTarget).toBeInTheDocument()
    })

    it('passes button props when rendered as button', () => {
      render(<AvatarButton initials="AB" disabled />)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('passes square prop to inner Avatar', () => {
      const { container } = render(<AvatarButton initials="AB" square />)
      const avatar = container.querySelector('span[data-slot="avatar"]')
      expect(avatar?.className).toContain('rounded-(--avatar-radius)')
    })

    it('has focus outline styles', () => {
      const { container } = render(<AvatarButton initials="AB" />)
      const button = container.querySelector('button')
      expect(button?.className).toContain('data-focus:outline-2')
      expect(button?.className).toContain('data-focus:outline-blue-500')
    })
  })
})
