# Analytics And Privacy

Spoonjoy uses optional client-side PostHog analytics for product usage signals. Analytics is disabled by default in local development and in any environment without a `VITE_POSTHOG_KEY`.

## Configuration

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_POSTHOG_KEY` | No | Enables PostHog when present and non-blank. Missing or blank values keep analytics disabled. |
| `VITE_POSTHOG_HOST` | No | Overrides the PostHog ingestion host. Defaults to `https://us.i.posthog.com`. |
| `VITE_POSTHOG_DISABLED` | No | Force-disables PostHog when set to `1`, `true`, `yes`, or `on`. Useful for privacy-sensitive previews and local smoke tests. |

These variables are public Vite client variables. Do not put secrets in them.

## Local And Preview Behavior

Basic local development does not need analytics configuration. If `VITE_POSTHOG_KEY` is absent, the app still renders normally and does not initialize PostHog.

Set `VITE_POSTHOG_DISABLED=true` when you need to verify a production-like environment while guaranteeing analytics and session recording stay off.

## Payload Review

Current analytics events are intentionally limited to product telemetry:

| Surface | Event data |
| --- | --- |
| Route changes | Page URL origin and pathname only; query strings and hashes are not sent. |
| Logged-in sessions | Internal Spoonjoy user id through PostHog `identify`; no email or username. |
| Recipe detail | Recipe id, chef id, step counts, owner status, time-on-page, scale factor, checklist ids/counts, share method/success, cookbook ids, and shopping-list source. |

User-entered free text, including recipe titles, cookbook titles, recipe descriptions, ingredient names, and shopping-list item names, should not be added to analytics payloads without a fresh privacy review.

## Session Recording

When analytics is enabled, PostHog session recording is configured to mask all text and all form inputs:

- `maskTextSelector: "*"`
- `maskAllInputs: true`

This is a defense-in-depth measure, not permission to send sensitive content in explicit event payloads. Event payloads should still use ids, counts, booleans, and controlled enum-like values.
