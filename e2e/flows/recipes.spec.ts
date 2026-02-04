import { test, expect } from '@playwright/test';

test.describe('Recipe Flow', () => {
  test('recipes page shows recipe cards', async ({ page }) => {
    await page.goto('/recipes');
    
    // Should show recipe grid
    const recipeCards = page.locator('[data-testid="recipe-card"]').or(
      page.locator('img[alt*="Pizza"], img[alt*="Stir-Fry"], img[alt*="Guacamole"]')
    );
    
    // At least one recipe should be visible
    await expect(recipeCards.first()).toBeVisible();
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
    
    // Should show recipe title
    await expect(page.getByText('Classic Margherita Pizza').first()).toBeVisible();
    
    // Should show steps or step-related content
    const stepsContent = page.getByText(/step|make the dough|prepare/i).first();
    await expect(stepsContent).toBeVisible();
    
    // Should show ingredients or ingredient-related content
    const ingredientsContent = page.getByText(/ingredient|flour|tomato|mozzarella/i).first();
    await expect(ingredientsContent).toBeVisible();
  });
});
