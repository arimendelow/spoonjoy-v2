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

## Unit 1b: LLM Integration Implementation

### Implementation Summary
- Added OpenAI SDK (`openai` npm package)
- Implemented `parseIngredients` function using gpt-4o-mini with structured outputs
- Uses JSON schema response format for guaranteed structure
- System prompt handles: fractions, unit normalization, compound ingredients, prep notes

### Key Files Modified
- `app/lib/ingredient-parse.server.ts` - Full implementation
- `package.json` - Added openai dependency
- `test/lib/ingredient-parse.server.test.ts` - Fixed mock to use class pattern for vitest

### Mock Fix
Original mock used `vi.fn().mockImplementation(() => ({...}))` which doesn't work with `new` operator.
Fixed to use class pattern:
```typescript
vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      chat = { completions: { create: mockCreate } }
    },
  }
})
```

---

## Progress Log

### 2026-01-30 - Unit 1a Started
Writing failing tests for ingredient parsing LLM integration.

### 2026-01-30 - Unit 1b Complete
Implemented OpenAI ingredient parsing with gpt-4o-mini structured outputs. All 55 tests passing, 100% coverage.

### 2026-01-30 - Unit 1c Complete (Work Check)
Verified ingredient parsing implementation completeness:
- ✅ All 2601 tests passing (55 specific to ingredient parsing)
- ✅ 100% coverage maintained
- ✅ No warnings
- ✅ Build passes

**Zod Schema Edge Cases Verified:**
- Positive quantity validation (rejects 0 and negative)
- Non-empty unit and ingredient name validation
- Decimal quantities supported (0.5, 0.125, etc.)
- Empty response array allowed (for empty/whitespace input)

**Error Handling Verified:**
- Missing API key throws IngredientParseError
- API request failures wrapped in IngredientParseError with cause
- Invalid JSON response handled
- Schema validation failures handled
- Empty choices array handled
- Null content handled
- Rate limit errors (429) handled
- Authentication errors (401) handled

**No fixes needed** - implementation is complete and all acceptance criteria met.

---

## Unit 2a: Parse Route Action Tests

### Test File
`test/routes/recipes-step-edit-parse-action.test.ts`

### Test Categories
1. **Successful parsing** (4 tests)
   - Single ingredient text → returns structured data
   - Multiple ingredients from multi-line text
   - Empty input → returns empty array
   - Whitespace-only input → returns empty array

2. **Error handling** (4 tests)
   - LLM parsing failure → returns 400 with parse error
   - Missing API key → returns 400 with parse error
   - Rate limited → returns 400 with parse error
   - Unexpected error → returns 500 with parse error

3. **Authentication and authorization** (6 tests)
   - Requires authentication (throws on unauthenticated)
   - Rejects for non-owner
   - Rejects for deleted recipe
   - Rejects for non-existent recipe
   - Rejects for non-existent step
   - Rejects for step belonging to different recipe

4. **API key retrieval** (2 tests)
   - Uses OPENAI_API_KEY from environment
   - Retrieves from Cloudflare env when available

5. **Input validation** (1 test)
   - Handles missing ingredientText field

6. **Non-interference** (2 tests)
   - addIngredient intent still works
   - delete intent still works

### Mocking Strategy
- Mock `~/lib/session.server` for authentication control
- Mock `~/lib/ingredient-parse.server` for LLM response control
- Use `UndiciRequest` and `UndiciFormData` for proper request simulation
- Extract data from React Router's `data()` response format

### Status
**Tests written and FAIL as expected** - 15 tests fail, 4 pass (authentication, existing intents).
Ready for Unit 2b implementation.

---

## Unit 2b: Parse Route Action Implementation

### Implementation Summary
Added `parseIngredients` intent to the step edit route action:

1. **Import additions** to `app/routes/recipes.$id.steps.$stepId.edit.tsx`:
   - `parseIngredients`, `IngredientParseError`, `ParsedIngredient` from `~/lib/ingredient-parse.server`

2. **ActionData interface updated**:
   - Added `parse?: string` to errors
   - Added `parsedIngredients?: ParsedIngredient[]` for success response

3. **New intent handler**:
   - Handles `intent === 'parseIngredients'`
   - Gets ingredient text from formData
   - Gets API key from Cloudflare env or process.env
   - Calls `parseIngredients()` and returns structured data
   - Returns 400 for `IngredientParseError`, 500 for unexpected errors

### Test Fix
The original tests used `.rejects.toThrow('message')` which doesn't work with Response objects.
Fixed to use try/catch pattern that properly checks Response status and body text.

