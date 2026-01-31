// Register tsconfig-paths to resolve TypeScript path aliases in require() calls
import { register } from "tsconfig-paths";
import { fileURLToPath } from "url";
import path from "path";
import Module from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const baseUrl = path.resolve(__dirname, "..");

// Use tsconfig-paths' matchPath to resolve aliases
import { createMatchPath } from "tsconfig-paths";

const matchPath = createMatchPath(baseUrl, {
  "~/*": ["app/*"],
  "@/*": ["app/components/*"],
});

import fs from "fs";

// Patch Module._resolveFilename to handle aliases
const originalResolveFilename = (Module as any)._resolveFilename;
const extensions = [".ts", ".tsx", ".js", ".jsx", ".json"];

(Module as any)._resolveFilename = function (request: string, parent: any, isMain: boolean, options: any) {
  // Try to match the path using tsconfig-paths
  const matched = matchPath(request, undefined, undefined, extensions);
  if (matched) {
    // matchPath returns path without extension, try to find the actual file
    for (const ext of extensions) {
      const fullPath = matched + ext;
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }
    // If file exists without extension (e.g., index)
    if (fs.existsSync(matched)) {
      return matched;
    }
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

import "@testing-library/jest-dom";
import { vi, beforeAll } from "vitest";
import { mockAnimationsApi } from "jsdom-testing-mocks";
import { db } from "~/lib/db.server";

// Mock animations API for HeadlessUI components
mockAnimationsApi();

// Mock getBoundingClientRect to respect CSS classes and inline styles for touch target tests
// Happy-dom doesn't compute layout, so we need to parse dimensions from various sources
const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
Element.prototype.getBoundingClientRect = function () {
  const element = this as HTMLElement;
  const style = element.style;
  const className = element.className || '';

  // Parse pixels from style or Tailwind class
  const parsePixels = (value: string): number => {
    if (!value) return 0;
    const match = value.match(/^(\d+(?:\.\d+)?)(px)?$/);
    return match ? parseFloat(match[1]) : 0;
  };

  // Extract value from Tailwind class pattern like min-h-[44px] or h-[100px]
  const extractFromTailwind = (pattern: RegExp): number => {
    const match = className.match(pattern);
    if (match) {
      return parsePixels(match[1]);
    }
    return 0;
  };

  // Check inline styles first, then Tailwind classes
  let minHeight = parsePixels(style.minHeight) || extractFromTailwind(/min-h-\[(\d+(?:\.\d+)?px)\]/);
  let minWidth = parsePixels(style.minWidth) || extractFromTailwind(/min-w-\[(\d+(?:\.\d+)?px)\]/);
  let height = parsePixels(style.height) || extractFromTailwind(/(?:^|\s)h-\[(\d+(?:\.\d+)?px)\]/);
  let width = parsePixels(style.width) || extractFromTailwind(/(?:^|\s)w-\[(\d+(?:\.\d+)?px)\]/);

  // Return dimensions respecting min values
  return {
    width: Math.max(width, minWidth),
    height: Math.max(height, minHeight),
    top: 0,
    left: 0,
    right: Math.max(width, minWidth),
    bottom: Math.max(height, minHeight),
    x: 0,
    y: 0,
    toJSON() {
      return this;
    },
  } as DOMRect;
};

// Mock ResizeObserver for HeadlessUI virtual components
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = MockResizeObserver;

// Mock window.confirm for browser confirm dialogs in tests
// Returns true by default to allow forms to submit
global.confirm = vi.fn(() => true);

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
