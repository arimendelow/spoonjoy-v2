import { PrismaD1 } from "@prisma/adapter-d1";

// Type import only - doesn't cause runtime bundling issues
import type { PrismaClient as PrismaClientType } from "@prisma/client";

// Cloudflare D1 for all environments (local + production)
export async function getDb(env: { DB: D1Database }): Promise<PrismaClientType> {
  const { PrismaClient } = await import("@prisma/client");
  const adapter = new PrismaD1(env.DB);
  return new PrismaClient({ adapter });
}

let localDbPromise: Promise<PrismaClientType> | null = null;
export let db: PrismaClientType | null = null;

// Backwards-compatible API for tests/scripts; now uses local D1, not SQLite.
export async function getLocalDb(): Promise<PrismaClientType> {
  if (!localDbPromise) {
    localDbPromise = (async () => {
      const { getPlatformProxy } = await import("wrangler");
      const platform = await getPlatformProxy<{ DB: D1Database }>();
      if (!platform.env?.DB) {
        throw new Error("Cloudflare D1 binding `DB` is required.");
      }
      return getDb({ DB: platform.env.DB });
    })();
  }

  db = await localDbPromise;
  return db;
}
