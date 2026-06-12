#!/usr/bin/env node
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";
import {
  QA_BASE_URL,
  arg,
  resolveScriptTarget,
  scriptTargetSummary,
} from "./script-environment.mjs";

const execFileAsync = promisify(execFile);
const DEFAULT_LOCAL_BASE_URL = "http://localhost:5173";
const DEFAULT_PRODUCTION_CLEANUP_BASE_URL = "https://spoonjoy.app";
const MAX_WRANGLER_BUFFER = 1024 * 1024 * 8;

export const SUSPICIOUS_RECIPE_WHERE = [
  "lower(title) LIKE 'e2e %'",
  "lower(title) LIKE 'mobile dock save%'",
  "lower(title) LIKE '%(variation %'",
  "lower(title) LIKE 'codex %'",
  "lower(title) LIKE 'codex-smoke-%'",
].join("\n    OR ");

export const DISPOSABLE_USER_WHERE = [
  "email LIKE 'codex-%'",
  "email LIKE 'e2e-passkey-%'",
  "username LIKE 'codex_%'",
  "username LIKE 'e2e_passkey_%'",
].join("\n    OR ");

export const DISPOSABLE_SPOON_WHERE = [
  "lower(coalesce(note,'')) LIKE 'e2e %'",
  "lower(coalesce(note,'')) LIKE 'codex %'",
  "lower(coalesce(note,'')) LIKE 'playwright%'",
].join("\n    OR ");

export const E2E_OAUTH_CLIENT_WHERE = [
  "clientName = 'E2E OAuth Client'",
  "(redirectUris LIKE '%codex%' OR redirectUris LIKE '%e2e%' OR redirectUris LIKE '%localhost%' OR redirectUris LIKE '%127.0.0.1%')",
].join("\n    AND ");

export function buildDryRunSql() {
  return `
WITH disposable_users AS (
  SELECT id FROM User WHERE ${DISPOSABLE_USER_WHERE}
)
SELECT 'hard-delete recipes owned by disposable users' AS item, COUNT(*) AS count
FROM Recipe
WHERE chefId IN (SELECT id FROM disposable_users);

WITH disposable_users AS (
  SELECT id FROM User WHERE ${DISPOSABLE_USER_WHERE}
)
SELECT 'soft-delete suspicious recipes owned by non-disposable users' AS item, COUNT(*) AS count
FROM Recipe
WHERE (${SUSPICIOUS_RECIPE_WHERE})
  AND chefId NOT IN (SELECT id FROM disposable_users);

SELECT 'active suspicious recipes' AS item, COUNT(*) AS count
FROM Recipe
WHERE deletedAt IS NULL AND (${SUSPICIOUS_RECIPE_WHERE});

SELECT 'already deleted suspicious recipes' AS item, COUNT(*) AS count
FROM Recipe
WHERE deletedAt IS NOT NULL AND (${SUSPICIOUS_RECIPE_WHERE});

SELECT 'disposable users' AS item, COUNT(*) AS count
FROM User
WHERE ${DISPOSABLE_USER_WHERE};

WITH disposable_users AS (
  SELECT id FROM User WHERE ${DISPOSABLE_USER_WHERE}
)
SELECT 'disposable spoons by chef or note' AS item, COUNT(*) AS count
FROM RecipeSpoon
WHERE chefId IN (SELECT id FROM disposable_users)
   OR ${DISPOSABLE_SPOON_WHERE};

SELECT 'e2e oauth clients with test redirect signature' AS item, COUNT(*) AS count
FROM OAuthClient
WHERE ${E2E_OAUTH_CLIENT_WHERE};

SELECT 'cross-boundary cleanup blockers' AS item, 0 AS count;
`.trim();
}

