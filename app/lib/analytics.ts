export const DEFAULT_POSTHOG_HOST = "https://us.i.posthog.com";

const TRUE_ENV_VALUES = new Set(["1", "true", "yes", "on"]);

export type PostHogEnv = {
  readonly VITE_POSTHOG_KEY?: string | boolean;
  readonly VITE_POSTHOG_HOST?: string | boolean;
  readonly VITE_POSTHOG_DISABLED?: string | boolean;
};

export type PostHogConfig =
  | { enabled: true; key: string; host: string }
  | { enabled: false; reason: "disabled" | "missing-key" };

export function isTruthyEnvFlag(value: string | boolean | undefined) {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return false;

  return TRUE_ENV_VALUES.has(value.trim().toLowerCase());
}

function readEnvString(value: string | boolean | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

export function resolvePostHogConfig(env: PostHogEnv): PostHogConfig {
  if (isTruthyEnvFlag(env.VITE_POSTHOG_DISABLED)) {
    return { enabled: false, reason: "disabled" };
  }

  const key = readEnvString(env.VITE_POSTHOG_KEY);
  if (!key) {
    return { enabled: false, reason: "missing-key" };
  }

  return {
    enabled: true,
    key,
    host: readEnvString(env.VITE_POSTHOG_HOST) || DEFAULT_POSTHOG_HOST,
  };
}

export function toAnalyticsPageUrl(location: Pick<Location | URL, "origin" | "pathname">) {
  return `${location.origin}${location.pathname}`;
}
