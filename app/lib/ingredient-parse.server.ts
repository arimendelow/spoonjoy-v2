/**
 * Ingredient parsing with OpenAI gpt-4o-mini structured outputs.
 *
 * This module provides LLM-powered parsing of natural language ingredient text
 * (e.g., "2 cups flour") into structured data (quantity, unit, ingredient name).
 */

import { z } from 'zod'

/**
 * Schema for a single parsed ingredient.
 */
export const ParsedIngredientSchema = z.object({
  quantity: z.number().positive(),
  unit: z.string().min(1),
  ingredientName: z.string().min(1),
})

export type ParsedIngredient = z.infer<typeof ParsedIngredientSchema>

/**
 * Schema for the LLM response containing parsed ingredients.
 */
export const ParsedIngredientsResponseSchema = z.object({
  ingredients: z.array(ParsedIngredientSchema),
})

export type ParsedIngredientsResponse = z.infer<typeof ParsedIngredientsResponseSchema>

/**
 * Error thrown when ingredient parsing fails.
 */
export class IngredientParseError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message)
    this.name = 'IngredientParseError'
  }
}

/**
 * Parse natural language ingredient text into structured data using OpenAI gpt-4o-mini.
 *
 * @param text - The ingredient text to parse (e.g., "2 cups flour" or multiple lines)
 * @param apiKey - The OpenAI API key
 * @returns Array of parsed ingredients
 * @throws IngredientParseError if parsing fails
 *
 * @example
 * ```typescript
 * const ingredients = await parseIngredients("2 cups flour\n1/2 tsp salt", apiKey)
 * // Returns: [
 * //   { quantity: 2, unit: "cup", ingredientName: "flour" },
 * //   { quantity: 0.5, unit: "tsp", ingredientName: "salt" }
 * // ]
 * ```
 */
export async function parseIngredients(
  _text: string,
  _apiKey: string
): Promise<ParsedIngredient[]> {
  // TODO: Implement in Unit 1b
  throw new Error('Not implemented')
}
