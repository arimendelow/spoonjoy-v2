import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router'
import { PantryPage } from '~/components/pantry/PantryPage'

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('PantryPage', () => {
  it('renders pantry heading with profile and recipes', () => {
    renderWithRouter(
      <PantryPage
        profile={{
          name: 'Chef Rowan',
          bio: 'Home cook sharing weeknight comfort food.',
          recipeCount: 12,
          cookbookCount: 3,
        }}
        recipes={[
          {
            id: 'r-1',
            title: 'Lemon Pasta',
            description: 'Bright pasta with garlic and lemon zest.',
            href: '/recipes/r-1',
          },
        ]}
      />
    )

    expect(screen.getByRole('heading', { name: 'Pantry' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Chef Rowan' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /lemon pasta/i })).toBeInTheDocument()
  })

  it('renders primary create recipe action', () => {
    renderWithRouter(
      <PantryPage
        profile={{
          name: 'Chef Rowan',
          bio: 'Home cook sharing weeknight comfort food.',
          recipeCount: 12,
          cookbookCount: 3,
        }}
        recipes={[]}
      />
    )

    const createLinks = screen.getAllByRole('link', { name: /create recipe/i })
    expect(createLinks.length).toBeGreaterThan(0)
    expect(createLinks[0]).toHaveAttribute('href', '/recipes/new')
  })
})
