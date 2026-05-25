# Spoonjoy v2 Production Cutover Runbook

This runbook is for switching the stable `spoonjoy.app` production surface from Spoonjoy v1 to Spoonjoy v2.

## Hard Gate

Do not point `spoonjoy.app` at v2 until:

- The v2 staging Worker has passed `pnpm production:readiness`.
- The final v2 branch has passed `pnpm typecheck`, `pnpm test:coverage`, `pnpm build`, and `pnpm test:e2e`.
- The final v2 Worker has passed live smoke tests on `https://spoonjoy-v2.mendelow-studio.workers.dev`.
- Ari has provided the data migration instructions for legacy Spoonjoy v1 data.
- The migration has been rehearsed or dry-run against a non-production target when possible.

## Pre-Cutover Inventory

Record these before touching DNS:

- Current v1 hosting target for `spoonjoy.app`.
- Current v2 Worker version ID.
- Current v2 D1 database ID.
- Current R2 bucket name for uploaded images.
- Current Cloudflare account and zone used for `spoonjoy.app`.
- Current OAuth redirect URLs configured in Google and Apple.

## Secrets

Required runtime secrets:

- `SESSION_SECRET`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`

Feature secrets:

- Google OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- Apple OAuth: `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY`
- AI features: `OPENAI_API_KEY`

If a feature secret group is missing, either set it before cutover or confirm the UI does not advertise that feature. OAuth buttons are environment-aware in v2 and should only show configured providers.

## Data Migration

This section is intentionally a placeholder until Ari provides the source-of-truth migration instructions.

When the migration instructions arrive, add:

- Source database/export location.
- Target D1 database.
- Image/blob migration plan.
- User identity mapping.
- Recipe/cookbook/shopping-list/spoon mapping.
- Idempotency strategy.
- Verification queries.
- Rollback/restore plan.

Before cutover, create a D1 backup/export or other restorable snapshot for any v2 target receiving migrated production data.

## DNS And Custom Domain

1. Confirm `spoonjoy.app` is in the Cloudflare zone expected by Wrangler.
2. Add or update the Worker custom domain/route for `spoonjoy.app`.
3. Keep the staging Worker URL available during cutover.
4. Verify `https://spoonjoy.app/manifest.webmanifest`, `https://spoonjoy.app/sw.js`, and `/api/push/public-key`.
5. Verify TLS is active and no redirect loop exists.

## OAuth

Before DNS switch, update provider dashboards:

- Google authorized redirect URI: `https://spoonjoy.app/auth/google/callback`
- Apple redirect URI: `https://spoonjoy.app/auth/apple/callback`

After DNS switch, test OAuth start routes. If a provider is not configured, it should not appear on `/login` or `/signup`.

## Smoke Test

Run after deploy and again after DNS switch:

- `/` renders.
- `/login` renders and configured auth methods are accurate.
- `/signup` renders and configured auth methods are accurate.
- `/search?q=tomato&scope=all` returns results or an intentional empty state.
- `/users/demo_chef/fellow-chefs` renders.
- `/users/demo_chef/kitchen-visitors` renders.
- Authenticated `/shopping-list` renders and checkoff works.
- Authenticated recipe detail renders.
- Cook mode opens, persists progress across reload, and timers work on timed steps.
- Add-to-shopping-list works from recipe detail.
- Push public key endpoint returns a VAPID key.
- Slugger/Ouro MCP can search, create, update, delete, add to cookbook, list cookbooks, and read the shopping list.

## Rollback

If cutover fails:

1. Move `spoonjoy.app` route/DNS back to v1.
2. Leave the v2 staging Worker URL live for debugging.
3. Do not mutate migrated data further until the failure is understood.
4. If data corruption occurred, restore the pre-cutover D1 snapshot/export.
5. Record the failure, exact Worker version, and rollback time in the release notes.

