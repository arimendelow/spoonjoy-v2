import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DescriptionList, DescriptionTerm, DescriptionDetails } from '~/components/ui/description-list'

describe('DescriptionList', () => {
  describe('DescriptionList component', () => {
    it('renders as a dl element', () => {
      render(<DescriptionList data-testid="dl">Content</DescriptionList>)
      const dl = screen.getByTestId('dl')
      expect(dl.tagName).toBe('DL')
    })

    it('renders children', () => {
      render(
        <DescriptionList>
          <DescriptionTerm>Term</DescriptionTerm>
          <DescriptionDetails>Details</DescriptionDetails>
        </DescriptionList>
      )
      expect(screen.getByText('Term')).toBeInTheDocument()
      expect(screen.getByText('Details')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <DescriptionList className="custom-class" data-testid="dl">
          Content
        </DescriptionList>
      )
      const dl = screen.getByTestId('dl')
      expect(dl.className).toContain('custom-class')
    })

    it('applies default grid classes', () => {
      render(<DescriptionList data-testid="dl">Content</DescriptionList>)
      const dl = screen.getByTestId('dl')
      expect(dl.className).toContain('grid')
      expect(dl.className).toContain('grid-cols-1')
    })

    it('passes additional props to dl element', () => {
      render(
        <DescriptionList data-testid="dl" id="my-dl" aria-label="Description list">
          Content
        </DescriptionList>
      )
      const dl = screen.getByTestId('dl')
      expect(dl).toHaveAttribute('id', 'my-dl')
      expect(dl).toHaveAttribute('aria-label', 'Description list')
    })
  })

  describe('DescriptionTerm component', () => {
    it('renders as a dt element', () => {
      render(<DescriptionTerm data-testid="dt">Term</DescriptionTerm>)
      const dt = screen.getByTestId('dt')
      expect(dt.tagName).toBe('DT')
    })

    it('renders children', () => {
      render(<DescriptionTerm>Label</DescriptionTerm>)
      expect(screen.getByText('Label')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <DescriptionTerm className="custom-term" data-testid="dt">
          Term
        </DescriptionTerm>
      )
      const dt = screen.getByTestId('dt')
      expect(dt.className).toContain('custom-term')
    })

    it('applies default styling classes', () => {
      render(<DescriptionTerm data-testid="dt">Term</DescriptionTerm>)
      const dt = screen.getByTestId('dt')
      expect(dt.className).toContain('col-start-1')
      expect(dt.className).toContain('border-t')
      expect(dt.className).toContain('text-zinc-500')
    })

    it('passes additional props to dt element', () => {
      render(
        <DescriptionTerm data-testid="dt" id="my-dt">
          Term
        </DescriptionTerm>
      )
      const dt = screen.getByTestId('dt')
      expect(dt).toHaveAttribute('id', 'my-dt')
    })
  })

  describe('DescriptionDetails component', () => {
    it('renders as a dd element', () => {
      render(<DescriptionDetails data-testid="dd">Details</DescriptionDetails>)
      const dd = screen.getByTestId('dd')
      expect(dd.tagName).toBe('DD')
    })

    it('renders children', () => {
      render(<DescriptionDetails>Detail content</DescriptionDetails>)
      expect(screen.getByText('Detail content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <DescriptionDetails className="custom-details" data-testid="dd">
          Details
        </DescriptionDetails>
      )
      const dd = screen.getByTestId('dd')
      expect(dd.className).toContain('custom-details')
    })

    it('applies default styling classes', () => {
      render(<DescriptionDetails data-testid="dd">Details</DescriptionDetails>)
      const dd = screen.getByTestId('dd')
      expect(dd.className).toContain('pt-1')
      expect(dd.className).toContain('pb-3')
      expect(dd.className).toContain('text-zinc-950')
    })

    it('passes additional props to dd element', () => {
      render(
        <DescriptionDetails data-testid="dd" id="my-dd">
          Details
        </DescriptionDetails>
      )
      const dd = screen.getByTestId('dd')
      expect(dd).toHaveAttribute('id', 'my-dd')
    })
  })

  describe('Full description list composition', () => {
    it('renders a complete description list with multiple term-detail pairs', () => {
      render(
        <DescriptionList>
          <DescriptionTerm>Name</DescriptionTerm>
          <DescriptionDetails>John Doe</DescriptionDetails>
          <DescriptionTerm>Email</DescriptionTerm>
          <DescriptionDetails>john@example.com</DescriptionDetails>
          <DescriptionTerm>Role</DescriptionTerm>
          <DescriptionDetails>Administrator</DescriptionDetails>
        </DescriptionList>
      )

      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
      expect(screen.getByText('Role')).toBeInTheDocument()
      expect(screen.getByText('Administrator')).toBeInTheDocument()
    })

    it('renders details with complex content', () => {
      render(
        <DescriptionList>
          <DescriptionTerm>Tags</DescriptionTerm>
          <DescriptionDetails>
            <span data-testid="tag1">React</span>
            <span data-testid="tag2">TypeScript</span>
          </DescriptionDetails>
        </DescriptionList>
      )

      expect(screen.getByTestId('tag1')).toHaveTextContent('React')
      expect(screen.getByTestId('tag2')).toHaveTextContent('TypeScript')
    })
  })
})
