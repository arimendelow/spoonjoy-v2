import { describe, expect, it } from "vitest";
import {
  DEFAULT_POSTHOG_HOST,
  isTruthyEnvFlag,
  resolvePostHogConfig,
  toAnalyticsPageUrl,
} from "~/lib/analytics";

describe("analytics configuration", () => {
  it("treats true-ish environment flags as enabled", () => {
    expect(isTruthyEnvFlag(true)).toBe(true);
    expect(isTruthyEnvFlag("1")).toBe(true);
    expect(isTruthyEnvFlag(" TRUE ")).toBe(true);
    expect(isTruthyEnvFlag("yes")).toBe(true);
    expect(isTruthyEnvFlag("on")).toBe(true);
  });

  it("treats false, missing, and unrecognized environment flags as disabled", () => {
    expect(isTruthyEnvFlag(false)).toBe(false);
    expect(isTruthyEnvFlag(undefined)).toBe(false);
    expect(isTruthyEnvFlag("0")).toBe(false);
    expect(isTruthyEnvFlag("false")).toBe(false);
    expect(isTruthyEnvFlag("off")).toBe(false);
  });

  it("disables PostHog when the key is missing or blank", () => {
    expect(resolvePostHogConfig({})).toEqual({
      enabled: false,
      reason: "missing-key",
    });
    expect(resolvePostHogConfig({ VITE_POSTHOG_KEY: "   " })).toEqual({
      enabled: false,
      reason: "missing-key",
    });
    expect(resolvePostHogConfig({ VITE_POSTHOG_KEY: true })).toEqual({
      enabled: false,
      reason: "missing-key",
    });
  });

  it("disables PostHog when the explicit disable flag is true-ish", () => {
    expect(
      resolvePostHogConfig({
        VITE_POSTHOG_KEY: "ph_test_key",
        VITE_POSTHOG_DISABLED: "true",
      })
    ).toEqual({
      enabled: false,
      reason: "disabled",
    });
    expect(
      resolvePostHogConfig({
        VITE_POSTHOG_KEY: "ph_test_key",
        VITE_POSTHOG_DISABLED: true,
      })
    ).toEqual({
      enabled: false,
      reason: "disabled",
    });
  });

  it("uses the default PostHog host when no custom host is configured", () => {
    expect(resolvePostHogConfig({ VITE_POSTHOG_KEY: " ph_test_key " })).toEqual({
      enabled: true,
      key: "ph_test_key",
      host: DEFAULT_POSTHOG_HOST,
    });
  });

  it("uses a custom PostHog host when configured", () => {
    expect(
      resolvePostHogConfig({
        VITE_POSTHOG_KEY: "ph_test_key",
        VITE_POSTHOG_HOST: " https://eu.i.posthog.com ",
        VITE_POSTHOG_DISABLED: "false",
      })
    ).toEqual({
      enabled: true,
      key: "ph_test_key",
      host: "https://eu.i.posthog.com",
    });
  });

  it("uses origin and pathname for page URLs without query strings or hashes", () => {
    expect(toAnalyticsPageUrl(new URL("https://spoonjoy.app/recipes/abc?token=secret#step-2"))).toBe(
      "https://spoonjoy.app/recipes/abc"
    );
    expect(
      toAnalyticsPageUrl({
        origin: "https://spoonjoy.app",
        pathname: "/api/playground",
        search: "?access_token=secret",
        hash: "#oauth-code",
      } as Location)
    ).toBe("https://spoonjoy.app/api/playground");
  });
});
