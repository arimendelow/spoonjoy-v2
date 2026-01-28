import { describe, it, expect } from 'vitest'
import {
  // Constants
  TITLE_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  STEP_DESCRIPTION_MAX_LENGTH,
  STEP_TITLE_MAX_LENGTH,
  SERVINGS_MAX_LENGTH,
  UNIT_NAME_MAX_LENGTH,
  INGREDIENT_NAME_MAX_LENGTH,
  QUANTITY_MIN,
  QUANTITY_MAX,
  // Validation functions
  validateTitle,
  validateDescription,
  validateStepTitle,
  validateStepDescription,
  validateServings,
  validateQuantity,
  validateUnitName,
  validateIngredientName,
  validateImageUrl,
} from '~/lib/validation'

describe('Validation Constants', () => {
  it('exports TITLE_MAX_LENGTH as 200', () => {
    expect(TITLE_MAX_LENGTH).toBe(200)
  })

  it('exports DESCRIPTION_MAX_LENGTH as 2000', () => {
    expect(DESCRIPTION_MAX_LENGTH).toBe(2000)
  })

  it('exports STEP_DESCRIPTION_MAX_LENGTH as 5000', () => {
    expect(STEP_DESCRIPTION_MAX_LENGTH).toBe(5000)
  })

  it('exports STEP_TITLE_MAX_LENGTH as 200', () => {
    expect(STEP_TITLE_MAX_LENGTH).toBe(200)
  })

  it('exports SERVINGS_MAX_LENGTH as 100', () => {
    expect(SERVINGS_MAX_LENGTH).toBe(100)
  })

  it('exports UNIT_NAME_MAX_LENGTH as 50', () => {
    expect(UNIT_NAME_MAX_LENGTH).toBe(50)
  })

  it('exports INGREDIENT_NAME_MAX_LENGTH as 100', () => {
    expect(INGREDIENT_NAME_MAX_LENGTH).toBe(100)
  })

  it('exports QUANTITY_MIN as 0.001', () => {
    expect(QUANTITY_MIN).toBe(0.001)
  })

  it('exports QUANTITY_MAX as 99999', () => {
    expect(QUANTITY_MAX).toBe(99999)
  })
})

describe('validateTitle', () => {
  it('returns valid for a normal title', () => {
    const result = validateTitle('Chocolate Chip Cookies')
    expect(result).toEqual({ valid: true })
  })

  it('returns valid for title at max length', () => {
    const title = 'a'.repeat(TITLE_MAX_LENGTH)
    const result = validateTitle(title)
    expect(result).toEqual({ valid: true })
  })

  it('returns error when title is empty', () => {
    const result = validateTitle('')
    expect(result).toEqual({
      valid: false,
      error: 'Title is required',
    })
  })

  it('returns error when title is only whitespace', () => {
    const result = validateTitle('   ')
    expect(result).toEqual({
      valid: false,
      error: 'Title is required',
    })
  })

  it('returns error when title exceeds max length', () => {
    const title = 'a'.repeat(TITLE_MAX_LENGTH + 1)
    const result = validateTitle(title)
    expect(result).toEqual({
      valid: false,
      error: 'Title must be 200 characters or less',
    })
  })

  it('trims whitespace before validating length', () => {
    const title = '  ' + 'a'.repeat(TITLE_MAX_LENGTH) + '  '
    const result = validateTitle(title)
    expect(result).toEqual({ valid: true })
  })
})

