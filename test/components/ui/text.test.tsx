import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Text, TextLink, Strong, Code } from '~/components/ui/text'

describe('Text components', () => {
  describe('Text', () => {
    it('renders children in a paragraph', () => {
      render(<Text>Hello world</Text>)
      expect(screen.getByText('Hello world')).toBeInTheDocument()
    })

    it('renders as a p element', () => {
      render(<Text>Paragraph text</Text>)
      const element = screen.getByText('Paragraph text')
      expect(element.tagName).toBe('P')
    })

    it('has data-slot attribute', () => {
      render(<Text>Slotted text</Text>)
      expect(screen.getByText('Slotted text')).toHaveAttribute('data-slot', 'text')
    })

    it('applies custom className', () => {
      render(<Text className="custom-class">Custom text</Text>)
      expect(screen.getByText('Custom text')).toHaveClass('custom-class')
    })

    it('passes additional props', () => {
      render(<Text data-testid="test-text">With props</Text>)
      expect(screen.getByTestId('test-text')).toBeInTheDocument()
    })
  })

  describe('TextLink', () => {
    it('renders as a link with href', () => {
      render(<TextLink href="/test">Link text</TextLink>)
      expect(screen.getByRole('link', { name: 'Link text' })).toHaveAttribute('href', '/test')
    })

    it('applies custom className', () => {
      render(
        <TextLink href="/test" className="custom-link">
          Styled link
        </TextLink>
      )
      expect(screen.getByRole('link', { name: 'Styled link' })).toHaveClass('custom-link')
    })
  })

  describe('Strong', () => {
    it('renders children in a strong element', () => {
      render(<Strong>Bold text</Strong>)
      const element = screen.getByText('Bold text')
      expect(element.tagName).toBe('STRONG')
    })

    it('applies custom className', () => {
      render(<Strong className="custom-strong">Custom bold</Strong>)
      expect(screen.getByText('Custom bold')).toHaveClass('custom-strong')
    })
  })

  describe('Code', () => {
    it('renders children in a code element', () => {
      render(<Code>const x = 1</Code>)
      const element = screen.getByText('const x = 1')
      expect(element.tagName).toBe('CODE')
    })

    it('applies custom className', () => {
      render(<Code className="custom-code">console.log()</Code>)
      expect(screen.getByText('console.log()')).toHaveClass('custom-code')
    })
  })
})
