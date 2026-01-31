/**
 * RecipeBuilder component.
 *
 * Orchestrates the complete recipe creation/editing experience:
 * - RecipeForm (metadata: title, description, servings, image)
 * - StepList (steps with ingredients, reordering, dependencies)
 *
 * Features:
 * - Single-page recipe creation experience
 * - Handles both create (new recipe) and edit (existing recipe) modes
 * - No page navigation during creation
 * - Single save action for entire recipe
 * - Progressive disclosure: start simple, expand on demand
 */

import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Fieldset, Field, Label } from '~/components/ui/fieldset'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { StepList } from './StepList'
import type { StepData } from './StepEditorCard'

export interface RecipeBuilderData {
  id?: string
  title: string
  description: string | null
  servings: string | null
  imageUrl: string
  steps: StepData[]
}

export interface RecipeBuilderProps {
  recipe?: RecipeBuilderData
  onSave: (data: RecipeBuilderData) => void
  onCancel?: () => void
  disabled?: boolean
}

export function RecipeBuilder({
  recipe,
  onSave,
  onCancel,
  disabled = false,
}: RecipeBuilderProps) {
  // Form state for metadata
  const [title, setTitle] = useState(recipe?.title ?? '')
  const [description, setDescription] = useState(recipe?.description ?? '')
  const [servings, setServings] = useState(recipe?.servings ?? '')

  // Steps state
  const [steps, setSteps] = useState<StepData[]>(recipe?.steps ?? [])

  // Derive recipe ID (for edit mode or generate temp ID for create mode)
  const recipeId = recipe?.id ?? 'new-recipe'

  const handleSave = () => {
    const data: RecipeBuilderData = {
      id: recipe?.id,
      title,
      description: description || null,
      servings: servings || null,
      imageUrl: recipe?.imageUrl ?? '',
      steps,
    }
    onSave(data)
  }

  const handleCancel = () => {
    onCancel?.()
  }

  const handleStepsChange = (newSteps: StepData[]) => {
    setSteps(newSteps)
  }

  const isSaveDisabled = disabled || !title.trim()

  return (
    <div className="space-y-8">
      {/* Main heading */}
      <h1 className="text-2xl font-bold">
        {recipe ? 'Edit Recipe' : 'Create Recipe'}
      </h1>

      {/* Recipe details section */}
      <fieldset
        aria-label="Recipe details"
        className="space-y-6"
        disabled={disabled}
      >
        <Fieldset>
          <Field>
            <Label>Title</Label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Recipe title"
              disabled={disabled}
            />
          </Field>

          <Field>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Recipe description"
              rows={3}
              disabled={disabled}
            />
          </Field>

          <Field>
            <Label>Servings</Label>
            <Input
              type="text"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              placeholder="e.g., 4 servings"
              disabled={disabled}
            />
          </Field>
        </Fieldset>
      </fieldset>

      {/* Steps section */}
      <section aria-label="Steps" className="space-y-4">
        <h2 className="text-xl font-semibold">Steps</h2>

        <StepList
          steps={steps}
          recipeId={recipeId}
          onChange={handleStepsChange}
          disabled={disabled}
        />
      </section>

      {/* Action buttons */}
      <div className="flex gap-4 justify-end pt-4 border-t border-zinc-200 dark:border-zinc-700">
        <Button
          type="button"
          color="zinc"
          onClick={handleCancel}
          disabled={disabled}
        >
          Cancel
        </Button>
        <Button
          type="button"
          color="green"
          onClick={handleSave}
          disabled={isSaveDisabled}
        >
          Save Recipe
        </Button>
      </div>
    </div>
  )
}