describe('validateDescription', () => {
  it('returns valid for null description', () => {
    const result = validateDescription(null)
    expect(result).toEqual({ valid: true })
  })

  it('returns valid for empty description', () => {
    const result = validateDescription('')
    expect(result).toEqual({ valid: true })
  })

  it('returns valid for a normal description', () => {
    const result = validateDescription('A delicious recipe for chocolate chip cookies.')
    expect(result).toEqual({ valid: true })
  })

  it('returns valid for description at max length', () => {
    const description = 'a'.repeat(DESCRIPTION_MAX_LENGTH)
    const result = validateDescription(description)
    expect(result).toEqual({ valid: true })
  })

  it('returns error when description exceeds max length', () => {
    const description = 'a'.repeat(DESCRIPTION_MAX_LENGTH + 1)
    const result = validateDescription(description)
    expect(result).toEqual({
      valid: false,
      error: 'Description must be 2,000 characters or less',
    })
  })

  it('trims whitespace before validating length', () => {
    const description = '  ' + 'a'.repeat(DESCRIPTION_MAX_LENGTH) + '  '
    const result = validateDescription(description)
    expect(result).toEqual({ valid: true })
  })
})

describe('validateStepTitle', () => {
  it('returns valid for null step title', () => {
    const result = validateStepTitle(null)
    expect(result).toEqual({ valid: true })
  })

  it('returns valid for empty step title', () => {
    const result = validateStepTitle('')
    expect(result).toEqual({ valid: true })
  })

  it('returns valid for a normal step title', () => {
    const result = validateStepTitle('Mix dry ingredients')
    expect(result).toEqual({ valid: true })
  })

  it('returns valid for step title at max length', () => {
    const stepTitle = 'a'.repeat(STEP_TITLE_MAX_LENGTH)
    const result = validateStepTitle(stepTitle)
    expect(result).toEqual({ valid: true })
  })

  it('returns error when step title exceeds max length', () => {
    const stepTitle = 'a'.repeat(STEP_TITLE_MAX_LENGTH + 1)
    const result = validateStepTitle(stepTitle)
    expect(result).toEqual({
      valid: false,
      error: 'Step title must be 200 characters or less',
    })
  })

  it('trims whitespace before validating length', () => {
    const stepTitle = '  ' + 'a'.repeat(STEP_TITLE_MAX_LENGTH) + '  '
    const result = validateStepTitle(stepTitle)
    expect(result).toEqual({ valid: true })
  })
})

describe('validateStepDescription', () => {
  it('returns valid for a normal step description', () => {
    const result = validateStepDescription('Mix the flour, sugar, and baking soda in a large bowl.')
    expect(result).toEqual({ valid: true })
  })

  it('returns valid for step description at max length', () => {
    const description = 'a'.repeat(STEP_DESCRIPTION_MAX_LENGTH)
    const result = validateStepDescription(description)
    expect(result).toEqual({ valid: true })
  })

  it('returns error when step description is empty', () => {
    const result = validateStepDescription('')
    expect(result).toEqual({
      valid: false,
      error: 'Step description is required',
    })
  })

  it('returns error when step description is only whitespace', () => {
    const result = validateStepDescription('   ')
    expect(result).toEqual({
      valid: false,
      error: 'Step description is required',
    })
  })

  it('returns error when step description exceeds max length', () => {
    const description = 'a'.repeat(STEP_DESCRIPTION_MAX_LENGTH + 1)
    const result = validateStepDescription(description)
    expect(result).toEqual({
      valid: false,
      error: 'Description must be 5,000 characters or less',
    })
  })

  it('trims whitespace before validating length', () => {
    const description = '  ' + 'a'.repeat(STEP_DESCRIPTION_MAX_LENGTH) + '  '
    const result = validateStepDescription(description)
    expect(result).toEqual({ valid: true })
  })
})