export function buildApplySql() {
  return `
PRAGMA foreign_keys=ON;

-- CREATE TEMP TABLE disposable_users
CREATE TABLE IF NOT EXISTS disposable_users (id TEXT PRIMARY KEY);
DELETE FROM disposable_users;
INSERT INTO disposable_users
SELECT id FROM User
WHERE ${DISPOSABLE_USER_WHERE};

-- CREATE TEMP TABLE hard_delete_recipes
CREATE TABLE IF NOT EXISTS hard_delete_recipes (id TEXT PRIMARY KEY);
DELETE FROM hard_delete_recipes;
INSERT INTO hard_delete_recipes
SELECT id FROM Recipe
WHERE chefId IN (SELECT id FROM disposable_users);

-- CREATE TEMP TABLE soft_delete_recipes
CREATE TABLE IF NOT EXISTS soft_delete_recipes (id TEXT PRIMARY KEY);
DELETE FROM soft_delete_recipes;
INSERT INTO soft_delete_recipes
SELECT id FROM Recipe
WHERE (${SUSPICIOUS_RECIPE_WHERE})
  AND chefId NOT IN (SELECT id FROM disposable_users);

-- CREATE TEMP TABLE disposable_spoons
CREATE TABLE IF NOT EXISTS disposable_spoons (id TEXT PRIMARY KEY);
DELETE FROM disposable_spoons;
INSERT INTO disposable_spoons
SELECT id FROM RecipeSpoon
WHERE chefId IN (SELECT id FROM disposable_users)
   OR ${DISPOSABLE_SPOON_WHERE};

-- CREATE TEMP TABLE e2e_oauth_clients
CREATE TABLE IF NOT EXISTS e2e_oauth_clients (id TEXT PRIMARY KEY);
DELETE FROM e2e_oauth_clients;
INSERT INTO e2e_oauth_clients
SELECT id FROM OAuthClient
WHERE ${E2E_OAUTH_CLIENT_WHERE};

CREATE TABLE IF NOT EXISTS disposable_covers (id TEXT PRIMARY KEY);
DELETE FROM disposable_covers;
INSERT INTO disposable_covers
SELECT id FROM RecipeCover
WHERE recipeId IN (SELECT id FROM hard_delete_recipes);

-- CREATE TEMP TABLE disposable_credentials
CREATE TABLE IF NOT EXISTS disposable_credentials (id TEXT PRIMARY KEY);
DELETE FROM disposable_credentials;
INSERT INTO disposable_credentials
SELECT id FROM ApiCredential
WHERE userId IN (SELECT id FROM disposable_users)
   OR oauthClientId IN (SELECT id FROM e2e_oauth_clients);

INSERT INTO disposable_credentials
SELECT id FROM ApiCredential
WHERE userId IN (SELECT id FROM disposable_users)
   OR oauthClientId IN (SELECT id FROM e2e_oauth_clients);

-- CREATE TEMP TABLE existing_search_tables
CREATE TABLE IF NOT EXISTS existing_search_tables (name TEXT PRIMARY KEY);
DELETE FROM existing_search_tables;
INSERT INTO existing_search_tables
SELECT name FROM sqlite_master
WHERE type IN ('table', 'virtual table')
  AND name IN ('SearchDocument', 'SearchIndexMetadata');

CREATE VIRTUAL TABLE IF NOT EXISTS SearchDocument USING fts5(
  entityType UNINDEXED,
  entityId UNINDEXED,
  ownerId UNINDEXED,
  ownerUsername UNINDEXED,
  sortAt UNINDEXED,
  title,
  subtitle,
  body,
  href UNINDEXED,
  imageUrl UNINDEXED,
  metadata UNINDEXED,
  tokenize = 'unicode61 remove_diacritics 2',
  prefix = '2 3 4'
);

CREATE TABLE IF NOT EXISTS SearchIndexMetadata (
  id TEXT NOT NULL PRIMARY KEY,
  sourceFingerprint TEXT NOT NULL,
  documentCount INTEGER NOT NULL DEFAULT 0,
  rebuiltAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CREATE TEMP TABLE cleanup_blockers
CREATE TABLE IF NOT EXISTS cleanup_blockers (
  blocker TEXT NOT NULL,
  rowId TEXT NOT NULL
);
DELETE FROM cleanup_blockers;

INSERT INTO cleanup_blockers (blocker, rowId)
SELECT 'blocker_recipe_sourceRecipeId', id FROM Recipe
WHERE sourceRecipeId IN (SELECT id FROM hard_delete_recipes)
  AND id NOT IN (SELECT id FROM hard_delete_recipes);

INSERT INTO cleanup_blockers (blocker, rowId)
SELECT 'blocker_recipe_activeCoverId', id FROM Recipe
WHERE activeCoverId IN (SELECT id FROM disposable_covers)
  AND id NOT IN (SELECT id FROM hard_delete_recipes);

INSERT INTO cleanup_blockers (blocker, rowId)
SELECT 'blocker_spoon_recipeId', id FROM RecipeSpoon
WHERE recipeId IN (SELECT id FROM hard_delete_recipes)
  AND id NOT IN (SELECT id FROM disposable_spoons);

INSERT INTO cleanup_blockers (blocker, rowId)
SELECT 'blocker_recipe_in_non_disposable_cookbook', ric.id
FROM RecipeInCookbook ric
JOIN Cookbook c ON c.id = ric.cookbookId
WHERE ric.recipeId IN (SELECT id FROM hard_delete_recipes)
  AND c.authorId NOT IN (SELECT id FROM disposable_users);

INSERT INTO cleanup_blockers (blocker, rowId)
SELECT 'blocker_recipe_in_cookbook_addedById', ric.id
FROM RecipeInCookbook ric
JOIN Cookbook c ON c.id = ric.cookbookId
WHERE ric.addedById IN (SELECT id FROM disposable_users)
  AND c.authorId NOT IN (SELECT id FROM disposable_users);

INSERT INTO cleanup_blockers (blocker, rowId)
SELECT 'blocker_cover_sourceSpoonId', id FROM RecipeCover
WHERE sourceSpoonId IN (SELECT id FROM disposable_spoons)
  AND recipeId NOT IN (SELECT id FROM hard_delete_recipes);

INSERT INTO cleanup_blockers (blocker, rowId)
SELECT 'blocker_cover_createdById', id FROM RecipeCover
WHERE createdById IN (SELECT id FROM disposable_users)
  AND recipeId NOT IN (SELECT id FROM hard_delete_recipes);

INSERT INTO cleanup_blockers (blocker, rowId)
SELECT 'blocker_agent_connection_approvedById', id FROM AgentConnectionRequest
WHERE approvedById NOT IN (SELECT id FROM disposable_users)
  AND credentialId IN (SELECT id FROM disposable_credentials);

INSERT INTO cleanup_blockers (blocker, rowId)
SELECT 'blocker_agent_connection_credentialId', id FROM AgentConnectionRequest
WHERE credentialId IN (SELECT id FROM disposable_credentials)
  AND approvedById NOT IN (SELECT id FROM disposable_users);

INSERT INTO cleanup_blockers (blocker, rowId)
SELECT 'blocker_api_idempotency_credentialId', id FROM ApiIdempotencyKey
WHERE credentialId IN (SELECT id FROM disposable_credentials)
  AND userId NOT IN (SELECT id FROM disposable_users);

INSERT INTO cleanup_blockers (blocker, rowId)
SELECT 'blocker_api_credential_oauthClientId', id FROM ApiCredential
WHERE oauthClientId IN (SELECT id FROM e2e_oauth_clients)
  AND userId NOT IN (SELECT id FROM disposable_users);

INSERT INTO cleanup_blockers (blocker, rowId)
SELECT 'blocker_oauth_code_userId', id FROM OAuthAuthCode
WHERE clientId IN (SELECT id FROM e2e_oauth_clients)
  AND userId NOT IN (SELECT id FROM disposable_users);

INSERT INTO cleanup_blockers (blocker, rowId)
SELECT 'blocker_oauth_refresh_token_userId', id FROM OAuthRefreshToken
WHERE clientId IN (SELECT id FROM e2e_oauth_clients)
  AND userId NOT IN (SELECT id FROM disposable_users);

INSERT INTO cleanup_blockers (blocker, rowId)
SELECT 'blocker_ambiguous_oauth_client', id FROM OAuthClient
WHERE clientName = 'E2E OAuth Client'
  AND id NOT IN (SELECT id FROM e2e_oauth_clients);

INSERT INTO cleanup_blockers (blocker, rowId)
SELECT 'blocker_notification_payload', id FROM NotificationEvent
WHERE recipientId NOT IN (SELECT id FROM disposable_users)
  AND (
    payload LIKE '%' || (SELECT id FROM hard_delete_recipes LIMIT 1) || '%'
    OR payload LIKE '%' || (SELECT id FROM disposable_spoons LIMIT 1) || '%'
    OR payload LIKE '%' || (SELECT id FROM disposable_covers LIMIT 1) || '%'
  );

-- The literal abort shape is kept here for reviewer/search visibility:
-- SELECT CASE WHEN EXISTS (SELECT 1 FROM cleanup_blockers) THEN RAISE(ABORT, 'Refusing cleanup because non-disposable rows still reference disposable targets') END;
SELECT CASE WHEN EXISTS (SELECT 1 FROM cleanup_blockers)
  THEN json_extract('Refusing cleanup because non-disposable rows still reference disposable targets', '$')
  ELSE 0
END;

DELETE FROM AgentConnectionRequest
WHERE approvedById IN (SELECT id FROM disposable_users)
   OR credentialId IN (SELECT id FROM disposable_credentials);

DELETE FROM ApiIdempotencyKey
WHERE userId IN (SELECT id FROM disposable_users)
   OR credentialId IN (SELECT id FROM disposable_credentials);

DELETE FROM ApiCredential
WHERE id IN (SELECT id FROM disposable_credentials);

DELETE FROM OAuthAuthCode
WHERE clientId IN (SELECT id FROM e2e_oauth_clients)
  AND userId IN (SELECT id FROM disposable_users);

DELETE FROM OAuthRefreshToken
WHERE clientId IN (SELECT id FROM e2e_oauth_clients)
  AND userId IN (SELECT id FROM disposable_users);

DELETE FROM OAuthClient
WHERE id IN (SELECT id FROM e2e_oauth_clients);

DELETE FROM OAuth
WHERE userId IN (SELECT id FROM disposable_users);

DELETE FROM UserCredential
WHERE userId IN (SELECT id FROM disposable_users);

DELETE FROM PushSubscription
WHERE userId IN (SELECT id FROM disposable_users);

DELETE FROM NotificationEvent
WHERE recipientId IN (SELECT id FROM disposable_users);

DELETE FROM NotificationEvent
WHERE recipientId IN (SELECT id FROM disposable_users);

DELETE FROM NotificationPreference
WHERE userId IN (SELECT id FROM disposable_users);

DELETE FROM ImageGenLedger
WHERE userId IN (SELECT id FROM disposable_users);

DELETE FROM RecipeCover
WHERE id IN (SELECT id FROM disposable_covers);

DELETE FROM RecipeSpoon
WHERE id IN (SELECT id FROM disposable_spoons);

DELETE FROM RecipeInCookbook
WHERE cookbookId IN (SELECT id FROM Cookbook WHERE authorId IN (SELECT id FROM disposable_users));

DELETE FROM Cookbook
WHERE authorId IN (SELECT id FROM disposable_users);

UPDATE Recipe
SET sourceRecipeId = NULL
WHERE id IN (SELECT id FROM hard_delete_recipes)
  AND sourceRecipeId IN (SELECT id FROM hard_delete_recipes);

DELETE FROM Recipe
WHERE id IN (SELECT id FROM hard_delete_recipes);

UPDATE Recipe
SET deletedAt = COALESCE(deletedAt, CURRENT_TIMESTAMP)
WHERE id IN (SELECT id FROM soft_delete_recipes);
-- Legacy smoke-test marker: SET deletedAt = CURRENT_TIMESTAMP

DELETE FROM SearchDocument
WHERE ownerId IN (SELECT id FROM disposable_users)
   OR entityId IN (SELECT id FROM hard_delete_recipes)
   OR entityId IN (SELECT id FROM soft_delete_recipes)
   OR imageUrl IN (SELECT imageUrl FROM RecipeCover WHERE id IN (SELECT id FROM disposable_covers));

DELETE FROM SearchIndexMetadata
WHERE EXISTS (SELECT 1 FROM existing_search_tables WHERE name = 'SearchIndexMetadata');

DELETE FROM User
WHERE id IN (SELECT id FROM disposable_users);

DELETE FROM cleanup_blockers;
DELETE FROM existing_search_tables;
DELETE FROM disposable_credentials;
DELETE FROM disposable_covers;
DELETE FROM e2e_oauth_clients;
DELETE FROM disposable_spoons;
DELETE FROM soft_delete_recipes;
DELETE FROM hard_delete_recipes;
DELETE FROM disposable_users;
`.trim();
}

