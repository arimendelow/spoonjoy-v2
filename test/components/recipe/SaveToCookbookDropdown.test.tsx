import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  SaveToCookbookDropdown,
  type Cookbook,
} from '../../../app/components/recipe/SaveToCookbookDropdown'

const sampleCookbooks: Cookbook[] = [
  { id: 'cb1', title: 'Weeknight Dinners' },
  { id: 'cb2', title: 'Holiday Favorites' },
  { id: 'cb3', title: 'Quick & Easy' },
]

describe('SaveToCookbookDropdown', () => {
  describe('rendering', () => {
    it('renders save button', () => {
      render(
        <SaveToCookbookDropdown
          cookbooks={sampleCookbooks}
          onSave={vi.fn()}
        />
      )
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    })

    it('renders bookmark icon', () => {
      render(
        <SaveToCookbookDropdown
          cookbooks={sampleCookbooks}
          onSave={vi.fn()}
        />
      )
      const button = screen.getByRole('button', { name: /save/i })
      expect(button.querySelector('svg')).toBeInTheDocument()
    })

    it('opens dropdown when clicked', async () => {
      render(
        <SaveToCookbookDropdown
          cookbooks={sampleCookbooks}
          onSave={vi.fn()}
        />
      )
      const button = screen.getByRole('button', { name: /save/i })
      await userEvent.click(button)
      expect(screen.getByText('Weeknight Dinners')).toBeInTheDocument()
    })

    it('shows all cookbooks in dropdown', async () => {
      render(
        <SaveToCookbookDropdown
          cookbooks={sampleCookbooks}
          onSave={vi.fn()}
        />
      )
      await userEvent.click(screen.getByRole('button', { name: /save/i }))

      for (const cookbook of sampleCookbooks) {
        expect(screen.getByText(cookbook.title)).toBeInTheDocument()
      }
    })
  })

  describe('selection behavior', () => {
    it('calls onSave when cookbook is selected', async () => {
      const onSave = vi.fn()
      render(
        <SaveToCookbookDropdown
          cookbooks={sampleCookbooks}
          onSave={onSave}
        />
      )
      await userEvent.click(screen.getByRole('button', { name: /save/i }))
      await userEvent.click(screen.getByText('Holiday Favorites'))

      expect(onSave).toHaveBeenCalledWith('cb2')
    })

    it('marks already-saved cookbooks', async () => {
      render(
        <SaveToCookbookDropdown
          cookbooks={sampleCookbooks}
          savedInCookbookIds={new Set(['cb1', 'cb3'])}
          onSave={vi.fn()}
        />
      )
      await userEvent.click(screen.getByRole('button', { name: /save/i }))

      // Saved cookbooks should show checkmark
      expect(screen.getByText(/Weeknight Dinners.*✓/)).toBeInTheDocument()
      expect(screen.getByText(/Quick & Easy.*✓/)).toBeInTheDocument()
    })

    it('does not call onSave for already-saved cookbook', async () => {
      const onSave = vi.fn()
      render(
        <SaveToCookbookDropdown
          cookbooks={sampleCookbooks}
          savedInCookbookIds={new Set(['cb1'])}
          onSave={onSave}
        />
      )
      await userEvent.click(screen.getByRole('button', { name: /save/i }))

      // Try to click the saved cookbook
      const savedItem = screen.getByText(/Weeknight Dinners.*✓/)
      await userEvent.click(savedItem)

      expect(onSave).not.toHaveBeenCalled()
    })
  })

  describe('create new cookbook', () => {
    it('shows create new option when onCreateNew provided', async () => {
      render(
        <SaveToCookbookDropdown
          cookbooks={sampleCookbooks}
          onSave={vi.fn()}
          onCreateNew={vi.fn()}
        />
      )
      await userEvent.click(screen.getByRole('button', { name: /save/i }))

      expect(screen.getByText(/create new cookbook/i)).toBeInTheDocument()
    })

    it('calls onCreateNew when clicked', async () => {
      const onCreateNew = vi.fn()
      render(
        <SaveToCookbookDropdown
          cookbooks={sampleCookbooks}
          onSave={vi.fn()}
          onCreateNew={onCreateNew}
        />
      )
      await userEvent.click(screen.getByRole('button', { name: /save/i }))
      await userEvent.click(screen.getByText(/create new cookbook/i))

      expect(onCreateNew).toHaveBeenCalled()
    })

    it('does not show create option when onCreateNew not provided', async () => {
      render(
        <SaveToCookbookDropdown
          cookbooks={sampleCookbooks}
          onSave={vi.fn()}
        />
      )
      await userEvent.click(screen.getByRole('button', { name: /save/i }))

      expect(screen.queryByText(/create new cookbook/i)).toBeNull()
    })
  })

  describe('empty state', () => {
    it('shows empty message when no cookbooks', async () => {
      render(
        <SaveToCookbookDropdown
          cookbooks={[]}
          onSave={vi.fn()}
          onCreateNew={vi.fn()}
        />
      )
      await userEvent.click(screen.getByRole('button', { name: /save/i }))

      expect(screen.getByText(/no cookbooks yet/i)).toBeInTheDocument()
    })

    it('shows create first cookbook option when empty', async () => {
      render(
        <SaveToCookbookDropdown
          cookbooks={[]}
          onSave={vi.fn()}
          onCreateNew={vi.fn()}
        />
      )
      await userEvent.click(screen.getByRole('button', { name: /save/i }))

      expect(screen.getByText(/create your first cookbook/i)).toBeInTheDocument()
    })
  })

  describe('disabled state', () => {
    it('disables button when disabled prop is true', () => {
      render(
        <SaveToCookbookDropdown
          cookbooks={sampleCookbooks}
          onSave={vi.fn()}
          disabled
        />
      )
      expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
    })
  })

  describe('accessibility', () => {
    it('has accessible button label', () => {
      render(
        <SaveToCookbookDropdown
          cookbooks={sampleCookbooks}
          onSave={vi.fn()}
        />
      )
      expect(screen.getByRole('button', { name: /save.*cookbook/i })).toBeInTheDocument()
    })
  })
})
