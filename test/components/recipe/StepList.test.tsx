/**
 * Tests for StepList component.
 *
 * This component manages a collection of StepEditorCard instances with:
 * - '+ Add Step' button to add new steps at end
 * - Remove step with confirmation dialog
 * - Empty state handling
 * - Steps array management (controlled component)
 */

import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { createRoutesStub } from 'react-router'
import { StepList } from '~/components/recipe/StepList'
import type { StepData } from '~/components/recipe/StepEditorCard'

// Mock localStorage for IngredientInputToggle used by StepEditorCard
let localStorageStore: Record<string, string> = {}

const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageStore[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageStore[key]
  }),
  clear: vi.fn(() => {
    localStorageStore = {}
  }),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Helper to create test steps
function createTestStep(overrides: Partial<StepData> = {}): StepData {
  return {
    id: `step-${Math.random().toString(36).substring(7)}`,
    stepNum: 1,
    description: 'Test step description',
    ingredients: [],
    ...overrides,
  }
}

// Create test wrapper with router context (needed for StepEditorCard's AI parsing)
function createTestWrapper(props: Partial<React.ComponentProps<typeof StepList>> = {}) {
  const defaultProps = {
    steps: [],
    recipeId: 'recipe-1',
    onChange: vi.fn(),
    ...props,
  }

  return createRoutesStub([
    {
      path: '/recipes/:id/edit',
      Component: () => <StepList {...defaultProps} />,
      action: async () => ({ parsedIngredients: [] }),
    },
    // Route for AI ingredient parsing
    {
      path: '/recipes/:id/steps/:stepId/edit',
      action: async () => ({ parsedIngredients: [] }),
    },
  ])
}

