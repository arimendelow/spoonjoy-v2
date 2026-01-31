import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

interface RecipeImageUploadProps {
  onFileSelect: (file: File) => void
  onClear?: () => void
  onValidationError?: (message: string) => void
  imageUrl?: string
  alt?: string
  disabled?: boolean
  loading?: boolean
  error?: string
}

export function RecipeImageUpload({
  onFileSelect,
  onClear,
  onValidationError,
  imageUrl,
  alt,
  disabled = false,
  loading = false,
  error,
}: RecipeImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Cleanup object URL on unmount or when preview changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith('image/')) {
      onValidationError?.('Invalid file type. Please select an image file.')
      return false
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      onValidationError?.('Invalid file type. Please select an image file.')
      return false
    }

    if (file.size > MAX_FILE_SIZE) {
      onValidationError?.('File too large. Maximum size is 5MB.')
      return false
    }

    return true
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!validateFile(file)) {
      // Reset input so the same file can be selected again
      event.target.value = ''
      return
    }

    // Revoke old preview URL if exists
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    // Create new preview URL
    const newPreviewUrl = URL.createObjectURL(file)
    setPreviewUrl(newPreviewUrl)

    onFileSelect(file)

    // Reset input to allow selecting the same file again
    event.target.value = ''
  }

  const handleClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    onClear?.()
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled && !loading) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled || loading) return

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    if (!validateFile(file)) return

    // Revoke old preview URL if exists
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    // Create new preview URL
    const newPreviewUrl = URL.createObjectURL(file)
    setPreviewUrl(newPreviewUrl)

    onFileSelect(file)
  }

  const displayUrl = previewUrl || imageUrl
  const hasImage = Boolean(displayUrl)
  const isDisabled = disabled || loading

  return (
    <div className="space-y-2">
      <div
        data-drop-zone
        className={clsx(
          'relative w-full aspect-video rounded-lg border-2 border-dashed transition-colors',
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/25 drag-active'
            : 'border-zinc-300 dark:border-zinc-700',
          isDisabled && 'opacity-50 cursor-not-allowed'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {hasImage ? (
          <img
            src={displayUrl!}
            alt={alt || 'Recipe image preview'}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-500 dark:text-zinc-400">
            <ImageIcon className="size-12" />
            <p className="text-sm">Drag and drop or upload an image</p>
          </div>
        )}

        {loading && (
          <div
            role="status"
            aria-busy="true"
            className="absolute inset-0 flex items-center justify-center bg-white/75 dark:bg-zinc-900/75 rounded-lg"
          >
            <Loader2 className="size-8 animate-spin text-zinc-600 dark:text-zinc-400" />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={isDisabled}
        aria-label="Upload image file"
        onChange={handleFileChange}
      />

      <div className="flex gap-2">
        {hasImage ? (
          <>
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={isDisabled}
              className={clsx(
                'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors',
                'border-zinc-950/10 text-zinc-950 hover:bg-zinc-950/5',
                'dark:border-white/15 dark:text-white dark:hover:bg-white/5',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <Upload className="size-4" />
              Change Image
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={isDisabled}
              className={clsx(
                'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors',
                'border-red-300 text-red-700 hover:bg-red-50',
                'dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/25',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <X className="size-4" />
              Remove
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={isDisabled}
            className={clsx(
              'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors',
              'border-zinc-950/10 text-zinc-950 hover:bg-zinc-950/5',
              'dark:border-white/15 dark:text-white dark:hover:bg-white/5',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <Upload className="size-4" />
            Upload Image
          </button>
        )}
      </div>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        JPG, PNG, GIF, or WebP. Max 5MB.
      </p>

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
