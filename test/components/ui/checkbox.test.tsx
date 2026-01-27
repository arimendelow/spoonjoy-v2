import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox, CheckboxField, CheckboxGroup } from '~/components/ui/checkbox'
import { Label, Description } from '~/components/ui/fieldset'

describe('Checkbox', () => {
  describe('Checkbox component', () => {
    it('renders a checkbox', () => {
      render(<Checkbox aria-label="Test checkbox" />)
      expect(screen.getByRole('checkbox', { name: 'Test checkbox' })).toBeInTheDocument()
    })

    it('renders unchecked by default', () => {
      render(<Checkbox aria-label="Test checkbox" />)
      expect(screen.getByRole('checkbox')).not.toBeChecked()
    })

    it('renders checked when checked prop is true', () => {
      render(<Checkbox aria-label="Test checkbox" checked />)
      expect(screen.getByRole('checkbox')).toBeChecked()
    })

    it('renders with defaultChecked', () => {
      render(<Checkbox aria-label="Test checkbox" defaultChecked />)
      expect(screen.getByRole('checkbox')).toBeChecked()
    })

    it('calls onChange when clicked', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<Checkbox aria-label="Test checkbox" onChange={onChange} />)
      await user.click(screen.getByRole('checkbox'))
      expect(onChange).toHaveBeenCalledWith(true)
    })

    it('toggles checked state when clicked (uncontrolled)', async () => {
      const user = userEvent.setup()
      render(<Checkbox aria-label="Test checkbox" />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
      await user.click(checkbox)
      expect(checkbox).toBeChecked()
      await user.click(checkbox)
      expect(checkbox).not.toBeChecked()
    })

    it('applies custom className', () => {
      const { container } = render(<Checkbox aria-label="Test checkbox" className="custom-class" />)
      const checkbox = container.querySelector('[data-slot="control"]')
      expect(checkbox?.className).toContain('custom-class')
    })

    it('applies default color styles (dark/zinc)', () => {
      const { container } = render(<Checkbox aria-label="Test checkbox" />)
      const innerSpan = container.querySelector('span > span')
      expect(innerSpan?.className).toContain('[--checkbox-check:var(--color-white)]')
    })

    it('renders with different color variants', () => {
      const colors = ['red', 'blue', 'green', 'indigo', 'zinc', 'white', 'dark'] as const
      colors.forEach((color) => {
        const { unmount } = render(<Checkbox aria-label={`${color} checkbox`} color={color} />)
        expect(screen.getByRole('checkbox', { name: `${color} checkbox` })).toBeInTheDocument()
        unmount()
      })
    })

    it('renders with dark/zinc and dark/white colors', () => {
      const { unmount } = render(<Checkbox aria-label="dark/zinc checkbox" color="dark/zinc" />)
      expect(screen.getByRole('checkbox', { name: 'dark/zinc checkbox' })).toBeInTheDocument()
      unmount()

      render(<Checkbox aria-label="dark/white checkbox" color="dark/white" />)
      expect(screen.getByRole('checkbox', { name: 'dark/white checkbox' })).toBeInTheDocument()
    })

    it('renders disabled state', () => {
      render(<Checkbox aria-label="Disabled checkbox" disabled />)
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-disabled', 'true')
    })

    it('does not call onChange when disabled', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<Checkbox aria-label="Disabled checkbox" disabled onChange={onChange} />)
      await user.click(screen.getByRole('checkbox'))
      expect(onChange).not.toHaveBeenCalled()
    })

    it('renders indeterminate state', () => {
      const { container } = render(<Checkbox aria-label="Indeterminate checkbox" indeterminate />)
      // The checkbox wrapper has group class, and indeterminate state is indicated via data attribute
      const checkbox = container.querySelector('[data-slot="control"]')
      expect(checkbox).toHaveAttribute('data-indeterminate')
    })

    it('renders checkmark svg', () => {
      const { container } = render(<Checkbox aria-label="Test checkbox" />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute('viewBox', '0 0 14 14')
    })

    it('has accessible name from aria-label', () => {
      render(<Checkbox aria-label="Accessible checkbox" />)
      expect(screen.getByRole('checkbox', { name: 'Accessible checkbox' })).toBeInTheDocument()
    })

    it('has data-slot="control" attribute', () => {
      const { container } = render(<Checkbox aria-label="Test checkbox" />)
      expect(container.querySelector('[data-slot="control"]')).toBeInTheDocument()
    })

    it('passes additional props to checkbox', () => {
      render(<Checkbox aria-label="Test checkbox" data-testid="custom-checkbox" />)
      expect(screen.getByTestId('custom-checkbox')).toBeInTheDocument()
    })

    it('handles controlled checked state', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      const { rerender } = render(<Checkbox aria-label="Test checkbox" checked={false} onChange={onChange} />)
      const checkbox = screen.getByRole('checkbox')

      expect(checkbox).not.toBeChecked()

      await user.click(checkbox)
      expect(onChange).toHaveBeenCalledWith(true)

      // Re-render with updated checked state
      rerender(<Checkbox aria-label="Test checkbox" checked={true} onChange={onChange} />)
      expect(checkbox).toBeChecked()
    })
  })

  describe('CheckboxField component', () => {
    it('renders children', () => {
      render(
        <CheckboxField>
          <Checkbox aria-label="Field checkbox" />
        </CheckboxField>
      )
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <CheckboxField className="custom-field" data-testid="field">
          <Checkbox aria-label="Field checkbox" />
        </CheckboxField>
      )
      const field = screen.getByTestId('field')
      expect(field.className).toContain('custom-field')
    })

    it('has data-slot="field" attribute', () => {
      render(
        <CheckboxField data-testid="field">
          <Checkbox aria-label="Field checkbox" />
        </CheckboxField>
      )
      expect(screen.getByTestId('field')).toHaveAttribute('data-slot', 'field')
    })

    it('renders with label', () => {
      render(
        <CheckboxField>
          <Checkbox />
          <Label>Accept terms</Label>
        </CheckboxField>
      )
      expect(screen.getByText('Accept terms')).toBeInTheDocument()
    })

    it('renders with description', () => {
      render(
        <CheckboxField>
          <Checkbox />
          <Label>Accept terms</Label>
          <Description>You must accept the terms to continue</Description>
        </CheckboxField>
      )
      expect(screen.getByText('You must accept the terms to continue')).toBeInTheDocument()
    })

    it('clicking label toggles checkbox', async () => {
      const user = userEvent.setup()
      render(
        <CheckboxField>
          <Checkbox />
          <Label>Accept terms</Label>
        </CheckboxField>
      )
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()

      await user.click(screen.getByText('Accept terms'))
      expect(checkbox).toBeChecked()
    })

    it('applies grid layout classes', () => {
      render(
        <CheckboxField data-testid="field">
          <Checkbox aria-label="Field checkbox" />
        </CheckboxField>
      )
      const field = screen.getByTestId('field')
      expect(field.className).toContain('grid')
    })
  })

  describe('CheckboxGroup component', () => {
    it('renders children', () => {
      render(
        <CheckboxGroup>
          <CheckboxField>
            <Checkbox />
            <Label>Option 1</Label>
          </CheckboxField>
          <CheckboxField>
            <Checkbox />
            <Label>Option 2</Label>
          </CheckboxField>
        </CheckboxGroup>
      )
      expect(screen.getByText('Option 1')).toBeInTheDocument()
      expect(screen.getByText('Option 2')).toBeInTheDocument()
    })

    it('renders multiple checkboxes', () => {
      render(
        <CheckboxGroup>
          <CheckboxField>
            <Checkbox />
            <Label>Option 1</Label>
          </CheckboxField>
          <CheckboxField>
            <Checkbox />
            <Label>Option 2</Label>
          </CheckboxField>
        </CheckboxGroup>
      )
      expect(screen.getAllByRole('checkbox')).toHaveLength(2)
    })

    it('applies custom className', () => {
      render(
        <CheckboxGroup className="custom-group" data-testid="group">
          <CheckboxField>
            <Checkbox aria-label="Checkbox" />
          </CheckboxField>
        </CheckboxGroup>
      )
      const group = screen.getByTestId('group')
      expect(group.className).toContain('custom-group')
    })

    it('has data-slot="control" attribute', () => {
      render(
        <CheckboxGroup data-testid="group">
          <CheckboxField>
            <Checkbox aria-label="Checkbox" />
          </CheckboxField>
        </CheckboxGroup>
      )
      expect(screen.getByTestId('group')).toHaveAttribute('data-slot', 'control')
    })

    it('applies space-y-3 class for spacing', () => {
      render(
        <CheckboxGroup data-testid="group">
          <CheckboxField>
            <Checkbox aria-label="Checkbox" />
          </CheckboxField>
        </CheckboxGroup>
      )
      const group = screen.getByTestId('group')
      expect(group.className).toContain('space-y-3')
    })

    it('allows independent checkbox selection', async () => {
      const user = userEvent.setup()
      render(
        <CheckboxGroup>
          <CheckboxField>
            <Checkbox />
            <Label>Option 1</Label>
          </CheckboxField>
          <CheckboxField>
            <Checkbox />
            <Label>Option 2</Label>
          </CheckboxField>
        </CheckboxGroup>
      )
      const checkboxes = screen.getAllByRole('checkbox')

      await user.click(checkboxes[0])
      expect(checkboxes[0]).toBeChecked()
      expect(checkboxes[1]).not.toBeChecked()

      await user.click(checkboxes[1])
      expect(checkboxes[0]).toBeChecked()
      expect(checkboxes[1]).toBeChecked()
    })
  })

  describe('Full checkbox composition', () => {
    it('renders a complete checkbox field with all components', () => {
      render(
        <CheckboxGroup>
          <CheckboxField>
            <Checkbox color="blue" />
            <Label>Subscribe to newsletter</Label>
            <Description>Receive updates about new features</Description>
          </CheckboxField>
          <CheckboxField>
            <Checkbox color="blue" />
            <Label>Accept terms and conditions</Label>
            <Description>You agree to our terms of service</Description>
          </CheckboxField>
        </CheckboxGroup>
      )

      expect(screen.getByText('Subscribe to newsletter')).toBeInTheDocument()
      expect(screen.getByText('Receive updates about new features')).toBeInTheDocument()
      expect(screen.getByText('Accept terms and conditions')).toBeInTheDocument()
      expect(screen.getByText('You agree to our terms of service')).toBeInTheDocument()
      expect(screen.getAllByRole('checkbox')).toHaveLength(2)
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      render(
        <CheckboxGroup>
          <CheckboxField>
            <Checkbox />
            <Label>Option 1</Label>
          </CheckboxField>
          <CheckboxField>
            <Checkbox />
            <Label>Option 2</Label>
          </CheckboxField>
        </CheckboxGroup>
      )

      const checkboxes = screen.getAllByRole('checkbox')

      // Tab to first checkbox and toggle with Space
      await user.tab()
      expect(checkboxes[0]).toHaveFocus()
      await user.keyboard(' ')
      expect(checkboxes[0]).toBeChecked()

      // Tab to second checkbox
      await user.tab()
      expect(checkboxes[1]).toHaveFocus()
      await user.keyboard(' ')
      expect(checkboxes[1]).toBeChecked()
    })

    it('renders disabled checkbox in a group', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(
        <CheckboxGroup>
          <CheckboxField>
            <Checkbox onChange={onChange} />
            <Label>Option 1</Label>
          </CheckboxField>
          <CheckboxField>
            <Checkbox disabled onChange={onChange} />
            <Label>Option 2 (Disabled)</Label>
          </CheckboxField>
        </CheckboxGroup>
      )

      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes[1]).toHaveAttribute('aria-disabled', 'true')

      await user.click(checkboxes[0])
      expect(onChange).toHaveBeenCalledTimes(1)

      await user.click(checkboxes[1])
      // Still only called once since disabled checkbox doesn't trigger onChange
      expect(onChange).toHaveBeenCalledTimes(1)
    })
  })
})
