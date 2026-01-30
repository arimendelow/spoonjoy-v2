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
  /** Callback when "Create new cookbook" is selected */
  onCreateNew?: () => void
  /** Whether the dropdown is disabled */
  disabled?: boolean
}

/**
 * A dropdown button for saving a recipe to a cookbook.
 *
 * Features:
 * - Lists user's existing cookbooks
 * - Shows which cookbooks already contain this recipe
 * - Option to create a new cookbook
 * - Accessible dropdown menu
 */
export function SaveToCookbookDropdown({
  cookbooks,
  savedInCookbookIds = new Set(),
  onSave,
  onCreateNew,
  disabled = false,
}: SaveToCookbookDropdownProps) {
  const cookbooksList = cookbooks ?? []
  const hasCookbooks = cookbooksList.length > 0
  const allSaved = hasCookbooks && cookbooksList.every(c => savedInCookbookIds.has(c.id))

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
            {onCreateNew && (
              <>
                <DropdownDivider />
                <DropdownItem onClick={onCreateNew}>
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
            {onCreateNew && (
              <DropdownItem onClick={onCreateNew}>
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
