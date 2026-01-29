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

## Unit 0.3: StepOutputUse Schema Analysis

**Date**: 2026-01-28
**Status**: Complete

### Model Definition (prisma/schema.prisma:109-123)

```prisma
/// Allow a step to refer to the output of another step. AKA, in step 3, use the outputs from step 1 and 2
model StepOutputUse {
  id            String     @id @default(cuid())
  recipeId      String
  outputStepNum Int
  outputOfStep  RecipeStep @relation(name: "output", fields: [recipeId, outputStepNum], references: [recipeId, stepNum], onDelete: Cascade)
  inputStepNum  Int
  inputOfStep   RecipeStep @relation(name: "input", fields: [recipeId, inputStepNum], references: [recipeId, stepNum], onDelete: Cascade)

  updatedAt DateTime @default(now()) @updatedAt

  @@unique([recipeId, outputStepNum, inputStepNum])
  @@index([recipeId, outputStepNum, inputStepNum])
  @@index([recipeId, outputStepNum])
  @@index([recipeId, inputStepNum])
}
```

### Fields and Types

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | Primary key, auto-generated CUID |
| `recipeId` | `String` | Foreign key to Recipe (shared across both step relations) |
| `outputStepNum` | `Int` | Step number of the step **producing** the output |
| `inputStepNum` | `Int` | Step number of the step **consuming** the output |
| `updatedAt` | `DateTime` | Auto-updated timestamp |

### Relations

#### To RecipeStep (Two Relations)

The model has **two distinct relations** to RecipeStep, both using composite keys:

1. **`outputOfStep`** (relation name: `"output"`)
   - Points to the step that **produces** the output
   - Composite FK: `[recipeId, outputStepNum]` → `[recipeId, stepNum]`
   - Corresponding inverse: `RecipeStep.usedBySteps`

2. **`inputOfStep`** (relation name: `"input"`)
   - Points to the step that **uses/consumes** the output
   - Composite FK: `[recipeId, inputStepNum]` → `[recipeId, stepNum]`
   - Corresponding inverse: `RecipeStep.usingSteps`

#### RecipeStep Inverse Relations (schema.prisma:99-100)

```prisma
model RecipeStep {
  // ...
  usingSteps  StepOutputUse[] @relation("input")   // Steps THIS step uses
  usedBySteps StepOutputUse[] @relation("output")  // Steps that use THIS step's output
}
```

### Key Terminology Clarification

This is critical for understanding the data flow:

| Term | Meaning | Example |
|------|---------|---------|
| `outputStepNum` | The step that **PRODUCES** something | Step 1 cooks the dal |
| `inputStepNum` | The step that **USES** the output | Step 2 blends the cooked dal |
| `outputOfStep` | Relation to the **source/producer** step | Points to Step 1 |
| `inputOfStep` | Relation to the **consumer** step | Points to Step 2 |

**Example**: "Step 2 uses the output of Step 1"
- `recipeId`: the recipe ID
- `outputStepNum`: 1 (Step 1 is the producer)
- `inputStepNum`: 2 (Step 2 is the consumer)

### Composite Keys and Constraints

#### Unique Constraint
```prisma
@@unique([recipeId, outputStepNum, inputStepNum])
```
Ensures each (recipe, source step, consuming step) combination exists only once. A step cannot declare it uses the same step's output multiple times.

#### Indexes for Query Performance
```prisma
@@index([recipeId, outputStepNum, inputStepNum])  // Full composite lookup
@@index([recipeId, outputStepNum])                // "What steps use this step's output?"
@@index([recipeId, inputStepNum])                 // "What steps does this step depend on?"
```

### Cascade Behavior

Both relations have `onDelete: Cascade`:
- When a RecipeStep is deleted, all StepOutputUse records referencing it (as either source or consumer) are automatically deleted
- This applies whether the step is the producer OR the consumer

**Important for UI**: The planning doc says "Block step deletion if used by another step" - this is a **UI-level validation**, not enforced at the database level. The database allows cascade deletion, but the UI should warn/prevent.

### No Direct Recipe Relation

Note: There is no direct `@relation` to Recipe, only through RecipeStep. The `recipeId` field exists to form composite foreign keys but doesn't have a `recipe Recipe @relation(...)` line.

