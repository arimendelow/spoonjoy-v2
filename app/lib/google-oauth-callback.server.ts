/**
 * Google OAuth callback handler.
 *
 * Orchestrates the full OAuth callback flow including:
 * - User creation (new OAuth user)
 * - Returning user login
 * - Account linking (existing user)
 * - Redirect logic
 */

import type { PrismaClient } from "@prisma/client";
import type { GoogleUser } from "./google-oauth.server";
import {
  createOAuthUser,
  findExistingOAuthAccount,
  linkOAuthAccount,
} from "./oauth-user.server";

/**
 * Parameters for handling Google OAuth callback.
 */
export interface GoogleOAuthCallbackParams {
  /** Prisma database client */
  db: PrismaClient;
  /** Google user data from verified callback */
  googleUser: GoogleUser;
  /** Current logged-in user ID (null if not logged in) */
  currentUserId: string | null;
  /** Where to redirect after successful auth */
  redirectTo: string | null;
}

/**
 * Actions that can result from the callback.
 */
export type GoogleOAuthCallbackAction =
  | "user_created"
  | "user_logged_in"
  | "account_linked";

/**
 * Result of handling Google OAuth callback.
 */
export interface GoogleOAuthCallbackResult {
  success: boolean;
  /** The user ID (for session creation) */
  userId?: string;
  /** What action was performed */
  action?: GoogleOAuthCallbackAction;
  /** Where to redirect */
  redirectTo: string;
  /** Error code on failure */
  error?: string;
  /** Error message on failure */
  message?: string;
}

/**
 * Handles Google OAuth callback after token verification.
 *
 * Flow:
 * 1. If user is logged in (currentUserId): Link Google account to existing user
 * 2. If Google account exists in DB: Log in returning user
 * 3. If email exists in DB: Error (user should log in to link)
 * 4. Otherwise: Create new user
 *
 * @param params - Callback parameters
 * @returns Result with userId on success, or error details on failure
 */
export async function handleGoogleOAuthCallback(
  params: GoogleOAuthCallbackParams
): Promise<GoogleOAuthCallbackResult> {
  const { db, googleUser, currentUserId, redirectTo } = params;

  // Default redirect destination
  const defaultRedirect = redirectTo ?? "/";

  // Flow 1: User is logged in - link Google account to existing user
  if (currentUserId) {
    const linkResult = await linkOAuthAccount(db, currentUserId, {
      provider: "google",
      providerUserId: googleUser.id,
      providerUsername: googleUser.name ?? googleUser.email,
    });

    if (!linkResult.success) {
      return {
        success: false,
        error: linkResult.error,
        message: linkResult.message,
        redirectTo: defaultRedirect,
      };
    }

    return {
      success: true,
      userId: currentUserId,
      action: "account_linked",
      redirectTo: defaultRedirect,
    };
  }

  // Flow 2: Check if Google account already exists (returning user)
  const existingOAuthAccount = await findExistingOAuthAccount(
    db,
    "google",
    googleUser.id
  );

  if (existingOAuthAccount) {
    return {
      success: true,
      userId: existingOAuthAccount.userId,
      action: "user_logged_in",
      redirectTo: defaultRedirect,
    };
  }

  // Flow 3: Check if email exists (case-insensitive)
  // Use raw SQL for case-insensitive email comparison in SQLite
  const normalizedEmail = googleUser.email.toLowerCase();
  const existingUsersByEmail = await db.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM User WHERE LOWER(email) = ${normalizedEmail}
  `;

  if (existingUsersByEmail.length > 0) {
    return {
      success: false,
      error: "account_exists",
      message:
        "An account with this email already exists. Please log in to link your Google account.",
      redirectTo: defaultRedirect,
    };
  }

  // Flow 4: Create new user
  const createResult = await createOAuthUser(db, {
    provider: "google",
    providerUserId: googleUser.id,
    providerUsername: googleUser.name ?? googleUser.email,
    email: googleUser.email,
    name: googleUser.name,
  });

  if (!createResult.success) {
    return {
      success: false,
      error: createResult.error,
      message: createResult.message,
      redirectTo: defaultRedirect,
    };
  }

  return {
    success: true,
    userId: createResult.user!.id,
    action: "user_created",
    redirectTo: defaultRedirect,
  };
}
