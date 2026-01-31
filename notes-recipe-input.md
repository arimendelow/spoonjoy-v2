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

---

## Unit 3b: ManualIngredientInput Implementation

### Implementation Summary
Created `app/components/recipe/ManualIngredientInput.tsx` - a reusable 3-field ingredient input component.

**Key Decisions:**

1. **Native button instead of HeadlessUI Button**: The HeadlessUI Button component caused form submission issues in the jsdom test environment. The button's click event wasn't properly triggering form submission. Used native `<button>` with extracted Tailwind styling classes instead.

2. **`step="any"` for quantity input**: Originally used `step="0.01"` but this caused HTML5 validation failures. With `min="0.001"` and `step="0.01"`, values like `2` are invalid because step calculation starts from min value. Changed to `step="any"` to allow any decimal value.

3. **HeadlessUI Input works fine**: The Input component from the UI library works correctly with form submission. Only the Button component had issues.

### Component Features
- Three controlled inputs: quantity (number), unit (text), ingredient name (text)
- Grid layout: `grid-cols-[1fr_1fr_2fr_auto]` matching existing step edit form
- Validation: required fields, min/max quantity bounds, max lengths
- Clears form after successful submission
- Trims whitespace from text inputs
- Proper accessibility: labels, aria-busy on loading

### Files Created/Modified
- `app/components/recipe/ManualIngredientInput.tsx` - New component
- `test/components/recipe/ManualIngredientInput.test.tsx` - Updated step="any" expectation

### Verification
- ✅ All 38 ManualIngredientInput tests passing
- ✅ All 2658 tests passing overall
- ✅ Build passes
- ✅ Storybook story file exists and is compatible

---

## Unit 4a: IngredientParseInput + useIngredientParser Tests

### Test Files Created

1. **`test/hooks/useIngredientParser.test.tsx`** - Tests for the useIngredientParser hook
2. **`test/components/recipe/IngredientParseInput.test.tsx`** - Tests for the IngredientParseInput component
3. **`stories/IngredientParseInput.stories.tsx`** - Storybook stories

### Hook Design: useIngredientParser

The hook provides:
- `text` - Current ingredient text
- `setText` - Update text (triggers debounce)
- `parse` - Manually trigger parse (cancels debounce)
- `clear` - Clear text, results, and errors
- `isLoading` - Loading state during parse
- `error` - Error message if parse fails
- `parsedIngredients` - Array of parsed ingredients

**Debounce Behavior:**
- 1 second debounce after typing stops
- Debounce resets on each keystroke
- Empty/whitespace text doesn't trigger parse
- Manual `parse()` call cancels pending debounce

**Props:**
- `recipeId` - Recipe ID for route action
- `stepId` - Step ID for route action

### Component Design: IngredientParseInput

**Props:**
- `recipeId` - Recipe ID for parse action
- `stepId` - Step ID for parse action
- `onParsed` - Callback when parsing succeeds
- `disabled` - Disable the textarea
- `defaultValue` - Initial text value

**UI Elements:**
- Textarea with label and placeholder
- Helper text explaining AI parsing
- Loading indicator during parse
- Error message display with proper ARIA

### Test Categories

**useIngredientParser hook** (26 tests):
1. Initialization (4) - empty state, no loading/error
2. Text input (4) - setText, clear
3. Debounced parsing (5) - debounce timing, reset, empty text handling
4. Manual parsing (2) - immediate parse, cancel debounce
5. Loading state (3) - during parse, after success, after failure
6. Parsing results (2) - stores results, clears on new parse
7. Error handling (3) - stores error, clears on success, clears results on error
8. Fetcher data (2) - correct form data, preserves multi-line

**IngredientParseInput component** (27 tests):
1. Rendering (5) - textarea, placeholder, label, helper text, rows
2. Loading states (4) - indicator, hides on complete, disables textarea, aria-busy
3. Error states (4) - displays error, clears on typing, marks invalid, aria-describedby
4. Debounce behavior (2) - typing indicator, no loading before debounce
5. Callback (3) - onParsed on success, not on failure, empty on clear
6. Disabled state (2) - disables textarea, no parse when disabled
7. Controlled value (2) - defaultValue, triggers parse for initial value
8. Accessibility (3) - label, description, announces loading
9. Keyboard interaction (2) - Enter for newlines, no form submit

