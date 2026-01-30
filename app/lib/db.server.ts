import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
declare global {
  var __db: PrismaClient | undefined;
}

// For Cloudflare D1 in production
export function getDb(env: { DB: D1Database }) {
  const adapter = new PrismaD1(env.DB);
  return new PrismaClient({ adapter });
}

// For local development (SQLite)
let db: PrismaClient;

/* istanbul ignore else -- @preserve production-only path never reached in tests */
if (process.env.NODE_ENV !== "production") {
  /* istanbul ignore else -- @preserve global.__db already set from previous test imports */
  if (!global.__db) {
    global.__db = new PrismaClient();
  }
  db = global.__db;
} else {
  db = new PrismaClient();
}

export { db };
