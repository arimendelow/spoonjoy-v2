# Working Notes & Decisions

This file is for Claude to document decisions, learnings, and notes during implementation.

**Purpose:**
- Record decisions made during implementation (library choices, architecture decisions, etc.)
- Note things to remember for future tasks
- Document gotchas or learnings discovered along the way
- Track any deviations from the plan and why

**Usage:**
- Check this file at the start of each work session
- Add notes as you work
- Reference past decisions when relevant

---

## Current Task: Recipe CRUD Validation

**Goal:** Add validation to recipe create/edit operations.

---

## Unit 1: Recipe CRUD Audit (Completed)

### Route Inventory

| Route File | Purpose | CRUD Operation |
|------------|---------|----------------|
| `recipes.tsx` | Layout route - displays recipe list + user info | Read (list) |
| `recipes._index.tsx` | Index route - also displays recipe list | Read (list) |
| `recipes.new.tsx` | Create new recipe form | Create |
| `recipes.$id.tsx` | View single recipe + delete action | Read, Delete |
| `recipes.$id.edit.tsx` | Edit recipe form + reorder steps | Update |
| `recipes.$id.steps.new.tsx` | Add new step to recipe | Create |
| `recipes.$id.steps.$stepId.edit.tsx` | Edit step + add/delete ingredients | Update, Delete |

### CRUD Operations Completeness

| Operation | Implemented | Location |
|-----------|-------------|----------|
| **Recipe Create** | Yes | `recipes.new.tsx` action |
| **Recipe Read (list)** | Yes | `recipes.tsx` + `recipes._index.tsx` loaders |
| **Recipe Read (single)** | Yes | `recipes.$id.tsx` loader |
| **Recipe Update** | Yes | `recipes.$id.edit.tsx` action |
| **Recipe Delete** | Yes (soft delete) | `recipes.$id.tsx` action |
| **Step Create** | Yes | `recipes.$id.steps.new.tsx` action |
| **Step Update** | Yes | `recipes.$id.steps.$stepId.edit.tsx` action |
| **Step Delete** | Yes | `recipes.$id.steps.$stepId.edit.tsx` action (intent=delete) |
| **Step Reorder** | Yes | `recipes.$id.edit.tsx` action (intent=reorderStep) |
| **Ingredient Add** | Yes | `recipes.$id.steps.$stepId.edit.tsx` action (intent=addIngredient) |
| **Ingredient Delete** | Yes | `recipes.$id.steps.$stepId.edit.tsx` action (intent=deleteIngredient) |

---

### Current Validation Status

#### recipes.new.tsx (Create Recipe)
| Field | Validation | Status |
|-------|------------|--------|
| title | Required, trimmed | **Implemented** |
| description | Trimmed, nullable | No validation |
| servings | Trimmed, nullable | No validation |
| imageUrl | Trimmed, optional | No validation |

**Missing validation:**
- No max length on title
- No max length on description
- No max length on servings
- No URL format validation on imageUrl (HTML type="url" only)
- No sanitization/XSS protection

#### recipes.$id.edit.tsx (Edit Recipe)
| Field | Validation | Status |
|-------|------------|--------|
| title | Required, trimmed | **Implemented** |
| description | Trimmed, nullable | No validation |
| servings | Trimmed, nullable | No validation |
| imageUrl | Trimmed, optional | No validation |

**Missing validation:**
- Same issues as create

#### recipes.$id.steps.new.tsx (Create Step)
| Field | Validation | Status |
|-------|------------|--------|
| stepTitle | Trimmed, nullable | No validation |
| description | Required, trimmed | **Implemented** |

**Missing validation:**
- No max length on stepTitle
- No max length on description

#### recipes.$id.steps.$stepId.edit.tsx (Edit Step)
| Field | Validation | Status |
|-------|------------|--------|
| stepTitle | Trimmed, nullable | No validation |
| description | Required, trimmed | **Implemented** |

**Missing validation:**
- Same issues as create step

#### Ingredient Validation (in step edit)
| Field | Validation | Status |
|-------|------------|--------|
| quantity | Parsed as float | **Partial** - truthy check only |
| unitName | Truthy check | **Partial** - no length limits |
| ingredientName | Truthy check | **Partial** - no length limits |

