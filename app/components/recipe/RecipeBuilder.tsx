/**
 * RecipeBuilder component.
 *
 * Orchestrates the complete recipe creation/editing experience:
 * - Metadata section (title, description, servings, image)
 * - StepList (steps with ingredients, reordering, dependencies)
 *
 * Features:
 * - Single-page recipe creation experience
 * - Handles both create (new recipe) and edit (existing recipe) modes
 * - No page navigation during creation
 * - Single save action for entire recipe
 * - Progressive disclosure: start simple, expand on demand
 * - Error display with aria-describedby for accessibility
 * - Loading state with spinner
 * - Character limits on inputs
 */

import { useState, useEffect, useId } from 'react'
import { Button } from '~/components/ui/button'
import { Fieldset, Field, Label, ErrorMessage } from '~/components/ui/fieldset'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { StepList } from './StepList'
import { RecipeImageUpload } from './RecipeImageUpload'
import { Loader2 } from 'lucide-react'
import type { StepData } from './StepEditorCard'

const TITLE_MAX_LENGTH = 60
const DESCRIPTION_MAX_LENGTH = 140
const SERVINGS_MAX_LENGTH = 40

export interface RecipeBuilderData {
  id?: string
  title: string
  description: string | null
  servings: string | null
  imageUrl: string
  imageFile?: File | null
  clearImage?: boolean
  steps: StepData[]
}

export interface RecipeBuilderProps {
  recipe?: RecipeBuilderData
  onSave: (data: RecipeBuilderData) => void
  onCancel?: () => void
  disabled?: boolean
  loading?: boolean
  errors?: {
    title?: string
    description?: string
    servings?: string
    image?: string
    general?: string
  }
}

export function RecipeBuilder({
  recipe,
  onSave,
  onCancel,
  disabled = false,
  loading = false,
  errors,
}: RecipeBuilderProps) {
  // Generate unique IDs for aria-describedby
  const titleErrorId = useId()
  const descriptionErrorId = useId()
  const servingsErrorId = useId()

  // Combine disabled and loading for isDisabled
  const isDisabled = disabled || loading

  // Form state for metadata
  const [title, setTitle] = useState(recipe?.title ?? '')
  const [description, setDescription] = useState(recipe?.description ?? '')
  const [servings, setServings] = useState(recipe?.servings ?? '')

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [clearImage, setClearImage] = useState(false)

  // Steps state
  const [steps, setSteps] = useState<StepData[]>(recipe?.steps ?? [])

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  // Derive recipe ID (for edit mode or generate temp ID for create mode)
  const recipeId = recipe?.id ?? 'new-recipe'

  const handleSave = () => {
    // Prevent save if disabled or loading
    if (isDisabled || !title.trim()) return

    const data: RecipeBuilderData = {
      id: recipe?.id,
      title,
      description: description || null,
      servings: servings || null,
      imageUrl: recipe?.imageUrl ?? '',
      imageFile,
      clearImage: clearImage || undefined,
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

  const handleImageSelect = (file: File) => {
    setImageFile(file)
    setClearImage(false)
    // Create preview URL for display
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleImageClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setImageFile(null)
    setClearImage(true)
  }

  // Determine which image URL to display
  const getDisplayImageUrl = () => {
    if (previewUrl) return previewUrl
    if (clearImage) return ''
    return recipe?.imageUrl || ''
  }

  const displayImageUrl = getDisplayImageUrl()

  const isSaveDisabled = isDisabled || !title.trim()

  return (
    <div className="space-y-8">
      {/* Main heading - hidden since parent route provides heading */}
      <h1 className="sr-only">
        {recipe ? 'Edit Recipe' : 'Create Recipe'}
      </h1>

      {/* General error alert */}
      {errors?.general && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-400"
        >
          {errors.general}
        </div>
      )}

      {/* Recipe details section */}
      <fieldset
        aria-label="Recipe details"
        className="space-y-6"
        disabled={isDisabled}
      >
        <Fieldset>
          <Field>
            <Label>Title</Label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Chocolate Chip Cookies"
              maxLength={TITLE_MAX_LENGTH}
              disabled={isDisabled}
              data-invalid={errors?.title ? true : undefined}
              aria-describedby={errors?.title ? titleErrorId : undefined}
            />
            {errors?.title && <ErrorMessage id={titleErrorId}>{errors.title}</ErrorMessage>}
          </Field>

          <Field>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Recipe description"
              rows={3}
              maxLength={DESCRIPTION_MAX_LENGTH}
              disabled={isDisabled}
              data-invalid={errors?.description ? true : undefined}
              aria-describedby={errors?.description ? descriptionErrorId : undefined}
            />
            {errors?.description && <ErrorMessage id={descriptionErrorId}>{errors.description}</ErrorMessage>}
          </Field>

          <Field>
            <Label>Servings</Label>
            <Input
              type="text"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              placeholder="e.g., 4 servings"
              maxLength={SERVINGS_MAX_LENGTH}
              disabled={isDisabled}
              data-invalid={errors?.servings ? true : undefined}
              aria-describedby={errors?.servings ? servingsErrorId : undefined}
            />
            {errors?.servings && <ErrorMessage id={servingsErrorId}>{errors.servings}</ErrorMessage>}
          </Field>

          <Field>
            <Label>Recipe Image</Label>
            <RecipeImageUpload
              imageUrl={displayImageUrl}
              onFileSelect={handleImageSelect}
              onClear={handleImageClear}
              disabled={isDisabled}
              loading={loading}
              error={errors?.image}
            />
          </Field>
        </Fieldset>
      </fieldset>

      {/* Steps section */}
      <section aria-label="Recipe Steps" className="space-y-4">
        <h2 className="text-xl font-semibold">Recipe Steps</h2>

        <StepList
          steps={steps}
          recipeId={recipeId}
          onChange={handleStepsChange}
          disabled={isDisabled}
        />
      </section>

      {/* Action buttons */}
      <div className="flex gap-4 justify-end pt-4 border-t border-zinc-200 dark:border-zinc-700">
        <Button
          type="button"
          color="zinc"
          onClick={handleCancel}
          disabled={isDisabled}
        >
          Cancel
        </Button>
        <Button
          type="button"
          color="green"
          onClick={handleSave}
          disabled={isDisabled}
          aria-disabled={isSaveDisabled || undefined}
          aria-busy={loading ? 'true' : undefined}
          className={isSaveDisabled && !isDisabled ? 'opacity-50' : undefined}
        >
          {loading && <Loader2 className="size-4 animate-spin" data-slot="icon" />}
          {recipe ? 'Save Recipe' : 'Create Recipe'}
        </Button>
      </div>
    </div>
  )
}
