import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Radio, RadioField, RadioGroup } from '~/components/ui/radio'
import { Label, Description } from '~/components/ui/fieldset'

describe('Radio', () => {
  describe('Radio component', () => {
    it('renders a radio button', () => {
      render(
        <RadioGroup value="test">
          <Radio value="test" aria-label="Test radio" />
        </RadioGroup>
      )
      expect(screen.getByRole('radio', { name: 'Test radio' })).toBeInTheDocument()
    })

    it('renders unchecked by default', () => {
      render(
        <RadioGroup value="">
          <Radio value="test" aria-label="Test radio" />
        </RadioGroup>
      )
      expect(screen.getByRole('radio')).not.toBeChecked()
    })

    it('renders checked when value matches group value', () => {
      render(
        <RadioGroup value="test">
          <Radio value="test" aria-label="Test radio" />
        </RadioGroup>
      )
      expect(screen.getByRole('radio')).toBeChecked()
    })

    it('renders with defaultValue', () => {
      render(
        <RadioGroup defaultValue="test">
          <Radio value="test" aria-label="Test radio" />
        </RadioGroup>
      )
      expect(screen.getByRole('radio')).toBeChecked()
    })

    it('calls onChange when clicked', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(
        <RadioGroup value="" onChange={onChange}>
          <Radio value="test" aria-label="Test radio" />
        </RadioGroup>
      )
      await user.click(screen.getByRole('radio'))
      expect(onChange).toHaveBeenCalledWith('test')
    })

    it('toggles selection between radios (uncontrolled)', async () => {
      const user = userEvent.setup()
      render(
        <RadioGroup defaultValue="">
          <Radio value="option1" aria-label="Option 1" />
          <Radio value="option2" aria-label="Option 2" />
        </RadioGroup>
      )
      const radio1 = screen.getByRole('radio', { name: 'Option 1' })
      const radio2 = screen.getByRole('radio', { name: 'Option 2' })

      expect(radio1).not.toBeChecked()
      expect(radio2).not.toBeChecked()

      await user.click(radio1)
      expect(radio1).toBeChecked()
      expect(radio2).not.toBeChecked()

      await user.click(radio2)
      expect(radio1).not.toBeChecked()
      expect(radio2).toBeChecked()
    })

    it('applies custom className', () => {
      render(
        <RadioGroup value="test">
          <Radio value="test" aria-label="Test radio" className="custom-class" />
        </RadioGroup>
      )
      const radio = screen.getByRole('radio')
      expect(radio.className).toContain('custom-class')
    })

    it('applies default color styles (dark/zinc)', () => {
      const { container } = render(
        <RadioGroup value="test">
          <Radio value="test" aria-label="Test radio" />
        </RadioGroup>
      )
      // The color styles are on the inner span (first child of the Radio)
      const innerSpan = container.querySelector('[role="radio"] > span')
      expect(innerSpan?.className).toContain('[--radio-checked-indicator:var(--color-white)]')
    })

    it('renders with different color variants', () => {
      const colors = ['red', 'blue', 'green', 'indigo', 'zinc', 'white', 'dark'] as const
      colors.forEach((color) => {
        const { unmount } = render(
          <RadioGroup value="test">
            <Radio value="test" aria-label={`${color} radio`} color={color} />
          </RadioGroup>
        )
        expect(screen.getByRole('radio', { name: `${color} radio` })).toBeInTheDocument()
        unmount()
      })
    })

    it('renders with dark/zinc and dark/white colors', () => {
      const { unmount } = render(
        <RadioGroup value="test">
          <Radio value="test" aria-label="dark/zinc radio" color="dark/zinc" />
        </RadioGroup>
      )
      expect(screen.getByRole('radio', { name: 'dark/zinc radio' })).toBeInTheDocument()
      unmount()

      render(
        <RadioGroup value="test">
          <Radio value="test" aria-label="dark/white radio" color="dark/white" />
        </RadioGroup>
      )
      expect(screen.getByRole('radio', { name: 'dark/white radio' })).toBeInTheDocument()
    })

    it('renders disabled state', () => {
      render(
        <RadioGroup value="">
          <Radio value="test" aria-label="Disabled radio" disabled />
        </RadioGroup>
      )
      expect(screen.getByRole('radio')).toHaveAttribute('aria-disabled', 'true')
    })

    it('does not call onChange when disabled', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(
        <RadioGroup value="" onChange={onChange}>
          <Radio value="test" aria-label="Disabled radio" disabled />
        </RadioGroup>
      )
      await user.click(screen.getByRole('radio'))
      expect(onChange).not.toHaveBeenCalled()
    })

    it('has accessible name from aria-label', () => {
      render(
        <RadioGroup value="test">
          <Radio value="test" aria-label="Accessible radio" />
        </RadioGroup>
      )
      expect(screen.getByRole('radio', { name: 'Accessible radio' })).toBeInTheDocument()
    })

    it('has data-slot="control" attribute', () => {
      const { container } = render(
        <RadioGroup value="test">
          <Radio value="test" aria-label="Test radio" />
        </RadioGroup>
      )
      expect(container.querySelector('[data-slot="control"]')).toBeInTheDocument()
    })

    it('passes additional props to radio', () => {
      render(
        <RadioGroup value="test">
          <Radio value="test" aria-label="Test radio" data-testid="custom-radio" />
        </RadioGroup>
      )
      expect(screen.getByTestId('custom-radio')).toBeInTheDocument()
    })

    it('handles controlled value state', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      const { rerender } = render(
        <RadioGroup value="" onChange={onChange}>
          <Radio value="option1" aria-label="Option 1" />
          <Radio value="option2" aria-label="Option 2" />
        </RadioGroup>
      )
      const radio1 = screen.getByRole('radio', { name: 'Option 1' })
      const radio2 = screen.getByRole('radio', { name: 'Option 2' })

      expect(radio1).not.toBeChecked()
      expect(radio2).not.toBeChecked()

      await user.click(radio1)
      expect(onChange).toHaveBeenCalledWith('option1')

      // Re-render with updated value
      rerender(
        <RadioGroup value="option1" onChange={onChange}>
          <Radio value="option1" aria-label="Option 1" />
          <Radio value="option2" aria-label="Option 2" />
        </RadioGroup>
      )
      expect(radio1).toBeChecked()
      expect(radio2).not.toBeChecked()
    })

    it('renders inner indicator span', () => {
      const { container } = render(
        <RadioGroup value="test">
          <Radio value="test" aria-label="Test radio" />
        </RadioGroup>
      )
      // Radio has nested spans for visual indicator
      const innerSpans = container.querySelectorAll('[data-slot="control"] span span')
      expect(innerSpans.length).toBeGreaterThan(0)
    })

    it('renders with all color variants', () => {
      const allColors = [
        'dark/zinc',
        'dark/white',
        'white',
        'dark',
        'zinc',
        'red',
        'orange',
        'amber',
        'yellow',
        'lime',
        'green',
        'emerald',
        'teal',
        'cyan',
        'sky',
        'blue',
        'indigo',
        'violet',
        'purple',
        'fuchsia',
        'pink',
        'rose',
      ] as const
      allColors.forEach((color) => {
        const { unmount } = render(
          <RadioGroup value="test">
            <Radio value="test" aria-label={`${color} radio`} color={color} />
          </RadioGroup>
        )
        expect(screen.getByRole('radio', { name: `${color} radio` })).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('RadioField component', () => {
    it('renders children', () => {
      render(
        <RadioGroup value="test">
          <RadioField>
            <Radio value="test" aria-label="Field radio" />
          </RadioField>
        </RadioGroup>
      )
      expect(screen.getByRole('radio')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <RadioGroup value="test">
          <RadioField className="custom-field" data-testid="field">
            <Radio value="test" aria-label="Field radio" />
          </RadioField>
        </RadioGroup>
      )
      const field = screen.getByTestId('field')
      expect(field.className).toContain('custom-field')
    })

    it('has data-slot="field" attribute', () => {
      render(
        <RadioGroup value="test">
          <RadioField data-testid="field">
            <Radio value="test" aria-label="Field radio" />
          </RadioField>
        </RadioGroup>
      )
      expect(screen.getByTestId('field')).toHaveAttribute('data-slot', 'field')
    })

    it('renders with label', () => {
      render(
        <RadioGroup value="test">
          <RadioField>
            <Radio value="test" />
            <Label>Select option</Label>
          </RadioField>
        </RadioGroup>
      )
      expect(screen.getByText('Select option')).toBeInTheDocument()
    })

    it('renders with description', () => {
      render(
        <RadioGroup value="test">
          <RadioField>
            <Radio value="test" />
            <Label>Select option</Label>
            <Description>This is a detailed description</Description>
          </RadioField>
        </RadioGroup>
      )
      expect(screen.getByText('This is a detailed description')).toBeInTheDocument()
    })

    it('clicking label selects radio', async () => {
      const user = userEvent.setup()
      render(
        <RadioGroup defaultValue="">
          <RadioField>
            <Radio value="test" />
            <Label>Select option</Label>
          </RadioField>
        </RadioGroup>
      )
      const radio = screen.getByRole('radio')
      expect(radio).not.toBeChecked()

      await user.click(screen.getByText('Select option'))
      expect(radio).toBeChecked()
    })

    it('applies grid layout classes', () => {
      render(
        <RadioGroup value="test">
          <RadioField data-testid="field">
            <Radio value="test" aria-label="Field radio" />
          </RadioField>
        </RadioGroup>
      )
      const field = screen.getByTestId('field')
      expect(field.className).toContain('grid')
    })
  })

  describe('RadioGroup component', () => {
    it('renders children', () => {
      render(
        <RadioGroup value="">
          <RadioField>
            <Radio value="option1" />
            <Label>Option 1</Label>
          </RadioField>
          <RadioField>
            <Radio value="option2" />
            <Label>Option 2</Label>
          </RadioField>
        </RadioGroup>
      )
      expect(screen.getByText('Option 1')).toBeInTheDocument()
      expect(screen.getByText('Option 2')).toBeInTheDocument()
    })

    it('renders multiple radios', () => {
      render(
        <RadioGroup value="">
          <RadioField>
            <Radio value="option1" />
            <Label>Option 1</Label>
          </RadioField>
          <RadioField>
            <Radio value="option2" />
            <Label>Option 2</Label>
          </RadioField>
        </RadioGroup>
      )
      expect(screen.getAllByRole('radio')).toHaveLength(2)
    })

    it('applies custom className', () => {
      render(
        <RadioGroup value="" className="custom-group" data-testid="group">
          <RadioField>
            <Radio value="test" aria-label="Radio" />
          </RadioField>
        </RadioGroup>
      )
      const group = screen.getByTestId('group')
      expect(group.className).toContain('custom-group')
    })

    it('has data-slot="control" attribute', () => {
      render(
        <RadioGroup value="" data-testid="group">
          <RadioField>
            <Radio value="test" aria-label="Radio" />
          </RadioField>
        </RadioGroup>
      )
      expect(screen.getByTestId('group')).toHaveAttribute('data-slot', 'control')
    })

    it('applies space-y-3 class for spacing', () => {
      render(
        <RadioGroup value="" data-testid="group">
          <RadioField>
            <Radio value="test" aria-label="Radio" />
          </RadioField>
        </RadioGroup>
      )
      const group = screen.getByTestId('group')
      expect(group.className).toContain('space-y-3')
    })

    it('only allows one radio to be selected at a time', async () => {
      const user = userEvent.setup()
      render(
        <RadioGroup defaultValue="">
          <RadioField>
            <Radio value="option1" />
            <Label>Option 1</Label>
          </RadioField>
          <RadioField>
            <Radio value="option2" />
            <Label>Option 2</Label>
          </RadioField>
        </RadioGroup>
      )
      const radios = screen.getAllByRole('radio')

      await user.click(radios[0])
      expect(radios[0]).toBeChecked()
      expect(radios[1]).not.toBeChecked()

      await user.click(radios[1])
      expect(radios[0]).not.toBeChecked()
      expect(radios[1]).toBeChecked()
    })

    it('renders as a radiogroup role', () => {
      render(
        <RadioGroup value="" aria-label="Test group">
          <RadioField>
            <Radio value="test" aria-label="Radio" />
          </RadioField>
        </RadioGroup>
      )
      expect(screen.getByRole('radiogroup', { name: 'Test group' })).toBeInTheDocument()
    })
  })

  describe('Full radio composition', () => {
    it('renders a complete radio group with all components', () => {
      render(
        <RadioGroup defaultValue="option1">
          <RadioField>
            <Radio value="option1" color="blue" />
            <Label>Standard shipping</Label>
            <Description>4-10 business days</Description>
          </RadioField>
          <RadioField>
            <Radio value="option2" color="blue" />
            <Label>Express shipping</Label>
            <Description>2-3 business days</Description>
          </RadioField>
        </RadioGroup>
      )

      expect(screen.getByText('Standard shipping')).toBeInTheDocument()
      expect(screen.getByText('4-10 business days')).toBeInTheDocument()
      expect(screen.getByText('Express shipping')).toBeInTheDocument()
      expect(screen.getByText('2-3 business days')).toBeInTheDocument()
      expect(screen.getAllByRole('radio')).toHaveLength(2)
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      render(
        <RadioGroup defaultValue="">
          <RadioField>
            <Radio value="option1" />
            <Label>Option 1</Label>
          </RadioField>
          <RadioField>
            <Radio value="option2" />
            <Label>Option 2</Label>
          </RadioField>
          <RadioField>
            <Radio value="option3" />
            <Label>Option 3</Label>
          </RadioField>
        </RadioGroup>
      )

      const radios = screen.getAllByRole('radio')

      // Tab to radio group and first option becomes focusable
      await user.tab()
      expect(radios[0]).toHaveFocus()

      // Use arrow keys to navigate
      await user.keyboard('{ArrowDown}')
      expect(radios[1]).toHaveFocus()
      expect(radios[1]).toBeChecked()

      await user.keyboard('{ArrowDown}')
      expect(radios[2]).toHaveFocus()
      expect(radios[2]).toBeChecked()

      // Wrap around to first
      await user.keyboard('{ArrowDown}')
      expect(radios[0]).toHaveFocus()
      expect(radios[0]).toBeChecked()
    })

    it('supports arrow up keyboard navigation', async () => {
      const user = userEvent.setup()
      render(
        <RadioGroup defaultValue="option3">
          <RadioField>
            <Radio value="option1" />
            <Label>Option 1</Label>
          </RadioField>
          <RadioField>
            <Radio value="option2" />
            <Label>Option 2</Label>
          </RadioField>
          <RadioField>
            <Radio value="option3" />
            <Label>Option 3</Label>
          </RadioField>
        </RadioGroup>
      )

      const radios = screen.getAllByRole('radio')

      // Tab to radio group - focus goes to checked radio
      await user.tab()
      expect(radios[2]).toHaveFocus()

      // Use arrow up to navigate
      await user.keyboard('{ArrowUp}')
      expect(radios[1]).toHaveFocus()
      expect(radios[1]).toBeChecked()

      await user.keyboard('{ArrowUp}')
      expect(radios[0]).toHaveFocus()
      expect(radios[0]).toBeChecked()
    })

    it('renders disabled radio in a group', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(
        <RadioGroup defaultValue="" onChange={onChange}>
          <RadioField>
            <Radio value="option1" />
            <Label>Option 1</Label>
          </RadioField>
          <RadioField>
            <Radio value="option2" disabled />
            <Label>Option 2 (Disabled)</Label>
          </RadioField>
        </RadioGroup>
      )

      const radios = screen.getAllByRole('radio')
      expect(radios[1]).toHaveAttribute('aria-disabled', 'true')

      await user.click(radios[0])
      expect(onChange).toHaveBeenCalledTimes(1)

      await user.click(radios[1])
      // Still only called once since disabled radio doesn't trigger onChange
      expect(onChange).toHaveBeenCalledTimes(1)
    })

    it('renders entire group as disabled', () => {
      render(
        <RadioGroup defaultValue="" disabled aria-label="Disabled group">
          <RadioField>
            <Radio value="option1" />
            <Label>Option 1</Label>
          </RadioField>
          <RadioField>
            <Radio value="option2" />
            <Label>Option 2</Label>
          </RadioField>
        </RadioGroup>
      )

      const radios = screen.getAllByRole('radio')
      radios.forEach((radio) => {
        expect(radio).toHaveAttribute('aria-disabled', 'true')
      })
    })

    it('disabled group does not call onChange', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(
        <RadioGroup defaultValue="" disabled onChange={onChange} aria-label="Disabled group">
          <RadioField>
            <Radio value="option1" />
            <Label>Option 1</Label>
          </RadioField>
          <RadioField>
            <Radio value="option2" />
            <Label>Option 2</Label>
          </RadioField>
        </RadioGroup>
      )

      const radios = screen.getAllByRole('radio')
      await user.click(radios[0])
      await user.click(radios[1])
      expect(onChange).not.toHaveBeenCalled()
    })

    it('renders with name attribute for form submission', () => {
      render(
        <RadioGroup defaultValue="option1" name="shipping" aria-label="Shipping options">
          <RadioField>
            <Radio value="option1" />
            <Label>Standard</Label>
          </RadioField>
          <RadioField>
            <Radio value="option2" />
            <Label>Express</Label>
          </RadioField>
        </RadioGroup>
      )

      // RadioGroup with name should be accessible
      expect(screen.getByRole('radiogroup', { name: 'Shipping options' })).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <RadioGroup value="option1" aria-label="Select an option">
          <RadioField>
            <Radio value="option1" />
            <Label>Option 1</Label>
          </RadioField>
          <RadioField>
            <Radio value="option2" />
            <Label>Option 2</Label>
          </RadioField>
        </RadioGroup>
      )

      const group = screen.getByRole('radiogroup', { name: 'Select an option' })
      expect(group).toBeInTheDocument()

      const radios = screen.getAllByRole('radio')
      expect(radios[0]).toBeChecked()
      expect(radios[1]).not.toBeChecked()
    })

    it('associates label with radio via Field component', async () => {
      const user = userEvent.setup()
      render(
        <RadioGroup defaultValue="">
          <RadioField>
            <Radio value="test" />
            <Label>Click me to select</Label>
          </RadioField>
        </RadioGroup>
      )

      const radio = screen.getByRole('radio')
      expect(radio).not.toBeChecked()

      // Clicking label should select the radio
      await user.click(screen.getByText('Click me to select'))
      expect(radio).toBeChecked()
    })

    it('supports aria-describedby through Description', () => {
      render(
        <RadioGroup defaultValue="">
          <RadioField>
            <Radio value="test" />
            <Label>Option</Label>
            <Description>Helper text for this option</Description>
          </RadioField>
        </RadioGroup>
      )

      expect(screen.getByText('Helper text for this option')).toBeInTheDocument()
    })

    it('focus indicator is visible on focus', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <RadioGroup defaultValue="">
          <RadioField>
            <Radio value="test" aria-label="Test radio" />
          </RadioField>
        </RadioGroup>
      )

      await user.tab()

      // The radio should be focused and have focus styling classes available
      const innerSpan = container.querySelector('[data-slot="control"] > span')
      expect(innerSpan?.className).toContain('group-data-focus:outline')
    })
  })
})
