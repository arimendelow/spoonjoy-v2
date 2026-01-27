/**
 * Apple OAuth callback handler.
 *
 * Orchestrates the full OAuth callback flow including:
 * - User creation (new OAuth user)
 * - Returning user login
 * - Account linking (existing user)
 * - Redirect logic
 */

import type { PrismaClient } from "@prisma/client";
import type { AppleUser } from "./apple-oauth.server";

/**
 * Parameters for handling Apple OAuth callback.
 */
export interface AppleOAuthCallbackParams {
  /** Prisma database client */
  db: PrismaClient;
  /** Apple user data from verified callback */
  appleUser: AppleUser;
  /** Current logged-in user ID (null if not logged in) */
  currentUserId: string | null;
  /** Where to redirect after successful auth */
  redirectTo: string | null;
}

/**
 * Actions that can result from the callback.
 */
export type AppleOAuthCallbackAction =
  | "user_created"
  | "user_logged_in"
  | "account_linked";

/**
 * Result of handling Apple OAuth callback.
 */
export interface AppleOAuthCallbackResult {
  success: boolean;
  /** The user ID (for session creation) */
  userId?: string;
  /** What action was performed */
  action?: AppleOAuthCallbackAction;
  /** Where to redirect */
  redirectTo: string;
  /** Error code on failure */
  error?: string;
  /** Error message on failure */
  message?: string;
}

/**
 * Handles Apple OAuth callback after token verification.
 *
 * Flow:
 * 1. If user is logged in (currentUserId): Link Apple account to existing user
 * 2. If Apple account exists in DB: Log in returning user
 * 3. If email exists in DB: Error (user should log in to link)
 * 4. Otherwise: Create new user
 *
 * @param params - Callback parameters
 * @returns Result with userId on success, or error details on failure
 */
export async function handleAppleOAuthCallback(
  params: AppleOAuthCallbackParams
): Promise<AppleOAuthCallbackResult> {
  // Stub implementation - throws for TDD
  throw new Error("Not implemented");
}
