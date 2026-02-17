import { ImageOff, Share2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Heading } from '../ui/heading'
import { Text, Strong } from '../ui/text'
import { Link } from '../ui/link'
import { Avatar } from '../ui/avatar'
import { ScaleSelector } from './ScaleSelector'
import { scaleServingsText } from '~/lib/quantity'

export interface RecipeHeaderProps {
  /** Recipe title */
  title: string
  /** Recipe description (optional) */
  description?: string
  /** Chef's display name */
  chefName: string
  /** Chef's user ID for profile link */
  chefId?: string
  /** Chef's photo URL (optional) */
  chefPhotoUrl?: string
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
  /** Recipe ID (for future use) */
  recipeId: string
  /** Callback when share is clicked */
  onShare?: () => void
  /** Optional custom save button (for SaveToCookbookDropdown) */
  renderSaveButton?: () => React.ReactNode
}

/**
 * Recipe header with prominent image, title, chef info, and scaling controls.
 *
 * Features:
 * - PROMINENT hero-style recipe image (or placeholder)
 * - Mobile-first design for kitchen use
 * - Integrated ScaleSelector with scaled servings text
 * - Share and save to cookbook buttons for all users
 */
export function RecipeHeader({
  title,
  description,
  chefName,
  chefId,
  chefPhotoUrl,
  imageUrl,
  servings,
  scaleFactor,
  onScaleChange,
  isOwner,
  recipeId,
  onShare,
  renderSaveButton,
}: RecipeHeaderProps) {

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
            <div className="mt-2 flex items-center gap-2">
              <span data-testid="chef-avatar">
                <Avatar
                  src={chefPhotoUrl}
                  initials={chefName.charAt(0).toUpperCase()}
                  alt={chefName}
                  className="size-8"
                />
              </span>
              <Text>
                By{' '}
                {chefId ? (
                  <Link href={`/users/${chefId}`} className="hover:underline">
                    <Strong>{chefName}</Strong>
                  </Link>
                ) : (
                  <Strong>{chefName}</Strong>
                )}
              </Text>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 shrink-0">
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
