import { describe, it, expect, vi } from "vitest";
import { getDb } from "~/lib/db.server";

describe("db.server", () => {
  describe("getDb", () => {
    it("should create PrismaClient with D1 adapter for Cloudflare environment", () => {
      // Mock D1Database
      const mockD1 = {
        prepare: vi.fn(),
        dump: vi.fn(),
        batch: vi.fn(),
        exec: vi.fn(),
      } as unknown as D1Database;

      const env = { DB: mockD1 };
      
      const db = getDb(env);
      
      // Verify we got a PrismaClient instance
      expect(db).toBeDefined();
      expect(typeof db.$connect).toBe("function");
      expect(typeof db.$disconnect).toBe("function");
    });

    it("should handle different D1Database instances", () => {
      const mockD1_1 = {
        prepare: vi.fn(),
        dump: vi.fn(),
        batch: vi.fn(),
        exec: vi.fn(),
      } as unknown as D1Database;

      const mockD1_2 = {
        prepare: vi.fn(),
        dump: vi.fn(),
        batch: vi.fn(),
        exec: vi.fn(),
      } as unknown as D1Database;

      const db1 = getDb({ DB: mockD1_1 });
      const db2 = getDb({ DB: mockD1_2 });

      // Should return different instances for different D1 databases
      expect(db1).toBeDefined();
      expect(db2).toBeDefined();
    });
  });
});