**Missing validation:**
- No min/max on quantity (could be negative, zero, or absurdly large)
- No length limits on unit/ingredient names
- No format validation

---

### Permission/Authorization Status

| Route | Auth Required | Owner Check | Status |
|-------|---------------|-------------|--------|
| recipes.tsx | Yes (requireUserId) | N/A (list only shows own) | **Good** |
| recipes._index.tsx | Yes (requireUserId) | N/A (list only shows own) | **Good** |
| recipes.new.tsx | Yes (requireUserId) | N/A (creates for self) | **Good** |
| recipes.$id.tsx (loader) | Yes | Shows isOwner flag | **Good** |
| recipes.$id.tsx (action) | Yes | Verifies chefId === userId | **Good** |
| recipes.$id.edit.tsx (loader) | Yes | Verifies chefId === userId | **Good** |
| recipes.$id.edit.tsx (action) | Yes | Verifies chefId === userId | **Good** |
| recipes.$id.steps.new.tsx | Yes | Verifies recipe.chefId === userId | **Good** |
| recipes.$id.steps.$stepId.edit.tsx | Yes | Verifies recipe.chefId === userId | **Good** |

**Permission checks are well-implemented across all routes.**

---

### Custom CSS Audit (Non-Tailwind)

**MAJOR FINDING: All recipe routes use inline `style={{}}` instead of Tailwind classes.**

Every single recipe route uses inline styles extensively. Examples from `recipes.tsx`:
- Line 42-44: `style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}`
- Line 45-50: `style={{ display: "flex", justifyContent: "space-between", ... }}`
- Lines 56-69: Inline styles for logout button
- And so on throughout all files...

**Files with extensive inline styles (all recipe routes):**
1. `app/routes/recipes.tsx` - ~100+ lines of inline styles
2. `app/routes/recipes._index.tsx` - ~80+ lines of inline styles
3. `app/routes/recipes.new.tsx` - ~100+ lines of inline styles
4. `app/routes/recipes.$id.tsx` - ~120+ lines of inline styles
5. `app/routes/recipes.$id.edit.tsx` - ~180+ lines of inline styles
6. `app/routes/recipes.$id.steps.new.tsx` - ~80+ lines of inline styles
7. `app/routes/recipes.$id.steps.$stepId.edit.tsx` - ~200+ lines of inline styles

**UI Components NOT being used (available in app/components/ui/):**
- `button.tsx` - Not used, inline button styles instead
- `input.tsx` - Not used, inline input styles instead
- `textarea.tsx` - Not used, inline textarea styles instead
- `link.tsx` - Not used, inline link styles instead
- `heading.tsx` - Not used, inline h1/h2/h3 styles instead
- `text.tsx` - Not used, inline paragraph styles instead
- `alert.tsx` - Not used for error messages
- `fieldset.tsx` - Not used for form structure
- `badge.tsx` - Could be used for servings display

---

### Edge Cases Identified

#### Recipe Operations
1. **Duplicate title handling** - Schema has `@@unique([chefId, title, deletedAt])` but note in schema says "this is currently broken" - could allow duplicate active recipes with same title
2. **Empty string vs null** - Some fields use `|| null`, others use `|| undefined` inconsistently
3. **Soft delete visibility** - Deleted recipes filtered by `deletedAt: null` in queries, but:
   - What happens if user tries to access deleted recipe directly via URL?
   - Answer: Returns 404 correctly (checks `recipe.deletedAt` in loader)
4. **Race condition on step reorder** - Uses temp stepNum=-1 for swap, could conflict if two users reorder simultaneously
5. **imageUrl default** - Schema has default placeholder URL, but code uses `|| undefined` which might not trigger the default

#### Step Operations
1. **Step number gaps** - If step 2 is deleted, steps 1 and 3 remain (no renumbering)
2. **Step number at reorder bounds** - Moving first step up or last step down has no effect (correct, but no user feedback)
3. **Step deletion doesn't cascade properly to StepOutputUse** - If a step is deleted that's referenced by another step's StepOutputUse, what happens? (Cascade should handle it per schema)

