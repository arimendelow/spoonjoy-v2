import { describe, it, expect } from "vitest";
import {
  createAppleAuthorizationURL,
  generateOAuthState,
} from "~/lib/apple-oauth.server";
import type { AppleOAuthConfig } from "~/lib/env.server";

describe("apple-oauth.server", () => {
  const mockConfig: AppleOAuthConfig = {
    clientId: "com.spoonjoy.app",
    teamId: "TEAM123456",
    keyId: "KEY123456",
    privateKey: `-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgtest1234567890
test1234567890test1234567890test1234567890oAoGCCqGSM49AwEH
oUQDQgAEtest1234567890test1234567890test1234567890test1234
567890test1234567890test1234567890==
-----END PRIVATE KEY-----`,
  };
  const mockRedirectUri = "https://spoonjoy.app/auth/apple/callback";

  describe("generateOAuthState", () => {
    it("should generate a random state string", () => {
      const state = generateOAuthState();

      expect(typeof state).toBe("string");
      expect(state.length).toBeGreaterThan(0);
    });

    it("should generate unique state values on each call", () => {
      const state1 = generateOAuthState();
      const state2 = generateOAuthState();

      expect(state1).not.toBe(state2);
    });

    it("should generate URL-safe state values", () => {
      const state = generateOAuthState();

      // State should be URL-safe (alphanumeric, no special chars that need encoding)
      expect(state).toMatch(/^[a-zA-Z0-9_-]+$/);
    });
  });

  describe("createAppleAuthorizationURL", () => {
    it("should return a valid Apple authorization URL", () => {
      const state = "test-state-123";
      const url = createAppleAuthorizationURL(mockConfig, mockRedirectUri, state);

      expect(url).toBeInstanceOf(URL);
      expect(url.hostname).toBe("appleid.apple.com");
      expect(url.pathname).toBe("/auth/authorize");
    });

    it("should include client_id parameter", () => {
      const state = "test-state-123";
      const url = createAppleAuthorizationURL(mockConfig, mockRedirectUri, state);

      expect(url.searchParams.get("client_id")).toBe(mockConfig.clientId);
    });

    it("should include redirect_uri parameter", () => {
      const state = "test-state-123";
      const url = createAppleAuthorizationURL(mockConfig, mockRedirectUri, state);

      expect(url.searchParams.get("redirect_uri")).toBe(mockRedirectUri);
    });

    it("should include state parameter for CSRF protection", () => {
      const state = "test-state-123";
      const url = createAppleAuthorizationURL(mockConfig, mockRedirectUri, state);

      expect(url.searchParams.get("state")).toBe(state);
    });

    it("should include response_type=code", () => {
      const state = "test-state-123";
      const url = createAppleAuthorizationURL(mockConfig, mockRedirectUri, state);

      expect(url.searchParams.get("response_type")).toBe("code");
    });

    it("should include response_mode=form_post (required by Apple for scopes)", () => {
      const state = "test-state-123";
      const url = createAppleAuthorizationURL(mockConfig, mockRedirectUri, state);

      // Apple requires response_mode=form_post when requesting scopes
      expect(url.searchParams.get("response_mode")).toBe("form_post");
    });

    it("should request email scope", () => {
      const state = "test-state-123";
      const url = createAppleAuthorizationURL(mockConfig, mockRedirectUri, state);

      const scope = url.searchParams.get("scope");
      expect(scope).toContain("email");
    });

    it("should request name scope", () => {
      const state = "test-state-123";
      const url = createAppleAuthorizationURL(mockConfig, mockRedirectUri, state);

      const scope = url.searchParams.get("scope");
      expect(scope).toContain("name");
    });

    it("should include both email and name in scope parameter", () => {
      const state = "test-state-123";
      const url = createAppleAuthorizationURL(mockConfig, mockRedirectUri, state);

      const scope = url.searchParams.get("scope");
      // Scope should include both email and name (space-separated)
      expect(scope).toMatch(/\bemail\b/);
      expect(scope).toMatch(/\bname\b/);
    });
  });
});
