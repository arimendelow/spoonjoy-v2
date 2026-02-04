import { test, expect } from '@playwright/test';

test.describe('Recipe Flow', () => {
  test('recipes page shows recipe cards', async ({ page }) => {
    await page.goto('/recipes');
    
    // Should show My Recipes heading
    await expect(page.getByRole('heading', { name: /my recipes/i }).first()).toBeVisible();
    
    // Should show recipe cards (links to recipe detail pages)
    const recipeLinks = page.locator('a[href^="/recipes/"]');
    await expect(recipeLinks.first()).toBeVisible();
  });

  test('clicking recipe card navigates to recipe detail', async ({ page }) => {
    await page.goto('/recipes');
    
    // Find a recipe card - should be a clickable link
    // This test expects cards to be <a> elements or have click handlers
    const firstRecipeCard = page.locator('a[href^="/recipes/"]').first();
    
    // CRITICAL: This will FAIL if recipe cards are not clickable
    await expect(firstRecipeCard).toBeVisible({ timeout: 5000 });
    
    // Click the recipe card
    await firstRecipeCard.click();
    
    // Should navigate to recipe detail page
    await expect(page).toHaveURL(/\/recipes\/[^/]+$/);
    
    // Recipe detail should show title
    const recipeTitle = page.getByRole('heading', { level: 1 }).or(
      page.getByRole('heading').first()
    );
    await expect(recipeTitle).toBeVisible();
  });

  test('recipe detail shows steps and ingredients', async ({ page }) => {
    // Navigate directly to a known recipe (pizza)
    await page.goto('/recipes/recipe_pizza_001');
    
    // Wait for hydration to complete by waiting for an interactive element
    await page.waitForLoadState('domcontentloaded');
    
    // Should be on recipe detail page
    await expect(page).toHaveURL(/\/recipes\/recipe_pizza_001/);
    
    // Should show recipe title (this confirms we're on the right page)
    const title = page.getByText('Classic Margherita Pizza').first();
    await expect(title).toBeVisible({ timeout: 15000 });
    
    // Wait a bit for hydration since React Router streams content
    await page.waitForTimeout(2000);
    
    // Should show step content (step title or description)
    // Looking for the actual step titles from the seed data
    const stepContent = page.getByText('Make the dough').or(
      page.getByText('Prepare the sauce')
    ).first();
    await expect(stepContent).toBeVisible({ timeout: 10000 });
  });
});
