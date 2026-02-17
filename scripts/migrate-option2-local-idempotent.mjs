#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const dbName = 'spoonjoy';
const migrationFile = './migrations/0003_shopping_list_item_option2.sql';
const requiredColumns = new Set(['checkedAt', 'deletedAt', 'sortIndex', 'categoryKey', 'iconKey']);

function runWrangler(args) {
  const output = execFileSync('npx', ['wrangler', 'd1', 'execute', dbName, '--local', '--json', ...args], {
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'inherit'],
  });

  return JSON.parse(output);
}

function runSql(sql) {
  return runWrangler(['--command', sql]);
}

function hasIndex(indexName) {
  const result = runSql(`PRAGMA index_list('ShoppingListItem');`);
  const indexes = result?.[0]?.results ?? [];
  return indexes.some((idx) => idx.name === indexName);
}

function main() {
  const migrationPath = path.resolve(process.cwd(), migrationFile);
  if (!existsSync(migrationPath)) {
    console.error(`[db:migrate:local:option2:idempotent] Migration file not found: ${migrationFile}`);
    process.exit(1);
  }

  const tableInfo = runSql(`PRAGMA table_info('ShoppingListItem');`);
  const columns = new Set((tableInfo?.[0]?.results ?? []).map((col) => col.name));
  const missingColumns = [...requiredColumns].filter((col) => !columns.has(col));

  if (missingColumns.length === 0) {
    console.log('[db:migrate:local:option2:idempotent] Option2 columns already present; skipping migration 0003.');
    return;
  }

  if (missingColumns.length === requiredColumns.size) {
    console.log('[db:migrate:local:option2:idempotent] Applying migration 0003 (fresh path).');
    runWrangler(['--file', migrationFile]);
    console.log('[db:migrate:local:option2:idempotent] Migration 0003 applied successfully.');
    return;
  }

  console.log(`[db:migrate:local:option2:idempotent] Partial schema detected (${missingColumns.join(', ')} missing). Applying idempotent repair SQL.`);

  const alterStatements = missingColumns.map((column) => {
    switch (column) {
      case 'checkedAt':
      case 'deletedAt':
        return `ALTER TABLE "ShoppingListItem" ADD COLUMN "${column}" DATETIME`;
      case 'sortIndex':
        return 'ALTER TABLE "ShoppingListItem" ADD COLUMN "sortIndex" INTEGER NOT NULL DEFAULT 0';
      case 'categoryKey':
      case 'iconKey':
        return `ALTER TABLE "ShoppingListItem" ADD COLUMN "${column}" TEXT`;
      default:
        throw new Error(`Unexpected column: ${column}`);
    }
  });

  if (alterStatements.length > 0) {
    runSql(`${alterStatements.join('; ')};`);
  }

  runSql(`
    UPDATE "ShoppingListItem"
    SET "checkedAt" = CURRENT_TIMESTAMP
    WHERE "checked" = 1 AND "checkedAt" IS NULL;
  `);

  runSql(`
    WITH ranked AS (
      SELECT
        "id",
        ROW_NUMBER() OVER (
          PARTITION BY "shoppingListId"
          ORDER BY "checked" ASC, "updatedAt" ASC, "id" ASC
        ) - 1 AS rn
      FROM "ShoppingListItem"
      WHERE "deletedAt" IS NULL
    )
    UPDATE "ShoppingListItem"
    SET "sortIndex" = (
      SELECT rn FROM ranked WHERE ranked.id = "ShoppingListItem"."id"
    )
    WHERE "id" IN (SELECT id FROM ranked);
  `);

  const indexName = 'ShoppingListItem_shoppingListId_deletedAt_sortIndex_idx';
  if (!hasIndex(indexName)) {
    runSql(`
      CREATE INDEX "${indexName}"
      ON "ShoppingListItem"("shoppingListId", "deletedAt", "sortIndex");
    `);
  }

  console.log('[db:migrate:local:option2:idempotent] Schema repaired and migration state is now in sync.');
}

main();
