/**
 * Tests for RecipeBuilder component.
 *
 * RecipeBuilder is the orchestration layer that composes:
 * - RecipeForm (metadata: title, description, servings, image)
 * - StepList (steps with ingredients, reordering, dependencies)
 *
 * Features:
 * - Single-page recipe creation experience
 * - Handles both create (new recipe) and edit (existing recipe) modes
 * - No page navigation during creation
 * - Single save action for entire recipe
 * - Progressive disclosure: start simple, expand on demand
 */

import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { createRoutesStub } from 'react-router'
import { RecipeBuilder } from '~/components/recipe/RecipeBuilder'
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

// Helper to create test recipe data
function createTestRecipe(overrides: Partial<{
  id: string
  title: string
  description: string | null
  servings: string | null
  imageUrl: string
  steps: StepData[]
}> = {}) {
  return {
    id: 'recipe-1',
    title: 'Test Recipe',
    description: 'A test recipe description',
    servings: '4 servings',
    imageUrl: '',
    steps: [],
    ...overrides,
  }
}

// Helper to create test step data
function createTestStep(overrides: Partial<StepData> = {}): StepData {
  return {
    id: `step-${Math.random().toString(36).substring(7)}`,
    stepNum: 1,
    description: 'Test step description',
    ingredients: [],
    ...overrides,
  }
}

// Create test wrapper with router context
function createTestWrapper(props: Partial<React.ComponentProps<typeof RecipeBuilder>> = {}) {
  const defaultProps = {
    onSave: vi.fn(),
    ...props,
  }

  return createRoutesStub([
    {
      path: '/recipes/new',
      Component: () => <RecipeBuilder {...defaultProps} />,
      action: async () => ({ parsedIngredients: [] }),
    },
    {
      path: '/recipes/:id/edit',
      Component: () => <RecipeBuilder {...defaultProps} />,
      action: async () => ({ parsedIngredients: [] }),
    },
    // Route for AI ingredient parsing
    {
      path: '/recipes/:id/steps/:stepId/edit',
      action: async () => ({ parsedIngredients: [] }),
    },
  ])
}

