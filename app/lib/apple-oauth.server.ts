/**
 * Apple OAuth initiation utilities.
 *
 * Functions for generating Apple Sign In authorization URLs.
 * Uses Arctic library for OAuth flows.
 */

import type { AppleOAuthConfig } from "./env.server";

/**
 * Generates a cryptographically random state string for CSRF protection.
 * Returns a URL-safe string.
 */
export function generateOAuthState(): string {
  throw new Error("Not implemented");
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
  throw new Error("Not implemented");
}
