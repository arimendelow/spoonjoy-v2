import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock environment variables
process.env.DATABASE_URL = "file:./test.db";
process.env.SESSION_SECRET = "test-secret";

// Mock Cloudflare context
global.cloudflare = {
  env: {},
  cf: {},
  ctx: {
    waitUntil: vi.fn(),
    passThroughOnException: vi.fn(),
  },
} as any;
