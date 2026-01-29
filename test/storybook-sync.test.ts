/**
 * Storybook Sync Tests
 *
 * Verifies that Storybook stories match actual component usage in the app.
 * Stories should reflect reality for USED components - aspirational content
 * is OK for unused components.
 *
 * These tests ensure:
 * 1. All custom components have stories
 * 2. Stories exist for frequently used components
 * 3. Story files are properly structured
 */

import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

const STORIES_DIR = path.join(__dirname, "../stories");
const COMPONENTS_DIR = path.join(__dirname, "../app/components");

/**
 * Helper to check if a story file exists for a component
 */
function storyExists(componentName: string): boolean {
  const possibleNames = [
    `${componentName}.stories.tsx`,
    `${componentName}.stories.ts`,
    // Handle kebab-case to PascalCase conversion
    componentName
      .split("-")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join("") + ".stories.tsx",
  ];

  return possibleNames.some((name) =>
    fs.existsSync(path.join(STORIES_DIR, name))
  );
}

/**
 * Get all story files in the stories directory
 */
function getAllStoryFiles(): string[] {
  return fs
    .readdirSync(STORIES_DIR)
    .filter((file) => file.endsWith(".stories.tsx") || file.endsWith(".stories.ts"));
}

describe("Storybook Sync", () => {
  describe("custom components have stories", () => {
    it("SpoonjoyLogo should have a story", () => {
      // SpoonjoyLogo is a custom component used in navigation
      // It should have a dedicated story showing its variants
      expect(storyExists("SpoonjoyLogo")).toBe(true);
    });

    it("ConfirmationDialog should have a story", () => {
      // ConfirmationDialog is a custom component created for UI polish
      // It wraps Catalyst Dialog with a standard confirmation pattern
      expect(storyExists("ConfirmationDialog")).toBe(true);
    });
  });

  describe("story files exist for used components", () => {
    // Components confirmed as used per audit-components.md
    const usedComponents = [
      "Button",
      "Input",
      "Heading",
      "Text",
      "Fieldset",
      "Textarea",
      "AuthLayout",
      "Listbox",
      "OAuth",
      "Avatar",
      "ThemeToggle",
      "Link",
      "Alert",
      "Dialog",
      "Checkbox",
      "Switch",
      "ValidationError",
    ];

    usedComponents.forEach((component) => {
      it(`${component} should have a story file`, () => {
        expect(storyExists(component)).toBe(true);
      });
    });
  });

  describe("story files are properly structured", () => {
    it("all story files should export a default meta object", () => {
      const storyFiles = getAllStoryFiles();

      for (const file of storyFiles) {
        const content = fs.readFileSync(path.join(STORIES_DIR, file), "utf-8");

        // Check for default export (meta)
        expect(
          content.includes("export default"),
          `${file} should have a default export`
        ).toBe(true);

        // Check for Meta import
        expect(
          content.includes("Meta"),
          `${file} should import Meta from storybook`
        ).toBe(true);
      }
    });

    it("all story files should have at least one exported story", () => {
      const storyFiles = getAllStoryFiles();

      for (const file of storyFiles) {
        const content = fs.readFileSync(path.join(STORIES_DIR, file), "utf-8");

        // Check for at least one named export (a story)
        // Stories are typically: export const SomeName: Story = ...
        const hasNamedExport =
          content.includes("export const") ||
          content.includes("export {");

        expect(
          hasNamedExport,
          `${file} should have at least one named export (story)`
        ).toBe(true);
      }
    });

    it("story files should not have TypeScript errors in imports", () => {
      const storyFiles = getAllStoryFiles();

      for (const file of storyFiles) {
        const content = fs.readFileSync(path.join(STORIES_DIR, file), "utf-8");

        // Check that imports reference existing paths
        // Look for imports from ../app/components
        const importMatches = content.matchAll(
          /from ['"]\.\.\/app\/components\/([^'"]+)['"]/g
        );

        for (const match of importMatches) {
          const importPath = match[1];
          const fullPath = path.join(
            COMPONENTS_DIR,
            importPath.endsWith(".tsx") ? importPath : `${importPath}.tsx`
          );
          const indexPath = path.join(COMPONENTS_DIR, importPath, "index.tsx");

          const fileExists =
            fs.existsSync(fullPath) || fs.existsSync(indexPath);

          expect(
            fileExists,
            `${file} imports from ${importPath} which should exist`
          ).toBe(true);
        }
      }
    });
  });

  describe("navigation components have stories", () => {
    // Navigation components that should have stories
    const navComponents = [
      "Navbar",
      "Sidebar",
      "StackedLayout",
      "SidebarLayout",
    ];

    navComponents.forEach((component) => {
      it(`${component} should have a story file`, () => {
        expect(storyExists(component)).toBe(true);
      });
    });
  });

  describe("SpoonDock navigation components have stories", () => {
    // SpoonDock is the mobile navigation component
    const dockComponents = [
      "SpoonDock",
      "DockItem",
      "DockCenter",
      "DockContext",
      "DockIndicator",
    ];

    dockComponents.forEach((component) => {
      it(`${component} should have a story file`, () => {
        expect(storyExists(component)).toBe(true);
      });
    });
  });

  describe("story content quality", () => {
    it("SpoonjoyLogo story should show all size and variant options", () => {
      // This will fail until SpoonjoyLogo.stories.tsx is created
      const storyPath = path.join(STORIES_DIR, "SpoonjoyLogo.stories.tsx");

      expect(fs.existsSync(storyPath)).toBe(true);

      if (fs.existsSync(storyPath)) {
        const content = fs.readFileSync(storyPath, "utf-8");

        // Should document size prop
        expect(content.includes("size")).toBe(true);

        // Should document variant prop
        expect(content.includes("variant")).toBe(true);
      }
    });

    it("ConfirmationDialog story should show destructive and non-destructive variants", () => {
      // This will fail until ConfirmationDialog.stories.tsx is created
      const storyPath = path.join(STORIES_DIR, "ConfirmationDialog.stories.tsx");

      expect(fs.existsSync(storyPath)).toBe(true);

      if (fs.existsSync(storyPath)) {
        const content = fs.readFileSync(storyPath, "utf-8");

        // Should show destructive variant
        expect(content.includes("destructive")).toBe(true);

        // Should show the playful copy examples from the app
        expect(
          content.includes("shadow realm") || content.includes("Banish")
        ).toBe(true);
      }
    });
  });
});
