import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const GENERATED_ARTIFACT_PATHS = [
  "coverage/",
  "build/",
  "playwright-report/",
  "test-results/",
  "storybook-static/",
  ".react-router/",
];

function gitLines(args: string[]) {
  const output = execFileSync("git", args, { encoding: "utf8" }).trim();
  return output ? output.split("\n") : [];
}

describe("generated artifact hygiene", () => {
  it("does not track generated local artifact directories", () => {
    expect(gitLines(["ls-files", ...GENERATED_ARTIFACT_PATHS])).toEqual([]);
  });

  it("keeps generated local artifact directories ignored", () => {
    for (const artifactPath of GENERATED_ARTIFACT_PATHS) {
      expect(() => execFileSync("git", ["check-ignore", "-q", artifactPath])).not.toThrow();
    }
  });
});

describe("UI audit tooling", () => {
  it("keeps the UI audit inventory and crawl scripts in the repo", () => {
    expect(existsSync("scripts/inventory-ui.mjs")).toBe(true);
    expect(existsSync("scripts/crawl-ui.mjs")).toBe(true);
  });

  it("documents repo-local UI audit commands instead of local skill paths", () => {
    const report = readFileSync("docs/ui-systems-audit-report.md", "utf8");

    expect(report).toContain("node scripts/inventory-ui.mjs");
    expect(report).toContain("node scripts/crawl-ui.mjs");
    expect(report).not.toContain("/Users/arimendelow/.codex/skills/ui-systems-audit/scripts");
  });
});
