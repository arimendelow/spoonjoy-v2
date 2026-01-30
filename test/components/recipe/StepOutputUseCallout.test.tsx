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