### Files Modified
- `app/routes/recipes.$id.steps.$stepId.edit.tsx` - Added parseIngredients intent
- `test/routes/recipes-step-edit-parse-action.test.ts` - Fixed Response assertion pattern

### Verification
- ✅ All 2620 tests passing (19 specific to parse action)
- ✅ 100% coverage maintained
- ✅ No warnings in test run
- ✅ Build passes

---

## Unit 2c: Parse Route Action - Work Check

### Summary
Verified completeness of the parse route action implementation.

### Test Coverage Verified
**Parse action tests** (`test/routes/recipes-step-edit-parse-action.test.ts`): 19 tests

1. **Successful parsing** (4 tests):
   - Single ingredient → structured data ✅
   - Multiple ingredients (multi-line) ✅
   - Empty input → empty array ✅
   - Whitespace-only → empty array ✅

2. **Error handling** (4 tests):
   - LLM failure → 400 with parse error ✅
   - Missing API key → 400 with parse error ✅
   - Rate limited → 400 with parse error ✅
   - Non-IngredientParseError → 500 with parse error ✅

3. **Authentication/authorization** (6 tests):
   - Requires authentication ✅
   - Rejects non-owner → 403 ✅
   - Rejects deleted recipe → 404 ✅
   - Rejects non-existent recipe → 404 ✅
   - Rejects non-existent step → 404 ✅
   - Rejects step from different recipe → 404 ✅

4. **API key retrieval** (2 tests):
   - Uses process.env.OPENAI_API_KEY ✅
   - Uses Cloudflare env when available ✅

5. **Input validation** (1 test):
   - Missing ingredientText field handled ✅

6. **Non-interference** (2 tests):
   - addIngredient intent still works ✅
   - delete intent still works ✅

### Final Verification
- ✅ All 2620 tests passing
- ✅ 100% line/statement coverage
- ✅ 99.25% branch coverage
- ✅ 99.74% function coverage
- ✅ No warnings in test output (stdout/stderr logs are expected behavior for error handling tests)
- ✅ Build passes

**No fixes needed** - Unit 2c complete.

---

## Unit 3a: ManualIngredientInput Tests

### Test File
`test/components/recipe/ManualIngredientInput.test.tsx`

### Component Design
Extracting existing 3-field ingredient input from `app/routes/recipes.$id.steps.$stepId.edit.tsx` (lines 514-567) into a reusable component.

**Props Interface:**
```typescript
interface ManualIngredientInputProps {
  onAdd: (ingredient: { quantity: number; unit: string; ingredientName: string }) => void
  disabled?: boolean
  loading?: boolean
}
```

**Layout:** Grid with 4 columns `[1fr 1fr 2fr auto]` matching existing step edit form.

### Test Categories

1. **Rendering** (8 tests):
   - Renders three input fields (quantity, unit, ingredient name)
   - Renders add button
   - Correct input types (number, text, text)
   - Grid layout with correct column widths
   - Placeholder text

2. **Validation** (8 tests):
   - Required fields (all three)
   - Quantity min/max (0.001 to 99999)
   - Step attribute for decimals (0.01)
   - Max length for unit (50) and ingredient (100)

3. **Form submission** (8 tests):
   - Calls onAdd with structured data
   - Handles decimal quantities
   - Clears form after submission
   - Does not submit with empty fields
   - Trims whitespace

4. **Keyboard interaction** (2 tests):
   - Enter key submits form
   - Tab order (quantity → unit → ingredient → button)

5. **Accessibility** (3 tests):
   - Labels for all inputs
   - Button has accessible name
   - Autocomplete attributes

6. **Disabled state** (3 tests):
   - Disables all inputs and button
   - Prevents submission when disabled

7. **Loading state** (3 tests):
   - Disables all inputs and button
   - Shows loading indicator
   - aria-busy on button

8. **Edge cases** (4 tests):
   - Small decimals (0.125)
   - Special characters in names
   - Compound ingredient names
   - Max quantity value

### Storybook Story
`stories/ManualIngredientInput.stories.tsx`

Stories include:
- Default (empty state)
- Disabled
- Loading
- FillAndSubmit (interaction test)
- DecimalQuantity (interaction test)
- KeyboardNavigation (interaction test)
- SubmitWithEnter (interaction test)
- ClearsAfterSubmit (interaction test)
- Example: Butter, Eggs, Olive Oil

### Status
**Tests written and FAIL as expected** - Component file does not exist yet.
Ready for Unit 3b implementation.
