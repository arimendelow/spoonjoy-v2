import { useState, useId, useRef, useEffect } from 'react'
import { Form, useNavigation } from 'react-router'
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
  onSubmit?: (data: RecipeFormData) => void
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

// Try to use useNavigation, but gracefully handle when not in router context
function useSafeNavigation() {
  try {
    return useNavigation()
  } catch {
    return { state: 'idle' as const }
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
  const navigation = useSafeNavigation()
  const isSubmitting = loading || navigation.state === 'submitting'
  const isDisabled = disabled || isSubmitting

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [clearImage, setClearImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Generate unique IDs for aria-describedby
  const titleErrorId = useId()
  const descriptionErrorId = useId()
  const servingsErrorId = useId()

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleCancelClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    onCancel?.()
  }

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // If onSubmit is provided, prevent default and call it (for unit tests)
    if (onSubmit) {
      event.preventDefault()
      const form = event.currentTarget
      const formData = new FormData(form)

      const data: RecipeFormData = {
        title: (formData.get('title') as string || '').trim(),
        description: (formData.get('description') as string || '').trim(),
        servings: (formData.get('servings') as string || '').trim(),
        imageFile,
      }

      if (mode === 'edit' && recipe) {
        data.id = recipe.id
        if (clearImage) {
          data.clearImage = true
        }
      }

      onSubmit(data)
    }
    // Otherwise let the form submit normally to React Router
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

    // Update the hidden file input with a DataTransfer
    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      fileInputRef.current.files = dataTransfer.files
    }
  }

  const handleImageClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setImageFile(null)
    setClearImage(true)
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Determine which image URL to display
  const getDisplayImageUrl = () => {
    if (previewUrl) return previewUrl
    if (clearImage) return ''
    return recipe?.imageUrl || ''
  }

  const displayImageUrl = getDisplayImageUrl()

  // Use native form when onSubmit callback is provided (for unit tests without router context)
  // Use React Router Form when in router context (for route integration)
  const FormComponent = onSubmit ? 'form' : Form

  return (
    <FormComponent method="post" encType="multipart/form-data" onSubmit={handleFormSubmit}>
      <Fieldset className="space-y-6">
        {errors?.general && (
          <div
            role="alert"
            className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-400"
          >
            {errors.general}
          </div>
        )}

        {/* Hidden input for recipe ID in edit mode */}
        {mode === 'edit' && recipe && (
          <input type="hidden" name="id" value={recipe.id} />
        )}

        {/* Hidden input for clearImage flag */}
        {clearImage && (
          <input type="hidden" name="clearImage" value="true" />
        )}

        <Field>
          <Label>Title</Label>
          <Input
            type="text"
            name="title"
            defaultValue={recipe?.title || ''}
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
            defaultValue={recipe?.description || ''}
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
            defaultValue={recipe?.servings || ''}
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
          {/* Hidden file input for form submission */}
          <input
            ref={fileInputRef}
            type="file"
            name="image"
            accept="image/*"
            className="hidden"
          />
          <RecipeImageUpload
            imageUrl={displayImageUrl}
            onFileSelect={handleImageSelect}
            onClear={handleImageClear}
            disabled={isDisabled}
            loading={isSubmitting}
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
            aria-busy={isSubmitting ? 'true' : undefined}
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" data-slot="icon" />}
            {mode === 'create' ? 'Create Recipe' : 'Save Changes'}
          </Button>
        </div>
      </Fieldset>
    </FormComponent>
  )
}