### Status
**Tests written and FAIL as expected** - hook and component files don't exist yet.
Ready for Unit 4b implementation.

---

## Unit 5a: ParsedIngredientRow + ParsedIngredientList Tests

### Test Files Created

1. **`test/components/recipe/ParsedIngredientRow.test.tsx`** - Tests for individual parsed ingredient row
2. **`test/components/recipe/ParsedIngredientList.test.tsx`** - Tests for the list of parsed ingredients
3. **`stories/ParsedIngredientRow.stories.tsx`** - Storybook stories for row component
4. **`stories/ParsedIngredientList.stories.tsx`** - Storybook stories for list component

### Component Design: ParsedIngredientRow

A row that displays a single parsed ingredient with inline edit and remove actions.

**Props:**
```typescript
interface ParsedIngredientRowProps {
  ingredient: ParsedIngredient
  onEdit: (ingredient: ParsedIngredient) => void
  onRemove: (ingredient: ParsedIngredient) => void
}
```

**Features:**
- Display mode: Shows quantity, unit, ingredient name
- Edit button: Switches to inline edit mode
- Remove button: Removes ingredient from list
- Inline edit mode: Input fields with save/cancel buttons
- Keyboard shortcuts: Enter to save, Escape to cancel

### Component Design: ParsedIngredientList

A list container for parsed ingredients with bulk "Add All" action.

**Props:**
```typescript
interface ParsedIngredientListProps {
  ingredients: ParsedIngredient[]
  onEdit: (index: number, ingredient: ParsedIngredient) => void
  onRemove: (index: number) => void
  onAddAll: (ingredients: ParsedIngredient[]) => void
  disabled?: boolean
  loading?: boolean
}
```

**Features:**
- Renders list of ParsedIngredientRow components
- "Add All (N)" button to add all ingredients at once
- Empty state message when no ingredients
- Disabled/loading states
- Heading showing count of parsed ingredients

### Test Categories

**ParsedIngredientRow** (43 tests):
1. Rendering (8) - display quantity/unit/name, buttons, formatting
2. Edit action (2) - click handler, passes ingredient
3. Remove action (2) - click handler, passes ingredient
4. Inline edit mode (10) - enter/exit edit, populate fields, save/cancel, keyboard
5. Accessibility (4) - button names, semantic markup, labels
6. Validation in edit mode (7) - empty/zero/negative values, whitespace trimming
7. Edge cases (4) - decimals, special chars, long names

**ParsedIngredientList** (38 tests):
1. Rendering (8) - list items, count, Add All button, empty state
2. Add All action (4) - callback, passes ingredients, loading state
3. Edit action on rows (3) - passes index and ingredient
4. Remove action on rows (2) - passes index
5. Disabled state (3) - disables all actions
6. Accessibility (4) - list role, items, button names
7. Single/many ingredients (4) - edge cases
8. Edge cases (4) - special chars, long names, order
9. Header and labeling (2) - heading with count

### Status
**Unit 5b COMPLETE** - All 72 tests passing, 100% coverage, build passes.

---

## Unit 5b: ParsedIngredientRow + ParsedIngredientList Implementation

### Implementation Summary

**ParsedIngredientRow** (`app/components/recipe/ParsedIngredientRow.tsx`):
- Display mode: shows quantity, unit, ingredient name with edit/remove buttons
- Edit mode: inline editing with quantity/unit/ingredient inputs, save/cancel
- Keyboard support: Enter saves, Escape cancels
- Validation: positive quantity, non-empty unit and ingredient
- Whitespace trimming on save
- Uses Lucide icons (Pencil, Trash2, Check, X)

