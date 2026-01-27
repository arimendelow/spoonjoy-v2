/**
 * Apple OAuth utilities.
 *
 * Functions for generating Apple Sign In authorization URLs and handling callbacks.
 * Uses Arctic library for OAuth flows.
 */

import type { AppleOAuthConfig } from "./env.server";

/**
 * Data received from Apple's OAuth callback (POST request body).
 */
export interface AppleCallbackData {
  /** Authorization code from Apple */
  code: string;
  /** CSRF protection state */
  state: string;
  /** User info JSON (only provided on first sign-in) */
  user?: string;
}

/**
 * Apple user data extracted from the callback.
 */
export interface AppleUser {
  /** Apple's unique user identifier (sub claim from ID token) */
  id: string;
  /** User's email address */
  email: string;
  /** Whether the email is verified (always true for Apple) */
  emailVerified: boolean;
  /** Whether this is a private relay email (Hide My Email) */
  isPrivateEmail: boolean;
  /** User's first name (only on first sign-in, may be null) */
  firstName: string | null;
  /** User's last name (only on first sign-in, may be null) */
  lastName: string | null;
  /** Full name constructed from first and last name */
  fullName: string | null;
}

/**
 * Result of verifying Apple OAuth callback.
 */
export interface AppleCallbackResult {
  success: boolean;
  appleUser?: AppleUser;
  error?: string;
  message?: string;
}

/**
 * Generates a cryptographically random state string for CSRF protection.
 * Returns a URL-safe string (alphanumeric, underscore, hyphen only).
 */
export function generateOAuthState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  // Convert to base64url (URL-safe: A-Z, a-z, 0-9, -, _)
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Creates an Apple authorization URL for initiating Sign in with Apple.
 *
 * @param config - Apple OAuth configuration (from env.server.ts)
 * @param redirectUri - The callback URL Apple will redirect to
 * @param state - CSRF protection state (generate via generateOAuthState)
 * @returns URL object pointing to Apple's authorization endpoint
 *
 * Note: Apple requires response_mode=form_post when requesting scopes.
 * This means the callback will be a POST request, not GET.
 */
export function createAppleAuthorizationURL(
  config: AppleOAuthConfig,
  redirectUri: string,
  state: string
): URL {
  const url = new URL("https://appleid.apple.com/auth/authorize");

  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("response_mode", "form_post");
  url.searchParams.set("scope", "email name");

  return url;
}

/**
 * Verifies Apple OAuth callback and extracts user data.
 *
 * @param config - Apple OAuth configuration (from env.server.ts)
 * @param redirectUri - The callback URL used in the initial authorization request
 * @param callbackData - Data from Apple's POST callback (code, state, user)
 * @returns Result with appleUser on success, or error details on failure
 *
 * Note: This function validates the authorization code with Apple,
 * decodes the ID token, and extracts user information.
 */
export async function verifyAppleCallback(
  config: AppleOAuthConfig,
  redirectUri: string,
  callbackData: AppleCallbackData
): Promise<AppleCallbackResult> {
  // Stub implementation - throws for TDD
  throw new Error("Not implemented");
}
