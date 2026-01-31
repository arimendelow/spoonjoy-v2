/**
 * Tests for StepDependencySelector component.
 *
 * This component allows selecting which previous steps this step depends on:
 * - Dropdown/multi-select of previous steps
 * - AI suggestion badges with accept/dismiss
 * - Only shows steps that come BEFORE current step
 */

import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { StepDependencySelector } from '~/components/recipe/StepDependencySelector'

// Step data structure for testing
interface StepInfo {
  stepNum: number
  description: string
}

// AI suggestion structure
interface AiSuggestion {
  stepNum: number
  reason?: string
}

describe('StepDependencySelector', () => {
  // Helper to create test steps
  function createTestSteps(count: number): StepInfo[] {
    return Array.from({ length: count }, (_, i) => ({
      stepNum: i + 1,
      description: `Step ${i + 1} description`,
    }))
  }

  describe('rendering', () => {
    it('renders "Uses output from" label', () => {
      const steps = createTestSteps(3)
      render(
        <StepDependencySelector
          currentStepNum={3}
          allSteps={steps}
          selectedDependencies={[]}
          onChange={vi.fn()}
        />
      )

      expect(screen.getByText(/uses output from/i)).toBeInTheDocument()
    })

    it('shows dropdown with previous steps only (not current or future)', () => {
      const steps = createTestSteps(5)
      render(
        <StepDependencySelector
          currentStepNum={3}
          allSteps={steps}
          selectedDependencies={[]}
          onChange={vi.fn()}
        />
      )

      // Open the dropdown
      const dropdown = screen.getByRole('combobox')
      expect(dropdown).toBeInTheDocument()

      // Click to open dropdown
      userEvent.click(dropdown)

      // Should show steps 1 and 2 only (before step 3)
      expect(screen.getByRole('option', { name: /step 1/i })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /step 2/i })).toBeInTheDocument()

      // Should NOT show step 3 (current) or steps 4-5 (future)
      expect(screen.queryByRole('option', { name: /step 3/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('option', { name: /step 4/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('option', { name: /step 5/i })).not.toBeInTheDocument()
    })

    it('no dropdown shown for Step 1 (no previous steps)', () => {
      const steps = createTestSteps(3)
      render(
        <StepDependencySelector
          currentStepNum={1}
          allSteps={steps}
          selectedDependencies={[]}
          onChange={vi.fn()}
        />
      )

      // Dropdown should not be present for step 1
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument()

      // Should show message indicating no previous steps
      expect(screen.getByText(/no previous steps/i)).toBeInTheDocument()
    })
  })

  describe('selection', () => {
    it('can select multiple dependencies', async () => {
      const steps = createTestSteps(4)
      const onChange = vi.fn()
      render(
        <StepDependencySelector
          currentStepNum={4}
          allSteps={steps}
          selectedDependencies={[]}
          onChange={onChange}
        />
      )

      // Open dropdown
      const dropdown = screen.getByRole('combobox')
      await userEvent.click(dropdown)

      // Select step 1
      await userEvent.click(screen.getByRole('option', { name: /step 1/i }))

      // Select step 2
      await userEvent.click(dropdown)
      await userEvent.click(screen.getByRole('option', { name: /step 2/i }))

      // onChange should have been called with the selected steps
      expect(onChange).toHaveBeenCalledWith(expect.arrayContaining([1]))
      expect(onChange).toHaveBeenLastCalledWith(expect.arrayContaining([1, 2]))
    })

    it('onChange called with selected step numbers', async () => {
      const steps = createTestSteps(3)
      const onChange = vi.fn()
      render(
        <StepDependencySelector
          currentStepNum={3}
          allSteps={steps}
          selectedDependencies={[]}
          onChange={onChange}
        />
      )

      // Open dropdown and select step 2
      const dropdown = screen.getByRole('combobox')
      await userEvent.click(dropdown)
      await userEvent.click(screen.getByRole('option', { name: /step 2/i }))

      // onChange should be called with array containing step number 2
      expect(onChange).toHaveBeenCalledWith([2])
    })

    it('selected dependencies shown as chips/tags', () => {
      const steps = createTestSteps(4)
      render(
        <StepDependencySelector
          currentStepNum={4}
          allSteps={steps}
          selectedDependencies={[1, 2]}
          onChange={vi.fn()}
        />
      )

      // Selected dependencies should be visible as chips
      const step1Chip = screen.getByRole('button', { name: /step 1/i })
      const step2Chip = screen.getByRole('button', { name: /step 2/i })

      expect(step1Chip).toBeInTheDocument()
      expect(step2Chip).toBeInTheDocument()
    })

    it('can remove selected dependency', async () => {
      const steps = createTestSteps(4)
      const onChange = vi.fn()
      render(
        <StepDependencySelector
          currentStepNum={4}
          allSteps={steps}
          selectedDependencies={[1, 2]}
          onChange={onChange}
        />
      )

      // Find the remove button on step 1 chip
      const step1Chip = screen.getByRole('button', { name: /step 1/i })
      const removeButton = within(step1Chip).getByRole('button', { name: /remove/i })

      await userEvent.click(removeButton)

      // onChange should be called without step 1
      expect(onChange).toHaveBeenCalledWith([2])
    })
  })

  describe('AI suggestions', () => {
    it('AI suggestions shown as badges when provided', () => {
      const steps = createTestSteps(4)
      const aiSuggestions: AiSuggestion[] = [
        { stepNum: 2, reason: 'Uses the dough from step 2' },
      ]
      render(
        <StepDependencySelector
          currentStepNum={4}
          allSteps={steps}
          selectedDependencies={[]}
          onChange={vi.fn()}
          aiSuggestions={aiSuggestions}
        />
      )

      // AI suggestion should be visible as a badge
      expect(screen.getByText(/step 2 looks like a dependency/i)).toBeInTheDocument()
    })

    it('clicking AI suggestion adds it to selection', async () => {
      const steps = createTestSteps(4)
      const onChange = vi.fn()
      const aiSuggestions: AiSuggestion[] = [
        { stepNum: 2, reason: 'Uses the dough from step 2' },
      ]
      render(
        <StepDependencySelector
          currentStepNum={4}
          allSteps={steps}
          selectedDependencies={[]}
          onChange={onChange}
          aiSuggestions={aiSuggestions}
        />
      )

      // Click the "add it" button on the suggestion
      const addButton = screen.getByRole('button', { name: /add it/i })
      await userEvent.click(addButton)

      // onChange should be called with the suggested step
      expect(onChange).toHaveBeenCalledWith([2])
    })

    it('dismiss button removes AI suggestion', async () => {
      const steps = createTestSteps(4)
      const aiSuggestions: AiSuggestion[] = [
        { stepNum: 2, reason: 'Uses the dough from step 2' },
      ]
      render(
        <StepDependencySelector
          currentStepNum={4}
          allSteps={steps}
          selectedDependencies={[]}
          onChange={vi.fn()}
          aiSuggestions={aiSuggestions}
        />
      )

      // Click the dismiss button
      const dismissButton = screen.getByRole('button', { name: /dismiss/i })
      await userEvent.click(dismissButton)

      // Suggestion should no longer be visible
      expect(screen.queryByText(/step 2 looks like a dependency/i)).not.toBeInTheDocument()
    })
  })

  describe('disabled state', () => {
    it('disabled prop disables all interactions', () => {
      const steps = createTestSteps(4)
      const aiSuggestions: AiSuggestion[] = [
        { stepNum: 2, reason: 'Uses output from step 2' },
      ]
      render(
        <StepDependencySelector
          currentStepNum={4}
          allSteps={steps}
          selectedDependencies={[1]}
          onChange={vi.fn()}
          aiSuggestions={aiSuggestions}
          disabled
        />
      )

      // Dropdown should be disabled
      const dropdown = screen.getByRole('combobox')
      expect(dropdown).toBeDisabled()

      // Remove buttons on chips should be disabled
      const step1Chip = screen.getByRole('button', { name: /step 1/i })
      const removeButton = within(step1Chip).getByRole('button', { name: /remove/i })
      expect(removeButton).toBeDisabled()

      // AI suggestion buttons should be disabled
      const addButton = screen.getByRole('button', { name: /add it/i })
      const dismissButton = screen.getByRole('button', { name: /dismiss/i })
      expect(addButton).toBeDisabled()
      expect(dismissButton).toBeDisabled()
    })
  })
})
