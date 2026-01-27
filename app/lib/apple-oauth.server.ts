/**
 * Apple OAuth initiation utilities.
 *
 * Functions for generating Apple Sign In authorization URLs.
 * Uses Arctic library for OAuth flows.
 */

import type { AppleOAuthConfig } from "./env.server";

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