describe('StepList', () => {
  beforeEach(() => {
    localStorageStore = {}
    vi.resetAllMocks()
    localStorageMock.getItem.mockImplementation((key: string) => localStorageStore[key] ?? null)
    localStorageMock.setItem.mockImplementation((key: string, value: string) => {
      localStorageStore[key] = value
    })
    localStorageMock.removeItem.mockImplementation((key: string) => {
      delete localStorageStore[key]
    })
    localStorageMock.clear.mockImplementation(() => {
      localStorageStore = {}
    })
  })

  afterEach(() => {
    localStorageMock.clear()
  })

  describe('empty state', () => {
    it('renders empty state when steps array is empty', () => {
      const Wrapper = createTestWrapper({ steps: [] })
      render(<Wrapper initialEntries={['/recipes/recipe-1/edit']} />)

      expect(screen.getByText(/no steps/i)).toBeInTheDocument()
    })
  })

  describe('rendering steps', () => {
    it('renders StepEditorCard for each step in array', () => {
      const steps = [
        createTestStep({ id: 'step-1', stepNum: 1, description: 'First step' }),
        createTestStep({ id: 'step-2', stepNum: 2, description: 'Second step' }),
        createTestStep({ id: 'step-3', stepNum: 3, description: 'Third step' }),
      ]
      const Wrapper = createTestWrapper({ steps })
      render(<Wrapper initialEntries={['/recipes/recipe-1/edit']} />)

      // Should render 3 step cards
      const articles = screen.getAllByRole('article')
      expect(articles).toHaveLength(3)

      // Each step should be labeled correctly
      expect(screen.getByLabelText(/step 1/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/step 2/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/step 3/i)).toBeInTheDocument()
    })

    it('steps maintain correct numbering (1, 2, 3...)', () => {
      const steps = [
        createTestStep({ id: 'step-1', stepNum: 1, description: 'First' }),
        createTestStep({ id: 'step-2', stepNum: 2, description: 'Second' }),
        createTestStep({ id: 'step-3', stepNum: 3, description: 'Third' }),
      ]
      const Wrapper = createTestWrapper({ steps })
      render(<Wrapper initialEntries={['/recipes/recipe-1/edit']} />)

      // Check step numbers are displayed in order
      const stepNumbers = screen.getAllByRole('article')
      expect(within(stepNumbers[0]).getByText('1')).toBeInTheDocument()
      expect(within(stepNumbers[1]).getByText('2')).toBeInTheDocument()
      expect(within(stepNumbers[2]).getByText('3')).toBeInTheDocument()
    })
  })

  describe('add step functionality', () => {
    it('renders "+ Add Step" button visible and clickable', () => {
      const Wrapper = createTestWrapper({ steps: [] })
      render(<Wrapper initialEntries={['/recipes/recipe-1/edit']} />)

      const addButton = screen.getByRole('button', { name: /add step/i })
      expect(addButton).toBeInTheDocument()
      expect(addButton).toBeEnabled()
    })

    it('clicking add step calls onChange with new step appended', async () => {
      const onChange = vi.fn()
      const existingSteps = [
        createTestStep({ id: 'step-1', stepNum: 1, description: 'First step' }),
      ]
      const Wrapper = createTestWrapper({ steps: existingSteps, onChange })
      render(<Wrapper initialEntries={['/recipes/recipe-1/edit']} />)

      await userEvent.click(screen.getByRole('button', { name: /add step/i }))

      expect(onChange).toHaveBeenCalledTimes(1)
      const newSteps = onChange.mock.calls[0][0]
      expect(newSteps).toHaveLength(2)
      expect(newSteps[0]).toEqual(existingSteps[0])
      // New step should have correct stepNum
      expect(newSteps[1].stepNum).toBe(2)
      expect(newSteps[1].description).toBe('')
      expect(newSteps[1].ingredients).toEqual([])
    })
  })

  describe('remove step functionality', () => {
    it('remove step shows confirmation dialog', async () => {
      const steps = [createTestStep({ id: 'step-1', stepNum: 1 })]
      const Wrapper = createTestWrapper({ steps })
      render(<Wrapper initialEntries={['/recipes/recipe-1/edit']} />)

      // Click the remove button on the step card
      await userEvent.click(screen.getByRole('button', { name: /remove/i }))

      // Confirmation dialog should appear
      expect(screen.getByRole('alertdialog')).toBeInTheDocument()
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
    })

    it('confirming removal calls onChange without removed step', async () => {
      const onChange = vi.fn()
      const steps = [
        createTestStep({ id: 'step-1', stepNum: 1, description: 'First' }),
        createTestStep({ id: 'step-2', stepNum: 2, description: 'Second' }),
      ]
      const Wrapper = createTestWrapper({ steps, onChange })
      render(<Wrapper initialEntries={['/recipes/recipe-1/edit']} />)

      // Click remove on first step
      const firstStepCard = screen.getByLabelText(/step 1/i)
      await userEvent.click(within(firstStepCard).getByRole('button', { name: /remove/i }))

      // Confirm removal
      await userEvent.click(screen.getByRole('button', { name: /confirm/i }))

      expect(onChange).toHaveBeenCalledTimes(1)
      const newSteps = onChange.mock.calls[0][0]
      expect(newSteps).toHaveLength(1)
      expect(newSteps[0].id).toBe('step-2')
      // Step number should be renumbered to 1
      expect(newSteps[0].stepNum).toBe(1)
    })

    it('canceling removal keeps step', async () => {
      const onChange = vi.fn()
      const steps = [createTestStep({ id: 'step-1', stepNum: 1 })]
      const Wrapper = createTestWrapper({ steps, onChange })
      render(<Wrapper initialEntries={['/recipes/recipe-1/edit']} />)

      // Click remove
      await userEvent.click(screen.getByRole('button', { name: /remove/i }))

      // Cancel removal
      await userEvent.click(screen.getByRole('button', { name: /cancel/i }))

      // onChange should not have been called
      expect(onChange).not.toHaveBeenCalled()

      // Step should still be visible
      expect(screen.getByLabelText(/step 1/i)).toBeInTheDocument()
    })
  })

  describe('disabled state', () => {
    it('disabled prop disables add button and all step cards', () => {
      const steps = [
        createTestStep({ id: 'step-1', stepNum: 1 }),
        createTestStep({ id: 'step-2', stepNum: 2 }),
      ]
      const Wrapper = createTestWrapper({ steps, disabled: true })
      render(<Wrapper initialEntries={['/recipes/recipe-1/edit']} />)

      // Add button should be disabled
      expect(screen.getByRole('button', { name: /add step/i })).toBeDisabled()

      // All step cards should have disabled controls
      const removeButtons = screen.getAllByRole('button', { name: /remove/i })
      removeButtons.forEach((button) => {
        expect(button).toBeDisabled()
      })

      const saveButtons = screen.getAllByRole('button', { name: /save/i })
      saveButtons.forEach((button) => {
        expect(button).toBeDisabled()
      })
    })
  })

  describe('onChange callback', () => {
    it('onChange receives properly structured step data', async () => {
      const onChange = vi.fn()
      const Wrapper = createTestWrapper({ steps: [], onChange })
      render(<Wrapper initialEntries={['/recipes/recipe-1/edit']} />)

      // Add a new step
      await userEvent.click(screen.getByRole('button', { name: /add step/i }))

      expect(onChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            stepNum: 1,
            description: expect.any(String),
            ingredients: expect.any(Array),
          }),
        ])
      )
    })
  })
})
