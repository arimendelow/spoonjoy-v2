const LEGACY_DEFAULT_RECIPE_IMAGE_TOKEN = "clbe7wr180009tkhggghtl1qd.png";

/**
 * Some older records used a stock default image URL to represent "no image".
 * Treat those as missing images so UI placeholders render correctly.
 */
export function getDisplayRecipeImageUrl(imageUrl?: string | null): string | undefined {
  const normalized = imageUrl?.trim();
  if (!normalized) return undefined;

  if (normalized.includes(LEGACY_DEFAULT_RECIPE_IMAGE_TOKEN)) {
    return undefined;
  }

  return normalized;
}

