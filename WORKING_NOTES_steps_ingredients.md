# Working Notes: Steps & Ingredients (stepOutputUse)

This document tracks research, decisions, and implementation notes for the stepOutputUse feature.

---

## Task Context

- **Active Task**: `~/clawd/tasks/active-coding-steps_ingredients.md`
- **Planning Doc**: `~/clawd/tasks/planning-coding-steps_ingredients.md`

### Key Decisions from Planning

1. **UI for Editing**: Multi-select dropdown (Listbox with `multiple={true}`)
2. **UI for Following**: Checklist pattern (same as ingredients)
3. **Display Order**: Title → Step Output Uses → Description → Ingredients
4. **Validation**: Can ONLY reference PREVIOUS steps (stepNum < current)
5. **Deletion Protection**: Block step deletion if used by another step
6. **Step Reordering**: PREVENT if it would break dependencies
7. **Schema Note**: Uses composite keys (recipeId + stepNum), NOT stepId
8. **Terminology**:
   - `outputStepNum` = step producing the output (the dependency)
   - `inputStepNum` = step using that output (the current step)

---

## Unit 0.0: HeadlessUI Listbox Documentation Review

**Date**: 2026-01-28
**Status**: Complete

### Key Findings

#### 1. Enabling Multiple Selection

Add the `multiple` prop to the Listbox component:

```tsx
<Listbox value={selectedItems} onChange={setSelectedItems} multiple>
```

**Current codebase issue**: `app/components/ui/listbox.tsx` has `multiple={false}` hardcoded on line 22. This needs to be made configurable in Unit 2.0.

#### 2. Value Structure: Single vs Multiple

| Mode | Value Type | Example |
|------|------------|---------|
| Single | `T` | `{ id: 1, name: 'Step 1' }` |
| Multiple | `T[]` | `[{ id: 1, name: 'Step 1' }, { id: 2, name: 'Step 2' }]` |

The `onChange` handler receives:
- **Single**: The selected item
- **Multiple**: The complete array of all selected items (not just the changed one)

#### 3. Rendering Selected Items

For multiple selection, map and join the selected items:

```tsx
<ListboxButton>
  {selectedPeople.map((person) => person.name).join(', ')}
</ListboxButton>
```

The `ListboxSelectedOption` component:
- Receives `options` prop (all available ListboxOption elements)
- Receives `placeholder` prop (shown when nothing selected)
- Automatically filters and displays selected items
- For multiple selection, displays comma-separated values

#### 4. Form Integration

With the `name` prop, hidden inputs are created automatically:

**Single selection:**
```html
<input type="hidden" name="step" value="1" />
```

**Multiple selection with objects:**
```html
<input type="hidden" name="steps[0][id]" value="1" />
<input type="hidden" name="steps[0][stepNum]" value="1" />
<input type="hidden" name="steps[1][id]" value="2" />
<input type="hidden" name="steps[1][stepNum]" value="2" />
```

**For stepOutputUse**: We likely want just the step numbers, so value should be the stepNum directly or use a simpler structure.

#### 5. UX Behavior Difference

- **Single selection**: Listbox closes after selecting an option
- **Multiple selection**: Listbox stays open, selecting toggles items in place

This is ideal for our use case where users may want to select multiple previous steps.

#### 6. TypeScript Considerations for Unit 2.0

The current Listbox component type signature:

```tsx
Omit<Headless.ListboxProps<typeof Fragment, T>, 'as' | 'multiple'>
```

For Unit 2.0, we need to:
1. Remove `'multiple'` from the Omit
2. Add `multiple?: boolean` to props
3. Handle the value type being `T | T[]` depending on mode
4. Update ListboxSelectedOption rendering for multiple items

### Implications for stepOutputUse Implementation

1. **Listbox modification (Unit 2.0)**: Add optional `multiple` prop, pass through to HeadlessUI
2. **Value structure**: Use simple stepNum values, not full step objects
3. **Display format**: "Step 1: Title, Step 2: Title" (comma-separated)
4. **Form submission**: Will create hidden inputs like `usesSteps[0]`, `usesSteps[1]`, etc.

### Open Questions for Later Units

- Should we display "(no title)" or just "Step X" when a step has no title?
- Review Redwood implementation in Unit 0.2 for display format decisions

---

## Unit 0.2: Redwood Spoonjoy Reference Review

**Date**: 2026-01-28
**Status**: Complete

### Overview

Reviewed the original Redwood implementation at `~/Projects/spoonjoy/` to understand step display patterns and cross-step reference handling.

