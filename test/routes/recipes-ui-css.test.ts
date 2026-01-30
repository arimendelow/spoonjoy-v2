import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * Unit 2.9a: UI/CSS Migration Tests
 *
 * These tests verify that all recipe CRUD components:
 * 1. Use Tailwind CSS classes instead of inline styles
 * 2. Use UI components from app/components/ui/ instead of raw HTML elements
 *
 * Tests are expected to FAIL initially (TDD approach).
 * After migration (Unit 2.9b), all tests should pass.
 */

const RECIPE_ROUTE_FILES = [
  "app/routes/recipes.tsx",
  "app/routes/recipes._index.tsx",
  "app/routes/recipes.new.tsx",
  "app/routes/recipes.$id.tsx",
  "app/routes/recipes.$id.edit.tsx",
  "app/routes/recipes.$id.steps.new.tsx",
  "app/routes/recipes.$id.steps.$stepId.edit.tsx",
];

/**
 * Reads a source file and returns its content
 */
function readSourceFile(relativePath: string): string {
  const absolutePath = resolve(process.cwd(), relativePath);
  return readFileSync(absolutePath, "utf-8");
}

/**
 * Counts occurrences of inline style patterns in source code
 * Matches: style={{ ... }} and style={...}
 */
function countInlineStyles(content: string): number {
  // Match style={{ and style={expression}
  // This regex finds style= followed by { (object literal or expression)
  const inlineStylePattern = /style=\{/g;
  const matches = content.match(inlineStylePattern);
  return matches ? matches.length : 0;
}

/**
 * Checks if file imports from app/components/ui/
 */
function hasUIComponentImports(content: string): boolean {
  // Check for imports from ~/components/ui/ or @/
  return (
    content.includes('from "~/components/ui/') ||
    content.includes("from '~/components/ui/") ||
    content.includes('from "@/') ||
    content.includes("from '@/")
  );
}

/**
 * Checks if file uses raw button elements without using Button component
 */
function usesRawButtonElements(content: string): boolean {
  // Has <button but doesn't import Button from UI
  const hasButtonElements = /<button\s/g.test(content);
  const importsButtonComponent =
    content.includes('import { Button') ||
    content.includes('import {Button') ||
    content.includes("Button }") ||
    content.includes("Button}");

  return hasButtonElements && !importsButtonComponent;
}

/**
 * Checks if file uses raw input elements without using Input component
 */
function usesRawInputElements(content: string): boolean {
  // Has <input but doesn't import Input from UI
  const hasInputElements = /<input\s/g.test(content);
  const importsInputComponent =
    content.includes('import { Input') ||
    content.includes('import {Input') ||
    content.includes("Input }") ||
    content.includes("Input}") ||
    content.includes("Input,");

  return hasInputElements && !importsInputComponent;
}

/**
 * Checks if file uses raw textarea elements without using Textarea component
 */
function usesRawTextareaElements(content: string): boolean {
  // Has <textarea but doesn't import Textarea from UI
  const hasTextareaElements = /<textarea\s/g.test(content);
  const importsTextareaComponent =
    content.includes('import { Textarea') ||
    content.includes('import {Textarea') ||
    content.includes("Textarea }") ||
    content.includes("Textarea}") ||
    content.includes("Textarea,");

  return hasTextareaElements && !importsTextareaComponent;
}

describe("Recipe Routes UI/CSS Compliance", () => {
  describe("No Inline Styles", () => {
    it.each(RECIPE_ROUTE_FILES)(
      "%s should have no inline styles (style={{}})",
      (filePath) => {
        const content = readSourceFile(filePath);
        const inlineStyleCount = countInlineStyles(content);

        expect(
          inlineStyleCount,
          `${filePath} has ${inlineStyleCount} inline style(s). ` +
          `All styling should use Tailwind CSS classes.`
        ).toBe(0);
      }
    );
  });

  describe("Uses UI Components", () => {
    it.each(RECIPE_ROUTE_FILES)(
      "%s should import from app/components/ui/",
      (filePath) => {
        const content = readSourceFile(filePath);

        expect(
          hasUIComponentImports(content),
          `${filePath} should import UI components from ~/components/ui/ or @/`
        ).toBe(true);
      }
    );
  });

  describe("Button Component Usage", () => {
    it.each(RECIPE_ROUTE_FILES)(
      "%s should use Button component instead of raw <button>",
      (filePath) => {
        const content = readSourceFile(filePath);

        expect(
          usesRawButtonElements(content),
          `${filePath} uses raw <button> elements. ` +
          `Should use Button component from app/components/ui/button.tsx`
        ).toBe(false);
      }
    );
  });

  describe("Input Component Usage", () => {
    // Filter to only files that use input elements
    const filesWithInputs = RECIPE_ROUTE_FILES.filter((filePath) => {
      const content = readSourceFile(filePath);
      return /<input\s/g.test(content);
    });

    it.each(filesWithInputs)(
      "%s should use Input component instead of raw <input>",
      (filePath) => {
        const content = readSourceFile(filePath);

        expect(
          usesRawInputElements(content),
          `${filePath} uses raw <input> elements. ` +
          `Should use Input component from app/components/ui/input.tsx`
        ).toBe(false);
      }
    );
  });

  describe("Textarea Component Usage", () => {
    // Filter to only files that use textarea elements
    const filesWithTextareas = RECIPE_ROUTE_FILES.filter((filePath) => {
      const content = readSourceFile(filePath);
      return /<textarea\s/g.test(content);
    });

    if (filesWithTextareas.length === 0) {
      it("should have no raw textarea elements (none found)", () => {
        // No files use raw textarea elements - this is the expected state
        expect(filesWithTextareas.length).toBe(0);
      });
    } else {
      it.each(filesWithTextareas)(
        "%s should use Textarea component instead of raw <textarea>",
        (filePath) => {
          const content = readSourceFile(filePath);

          expect(
            usesRawTextareaElements(content),
            `${filePath} uses raw <textarea> elements. ` +
            `Should use Textarea component from app/components/ui/textarea.tsx`
          ).toBe(false);
        }
      );
    }
  });

  describe("Summary Report", () => {
    it("should generate a summary of all CSS/UI issues", () => {
      const issues: string[] = [];

      for (const filePath of RECIPE_ROUTE_FILES) {
        const content = readSourceFile(filePath);
        const fileIssues: string[] = [];

        const inlineStyleCount = countInlineStyles(content);
        if (inlineStyleCount > 0) {
          fileIssues.push(`${inlineStyleCount} inline style(s)`);
        }

        if (!hasUIComponentImports(content)) {
          fileIssues.push("no UI component imports");
        }

        if (usesRawButtonElements(content)) {
          fileIssues.push("uses raw <button>");
        }

        if (usesRawInputElements(content)) {
          fileIssues.push("uses raw <input>");
        }

        if (usesRawTextareaElements(content)) {
          fileIssues.push("uses raw <textarea>");
        }

        if (fileIssues.length > 0) {
          issues.push(`${filePath}: ${fileIssues.join(", ")}`);
        }
      }

      // This test will fail if there are any issues, listing them all
      expect(
        issues,
        `UI/CSS Migration Issues Found:\n${issues.join("\n")}`
      ).toHaveLength(0);
    });
  });
});

describe("Individual Route Detailed Checks", () => {
  describe("recipes.tsx (Layout Route)", () => {
    const filePath = "app/routes/recipes.tsx";

    it("should not use fontFamily inline style", () => {
      const content = readSourceFile(filePath);
      expect(content).not.toMatch(/fontFamily:/);
    });

    it("should not use padding inline style", () => {
      const content = readSourceFile(filePath);
      expect(content).not.toMatch(/padding:\s*["']?\d/);
    });

    it("should not use backgroundColor inline style", () => {
      const content = readSourceFile(filePath);
      expect(content).not.toMatch(/backgroundColor:/);
    });

    it("should not use borderRadius inline style", () => {
      const content = readSourceFile(filePath);
      expect(content).not.toMatch(/borderRadius:/);
    });
  });

  describe("recipes._index.tsx (Recipe List)", () => {
    const filePath = "app/routes/recipes._index.tsx";

    it("should not use gridTemplateColumns inline style", () => {
      const content = readSourceFile(filePath);
      expect(content).not.toMatch(/gridTemplateColumns:/);
    });

    it("should not use onMouseEnter/onMouseLeave for hover styles", () => {
      const content = readSourceFile(filePath);
      expect(content).not.toMatch(/onMouseEnter.*style/);
      expect(content).not.toMatch(/onMouseLeave.*style/);
    });
  });

  describe("recipes.new.tsx (Create Recipe Form)", () => {
    const filePath = "app/routes/recipes.new.tsx";

    it("should use Fieldset for form structure", () => {
      const content = readSourceFile(filePath);
      expect(
        content.includes("Fieldset") || content.includes("fieldset"),
        "Should use Fieldset component for form structure"
      ).toBe(true);
    });

    it("should use Alert for error messages", () => {
      const content = readSourceFile(filePath);
      expect(
        content.includes("Alert") || content.includes("alert") || content.includes("ValidationError"),
        "Should use Alert or ValidationError component for error messages"
      ).toBe(true);
    });
  });

  describe("recipes.$id.tsx (Recipe Detail)", () => {
    const filePath = "app/routes/recipes.$id.tsx";

    it("should use Heading component for h1/h2", () => {
      const content = readSourceFile(filePath);
      expect(
        content.includes('from "~/components/ui/heading"') ||
        content.includes("from '~/components/ui/heading'") ||
        content.includes("Heading"),
        "Should use Heading component for headings"
      ).toBe(true);
    });

    it("should use Text component for paragraphs", () => {
      const content = readSourceFile(filePath);
      expect(
        content.includes('from "~/components/ui/text"') ||
        content.includes("from '~/components/ui/text'") ||
        content.includes("Text"),
        "Should use Text component for text content"
      ).toBe(true);
    });
  });

  describe("recipes.$id.edit.tsx (Edit Recipe Form)", () => {
    const filePath = "app/routes/recipes.$id.edit.tsx";

    it("should not have more than 0 inline styles", () => {
      const content = readSourceFile(filePath);
      const count = countInlineStyles(content);
      expect(count).toBe(0);
    });
  });

  describe("recipes.$id.steps.new.tsx (Create Step Form)", () => {
    const filePath = "app/routes/recipes.$id.steps.new.tsx";

    it("should not have more than 0 inline styles", () => {
      const content = readSourceFile(filePath);
      const count = countInlineStyles(content);
      expect(count).toBe(0);
    });
  });

  describe("recipes.$id.steps.$stepId.edit.tsx (Edit Step Form)", () => {
    const filePath = "app/routes/recipes.$id.steps.$stepId.edit.tsx";

    it("should not have more than 0 inline styles", () => {
      const content = readSourceFile(filePath);
      const count = countInlineStyles(content);
      expect(count).toBe(0);
    });
  });
});
