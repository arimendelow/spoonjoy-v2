import type { PrismaClient } from "@prisma/client";

export interface OAuthUserData {
  provider: string;
  providerUserId: string;
  providerUsername: string;
  email: string;
  name: string | null;
}

export interface CreateOAuthUserResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    username: string;
  };
  error?: string;
  message?: string;
}

/**
 * Generate a username from a name or email address.
 * Handles collisions by appending numbers.
 *
 * TODO: Implement this function
 */
export async function generateUsername(
  _db: PrismaClient,
  _name: string | null,
  _email: string | null
): Promise<string> {
  throw new Error("Not implemented: generateUsername");
}

/**
 * Create a new user from OAuth provider data.
 * Returns error if email already exists (user should log in to link account).
 *
 * TODO: Implement this function
 */
export async function createOAuthUser(
  _db: PrismaClient,
  _oauthData: OAuthUserData
): Promise<CreateOAuthUserResult> {
  throw new Error("Not implemented: createOAuthUser");
}
