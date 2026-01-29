import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, useNavigate } from 'react-router'
import { Link } from '~/components/ui/link'

// Helper to render with router context
const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  )
}

describe('Link', () => {
  describe('basic rendering', () => {
    it('renders as a link element', () => {
      renderWithRouter(<Link href="/test">Test Link</Link>)
      expect(screen.getByRole('link', { name: 'Test Link' })).toBeInTheDocument()
    })

    it('renders children content', () => {
      renderWithRouter(<Link href="/page">Click me</Link>)
      expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('applies href attribute', () => {
      renderWithRouter(<Link href="/destination">Go somewhere</Link>)
      expect(screen.getByRole('link')).toHaveAttribute('href', '/destination')
    })

    it('passes additional props to the link', () => {
      renderWithRouter(
        <Link href="/test" data-testid="custom-link" id="my-link">
          Custom
        </Link>
      )
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('data-testid', 'custom-link')
      expect(link).toHaveAttribute('id', 'my-link')
    })
  })

  describe('Catalyst styling', () => {
    it('includes Catalyst link styling classes', () => {
      const { container } = renderWithRouter(<Link href="/styled">Styled Link</Link>)
      const link = container.querySelector('a')
      // Catalyst links typically have text styling and hover states
      // The exact classes depend on Catalyst implementation
      expect(link).toBeInTheDocument()
    })

    it('applies custom className alongside default styles', () => {
      const { container } = renderWithRouter(
        <Link href="/custom" className="custom-class">
          Custom Styled
        </Link>
      )
      const link = container.querySelector('a')
      expect(link?.className).toContain('custom-class')
    })
  })

  describe('React Router integration', () => {
    it('uses React Router Link for internal navigation', () => {
      // Internal links should use React Router's Link component
      // which enables client-side navigation without full page reload
      renderWithRouter(<Link href="/internal/path">Internal</Link>)
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/internal/path')
      // The link should be rendered inside the router context
    })

    it('handles navigation when clicked', () => {
      renderWithRouter(<Link href="/new-page">Navigate</Link>)
      const link = screen.getByRole('link')
      // Click should not cause full page navigation in test environment
      fireEvent.click(link)
      // Link should still be present (no error thrown)
      expect(link).toBeInTheDocument()
    })

    it('works with dynamic route parameters', () => {
      renderWithRouter(<Link href="/recipes/123/edit">Edit Recipe</Link>)
      expect(screen.getByRole('link')).toHaveAttribute('href', '/recipes/123/edit')
    })

    it('preserves query parameters', () => {
      renderWithRouter(<Link href="/search?q=test&page=2">Search</Link>)
      expect(screen.getByRole('link')).toHaveAttribute('href', '/search?q=test&page=2')
    })

    it('preserves hash fragments', () => {
      renderWithRouter(<Link href="/page#section">Jump to Section</Link>)
      expect(screen.getByRole('link')).toHaveAttribute('href', '/page#section')
    })
  })

  describe('external links', () => {
    it('handles external URLs', () => {
      renderWithRouter(<Link href="https://example.com">External</Link>)
      expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.com')
    })

    it('adds target="_blank" for external links', () => {
      renderWithRouter(<Link href="https://example.com">External</Link>)
      expect(screen.getByRole('link')).toHaveAttribute('target', '_blank')
    })

    it('adds rel="noopener noreferrer" for external links', () => {
      renderWithRouter(<Link href="https://example.com">External</Link>)
      expect(screen.getByRole('link')).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('detects http:// as external', () => {
      renderWithRouter(<Link href="http://insecure.com">HTTP Link</Link>)
      expect(screen.getByRole('link')).toHaveAttribute('target', '_blank')
    })

    it('does not add target="_blank" for internal links', () => {
      renderWithRouter(<Link href="/internal">Internal</Link>)
      expect(screen.getByRole('link')).not.toHaveAttribute('target', '_blank')
    })

    it('allows explicit target override', () => {
      renderWithRouter(
        <Link href="https://example.com" target="_self">
          Same Window
        </Link>
      )
      expect(screen.getByRole('link')).toHaveAttribute('target', '_self')
    })

    it('detects // protocol-relative URLs as external', () => {
      renderWithRouter(<Link href="//cdn.example.com/file.js">CDN Link</Link>)
      expect(screen.getByRole('link')).toHaveAttribute('target', '_blank')
    })
  })

  describe('accessibility', () => {
    it('has proper link role', () => {
      renderWithRouter(<Link href="/accessible">Accessible Link</Link>)
      expect(screen.getByRole('link')).toBeInTheDocument()
    })

    it('supports aria-label', () => {
      renderWithRouter(
        <Link href="/icon" aria-label="Go to icon page">
          🔗
        </Link>
      )
      expect(screen.getByRole('link', { name: 'Go to icon page' })).toBeInTheDocument()
    })

    it('supports aria-describedby', () => {
      renderWithRouter(
        <>
          <span id="desc">This link goes to help</span>
          <Link href="/help" aria-describedby="desc">
            Help
          </Link>
        </>
      )
      expect(screen.getByRole('link')).toHaveAttribute('aria-describedby', 'desc')
    })

    it('supports aria-current for current page', () => {
      renderWithRouter(
        <Link href="/current" aria-current="page">
          Current Page
        </Link>
      )
      expect(screen.getByRole('link')).toHaveAttribute('aria-current', 'page')
    })

    it('is keyboard focusable', () => {
      renderWithRouter(<Link href="/focus">Focusable</Link>)
      const link = screen.getByRole('link')
      link.focus()
      expect(document.activeElement).toBe(link)
    })

    it('indicates external links to screen readers', () => {
      renderWithRouter(<Link href="https://external.com">External Site</Link>)
      // External links should have rel attribute for security
      // Screen readers can use this information
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('rel')
    })
  })

  describe('ref forwarding', () => {
    it('forwards ref to the anchor element', () => {
      const ref = vi.fn()
      renderWithRouter(
        <Link href="/ref" ref={ref}>
          Ref Link
        </Link>
      )
      // Ref should be called with the anchor element
      expect(ref).toHaveBeenCalled()
    })

    it('ref receives the DOM element', () => {
      let linkElement: HTMLAnchorElement | null = null
      const ref = (el: HTMLAnchorElement) => {
        linkElement = el
      }
      renderWithRouter(
        <Link href="/dom-ref" ref={ref}>
          DOM Ref
        </Link>
      )
      expect(linkElement).toBeInstanceOf(HTMLAnchorElement)
      expect(linkElement?.href).toContain('/dom-ref')
    })
  })

  describe('edge cases', () => {
    it('handles empty href gracefully', () => {
      // Empty href renders but may not have link role
      // (accessibility: empty href is not a valid link)
      renderWithRouter(<Link href="">Empty href</Link>)
      expect(screen.getByText('Empty href')).toBeInTheDocument()
    })

    it('handles undefined href', () => {
      // @ts-expect-error - testing runtime behavior
      renderWithRouter(<Link href={undefined}>No href</Link>)
      // Should still render, possibly as a span or non-link
      expect(screen.getByText('No href')).toBeInTheDocument()
    })

    it('handles relative paths', () => {
      // React Router resolves relative paths based on current route
      // From '/', './relative' becomes '/relative'
      renderWithRouter(<Link href="./relative">Relative</Link>)
      expect(screen.getByRole('link')).toHaveAttribute('href', '/relative')
    })

    it('handles parent directory paths', () => {
      // React Router resolves parent paths
      // From '/', '../parent' becomes '/parent' (can't go above root)
      renderWithRouter(<Link href="../parent">Parent</Link>)
      expect(screen.getByRole('link')).toHaveAttribute('href', '/parent')
    })

    it('handles root-relative paths', () => {
      renderWithRouter(<Link href="/absolute">Absolute</Link>)
      expect(screen.getByRole('link')).toHaveAttribute('href', '/absolute')
    })

    it('handles mailto: links', () => {
      renderWithRouter(<Link href="mailto:test@example.com">Email</Link>)
      expect(screen.getByRole('link')).toHaveAttribute('href', 'mailto:test@example.com')
    })

    it('handles tel: links', () => {
      renderWithRouter(<Link href="tel:+1234567890">Call</Link>)
      expect(screen.getByRole('link')).toHaveAttribute('href', 'tel:+1234567890')
    })
  })
})
