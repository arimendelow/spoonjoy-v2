import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
declare global {
  var __db: PrismaClient | undefined;
}

let db: PrismaClient;

// This works for both development (Node.js) and production (Cloudflare Workers with external Postgres)
if (process.env.NODE_ENV === "production") {
  db = new PrismaClient();
} else {
  if (!global.__db) {
    global.__db = new PrismaClient();
  }
  db = global.__db;
}

export { db };

// For Cloudflare D1, you would use this pattern instead:
// import { PrismaClient } from '@prisma/client'
// import { PrismaD1 } from '@prisma/adapter-d1'
//
// export function getDb(env: { DB: D1Database }) {
//   const adapter = new PrismaD1(env.DB)
//   return new PrismaClient({ adapter })
// }
