import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Link } from '~/components/ui/link'

describe('Link', () => {
  it('renders children', () => {
    render(<Link href="/test">Link text</Link>)
    expect(screen.getByText('Link text')).toBeInTheDocument()
  })

  it('renders as an anchor element', () => {
    render(<Link href="/test">Anchor link</Link>)
    expect(screen.getByRole('link', { name: 'Anchor link' })).toBeInTheDocument()
  })

  it('has correct href attribute', () => {
    render(<Link href="/destination">Navigate</Link>)
    expect(screen.getByRole('link', { name: 'Navigate' })).toHaveAttribute('href', '/destination')
  })

  it('applies custom className', () => {
    render(
      <Link href="/test" className="custom-link">
        Styled link
      </Link>
    )
    expect(screen.getByRole('link', { name: 'Styled link' })).toHaveClass('custom-link')
  })

  it('passes additional props', () => {
    render(
      <Link href="/test" target="_blank" rel="noopener noreferrer">
        External link
      </Link>
    )
    const link = screen.getByRole('link', { name: 'External link' })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('forwards ref to anchor element', () => {
    const ref = { current: null } as React.RefObject<HTMLAnchorElement>
    render(
      <Link href="/test" ref={ref}>
        Ref link
      </Link>
    )
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement)
  })

  it('renders with data attributes', () => {
    render(
      <Link href="/test" data-testid="test-link">
        Data attr link
      </Link>
    )
    expect(screen.getByTestId('test-link')).toBeInTheDocument()
  })
})
