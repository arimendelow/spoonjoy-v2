import { afterEach, describe, expect, it } from "vitest";
import { vi } from "vitest";

import * as cleanup from "../../scripts/cleanup-local-qa-data.mjs";

const { buildApplySql, buildDryRunSql, wranglerLocalD1Args } = cleanup;

const originalArgv = process.argv;
const originalExitCode = process.exitCode;

function writableBuffer() {
  let text = "";
  return {
    stream: {
      write(chunk: string) {
        text += String(chunk);
      },
    },
    text: () => text,
  };
}

afterEach(() => {
  process.argv = originalArgv;
  process.exitCode = originalExitCode;
  vi.restoreAllMocks();
});

describe("cleanup-local-qa-data", () => {
  it("dry-runs the disposable Spoonjoy QA data patterns", () => {
    const sql = buildDryRunSql();

    expect(sql).toContain("lower(title) LIKE 'e2e %'");
    expect(sql).toContain("lower(title) LIKE 'mobile dock save%'");
    expect(sql).toContain("lower(title) LIKE 'codex %'");
    expect(sql).toContain("email LIKE 'codex-%'");
    expect(sql).toContain("email LIKE 'e2e-passkey-%'");
    expect(sql).toContain("clientName = 'E2E OAuth Client'");
  });

  it("soft-deletes recipes and deletes only disposable local support rows on apply", () => {
    const sql = buildApplySql();

    expect(sql).toContain("UPDATE Recipe");
    expect(sql).toContain("SET deletedAt = CURRENT_TIMESTAMP");
    expect(sql).toContain("DELETE FROM OAuthAuthCode");
    expect(sql).toContain("DELETE FROM OAuthClient");
    expect(sql).toContain("DELETE FROM UserCredential");
    expect(sql).toContain("DELETE FROM User");
    expect(sql).not.toContain("DROP TABLE");
  });

  it("builds local-only Wrangler D1 args", () => {
    const args = wranglerLocalD1Args("DB", "SELECT 1;");

    expect(args).toEqual([
      "exec",
      "wrangler",
      "d1",
      "execute",
      "DB",
      "--local",
      "--command",
      "SELECT 1;",
    ]);
    expect(args).not.toContain("--remote");
  });

  it("parses explicit local, QA, and production target environments", () => {
    expect(cleanup.parseCleanupArgs(["--target-env", "local"])).toMatchObject({
      apply: false,
      dbName: "DB",
      target: {
        targetEnv: "local",
        baseUrl: "http://localhost:5173",
        d1Target: "local D1 (--local)",
        r2Target: "local photos binding",
        destructiveScope: "local disposable test data only",
      },
    });
    expect(cleanup.parseCleanupArgs(["--target-env", "qa", "--db", "QA_DB"])).toMatchObject({
      dbName: "QA_DB",
      target: {
        targetEnv: "qa",
        baseUrl: "https://spoonjoy-v2-qa.mendelow-studio.workers.dev",
        d1Target: "QA D1 spoonjoy-qa (--remote --env qa)",
        r2Target: "QA R2 spoonjoy-photos-qa (--remote)",
        destructiveScope: "QA disposable test data only",
      },
    });
    expect(cleanup.parseCleanupArgs(["--target-env", "production"])).toMatchObject({
      target: {
        targetEnv: "production",
        baseUrl: "https://spoonjoy.app",
        d1Target: "production D1 spoonjoy (--remote)",
        r2Target: "production R2 spoonjoy-photos (--remote)",
        destructiveScope: "production read-only by default; exact smoke cleanup only",
      },
    });
  });

  it("keeps the backwards-compatible missing-target default as a local dry-run", () => {
    expect(cleanup.parseCleanupArgs([])).toMatchObject({
      apply: false,
      target: {
        targetEnv: "local",
        baseUrl: "http://localhost:5173",
      },
    });
  });

  it("can parse cleanup args from process argv by default", () => {
    process.argv = ["node", "scripts/cleanup-local-qa-data.mjs", "--target-env", "local"];

    expect(cleanup.parseCleanupArgs()).toMatchObject({
      apply: false,
      target: {
        targetEnv: "local",
      },
    });
  });

  it("rejects missing and invalid target env values", () => {
    expect(() => cleanup.parseCleanupArgs(["--target-env"])).toThrow(/Missing value for --target-env/);
    expect(() => cleanup.parseCleanupArgs(["--target-env", "staging"])).toThrow(/local, qa, or production/);
    expect(() => cleanup.parseCleanupArgs(["--remote"])).toThrow(/Use --target-env qa or --target-env production/);
    expect(() => cleanup.parseCleanupArgs(["--db"])).toThrow(/Missing value for --db/);
    expect(() =>
      cleanup.parseCleanupArgs(["--target-env", "qa", "--base-url", "https://spoonjoy.app"]),
    ).toThrow(/QA target mismatch/);
  });

  it("formats the target summary printed before cleanup commands", () => {
    const options = cleanup.parseCleanupArgs(["--target-env", "qa"]);

    expect(cleanup.formatCleanupTargetSummary(options.target)).toEqual([
      "Target environment: qa",
      "Base URL: https://spoonjoy-v2-qa.mendelow-studio.workers.dev",
      "D1 target: QA D1 spoonjoy-qa (--remote --env qa)",
      "R2 target: QA R2 spoonjoy-photos-qa (--remote)",
      "Destructive scope: QA disposable test data only",
    ]);
  });

  it("runs local dry-run and local apply with explicit target summaries and local Wrangler args", async () => {
    const stdout = writableBuffer();
    const stderr = writableBuffer();
    const runCommand = vi.fn(async () => ({ stdout: "[]", stderr: "" }));

    await cleanup.runCleanupCli({
      argv: ["--target-env", "local"],
      runCommand,
      stdout: stdout.stream,
      stderr: stderr.stream,
    });

    expect(stdout.text()).toContain("Target environment: local");
    expect(stdout.text()).toContain("Dry run only. Pass --apply to mutate local D1.");
    expect(runCommand).toHaveBeenLastCalledWith(
      "pnpm",
      ["exec", "wrangler", "d1", "execute", "DB", "--local", "--command", buildDryRunSql()],
      expect.objectContaining({ encoding: "utf8" }),
    );

    await cleanup.runCleanupCli({
      argv: ["--target-env", "local", "--apply"],
      runCommand,
      stdout: stdout.stream,
      stderr: stderr.stream,
    });

    expect(stdout.text()).toContain("Applied local QA cleanup.");
    expect(runCommand).toHaveBeenLastCalledWith(
      "pnpm",
      ["exec", "wrangler", "d1", "execute", "DB", "--local", "--command", buildApplySql()],
      expect.objectContaining({ encoding: "utf8" }),
    );
  });

  it("prints help without executing a cleanup command", async () => {
    const stdout = writableBuffer();
    const stderr = writableBuffer();
    const runCommand = vi.fn(async () => ({ stdout: "[]", stderr: "" }));

    await cleanup.runCleanupCli({
      argv: ["--help"],
      runCommand,
      stdout: stdout.stream,
      stderr: stderr.stream,
    });

    expect(stdout.text()).toContain("Usage: node scripts/cleanup-local-qa-data.mjs");
    expect(stdout.text()).toContain("--target-env local|qa|production");
    expect(runCommand).not.toHaveBeenCalled();
  });

  it("prints help from default process argv/stdout options", async () => {
    process.argv = ["node", "scripts/cleanup-local-qa-data.mjs", "--help"];
    const writeSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

    await cleanup.runCleanupCli();

    expect(writeSpy).toHaveBeenCalledWith(expect.stringContaining("--target-env local|qa|production"));
  });

  it("forwards Wrangler stderr from successful cleanup checks", async () => {
    const stdout = writableBuffer();
    const stderr = writableBuffer();
    const runCommand = vi.fn(async () => ({ stdout: "[]", stderr: "wrangler note\n" }));

    await cleanup.runCleanupCli({
      argv: ["--target-env", "local"],
      runCommand,
      stdout: stdout.stream,
      stderr: stderr.stream,
    });

    expect(stdout.text()).toContain("Dry run only");
    expect(stderr.text()).toBe("wrangler note\n");
  });

  it("does not write stderr when Wrangler returns no stderr field", async () => {
    const stdout = writableBuffer();
    const stderr = writableBuffer();
    const runCommand = vi.fn(async () => ({ stdout: "[]" }));

    await cleanup.runCleanupCli({
      argv: ["--target-env", "local"],
      runCommand,
      stdout: stdout.stream,
      stderr: stderr.stream,
    });

    expect(stdout.text()).toContain("Dry run only");
    expect(stderr.text()).toBe("");
  });

  it("does not write stdout or stderr when Wrangler returns no output fields", async () => {
    const stdout = writableBuffer();
    const stderr = writableBuffer();
    const runCommand = vi.fn(async () => ({}));

    await cleanup.runCleanupCli({
      argv: ["--target-env", "local"],
      runCommand,
      stdout: stdout.stream,
      stderr: stderr.stream,
    });

    expect(stdout.text()).toContain("Dry run only. Pass --apply to mutate local D1.");
    expect(stdout.text()).not.toContain("[]");
    expect(stderr.text()).toBe("");
  });

  it("runs QA remote dry-run but refuses QA apply until D1/R2 safety is installed", async () => {
    const stdout = writableBuffer();
    const stderr = writableBuffer();
    const runCommand = vi.fn(async () => ({ stdout: "[]", stderr: "" }));

    await cleanup.runCleanupCli({
      argv: ["--target-env", "qa"],
      runCommand,
      stdout: stdout.stream,
      stderr: stderr.stream,
    });

    expect(stdout.text()).toContain("Target environment: qa");
    expect(stdout.text()).toContain("Remote QA apply is disabled until D1/R2 safety checks are installed");
    expect(stdout.text()).not.toContain("mutate local D1");
    expect(runCommand).toHaveBeenLastCalledWith(
      "pnpm",
      ["exec", "wrangler", "d1", "execute", "DB", "--remote", "--env", "qa", "--command", buildDryRunSql()],
      expect.objectContaining({ encoding: "utf8" }),
    );

    await expect(
      cleanup.runCleanupCli({
        argv: ["--target-env", "qa", "--apply"],
        runCommand,
        stdout: stdout.stream,
        stderr: stderr.stream,
      }),
    ).rejects.toThrow(/remote QA apply not enabled until D1\/R2 safety checks are installed/);
    expect(runCommand).toHaveBeenCalledTimes(1);
  });

  it("runs production read-only dry-run and refuses broad production apply", async () => {
    const stdout = writableBuffer();
    const stderr = writableBuffer();
    const runCommand = vi.fn(async () => ({ stdout: "[]", stderr: "" }));

    await cleanup.runCleanupCli({
      argv: ["--target-env", "production"],
      runCommand,
      stdout: stdout.stream,
      stderr: stderr.stream,
    });

    expect(stdout.text()).toContain("Target environment: production");
    expect(stdout.text()).toContain("Production cleanup is read-only for broad disposable sweeps.");
    expect(stdout.text()).toContain("Production broad cleanup is read-only");
    expect(stdout.text()).not.toContain("mutate local D1");
    expect(runCommand).toHaveBeenLastCalledWith(
      "pnpm",
      ["exec", "wrangler", "d1", "execute", "DB", "--remote", "--command", buildDryRunSql()],
      expect.objectContaining({ encoding: "utf8" }),
    );

    await expect(
      cleanup.runCleanupCli({
        argv: ["--target-env", "production", "--apply"],
        runCommand,
        stdout: stdout.stream,
        stderr: stderr.stream,
      }),
    ).rejects.toThrow(/Refusing broad production cleanup/);
    expect(runCommand).toHaveBeenCalledTimes(1);
  });

  it("detects CLI entrypoints and routes CLI errors", async () => {
    const onError = vi.fn();
    const runMain = vi.fn(async () => {
      throw new Error("boom");
    });

    expect(cleanup.isCliEntry("file:///tmp/cleanup-local-qa-data.mjs", "/tmp/cleanup-local-qa-data.mjs")).toBe(true);
    expect(cleanup.isCliEntry("file:///tmp/cleanup-local-qa-data.mjs", undefined)).toBe(false);
    expect(
      cleanup.runCliIfEntry({
        moduleUrl: "file:///tmp/other.mjs",
        argv1: "/tmp/cleanup-local-qa-data.mjs",
        runMain,
        onError,
      }),
    ).toBe(false);
    expect(runMain).not.toHaveBeenCalled();

    expect(
      cleanup.runCliIfEntry({
        moduleUrl: "file:///tmp/cleanup-local-qa-data.mjs",
        argv1: "/tmp/cleanup-local-qa-data.mjs",
        runMain,
        onError,
      }),
    ).toBe(true);

    await vi.waitFor(() => expect(onError).toHaveBeenCalledWith(expect.any(Error)));
  });

  it("prints default CLI error output for Error and non-Error failures", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    cleanup.defaultCliErrorHandler(new Error("cleanup failed"));
    expect(errorSpy).toHaveBeenLastCalledWith("cleanup failed");
    expect(process.exitCode).toBe(1);

    cleanup.defaultCliErrorHandler("string failure");
    expect(errorSpy).toHaveBeenLastCalledWith("string failure");
    expect(process.exitCode).toBe(1);
  });
});