describe('validateServings', () => {
  it('returns valid for null servings', () => {
    const result = validateServings(null)
    expect(result).toEqual({ valid: true })
  })

  it('returns valid for empty servings', () => {
    const result = validateServings('')
    expect(result).toEqual({ valid: true })
  })

  it('returns valid for a normal servings value', () => {
    const result = validateServings('4-6 servings')
    expect(result).toEqual({ valid: true })
  })

  it('returns valid for servings at max length', () => {
    const servings = 'a'.repeat(SERVINGS_MAX_LENGTH)
    const result = validateServings(servings)
    expect(result).toEqual({ valid: true })
  })

  it('returns error when servings exceeds max length', () => {
    const servings = 'a'.repeat(SERVINGS_MAX_LENGTH + 1)
    const result = validateServings(servings)
    expect(result).toEqual({
      valid: false,
      error: 'Servings must be 100 characters or less',
    })
  })

  it('trims whitespace before validating length', () => {
    const servings = '  ' + 'a'.repeat(SERVINGS_MAX_LENGTH) + '  '
    const result = validateServings(servings)
    expect(result).toEqual({ valid: true })
  })
})

describe('validateQuantity', () => {
  it('returns valid for a normal quantity', () => {
    const result = validateQuantity(2.5)
    expect(result).toEqual({ valid: true })
  })

  it('returns valid for quantity at minimum', () => {
    const result = validateQuantity(QUANTITY_MIN)
    expect(result).toEqual({ valid: true })
  })

  it('returns valid for quantity at maximum', () => {
    const result = validateQuantity(QUANTITY_MAX)
    expect(result).toEqual({ valid: true })
  })

  it('returns valid for integer quantity', () => {
    const result = validateQuantity(1)
    expect(result).toEqual({ valid: true })
  })

  it('returns error when quantity is NaN', () => {
    const result = validateQuantity(NaN)
    expect(result).toEqual({
      valid: false,
      error: 'Quantity must be a valid number',
    })
  })

  it('returns error when quantity is zero', () => {
    const result = validateQuantity(0)
    expect(result).toEqual({
      valid: false,
      error: 'Quantity must be between 0.001 and 99,999',
    })
  })

  it('returns error when quantity is negative', () => {
    const result = validateQuantity(-1)
    expect(result).toEqual({
      valid: false,
      error: 'Quantity must be between 0.001 and 99,999',
    })
  })

  it('returns error when quantity is below minimum', () => {
    const result = validateQuantity(0.0001)
    expect(result).toEqual({
      valid: false,
      error: 'Quantity must be between 0.001 and 99,999',
    })
  })

  it('returns error when quantity exceeds maximum', () => {
    const result = validateQuantity(QUANTITY_MAX + 1)
    expect(result).toEqual({
      valid: false,
      error: 'Quantity must be between 0.001 and 99,999',
    })
  })

  it('returns error when quantity is Infinity', () => {
    const result = validateQuantity(Infinity)
    expect(result).toEqual({
      valid: false,
      error: 'Quantity must be a valid number',
    })
  })

  it('returns error when quantity is negative Infinity', () => {
    const result = validateQuantity(-Infinity)
    expect(result).toEqual({
      valid: false,
      error: 'Quantity must be a valid number',
    })
  })
})

describe('validateUnitName', () => {
  it('returns valid for a normal unit name', () => {
    const result = validateUnitName('cups')
    expect(result).toEqual({ valid: true })
  })

  it('returns valid for unit name at max length', () => {
    const unitName = 'a'.repeat(UNIT_NAME_MAX_LENGTH)
    const result = validateUnitName(unitName)
    expect(result).toEqual({ valid: true })
  })

  it('returns error when unit name is empty', () => {
    const result = validateUnitName('')
    expect(result).toEqual({
      valid: false,
      error: 'Unit name is required',
    })
  })

  it('returns error when unit name is only whitespace', () => {
    const result = validateUnitName('   ')
    expect(result).toEqual({
      valid: false,
      error: 'Unit name is required',
    })
  })

  it('returns error when unit name exceeds max length', () => {
    const unitName = 'a'.repeat(UNIT_NAME_MAX_LENGTH + 1)
    const result = validateUnitName(unitName)
    expect(result).toEqual({
      valid: false,
      error: 'Unit name must be 50 characters or less',
    })
  })

  it('trims whitespace before validating length', () => {
    const unitName = '  ' + 'a'.repeat(UNIT_NAME_MAX_LENGTH) + '  '
    const result = validateUnitName(unitName)
    expect(result).toEqual({ valid: true })
  })
})

