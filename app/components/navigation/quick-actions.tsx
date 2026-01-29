'use client'

/**
 * Quick Actions - Helper utilities for common contextual actions
 * 
 * This is a stub placeholder. Implementation pending in Unit 9b.
 * Tests should FAIL until implementation is complete.
 */

export interface ShareOptions {
  /** Title to share */
  title: string
  /** Text/description to share */
  text?: string
  /** URL to share */
  url: string
}

export interface ShareResult {
  /** Whether share was successful */
  success: boolean
  /** Method used: 'native' | 'clipboard' */
  method: 'native' | 'clipboard'
}

/**
 * Share content using native share API or clipboard fallback
 */
export async function shareContent(_options: ShareOptions): Promise<ShareResult> {
  // STUB: No implementation yet
  return { success: false, method: 'clipboard' }
}

/**
 * Check if native share is supported
 */
export function isNativeShareSupported(): boolean {
  // STUB: No implementation yet
  return false
}

export interface AddToListOptions {
  /** Recipe ID to add */
  recipeId: string
  /** Ingredient IDs to add (optional - defaults to all) */
  ingredientIds?: string[]
}

export interface AddToListResult {
  /** Whether add was successful */
  success: boolean
  /** Number of items added */
  itemsAdded: number
  /** Error message if failed */
  error?: string
}

/**
 * Add recipe ingredients to shopping list
 */
export async function addToShoppingList(_options: AddToListOptions): Promise<AddToListResult> {
  // STUB: No implementation yet
  return { success: false, itemsAdded: 0, error: 'Not implemented' }
}
