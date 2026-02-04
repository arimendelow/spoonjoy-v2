# E2E Test Scorecard

**Generated**: 2026-02-03 18:32 PST
**Total**: 21 tests | **Passed**: 19 | **Failed**: 2

---

## Summary by Flow

| Flow | Pass | Fail | Status |
|------|------|------|--------|
| Auth | 6 | 0 | ✅ |
| Recipes | 1 | 2 | ❌ BUGS |
| Cookbooks | 5 | 0 | ✅ |
| Shopping List | 5 | 0 | ✅ |
| Smoke Test | 1 | 0 | ✅ |
| Setup | 1 | 0 | ✅ |

---

## Real Bugs (Priority Fixes)

### 🔴 P0: Recipe Cards Not Clickable
**Test**: `clicking recipe card navigates to recipe detail`
**Error**: No `a[href^="/recipes/"]` found
**Root Cause**: `recipes.tsx` renders cards as `<div>` instead of `<Link>`
**Fix**: Wrap recipe cards with `<Link href={/recipes/${recipe.id}}>` in `app/routes/recipes.tsx`

### 🔴 P1: Recipe Detail Missing Steps/Ingredients Display
**Test**: `recipe detail shows steps and ingredients`
**Error**: Step content not visible on detail page
**Root Cause**: `recipes.$id.tsx` may not be rendering steps properly, or steps not in seed data
**Fix**: Verify recipe detail page renders `recipe.steps` with descriptions

---

## Test Results Detail

### ✅ Passing (18)

**Auth Flow (no-auth)**
- ✅ landing page has login and signup buttons
- ✅ login with valid credentials redirects to recipes
- ✅ login with invalid credentials shows error
- ✅ logout redirects to landing page
- ✅ unauthenticated access to protected route redirects to login
- ✅ signup page loads

**Cookbook Flow**
- ✅ cookbooks page loads
- ✅ cookbooks page shows cookbook cards
- ✅ clicking cookbook shows recipes in cookbook
- ✅ cookbook detail shows recipes
- ✅ can create new cookbook

**Shopping List Flow**
- ✅ shopping list page loads
- ✅ shopping list shows items or empty state
- ✅ can add item to shopping list
- ✅ can check/uncheck shopping list item
- ✅ shopping list accessible from navigation

**Recipe Flow (partial)**
- ✅ recipes page shows recipe cards

**Setup**
- ✅ authenticate

### ❌ Failing (2)

- ❌ clicking recipe card navigates to recipe detail
- ❌ recipe detail shows steps and ingredients

---

## Recommended Fix Order

1. **Recipe card links** (P0) — Unblocks core user journey
2. **Recipe detail steps** (P1) — Completes recipe viewing flow

---

## Commands

```bash
# Run all tests
pnpm test:e2e

# Run only recipe tests (to verify fixes)
pnpm test:e2e e2e/flows/recipes.spec.ts

# Run with UI for debugging
pnpm test:e2e:ui
```
