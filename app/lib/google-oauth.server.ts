/**
 * Google OAuth utilities.
 *
 * Functions for generating Google Sign In authorization URLs and handling callbacks.
 * Uses PKCE (Proof Key for Code Exchange) for enhanced security.
 */

import type { GoogleOAuthConfig } from "./env.server";

/**
 * Data received from Google's OAuth callback (GET request query params).
 */
export interface GoogleCallbackData {
  /** Authorization code from Google */
  code: string;
  /** CSRF protection state */
  state: string;
  /** PKCE code verifier (stored client-side during initiation) */
  codeVerifier: string;
}

/**
 * Google user data extracted from the callback.
 */
export interface GoogleUser {
  /** Google's unique user identifier (sub claim) */
  id: string;
  /** User's email address */
  email: string;
  /** Whether the email is verified */
  emailVerified: boolean;
  /** User's full display name */
  name: string | null;
  /** User's given (first) name */
  givenName: string | null;
  /** User's family (last) name */
  familyName: string | null;
  /** Profile picture URL */
  picture: string | null;
}

/**
 * Result of verifying Google OAuth callback.
 */
export interface GoogleCallbackResult {
  success: boolean;
  googleUser?: GoogleUser;
  error?: string;
  message?: string;
}

// SHA-256 constants (first 32 bits of fractional parts of cube roots of first 64 primes)
const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

/**
 * Pure JavaScript SHA-256 implementation for synchronous code challenge generation.
 * Used for PKCE flow where we need synchronous hashing.
 */
function sha256(message: Uint8Array): Uint8Array {
  let H = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
    0x1f83d9ab, 0x5be0cd19,
  ];

  const len = message.length;
  const bitLen = len * 8;

  // Pre-processing: adding padding bits
  const padLen = ((len + 8) >>> 6) * 64 + 64;
  const padded = new Uint8Array(padLen);
  padded.set(message);
  padded[len] = 0x80;

  // Append original length in bits as 64-bit big-endian
  const view = new DataView(padded.buffer);
  view.setUint32(padLen - 4, bitLen, false);

  // Process each 512-bit chunk
  for (let i = 0; i < padLen; i += 64) {
    const W = new Uint32Array(64);
    for (let j = 0; j < 16; j++) {
      W[j] = view.getUint32(i + j * 4, false);
    }
    for (let j = 16; j < 64; j++) {
      const s0 =
        ((W[j - 15] >>> 7) | (W[j - 15] << 25)) ^
        ((W[j - 15] >>> 18) | (W[j - 15] << 14)) ^
        (W[j - 15] >>> 3);
      const s1 =
        ((W[j - 2] >>> 17) | (W[j - 2] << 15)) ^
        ((W[j - 2] >>> 19) | (W[j - 2] << 13)) ^
        (W[j - 2] >>> 10);
      W[j] = (W[j - 16] + s0 + W[j - 7] + s1) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = H;

    for (let j = 0; j < 64; j++) {
      const S1 =
        ((e >>> 6) | (e << 26)) ^
        ((e >>> 11) | (e << 21)) ^
        ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[j] + W[j]) >>> 0;
      const S0 =
        ((a >>> 2) | (a << 30)) ^
        ((a >>> 13) | (a << 19)) ^
        ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    H = [
      (H[0] + a) >>> 0,
      (H[1] + b) >>> 0,
      (H[2] + c) >>> 0,
      (H[3] + d) >>> 0,
      (H[4] + e) >>> 0,
      (H[5] + f) >>> 0,
      (H[6] + g) >>> 0,
      (H[7] + h) >>> 0,
    ];
  }

  const result = new Uint8Array(32);
  const resultView = new DataView(result.buffer);
  for (let i = 0; i < 8; i++) {
    resultView.setUint32(i * 4, H[i], false);
  }
  return result;
}

/**
 * Generates a code challenge from a code verifier using SHA-256 (S256 method).
 * Returns base64url-encoded challenge per RFC 7636.
 */
function generateCodeChallenge(codeVerifier: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hash = sha256(data);
  return btoa(String.fromCharCode(...hash))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Generates a cryptographically random code verifier for PKCE.
 * Returns a URL-safe string suitable for OAuth 2.0 PKCE flow.
 *
 * Per RFC 7636, code verifier must be:
 * - Between 43 and 128 characters
 * - Only unreserved characters: [A-Z] / [a-z] / [0-9] / "-" / "." / "_" / "~"
 */
export function generateCodeVerifier(): string {
  // Use 32 bytes of randomness, which produces 43 base64url characters (43-128 range per RFC 7636)
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  // Convert to base64url (URL-safe: A-Z, a-z, 0-9, -, _)
  // Note: base64url uses - and _ which are valid RFC 7636 unreserved characters
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
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
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");

  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("code_challenge", generateCodeChallenge(codeVerifier));

  return url;
}

/**
 * Verifies Google OAuth callback and extracts user data.
 *
 * @param config - Google OAuth configuration (from env.server.ts)
 * @param redirectUri - The callback URL used in the initial authorization request
 * @param callbackData - Data from Google's GET callback (code, state, codeVerifier)
 * @returns Result with googleUser on success, or error details on failure
 *
 * Note: This function validates the authorization code with Google using PKCE,
 * then fetches user info from the userinfo endpoint.
 */
export async function verifyGoogleCallback(
  _config: GoogleOAuthConfig,
  _redirectUri: string,
  _callbackData: GoogleCallbackData
): Promise<GoogleCallbackResult> {
  throw new Error("Not implemented");
}
