import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router'
import { RecipeGrid, type PantryRecipeCard } from '~/components/pantry/RecipeGrid'

const recipes: PantryRecipeCard[] = [
  {
    id: 'r-1',
    title: 'Lemon Pasta',
    description: 'Bright pasta with garlic and lemon zest.',
    imageUrl: 'https://images.example.com/lemon-pasta.jpg',
    difficulty: 'Easy',
    cookTimeMinutes: 20,
    href: '/recipes/r-1',
  },
  {
    id: 'r-2',
    title: 'Spiced Chickpea Bowl',
    description: 'Roasted chickpeas with tahini drizzle.',
    difficulty: 'Medium',
    cookTimeMinutes: 35,
    href: '/recipes/r-2',
  },
]

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('RecipeGrid', () => {
  it('renders recipe cards with titles and links', () => {
    renderWithRouter(<RecipeGrid recipes={recipes} />)

    expect(screen.getByRole('link', { name: /lemon pasta/i })).toHaveAttribute('href', '/recipes/r-1')
    expect(screen.getByRole('link', { name: /spiced chickpea bowl/i })).toHaveAttribute('href', '/recipes/r-2')
  })

  it('renders metadata badges when provided', () => {
    renderWithRouter(<RecipeGrid recipes={recipes} />)

    expect(screen.getByText('20 min')).toBeInTheDocument()
    expect(screen.getByText('Easy')).toBeInTheDocument()
  })

  it('renders placeholder image panel when image is missing', () => {
    renderWithRouter(<RecipeGrid recipes={recipes} />)

    expect(screen.getByText('No photo')).toBeInTheDocument()
  })

  it('renders empty state when no recipes are provided', () => {
    renderWithRouter(<RecipeGrid recipes={[]} />)

    expect(screen.getByText('No recipes yet')).toBeInTheDocument()
    expect(screen.getByText('Start by creating your first recipe for this pantry.')).toBeInTheDocument()
  })
})
