# Recipe Input Implementation Notes

**Task**: Unit 1a - LLM Integration Tests
**Date**: 2026-01-30

---

## Unit 1a: Ingredient Parsing Tests

### Provider Decision
Based on research in `notes-recipe-input-llm-research.md`:
- **Chosen**: OpenAI gpt-4o-mini with structured outputs
- **Rationale**: Best balance of cost/quality/reliability, excellent CF Workers support

### Zod Schema
```typescript
const ParsedIngredientSchema = z.object({
  quantity: z.number(),
  unit: z.string(),
  ingredientName: z.string(),
})

const ParsedIngredientsResponseSchema = z.object({
  ingredients: z.array(ParsedIngredientSchema),
})
```

### Test Cases
1. **Basic parsing**: "2 cups flour" → { quantity: 2, unit: "cup", ingredientName: "flour" }
2. **Fractions**: "1/2 cup sugar" → { quantity: 0.5, unit: "cup", ingredientName: "sugar" }
3. **Unicode fractions**: "½ cup milk" → { quantity: 0.5, unit: "cup", ingredientName: "milk" }
4. **No unit**: "2 eggs" → { quantity: 2, unit: "whole", ingredientName: "eggs" }
5. **Compound ingredients**: "extra virgin olive oil" → { quantity: 1, unit: "tbsp", ingredientName: "extra virgin olive oil" }
6. **Prep notes**: "flour, sifted" → { quantity: 1, unit: "cup", ingredientName: "flour" }
7. **Ranges**: "2-3 cups water" → quantity should be the lower bound or midpoint
8. **Approximate**: "about 1 cup broth" → { quantity: 1, unit: "cup", ingredientName: "broth" }
9. **Multiple ingredients**: Parse multiple lines at once
10. **Error cases**: LLM failures, malformed responses

### Mocking Strategy
- Mock the OpenAI SDK `chat.completions.create` method
- Use `vi.mock()` to mock the module
- Return structured JSON matching expected schema

---

## Progress Log

### 2026-01-30 - Unit 1a Started
Writing failing tests for ingredient parsing LLM integration.