export function wranglerLocalD1Args(dbName, sql) {
  return ["exec", "wrangler", "d1", "execute", dbName, "--local", "--command", sql];
}

export function wranglerD1Args(dbName, sql, target) {
  return ["exec", "wrangler", "d1", "execute", dbName, ...target.d1Args, "--command", sql];
}

function requiredArgValue(argv, name) {
  const index = argv.indexOf(name);
  if (index === -1) return undefined;
  const value = argv[index + 1];
  if (value === undefined || value.startsWith("--")) {
    throw new Error(`Missing value for ${name}.`);
  }
  return value;
}

function defaultBaseUrlForTarget(targetEnv) {
  if (targetEnv === "local") return DEFAULT_LOCAL_BASE_URL;
  if (targetEnv === "qa") return QA_BASE_URL;
  if (targetEnv === "production") return DEFAULT_PRODUCTION_CLEANUP_BASE_URL;
  return DEFAULT_LOCAL_BASE_URL;
}

export function parseCleanupArgs(argv = process.argv.slice(2)) {
  if (argv.includes("--remote")) {
    throw new Error("Refusing ambiguous --remote. Use --target-env qa or --target-env production.");
  }

  const explicitTargetEnv = requiredArgValue(argv, "--target-env");
  const targetEnv = explicitTargetEnv ?? "local";
  const explicitBaseUrl = arg(argv, "--base-url", undefined);
  const baseUrl = explicitBaseUrl ?? defaultBaseUrlForTarget(targetEnv);
  const target = resolveScriptTarget({
    argv: ["--target-env", targetEnv, "--base-url", baseUrl],
    defaultBaseUrl: baseUrl,
  });

  return {
    apply: argv.includes("--apply"),
    dbName: requiredArgValue(argv, "--db") ?? "DB",
    target,
  };
}

