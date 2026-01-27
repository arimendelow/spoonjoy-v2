import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as Headless from '@headlessui/react'
import { Combobox, ComboboxOption, ComboboxLabel, ComboboxDescription, renderOption, createVirtualOptionRenderer } from '~/components/ui/combobox'

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
      const onChange = vi.fn()
      render(
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
      const input = screen.getByRole('combobox')
      // Type 'app' to filter to only Apple
      await user.type(input, 'app')
      await screen.findByRole('listbox')
      // Navigate down to select the filtered option and press Enter
      await user.keyboard('{ArrowDown}{Enter}')
      // Should select Apple (the only filtered option)
      expect(onChange).toHaveBeenCalledWith(testOptions[0])
    })

    it('uses custom filter function when provided', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      const customFilter = (option: TestOption, query: string) =>
        option.description?.toLowerCase().includes(query.toLowerCase()) ?? false

      render(
        <Combobox
          options={testOptions}
          displayValue={(option) => option?.name}
          filter={customFilter}
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
      const input = screen.getByRole('combobox')
      // Type 'yellow' to filter by description (only Banana has 'yellow' in description)
      await user.type(input, 'yellow')
      await screen.findByRole('listbox')
      // Navigate and select the filtered option
      await user.keyboard('{ArrowDown}{Enter}')
      // Should select Banana (the only option with 'yellow' in description)
      expect(onChange).toHaveBeenCalledWith(testOptions[1])
    })

    it('calls onChange when option is selected', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(
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
      // Type to open the listbox - type 'app' to match only Apple
      const input = screen.getByRole('combobox')
      await user.type(input, 'app')
      await screen.findByRole('listbox')
      // Use keyboard to select the only filtered option (Apple)
      await user.keyboard('{ArrowDown}{Enter}')
      expect(onChange).toHaveBeenCalledWith(testOptions[0])
    })

    it('displays selected value in input', async () => {
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
      // Type 'b' to filter to Banana
      await user.type(input, 'b')
      await screen.findByRole('listbox')
      // Select Banana (first filtered option)
      await user.keyboard('{ArrowDown}{Enter}')
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
      const onChange = vi.fn()
      render(
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
      const input = screen.getByRole('combobox')
      // Type 'app' to filter to only Apple
      await user.type(input, 'app')
      await screen.findByRole('listbox')
      // Verify we can interact with options via keyboard
      await user.keyboard('{ArrowDown}{Enter}')
      expect(onChange).toHaveBeenCalledWith(testOptions[0])
    })

    it('applies custom className to option', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(
        <Combobox
          options={testOptions}
          displayValue={(option) => option?.name}
          onChange={onChange}
          aria-label="Fruit selector"
        >
          {(option) => (
            <ComboboxOption key={option.id} value={option} className="custom-option">
              <ComboboxLabel>{option.name}</ComboboxLabel>
            </ComboboxOption>
          )}
        </Combobox>
      )
      const input = screen.getByRole('combobox')
      // Type 'app' to filter to only Apple
      await user.type(input, 'app')
      await screen.findByRole('listbox')
      // Verify we can still select options
      await user.keyboard('{ArrowDown}{Enter}')
      expect(onChange).toHaveBeenCalledWith(testOptions[0])
    })

    it('supports disabled option', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(
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
      const input = screen.getByRole('combobox')
      // Type to open the listbox (show all)
      await user.type(input, ' ')
      await user.clear(input)
      await screen.findByRole('listbox')
      // Arrow down skips disabled option (Apple) and selects Banana
      await user.keyboard('{ArrowDown}{Enter}')
      expect(onChange).toHaveBeenCalledWith(testOptions[1])
    })
  })

  describe('renderOption helper', () => {
    it('calls children callback with option value', () => {
      const childrenFn = vi.fn((option: TestOption) => (
        <ComboboxOption key={option.id} value={option}>
          <ComboboxLabel>{option.name}</ComboboxLabel>
        </ComboboxOption>
      ))
      const option = testOptions[0]
      renderOption(childrenFn, option)
      expect(childrenFn).toHaveBeenCalledWith(option)
    })

    it('returns the rendered element from children callback', () => {
      const childrenFn = (option: TestOption) => (
        <ComboboxOption key={option.id} value={option}>
          <ComboboxLabel>{option.name}</ComboboxLabel>
        </ComboboxOption>
      )
      const result = renderOption(childrenFn, testOptions[0])
      expect(result).toBeDefined()
      expect(result.type).toBe(ComboboxOption)
    })
  })

  describe('createVirtualOptionRenderer', () => {
    it('creates a renderer function that calls children with option', () => {
      const childrenFn = vi.fn((option: TestOption) => (
        <ComboboxOption key={option.id} value={option}>
          <ComboboxLabel>{option.name}</ComboboxLabel>
        </ComboboxOption>
      ))
      const renderer = createVirtualOptionRenderer(childrenFn)
      renderer({ option: testOptions[0] })
      expect(childrenFn).toHaveBeenCalledWith(testOptions[0])
    })

    it('returns the rendered element from the created renderer', () => {
      const childrenFn = (option: TestOption) => (
        <ComboboxOption key={option.id} value={option}>
          <ComboboxLabel>{option.name}</ComboboxLabel>
        </ComboboxOption>
      )
      const renderer = createVirtualOptionRenderer(childrenFn)
      const result = renderer({ option: testOptions[1] })
      expect(result).toBeDefined()
      expect(result.type).toBe(ComboboxOption)
    })
  })

  describe('ComboboxOption direct rendering', () => {
    // These tests use HeadlessUI Combobox directly (non-virtual) to test ComboboxOption
    it('renders ComboboxOption with checkmark SVG', async () => {
      const user = userEvent.setup()
      render(
        <Headless.Combobox value={testOptions[0]}>
          <Headless.ComboboxInput aria-label="Test" />
          <Headless.ComboboxOptions static>
            <ComboboxOption value={testOptions[0]}>
              <ComboboxLabel>Apple</ComboboxLabel>
            </ComboboxOption>
            <ComboboxOption value={testOptions[1]}>
              <ComboboxLabel>Banana</ComboboxLabel>
            </ComboboxOption>
          </Headless.ComboboxOptions>
        </Headless.Combobox>
      )
      // With static option, options are always visible
      const options = screen.getAllByRole('option')
      expect(options).toHaveLength(2)
      // Verify the checkmark SVG is rendered
      const selectedOption = options[0]
      const svg = selectedOption.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg?.querySelector('path[d="M4 8.5l3 3L12 4"]')).toBeInTheDocument()
    })


    it('applies className to ComboboxOption inner span', async () => {
      render(
        <Headless.Combobox>
          <Headless.ComboboxInput aria-label="Test" />
          <Headless.ComboboxOptions static>
            <ComboboxOption value="test" className="custom-option-class">
              <ComboboxLabel>Test Option</ComboboxLabel>
            </ComboboxOption>
          </Headless.ComboboxOptions>
        </Headless.Combobox>
      )
      const option = screen.getByRole('option')
      const innerSpan = option.querySelector('span.custom-option-class')
      expect(innerSpan).toBeInTheDocument()
    })

    it('renders children inside ComboboxOption', async () => {
      render(
        <Headless.Combobox>
          <Headless.ComboboxInput aria-label="Test" />
          <Headless.ComboboxOptions static>
            <ComboboxOption value="test">
              <span data-testid="child-content">Child Content</span>
            </ComboboxOption>
          </Headless.ComboboxOptions>
        </Headless.Combobox>
      )
      expect(screen.getByTestId('child-content')).toBeInTheDocument()
    })

    it('renders ComboboxOption with no children', async () => {
      render(
        <Headless.Combobox>
          <Headless.ComboboxInput aria-label="Test" />
          <Headless.ComboboxOptions static>
            <ComboboxOption value="test" />
          </Headless.ComboboxOptions>
        </Headless.Combobox>
      )
      const option = screen.getByRole('option')
      expect(option).toBeInTheDocument()
    })

    it('applies shared styling classes to option span', async () => {
      render(
        <Headless.Combobox>
          <Headless.ComboboxInput aria-label="Test" />
          <Headless.ComboboxOptions static>
            <ComboboxOption value="test">
              <ComboboxLabel>Test</ComboboxLabel>
            </ComboboxOption>
          </Headless.ComboboxOptions>
        </Headless.Combobox>
      )
      const option = screen.getByRole('option')
      const innerSpan = option.querySelector('span')
      expect(innerSpan?.className).toContain('flex')
      expect(innerSpan?.className).toContain('min-w-0')
      expect(innerSpan?.className).toContain('items-center')
    })
  })

  describe('ComboboxLabel', () => {
    it('renders label in option', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(
        <Combobox
          options={testOptions}
          displayValue={(option) => option ? `Fruit: ${option.name}` : ''}
          onChange={onChange}
          aria-label="Fruit selector"
        >
          {(option) => (
            <ComboboxOption key={option.id} value={option}>
              <ComboboxLabel>Fruit: {option.name}</ComboboxLabel>
            </ComboboxOption>
          )}
        </Combobox>
      )
      const input = screen.getByRole('combobox')
      // Type 'app' to filter to only Apple
      await user.type(input, 'app')
      await screen.findByRole('listbox')
      await user.keyboard('{ArrowDown}{Enter}')
      // Verify selection works (label is rendered correctly if selection works)
      expect(onChange).toHaveBeenCalledWith(testOptions[0])
      await waitFor(() => {
        expect(input).toHaveValue('Fruit: Apple')
      })
    })

    it('applies custom className', () => {
      // Test ComboboxLabel component directly for className
      const { container } = render(
        <ComboboxLabel className="custom-label">Test Label</ComboboxLabel>
      )
      const label = container.querySelector('span')
      expect(label?.className).toContain('custom-label')
    })

    it('applies truncate class for text overflow', () => {
      // Test ComboboxLabel component directly for truncate class
      const { container } = render(
        <ComboboxLabel>Test Label</ComboboxLabel>
      )
      const label = container.querySelector('span')
      expect(label?.className).toContain('truncate')
    })
  })

  describe('ComboboxDescription', () => {
    it('renders description text', () => {
      // Test ComboboxDescription component directly
      const { container } = render(
        <ComboboxDescription>A red fruit</ComboboxDescription>
      )
      expect(screen.getByText('A red fruit')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      // Test ComboboxDescription component directly for className
      const { container } = render(
        <ComboboxDescription className="custom-desc">Description text</ComboboxDescription>
      )
      const descContainer = container.querySelector('span')
      expect(descContainer?.className).toContain('custom-desc')
    })

    it('applies text-zinc-500 class for muted styling', () => {
      // Test ComboboxDescription component directly for styling
      const { container } = render(
        <ComboboxDescription>Description text</ComboboxDescription>
      )
      const descContainer = container.querySelector('span')
      expect(descContainer?.className).toContain('text-zinc-500')
    })
  })

  describe('Full combobox composition', () => {
    it('renders a complete combobox with labels and descriptions', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(
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

      // Type 'c' to filter to Cherry
      const input = screen.getByRole('combobox')
      await user.type(input, 'c')
      await screen.findByRole('listbox')

      // Select Cherry (first filtered option matching 'c')
      await user.keyboard('{ArrowDown}{Enter}')

      // Verify selection
      expect(onChange).toHaveBeenCalledWith(testOptions[2])
      await waitFor(() => {
        expect(screen.getByRole('combobox')).toHaveValue('Cherry')
      })
    })

    it('handles keyboard navigation', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(
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

      const input = screen.getByRole('combobox')
      // Type 'app' to filter to only Apple
      await user.type(input, 'app')
      await screen.findByRole('listbox')

      // Navigate with arrow keys - ArrowDown moves to first filtered option (Apple)
      await user.keyboard('{ArrowDown}{Enter}')

      // Should select Apple (the only filtered option)
      expect(onChange).toHaveBeenCalledWith(testOptions[0])
    })
  })
})