### Key Files in Redwood Implementation

| File | Purpose |
|------|---------|
| `web/src/components/Recipe/RecipeComponent/Recipe.tsx` | Main step rendering |
| `web/src/components/IngredientsItemsList/IngredientsItemsList.tsx` | Ingredient & dependency display |
| `web/src/components/Recipe/RecipeForm/StepFormFrag.tsx` | Step form container |
| `web/src/components/Recipe/RecipeForm/StepOutputUsesFormFrag.tsx` | Cross-step dependency selector |
| `web/src/stores/ListItemsStore.ts` | Ingredient selection state |
| `api/db/schema.prisma` | Database schema with StepOutputUse model |

### Step Display Pattern

**Sequential rendering** - Each step renders one after another on the page:

```
Header Banner (image + recipe title/description)
  ↓
Scale Factor & Clear Progress buttons
  ↓
For each step:
  - Step separator dots (only between steps, not before step 1)
  - Step title: "step 1: [optional title]"
  - Ingredients grid
  - Step output uses list (if any)
  - Instructions paragraph
```

**No "show all steps together" pattern exists** - steps are always displayed sequentially, all expanded, no collapsible sections or comparison views.

### Cross-Step Reference Patterns (StepOutputUse)

**Database Model:**
```prisma
model StepOutputUse {
  id            String     @id
  recipeId      String
  outputStepNum Int        // Which step's output is being used
  outputOfStep  RecipeStep // Reference to source step
  inputStepNum  Int        // Which step is doing the using
  inputOfStep   RecipeStep // Reference to consuming step
}
```

**How It Works:**
- Step 2 can declare it uses the output from Step 1 via `stepOutputUses`
- Step 3 can use outputs from Step 1 and/or Step 2
- Only steps after the first can declare step output uses

**Validation Rule:**
Each step must have either ingredients OR stepOutputUses (at least one).

### UI Patterns for Step Ingredients/Outputs

**Display (Recipe.tsx):**
- Regular ingredients shown first via `<IngredientsItemsList listType="recipeIngredients">`
- Step output dependencies shown immediately after via `<IngredientsItemsList listType="stepOutputUses">`
- Different icons: BeakerIcon for ingredients, Square2StackIcon for step outputs

**Display Formatting:**
- `getIngredientItemInfo()` formats: `[quantity] [unit] [ingredientName]` (e.g., "1.5 cups chana dal")
- `getStepOutputUseItemInfo()` formats: `output of step [stepNum]: [stepTitle]` (e.g., "output of step 2: Blended mixture")

**Selection/Checkbox State:**
- Centralized store (`ListItemsStore.ts`) for checked/unchecked state
- "Clear progress" button resets all item states
- State persists across step navigation

### Edit Form Pattern (StepOutputUsesFormFrag.tsx)

- Uses HeadlessUI Listbox component with `multiple` prop for multi-select
- Dynamically generates available step options (all previous steps)
- Only rendered if `stepNum > 1` (first step can't have step output uses)
- Manages data via React Hook Form's `useFieldArray` and `useWatch` hooks

### Example Recipe Structure

From the Israeli Hummus recipe:
```
Step 1: Cook chana dal & baking soda
  - No step dependencies
  - Ingredients: 1.5 cups chana dal, 1 tsp baking soda

Step 2: Blend in food processor
  - USES: output of step 1 (cooked chana dal)
  - Ingredients: 0.5 tbsp salt, 2 tsp citric acid, 3 cloves garlic

Step 3: Add tahini and water
  - USES: output of step 2 (blended mixture)
  - Ingredients: 16 oz tahini, 1 cup cold water
```

### Decisions Confirmed for v2 Implementation

1. **Display format**: "output of step X: [title]" - matches Redwood pattern
2. **Step title fallback**: When a step has no title, just show "output of step X" (no "(no title)" suffix)
3. **Display order within step**: Title → Step Output Uses → Description → Ingredients (as planned)
4. **Multi-select for editing**: HeadlessUI Listbox with `multiple` prop (confirmed from Unit 0.0)
5. **Checklist for following**: Same pattern as ingredients with checkbox state

### Key Difference from v2 Schema

Redwood uses `stepNum` for relationships:
```prisma
outputStepNum Int
inputStepNum  Int
```

Our v2 also uses this pattern (composite keys with recipeId + stepNum), not separate stepId. This is confirmed as the correct approach.

---

## Future Units

(Notes will be added as units are completed)
