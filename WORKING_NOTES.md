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
