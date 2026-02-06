import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { BrowserRouter } from 'react-router'
import { RecipeHeader } from '../../../app/components/recipe/RecipeHeader'

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('RecipeHeader', () => {
  const defaultProps = {
    title: 'Test Recipe',
    chefName: 'Test Chef',
    scaleFactor: 1,
    onScaleChange: vi.fn(),
    isOwner: false,
    recipeId: 'recipe-123',
  }

  describe('chef information', () => {
    it('renders chef name without link when chefId is not provided', () => {
      renderWithRouter(<RecipeHeader {...defaultProps} />)

      // Find the strong element containing the chef name
      const chefName = screen.getByText((content, element) => {
        return element?.tagName === 'STRONG' && element?.textContent === 'Test Chef'
      })
      expect(chefName).toBeInTheDocument()
      
      // Should not be wrapped in a link when chefId is undefined
      expect(chefName.closest('a')).toBeNull()
    })

    it('renders chef name as link when chefId is provided', () => {
      renderWithRouter(<RecipeHeader {...defaultProps} chefId="chef-456" />)

      // Find the strong element containing the chef name
      const chefName = screen.getByText((content, element) => {
        return element?.tagName === 'STRONG' && element?.textContent === 'Test Chef'
      })
      expect(chefName).toBeInTheDocument()
      
      // Should be wrapped in a link
      const link = chefName.closest('a')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/users/chef-456')
    })

    it('renders chef avatar with initials', () => {
      renderWithRouter(<RecipeHeader {...defaultProps} />)

      const avatar = screen.getByTestId('chef-avatar')
      expect(avatar).toBeInTheDocument()
    })

    it('renders chef avatar with photo when provided', () => {
      renderWithRouter(<RecipeHeader {...defaultProps} chefPhotoUrl="https://example.com/photo.jpg" />)

      const avatar = screen.getByTestId('chef-avatar')
      expect(avatar).toBeInTheDocument()
    })
  })

  describe('title and description', () => {
    it('renders recipe title', () => {
      renderWithRouter(<RecipeHeader {...defaultProps} />)

      expect(screen.getByRole('heading', { name: 'Test Recipe' })).toBeInTheDocument()
    })

    it('renders description when provided', () => {
      renderWithRouter(<RecipeHeader {...defaultProps} description="A delicious test recipe" />)

      expect(screen.getByText('A delicious test recipe')).toBeInTheDocument()
    })

    it('does not render description section when not provided', () => {
      const { container } = renderWithRouter(<RecipeHeader {...defaultProps} />)

      // Description is optional, should not have the description text
      expect(screen.queryByText(/delicious/)).toBeNull()
    })
  })

  describe('recipe image', () => {
    it('renders recipe image when imageUrl is provided', () => {
      renderWithRouter(<RecipeHeader {...defaultProps} imageUrl="https://example.com/recipe.jpg" />)

      const image = screen.getByTestId('recipe-image')
      expect(image).toBeInTheDocument()
      
      const img = screen.getByAltText('Photo of Test Recipe')
      expect(img).toHaveAttribute('src', 'https://example.com/recipe.jpg')
    })

    it('renders placeholder when imageUrl is not provided', () => {
      renderWithRouter(<RecipeHeader {...defaultProps} />)

      const placeholder = screen.getByTestId('recipe-image-placeholder')
      expect(placeholder).toBeInTheDocument()
      expect(screen.getByText('No image available')).toBeInTheDocument()
    })
  })

  describe('scaling', () => {
    it('renders scale selector with current scale factor', () => {
      renderWithRouter(<RecipeHeader {...defaultProps} scaleFactor={2} />)

      expect(screen.getByText('Scale:')).toBeInTheDocument()
    })

    it('calls onScaleChange when scale is changed', async () => {
      const onScaleChange = vi.fn()
      renderWithRouter(<RecipeHeader {...defaultProps} onScaleChange={onScaleChange} />)

      // ScaleSelector should be present
      expect(screen.getByText('Scale:')).toBeInTheDocument()
    })

    it('displays scaled servings when servings text is provided', () => {
      renderWithRouter(<RecipeHeader {...defaultProps} servings="Serves 4" scaleFactor={2} />)

      expect(screen.getByText('Serves 8')).toBeInTheDocument()
    })

    it('displays original servings note when scale factor is not 1', () => {
      renderWithRouter(<RecipeHeader {...defaultProps} servings="Serves 4" scaleFactor={2} />)

      expect(screen.getByText(/originally: Serves 4/)).toBeInTheDocument()
    })

    it('does not display original servings note when scale factor is 1', () => {
      renderWithRouter(<RecipeHeader {...defaultProps} servings="Serves 4" scaleFactor={1} />)

      expect(screen.queryByText(/originally/)).toBeNull()
    })
  })

  describe('owner actions', () => {
    it('renders edit and delete buttons when user is owner', () => {
      renderWithRouter(<RecipeHeader {...defaultProps} isOwner={true} />)

      expect(screen.getByRole('link', { name: /edit/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
    })

    it('does not render edit and delete buttons when user is not owner', () => {
      renderWithRouter(<RecipeHeader {...defaultProps} isOwner={false} />)

      expect(screen.queryByRole('link', { name: /edit/i })).toBeNull()
      expect(screen.queryByRole('button', { name: /delete/i })).toBeNull()
    })

    it('renders edit button with correct link', () => {
      renderWithRouter(<RecipeHeader {...defaultProps} isOwner={true} recipeId="recipe-789" />)

      const editButton = screen.getByRole('link', { name: /edit/i })
      expect(editButton).toHaveAttribute('href', '/recipes/recipe-789/edit')
    })

    it('shows delete confirmation dialog when delete button is clicked', async () => {
      renderWithRouter(<RecipeHeader {...defaultProps} isOwner={true} />)

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await userEvent.click(deleteButton)

      expect(screen.getByText('Banish this recipe?')).toBeInTheDocument()
    })

    it('calls onDelete when deletion is confirmed', async () => {
      const onDelete = vi.fn()
      renderWithRouter(<RecipeHeader {...defaultProps} isOwner={true} onDelete={onDelete} />)

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await userEvent.click(deleteButton)

      const confirmButton = screen.getByRole('button', { name: /delete it/i })
      await userEvent.click(confirmButton)

      expect(onDelete).toHaveBeenCalled()
    })

    it('closes delete dialog when cancel is clicked', async () => {
      const onDelete = vi.fn()
      renderWithRouter(<RecipeHeader {...defaultProps} isOwner={true} onDelete={onDelete} />)

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await userEvent.click(deleteButton)

      expect(screen.getByText('Banish this recipe?')).toBeInTheDocument()

      const cancelButton = screen.getByRole('button', { name: /keep it/i })
      await userEvent.click(cancelButton)

      // Wait for dialog exit animation to complete
      await waitFor(() => {
        expect(screen.queryByText('Banish this recipe?')).not.toBeInTheDocument()
      })
      expect(onDelete).not.toHaveBeenCalled()
    })
  })

  describe('share functionality', () => {
    it('renders share button when onShare is provided', () => {
      const onShare = vi.fn()
      renderWithRouter(<RecipeHeader {...defaultProps} onShare={onShare} />)

      expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument()
    })

    it('does not render share button when onShare is not provided', () => {
      renderWithRouter(<RecipeHeader {...defaultProps} />)

      expect(screen.queryByRole('button', { name: /share/i })).toBeNull()
    })

    it('calls onShare when share button is clicked', async () => {
      const onShare = vi.fn()
      renderWithRouter(<RecipeHeader {...defaultProps} onShare={onShare} />)

      const shareButton = screen.getByRole('button', { name: /share/i })
      await userEvent.click(shareButton)

      expect(onShare).toHaveBeenCalled()
    })
  })

  describe('custom save button', () => {
    it('renders custom save button when renderSaveButton is provided', () => {
      const renderSaveButton = () => <button>Custom Save</button>
      renderWithRouter(<RecipeHeader {...defaultProps} renderSaveButton={renderSaveButton} />)

      expect(screen.getByText('Custom Save')).toBeInTheDocument()
    })

    it('does not render custom save button when renderSaveButton is not provided', () => {
      renderWithRouter(<RecipeHeader {...defaultProps} />)

      expect(screen.queryByText('Custom Save')).toBeNull()
    })
  })
})
