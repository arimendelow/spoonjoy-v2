/**
 * Google OAuth utilities.
 *
 * Functions for generating Google Sign In authorization URLs and handling callbacks.
 * Uses PKCE (Proof Key for Code Exchange) for enhanced security.
 */

import type { GoogleOAuthConfig } from "./env.server";

/**
 * Generates a cryptographically random code verifier for PKCE.
 * Returns a URL-safe string suitable for OAuth 2.0 PKCE flow.
 *
 * Per RFC 7636, code verifier must be:
 * - Between 43 and 128 characters
 * - Only unreserved characters: [A-Z] / [a-z] / [0-9] / "-" / "." / "_" / "~"
 */
export function generateCodeVerifier(): string {
  throw new Error("Not implemented");
}

/**
 * Creates a Google authorization URL for initiating Sign in with Google.
 *
 * @param config - Google OAuth configuration (from env.server.ts)
 * @param redirectUri - The callback URL Google will redirect to
 * @param state - CSRF protection state (generate via generateOAuthState)
 * @param codeVerifier - PKCE code verifier (generate via generateCodeVerifier)
 * @returns URL object pointing to Google's authorization endpoint
 *
 * Note: Google uses standard OAuth 2.0 redirect flow (GET callback).
 * PKCE is required for security - the code_challenge is derived from codeVerifier.
 */
export function createGoogleAuthorizationURL(
  config: GoogleOAuthConfig,
  redirectUri: string,
  state: string,
  codeVerifier: string
): URL {
  throw new Error("Not implemented");
}
