/**
 * Ingredient parsing with OpenAI gpt-4o-mini structured outputs.
 *
 * This module provides LLM-powered parsing of natural language ingredient text
 * (e.g., "2 cups flour") into structured data (quantity, unit, ingredient name).
 */

import OpenAI from 'openai'
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
 * JSON Schema for OpenAI structured outputs.
 * This defines the expected response format for the LLM.
 */
const INGREDIENT_RESPONSE_JSON_SCHEMA = {
  name: 'ingredient_response',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      ingredients: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            quantity: {
              type: 'number',
              description: 'The numeric quantity of the ingredient (must be positive)',
            },
            unit: {
              type: 'string',
              description:
                'The unit of measurement (e.g., cup, tbsp, tsp, oz, lb, whole, piece, pinch, dash). Use singular form.',
            },
            ingredientName: {
              type: 'string',
              description:
                'The name of the ingredient, including any modifiers or prep notes (e.g., "extra virgin olive oil", "flour, sifted")',
            },
          },
          required: ['quantity', 'unit', 'ingredientName'],
          additionalProperties: false,
        },
      },
    },
    required: ['ingredients'],
    additionalProperties: false,
  },
} as const

/**
 * System prompt for the ingredient parsing LLM.
 */
const SYSTEM_PROMPT = `You are an expert recipe ingredient parser. Parse natural language ingredient descriptions into structured data.

Rules:
1. Convert fractions to decimals (1/2 → 0.5, 1/4 → 0.25, 3/4 → 0.75, 1 1/2 → 1.5)
2. Convert unicode fractions to decimals (½ → 0.5, ¼ → 0.25, ¾ → 0.75)
3. Use singular unit forms (cups → cup, tablespoons → tbsp, teaspoons → tsp)
4. Standard abbreviations: tbsp, tsp, oz, lb, g, kg, ml, l
5. For countable items without units (e.g., "2 eggs"), use "whole" as the unit
6. For "cloves of garlic", use "clove" as unit and "garlic" as ingredient
7. For "pinch of X" or "dash of X", use quantity=1 with "pinch" or "dash" as unit
8. For ranges like "2-3 cups", use the lower number
9. Ignore approximate words like "about", "approximately"
10. Keep prep notes with the ingredient name (e.g., "flour, sifted", "onion, diced")
11. Keep modifiers with ingredient name (e.g., "extra virgin olive oil", "kosher salt", "dark brown sugar")
12. If input is empty or whitespace-only, return an empty ingredients array

Parse each line or comma-separated ingredient independently.`

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
export async function parseIngredients(text: string, apiKey: string): Promise<ParsedIngredient[]> {
  // Validate API key
  if (!apiKey) {
    throw new IngredientParseError('OpenAI API key is required')
  }

  // Create OpenAI client
  const openai = new OpenAI({ apiKey })

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: INGREDIENT_RESPONSE_JSON_SCHEMA,
      },
    })

    // Validate response structure
    const choice = response.choices[0]
    if (!choice) {
      throw new IngredientParseError('No response from OpenAI API')
    }

    const content = choice.message.content
    if (!content) {
      throw new IngredientParseError('Empty response content from OpenAI API')
    }

    // Parse JSON response
    let parsed: unknown
    try {
      parsed = JSON.parse(content)
    } catch (jsonError) {
      throw new IngredientParseError('Invalid JSON in OpenAI response', jsonError)
    }

    // Validate against Zod schema
    const result = ParsedIngredientsResponseSchema.safeParse(parsed)
    if (!result.success) {
      throw new IngredientParseError(
        `Response does not match expected schema: ${result.error.message}`,
        result.error
      )
    }

    return result.data.ingredients
  } catch (error) {
    // Re-throw if already an IngredientParseError
    if (error instanceof IngredientParseError) {
      throw error
    }

    // Wrap other errors
    throw new IngredientParseError('Failed to parse ingredients', error)
  }
}
