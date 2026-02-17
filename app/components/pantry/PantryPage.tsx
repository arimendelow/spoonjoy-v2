import { Button } from '../ui/button'
import { Heading, Subheading } from '../ui/heading'
import { Text } from '../ui/text'
import { BioCard, type BioCardProps } from './BioCard'
import { RecipeGrid, type PantryRecipeCard } from './RecipeGrid'

export interface PantryPageProps {
  profile: BioCardProps
  recipes: PantryRecipeCard[]
  createRecipeHref?: string
}

export function PantryPage({
  profile,
  recipes,
  createRecipeHref = '/recipes/new',
}: PantryPageProps) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Heading level={1} className="text-3xl/8 font-bold tracking-tight">
            Pantry
          </Heading>
          <Text className="mt-2 max-w-2xl">
            Your personal kitchen profile with recipes and pantry-ready favorites.
          </Text>
        </div>

        <Button href={createRecipeHref} className="w-full justify-center sm:w-auto">
          Create Recipe
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        <aside className="lg:col-span-4">
          <BioCard {...profile} />
        </aside>

        <section className="lg:col-span-8">
          <Subheading level={2} className="mb-4 text-sm">
            Pantry Recipes
          </Subheading>
          <RecipeGrid recipes={recipes} />
        </section>
      </div>
    </div>
  )
}
