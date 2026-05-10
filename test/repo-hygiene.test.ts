import { execFileSync } from "node:child_process";
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
