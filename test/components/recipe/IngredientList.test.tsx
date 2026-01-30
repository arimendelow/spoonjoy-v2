import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { IngredientList, type Ingredient } from '../../../app/components/recipe/IngredientList'

const sampleIngredients: Ingredient[] = [
  { id: '1', quantity: 2, unit: 'cups', name: 'flour' },
  { id: '2', quantity: 1, unit: 'cup', name: 'sugar' },
  { id: '3', quantity: 0.5, unit: 'cup', name: 'butter' },
]

describe('IngredientList', () => {
  describe('rendering', () => {
    it('renders list of ingredients', () => {
      render(
        <IngredientList
          ingredients={sampleIngredients}
          checkedIds={new Set()}
          onToggle={vi.fn()}
        />
      )
      expect(screen.getByTestId('ingredient-list')).toBeInTheDocument()
      expect(screen.getByText(/flour/)).toBeInTheDocument()
      expect(screen.getByText(/sugar/)).toBeInTheDocument()
      expect(screen.getByText(/butter/)).toBeInTheDocument()
    })

    it('returns null for empty ingredients', () => {
      const { container } = render(
        <IngredientList
          ingredients={[]}
          checkedIds={new Set()}
          onToggle={vi.fn()}
        />
      )
      expect(container).toBeEmptyDOMElement()
    })

    it('renders checkboxes by default', () => {
      render(
        <IngredientList
          ingredients={sampleIngredients}
          checkedIds={new Set()}
          onToggle={vi.fn()}
        />
      )
      expect(screen.getAllByRole('checkbox')).toHaveLength(3)
    })

    it('hides checkboxes when showCheckboxes is false', () => {
      render(
        <IngredientList
          ingredients={sampleIngredients}
          checkedIds={new Set()}
          showCheckboxes={false}
        />
      )
      expect(screen.queryByRole('checkbox')).toBeNull()
    })
  })

  describe('quantity display', () => {
    it('displays scaled quantities', () => {
      render(
        <IngredientList
          ingredients={[{ id: '1', quantity: 2, unit: 'cups', name: 'flour' }]}
          scaleFactor={1}
          checkedIds={new Set()}
          onToggle={vi.fn()}
        />
      )
      expect(screen.getByText(/2 cups flour/)).toBeInTheDocument()
    })

    it('applies scale factor to quantities', () => {
      render(
        <IngredientList
          ingredients={[{ id: '1', quantity: 2, unit: 'cups', name: 'flour' }]}
          scaleFactor={2}
          checkedIds={new Set()}
          onToggle={vi.fn()}
        />
      )
      expect(screen.getByText(/4 cups flour/)).toBeInTheDocument()
    })

    it('formats fractional quantities', () => {
      render(
        <IngredientList
          ingredients={[{ id: '1', quantity: 1.5, unit: 'cups', name: 'milk' }]}
          scaleFactor={1}
          checkedIds={new Set()}
          onToggle={vi.fn()}
        />
      )
      expect(screen.getByText(/1 ½/)).toBeInTheDocument()
    })

    it('handles null quantity', () => {
      render(
        <IngredientList
          ingredients={[{ id: '1', quantity: null, unit: 'cup', name: 'garnish' }]}
          scaleFactor={1}
          checkedIds={new Set()}
          onToggle={vi.fn()}
        />
      )
      // Should still render without crashing
      expect(screen.getByText(/garnish/)).toBeInTheDocument()
    })
  })

  describe('click-to-toggle behavior', () => {
    it('toggles checkbox when ingredient text is clicked', async () => {
      const onToggle = vi.fn()
      render(
        <IngredientList
          ingredients={sampleIngredients}
          checkedIds={new Set()}
          onToggle={onToggle}
        />
      )

      // Click on the ingredient text (not the checkbox)
      const flourText = screen.getByText(/flour/)
      await userEvent.click(flourText)
      expect(onToggle).toHaveBeenCalledWith('1')
    })

    it('clicking checkbox still works', async () => {
      const onToggle = vi.fn()
      render(
        <IngredientList
          ingredients={sampleIngredients}
          checkedIds={new Set()}
          onToggle={onToggle}
        />
      )

      const checkboxes = screen.getAllByRole('checkbox')
      await userEvent.click(checkboxes[0])
      expect(onToggle).toHaveBeenCalledWith('1')
    })

    it('clicking text toggles from checked to unchecked', async () => {
      const onToggle = vi.fn()
      render(
        <IngredientList
          ingredients={sampleIngredients}
          checkedIds={new Set(['1'])}
          onToggle={onToggle}
        />
      )

      // Click on the ingredient text
      const flourText = screen.getByText(/flour/)
      await userEvent.click(flourText)
      expect(onToggle).toHaveBeenCalledWith('1')
    })

    it('keyboard activation (Space) on text toggles checkbox', async () => {
      const onToggle = vi.fn()
      render(
        <IngredientList
          ingredients={sampleIngredients}
          checkedIds={new Set()}
          onToggle={onToggle}
        />
      )

      // Focus on a label and press space
      const labels = screen.getAllByRole('checkbox')
      labels[0].focus()
      await userEvent.keyboard(' ')
      expect(onToggle).toHaveBeenCalledWith('1')
    })

    it('strikethrough styling applies on check', () => {
      render(
        <IngredientList
          ingredients={sampleIngredients}
          checkedIds={new Set(['1'])}
          onToggle={vi.fn()}
        />
      )
      const strikethroughElements = document.querySelectorAll('.line-through')
      expect(strikethroughElements.length).toBeGreaterThan(0)
    })
  })

  describe('checked state', () => {
    it('renders unchecked by default', () => {
      render(
        <IngredientList
          ingredients={sampleIngredients}
          checkedIds={new Set()}
          onToggle={vi.fn()}
        />
      )
      const checkboxes = screen.getAllByRole('checkbox')
      checkboxes.forEach((checkbox) => {
        expect(checkbox).not.toBeChecked()
      })
    })

    it('renders checked items from checkedIds', () => {
      render(
        <IngredientList
          ingredients={sampleIngredients}
          checkedIds={new Set(['1', '3'])}
          onToggle={vi.fn()}
        />
      )
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes[0]).toBeChecked()
      expect(checkboxes[1]).not.toBeChecked()
      expect(checkboxes[2]).toBeChecked()
    })

    it('calls onToggle when checkbox is clicked', async () => {
      const onToggle = vi.fn()
      render(
        <IngredientList
          ingredients={sampleIngredients}
          checkedIds={new Set()}
          onToggle={onToggle}
        />
      )

      const checkboxes = screen.getAllByRole('checkbox')
      await userEvent.click(checkboxes[0])
      expect(onToggle).toHaveBeenCalledWith('1')
    })

    it('calls onToggle with correct id for each ingredient', async () => {
      const onToggle = vi.fn()
      render(
        <IngredientList
          ingredients={sampleIngredients}
          checkedIds={new Set()}
          onToggle={onToggle}
        />
      )

      const checkboxes = screen.getAllByRole('checkbox')
      await userEvent.click(checkboxes[1])
      expect(onToggle).toHaveBeenCalledWith('2')
    })
  })

  describe('visual styling', () => {
    it('applies strikethrough to checked items', () => {
      render(
        <IngredientList
          ingredients={sampleIngredients}
          checkedIds={new Set(['1'])}
          onToggle={vi.fn()}
        />
      )
      // Find the span with line-through class
      const strikethroughElements = document.querySelectorAll('.line-through')
      expect(strikethroughElements.length).toBeGreaterThan(0)
    })

    it('does not apply strikethrough to unchecked items', () => {
      render(
        <IngredientList
          ingredients={sampleIngredients}
          checkedIds={new Set()}
          onToggle={vi.fn()}
        />
      )
      const strikethroughElements = document.querySelectorAll('.line-through')
      expect(strikethroughElements.length).toBe(0)
    })
  })

  describe('accessibility', () => {
    it('has testid for testing', () => {
      render(
        <IngredientList
          ingredients={sampleIngredients}
          checkedIds={new Set()}
          onToggle={vi.fn()}
        />
      )
      expect(screen.getByTestId('ingredient-list')).toBeInTheDocument()
    })

    it('has accessible labels for checkboxes', () => {
      render(
        <IngredientList
          ingredients={[{ id: '1', quantity: 2, unit: 'cups', name: 'flour' }]}
          checkedIds={new Set()}
          onToggle={vi.fn()}
        />
      )
      expect(screen.getByRole('checkbox', { name: /flour/i })).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('handles ingredient without unit', () => {
      render(
        <IngredientList
          ingredients={[{ id: '1', quantity: 3, unit: '', name: 'large eggs' }]}
          checkedIds={new Set()}
          onToggle={vi.fn()}
        />
      )
      expect(screen.getByText(/3 large eggs/)).toBeInTheDocument()
    })

    it('handles large number of ingredients', () => {
      const manyIngredients = Array.from({ length: 20 }, (_, i) => ({
        id: String(i),
        quantity: i + 1,
        unit: 'cup',
        name: `ingredient ${i}`,
      }))

      render(
        <IngredientList
          ingredients={manyIngredients}
          checkedIds={new Set()}
          onToggle={vi.fn()}
        />
      )

      expect(screen.getAllByRole('checkbox')).toHaveLength(20)
    })

    it('preserves checked state with same checkedIds reference', () => {
      const checkedIds = new Set(['1'])
      const { rerender } = render(
        <IngredientList
          ingredients={sampleIngredients}
          checkedIds={checkedIds}
          onToggle={vi.fn()}
        />
      )

      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes[0]).toBeChecked()

      // Rerender with same reference
      rerender(
        <IngredientList
          ingredients={sampleIngredients}
          scaleFactor={2} // Change scale but keep same checkedIds
          checkedIds={checkedIds}
          onToggle={vi.fn()}
        />
      )

      const checkboxesAfter = screen.getAllByRole('checkbox')
      expect(checkboxesAfter[0]).toBeChecked()
    })
  })
})
