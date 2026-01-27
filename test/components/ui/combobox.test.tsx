import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Combobox, ComboboxOption, ComboboxLabel, ComboboxDescription } from '~/components/ui/combobox'

interface TestOption {
  id: number
  name: string
  description?: string
}

const testOptions: TestOption[] = [
  { id: 1, name: 'Apple', description: 'A red fruit' },
  { id: 2, name: 'Banana', description: 'A yellow fruit' },
  { id: 3, name: 'Cherry', description: 'A small red fruit' },
]

describe('Combobox', () => {
  describe('Combobox component', () => {
    it('renders with placeholder', () => {
      render(
        <Combobox
          options={testOptions}
          displayValue={(option) => option?.name}
          placeholder="Select a fruit"
        >
          {(option) => (
            <ComboboxOption key={option.id} value={option}>
              <ComboboxLabel>{option.name}</ComboboxLabel>
            </ComboboxOption>
          )}
        </Combobox>
      )
      expect(screen.getByPlaceholderText('Select a fruit')).toBeInTheDocument()
    })

    it('renders with aria-label', () => {
      render(
        <Combobox
          options={testOptions}
          displayValue={(option) => option?.name}
          aria-label="Fruit selector"
        >
          {(option) => (
            <ComboboxOption key={option.id} value={option}>
              <ComboboxLabel>{option.name}</ComboboxLabel>
            </ComboboxOption>
          )}
        </Combobox>
      )
      expect(screen.getByRole('combobox', { name: 'Fruit selector' })).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <Combobox
          options={testOptions}
          displayValue={(option) => option?.name}
          className="custom-combobox"
        >
          {(option) => (
            <ComboboxOption key={option.id} value={option}>
              <ComboboxLabel>{option.name}</ComboboxLabel>
            </ComboboxOption>
          )}
        </Combobox>
      )
      const control = container.querySelector('[data-slot="control"]')
      expect(control?.className).toContain('custom-combobox')
    })

    it('renders combobox button for dropdown', () => {
      const { container } = render(
        <Combobox
          options={testOptions}
          displayValue={(option) => option?.name}
        >
          {(option) => (
            <ComboboxOption key={option.id} value={option}>
              <ComboboxLabel>{option.name}</ComboboxLabel>
            </ComboboxOption>
          )}
        </Combobox>
      )
      const button = container.querySelector('button')
      expect(button).toBeInTheDocument()
    })

    it('renders chevron icon in button', () => {
      const { container } = render(
        <Combobox
          options={testOptions}
          displayValue={(option) => option?.name}
        >
          {(option) => (
            <ComboboxOption key={option.id} value={option}>
              <ComboboxLabel>{option.name}</ComboboxLabel>
            </ComboboxOption>
          )}
        </Combobox>
      )
      const svg = container.querySelector('svg[aria-hidden="true"]')
      expect(svg).toBeInTheDocument()
    })

    it('shows options when combobox button is clicked', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <Combobox
          options={testOptions}
          displayValue={(option) => option?.name}
          aria-label="Fruit selector"
        >
          {(option) => (
            <ComboboxOption key={option.id} value={option}>
              <ComboboxLabel>{option.name}</ComboboxLabel>
            </ComboboxOption>
          )}
        </Combobox>
      )
      const button = container.querySelector('button')!
      await user.click(button)
      expect(await screen.findByRole('listbox')).toBeInTheDocument()
    })

    it('filters options based on input query', async () => {
      const user = userEvent.setup()
      render(
        <Combobox
          options={testOptions}
          displayValue={(option) => option?.name}
          aria-label="Fruit selector"
        >
          {(option) => (
            <ComboboxOption key={option.id} value={option}>
              <ComboboxLabel>{option.name}</ComboboxLabel>
            </ComboboxOption>
          )}
        </Combobox>
      )
      const input = screen.getByRole('combobox')
      await user.type(input, 'app')
      await screen.findByRole('listbox')
      expect(screen.getByText('Apple')).toBeInTheDocument()
      expect(screen.queryByText('Banana')).not.toBeInTheDocument()
      expect(screen.queryByText('Cherry')).not.toBeInTheDocument()
    })

    it('uses custom filter function when provided', async () => {
      const user = userEvent.setup()
      const customFilter = (option: TestOption, query: string) =>
        option.description?.toLowerCase().includes(query.toLowerCase()) ?? false

      render(
        <Combobox
          options={testOptions}
          displayValue={(option) => option?.name}
          filter={customFilter}
          aria-label="Fruit selector"
        >
          {(option) => (
            <ComboboxOption key={option.id} value={option}>
              <ComboboxLabel>{option.name}</ComboboxLabel>
            </ComboboxOption>
          )}
        </Combobox>
      )
      const input = screen.getByRole('combobox')
      await user.type(input, 'yellow')
      await screen.findByRole('listbox')
      expect(screen.getByText('Banana')).toBeInTheDocument()
      expect(screen.queryByText('Apple')).not.toBeInTheDocument()
    })

    it('calls onChange when option is selected', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      const { container } = render(
        <Combobox
          options={testOptions}
          displayValue={(option) => option?.name}
          onChange={onChange}
          aria-label="Fruit selector"
        >
          {(option) => (
            <ComboboxOption key={option.id} value={option}>
              <ComboboxLabel>{option.name}</ComboboxLabel>
            </ComboboxOption>
          )}
        </Combobox>
      )
      const button = container.querySelector('button')!
      await user.click(button)
      await screen.findByRole('listbox')
      await user.click(screen.getByText('Apple'))
      expect(onChange).toHaveBeenCalledWith(testOptions[0])
    })

    it('displays selected value in input', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <Combobox
          options={testOptions}
          displayValue={(option) => option?.name}
          aria-label="Fruit selector"
        >
          {(option) => (
            <ComboboxOption key={option.id} value={option}>
              <ComboboxLabel>{option.name}</ComboboxLabel>
            </ComboboxOption>
          )}
        </Combobox>
      )
      const input = screen.getByRole('combobox')
      const button = container.querySelector('button')!
      await user.click(button)
      await screen.findByRole('listbox')
      await user.click(screen.getByText('Banana'))
      await waitFor(() => {
        expect(input).toHaveValue('Banana')
      })
    })

    it('clears query when combobox closes', async () => {
      const user = userEvent.setup()
      render(
        <Combobox
          options={testOptions}
          displayValue={(option) => option?.name}
          aria-label="Fruit selector"
        >
          {(option) => (
            <ComboboxOption key={option.id} value={option}>
              <ComboboxLabel>{option.name}</ComboboxLabel>
            </ComboboxOption>
          )}
        </Combobox>
      )
      const input = screen.getByRole('combobox')
      await user.type(input, 'app')
      await screen.findByRole('listbox')
      // Press Escape to close
      await user.keyboard('{Escape}')
      // The query should be cleared (input goes back to empty or selected value)
      await waitFor(() => {
        expect(input).toHaveValue('')
      })
    })

    it('supports autoFocus prop', () => {
      render(
        <Combobox
          options={testOptions}
          displayValue={(option) => option?.name}
          autoFocus
          aria-label="Fruit selector"
        >
          {(option) => (
            <ComboboxOption key={option.id} value={option}>
              <ComboboxLabel>{option.name}</ComboboxLabel>
            </ComboboxOption>
          )}
        </Combobox>
      )
      expect(screen.getByRole('combobox')).toHaveFocus()
    })

    it('supports disabled state', () => {
      render(
        <Combobox
          options={testOptions}
          displayValue={(option) => option?.name}
          disabled
          aria-label="Fruit selector"
        >
          {(option) => (
            <ComboboxOption key={option.id} value={option}>
              <ComboboxLabel>{option.name}</ComboboxLabel>
            </ComboboxOption>
          )}
        </Combobox>
      )
      expect(screen.getByRole('combobox')).toBeDisabled()
    })

    it('supports controlled value', () => {
      render(
        <Combobox
          options={testOptions}
          displayValue={(option) => option?.name}
          value={testOptions[1]}
          aria-label="Fruit selector"
        >
          {(option) => (
            <ComboboxOption key={option.id} value={option}>
              <ComboboxLabel>{option.name}</ComboboxLabel>
            </ComboboxOption>
          )}
        </Combobox>
      )
      expect(screen.getByRole('combobox')).toHaveValue('Banana')
    })
  })

  describe('ComboboxOption', () => {
    it('renders option with children', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <Combobox
          options={testOptions}
          displayValue={(option) => option?.name}
          aria-label="Fruit selector"
        >
          {(option) => (
            <ComboboxOption key={option.id} value={option}>
              <ComboboxLabel>{option.name}</ComboboxLabel>
            </ComboboxOption>
          )}
        </Combobox>
      )
      const button = container.querySelector('button')!
      await user.click(button)
      expect(await screen.findByText('Apple')).toBeInTheDocument()
    })

    it('applies custom className to option', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <Combobox
          options={testOptions}
          displayValue={(option) => option?.name}
          aria-label="Fruit selector"
        >
          {(option) => (
            <ComboboxOption key={option.id} value={option} className="custom-option">
              <ComboboxLabel>{option.name}</ComboboxLabel>
            </ComboboxOption>
          )}
        </Combobox>
      )
      const button = container.querySelector('button')!
      await user.click(button)
      const label = await screen.findByText('Apple')
      expect(label.className).toContain('custom-option')
    })

    it('supports disabled option', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      const { container } = render(
        <Combobox
          options={testOptions}
          displayValue={(option) => option?.name}
          onChange={onChange}
          aria-label="Fruit selector"
        >
          {(option) => (
            <ComboboxOption key={option.id} value={option} disabled={option.id === 1}>
              <ComboboxLabel>{option.name}</ComboboxLabel>
            </ComboboxOption>
          )}
        </Combobox>
      )
      const button = container.querySelector('button')!
      await user.click(button)
      const appleOption = await screen.findByRole('option', { name: 'Apple' })
      expect(appleOption).toHaveAttribute('data-disabled', '')
    })
  })

  describe('ComboboxLabel', () => {
    it('renders label text', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <Combobox
          options={testOptions}
          displayValue={(option) => option?.name}
          aria-label="Fruit selector"
        >
          {(option) => (
            <ComboboxOption key={option.id} value={option}>
              <ComboboxLabel>Fruit: {option.name}</ComboboxLabel>
            </ComboboxOption>
          )}
        </Combobox>
      )
      const button = container.querySelector('button')!
      await user.click(button)
      expect(await screen.findByText('Fruit: Apple')).toBeInTheDocument()
    })

    it('applies custom className', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <Combobox
          options={testOptions}
          displayValue={(option) => option?.name}
          aria-label="Fruit selector"
        >
          {(option) => (
            <ComboboxOption key={option.id} value={option}>
              <ComboboxLabel className="custom-label">{option.name}</ComboboxLabel>
            </ComboboxOption>
          )}
        </Combobox>
      )
      const button = container.querySelector('button')!
      await user.click(button)
      const label = await screen.findByText('Apple')
      expect(label.className).toContain('custom-label')
    })

    it('applies truncate class for text overflow', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <Combobox
          options={testOptions}
          displayValue={(option) => option?.name}
          aria-label="Fruit selector"
        >
          {(option) => (
            <ComboboxOption key={option.id} value={option}>
              <ComboboxLabel>{option.name}</ComboboxLabel>
            </ComboboxOption>
          )}
        </Combobox>
      )
      const button = container.querySelector('button')!
      await user.click(button)
      const label = await screen.findByText('Apple')
      expect(label.className).toContain('truncate')
    })
  })

  describe('ComboboxDescription', () => {
    it('renders description text', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <Combobox
          options={testOptions}
          displayValue={(option) => option?.name}
          aria-label="Fruit selector"
        >
          {(option) => (
            <ComboboxOption key={option.id} value={option}>
              <ComboboxLabel>{option.name}</ComboboxLabel>
              <ComboboxDescription>{option.description}</ComboboxDescription>
            </ComboboxOption>
          )}
        </Combobox>
      )
      const button = container.querySelector('button')!
      await user.click(button)
      expect(await screen.findByText('A red fruit')).toBeInTheDocument()
    })

    it('applies custom className', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <Combobox
          options={testOptions}
          displayValue={(option) => option?.name}
          aria-label="Fruit selector"
        >
          {(option) => (
            <ComboboxOption key={option.id} value={option}>
              <ComboboxLabel>{option.name}</ComboboxLabel>
              <ComboboxDescription className="custom-desc">{option.description}</ComboboxDescription>
            </ComboboxOption>
          )}
        </Combobox>
      )
      const button = container.querySelector('button')!
      await user.click(button)
      const desc = await screen.findByText('A red fruit')
      const descContainer = desc.closest('span[class*="flex"]')
      expect(descContainer?.className).toContain('custom-desc')
    })

    it('applies text-zinc-500 class for muted styling', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <Combobox
          options={testOptions}
          displayValue={(option) => option?.name}
          aria-label="Fruit selector"
        >
          {(option) => (
            <ComboboxOption key={option.id} value={option}>
              <ComboboxLabel>{option.name}</ComboboxLabel>
              <ComboboxDescription>{option.description}</ComboboxDescription>
            </ComboboxOption>
          )}
        </Combobox>
      )
      const button = container.querySelector('button')!
      await user.click(button)
      const desc = await screen.findByText('A red fruit')
      const descContainer = desc.closest('span[class*="flex"]')
      expect(descContainer?.className).toContain('text-zinc-500')
    })
  })

  describe('Full combobox composition', () => {
    it('renders a complete combobox with labels and descriptions', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      const { container } = render(
        <Combobox
          options={testOptions}
          displayValue={(option) => option?.name}
          onChange={onChange}
          placeholder="Select a fruit..."
          aria-label="Fruit selector"
        >
          {(option) => (
            <ComboboxOption key={option.id} value={option}>
              <ComboboxLabel>{option.name}</ComboboxLabel>
              <ComboboxDescription>{option.description}</ComboboxDescription>
            </ComboboxOption>
          )}
        </Combobox>
      )

      // Verify placeholder
      expect(screen.getByPlaceholderText('Select a fruit...')).toBeInTheDocument()

      // Open combobox
      const button = container.querySelector('button')!
      await user.click(button)

      // Wait for listbox and verify options are displayed
      await screen.findByRole('listbox')
      expect(screen.getByText('Apple')).toBeInTheDocument()
      expect(screen.getByText('A red fruit')).toBeInTheDocument()
      expect(screen.getByText('Banana')).toBeInTheDocument()
      expect(screen.getByText('A yellow fruit')).toBeInTheDocument()
      expect(screen.getByText('Cherry')).toBeInTheDocument()
      expect(screen.getByText('A small red fruit')).toBeInTheDocument()

      // Select an option
      await user.click(screen.getByText('Cherry'))

      // Verify selection
      expect(onChange).toHaveBeenCalledWith(testOptions[2])
      await waitFor(() => {
        expect(screen.getByRole('combobox')).toHaveValue('Cherry')
      })
    })

    it('handles keyboard navigation', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      const { container } = render(
        <Combobox
          options={testOptions}
          displayValue={(option) => option?.name}
          onChange={onChange}
          aria-label="Fruit selector"
        >
          {(option) => (
            <ComboboxOption key={option.id} value={option}>
              <ComboboxLabel>{option.name}</ComboboxLabel>
            </ComboboxOption>
          )}
        </Combobox>
      )

      const button = container.querySelector('button')!
      await user.click(button)
      await screen.findByRole('listbox')

      // Navigate with arrow keys
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{Enter}')

      // Should select the second option (Banana)
      expect(onChange).toHaveBeenCalledWith(testOptions[1])
    })
  })
})
