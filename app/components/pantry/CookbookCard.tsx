import { Share2 } from 'lucide-react'
import { Heading } from '../ui/heading'
import { Link } from '../ui/link'

export interface CookbookCardRecipeImage {
  imageUrl: string
  title: string
}

export interface CookbookCardProps {
  id: string
  title: string
  recipeCount: number
  /** First up-to-4 recipe images for the cover grid */
  recipeImages?: CookbookCardRecipeImage[]
  href?: string
  onShare?: (cookbookId: string) => void
}

/**
 * Cookbook cover: 4+ recipes → 2×2 image grid, fewer → single hero or default.
 * Swiss-alpine aesthetic: sharp corners, thin border, editorial type.
 */
export function CookbookCard({
  id,
  title,
  recipeCount,
  recipeImages = [],
  href,
  onShare,
}: CookbookCardProps) {
  const link = href ?? `/cookbooks/${id}`

  return (
    <article className="group relative overflow-hidden rounded-sm border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      {/* Cover image area */}
      <Link href={link} className="block">
        <div className="relative">
          {recipeImages.length >= 4 ? (
            <CoverGrid images={recipeImages.slice(0, 4)} />
          ) : recipeImages.length > 0 ? (
            <img
              src={recipeImages[0].imageUrl}
              alt={recipeImages[0].title}
              className="aspect-[4/3] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[4/3] w-full items-center justify-center bg-zinc-100 text-xs tracking-wide text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
              No recipes yet
            </div>
          )}

          {/* Share icon — top-right, same style as recipe quick actions */}
          <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              aria-label={`Share ${title}`}
              onClick={(e) => {
                e.preventDefault()
                onShare?.(id)
              }}
              className="rounded-sm bg-white/80 p-1.5 text-zinc-600 backdrop-blur-sm transition-colors hover:bg-white hover:text-zinc-900 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </Link>

      {/* Editorial title + recipe count */}
      <div className="px-4 py-3">
        <Link href={link} className="hover:underline">
          <Heading level={3} className="text-base/6 font-semibold tracking-tight">
            {title}
          </Heading>
        </Link>
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          {recipeCount} {recipeCount === 1 ? 'recipe' : 'recipes'}
        </p>
      </div>
    </article>
  )
}

/** 2×2 grid of recipe hero images for cookbook covers */
function CoverGrid({ images }: { images: CookbookCardRecipeImage[] }) {
  return (
    <div className="grid aspect-[4/3] grid-cols-2 grid-rows-2">
      {images.map((img, i) => (
        <img
          key={i}
          src={img.imageUrl}
          alt={img.title}
          className="h-full w-full object-cover"
        />
      ))}
    </div>
  )
}