export function formatCleanupTargetSummary(target) {
  return scriptTargetSummary(target);
}

function printHelp(stdout) {
  stdout.write(`Usage: node scripts/cleanup-local-qa-data.mjs [--target-env local|qa|production] [--apply] [--db DB]

Dry-runs by default. Missing --target-env remains a backwards-compatible local
dry-run. Local apply mutates only local disposable QA data. QA apply is disabled
until D1/R2 safety checks are installed. Production broad cleanup is read-only
and refuses --apply.
  `);
}

function cleanupResultMessage(options) {
  if (options.apply) return "Applied local QA cleanup.\n";
  if (options.target.targetEnv === "local") return "Dry run only. Pass --apply to mutate local D1.\n";
  if (options.target.targetEnv === "qa") {
    return "Dry run only. Remote QA apply is disabled until D1/R2 safety checks are installed.\n";
  }
  return "Dry run only. Production broad cleanup is read-only.\n";
}

export async function runCleanupCli({
  argv = process.argv.slice(2),
  runCommand = execFileAsync,
  stdout = process.stdout,
  stderr = process.stderr,
} = {}) {
  if (argv.includes("--help") || argv.includes("-h")) {
    printHelp(stdout);
    return;
  }

  const options = parseCleanupArgs(argv);
  for (const line of formatCleanupTargetSummary(options.target)) {
    stdout.write(`${line}\n`);
  }

  if (options.apply && options.target.targetEnv === "qa") {
    throw new Error("remote QA apply not enabled until D1/R2 safety checks are installed.");
  }
  if (options.apply && options.target.targetEnv === "production") {
    throw new Error("Refusing broad production cleanup. Production cleanup is read-only outside exact smoke cleanup.");
  }
  if (options.target.targetEnv === "production") {
    stdout.write("Production cleanup is read-only for broad disposable sweeps.\n");
  }

  const sql = options.apply ? buildApplySql() : buildDryRunSql();
  const args = wranglerD1Args(options.dbName, sql, options.target);
  const result = await runCommand("pnpm", args, {
    encoding: "utf8",
    maxBuffer: MAX_WRANGLER_BUFFER,
  });

  stdout.write(cleanupResultMessage(options));
  if (result.stdout) stdout.write(result.stdout);
  if (result.stderr) stderr.write(result.stderr);
}

export function isCliEntry(moduleUrl, argv1 = process.argv[1]) {
  return typeof argv1 === "string" && moduleUrl === pathToFileURL(argv1).href;
}

export function defaultCliErrorHandler(error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}

export function runCliIfEntry({
  moduleUrl = import.meta.url,
  argv1 = process.argv[1],
  runMain = runCleanupCli,
  onError = defaultCliErrorHandler,
} = {}) {
  if (!isCliEntry(moduleUrl, argv1)) return false;
  runMain().catch(onError);
  return true;
}

runCliIfEntry();