### Validation Rules (UI Level, Not Schema)

These must be enforced in application code:

1. **Forward references only**: `outputStepNum < inputStepNum` (can only reference previous steps)
2. **No self-reference**: `outputStepNum !== inputStepNum` (can't use your own output)
3. **Same recipe**: Both steps must be in the same recipe (enforced by composite key structure)

### Query Patterns

**Get all steps that Step 3 depends on:**
```ts
const dependencies = await db.stepOutputUse.findMany({
  where: { recipeId, inputStepNum: 3 },
  include: { outputOfStep: true }
});
```

**Get all steps that depend on Step 1's output:**
```ts
const dependents = await db.stepOutputUse.findMany({
  where: { recipeId, outputStepNum: 1 },
  include: { inputOfStep: true }
});
```

**Get a step with its dependencies and dependents:**
```ts
const step = await db.recipeStep.findUnique({
  where: { recipeId_stepNum: { recipeId, stepNum: 2 } },
  include: {
    usingSteps: { include: { outputOfStep: true } },   // What this step uses
    usedBySteps: { include: { inputOfStep: true } }    // What uses this step
  }
});
```

---

## Unit 1.1: Step Routes Audit

**Date**: 2026-01-28
**Status**: Complete

### Overview

Audited the existing step-related routes to identify where stepOutputUse selection UI will integrate.

### Route 1: `app/routes/recipes.$id.steps.new.tsx` (Create Step)

#### Current Loader Data Structure

```ts
return { recipe, nextStepNum };
```

| Field | Type | Description |
|-------|------|-------------|
| `recipe` | `{ id, title, chefId, deletedAt, steps: [{ stepNum }] }` | Recipe with minimal step info |
| `nextStepNum` | `number` | Calculated as `max(stepNum) + 1` or `1` if no steps |

The loader fetches:
- Recipe basic info (id, title, chefId, deletedAt)
- Steps with only `stepNum` field (ordered desc, take 1) to calculate next step number

#### Current Action Handler

**Intent**: Creates a new step (no explicit intent, just POST)

**Flow**:
1. Validates user ownership
2. Validates `stepTitle` (optional) and `description` (required)
3. Creates `RecipeStep` with `recipeId`, `stepNum`, `stepTitle`, `description`
4. Redirects to `/recipes/{id}/steps/{stepId}/edit`

**Form Fields**:
- `stepTitle` (optional, max 100 chars)
- `description` (required, max 2000 chars)

#### Where stepOutputUse UI Should Go

**Location**: Between the step number display and the description field (lines 160-178)

**Current structure**:
```
Step Number display (lines 154-158)
  ↓
Form with:
  - stepTitle field
  - description field
  - Cancel/Submit buttons
```

**Proposed structure**:
```
Step Number display
  ↓
Form with:
  - stepTitle field
  - stepOutputUse selector (NEW) <-- Only if nextStepNum > 1
  - description field
  - Cancel/Submit buttons
```

#### Loader Changes Needed

1. **Load available previous steps for selection**:
   ```ts
   const previousSteps = await database.recipeStep.findMany({
     where: { recipeId: id, recipe: { deletedAt: null } },
     select: { stepNum: true, stepTitle: true },
     orderBy: { stepNum: 'asc' },
   });
   ```

2. **Update return value**:
   ```ts
   return { recipe, nextStepNum, previousSteps };
   ```

3. **Only show selector if `nextStepNum > 1`** (first step cannot have dependencies)

#### Action Changes Needed

1. **Parse stepOutputUse selections from form data**:
   - Form will submit multiple values like `usesSteps[0]`, `usesSteps[1]`, etc.
   - Or as a comma-separated string of step numbers

2. **Create StepOutputUse records** after step creation:
   ```ts
   for (const outputStepNum of selectedStepNums) {
     await database.stepOutputUse.create({
       data: {
         recipeId: id,
         outputStepNum,
         inputStepNum: nextStepNum,
       },
     });
   }
   ```

3. **Validation**:
   - Each selected step must exist and have `stepNum < nextStepNum`
   - No duplicate selections

---

### Route 2: `app/routes/recipes.$id.steps.$stepId.edit.tsx` (Edit Step)

#### Current Loader Data Structure

```ts
return { recipe, step };
```

| Field | Type | Description |
|-------|------|-------------|
| `recipe` | `{ id, title, chefId, deletedAt }` | Recipe basic info |
| `step` | Full step with `ingredients` (including `unit` and `ingredientRef`) | Step being edited |

The loader fetches:
- Recipe basic info
- Full step via `findUnique` with `include: { ingredients: { include: { unit, ingredientRef } } }`

#### Current Action Handlers

Multiple intents handled:

| Intent | Form Field | Action |
|--------|------------|--------|
| `delete` | `intent="delete"` | Deletes the step, redirects to recipe edit |
| `addIngredient` | `intent="addIngredient"` | Creates unit (if needed), ingredientRef (if needed), ingredient |
| `deleteIngredient` | `intent="deleteIngredient"` | Deletes ingredient by ID |
| (default) | No intent | Updates stepTitle and description |

#### Where stepOutputUse UI Should Go

**Location**: Between the step title field and description field (lines 282-315)

**Current structure**:
```
stepTitle field (lines 283-295)
  ↓
description field (lines 297-315)
  ↓
Save/Cancel buttons
  ↓
Delete Step button
  ↓
Ingredients section (add/list/delete)
```

**Proposed structure**:
```
stepTitle field
  ↓
stepOutputUse selector (NEW) <-- Only if step.stepNum > 1
  ↓
description field
  ↓
Save/Cancel buttons
  ↓
Delete Step button
  ↓
Ingredients section
```

#### Loader Changes Needed

1. **Load current step's stepOutputUse relations**:
   ```ts
   const step = await database.recipeStep.findUnique({
     where: { id: stepId },
     include: {
       ingredients: { include: { unit: true, ingredientRef: true } },
       usingSteps: {  // NEW
         include: { outputOfStep: { select: { stepNum: true, stepTitle: true } } },
         orderBy: { outputStepNum: 'asc' },
       },
     },
   });
   ```

2. **Load available previous steps** (steps with `stepNum < current step's stepNum`):
   ```ts
   const previousSteps = await database.recipeStep.findMany({
     where: {
       recipeId: id,
       stepNum: { lt: step.stepNum },
     },
     select: { stepNum: true, stepTitle: true },
     orderBy: { stepNum: 'asc' },
   });
   ```

3. **Update return value**:
   ```ts
   return { recipe, step, previousSteps };
   ```

#### Action Changes Needed

1. **Add new intent `updateStepOutputUses`** (or include in default update):
   - Parse selected step numbers from form
   - Delete existing StepOutputUse records for this step (as inputStepNum)
   - Create new StepOutputUse records for selected steps

2. **Validation for step deletion** (existing `delete` intent):
   - Before deleting, check if any other step depends on this step:
     ```ts
     const dependents = await database.stepOutputUse.count({
       where: { recipeId: id, outputStepNum: step.stepNum },
     });
     if (dependents > 0) {
       return data({ errors: { general: "Cannot delete: other steps depend on this step's output" } }, { status: 400 });
     }
     ```

3. **Form field for stepOutputUse**:
   - Multi-select Listbox submitting as `usesSteps[]` or similar
   - Value format: array of step numbers

---

### Summary of Changes Needed

| Route | Loader Changes | Action Changes | UI Changes |
|-------|----------------|----------------|------------|
| `steps.new.tsx` | Add `previousSteps` query | Create StepOutputUse records after step | Add multi-select before description |
| `steps.$stepId.edit.tsx` | Add `usingSteps` to step include, add `previousSteps` query | Add delete validation, add update logic | Add multi-select before description |

### Component Dependency

Both routes will need access to a multi-select Listbox component. Per Unit 0.0, the current `app/components/ui/listbox.tsx` has `multiple={false}` hardcoded and needs modification in Unit 2.0.

### Validation Rules to Implement

1. **Forward-only references**: `outputStepNum < inputStepNum` (UI should only show previous steps)
2. **No self-reference**: Implicitly handled by only showing previous steps
3. **Deletion protection**: Check `usedBySteps` count before allowing step deletion
4. **Same recipe**: Enforced by query filters (only query steps from same recipe)

---

## Future Units

(Notes will be added as units are completed)