#### Ingredient Operations
1. **Quantity validation** - `parseFloat` on user input could result in NaN, 0, or negative values
2. **Unit/ingredient name normalization** - Lowercased on create, but displayed as-is (always lowercase)
3. **No duplicate ingredient check** - Can add same ingredient twice to same step

#### Security Edge Cases
1. **URL injection via imageUrl** - No sanitization, could potentially store `javascript:` URLs (mitigated by being used in backgroundImage CSS)
2. **XSS via recipe/step content** - Text content rendered directly, though React escapes by default

---

### Data Integrity Gaps

1. **Title length** - No DB constraint, no app validation (could insert megabytes of text)
2. **Description length** - No DB constraint, no app validation
3. **Servings format** - Stored as String, no format validation (could be anything)
4. **Step description length** - No DB constraint, no app validation
5. **Quantity range** - Float with no min/max (could be negative or astronomical)
6. **Unit/Ingredient name length** - No constraints

---

### Missing Validation Summary (Priority Order)

**High Priority:**
1. Title max length (recommend 200 chars)
2. Description max length (recommend 2000 chars)
3. Step description max length (recommend 5000 chars)
4. Quantity min (0.001) and max (99999) validation
5. Unit name max length (recommend 50 chars)
6. Ingredient name max length (recommend 100 chars)

**Medium Priority:**
1. Servings format validation (free text OK, but max length needed)
2. stepTitle max length (recommend 200 chars)
3. imageUrl proper URL validation (beyond HTML type="url")

**Low Priority:**
1. Duplicate ingredient detection
2. Empty string normalization (consistent null vs empty handling)

---

### Recommendations for Next Steps

1. **Create validation utilities** - Central place for field validation logic
2. **Add field length constants** - Define max lengths in one place
3. **Migrate to Tailwind/UI components** - Replace all inline styles
4. **Add client-side validation** - Match server validation for better UX
5. **Consider Zod or similar** - Schema-based validation for consistency

---

## Decisions Log

*(No decisions yet)*

---

## Implementation Notes

*(No notes yet)*

---

## For Future Tasks

- The `@@unique([chefId, title, deletedAt])` constraint has a known bug (see schema comment)
- StepOutputUse model exists but is not being used in the UI (potential future feature)
- sourceRecipeId/sourceUrl fields exist for recipe forking (not implemented in UI)

---

## Phase 2: Implementation Units

Based on the Unit 1 audit findings, here are the atomic implementation units for adding validation to Recipe CRUD operations. Each unit follows TDD: (a) write tests, (b) implement, (c) verify.

### Scope Decision

**In Scope (This Phase):**
- Field validation (lengths, formats, ranges)
- Error messages for validation failures
- UI/CSS migration from inline styles to Tailwind
- Duplicate ingredient detection

**Out of Scope (Deferred):**
- Permission validation (already well-implemented per audit)
- Step number gap handling (low priority)

---

### Unit 2.1: Validation Constants & Utilities

**What it covers:**
- Create a validation constants file with all max lengths and ranges
- Create reusable validation utility functions

**Files to create/modify:**
- `app/lib/validation.ts` (new)

**Acceptance Criteria:**
- [ ] Constants defined for all field limits:
  - `TITLE_MAX_LENGTH = 200`
  - `DESCRIPTION_MAX_LENGTH = 2000`
  - `STEP_DESCRIPTION_MAX_LENGTH = 5000`
  - `STEP_TITLE_MAX_LENGTH = 200`
  - `SERVINGS_MAX_LENGTH = 100`
  - `UNIT_NAME_MAX_LENGTH = 50`
  - `INGREDIENT_NAME_MAX_LENGTH = 100`
  - `QUANTITY_MIN = 0.001`
  - `QUANTITY_MAX = 99999`
- [ ] Validation functions created:
  - `validateTitle(title: string): { valid: boolean; error?: string }`
  - `validateDescription(desc: string | null): { valid: boolean; error?: string }`
  - `validateQuantity(qty: number): { valid: boolean; error?: string }`
  - `validateUnitName(name: string): { valid: boolean; error?: string }`
  - `validateIngredientName(name: string): { valid: boolean; error?: string }`
  - `validateImageUrl(url: string | null): { valid: boolean; error?: string }`
