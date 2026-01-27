import { describe, it, expect } from "vitest";
import type { GoogleOAuthConfig } from "~/lib/env.server";

// Import functions that don't exist yet (TDD - tests first)
import {
  generateCodeVerifier,
  createGoogleAuthorizationURL,
} from "~/lib/google-oauth.server";

describe("google-oauth.server", () => {
  const mockConfig: GoogleOAuthConfig = {
    clientId: "123456789.apps.googleusercontent.com",
    clientSecret: "GOCSPX-test-secret-key",
  };
  const mockRedirectUri = "https://spoonjoy.app/auth/google/callback";

  describe("generateCodeVerifier", () => {
    it("should generate a random code verifier string", () => {
      const verifier = generateCodeVerifier();

      expect(typeof verifier).toBe("string");
      expect(verifier.length).toBeGreaterThan(0);
    });

    it("should generate unique code verifier values on each call", () => {
      const verifier1 = generateCodeVerifier();
      const verifier2 = generateCodeVerifier();

      expect(verifier1).not.toBe(verifier2);
    });

    it("should generate URL-safe code verifier values", () => {
      const verifier = generateCodeVerifier();

      // PKCE code verifier must be URL-safe (alphanumeric, hyphen, underscore, tilde, period)
      // RFC 7636: unreserved characters only [A-Z] / [a-z] / [0-9] / "-" / "." / "_" / "~"
      expect(verifier).toMatch(/^[a-zA-Z0-9._~-]+$/);
    });

    it("should generate code verifier with sufficient length for security", () => {
      const verifier = generateCodeVerifier();

      // RFC 7636: code_verifier must be between 43 and 128 characters
      expect(verifier.length).toBeGreaterThanOrEqual(43);
      expect(verifier.length).toBeLessThanOrEqual(128);
    });
  });

  describe("createGoogleAuthorizationURL", () => {
    it("should return a valid Google authorization URL", () => {
      const state = "test-state-123";
      const codeVerifier = "test-code-verifier-43-chars-long-minimum-length";
      const url = createGoogleAuthorizationURL(
        mockConfig,
        mockRedirectUri,
        state,
        codeVerifier
      );

      expect(url).toBeInstanceOf(URL);
      expect(url.hostname).toBe("accounts.google.com");
      expect(url.pathname).toBe("/o/oauth2/v2/auth");
    });

    it("should include client_id parameter", () => {
      const state = "test-state-123";
      const codeVerifier = "test-code-verifier-43-chars-long-minimum-length";
      const url = createGoogleAuthorizationURL(
        mockConfig,
        mockRedirectUri,
        state,
        codeVerifier
      );

      expect(url.searchParams.get("client_id")).toBe(mockConfig.clientId);
    });

    it("should include redirect_uri parameter", () => {
      const state = "test-state-123";
      const codeVerifier = "test-code-verifier-43-chars-long-minimum-length";
      const url = createGoogleAuthorizationURL(
        mockConfig,
        mockRedirectUri,
        state,
        codeVerifier
      );

      expect(url.searchParams.get("redirect_uri")).toBe(mockRedirectUri);
    });

    it("should include state parameter for CSRF protection", () => {
      const state = "test-state-123";
      const codeVerifier = "test-code-verifier-43-chars-long-minimum-length";
      const url = createGoogleAuthorizationURL(
        mockConfig,
        mockRedirectUri,
        state,
        codeVerifier
      );

      expect(url.searchParams.get("state")).toBe(state);
    });

    it("should include response_type=code", () => {
      const state = "test-state-123";
      const codeVerifier = "test-code-verifier-43-chars-long-minimum-length";
      const url = createGoogleAuthorizationURL(
        mockConfig,
        mockRedirectUri,
        state,
        codeVerifier
      );

      expect(url.searchParams.get("response_type")).toBe("code");
    });

    it("should include code_challenge parameter for PKCE", () => {
      const state = "test-state-123";
      const codeVerifier = "test-code-verifier-43-chars-long-minimum-length";
      const url = createGoogleAuthorizationURL(
        mockConfig,
        mockRedirectUri,
        state,
        codeVerifier
      );

      // code_challenge should be present (derived from code_verifier)
      const codeChallenge = url.searchParams.get("code_challenge");
      expect(codeChallenge).toBeDefined();
      expect(codeChallenge).not.toBe("");
      // code_challenge is base64url encoded SHA-256 hash, so it should be URL-safe
      expect(codeChallenge).toMatch(/^[a-zA-Z0-9_-]+$/);
    });

    it("should include code_challenge_method=S256 for PKCE", () => {
      const state = "test-state-123";
      const codeVerifier = "test-code-verifier-43-chars-long-minimum-length";
      const url = createGoogleAuthorizationURL(
        mockConfig,
        mockRedirectUri,
        state,
        codeVerifier
      );

      expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    });

    it("should request openid scope", () => {
      const state = "test-state-123";
      const codeVerifier = "test-code-verifier-43-chars-long-minimum-length";
      const url = createGoogleAuthorizationURL(
        mockConfig,
        mockRedirectUri,
        state,
        codeVerifier
      );

      const scope = url.searchParams.get("scope");
      expect(scope).toContain("openid");
    });

    it("should request email scope", () => {
      const state = "test-state-123";
      const codeVerifier = "test-code-verifier-43-chars-long-minimum-length";
      const url = createGoogleAuthorizationURL(
        mockConfig,
        mockRedirectUri,
        state,
        codeVerifier
      );

      const scope = url.searchParams.get("scope");
      expect(scope).toContain("email");
    });

    it("should request profile scope", () => {
      const state = "test-state-123";
      const codeVerifier = "test-code-verifier-43-chars-long-minimum-length";
      const url = createGoogleAuthorizationURL(
        mockConfig,
        mockRedirectUri,
        state,
        codeVerifier
      );

      const scope = url.searchParams.get("scope");
      expect(scope).toContain("profile");
    });

    it("should include all required scopes (openid, email, profile)", () => {
      const state = "test-state-123";
      const codeVerifier = "test-code-verifier-43-chars-long-minimum-length";
      const url = createGoogleAuthorizationURL(
        mockConfig,
        mockRedirectUri,
        state,
        codeVerifier
      );

      const scope = url.searchParams.get("scope");
      // Scopes should be space-separated
      expect(scope).toMatch(/\bopenid\b/);
      expect(scope).toMatch(/\bemail\b/);
      expect(scope).toMatch(/\bprofile\b/);
    });

    it("should properly encode special characters in state", () => {
      const state = "state&with=special+chars";
      const codeVerifier = "test-code-verifier-43-chars-long-minimum-length";
      const url = createGoogleAuthorizationURL(
        mockConfig,
        mockRedirectUri,
        state,
        codeVerifier
      );

      // URLSearchParams should handle encoding
      expect(url.searchParams.get("state")).toBe(state);
      // The raw URL string should have the encoded value
      expect(url.toString()).toContain("state=state%26with%3Dspecial%2Bchars");
    });

    it("should properly encode redirect_uri with query parameters", () => {
      const state = "test-state";
      const codeVerifier = "test-code-verifier-43-chars-long-minimum-length";
      const redirectWithQuery =
        "https://spoonjoy.app/auth/google/callback?foo=bar&baz=qux";
      const url = createGoogleAuthorizationURL(
        mockConfig,
        redirectWithQuery,
        state,
        codeVerifier
      );

      // Should properly encode the redirect_uri
      expect(url.searchParams.get("redirect_uri")).toBe(redirectWithQuery);
    });

    it("should generate different code_challenge for different code_verifier", () => {
      const state = "test-state-123";
      const verifier1 = "test-code-verifier-one-43-chars-long-minimum";
      const verifier2 = "test-code-verifier-two-43-chars-long-minimum";

      const url1 = createGoogleAuthorizationURL(
        mockConfig,
        mockRedirectUri,
        state,
        verifier1
      );
      const url2 = createGoogleAuthorizationURL(
        mockConfig,
        mockRedirectUri,
        state,
        verifier2
      );

      expect(url1.searchParams.get("code_challenge")).not.toBe(
        url2.searchParams.get("code_challenge")
      );
    });
  });
});