describe('validateIngredientName', () => {
  it('returns valid for a normal ingredient name', () => {
    const result = validateIngredientName('all-purpose flour')
    expect(result).toEqual({ valid: true })
  })

  it('returns valid for ingredient name at max length', () => {
    const ingredientName = 'a'.repeat(INGREDIENT_NAME_MAX_LENGTH)
    const result = validateIngredientName(ingredientName)
    expect(result).toEqual({ valid: true })
  })

  it('returns error when ingredient name is empty', () => {
    const result = validateIngredientName('')
    expect(result).toEqual({
      valid: false,
      error: 'Ingredient name is required',
    })
  })

  it('returns error when ingredient name is only whitespace', () => {
    const result = validateIngredientName('   ')
    expect(result).toEqual({
      valid: false,
      error: 'Ingredient name is required',
    })
  })

  it('returns error when ingredient name exceeds max length', () => {
    const ingredientName = 'a'.repeat(INGREDIENT_NAME_MAX_LENGTH + 1)
    const result = validateIngredientName(ingredientName)
    expect(result).toEqual({
      valid: false,
      error: 'Ingredient name must be 100 characters or less',
    })
  })

  it('trims whitespace before validating length', () => {
    const ingredientName = '  ' + 'a'.repeat(INGREDIENT_NAME_MAX_LENGTH) + '  '
    const result = validateIngredientName(ingredientName)
    expect(result).toEqual({ valid: true })
  })
})

describe('validateImageUrl', () => {
  it('returns valid for null URL', () => {
    const result = validateImageUrl(null)
    expect(result).toEqual({ valid: true })
  })

  it('returns valid for empty URL', () => {
    const result = validateImageUrl('')
    expect(result).toEqual({ valid: true })
  })

  it('returns valid for whitespace-only URL', () => {
    const result = validateImageUrl('   ')
    expect(result).toEqual({ valid: true })
  })

  it('returns valid for a valid HTTP URL', () => {
    const result = validateImageUrl('http://example.com/image.jpg')
    expect(result).toEqual({ valid: true })
  })

  it('returns valid for a valid HTTPS URL', () => {
    const result = validateImageUrl('https://example.com/image.png')
    expect(result).toEqual({ valid: true })
  })

  it('returns valid for URL with query parameters', () => {
    const result = validateImageUrl('https://example.com/image.jpg?width=800&height=600')
    expect(result).toEqual({ valid: true })
  })

  it('returns valid for URL with path segments', () => {
    const result = validateImageUrl('https://example.com/images/recipes/2024/photo.webp')
    expect(result).toEqual({ valid: true })
  })

  it('returns error for invalid URL format', () => {
    const result = validateImageUrl('not-a-url')
    expect(result).toEqual({
      valid: false,
      error: 'Please enter a valid URL',
    })
  })

  it('returns error for URL without protocol', () => {
    const result = validateImageUrl('example.com/image.jpg')
    expect(result).toEqual({
      valid: false,
      error: 'Please enter a valid URL',
    })
  })

  it('returns error for javascript: protocol', () => {
    const result = validateImageUrl('javascript:alert(1)')
    expect(result).toEqual({
      valid: false,
      error: 'Please enter a valid URL',
    })
  })

  it('returns error for data: protocol', () => {
    const result = validateImageUrl('data:image/png;base64,abc123')
    expect(result).toEqual({
      valid: false,
      error: 'Please enter a valid URL',
    })
  })

  it('returns error for file: protocol', () => {
    const result = validateImageUrl('file:///etc/passwd')
    expect(result).toEqual({
      valid: false,
      error: 'Please enter a valid URL',
    })
  })

  it('trims whitespace before validating', () => {
    const result = validateImageUrl('  https://example.com/image.jpg  ')
    expect(result).toEqual({ valid: true })
  })
})
