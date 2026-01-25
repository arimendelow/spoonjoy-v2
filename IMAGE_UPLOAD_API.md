# Image Upload API Integration

## Overview

Spoonjoy v2 requires image processing for recipe photos. When users upload an image, it should be sent to an image generation API to be redrawn with a consistent aesthetic.

## Current Implementation

Currently, the recipe forms accept a simple image URL string:
- `app/routes/recipes.new.tsx` (lines 174-194)
- `app/routes/recipes.$id.edit.tsx` (lines 224-240)

## Required Workflow

1. **User uploads photo** →
2. **Send to image gen API** →
3. **API redraws with aesthetic** →
4. **Save processed result URL**

## API Requirements

### Endpoint Specification

The image processing API should:

- Accept image uploads (multipart/form-data or base64)
- Apply a consistent visual style to food photography
- Return a URL to the processed image
- Support async processing with callbacks (optional)

### Suggested Prompt

Use this prompt (or similar) for the image generation API:

```
"professional food photography, clean aesthetic, natural lighting,
minimalist composition, instagram-worthy, high quality"
```

### API Integration Points

#### In `app/routes/recipes.new.tsx`:

```typescript
// Replace current implementation around line 27-50
export async function action({ request, context }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  // ... existing validation ...

  const imageFile = formData.get("imageFile") as File;
  let imageUrl = formData.get("imageUrl")?.toString() || "";

  // If image file uploaded, process it
  if (imageFile && imageFile.size > 0) {
    // 1. Upload to temporary storage or convert to base64
    // 2. Call image generation API
    // 3. Get processed image URL
    imageUrl = await processRecipeImage(imageFile);
  }

  // ... rest of existing code ...
}

async function processRecipeImage(file: File): Promise<string> {
  // TODO: Implement API call to image generation service
  // Example:
  // const response = await fetch('https://api.example.com/process-image', {
  //   method: 'POST',
  //   body: formData,
  //   headers: {
  //     'Authorization': `Bearer ${process.env.IMAGE_API_KEY}`,
  //   },
  // });
  // const { processedImageUrl } = await response.json();
  // return processedImageUrl;

  throw new Error("Image processing not yet implemented");
}
```

#### Update Form UI (line 174-194):

```tsx
<div>
  <label htmlFor="imageFile" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
    Recipe Photo
  </label>
  <input
    type="file"
    id="imageFile"
    name="imageFile"
    accept="image/*"
    style={{
      width: "100%",
      padding: "0.75rem",
      fontSize: "1rem",
      border: "1px solid #ccc",
      borderRadius: "4px",
    }}
  />
  <p style={{ fontSize: "0.875rem", color: "#666", marginTop: "0.25rem" }}>
    Upload a photo of your recipe. We'll enhance it with professional styling.
  </p>

  {/* Keep URL input as fallback */}
  <label htmlFor="imageUrl" style={{ display: "block", margin: "1rem 0 0.5rem", fontWeight: "bold" }}>
    Or paste image URL
  </label>
  <input
    type="url"
    id="imageUrl"
    name="imageUrl"
    placeholder="https://example.com/image.jpg"
    style={{
      width: "100%",
      padding: "0.75rem",
      fontSize: "1rem",
      border: "1px solid #ccc",
      borderRadius: "4px",
    }}
  />
</div>
```

## Environment Variables

Add to `.env` or wrangler.toml:

```
IMAGE_API_KEY=your_api_key_here
IMAGE_API_URL=https://api.example.com/process-image
```

## API Service Options

Consider these image processing services:

1. **Replicate** (https://replicate.com)
   - Good for style transfer and image enhancement
   - Pay per API call
   - Support for custom models

2. **Stability AI** (https://stability.ai)
   - High-quality image generation
   - Good for consistent styling

3. **OpenAI DALL-E 3** via API
   - Can generate variations of uploaded images
   - Good quality but higher cost

4. **Cloudinary** (https://cloudinary.com)
   - AI-powered image enhancements
   - Built-in CDN and storage
   - Good for production use

## Implementation Checklist

- [ ] Choose image processing API service
- [ ] Set up API credentials
- [ ] Implement file upload handling in form
- [ ] Create `processRecipeImage()` utility function
- [ ] Add error handling for API failures
- [ ] Update both create and edit recipe routes
- [ ] Add loading state/progress indicator in UI
- [ ] Test with various image formats and sizes
- [ ] Add image size limits and validation
- [ ] Consider async processing for large images

## Testing

Mock the image processing API in tests:

```typescript
vi.mock("~/lib/image-processing.server", () => ({
  processRecipeImage: vi.fn().mockResolvedValue("https://example.com/processed-image.jpg"),
}));
```

## Security Considerations

- Validate file types (only accept image formats)
- Limit file size (e.g., max 10MB)
- Scan uploads for malicious content
- Use signed URLs for processed images
- Rate limit API calls per user
- Handle API failures gracefully with fallback

## Database Schema

The current schema already supports this:

```prisma
model Recipe {
  imageUrl String @default("https://res.cloudinary.com/dpjmyc4uz/image/upload/v1674541350/clbe7wr180009tkhggghtl1qd.png")
  // ... other fields
}
```

No schema changes needed - just update the `imageUrl` field with the processed image URL.
