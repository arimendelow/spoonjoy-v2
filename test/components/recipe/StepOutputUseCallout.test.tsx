import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { StepOutputUseCallout } from '../../../app/components/recipe/StepOutputUseCallout'

describe('StepOutputUseCallout', () => {
  describe('rendering', () => {
    it('renders nothing for empty references', () => {
      render(<StepOutputUseCallout references={[]} />)
      expect(screen.queryByTestId('step-output-callout')).toBeNull()
    })

    it('renders callout for single reference', () => {
      render(
        <StepOutputUseCallout
          references={[{ id: '1', stepNumber: 2, stepTitle: null }]}
        />
      )
      expect(screen.getByTestId('step-output-callout')).toBeInTheDocument()
    })

    it('renders callout for multiple references', () => {
      render(
        <StepOutputUseCallout
          references={[
            { id: '1', stepNumber: 2, stepTitle: null },
            { id: '2', stepNumber: 3, stepTitle: null },
          ]}
        />
      )
      expect(screen.getByTestId('step-output-callout')).toBeInTheDocument()
    })

    it('displays header text', () => {
      render(
        <StepOutputUseCallout
          references={[{ id: '1', stepNumber: 2, stepTitle: null }]}
        />
      )
      expect(screen.getByText('Using output from:')).toBeInTheDocument()
    })
  })

  describe('step reference display', () => {
    it('displays step number', () => {
      render(
        <StepOutputUseCallout
          references={[{ id: '1', stepNumber: 3, stepTitle: null }]}
        />
      )
      expect(screen.getByText('Step 3')).toBeInTheDocument()
    })

    it('displays step number with title', () => {
      render(
        <StepOutputUseCallout
          references={[{ id: '1', stepNumber: 2, stepTitle: 'Make the roux' }]}
        />
      )
      expect(screen.getByText('Step 2')).toBeInTheDocument()
      expect(screen.getByText(/Make the roux/)).toBeInTheDocument()
    })

    it('displays multiple references', () => {
      render(
        <StepOutputUseCallout
          references={[
            { id: '1', stepNumber: 1, stepTitle: 'First step' },
            { id: '2', stepNumber: 2, stepTitle: 'Second step' },
            { id: '3', stepNumber: 3, stepTitle: null },
          ]}
        />
      )
      expect(screen.getByText('Step 1')).toBeInTheDocument()
      expect(screen.getByText('Step 2')).toBeInTheDocument()
      expect(screen.getByText('Step 3')).toBeInTheDocument()
      expect(screen.getByText(/First step/)).toBeInTheDocument()
      expect(screen.getByText(/Second step/)).toBeInTheDocument()
    })
  })

  describe('click behavior', () => {
    it('calls onStepClick when reference is clicked', async () => {
      const onStepClick = vi.fn()
      render(
        <StepOutputUseCallout
          references={[{ id: '1', stepNumber: 2, stepTitle: 'Make the sauce' }]}
          onStepClick={onStepClick}
        />
      )

      const button = screen.getByRole('button')
      await userEvent.click(button)
      expect(onStepClick).toHaveBeenCalledWith(2)
    })

    it('passes correct step number for each reference', async () => {
      const onStepClick = vi.fn()
      render(
        <StepOutputUseCallout
          references={[
            { id: '1', stepNumber: 2, stepTitle: 'First' },
            { id: '2', stepNumber: 5, stepTitle: 'Second' },
          ]}
          onStepClick={onStepClick}
        />
      )

      const buttons = screen.getAllByRole('button')
      await userEvent.click(buttons[1])
      expect(onStepClick).toHaveBeenCalledWith(5)
    })

    it('renders as span when no onStepClick provided', () => {
      render(
        <StepOutputUseCallout
          references={[{ id: '1', stepNumber: 2, stepTitle: 'Make the sauce' }]}
        />
      )

      expect(screen.queryByRole('button')).toBeNull()
    })
  })

  describe('edge cases', () => {
    it('handles null stepTitle', () => {
      render(
        <StepOutputUseCallout
          references={[{ id: '1', stepNumber: 2, stepTitle: null }]}
        />
      )
      expect(screen.getByText('Step 2')).toBeInTheDocument()
    })

    it('handles empty string stepTitle', () => {
      render(
        <StepOutputUseCallout
          references={[{ id: '1', stepNumber: 2, stepTitle: '' }]}
        />
      )
      // Empty string is falsy, should just show step number
      expect(screen.getByText('Step 2')).toBeInTheDocument()
    })

    it('handles long step titles', () => {
      render(
        <StepOutputUseCallout
          references={[
            {
              id: '1',
              stepNumber: 2,
              stepTitle:
                'Caramelize the onions slowly over low heat until deeply golden brown and incredibly fragrant',
            },
          ]}
        />
      )
      expect(
        screen.getByText(
          /Caramelize the onions slowly over low heat until deeply golden brown and incredibly fragrant/
        )
      ).toBeInTheDocument()
    })

    it('handles large step numbers', () => {
      render(
        <StepOutputUseCallout
          references={[{ id: '1', stepNumber: 99, stepTitle: null }]}
        />
      )
      expect(screen.getByText('Step 99')).toBeInTheDocument()
    })
  })

  describe('checkable behavior', () => {
    it('renders checkboxes when onToggle provided', () => {
      render(
        <StepOutputUseCallout
          references={[{ id: '1', stepNumber: 2, stepTitle: 'Make sauce' }]}
          onToggle={vi.fn()}
          checkedIds={new Set()}
        />
      )
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('does not render checkboxes when showCheckboxes is false', () => {
      render(
        <StepOutputUseCallout
          references={[{ id: '1', stepNumber: 2, stepTitle: 'Make sauce' }]}
          onToggle={vi.fn()}
          checkedIds={new Set()}
          showCheckboxes={false}
        />
      )
      expect(screen.queryByRole('checkbox')).toBeNull()
    })

    it('does not render checkboxes when onToggle not provided', () => {
      render(
        <StepOutputUseCallout
          references={[{ id: '1', stepNumber: 2, stepTitle: 'Make sauce' }]}
          checkedIds={new Set()}
        />
      )
      expect(screen.queryByRole('checkbox')).toBeNull()
    })

    it('toggles checkbox when clicked', async () => {
      const onToggle = vi.fn()
      render(
        <StepOutputUseCallout
          references={[{ id: '1', stepNumber: 2, stepTitle: 'Make sauce' }]}
          onToggle={onToggle}
          checkedIds={new Set()}
        />
      )

      const checkbox = screen.getByRole('checkbox')
      await userEvent.click(checkbox)
      expect(onToggle).toHaveBeenCalledWith('1')
    })

    it('toggles checkbox when text is clicked', async () => {
      const onToggle = vi.fn()
      render(
        <StepOutputUseCallout
          references={[{ id: '1', stepNumber: 2, stepTitle: 'Make sauce' }]}
          onToggle={onToggle}
          checkedIds={new Set()}
        />
      )

      const text = screen.getByText(/Make sauce/)
      await userEvent.click(text)
      expect(onToggle).toHaveBeenCalledWith('1')
    })

    it('renders checked state from checkedIds', () => {
      render(
        <StepOutputUseCallout
          references={[
            { id: '1', stepNumber: 2, stepTitle: 'First' },
            { id: '2', stepNumber: 3, stepTitle: 'Second' },
          ]}
          onToggle={vi.fn()}
          checkedIds={new Set(['1'])}
        />
      )

      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes[0]).toBeChecked()
      expect(checkboxes[1]).not.toBeChecked()
    })

    it('applies visual distinction to checked items', () => {
      render(
        <StepOutputUseCallout
          references={[{ id: '1', stepNumber: 2, stepTitle: 'Make sauce' }]}
          onToggle={vi.fn()}
          checkedIds={new Set(['1'])}
        />
      )

      // Should have strikethrough or muted styling
      const mutedElements = document.querySelectorAll('.line-through, .text-zinc-500')
      expect(mutedElements.length).toBeGreaterThan(0)
    })

    it('calls onToggle with correct id for multiple references', async () => {
      const onToggle = vi.fn()
      render(
        <StepOutputUseCallout
          references={[
            { id: 'ref-a', stepNumber: 1, stepTitle: 'First' },
            { id: 'ref-b', stepNumber: 2, stepTitle: 'Second' },
            { id: 'ref-c', stepNumber: 3, stepTitle: 'Third' },
          ]}
          onToggle={onToggle}
          checkedIds={new Set()}
        />
      )

      const checkboxes = screen.getAllByRole('checkbox')
      await userEvent.click(checkboxes[1])
      expect(onToggle).toHaveBeenCalledWith('ref-b')
    })

    it('still returns null for empty references with checkable props', () => {
      render(
        <StepOutputUseCallout
          references={[]}
          onToggle={vi.fn()}
          checkedIds={new Set()}
        />
      )
      expect(screen.queryByTestId('step-output-callout')).toBeNull()
    })

    it('renders checkbox with null stepTitle', () => {
      const onToggle = vi.fn()
      render(
        <StepOutputUseCallout
          references={[{ id: '1', stepNumber: 2, stepTitle: null }]}
          onToggle={onToggle}
          checkedIds={new Set()}
        />
      )

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
      // The checkbox should render with just the step number in the label
      expect(screen.getByText('Step 2')).toBeInTheDocument()
    })

    it('renders checkbox with empty string stepTitle', () => {
      const onToggle = vi.fn()
      render(
        <StepOutputUseCallout
          references={[{ id: '1', stepNumber: 3, stepTitle: '' }]}
          onToggle={onToggle}
          checkedIds={new Set()}
        />
      )

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
      // Empty string stepTitle should be treated as falsy
      expect(screen.getByText('Step 3')).toBeInTheDocument()
    })

    it('renders multiple checkboxes with mixed stepTitles', () => {
      const onToggle = vi.fn()
      render(
        <StepOutputUseCallout
          references={[
            { id: '1', stepNumber: 1, stepTitle: 'Prep ingredients' },
            { id: '2', stepNumber: 2, stepTitle: null },
            { id: '3', stepNumber: 3, stepTitle: '' },
          ]}
          onToggle={onToggle}
          checkedIds={new Set()}
        />
      )

      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes).toHaveLength(3)
      // First has title
      expect(screen.getByText(/Prep ingredients/)).toBeInTheDocument()
      // Others don't
      expect(screen.getByText('Step 2')).toBeInTheDocument()
      expect(screen.getByText('Step 3')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has testid for testing', () => {
      render(
        <StepOutputUseCallout
          references={[{ id: '1', stepNumber: 2, stepTitle: null }]}
        />
      )
      expect(screen.getByTestId('step-output-callout')).toBeInTheDocument()
    })

    it('has accessible button when onClick provided', () => {
      render(
        <StepOutputUseCallout
          references={[{ id: '1', stepNumber: 2, stepTitle: 'Make sauce' }]}
          onStepClick={vi.fn()}
        />
      )
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })
})
