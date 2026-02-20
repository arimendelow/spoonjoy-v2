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
  
  // Wait for redirect to kitchen with recipes tab
  await page.waitForURL('/?tab=recipes');
  
  // Verify we're logged in by checking we're on the kitchen page
  await expect(page.getByRole('heading', { name: /my kitchen/i }).first()).toBeVisible();
  
  // Save storage state
  await page.context().storageState({ path: authFile });
});
