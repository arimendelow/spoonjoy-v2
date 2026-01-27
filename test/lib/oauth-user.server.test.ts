import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { db } from "~/lib/db.server";
import { cleanupDatabase } from "../helpers/cleanup";
import { faker } from "@faker-js/faker";
import { createTestUser } from "../utils";

// These imports will fail until implementation exists (TDD)
import {
  createOAuthUser,
  generateUsername,
} from "~/lib/oauth-user.server";

describe("oauth-user.server", () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe("generateUsername", () => {
    it("should generate username from full name", async () => {
      const username = await generateUsername(db, "John Smith", null);
      expect(username).toBe("john-smith");
    });

    it("should generate username from first name only", async () => {
      const username = await generateUsername(db, "Alice", null);
      expect(username).toBe("alice");
    });

    it("should generate username from email if name is null", async () => {
      const username = await generateUsername(db, null, "bob@example.com");
      expect(username).toBe("bob");
    });

    it("should generate username from email if name is empty string", async () => {
      const username = await generateUsername(db, "", "charlie@example.com");
      expect(username).toBe("charlie");
    });

    it("should handle email with dots before @", async () => {
      const username = await generateUsername(db, null, "john.doe@example.com");
      expect(username).toBe("john-doe");
    });

    it("should handle email with plus sign", async () => {
      const username = await generateUsername(db, null, "user+tag@example.com");
      expect(username).toBe("user");
    });

    it("should lowercase and replace spaces with hyphens", async () => {
      const username = await generateUsername(db, "Jane Doe Smith", null);
      expect(username).toBe("jane-doe-smith");
    });

    it("should remove special characters from name", async () => {
      const username = await generateUsername(db, "O'Brien-Jones!", null);
      expect(username).toBe("obrien-jones");
    });

    it("should handle username collision by appending number", async () => {
      // Create existing user with username "john-smith"
      const testUser = createTestUser();
      await db.user.create({
        data: {
          ...testUser,
          username: "john-smith",
        },
      });

      const username = await generateUsername(db, "John Smith", null);
      expect(username).toBe("john-smith-1");
    });

    it("should handle multiple username collisions", async () => {
      // Create existing users with username "alice" and "alice-1"
      const testUser1 = createTestUser();
      const testUser2 = createTestUser();
      await db.user.create({
        data: {
          ...testUser1,
          username: "alice",
        },
      });
      await db.user.create({
        data: {
          ...testUser2,
          username: "alice-1",
        },
      });

      const username = await generateUsername(db, "Alice", null);
      expect(username).toBe("alice-2");
    });

    it("should generate random fallback if no name or email", async () => {
      const username = await generateUsername(db, null, null);
      expect(username).toMatch(/^user-[a-z0-9]+$/);
    });

    it("should handle whitespace-only name", async () => {
      const username = await generateUsername(db, "   ", "test@example.com");
      expect(username).toBe("test");
    });
  });

  describe("createOAuthUser", () => {
    it("should create a new user from OAuth data with name", async () => {
      const oauthData = {
        provider: "google",
        providerUserId: faker.string.uuid(),
        providerUsername: "John Smith",
        email: faker.internet.email().toLowerCase(),
        name: "John Smith",
      };

      const result = await createOAuthUser(db, oauthData);

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe(oauthData.email);
      expect(result.user?.username).toBe("john-smith");

      // Verify OAuth link was created
      const oauthRecord = await db.oAuth.findFirst({
        where: {
          provider: oauthData.provider,
          providerUserId: oauthData.providerUserId,
        },
      });
      expect(oauthRecord).toBeDefined();
      expect(oauthRecord?.userId).toBe(result.user?.id);
    });

    it("should create a new user from OAuth data with email only", async () => {
      const email = faker.internet.email().toLowerCase();
      const oauthData = {
        provider: "apple",
        providerUserId: faker.string.uuid(),
        providerUsername: email,
        email,
        name: null,
      };

      const result = await createOAuthUser(db, oauthData);

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe(email);
      // Username should be derived from email
      expect(result.user?.username).toBeDefined();
    });

    it("should create user without password (OAuth-only user)", async () => {
      const oauthData = {
        provider: "google",
        providerUserId: faker.string.uuid(),
        providerUsername: "Test User",
        email: faker.internet.email().toLowerCase(),
        name: "Test User",
      };

      const result = await createOAuthUser(db, oauthData);

      expect(result.success).toBe(true);

      // Verify user has no password
      const user = await db.user.findUnique({
        where: { id: result.user?.id },
        select: { hashedPassword: true, salt: true },
      });
      expect(user?.hashedPassword).toBeNull();
      expect(user?.salt).toBeNull();
    });

    it("should return error when email already exists and user not logged in", async () => {
      // Create existing user with email
      const existingEmail = faker.internet.email().toLowerCase();
      const testUser = createTestUser();
      await db.user.create({
        data: {
          ...testUser,
          email: existingEmail,
        },
      });

      const oauthData = {
        provider: "google",
        providerUserId: faker.string.uuid(),
        providerUsername: "Existing User",
        email: existingEmail,
        name: "Existing User",
      };

      const result = await createOAuthUser(db, oauthData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("account_exists");
      expect(result.message).toContain("log in");
      expect(result.user).toBeUndefined();
    });

    it("should be case-insensitive for email collision check", async () => {
      // Create existing user with lowercase email
      const existingEmail = "test@example.com";
      const testUser = createTestUser();
      await db.user.create({
        data: {
          ...testUser,
          email: existingEmail,
        },
      });

      const oauthData = {
        provider: "apple",
        providerUserId: faker.string.uuid(),
        providerUsername: "Test User",
        email: "TEST@EXAMPLE.COM",
        name: "Test User",
      };

      const result = await createOAuthUser(db, oauthData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("account_exists");
    });

    it("should handle username collision when creating OAuth user", async () => {
      // Create existing user with username "alice"
      const testUser = createTestUser();
      await db.user.create({
        data: {
          ...testUser,
          username: "alice",
        },
      });

      const oauthData = {
        provider: "google",
        providerUserId: faker.string.uuid(),
        providerUsername: "Alice",
        email: faker.internet.email().toLowerCase(),
        name: "Alice",
      };

      const result = await createOAuthUser(db, oauthData);

      expect(result.success).toBe(true);
      expect(result.user?.username).toBe("alice-1");
    });

    it("should store provider username in OAuth record", async () => {
      const oauthData = {
        provider: "google",
        providerUserId: faker.string.uuid(),
        providerUsername: "google_user_display_name",
        email: faker.internet.email().toLowerCase(),
        name: "Display Name",
      };

      const result = await createOAuthUser(db, oauthData);

      expect(result.success).toBe(true);

      const oauthRecord = await db.oAuth.findFirst({
        where: { userId: result.user?.id },
      });
      expect(oauthRecord?.providerUsername).toBe("google_user_display_name");
    });

    it("should lowercase email when creating user", async () => {
      const oauthData = {
        provider: "google",
        providerUserId: faker.string.uuid(),
        providerUsername: "Test User",
        email: "TEST@EXAMPLE.COM",
        name: "Test User",
      };

      const result = await createOAuthUser(db, oauthData);

      expect(result.success).toBe(true);
      expect(result.user?.email).toBe("test@example.com");
    });

    it("should handle special characters in provider username", async () => {
      const oauthData = {
        provider: "apple",
        providerUserId: faker.string.uuid(),
        providerUsername: "Héllo Wörld! 🌍",
        email: faker.internet.email().toLowerCase(),
        name: "Héllo Wörld! 🌍",
      };

      const result = await createOAuthUser(db, oauthData);

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      // Username should be sanitized
      expect(result.user?.username).toMatch(/^[a-z0-9-]+$/);
    });
  });
});
