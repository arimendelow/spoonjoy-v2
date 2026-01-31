import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { RecipeForm } from '../../../app/components/recipe/RecipeForm'

// Mock URL.createObjectURL and revokeObjectURL for image upload tests
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
const mockRevokeObjectURL = vi.fn()

beforeEach(() => {
  vi.stubGlobal('URL', {
    ...URL,
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
  mockCreateObjectURL.mockClear()
  mockRevokeObjectURL.mockClear()
})

describe('RecipeForm', () => {
  describe('rendering - create mode', () => {
    it('renders all form fields for new recipe', () => {
      render(<RecipeForm mode="create" onSubmit={vi.fn()} />)

      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/servings/i)).toBeInTheDocument()
    })

    it('renders image upload component', () => {
      render(<RecipeForm mode="create" onSubmit={vi.fn()} />)

      // Should have upload button for image
      expect(screen.getByRole('button', { name: /upload.*image/i })).toBeInTheDocument()
    })

    it('renders submit button with "Create Recipe" text', () => {
      render(<RecipeForm mode="create" onSubmit={vi.fn()} />)

      expect(screen.getByRole('button', { name: /create recipe/i })).toBeInTheDocument()
    })

    it('renders cancel button', () => {
      render(<RecipeForm mode="create" onSubmit={vi.fn()} />)

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('renders title input as required', () => {
      render(<RecipeForm mode="create" onSubmit={vi.fn()} />)

      const titleInput = screen.getByLabelText(/title/i)
      expect(titleInput).toHaveAttribute('required')
    })

    it('does not render description or servings as required', () => {
      render(<RecipeForm mode="create" onSubmit={vi.fn()} />)

      const descriptionInput = screen.getByLabelText(/description/i)
      const servingsInput = screen.getByLabelText(/servings/i)

      expect(descriptionInput).not.toHaveAttribute('required')
      expect(servingsInput).not.toHaveAttribute('required')
    })

    it('renders empty fields in create mode', () => {
      render(<RecipeForm mode="create" onSubmit={vi.fn()} />)

      expect(screen.getByLabelText(/title/i)).toHaveValue('')
      expect(screen.getByLabelText(/description/i)).toHaveValue('')
      expect(screen.getByLabelText(/servings/i)).toHaveValue('')
    })

    it('renders placeholder text for title', () => {
      render(<RecipeForm mode="create" onSubmit={vi.fn()} />)

      expect(screen.getByPlaceholderText(/chocolate chip cookies/i)).toBeInTheDocument()
    })

    it('renders placeholder text for description', () => {
      render(<RecipeForm mode="create" onSubmit={vi.fn()} />)

      expect(screen.getByPlaceholderText(/brief description/i)).toBeInTheDocument()
    })

    it('renders placeholder text for servings', () => {
      render(<RecipeForm mode="create" onSubmit={vi.fn()} />)

      expect(screen.getByPlaceholderText(/4|6-8|2 dozen/i)).toBeInTheDocument()
    })
  })

  describe('rendering - edit mode', () => {
    const existingRecipe = {
      id: 'recipe-123',
      title: 'Classic Pancakes',
      description: 'Fluffy homemade pancakes',
      servings: '4-6',
      imageUrl: 'https://example.com/pancakes.jpg',
    }

    it('renders submit button with "Save Changes" text', () => {
      render(<RecipeForm mode="edit" recipe={existingRecipe} onSubmit={vi.fn()} />)

      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
    })

    it('populates title field with existing value', () => {
      render(<RecipeForm mode="edit" recipe={existingRecipe} onSubmit={vi.fn()} />)

      expect(screen.getByLabelText(/title/i)).toHaveValue('Classic Pancakes')
    })

    it('populates description field with existing value', () => {
      render(<RecipeForm mode="edit" recipe={existingRecipe} onSubmit={vi.fn()} />)

      expect(screen.getByLabelText(/description/i)).toHaveValue('Fluffy homemade pancakes')
    })

    it('populates servings field with existing value', () => {
      render(<RecipeForm mode="edit" recipe={existingRecipe} onSubmit={vi.fn()} />)

      expect(screen.getByLabelText(/servings/i)).toHaveValue('4-6')
    })

    it('shows existing image preview', () => {
      render(<RecipeForm mode="edit" recipe={existingRecipe} onSubmit={vi.fn()} />)

      const image = screen.getByRole('img')
      expect(image).toHaveAttribute('src', 'https://example.com/pancakes.jpg')
    })

    it('shows Change Image and Remove buttons when image exists', () => {
      render(<RecipeForm mode="edit" recipe={existingRecipe} onSubmit={vi.fn()} />)

      expect(screen.getByRole('button', { name: /change image/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument()
    })

    it('handles null description gracefully', () => {
      const recipeWithNullDescription = { ...existingRecipe, description: null }
      render(<RecipeForm mode="edit" recipe={recipeWithNullDescription} onSubmit={vi.fn()} />)

      expect(screen.getByLabelText(/description/i)).toHaveValue('')
    })

    it('handles null servings gracefully', () => {
      const recipeWithNullServings = { ...existingRecipe, servings: null }
      render(<RecipeForm mode="edit" recipe={recipeWithNullServings} onSubmit={vi.fn()} />)

      expect(screen.getByLabelText(/servings/i)).toHaveValue('')
    })

    it('handles empty imageUrl gracefully', () => {
      const recipeWithNoImage = { ...existingRecipe, imageUrl: '' }
      render(<RecipeForm mode="edit" recipe={recipeWithNoImage} onSubmit={vi.fn()} />)

      // Should show upload button, not change/remove
      expect(screen.getByRole('button', { name: /upload.*image/i })).toBeInTheDocument()
    })
  })

  describe('form validation', () => {
    it('requires title to submit', async () => {
      const onSubmit = vi.fn()
      render(<RecipeForm mode="create" onSubmit={onSubmit} />)

      // Fill optional fields but not title
      await userEvent.type(screen.getByLabelText(/description/i), 'A delicious recipe')
      await userEvent.type(screen.getByLabelText(/servings/i), '4')
      await userEvent.click(screen.getByRole('button', { name: /create recipe/i }))

      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('allows submit with only title filled', async () => {
      const onSubmit = vi.fn()
      render(<RecipeForm mode="create" onSubmit={onSubmit} />)

      await userEvent.type(screen.getByLabelText(/title/i), 'Simple Recipe')
      await userEvent.click(screen.getByRole('button', { name: /create recipe/i }))

      expect(onSubmit).toHaveBeenCalled()
    })

    it('has max length on title field', () => {
      render(<RecipeForm mode="create" onSubmit={vi.fn()} />)

      const titleInput = screen.getByLabelText(/title/i)
      expect(titleInput).toHaveAttribute('maxLength', '200')
    })

    it('has max length on description field', () => {
      render(<RecipeForm mode="create" onSubmit={vi.fn()} />)

      const descriptionInput = screen.getByLabelText(/description/i)
      expect(descriptionInput).toHaveAttribute('maxLength', '2000')
    })

    it('has max length on servings field', () => {
      render(<RecipeForm mode="create" onSubmit={vi.fn()} />)

      const servingsInput = screen.getByLabelText(/servings/i)
      expect(servingsInput).toHaveAttribute('maxLength', '100')
    })
  })

  describe('form submission - create mode', () => {
    it('calls onSubmit with form data', async () => {
      const onSubmit = vi.fn()
      render(<RecipeForm mode="create" onSubmit={onSubmit} />)

      await userEvent.type(screen.getByLabelText(/title/i), 'New Recipe')
      await userEvent.type(screen.getByLabelText(/description/i), 'Recipe description')
      await userEvent.type(screen.getByLabelText(/servings/i), '4')
      await userEvent.click(screen.getByRole('button', { name: /create recipe/i }))

      expect(onSubmit).toHaveBeenCalledWith({
        title: 'New Recipe',
        description: 'Recipe description',
        servings: '4',
        imageFile: null,
      })
    })

    it('trims whitespace from title', async () => {
      const onSubmit = vi.fn()
      render(<RecipeForm mode="create" onSubmit={onSubmit} />)

      await userEvent.type(screen.getByLabelText(/title/i), '  Trimmed Title  ')
      await userEvent.click(screen.getByRole('button', { name: /create recipe/i }))

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Trimmed Title' })
      )
    })

    it('trims whitespace from description', async () => {
      const onSubmit = vi.fn()
      render(<RecipeForm mode="create" onSubmit={onSubmit} />)

      await userEvent.type(screen.getByLabelText(/title/i), 'Recipe')
      await userEvent.type(screen.getByLabelText(/description/i), '  Trimmed Description  ')
      await userEvent.click(screen.getByRole('button', { name: /create recipe/i }))

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'Trimmed Description' })
      )
    })

    it('trims whitespace from servings', async () => {
      const onSubmit = vi.fn()
      render(<RecipeForm mode="create" onSubmit={onSubmit} />)

      await userEvent.type(screen.getByLabelText(/title/i), 'Recipe')
      await userEvent.type(screen.getByLabelText(/servings/i), '  4-6  ')
      await userEvent.click(screen.getByRole('button', { name: /create recipe/i }))

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ servings: '4-6' })
      )
    })

    it('passes empty string for empty optional fields', async () => {
      const onSubmit = vi.fn()
      render(<RecipeForm mode="create" onSubmit={onSubmit} />)

      await userEvent.type(screen.getByLabelText(/title/i), 'Just Title')
      await userEvent.click(screen.getByRole('button', { name: /create recipe/i }))

      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Just Title',
        description: '',
        servings: '',
        imageFile: null,
      })
    })
  })

  describe('form submission - edit mode', () => {
    const existingRecipe = {
      id: 'recipe-123',
      title: 'Original Title',
      description: 'Original description',
      servings: '4',
      imageUrl: 'https://example.com/original.jpg',
    }

    it('calls onSubmit with updated form data', async () => {
      const onSubmit = vi.fn()
      render(<RecipeForm mode="edit" recipe={existingRecipe} onSubmit={onSubmit} />)

      // Clear and update title
      const titleInput = screen.getByLabelText(/title/i)
      await userEvent.clear(titleInput)
      await userEvent.type(titleInput, 'Updated Title')

      await userEvent.click(screen.getByRole('button', { name: /save changes/i }))

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Updated Title' })
      )
    })

    it('includes recipe ID in edit mode submission', async () => {
      const onSubmit = vi.fn()
      render(<RecipeForm mode="edit" recipe={existingRecipe} onSubmit={onSubmit} />)

      await userEvent.click(screen.getByRole('button', { name: /save changes/i }))

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'recipe-123' })
      )
    })

    it('sends clearImage flag when image is removed', async () => {
      const onSubmit = vi.fn()
      render(<RecipeForm mode="edit" recipe={existingRecipe} onSubmit={onSubmit} />)

      // Click remove button
      await userEvent.click(screen.getByRole('button', { name: /remove/i }))
      await userEvent.click(screen.getByRole('button', { name: /save changes/i }))

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ clearImage: true })
      )
    })
  })

  describe('image upload', () => {
    it('accepts image file selection', async () => {
      const onSubmit = vi.fn()
      render(<RecipeForm mode="create" onSubmit={onSubmit} />)

      const file = new File(['test'], 'recipe.jpg', { type: 'image/jpeg' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await userEvent.upload(fileInput, file)

      // Image preview should appear
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /change/i })).toBeInTheDocument()
      })
    })

    it('includes image file in submission', async () => {
      const onSubmit = vi.fn()
      render(<RecipeForm mode="create" onSubmit={onSubmit} />)

      const file = new File(['test'], 'recipe.jpg', { type: 'image/jpeg' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await userEvent.upload(fileInput, file)
      await userEvent.type(screen.getByLabelText(/title/i), 'Recipe With Image')
      await userEvent.click(screen.getByRole('button', { name: /create recipe/i }))

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ imageFile: expect.any(File) })
      )
    })

    it('clears image selection on remove button click', async () => {
      render(<RecipeForm mode="create" onSubmit={vi.fn()} />)

      const file = new File(['test'], 'recipe.jpg', { type: 'image/jpeg' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await userEvent.upload(fileInput, file)

      // Wait for change button to appear
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /change/i })).toBeInTheDocument()
      })

      // Click remove
      await userEvent.click(screen.getByRole('button', { name: /remove/i }))

      // Should go back to upload button
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /upload.*image/i })).toBeInTheDocument()
      })
    })
  })

  describe('cancel button', () => {
    it('calls onCancel when cancel button is clicked', async () => {
      const onCancel = vi.fn()
      render(<RecipeForm mode="create" onSubmit={vi.fn()} onCancel={onCancel} />)

      await userEvent.click(screen.getByRole('button', { name: /cancel/i }))

      expect(onCancel).toHaveBeenCalled()
    })

    it('does not call onSubmit when cancel is clicked', async () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()
      render(<RecipeForm mode="create" onSubmit={onSubmit} onCancel={onCancel} />)

      // Fill in some data
      await userEvent.type(screen.getByLabelText(/title/i), 'Recipe')
      await userEvent.click(screen.getByRole('button', { name: /cancel/i }))

      expect(onSubmit).not.toHaveBeenCalled()
      expect(onCancel).toHaveBeenCalled()
    })
  })

  describe('disabled state', () => {
    it('disables all inputs when disabled prop is true', () => {
      render(<RecipeForm mode="create" onSubmit={vi.fn()} disabled />)

      expect(screen.getByLabelText(/title/i)).toBeDisabled()
      expect(screen.getByLabelText(/description/i)).toBeDisabled()
      expect(screen.getByLabelText(/servings/i)).toBeDisabled()
    })

    it('disables submit button when disabled', () => {
      render(<RecipeForm mode="create" onSubmit={vi.fn()} disabled />)

      expect(screen.getByRole('button', { name: /create recipe/i })).toBeDisabled()
    })

    it('disables cancel button when disabled', () => {
      render(<RecipeForm mode="create" onSubmit={vi.fn()} disabled />)

      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
    })

    it('disables image upload when disabled', () => {
      render(<RecipeForm mode="create" onSubmit={vi.fn()} disabled />)

      expect(screen.getByRole('button', { name: /upload.*image/i })).toBeDisabled()
    })
  })

  describe('loading state', () => {
    it('disables all inputs when loading prop is true', () => {
      render(<RecipeForm mode="create" onSubmit={vi.fn()} loading />)

      expect(screen.getByLabelText(/title/i)).toBeDisabled()
      expect(screen.getByLabelText(/description/i)).toBeDisabled()
      expect(screen.getByLabelText(/servings/i)).toBeDisabled()
    })

    it('shows loading state on submit button', () => {
      render(<RecipeForm mode="create" onSubmit={vi.fn()} loading />)

      const submitButton = screen.getByRole('button', { name: /create recipe/i })
      expect(submitButton).toHaveAttribute('aria-busy', 'true')
    })

    it('disables submit button when loading', () => {
      render(<RecipeForm mode="create" onSubmit={vi.fn()} loading />)

      expect(screen.getByRole('button', { name: /create recipe/i })).toBeDisabled()
    })
  })

  describe('error display', () => {
    const errors = {
      title: 'Title is required',
      description: 'Description is too long',
      servings: 'Invalid servings format',
      general: 'Failed to save recipe',
    }

    it('displays title error message', () => {
      render(<RecipeForm mode="create" onSubmit={vi.fn()} errors={errors} />)

      expect(screen.getByText('Title is required')).toBeInTheDocument()
    })

    it('displays description error message', () => {
      render(<RecipeForm mode="create" onSubmit={vi.fn()} errors={errors} />)

      expect(screen.getByText('Description is too long')).toBeInTheDocument()
    })

    it('displays servings error message', () => {
      render(<RecipeForm mode="create" onSubmit={vi.fn()} errors={errors} />)

      expect(screen.getByText('Invalid servings format')).toBeInTheDocument()
    })

    it('displays general error message', () => {
      render(<RecipeForm mode="create" onSubmit={vi.fn()} errors={errors} />)

      expect(screen.getByText('Failed to save recipe')).toBeInTheDocument()
    })

    it('marks invalid fields with data-invalid attribute', () => {
      render(<RecipeForm mode="create" onSubmit={vi.fn()} errors={{ title: 'Error' }} />)

      const titleInput = screen.getByLabelText(/title/i)
      expect(titleInput).toHaveAttribute('data-invalid', 'true')
    })

    it('does not mark valid fields with data-invalid attribute', () => {
      render(<RecipeForm mode="create" onSubmit={vi.fn()} errors={{ title: 'Error' }} />)

      const descriptionInput = screen.getByLabelText(/description/i)
      expect(descriptionInput).not.toHaveAttribute('data-invalid')
    })
  })

  describe('accessibility', () => {
    it('has accessible labels for all form fields', () => {
      render(<RecipeForm mode="create" onSubmit={vi.fn()} />)

      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/servings/i)).toBeInTheDocument()
    })

    it('has proper form structure with fieldset', () => {
      const { container } = render(<RecipeForm mode="create" onSubmit={vi.fn()} />)

      expect(container.querySelector('fieldset')).toBeInTheDocument()
    })

    it('submit button has accessible name', () => {
      render(<RecipeForm mode="create" onSubmit={vi.fn()} />)

      expect(screen.getByRole('button', { name: /create recipe/i })).toBeInTheDocument()
    })

    it('cancel button has accessible name', () => {
      render(<RecipeForm mode="create" onSubmit={vi.fn()} />)

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('error messages are associated with inputs via aria-describedby', () => {
      render(<RecipeForm mode="create" onSubmit={vi.fn()} errors={{ title: 'Error' }} />)

      const titleInput = screen.getByLabelText(/title/i)
      const errorId = titleInput.getAttribute('aria-describedby')
      expect(errorId).toBeTruthy()
      expect(document.getElementById(errorId!)).toHaveTextContent('Error')
    })
  })

  describe('keyboard interaction', () => {
    it('supports tab navigation through form fields', async () => {
      render(<RecipeForm mode="create" onSubmit={vi.fn()} onCancel={vi.fn()} />)

      const titleInput = screen.getByLabelText(/title/i)
      const descriptionInput = screen.getByLabelText(/description/i)
      const servingsInput = screen.getByLabelText(/servings/i)

      await userEvent.click(titleInput)
      expect(titleInput).toHaveFocus()

      await userEvent.tab()
      expect(descriptionInput).toHaveFocus()

      await userEvent.tab()
      expect(servingsInput).toHaveFocus()
    })

    it('submits form on Enter key in title field', async () => {
      const onSubmit = vi.fn()
      render(<RecipeForm mode="create" onSubmit={onSubmit} />)

      await userEvent.type(screen.getByLabelText(/title/i), 'Quick Recipe{enter}')

      expect(onSubmit).toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('handles very long title at max length', async () => {
      const onSubmit = vi.fn()
      render(<RecipeForm mode="create" onSubmit={onSubmit} />)

      const longTitle = 'A'.repeat(200)
      await userEvent.type(screen.getByLabelText(/title/i), longTitle)
      await userEvent.click(screen.getByRole('button', { name: /create recipe/i }))

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ title: longTitle })
      )
    })

    it('handles special characters in title', async () => {
      const onSubmit = vi.fn()
      render(<RecipeForm mode="create" onSubmit={onSubmit} />)

      await userEvent.type(screen.getByLabelText(/title/i), "Grandma's Special (Best!) Recipe")
      await userEvent.click(screen.getByRole('button', { name: /create recipe/i }))

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Grandma's Special (Best!) Recipe" })
      )
    })

    it('handles multiline description', async () => {
      const onSubmit = vi.fn()
      render(<RecipeForm mode="create" onSubmit={onSubmit} />)

      await userEvent.type(screen.getByLabelText(/title/i), 'Recipe')
      await userEvent.type(screen.getByLabelText(/description/i), 'Line 1\nLine 2\nLine 3')
      await userEvent.click(screen.getByRole('button', { name: /create recipe/i }))

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'Line 1\nLine 2\nLine 3' })
      )
    })

    it('handles unicode characters in fields', async () => {
      const onSubmit = vi.fn()
      render(<RecipeForm mode="create" onSubmit={onSubmit} />)

      await userEvent.type(screen.getByLabelText(/title/i), 'Crème Brûlée 🍮')
      await userEvent.type(screen.getByLabelText(/description/i), '美味しい料理')
      await userEvent.click(screen.getByRole('button', { name: /create recipe/i }))

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Crème Brûlée 🍮',
          description: '美味しい料理',
        })
      )
    })
  })
})
