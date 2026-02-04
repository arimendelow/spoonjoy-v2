import { test as setup, expect } from '@playwright/test';

const authFile = './e2e/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Go to login page
  await page.goto('/login');
  
  // Fill in credentials (demo user from seed data)
  // Use first() because responsive layouts duplicate form fields
  await page.getByLabel('Email').first().fill('demo@spoonjoy.com');
  await page.getByLabel('Password').first().fill('demo1234');
  
  // Click login button
  await page.getByRole('button', { name: /log in/i }).first().click();
  
  // Wait for redirect to recipes page
  await page.waitForURL('/recipes');
  
  // Verify we're logged in (use first() for responsive layouts)
  await expect(page.getByText(/welcome back/i).first()).toBeVisible();
  
  // Save storage state
  await page.context().storageState({ path: authFile });
});
