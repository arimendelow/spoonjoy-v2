# Spoonjoy v2 - Complete Implementation Plan

## Current Status
- ✅ Project setup (React Router v7, Cloudflare, TypeScript)
- ✅ Prisma schema (all models defined)
- ✅ Database adapter (D1/SQLite)
- ⏳ Authentication (login/signup routes exist, needs completion)

## Execution Phases

### Phase 1: Complete Authentication System ⏳
**Current:** login/signup routes exist but incomplete
**Tasks:**
- [ ] Add error display to signup.tsx
- [ ] Make home.tsx protected with user info display
- [ ] Create logout route
- [ ] Add navigation/layout component
- [ ] Test complete auth flow

**Estimated time:** 30 min
**Claude Code Session:** auth-completion

---

### Phase 2: Recipe CRUD Operations
**Tasks:**
- [ ] Create /recipes route (list all user's recipes)
- [ ] Create /recipes/new route (create recipe form)
- [ ] Create /recipes/:id route (view single recipe)
- [ ] Create /recipes/:id/edit route (edit recipe)
- [ ] Add delete functionality
- [ ] Add recipe search/filter
- [ ] Add pagination

**Key features:**
- Title, description, servings, imageUrl (placeholder initially)
- Soft delete (deletedAt field)
- Recipe ownership (chefId)

**Estimated time:** 2-3 hours
**Claude Code Session:** recipe-crud

---

### Phase 3: Recipe Steps & Ingredients
**Tasks:**
- [ ] Create step management UI in recipe editor
- [ ] Add/remove/reorder steps
- [ ] Step titles and descriptions
- [ ] Ingredient selector for each step
- [ ] Quantity and unit inputs
- [ ] IngredientRef and Unit management (autocomplete)
- [ ] StepOutputUse (steps can reference other steps)

**Database models used:**
- RecipeStep (stepNum, stepTitle, description)
- Ingredient (quantity, unit, ingredientRef)
- IngredientRef (name library)
- Unit (name library)
- StepOutputUse (cross-step references)

**Estimated time:** 3-4 hours
**Claude Code Session:** recipe-steps-ingredients

---

### Phase 4: Image Upload
**Tasks:**
- [ ] Set up Cloudflare R2 bucket OR configure Cloudinary
- [ ] Create image upload component
- [ ] Add to recipe create/edit forms
- [ ] Handle image URLs in recipe model
- [ ] Add image preview
- [ ] Optimize image sizes

**Options:**
- Cloudflare R2 (native integration)
- Cloudinary (existing env vars in .env.example)

**Estimated time:** 1-2 hours
**Claude Code Session:** image-upload

---

### Phase 5: Cookbooks
**Tasks:**
- [ ] Create /cookbooks route (list user's cookbooks)
- [ ] Create /cookbooks/new route (create cookbook)
- [ ] Create /cookbooks/:id route (view cookbook with recipes)
- [ ] Add/remove recipes from cookbook
- [ ] Edit cookbook title
- [ ] Delete cookbook
- [ ] Browse recipes to add to cookbook

**Database models:**
- Cookbook (title, authorId)
- RecipeInCookbook (join table with addedBy)

**Estimated time:** 2-3 hours
**Claude Code Session:** cookbooks

---

### Phase 6: Shopping List
**Tasks:**
- [ ] Create /shopping-list route
- [ ] Display current shopping list items
- [ ] Add custom items manually
- [ ] Add all ingredients from a recipe
- [ ] Group by ingredient (aggregate quantities)
- [ ] Check off items
- [ ] Clear completed items
- [ ] Clear all items

**Database models:**
- ShoppingList (one per user)
- ShoppingListItem (quantity, unit, ingredientRef)

**Estimated time:** 2-3 hours
**Claude Code Session:** shopping-list

---

### Phase 7: Recipe Sharing & Forking
**Tasks:**
- [ ] Add public/private toggle to recipes
- [ ] Create /discover route (browse public recipes)
- [ ] Add "Fork Recipe" functionality
- [ ] Track sourceRecipeId and sourceUrl
- [ ] Display recipe lineage/attribution
- [ ] Add recipe search across all public recipes

**Database models:**
- Recipe.sourceRecipeId (FK to Recipe)
- Recipe.sourceUrl (for external sources)

**Estimated time:** 2-3 hours
**Claude Code Session:** recipe-sharing

---

### Phase 8: UI/UX Polish
**Tasks:**
- [ ] Install & configure Tailwind CSS
- [ ] Create design system (colors, spacing, typography)
- [ ] Create reusable components (Button, Input, Card, etc.)
- [ ] Refactor all routes to use Tailwind
- [ ] Add loading states
- [ ] Add empty states
- [ ] Improve form UX
- [ ] Add toast notifications
- [ ] Mobile responsive design
- [ ] Add icons (heroicons or lucide-react)

**Estimated time:** 3-4 hours
**Claude Code Session:** ui-polish

---

### Phase 9: OAuth Integration (Optional)
**Tasks:**
- [ ] Set up Google OAuth
- [ ] Create OAuth callback routes
- [ ] Link OAuth accounts to existing users
- [ ] Allow OAuth-only users (no password)

**Database models:**
- OAuth (provider, providerUserId, userId)

**Estimated time:** 2-3 hours
**Claude Code Session:** oauth

---

### Phase 10: Mobile App (Expo)
**Tasks:**
- [ ] Create new Expo project in /mobile
- [ ] Set up React Navigation
- [ ] Create API client to spoonjoy-v2
- [ ] Implement auth flow
- [ ] Recipe browsing screens
- [ ] Recipe detail screen
- [ ] Shopping list screen
- [ ] Configure for iOS/Android builds

**Estimated time:** 4-6 hours
**Claude Code Sessions:** mobile-setup, mobile-features

---

### Phase 11: MCP Integration
**Tasks:**
- [ ] Create MCP server package
- [ ] Define recipe management tools:
  - get_recipes
  - create_recipe
  - get_recipe
  - update_recipe
  - delete_recipe
  - add_to_cookbook
  - add_to_shopping_list
- [ ] Add to Claude Desktop config
- [ ] Test integration
- [ ] Document usage

**Estimated time:** 2-3 hours
**Claude Code Session:** mcp-integration

---

### Phase 12: Deployment & Production
**Tasks:**
- [ ] Set up Cloudflare D1 database (production)
- [ ] Run migrations on production DB
- [ ] Configure environment variables in Cloudflare
- [ ] Deploy to Cloudflare Pages
- [ ] Set up custom domain
- [ ] Configure CORS for mobile app
- [ ] Set up monitoring/logging
- [ ] Test production deployment

**Estimated time:** 1-2 hours
**Claude Code Session:** deployment

---

## Total Estimated Time
**Minimum:** ~25 hours
**Maximum:** ~35 hours

## Execution Strategy
1. Run each phase as a separate Claude Code session
2. Test after each phase before moving to next
3. Commit to git after each successful phase
4. Document any deviations or issues
5. Notify via `clawdbot gateway wake` after each major phase

## Priority Order
1. Auth (Phase 1) - **CRITICAL** - blocks all other features
2. Recipe CRUD (Phase 2) - **HIGH** - core functionality
3. Steps & Ingredients (Phase 3) - **HIGH** - core functionality
4. Cookbooks (Phase 5) - **MEDIUM** - important feature
5. Shopping List (Phase 6) - **MEDIUM** - important feature
6. UI Polish (Phase 8) - **MEDIUM** - user experience
7. Image Upload (Phase 4) - **LOW** - can use placeholder URLs
8. Recipe Sharing (Phase 7) - **LOW** - future enhancement
9. OAuth (Phase 9) - **LOW** - optional feature
10. Mobile App (Phase 10) - **LOW** - separate project
11. MCP (Phase 11) - **LOW** - advanced integration
12. Deployment (Phase 12) - **FINAL** - after all features work

## Starting Now
Beginning with Phase 1: Complete Authentication System
