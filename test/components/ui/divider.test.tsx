import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Divider } from '~/components/ui/divider'

describe('Divider', () => {
  it('renders an hr element', () => {
    const { container } = render(<Divider />)
    const hr = container.querySelector('hr')
    expect(hr).toBeInTheDocument()
  })

  it('has role="presentation"', () => {
    const { container } = render(<Divider />)
    const hr = container.querySelector('hr')
    expect(hr).toHaveAttribute('role', 'presentation')
  })

  it('applies non-soft border styles by default', () => {
    const { container } = render(<Divider />)
    const hr = container.querySelector('hr')
    expect(hr).toHaveClass('border-zinc-950/10')
  })

  it('applies soft border styles when soft prop is true', () => {
    const { container } = render(<Divider soft />)
    const hr = container.querySelector('hr')
    expect(hr).toHaveClass('border-zinc-950/5')
  })

  it('applies custom className', () => {
    const { container } = render(<Divider className="my-custom-divider" />)
    const hr = container.querySelector('hr')
    expect(hr).toHaveClass('my-custom-divider')
  })

  it('passes additional props', () => {
    const { container } = render(<Divider data-testid="test-divider" />)
    const hr = container.querySelector('hr')
    expect(hr).toHaveAttribute('data-testid', 'test-divider')
  })

  it('always has w-full and border-t classes', () => {
    const { container } = render(<Divider />)
    const hr = container.querySelector('hr')
    expect(hr).toHaveClass('w-full', 'border-t')
  })
})
