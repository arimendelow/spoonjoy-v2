import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Pagination,
  PaginationPrevious,
  PaginationNext,
  PaginationList,
  PaginationPage,
  PaginationGap,
} from '~/components/ui/pagination'

describe('Pagination components', () => {
  describe('Pagination', () => {
    it('renders children', () => {
      render(<Pagination>Page content</Pagination>)
      expect(screen.getByText('Page content')).toBeInTheDocument()
    })

    it('renders as nav element', () => {
      render(<Pagination>Content</Pagination>)
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('has default aria-label', () => {
      render(<Pagination>Content</Pagination>)
      expect(screen.getByRole('navigation', { name: 'Page navigation' })).toBeInTheDocument()
    })

    it('accepts custom aria-label', () => {
      render(<Pagination aria-label="Recipe pagination">Content</Pagination>)
      expect(screen.getByRole('navigation', { name: 'Recipe pagination' })).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<Pagination className="custom-pagination">Content</Pagination>)
      const nav = screen.getByRole('navigation')
      expect(nav.className).toContain('custom-pagination')
    })

    it('applies default layout classes', () => {
      render(<Pagination>Content</Pagination>)
      const nav = screen.getByRole('navigation')
      expect(nav.className).toContain('flex')
      expect(nav.className).toContain('gap-x-2')
    })

    it('passes additional props', () => {
      render(<Pagination data-testid="main-pagination">Content</Pagination>)
      expect(screen.getByTestId('main-pagination')).toBeInTheDocument()
    })
  })

  describe('PaginationPrevious', () => {
    it('renders default "Previous" text', () => {
      render(<PaginationPrevious />)
      expect(screen.getByText('Previous')).toBeInTheDocument()
    })

    it('renders custom children', () => {
      render(<PaginationPrevious>Go back</PaginationPrevious>)
      expect(screen.getByText('Go back')).toBeInTheDocument()
    })

    it('renders as disabled button when href is null', () => {
      render(<PaginationPrevious />)
      const button = screen.getByRole('button', { name: 'Previous page' })
      expect(button).toBeDisabled()
    })

    it('renders as link when href is provided', () => {
      render(<PaginationPrevious href="/page/1" />)
      expect(screen.getByRole('link', { name: 'Previous page' })).toHaveAttribute('href', '/page/1')
    })

    it('has aria-label "Previous page"', () => {
      render(<PaginationPrevious href="/page/1" />)
      expect(screen.getByLabelText('Previous page')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(<PaginationPrevious className="custom-prev" />)
      const wrapper = container.querySelector('span')
      expect(wrapper?.className).toContain('custom-prev')
    })

    it('applies grow basis-0 class to wrapper', () => {
      const { container } = render(<PaginationPrevious />)
      const wrapper = container.querySelector('span')
      expect(wrapper?.className).toContain('grow')
      expect(wrapper?.className).toContain('basis-0')
    })

    it('renders arrow icon', () => {
      const { container } = render(<PaginationPrevious />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('PaginationNext', () => {
    it('renders default "Next" text', () => {
      render(<PaginationNext />)
      expect(screen.getByText('Next')).toBeInTheDocument()
    })

    it('renders custom children', () => {
      render(<PaginationNext>Go forward</PaginationNext>)
      expect(screen.getByText('Go forward')).toBeInTheDocument()
    })

    it('renders as disabled button when href is null', () => {
      render(<PaginationNext />)
      const button = screen.getByRole('button', { name: 'Next page' })
      expect(button).toBeDisabled()
    })

    it('renders as link when href is provided', () => {
      render(<PaginationNext href="/page/3" />)
      expect(screen.getByRole('link', { name: 'Next page' })).toHaveAttribute('href', '/page/3')
    })

    it('has aria-label "Next page"', () => {
      render(<PaginationNext href="/page/3" />)
      expect(screen.getByLabelText('Next page')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(<PaginationNext className="custom-next" />)
      const wrapper = container.querySelector('span')
      expect(wrapper?.className).toContain('custom-next')
    })

    it('applies grow basis-0 justify-end classes to wrapper', () => {
      const { container } = render(<PaginationNext />)
      const wrapper = container.querySelector('span')
      expect(wrapper?.className).toContain('grow')
      expect(wrapper?.className).toContain('basis-0')
      expect(wrapper?.className).toContain('justify-end')
    })

    it('renders arrow icon', () => {
      const { container } = render(<PaginationNext />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('PaginationList', () => {
    it('renders children', () => {
      render(<PaginationList>List content</PaginationList>)
      expect(screen.getByText('List content')).toBeInTheDocument()
    })

    it('renders as span element', () => {
      const { container } = render(<PaginationList>Content</PaginationList>)
      const span = container.querySelector('span')
      expect(span).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(<PaginationList className="custom-list">Content</PaginationList>)
      const span = container.querySelector('span')
      expect(span?.className).toContain('custom-list')
    })

    it('applies hidden class for mobile', () => {
      const { container } = render(<PaginationList>Content</PaginationList>)
      const span = container.querySelector('span')
      expect(span?.className).toContain('hidden')
    })

    it('applies sm:flex for tablet and above', () => {
      const { container } = render(<PaginationList>Content</PaginationList>)
      const span = container.querySelector('span')
      expect(span?.className).toContain('sm:flex')
    })

    it('applies gap-x-2 for item spacing', () => {
      const { container } = render(<PaginationList>Content</PaginationList>)
      const span = container.querySelector('span')
      expect(span?.className).toContain('gap-x-2')
    })

    it('applies items-baseline for alignment', () => {
      const { container } = render(<PaginationList>Content</PaginationList>)
      const span = container.querySelector('span')
      expect(span?.className).toContain('items-baseline')
    })

    it('passes additional props', () => {
      render(<PaginationList data-testid="page-list">Content</PaginationList>)
      expect(screen.getByTestId('page-list')).toBeInTheDocument()
    })
  })

  describe('PaginationPage', () => {
    it('renders children', () => {
      render(<PaginationPage href="/page/1">1</PaginationPage>)
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('renders as link', () => {
      render(<PaginationPage href="/page/5">5</PaginationPage>)
      expect(screen.getByRole('link', { name: 'Page 5' })).toHaveAttribute('href', '/page/5')
    })

    it('has aria-label with page number', () => {
      render(<PaginationPage href="/page/3">3</PaginationPage>)
      expect(screen.getByLabelText('Page 3')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <PaginationPage href="/page/1" className="custom-page">
          1
        </PaginationPage>
      )
      const link = container.querySelector('a')
      expect(link?.className).toContain('custom-page')
    })

    it('does not set aria-current when current is false', () => {
      render(
        <PaginationPage href="/page/1" current={false}>
          1
        </PaginationPage>
      )
      const link = screen.getByRole('link', { name: 'Page 1' })
      expect(link).not.toHaveAttribute('aria-current')
    })

    it('does not set aria-current when current is undefined', () => {
      render(<PaginationPage href="/page/1">1</PaginationPage>)
      const link = screen.getByRole('link', { name: 'Page 1' })
      expect(link).not.toHaveAttribute('aria-current')
    })

    it('sets aria-current="page" when current is true', () => {
      render(
        <PaginationPage href="/page/2" current>
          2
        </PaginationPage>
      )
      const link = screen.getByRole('link', { name: 'Page 2' })
      expect(link).toHaveAttribute('aria-current', 'page')
    })

    it('applies background styling when current is true', () => {
      const { container } = render(
        <PaginationPage href="/page/1" current>
          1
        </PaginationPage>
      )
      const link = container.querySelector('a')
      expect(link?.className).toContain('before:bg-zinc-950/5')
    })

    it('applies min-w-9 class for consistent sizing', () => {
      const { container } = render(<PaginationPage href="/page/1">1</PaginationPage>)
      const link = container.querySelector('a')
      expect(link?.className).toContain('min-w-9')
    })

    it('wraps children in span with negative margin', () => {
      const { container } = render(<PaginationPage href="/page/1">1</PaginationPage>)
      // The page number is wrapped in a span with -mx-0.5 class
      // Find all spans and look for the one with the negative margin class
      const spans = container.querySelectorAll('a span')
      const marginSpan = Array.from(spans).find((span) => span.className.includes('-mx-0.5'))
      expect(marginSpan).toBeInTheDocument()
    })
  })

  describe('PaginationGap', () => {
    it('renders default ellipsis', () => {
      render(<PaginationGap />)
      expect(screen.getByText('…')).toBeInTheDocument()
    })

    it('renders custom children', () => {
      render(<PaginationGap>...</PaginationGap>)
      expect(screen.getByText('...')).toBeInTheDocument()
    })

    it('renders as span element', () => {
      const { container } = render(<PaginationGap />)
      const span = container.querySelector('span')
      expect(span).toBeInTheDocument()
    })

    it('has aria-hidden for accessibility', () => {
      const { container } = render(<PaginationGap />)
      const span = container.querySelector('span')
      expect(span).toHaveAttribute('aria-hidden', 'true')
    })

    it('applies custom className', () => {
      const { container } = render(<PaginationGap className="custom-gap" />)
      const span = container.querySelector('span')
      expect(span?.className).toContain('custom-gap')
    })

    it('applies w-9 class for consistent width', () => {
      const { container } = render(<PaginationGap />)
      const span = container.querySelector('span')
      expect(span?.className).toContain('w-9')
    })

    it('applies text-center for alignment', () => {
      const { container } = render(<PaginationGap />)
      const span = container.querySelector('span')
      expect(span?.className).toContain('text-center')
    })

    it('applies text styling classes', () => {
      const { container } = render(<PaginationGap />)
      const span = container.querySelector('span')
      expect(span?.className).toContain('text-sm/6')
      expect(span?.className).toContain('font-semibold')
    })

    it('applies select-none to prevent text selection', () => {
      const { container } = render(<PaginationGap />)
      const span = container.querySelector('span')
      expect(span?.className).toContain('select-none')
    })

    it('passes additional props', () => {
      render(<PaginationGap data-testid="pagination-gap" />)
      expect(screen.getByTestId('pagination-gap')).toBeInTheDocument()
    })
  })

  describe('Full pagination composition', () => {
    it('renders a complete pagination with all components', () => {
      render(
        <Pagination>
          <PaginationPrevious href="/page/1" />
          <PaginationList>
            <PaginationPage href="/page/1">1</PaginationPage>
            <PaginationPage href="/page/2" current>
              2
            </PaginationPage>
            <PaginationGap />
            <PaginationPage href="/page/10">10</PaginationPage>
          </PaginationList>
          <PaginationNext href="/page/3" />
        </Pagination>
      )

      expect(screen.getByRole('navigation', { name: 'Page navigation' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Previous page' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Page 1' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page')
      expect(screen.getByRole('link', { name: 'Page 10' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Next page' })).toBeInTheDocument()
      expect(screen.getByText('…')).toBeInTheDocument()
    })

    it('renders pagination with disabled previous on first page', () => {
      render(
        <Pagination>
          <PaginationPrevious />
          <PaginationList>
            <PaginationPage href="/page/1" current>
              1
            </PaginationPage>
            <PaginationPage href="/page/2">2</PaginationPage>
          </PaginationList>
          <PaginationNext href="/page/2" />
        </Pagination>
      )

      expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
      expect(screen.getByRole('link', { name: 'Next page' })).not.toBeDisabled()
    })

    it('renders pagination with disabled next on last page', () => {
      render(
        <Pagination>
          <PaginationPrevious href="/page/9" />
          <PaginationList>
            <PaginationPage href="/page/9">9</PaginationPage>
            <PaginationPage href="/page/10" current>
              10
            </PaginationPage>
          </PaginationList>
          <PaginationNext />
        </Pagination>
      )

      expect(screen.getByRole('link', { name: 'Previous page' })).not.toBeDisabled()
      expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
    })

    it('renders pagination with multiple gaps', () => {
      render(
        <Pagination>
          <PaginationPrevious href="/page/4" />
          <PaginationList>
            <PaginationPage href="/page/1">1</PaginationPage>
            <PaginationGap />
            <PaginationPage href="/page/4">4</PaginationPage>
            <PaginationPage href="/page/5" current>
              5
            </PaginationPage>
            <PaginationPage href="/page/6">6</PaginationPage>
            <PaginationGap />
            <PaginationPage href="/page/20">20</PaginationPage>
          </PaginationList>
          <PaginationNext href="/page/6" />
        </Pagination>
      )

      const gaps = screen.getAllByText('…')
      expect(gaps).toHaveLength(2)
    })
  })

  describe('Accessibility', () => {
    it('renders nav element with proper landmark role', () => {
      render(<Pagination>Content</Pagination>)
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('supports aria-label for navigation identification', () => {
      render(<Pagination aria-label="Results pagination">Content</Pagination>)
      expect(screen.getByRole('navigation', { name: 'Results pagination' })).toBeInTheDocument()
    })

    it('hides decorative gap elements from assistive technology', () => {
      const { container } = render(
        <Pagination>
          <PaginationList>
            <PaginationGap />
          </PaginationList>
        </Pagination>
      )
      const hiddenElements = container.querySelectorAll('[aria-hidden="true"]')
      expect(hiddenElements.length).toBeGreaterThan(0)
    })

    it('hides arrow icons from assistive technology', () => {
      const { container } = render(
        <Pagination>
          <PaginationPrevious href="/page/1" />
          <PaginationNext href="/page/2" />
        </Pagination>
      )
      const svgs = container.querySelectorAll('svg')
      svgs.forEach((svg) => {
        expect(svg).toHaveAttribute('aria-hidden', 'true')
      })
    })

    it('provides accessible labels for navigation buttons', () => {
      render(
        <Pagination>
          <PaginationPrevious href="/page/1" />
          <PaginationNext href="/page/2" />
        </Pagination>
      )

      expect(screen.getByLabelText('Previous page')).toBeInTheDocument()
      expect(screen.getByLabelText('Next page')).toBeInTheDocument()
    })

    it('provides accessible labels for page numbers', () => {
      render(
        <Pagination>
          <PaginationList>
            <PaginationPage href="/page/1">1</PaginationPage>
            <PaginationPage href="/page/2">2</PaginationPage>
          </PaginationList>
        </Pagination>
      )

      expect(screen.getByLabelText('Page 1')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 2')).toBeInTheDocument()
    })

    it('indicates current page for screen readers with aria-current', () => {
      render(
        <Pagination>
          <PaginationList>
            <PaginationPage href="/page/1">1</PaginationPage>
            <PaginationPage href="/page/2" current>
              2
            </PaginationPage>
            <PaginationPage href="/page/3">3</PaginationPage>
          </PaginationList>
        </Pagination>
      )

      const page1 = screen.getByRole('link', { name: 'Page 1' })
      const page2 = screen.getByRole('link', { name: 'Page 2' })
      const page3 = screen.getByRole('link', { name: 'Page 3' })

      expect(page1).not.toHaveAttribute('aria-current')
      expect(page2).toHaveAttribute('aria-current', 'page')
      expect(page3).not.toHaveAttribute('aria-current')
    })

    it('makes interactive elements focusable', () => {
      render(
        <Pagination>
          <PaginationPrevious href="/page/1" />
          <PaginationList>
            <PaginationPage href="/page/2" current>
              2
            </PaginationPage>
          </PaginationList>
          <PaginationNext href="/page/3" />
        </Pagination>
      )

      const prevLink = screen.getByRole('link', { name: 'Previous page' })
      const pageLink = screen.getByRole('link', { name: 'Page 2' })
      const nextLink = screen.getByRole('link', { name: 'Next page' })

      expect(prevLink).not.toHaveAttribute('tabindex', '-1')
      expect(pageLink).not.toHaveAttribute('tabindex', '-1')
      expect(nextLink).not.toHaveAttribute('tabindex', '-1')
    })
  })
})