- [ ] All utility functions have unit tests with 100% coverage

**Dependencies:** None (foundation unit)

**TDD Steps:**
- 2.1a: Write tests for validation utilities
- 2.1b: Implement validation constants and functions
- 2.1c: Verify tests pass, check coverage

---

### Unit 2.2: Recipe Create Validation

**What it covers:**
- Add field validation to `recipes.new.tsx` action
- Return user-friendly error messages
- Add client-side validation attributes for UX

**Files to modify:**
- `app/routes/recipes.new.tsx`

**Acceptance Criteria:**
- [ ] Title validation:
  - Required (already done)
  - Max 200 characters
  - Error: "Title must be 200 characters or less"
- [ ] Description validation:
  - Optional
  - Max 2000 characters
  - Error: "Description must be 2,000 characters or less"
- [ ] Servings validation:
  - Optional
  - Max 100 characters
  - Error: "Servings must be 100 characters or less"
- [ ] imageUrl validation:
  - Optional
  - Valid URL format if provided
  - Error: "Please enter a valid URL"
- [ ] All validation errors display to user
- [ ] Form shows character counts or limits in UI
- [ ] Tests cover all validation scenarios

**Dependencies:** Unit 2.1 (uses validation utilities)

**TDD Steps:**
- 2.2a: Write tests for recipe create validation (valid/invalid cases)
- 2.2b: Implement validation in action, update form UI
- 2.2c: Verify tests pass, manual testing

---

### Unit 2.3: Recipe Edit Validation

**What it covers:**
- Add field validation to `recipes.$id.edit.tsx` action
- Same validation rules as create
- Return user-friendly error messages

**Files to modify:**
- `app/routes/recipes.$id.edit.tsx`

**Acceptance Criteria:**
- [ ] Same validation rules as Unit 2.2 (recipe create)
- [ ] Validation applies to `intent=updateRecipe` action
- [ ] Errors displayed in form
- [ ] Tests cover all validation scenarios

**Dependencies:** Unit 2.1 (uses validation utilities)

**TDD Steps:**
- 2.3a: Write tests for recipe edit validation
- 2.3b: Implement validation in action
- 2.3c: Verify tests pass

---

### Unit 2.4: Step Create Validation

**What it covers:**
- Add field validation to `recipes.$id.steps.new.tsx` action
- Validate step title and description

**Files to modify:**
- `app/routes/recipes.$id.steps.new.tsx`

**Acceptance Criteria:**
- [ ] stepTitle validation:
  - Optional
  - Max 200 characters
  - Error: "Step title must be 200 characters or less"
- [ ] description validation:
  - Required (already done)
  - Max 5000 characters
  - Error: "Description must be 5,000 characters or less"
- [ ] Errors displayed in form
- [ ] Tests cover all validation scenarios

**Dependencies:** Unit 2.1 (uses validation utilities)

**TDD Steps:**
- 2.4a: Write tests for step create validation
- 2.4b: Implement validation in action
- 2.4c: Verify tests pass

---

### Unit 2.5: Step Edit Validation

**What it covers:**
- Add field validation to `recipes.$id.steps.$stepId.edit.tsx` action for step updates
- Validate step title and description on `intent=updateStep`

**Files to modify:**
- `app/routes/recipes.$id.steps.$stepId.edit.tsx`

**Acceptance Criteria:**
- [ ] Same validation rules as Unit 2.4 (step create)
- [ ] Validation applies to `intent=updateStep` action
- [ ] Errors displayed in form
- [ ] Tests cover all validation scenarios

**Dependencies:** Unit 2.1 (uses validation utilities)

**TDD Steps:**
- 2.5a: Write tests for step edit validation
- 2.5b: Implement validation in action
- 2.5c: Verify tests pass

---

### Unit 2.6: Ingredient Add Validation

**What it covers:**
- Add field validation to ingredient add in `recipes.$id.steps.$stepId.edit.tsx`
- Validate quantity, unit name, and ingredient name

