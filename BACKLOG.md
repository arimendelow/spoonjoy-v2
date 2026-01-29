# Spoonjoy v2 Backlog

> **Philosophy:** Food is love. No recipe is private — open platform, no login required to view recipes.

---

## 🔴 Core Features (High Priority — Pre/At Deployment)

### Friendly Ingredient Input
**Status:** Not started  
**Priority:** CORE

AI-powered ingredient parsing from free-text to structured data.

- [ ] Reference old Spoonjoy implementation (`~/Projects/spoonjoy`) for per-ingredient AI input
- [ ] Iterate and build in isolation using Storybook
- [ ] Can be more creative/lower friction now that AI has improved
- [ ] Design for natural language input (e.g., "2 cups flour, sifted" → structured data)

---

### Recipe View Design
**Status:** Not started  
**Priority:** CORE

Design the full recipe display layout — this is the primary UX surface.

- [ ] Build in Storybook for rapid iteration
- [ ] Showcase steps, ingredients, stepOutputUse relationships
- [ ] Consider mobile-first design
- [ ] Include recipe scaling UI (see below)

---

### Step Reordering
**Status:** Not started  
**Priority:** CORE

Must be iOS-level smooth interactions — critical UX element.

- [ ] Drag-and-drop with fluid animations
- [ ] Handle step dependencies gracefully
- [ ] Visual feedback during reorder
- [ ] Touch-friendly hit targets

---

### Recipe Scaling
**Status:** Not started  
**Priority:** CORE

Simply multiply ingredient quantities — part of recipe view design.

- [ ] Scaling factor selector (0.5x, 1x, 2x, custom)
- [ ] Update all ingredient quantities dynamically
- [ ] Handle fractional amounts gracefully
- [ ] Integrate into Recipe View Design

---

## 🟡 Post-Deployment Features

### Recipe Import from Websites
**Status:** Not started  
**Priority:** Medium

Import recipes from any URL.

- [ ] Reference old Spoonjoy's solution (`~/Projects/spoonjoy`)
- [ ] Iterate and improve on that approach
- [ ] Handle common recipe schema formats
- [ ] AI-powered extraction for non-standard pages

---

### Drafts Support
**Status:** Not started  
**Priority:** Medium

Allow draft/private recipes before publishing.

- [ ] Draft state for work-in-progress recipes
- [ ] Only visible to author until published
- [ ] Easy publish flow when ready
- [ ] Note: All published recipes remain public (open platform philosophy)

---

## 🟢 Backlog (Lower Priority / Future)

### Timer Integration
**Status:** Not started  
**Priority:** Low

- [ ] Approach TBD — needs more thought on UX
- [ ] Consider system notifications vs in-app timers
- [ ] Multiple concurrent timers for complex recipes?

---

### Ingredient Substitutions
**Status:** Not started  
**Priority:** Low

AI-powered suggestions for ingredient swaps.

- [ ] Requires schema change
- [ ] Common substitutions (dietary, availability)
- [ ] AI suggestions based on context

---

### Nutrition Information
**Status:** Not started  
**Priority:** Low (NOT a Spoonjoy priority)

- [ ] Will be handled by MCP
- [ ] Other AI tools can use our data to provide this
- [ ] Spoonjoy exposes data, doesn't calculate

---

## Notes

- **Storybook-first development:** Core UI components should be built and iterated in Storybook before integration
- **Reference implementation:** Old Spoonjoy at `~/Projects/spoonjoy` has solutions for ingredient input and recipe import
- **AI capabilities have improved:** More creative, lower-friction solutions are now possible
