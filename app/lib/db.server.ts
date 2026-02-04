import { PrismaD1 } from "@prisma/adapter-d1";

// Type import only - doesn't cause runtime bundling issues
import type { PrismaClient as PrismaClientType } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
declare global {
  var __db: PrismaClientType | undefined;
}

// For Cloudflare D1 in production
export async function getDb(env: { DB: D1Database }): Promise<PrismaClientType> {
  const { PrismaClient } = await import("@prisma/client");
  const adapter = new PrismaD1(env.DB);
  return new PrismaClient({ adapter });
}

// For local development (SQLite) - lazy loaded
let db: PrismaClientType | null = null;

export async function getLocalDb(): Promise<PrismaClientType> {
  if (db) return db;
  
  const { PrismaClient } = await import("@prisma/client");
  
  /* istanbul ignore else -- @preserve global.__db already set from previous test imports */
  if (!global.__db) {
    global.__db = new PrismaClient();
  }
  db = global.__db;
  return db;
}

// Re-export for backwards compatibility (but prefer getLocalDb() in new code)
export { db };
