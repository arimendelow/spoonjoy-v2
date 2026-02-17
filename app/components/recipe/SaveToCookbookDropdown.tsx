import { useState, useRef, useEffect } from 'react'
import { Bookmark, Plus } from 'lucide-react'
import { Button } from '../ui/button'
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
  DropdownDivider,
  DropdownHeader,
} from '../ui/dropdown'

export interface Cookbook {
  id: string
  title: string
}

export interface SaveToCookbookDropdownProps {
  /** User's cookbooks to display */
  cookbooks: Cookbook[]
  /** Cookbooks that already contain this recipe */
  savedInCookbookIds?: Set<string>
  /** Callback when a cookbook is selected */
  onSave: (cookbookId: string) => void
  /** Callback when "Create new cookbook" is selected (legacy navigation) */
  onCreateNew?: () => void
  /** Callback to create a new cookbook and save the recipe to it (inline flow) */
  onCreateAndSave?: (title: string) => void
  /** Whether the dropdown is disabled */
  disabled?: boolean
}

/**
 * A dropdown button for saving a recipe to a cookbook.
 *
 * Features:
 * - Lists user's existing cookbooks
 * - Shows which cookbooks already contain this recipe
 * - Inline create new cookbook flow (when onCreateAndSave provided)
 * - Accessible dropdown menu
 */
export function SaveToCookbookDropdown({
  cookbooks,
  savedInCookbookIds = new Set(),
  onSave,
  onCreateNew,
  onCreateAndSave,
  disabled = false,
}: SaveToCookbookDropdownProps) {
  const cookbooksList = cookbooks ?? []
  const hasCookbooks = cookbooksList.length > 0
  const [isCreating, setIsCreating] = useState(false)
  const [newCookbookTitle, setNewCookbookTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when entering create mode
  useEffect(() => {
    if (isCreating) {
      inputRef.current?.focus()
    }
  }, [isCreating])

  const handleCreateClick = () => {
    if (onCreateAndSave) {
      setIsCreating(true)
    } else {
      onCreateNew?.()
    }
  }

  const handleCreateSubmit = () => {
    const trimmed = newCookbookTitle.trim()
    if (trimmed && onCreateAndSave) {
      onCreateAndSave(trimmed)
      setNewCookbookTitle('')
      setIsCreating(false)
    }
  }

  const handleCreateCancel = () => {
    setNewCookbookTitle('')
    setIsCreating(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
      handleCreateSubmit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      handleCreateCancel()
    }
  }

  // When in create mode, show the inline form instead of the dropdown
  if (isCreating) {
    return (
      <div className="relative" data-testid="inline-create-cookbook">
        <Button
          outline
          disabled
          className="flex items-center gap-1.5"
          aria-label="Save to cookbook"
        >
          <Bookmark className="w-4 h-4" aria-hidden="true" />
          Save
        </Button>
        <div className="absolute right-0 top-full mt-1 z-50 w-64 rounded-lg bg-white dark:bg-zinc-900 shadow-lg ring-1 ring-zinc-950/10 dark:ring-white/10 p-3">
          <label htmlFor="new-cookbook-input" className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            New cookbook name
          </label>
          <input
            id="new-cookbook-input"
            ref={inputRef}
            type="text"
            value={newCookbookTitle}
            onChange={(e) => setNewCookbookTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Cookbook name"
            aria-label="New cookbook name"
            className="w-full px-2 py-1 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2 mt-2">
            <Button
              color="blue"
              className="text-xs px-2 py-1"
              onClick={handleCreateSubmit}
              disabled={!newCookbookTitle.trim()}
            >
              Create
            </Button>
            <Button
              outline
              className="text-xs px-2 py-1"
              onClick={handleCreateCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Dropdown>
      <DropdownButton
        outline
        disabled={disabled}
        className="flex items-center gap-1.5"
        aria-label="Save to cookbook"
      >
        <Bookmark className="w-4 h-4" aria-hidden="true" />
        Save
      </DropdownButton>
      <DropdownMenu anchor="bottom end">
        {hasCookbooks ? (
          <>
            <DropdownHeader className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Save to cookbook
            </DropdownHeader>
            {cookbooksList.map(cookbook => {
              const isSaved = savedInCookbookIds.has(cookbook.id)
              return (
                <DropdownItem
                  key={cookbook.id}
                  onClick={() => !isSaved && onSave(cookbook.id)}
                  disabled={isSaved}
                >
                  <span className={isSaved ? 'text-zinc-400' : ''}>
                    {cookbook.title}
                    {isSaved && ' ✓'}
                  </span>
                </DropdownItem>
              )
            })}
            {(onCreateNew || onCreateAndSave) && (
              <>
                <DropdownDivider />
                <DropdownItem onClick={handleCreateClick}>
                  <Plus data-slot="icon" />
                  Create new cookbook
                </DropdownItem>
              </>
            )}
          </>
        ) : (
          <>
            <DropdownHeader className="text-sm text-zinc-500 dark:text-zinc-400">
              No cookbooks yet
            </DropdownHeader>
            {(onCreateNew || onCreateAndSave) && (
              <DropdownItem onClick={handleCreateClick}>
                <Plus data-slot="icon" />
                Create your first cookbook
              </DropdownItem>
            )}
          </>
        )}
      </DropdownMenu>
    </Dropdown>
  )
}