**Files to modify:**
- `app/routes/recipes.$id.steps.$stepId.edit.tsx`

**Acceptance Criteria:**
- [ ] quantity validation:
  - Required
  - Must be a valid number
  - Min 0.001, Max 99999
  - Error: "Quantity must be between 0.001 and 99,999"
- [ ] unitName validation:
  - Required
  - Max 50 characters
  - Error: "Unit name must be 50 characters or less"
- [ ] ingredientName validation:
  - Required
  - Max 100 characters
  - Error: "Ingredient name must be 100 characters or less"
- [ ] Handle NaN from parseFloat gracefully
- [ ] Errors displayed in form
- [ ] Tests cover all validation scenarios (including NaN, negative, zero)

**Dependencies:** Unit 2.1 (uses validation utilities)

**TDD Steps:**
- 2.6a: Write tests for ingredient validation (edge cases: NaN, negative, zero, bounds)
- 2.6b: Implement validation in action
- 2.6c: Verify tests pass

---

### Unit 2.7: Validation Error Display Component

**What it covers:**
- Create/use consistent error display pattern across all forms
- Use existing `alert.tsx` component or create validation-specific styling

**Files to modify:**
- All recipe route files (to use consistent error display)

**Acceptance Criteria:**
- [ ] Consistent error styling across all forms
- [ ] Field-level errors displayed near the field
- [ ] Form-level errors displayed at top of form
- [ ] Accessible error messaging (aria attributes)
- [ ] Visual tests or manual verification

**Dependencies:** Units 2.2-2.6 (builds on validation implementation)

**TDD Steps:**
- 2.7a: Define error display patterns, write any component tests
- 2.7b: Update all forms to use consistent error display
- 2.7c: Manual visual verification

---

### Unit 2.8: Client-Side Validation Attributes

**What it covers:**
- Add HTML5 validation attributes to forms for immediate client feedback
- Add maxLength, min, max, pattern attributes where applicable

**Files to modify:**
- All recipe form routes

**Acceptance Criteria:**
- [ ] All text inputs have appropriate `maxLength` attributes
- [ ] Quantity inputs have `min` and `max` attributes
- [ ] URL inputs have proper `type="url"`
- [ ] Required fields have `required` attribute
- [ ] Client validation matches server validation
- [ ] Tests verify attributes are present

**Dependencies:** Units 2.2-2.6 (attributes match server validation)

**TDD Steps:**
- 2.8a: Write tests verifying form attributes
- 2.8b: Add attributes to all form fields
- 2.8c: Verify tests pass, manual testing

---

### Unit 2.9: UI/CSS Migration

**What it covers:**
- Migrate inline styles to Tailwind CSS classes
- Replace inline-styled elements with existing UI components from `app/components/ui/`
- Ensure visual consistency across all recipe CRUD routes

**Files to modify:**
- `app/routes/recipes.tsx` (~100+ lines of inline styles)
- `app/routes/recipes._index.tsx` (~80+ lines of inline styles)
- `app/routes/recipes.new.tsx` (~100+ lines of inline styles)
- `app/routes/recipes.$id.tsx` (~120+ lines of inline styles)
- `app/routes/recipes.$id.edit.tsx` (~180+ lines of inline styles)
- `app/routes/recipes.$id.steps.new.tsx` (~80+ lines of inline styles)
- `app/routes/recipes.$id.steps.$stepId.edit.tsx` (~200+ lines of inline styles)

**UI Components to use (from app/components/ui/):**
- `button.tsx` - Replace inline button styles
- `input.tsx` - Replace inline input styles
- `textarea.tsx` - Replace inline textarea styles
- `link.tsx` - Replace inline link styles
- `heading.tsx` - Replace inline h1/h2/h3 styles
- `text.tsx` - Replace inline paragraph styles
- `alert.tsx` - Use for error messages
- `fieldset.tsx` - Use for form structure
- `badge.tsx` - Consider for servings display

