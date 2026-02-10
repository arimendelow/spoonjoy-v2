import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { StepCard } from '../../../app/components/recipe/StepCard'

const ingredientListSpy = vi.fn()

vi.mock('../../../app/components/recipe/IngredientList', () => ({
  IngredientList: (props: unknown) => {
    ingredientListSpy(props)
    return <div data-testid="ingredient-list-mock" />
  },
}))

describe('StepCard', () => {
  beforeEach(() => {
    ingredientListSpy.mockClear()
  })

  it('renders title and description', () => {
    render(
      <StepCard
        stepNumber={1}
        title="Mix"
        description="Mix everything"
        ingredients={[]}
        stepOutputUses={[]}
      />
    )

    expect(screen.getByText('Mix')).toBeInTheDocument()
    expect(screen.getByText('Mix everything')).toBeInTheDocument()
  })

  it('passes showCheckboxes=true when only step output toggle is provided', () => {
    render(
      <StepCard
        stepNumber={1}
        description="Use prior output"
        ingredients={[{ id: 'i1', quantity: 1, unit: 'cup', name: 'water' }]}
        stepOutputUses={[]}
        onStepOutputToggle={vi.fn()}
      />
    )

    expect(screen.getByTestId('ingredient-list-mock')).toBeInTheDocument()
    expect(ingredientListSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        showCheckboxes: true,
      })
    )
  })
})
