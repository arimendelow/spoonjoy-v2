import { useState, useId } from 'react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Fieldset, Field, Label, ErrorMessage } from '~/components/ui/fieldset'
import { RecipeImageUpload } from './RecipeImageUpload'
import { Loader2 } from 'lucide-react'

const TITLE_MAX_LENGTH = 200
const DESCRIPTION_MAX_LENGTH = 2000
const SERVINGS_MAX_LENGTH = 100

export interface RecipeFormData {
  id?: string
  title: string
  description: string
  servings: string
  imageFile: File | null
  clearImage?: boolean
}

export interface RecipeFormProps {
  mode: 'create' | 'edit'
  recipe?: {
    id: string
    title: string
    description: string | null
    servings: string | null
    imageUrl: string
  }
  onSubmit: (data: RecipeFormData) => void
  onCancel?: () => void
  disabled?: boolean
  loading?: boolean
  errors?: {
    title?: string
    description?: string
    servings?: string
    general?: string
    image?: string
  }
}

export function RecipeForm({
  mode,
  recipe,
  onSubmit,
  onCancel,
  disabled = false,
  loading = false,
  errors,
}: RecipeFormProps) {
  const [title, setTitle] = useState(recipe?.title || '')
  const [description, setDescription] = useState(recipe?.description || '')
  const [servings, setServings] = useState(recipe?.servings || '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [clearImage, setClearImage] = useState(false)

  // Generate unique IDs for aria-describedby
  const titleErrorId = useId()
  const descriptionErrorId = useId()
  const servingsErrorId = useId()

  const isDisabled = disabled || loading

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData: RecipeFormData = {
      title: title.trim(),
      description: description.trim(),
      servings: servings.trim(),
      imageFile,
    }

    if (mode === 'edit' && recipe) {
      formData.id = recipe.id
      if (clearImage) {
        formData.clearImage = true
      }
    }

    onSubmit(formData)
  }

  const handleCancelClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    onCancel?.()
  }

  const handleImageSelect = (file: File) => {
    setImageFile(file)
    setClearImage(false)
    // Create preview URL for display
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

  return (
    <form onSubmit={handleSubmit}>
      <Fieldset className="space-y-6">
        {errors?.general && (
          <div
            role="alert"
            className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-400"
          >
            {errors.general}
          </div>
        )}

        <Field>
          <Label>Title</Label>
          <Input
            type="text"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={TITLE_MAX_LENGTH}
            placeholder="e.g., Chocolate Chip Cookies"
            disabled={isDisabled}
            data-invalid={errors?.title ? true : undefined}
            aria-describedby={errors?.title ? titleErrorId : undefined}
          />
          {errors?.title && <ErrorMessage id={titleErrorId}>{errors.title}</ErrorMessage>}
        </Field>

        <Field>
          <Label>Description</Label>
          <Textarea
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            maxLength={DESCRIPTION_MAX_LENGTH}
            placeholder="A brief description of your recipe..."
            disabled={isDisabled}
            data-invalid={errors?.description ? true : undefined}
            aria-describedby={errors?.description ? descriptionErrorId : undefined}
          />
          {errors?.description && (
            <ErrorMessage id={descriptionErrorId}>{errors.description}</ErrorMessage>
          )}
        </Field>

        <Field>
          <Label>Servings</Label>
          <Input
            type="text"
            name="servings"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            maxLength={SERVINGS_MAX_LENGTH}
            placeholder="e.g., 4, 6-8, or 2 dozen"
            disabled={isDisabled}
            data-invalid={errors?.servings ? true : undefined}
            aria-describedby={errors?.servings ? servingsErrorId : undefined}
          />
          {errors?.servings && (
            <ErrorMessage id={servingsErrorId}>{errors.servings}</ErrorMessage>
          )}
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

        <div className="flex gap-4 justify-end pt-4">
          <Button
            type="button"
            color="zinc"
            onClick={handleCancelClick}
            disabled={isDisabled}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            color="green"
            disabled={isDisabled}
            aria-busy={loading ? 'true' : undefined}
          >
            {loading && <Loader2 className="size-4 animate-spin" data-slot="icon" />}
            {mode === 'create' ? 'Create Recipe' : 'Save Changes'}
          </Button>
        </div>
      </Fieldset>
    </form>
  )
}