**Acceptance Criteria:**
- [ ] No `style={{}}` inline styles remain in recipe routes
- [ ] All buttons use `Button` component from `app/components/ui/button.tsx`
- [ ] All text inputs use `Input` component from `app/components/ui/input.tsx`
- [ ] All textareas use `Textarea` component from `app/components/ui/textarea.tsx`
- [ ] All links use `Link` component or Tailwind-styled anchors
- [ ] All headings use `Heading` component or Tailwind classes
- [ ] Error messages use `Alert` component
- [ ] Forms use `Fieldset` component for structure where appropriate
- [ ] Visual appearance is consistent and professional
- [ ] No regressions in functionality
- [ ] Existing tests still pass

**Dependencies:** Unit 2.7 (error display patterns established)

**TDD Steps:**
- 2.9a: Write/update component render tests to verify UI component usage
- 2.9b: Migrate each route file from inline styles to Tailwind/UI components
- 2.9c: Verify tests pass, manual visual verification

---

### Unit 2.10: Duplicate Ingredient Detection

**What it covers:**
- Add validation to prevent adding the same ingredient twice to a step
- Provide user-friendly error message when duplicate detected
- Check is case-insensitive (since ingredient names are lowercased)

**Files to modify:**
- `app/routes/recipes.$id.steps.$stepId.edit.tsx`
- `app/lib/validation.ts` (add helper function)

**Acceptance Criteria:**
- [ ] When adding an ingredient, check if ingredient with same name already exists on step
- [ ] Comparison is case-insensitive
- [ ] Error returned: "This ingredient is already added to this step"
- [ ] Error displayed in the add ingredient form area
- [ ] Existing ingredient list remains visible during error
- [ ] User can still add a different ingredient after seeing error
- [ ] Tests cover:
  - Adding duplicate ingredient (exact match)
  - Adding duplicate ingredient (different case)
  - Adding unique ingredient after failed duplicate attempt
  - Multiple ingredients on step, adding duplicate of one

**Dependencies:** Unit 2.6 (ingredient add validation infrastructure)

**TDD Steps:**
- 2.10a: Write tests for duplicate ingredient detection scenarios
- 2.10b: Implement duplicate check in action, add error handling
- 2.10c: Verify tests pass, manual testing

---

### Implementation Order

```
Unit 2.1 (foundation)
    │
    ├──► Unit 2.2 (recipe create)
    ├──► Unit 2.3 (recipe edit)
    ├──► Unit 2.4 (step create)
    ├──► Unit 2.5 (step edit)
    └──► Unit 2.6 (ingredient add) ──► Unit 2.10 (duplicate ingredient)
              │
              ▼
         Unit 2.7 (error display) ──► Unit 2.8 (client attributes)
                                            │
                                            ▼
                                      Unit 2.9 (UI/CSS migration)
```

Units 2.2-2.6 can be done in parallel after 2.1 is complete.
Units 2.7 and 2.8 are polish units that build on the core validation.
Unit 2.9 (UI/CSS migration) should be done after error display patterns are established.
Unit 2.10 (duplicate ingredient) can be done after ingredient validation infrastructure exists.

---

### Summary

| Unit | Name | Scope | Depends On |
|------|------|-------|------------|
| 2.1 | Validation Constants & Utilities | Foundation | None |
| 2.2 | Recipe Create Validation | recipes.new.tsx | 2.1 |
| 2.3 | Recipe Edit Validation | recipes.$id.edit.tsx | 2.1 |
| 2.4 | Step Create Validation | recipes.$id.steps.new.tsx | 2.1 |
| 2.5 | Step Edit Validation | recipes.$id.steps.$stepId.edit.tsx | 2.1 |
| 2.6 | Ingredient Add Validation | recipes.$id.steps.$stepId.edit.tsx | 2.1 |
| 2.7 | Validation Error Display | All routes | 2.2-2.6 |
| 2.8 | Client-Side Validation Attributes | All routes | 2.2-2.6 |
| 2.9 | UI/CSS Migration | All recipe routes | 2.7 |
| 2.10 | Duplicate Ingredient Detection | recipes.$id.steps.$stepId.edit.tsx | 2.6 |

**Total: 10 units, 30 TDD sub-steps (10×3)**
