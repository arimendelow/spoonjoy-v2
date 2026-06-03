# Setup Notes

## Environment State

- Checked production Worker secrets with `pnpm exec wrangler secret list` on 2026-06-03.
- `POSTHOG_KEY`: not present in Cloudflare secrets.
- `POSTHOG_HOST`: not present as a Cloudflare secret or var.
- `POSTHOG_DISABLED`: not present as a Cloudflare secret or var.
- Local env files checked for variable names only: `.env`, `.env.local`, `.dev.vars`, `.env.example`.
- Actual local PostHog values were not printed.
- `.env.example` declares `VITE_POSTHOG_KEY` and `VITE_POSTHOG_HOST`.
- No actual local `VITE_POSTHOG_KEY` value was found by name in `.env`, `.env.local`, or `.dev.vars`.
- `wrangler.json` production vars currently include `NODE_ENV` and `SPOONJOY_BASE_URL`, not PostHog vars.

## Existing Telemetry State

- Client analytics is already gated by `VITE_POSTHOG_KEY` in `app/entry.client.tsx` through `resolvePostHogConfig` in `app/lib/analytics.ts`.
- Client pageviews are captured in `app/root.tsx` with origin + pathname only.
- Recipe-detail client events exist in `app/routes/recipes.$id.tsx`.
- Server-side PostHog capture currently only covers exceptions through `captureException` in `app/lib/analytics-server.ts`.
- Existing server exception wiring appears in `app/entry.server.tsx`, `workers/app.ts`, `app/routes/api.$.ts`, and `app/lib/mcp/http-mcp.server.ts`.

## Route Chokepoints

- API v1 route shell: `app/routes/api.v1.$.ts`
- API v1 centralized handler: `app/lib/api-v1.server.ts`
- Legacy API route shell/dispatcher: `app/routes/api.$.ts`
- MCP HTTP transport: `app/lib/mcp/http-mcp.server.ts`
- OAuth register shell: `app/routes/oauth.register.ts`
- OAuth authorize shell: `app/routes/oauth.authorize.tsx`
- OAuth token shell: `app/routes/oauth.token.ts`
- OAuth revoke shell: `app/routes/oauth.revoke.ts`
- OAuth shared handlers: `app/lib/oauth-routes.server.ts`
- Developer docs surface: `app/routes/developers.tsx`
- Developer playground surface: `app/routes/developers.playground.tsx`
- Generated playground manifest: `app/lib/generated/api-v1-playground.ts`

## Implementation Files

- Server event helper: `app/lib/analytics-server.ts`
- Client event helper/bootstrap: `app/lib/analytics.ts`, `app/entry.client.tsx`, `app/vite-env.d.ts`
- API v1 telemetry: `app/lib/api-v1.server.ts`, with `app/routes/api.v1.$.ts` only if type plumbing requires it
- Legacy API telemetry: `app/routes/api.$.ts`
- MCP telemetry: `app/lib/mcp/http-mcp.server.ts`
- OAuth telemetry: `app/routes/oauth.register.ts`, `app/routes/oauth.authorize.tsx`, `app/routes/oauth.token.ts`, `app/routes/oauth.revoke.ts`, `app/lib/oauth-routes.server.ts`
- Developer docs/playground telemetry: `app/lib/analytics.ts`, `app/routes/developers.tsx`, `app/routes/developers.playground.tsx`
- Docs/config: `docs/analytics-privacy.md`, `.env.example`, `README.md`, `DEPLOY.md`, `app/cloudflare-env.d.ts`, `wrangler.json` only if a non-secret PostHog var is needed

## Test Targets

- Server analytics helper: `test/lib/analytics-server.test.ts`
- Client analytics helper: `test/lib/analytics.test.ts`
- API v1 telemetry: existing `test/routes/api-v1-*.test.ts` and/or focused `test/lib/api-v1*.test.ts`
- Legacy API route shell: `test/routes/route-shell-coverage.test.ts` or a focused legacy API route test
- MCP telemetry: `test/lib/mcp/http-mcp.server.test.ts`
- OAuth telemetry: existing focused OAuth route tests
- Developer docs/playground telemetry: `test/routes/developers.test.tsx`, `test/routes/developers-playground.test.tsx`, and helper coverage in `test/lib/analytics.test.ts`
- Deployment/docs preflight: `test/scripts/deployment-preflight.test.ts`, `test/scripts/production-readiness.test.ts` if existing coverage applies
