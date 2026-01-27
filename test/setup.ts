import "@testing-library/jest-dom";
import { vi, beforeAll } from "vitest";
import { db } from "~/lib/db.server";

// Mock ResizeObserver for HeadlessUI virtual components
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = MockResizeObserver;

// Mock environment variables
process.env.DATABASE_URL = "file:./test.db?connection_limit=1&socket_timeout=60";
process.env.SESSION_SECRET = "test-secret";

// Mock Cloudflare context
global.cloudflare = {
  env: {},
  cf: {},
  ctx: {
    waitUntil: vi.fn(),
    passThroughOnException: vi.fn(),
  },
} as any;

// Clean database before all tests
beforeAll(async () => {
  // Delete all data in the correct order to respect foreign key constraints
  await db.shoppingListItem.deleteMany({});
  await db.shoppingList.deleteMany({});
  await db.ingredient.deleteMany({});
  await db.recipeStep.deleteMany({});
  await db.recipeInCookbook.deleteMany({});
  await db.cookbook.deleteMany({});
  await db.recipe.deleteMany({});
  await db.ingredientRef.deleteMany({});
  await db.unit.deleteMany({});
  await db.userCredential.deleteMany({});
  await db.oAuth.deleteMany({});
  await db.user.deleteMany({});
});
