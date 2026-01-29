# Working Notes: Steps & Ingredients (stepOutputUse)

This document tracks research, decisions, and implementation notes for the stepOutputUse feature.

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

## Future Units

(Notes will be added as units are completed)
