import { useState } from 'react'
import { ImageOff, Pencil, Share2, Trash2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Heading } from '../ui/heading'
import { Text, Strong } from '../ui/text'
import { ConfirmationDialog } from '../confirmation-dialog'
import { ScaleSelector } from './ScaleSelector'
import { scaleServingsText } from '~/lib/quantity'

export interface RecipeHeaderProps {
  /** Recipe title */
  title: string
  /** Recipe description (optional) */
  description?: string
  /** Chef's display name */
  chefName: string
  /** URL to recipe image (optional) */
  imageUrl?: string
  /** Servings text (e.g., "Serves 4") */
  servings?: string
  /** Current scale factor */
  scaleFactor: number
  /** Callback when scale factor changes */
  onScaleChange: (value: number) => void
  /** Whether current user owns this recipe */
  isOwner: boolean
  /** Recipe ID for edit/delete actions */
  recipeId: string
  /** Callback when delete is confirmed */
  onDelete?: () => void
  /** Callback when share is clicked */
  onShare?: () => void
  /** Optional custom save button (for SaveToCookbookDropdown) */
  renderSaveButton?: () => React.ReactNode
}

/**
 * Recipe header with prominent image, title, chef info, scaling controls, and owner actions.
 *
 * Features:
 * - PROMINENT hero-style recipe image (or placeholder)
 * - Mobile-first design for kitchen use
 * - Integrated ScaleSelector with scaled servings text
 * - Edit/delete buttons for recipe owners
 */
export function RecipeHeader({
  title,
  description,
  chefName,
  imageUrl,
  servings,
  scaleFactor,
  onScaleChange,
  isOwner,
  recipeId,
  onDelete,
  onShare,
  renderSaveButton,
}: RecipeHeaderProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDeleteConfirm = () => {
    setShowDeleteDialog(false)
    onDelete?.()
  }

  // Scale the servings text based on the scale factor
  const scaledServings = servings ? scaleServingsText(servings, scaleFactor) : undefined

  return (
    <header className="w-full">
      {/* Hero Image Section - PROMINENT and beautiful */}
      {imageUrl ? (
        <div
          data-testid="recipe-image"
          className="relative w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] overflow-hidden bg-zinc-100 dark:bg-zinc-800"
        >
          <img
            src={imageUrl}
            alt={`Photo of ${title}`}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay for text readability on mobile */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent sm:hidden" />
        </div>
      ) : (
        <div
          data-testid="recipe-image-placeholder"
          className="relative w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center"
        >
          <div className="flex flex-col items-center gap-2 text-zinc-400 dark:text-zinc-500">
            <ImageOff className="w-12 h-12 sm:w-16 sm:h-16" aria-hidden="true" />
            <span className="text-sm">No image available</span>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl mx-auto">
        {/* Title and Actions Row */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <Heading level={1} className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight break-words">
              {title}
            </Heading>
            <Text className="mt-2">
              By <Strong>{chefName}</Strong>
            </Text>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 shrink-0">
            {/* Save to cookbook - visible for all users */}
            {renderSaveButton?.()}

            {/* Share button - visible for all users */}
            {onShare && (
              <Button
                outline
                onClick={onShare}
                className="flex items-center gap-1.5"
                aria-label="Share recipe"
              >
                <Share2 className="w-4 h-4" aria-hidden="true" />
                Share
              </Button>
            )}

            {/* Owner-only actions */}
            {isOwner && (
              <>
                <Button
                  href={`/recipes/${recipeId}/edit`}
                  color="blue"
                  className="flex items-center gap-1.5"
                >
                  <Pencil className="w-4 h-4" aria-hidden="true" />
                  Edit
                </Button>
                <Button
                  color="red"
                  onClick={() => setShowDeleteDialog(true)}
                  className="flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                  Delete
                </Button>
                <ConfirmationDialog
                  open={showDeleteDialog}
                  onClose={() => setShowDeleteDialog(false)}
                  onConfirm={handleDeleteConfirm}
                  title="Banish this recipe?"
                  description={`"${title}" will be sent to the shadow realm. This cannot be undone!`}
                  confirmLabel="Delete it"
                  cancelLabel="Keep it"
                  destructive
                />
              </>
            )}
          </div>
        </div>

        {/* Description */}
        {description && (
          <div className="mb-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 sm:p-6">
            <Text className="text-base sm:text-lg leading-relaxed">{description}</Text>
          </div>
        )}

        {/* Scaling Section */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
          {/* Scale Selector */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Scale:</span>
            <ScaleSelector value={scaleFactor} onChange={onScaleChange} />
          </div>

          {/* Scaled Servings */}
          {scaledServings && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {scaleFactor !== 1 && (
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 mr-1">
                    (originally: {servings})
                  </span>
                )}
              </span>
              <Strong className="text-lg">{scaledServings}</Strong>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
