import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Heading, Subheading } from '../ui/heading'
import { Link } from '../ui/link'
import { Text } from '../ui/text'

export interface PantryRecipeCard {
  id: string
  title: string
  description?: string
  imageUrl?: string
  cookTimeMinutes?: number
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  href?: string
}

export interface RecipeGridProps {
  recipes: PantryRecipeCard[]
  emptyTitle?: string
  emptyMessage?: string
  emptyCtaHref?: string
}

export function RecipeGrid({
  recipes,
  emptyTitle = 'No recipes yet',
  emptyMessage = 'Start by creating your first recipe for this pantry.',
  emptyCtaHref = '/recipes/new',
}: RecipeGridProps) {
  if (recipes.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-5 dark:border-zinc-700 dark:bg-zinc-900/50">
        <Subheading level={2}>{emptyTitle}</Subheading>
        <Text className="mt-2">{emptyMessage}</Text>
        <div className="mt-4">
          <Button href={emptyCtaHref} color="blue">
            Create Recipe
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Subheading level={2}>Recipes</Subheading>
        <Text className="text-xs">{recipes.length} total</Text>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => {
          const href = recipe.href ?? `/recipes/${recipe.id}`

          return (
            <article
              key={recipe.id}
              className="overflow-hidden rounded-2xl border border-zinc-950/10 bg-white shadow-xs dark:border-white/10 dark:bg-zinc-900"
            >
              {recipe.imageUrl ? (
                <img src={recipe.imageUrl} alt={recipe.title} className="h-32 w-full object-cover" />
              ) : (
                <div className="flex h-32 w-full items-center justify-center bg-zinc-100 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  No photo
                </div>
              )}

              <div className="space-y-3 p-4">
                <Link href={href} className="hover:underline">
                  <Heading level={3} className="text-base/6 font-semibold">
                    {recipe.title}
                  </Heading>
                </Link>

                {recipe.description && <Text className="line-clamp-2 text-sm">{recipe.description}</Text>}

                <div className="flex flex-wrap gap-2">
                  {typeof recipe.cookTimeMinutes === 'number' && (
                    <Badge color="amber">{recipe.cookTimeMinutes} min</Badge>
                  )}
                  {recipe.difficulty && <Badge color="zinc">{recipe.difficulty}</Badge>}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