describe('RecipeBuilder', () => {
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

  describe('rendering', () => {
    it('renders RecipeForm section (title, description, servings)', () => {
      const Wrapper = createTestWrapper()
      render(<Wrapper initialEntries={['/recipes/new']} />)

      // Should have title input
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()

      // Should have description input
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()

      // Should have servings input
      expect(screen.getByLabelText(/servings/i)).toBeInTheDocument()
    })

    it('renders StepList section', () => {
      const Wrapper = createTestWrapper()
      render(<Wrapper initialEntries={['/recipes/new']} />)

      // Should have Add Step button from StepList
      expect(screen.getByRole('button', { name: /add step/i })).toBeInTheDocument()
    })
  })

  describe('create mode', () => {
    it('starts with empty form and no steps', () => {
      const Wrapper = createTestWrapper()
      render(<Wrapper initialEntries={['/recipes/new']} />)

      // Title should be empty
      expect(screen.getByLabelText(/title/i)).toHaveValue('')

      // Description should be empty
      expect(screen.getByLabelText(/description/i)).toHaveValue('')

      // Servings should be empty
      expect(screen.getByLabelText(/servings/i)).toHaveValue('')

      // Should show empty state for steps
      expect(screen.getByText(/no steps/i)).toBeInTheDocument()
    })
  })

  describe('edit mode', () => {
    it('pre-populates with existing recipe data', () => {
      const recipe = createTestRecipe({
        title: 'Chocolate Cake',
        description: 'A delicious chocolate cake',
        servings: '8 slices',
      })
      const Wrapper = createTestWrapper({ recipe })
      render(<Wrapper initialEntries={['/recipes/recipe-1/edit']} />)

      // Should have pre-filled title
      expect(screen.getByLabelText(/title/i)).toHaveValue('Chocolate Cake')

      // Should have pre-filled description
      expect(screen.getByLabelText(/description/i)).toHaveValue('A delicious chocolate cake')

      // Should have pre-filled servings
      expect(screen.getByLabelText(/servings/i)).toHaveValue('8 slices')
    })

    it('pre-populates with existing steps', () => {
      const recipe = createTestRecipe({
        steps: [
          createTestStep({ id: 'step-1', stepNum: 1, description: 'Mix flour and sugar' }),
          createTestStep({ id: 'step-2', stepNum: 2, description: 'Add eggs and milk' }),
        ],
      })
      const Wrapper = createTestWrapper({ recipe })
      render(<Wrapper initialEntries={['/recipes/recipe-1/edit']} />)

      // Should render both steps
      expect(screen.getByLabelText(/step 1/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/step 2/i)).toBeInTheDocument()

      // Should not show empty state
      expect(screen.queryByText(/no steps/i)).not.toBeInTheDocument()
    })
  })

  describe('step management', () => {
    it('can add steps via StepList', async () => {
      const Wrapper = createTestWrapper()
      render(<Wrapper initialEntries={['/recipes/new']} />)

      // Initially no steps
      expect(screen.getByText(/no steps/i)).toBeInTheDocument()

      // Click add step
      await userEvent.click(screen.getByRole('button', { name: /add step/i }))

      // Should now have a step card
      expect(screen.getByLabelText(/step 1/i)).toBeInTheDocument()

      // Empty state should be gone
      expect(screen.queryByText(/no steps/i)).not.toBeInTheDocument()
    })
  })

  describe('save functionality', () => {
    it('save button calls onSave with complete recipe data (metadata + steps)', async () => {
      const onSave = vi.fn()
      const Wrapper = createTestWrapper({ onSave })
      render(<Wrapper initialEntries={['/recipes/new']} />)

      // Fill in recipe metadata
      await userEvent.type(screen.getByLabelText(/title/i), 'My New Recipe')
      await userEvent.type(screen.getByLabelText(/description/i), 'A wonderful recipe')
      await userEvent.type(screen.getByLabelText(/servings/i), '4')

      // Add a step and fill it
      await userEvent.click(screen.getByRole('button', { name: /add step/i }))
      const stepCard = screen.getByLabelText(/step 1/i)
      const instructionsTextarea = within(stepCard).getByLabelText(/instructions/i)
      await userEvent.type(instructionsTextarea, 'Mix all ingredients')

      // Save the step first
      await userEvent.click(within(stepCard).getByRole('button', { name: /save/i }))

      // Click main save button
      await userEvent.click(screen.getByRole('button', { name: /save recipe/i }))

      // onSave should be called with complete data
      expect(onSave).toHaveBeenCalledTimes(1)
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'My New Recipe',
          description: 'A wonderful recipe',
          servings: '4',
          steps: expect.arrayContaining([
            expect.objectContaining({
              description: 'Mix all ingredients',
            }),
          ]),
        })
      )
    })

    it('save button disabled when title is empty (validation)', () => {
      const Wrapper = createTestWrapper()
      render(<Wrapper initialEntries={['/recipes/new']} />)

      // Save button should be disabled when title is empty
      const saveButton = screen.getByRole('button', { name: /save recipe/i })
      expect(saveButton).toBeDisabled()
    })

    it('save button enabled when title is provided', async () => {
      const Wrapper = createTestWrapper()
      render(<Wrapper initialEntries={['/recipes/new']} />)

      // Type a title
      await userEvent.type(screen.getByLabelText(/title/i), 'My Recipe')

      // Save button should now be enabled
      const saveButton = screen.getByRole('button', { name: /save recipe/i })
      expect(saveButton).toBeEnabled()
    })

    it('converts empty description to null on save', async () => {
      const onSave = vi.fn()
      const Wrapper = createTestWrapper({ onSave })
      render(<Wrapper initialEntries={['/recipes/new']} />)

      // Fill in only title, leave description empty
      await userEvent.type(screen.getByLabelText(/title/i), 'Title Only Recipe')

      // Click save
      await userEvent.click(screen.getByRole('button', { name: /save recipe/i }))

      // onSave should be called with null description
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Title Only Recipe',
          description: null,
        })
      )
    })

    it('converts empty servings to null on save', async () => {
      const onSave = vi.fn()
      const Wrapper = createTestWrapper({ onSave })
      render(<Wrapper initialEntries={['/recipes/new']} />)

      // Fill in title and description, leave servings empty
      await userEvent.type(screen.getByLabelText(/title/i), 'Recipe Without Servings')
      await userEvent.type(screen.getByLabelText(/description/i), 'A description')

      // Click save
      await userEvent.click(screen.getByRole('button', { name: /save recipe/i }))

      // onSave should be called with null servings
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Recipe Without Servings',
          description: 'A description',
          servings: null,
        })
      )
    })
  })

  describe('cancel functionality', () => {
    it('cancel button calls onCancel', async () => {
      const onCancel = vi.fn()
      const Wrapper = createTestWrapper({ onCancel })
      render(<Wrapper initialEntries={['/recipes/new']} />)

      // Click cancel button
      await userEvent.click(screen.getByRole('button', { name: /cancel/i }))

      expect(onCancel).toHaveBeenCalledTimes(1)
    })
  })

  describe('disabled state', () => {
    it('disabled prop disables all sections', () => {
      const Wrapper = createTestWrapper({ disabled: true })
      render(<Wrapper initialEntries={['/recipes/new']} />)

      // Form inputs should be disabled
      expect(screen.getByLabelText(/title/i)).toBeDisabled()
      expect(screen.getByLabelText(/description/i)).toBeDisabled()
      expect(screen.getByLabelText(/servings/i)).toBeDisabled()

      // Add step button should be disabled
      expect(screen.getByRole('button', { name: /add step/i })).toBeDisabled()

      // Save button should be disabled
      expect(screen.getByRole('button', { name: /save recipe/i })).toBeDisabled()

      // Cancel button should be disabled
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
    })

    it('disabled prop disables all step cards', () => {
      const recipe = createTestRecipe({
        steps: [createTestStep({ id: 'step-1', stepNum: 1 })],
      })
      const Wrapper = createTestWrapper({ recipe, disabled: true })
      render(<Wrapper initialEntries={['/recipes/recipe-1/edit']} />)

      // Step card controls should be disabled
      const stepCard = screen.getByLabelText(/step 1/i)
      expect(within(stepCard).getByRole('button', { name: /save/i })).toBeDisabled()
      expect(within(stepCard).getByRole('button', { name: /remove/i })).toBeDisabled()
    })
  })

  describe('recipe data completeness', () => {
    it('recipe data includes all steps with their ingredients', async () => {
      const onSave = vi.fn()
      const recipe = createTestRecipe({
        title: 'Recipe with Ingredients',
        steps: [
          createTestStep({
            id: 'step-1',
            stepNum: 1,
            description: 'Mix dry ingredients',
            ingredients: [
              { quantity: 2, unit: 'cups', ingredientName: 'flour' },
              { quantity: 1, unit: 'tsp', ingredientName: 'salt' },
            ],
          }),
          createTestStep({
            id: 'step-2',
            stepNum: 2,
            description: 'Add wet ingredients',
            ingredients: [
              { quantity: 1, unit: 'cup', ingredientName: 'milk' },
            ],
          }),
        ],
      })
      const Wrapper = createTestWrapper({ recipe, onSave })
      render(<Wrapper initialEntries={['/recipes/recipe-1/edit']} />)

      // Click save
      await userEvent.click(screen.getByRole('button', { name: /save recipe/i }))

      // onSave should include all steps with ingredients
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          steps: expect.arrayContaining([
            expect.objectContaining({
              description: 'Mix dry ingredients',
              ingredients: expect.arrayContaining([
                expect.objectContaining({ ingredientName: 'flour' }),
                expect.objectContaining({ ingredientName: 'salt' }),
              ]),
            }),
            expect.objectContaining({
              description: 'Add wet ingredients',
              ingredients: expect.arrayContaining([
                expect.objectContaining({ ingredientName: 'milk' }),
              ]),
            }),
          ]),
        })
      )
    })
  })

  describe('progressive disclosure', () => {
    it('shows "Add first step" prompt when no steps', () => {
      const Wrapper = createTestWrapper()
      render(<Wrapper initialEntries={['/recipes/new']} />)

      // Should show prompt to add first step
      expect(screen.getByText(/add your first step/i)).toBeInTheDocument()
    })

    it('hides "Add first step" prompt after adding a step', async () => {
      const Wrapper = createTestWrapper()
      render(<Wrapper initialEntries={['/recipes/new']} />)

      // Initially shows prompt
      expect(screen.getByText(/add your first step/i)).toBeInTheDocument()

      // Add a step
      await userEvent.click(screen.getByRole('button', { name: /add step/i }))

      // Prompt should be hidden
      expect(screen.queryByText(/add your first step/i)).not.toBeInTheDocument()
    })
  })

  describe('form state management', () => {
    it('tracks form changes locally without calling onSave', async () => {
      const onSave = vi.fn()
      const Wrapper = createTestWrapper({ onSave })
      render(<Wrapper initialEntries={['/recipes/new']} />)

      // Type in title
      await userEvent.type(screen.getByLabelText(/title/i), 'New Recipe')

      // Add a step
      await userEvent.click(screen.getByRole('button', { name: /add step/i }))

      // onSave should not have been called yet
      expect(onSave).not.toHaveBeenCalled()
    })

    it('preserves step data when adding new steps', async () => {
      const Wrapper = createTestWrapper()
      render(<Wrapper initialEntries={['/recipes/new']} />)

      // Add first step and fill it
      await userEvent.click(screen.getByRole('button', { name: /add step/i }))
      const firstStepCard = screen.getByLabelText(/step 1/i)
      const firstTextarea = within(firstStepCard).getByLabelText(/instructions/i)
      await userEvent.type(firstTextarea, 'First step instructions')

      // Save first step
      await userEvent.click(within(firstStepCard).getByRole('button', { name: /save/i }))

      // Add second step
      await userEvent.click(screen.getByRole('button', { name: /add step/i }))

      // First step should still have its content
      expect(firstTextarea).toHaveValue('First step instructions')

      // Second step should exist
      expect(screen.getByLabelText(/step 2/i)).toBeInTheDocument()
    })
  })

  describe('mobile optimization', () => {
    it('renders without horizontal overflow at 320px viewport width', () => {
      const Wrapper = createTestWrapper()
      const { container } = render(<Wrapper initialEntries={['/recipes/new']} />)

      // Simulate 320px mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 320, writable: true })
      window.dispatchEvent(new Event('resize'))

      // The container should not cause horizontal scroll
      // Check that content width doesn't exceed viewport
      const root = container.firstChild as HTMLElement
      if (root) {
        const rootRect = root.getBoundingClientRect()
        expect(rootRect.width).toBeLessThanOrEqual(320)
      }
    })

    it('form inputs are full width on mobile (no overflow)', () => {
      const Wrapper = createTestWrapper()
      render(<Wrapper initialEntries={['/recipes/new']} />)

      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 320, writable: true })
      window.dispatchEvent(new Event('resize'))

      const titleInput = screen.getByLabelText(/title/i)
      const descriptionInput = screen.getByLabelText(/description/i)
      const servingsInput = screen.getByLabelText(/servings/i)

      const titleRect = titleInput.getBoundingClientRect()
      const descriptionRect = descriptionInput.getBoundingClientRect()
      const servingsRect = servingsInput.getBoundingClientRect()

      // Inputs should fit within 320px viewport (accounting for padding)
      expect(titleRect.width).toBeLessThanOrEqual(320)
      expect(descriptionRect.width).toBeLessThanOrEqual(320)
      expect(servingsRect.width).toBeLessThanOrEqual(320)
    })

    it('save and cancel buttons have minimum 44px touch target height', () => {
      const Wrapper = createTestWrapper()
      render(<Wrapper initialEntries={['/recipes/new']} />)

      const saveButton = screen.getByRole('button', { name: /save recipe/i })
      const cancelButton = screen.getByRole('button', { name: /cancel/i })

      const saveRect = saveButton.getBoundingClientRect()
      const cancelRect = cancelButton.getBoundingClientRect()

      expect(saveRect.height).toBeGreaterThanOrEqual(44)
      expect(cancelRect.height).toBeGreaterThanOrEqual(44)
    })

    it('add step button has minimum 44px touch target height', () => {
      const Wrapper = createTestWrapper()
      render(<Wrapper initialEntries={['/recipes/new']} />)

      const addStepButton = screen.getByRole('button', { name: /add step/i })
      const buttonRect = addStepButton.getBoundingClientRect()

      expect(buttonRect.height).toBeGreaterThanOrEqual(44)
    })

    it('responsive layout stacks vertically on narrow viewports', () => {
      const recipe = createTestRecipe({
        steps: [createTestStep({ id: 'step-1', stepNum: 1 })],
      })
      const Wrapper = createTestWrapper({ recipe })
      render(<Wrapper initialEntries={['/recipes/recipe-1/edit']} />)

      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 320, writable: true })
      window.dispatchEvent(new Event('resize'))

      // Action buttons should stack or wrap, not overflow
      const saveButton = screen.getByRole('button', { name: /save recipe/i })
      const cancelButton = screen.getByRole('button', { name: /cancel/i })

      const saveRect = saveButton.getBoundingClientRect()
      const cancelRect = cancelButton.getBoundingClientRect()

      // At 320px, buttons should either be stacked vertically or fit side by side
      // The combined width should not exceed viewport
      const combinedWidth = saveRect.width + cancelRect.width
      // Allow some margin for gap between buttons
      expect(combinedWidth).toBeLessThanOrEqual(320 + 16)
    })

    it('step cards fit within 320px viewport without horizontal scroll', async () => {
      const Wrapper = createTestWrapper()
      render(<Wrapper initialEntries={['/recipes/new']} />)

      // Add a step
      await userEvent.click(screen.getByRole('button', { name: /add step/i }))

      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 320, writable: true })
      window.dispatchEvent(new Event('resize'))

      const stepCard = screen.getByLabelText(/step 1/i)
      const cardRect = stepCard.getBoundingClientRect()

      // Step card should fit within viewport
      expect(cardRect.width).toBeLessThanOrEqual(320)
    })
  })

  describe('accessibility', () => {
    it('has proper heading structure', () => {
      const Wrapper = createTestWrapper()
      render(<Wrapper initialEntries={['/recipes/new']} />)

      // Should have a main heading for the builder
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })

    it('form sections are properly labeled', () => {
      const Wrapper = createTestWrapper()
      render(<Wrapper initialEntries={['/recipes/new']} />)

      // Recipe details section should be identifiable
      expect(screen.getByRole('group', { name: /recipe details/i })).toBeInTheDocument()

      // Steps section should be identifiable
      expect(screen.getByRole('region', { name: /steps/i })).toBeInTheDocument()
    })
  })
})
