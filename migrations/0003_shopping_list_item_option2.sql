-- Shopping List Option 2: server-backed state fields for ordering, checked/deleted timestamps, category/icon metadata
ALTER TABLE "ShoppingListItem" ADD COLUMN "checkedAt" DATETIME;
ALTER TABLE "ShoppingListItem" ADD COLUMN "deletedAt" DATETIME;
ALTER TABLE "ShoppingListItem" ADD COLUMN "sortIndex" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ShoppingListItem" ADD COLUMN "categoryKey" TEXT;
ALTER TABLE "ShoppingListItem" ADD COLUMN "iconKey" TEXT;

-- Backfill checkedAt for existing checked=true rows
UPDATE "ShoppingListItem"
SET "checkedAt" = CURRENT_TIMESTAMP
WHERE "checked" = 1 AND "checkedAt" IS NULL;

-- Deterministic initial sort order per shopping list
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

CREATE INDEX "ShoppingListItem_shoppingListId_deletedAt_sortIndex_idx"
  ON "ShoppingListItem"("shoppingListId", "deletedAt", "sortIndex");