**ParsedIngredientList** (`app/components/recipe/ParsedIngredientList.tsx`):
- List container rendering ParsedIngredientRow components
- "Add All (N)" button with ingredient count
- Empty state message when no ingredients
- Heading with count: "Parsed Ingredients (N)"
- Disabled/loading states propagated to all rows

### Test Fix Required
The original tests from Unit 5a had contradictory expectations:
- "edit action" tests expected `onEdit` to be called immediately on edit button click
- "inline edit mode" tests expected entering edit mode on edit button click

These were mutually exclusive. Fixed by updating tests to match correct behavior:
- Edit button enters inline edit mode (does NOT call onEdit)
- Save button calls onEdit with (potentially updated) ingredient
- Cancel exits edit mode without calling onEdit

### Files Created
- `app/components/recipe/ParsedIngredientRow.tsx`
- `app/components/recipe/ParsedIngredientList.tsx`

### Files Modified (test fixes)
- `test/components/recipe/ParsedIngredientRow.test.tsx`
- `test/components/recipe/ParsedIngredientList.test.tsx`

### Verification
- ✅ All 2789 tests passing (72 specific to these components)
- ✅ 100% coverage
- ✅ Build passes
- ✅ Storybook stories compatible

---

## Unit 6a: IngredientInputToggle Tests

### Test File
`test/components/recipe/IngredientInputToggle.test.tsx`

### Component Design

A toggle switch for switching between AI-parsed and manual ingredient input modes.

**Props Interface:**
```typescript
interface IngredientInputToggleProps {
  onChange: (mode: 'ai' | 'manual') => void
  defaultMode?: 'ai' | 'manual'  // Uncontrolled mode
  mode?: 'ai' | 'manual'         // Controlled mode
  disabled?: boolean
  storageKey?: string            // Custom localStorage key
}
```

**Behavior:**
- Uses existing `Switch` component from `app/components/ui/switch.tsx`
- Persists preference to localStorage
- Calls `onChange` with initial mode on mount
- Supports both controlled (`mode` prop) and uncontrolled (`defaultMode` prop) usage

### Test Categories

1. **Rendering** (6 tests):
   - Renders switch control
   - Label text ("AI Parse")
   - Description text
   - Defaults to AI mode (checked)
   - Respects defaultMode="manual"
   - Respects defaultMode="ai"

2. **Mode switching** (4 tests):
   - Calls onChange with "manual" when toggled off
   - Calls onChange with "ai" when toggled on
   - Updates visual state on toggle
   - Multiple toggles work correctly

3. **localStorage persistence** (8 tests):
   - Saves preference on toggle to manual
   - Saves preference on toggle to AI
   - Reads initial mode from localStorage
   - Prefers localStorage over defaultMode
   - Uses defaultMode when localStorage empty
   - Calls onChange with initial mode from localStorage
   - Supports custom storage key

4. **Disabled state** (3 tests):
   - Disables switch when disabled prop is true
   - Does not call onChange when disabled
   - Does not save to localStorage when disabled

5. **Controlled mode** (4 tests):
   - Respects controlled mode prop
   - Ignores localStorage when controlled
   - Updates when controlled mode prop changes
   - Does not save to localStorage in controlled mode

6. **Keyboard interaction** (2 tests):
   - Toggles on Space key
   - Focusable via Tab

7. **Accessibility** (3 tests):
   - Has accessible label
   - Has accessible description
   - Announces state change via aria-checked

8. **Edge cases** (3 tests):
   - Handles invalid localStorage value gracefully
   - Handles localStorage read errors gracefully
   - Handles localStorage write errors gracefully

### Storybook Story
`stories/IngredientInputToggle.stories.tsx`

Stories include:
- Default (AI mode)
- AIMode
- ManualMode
- Disabled
- DisabledManual
- Controlled (with state display)
- InFormContext (realistic usage example)
- ToggleToManual (interaction test)
- ToggleToAI (interaction test)
- KeyboardToggle (interaction test)
- DisabledInteraction (interaction test)
- RapidToggling (interaction test)
- FocusState (interaction test)

### Status
**Tests written and FAIL as expected** - Component file does not exist yet.
Ready for Unit 6b implementation.
