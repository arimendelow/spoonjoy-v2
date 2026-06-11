# Planning: MCP/API Image Cover Smokes

**Status**: NEEDS_REVIEW
**Created**: 2026-06-11 12:21

## Goal
Add a QA-targeted live smoke mode that proves Spoonjoy's remote API/MCP image and cover operations work end to end without touching production data or leaving disposable residue.

## Upstream Work Items
- `SJ-045`

## Scope

### In Scope
- Add a QA-only opt-in image/cover mode to `scripts/smoke-live.mjs` plus a `smoke:qa:image-cover` package command.
- Add a scheduled/manual GitHub Actions smoke job that runs only when the QA deployment and Cloudflare credentials are present, and skips cleanly otherwise.
- Bootstrap a disposable QA chef through browser signup, then mint a scoped API token through the same session.
- Exercise `/api/tools/*` and `/mcp` for recipe-image upload, spoon-photo upload, recipe creation, spoon creation, cover listing, spoon-image browsing, cover creation from upload, cover creation from spoon, cover regeneration/status, active-cover swap, cover archive, and GIF rejection.
- Include a JPEG-with-EXIF upload and verify the downloaded stored object preserves the intended orientation tag while stripping the original dirty/private APP1 payload.
- Prove cover provenance labels for the three user-facing cases: verbatim chef upload (`Chef photo`), editorialized chef photo (`Editorialized chef photo`), and no-photo AI placeholder (`AI generated`).
- Record every created QA id and every `/photos/*` R2 key, delete those R2 objects explicitly, clean the disposable QA user in the same run, and verify no `codex-smoke-%` user remains.
- Add focused automated tests for the new script helpers and package command.
- Update durable docs/backlog state so future agents know `SJ-045` status.

### Out of Scope
- Changing the active image generation provider or editorial prompt.
- Running expensive image provider benchmarks or canaries.
- Broad remote production cleanup.
- A new email notification system.
- UI polish for recipe cover browsing.

## Completion Criteria
- [ ] `pnpm smoke:qa:image-cover` targets only the QA base URL and remote QA D1/R2 state.
- [ ] Smoke uploads a recipe image and spoon photo, rejects GIF uploads, creates a recipe, creates a spoon, lists/switches/archives covers, regenerates a cover, reads generation status, and browses spoon images.
- [ ] Smoke verifies EXIF metadata normalization with a downloaded stored object from `/photos/*`: dirty APP1 marker removed and sanitized Orientation equals the source fixture's intended orientation.
- [ ] Smoke proves `Chef photo`, `Editorialized chef photo`, and `AI generated` provenance labels through QA API/MCP-visible recipe-cover state.
- [ ] Smoke records and deletes every created QA R2 object key, cleans its disposable QA chef, and verifies no matching user remains.
- [ ] MCP `/mcp` JSON-RPC is exercised with the minted bearer token, not only legacy `/api/tools/*`.
- [ ] CI/scheduled QA smoke exists and is credential-gated so it never mutates production and never fails forks or unconfigured environments just because QA secrets are absent.
- [ ] 100% test coverage on all new code.
- [ ] All tests pass.
- [ ] No warnings.

## Code Coverage Requirements
**MANDATORY: 100% coverage on all new code.**
- No `[ExcludeFromCodeCoverage]` or equivalent on new code
- All branches covered (if/else, switch, try/catch)
- All error paths tested
- Edge cases: null, empty, boundary values

## Open Questions
- None. Autopilot decision: use QA only for live mutation coverage; production verification remains health/deploy-only unless a future task explicitly asks for production mutation smokes.

## Decisions Made
- Extend `scripts/smoke-live.mjs` instead of `scripts/smoke-api-live.mjs`; the API smoke is public/read-only and should not grow mutating QA checks.
- Use browser signup for auth bootstrap because `scripts/smoke-live.mjs` already proves the QA signup flow and deletes the disposable user by D1 email.
- Mint a short-lived smoke token through `/api/tools/create_api_token` using the session, then use that bearer for both `/api/tools/*` and `/mcp`.
- Use the existing food image allow-list (`image/jpeg`, `image/png`, `image/webp`) as the GIF rejection contract.
- Use a small valid JPEG with a unique dirty APP1 marker and a real Orientation tag as the EXIF fixture; the live smoke proves storage normalization and retrieval by parsing the downloaded object.
- Use `generateEditorial: false` for the deterministic verbatim-cover path, then explicitly run the provider-backed editorial path through cover regeneration/status so provenance is not inferred from unit tests alone.
- Prove the no-photo `AI generated` provenance by observing the placeholder cover created for the smoke recipe before any uploaded/spoon photo becomes active. If the QA image-provider credentials are absent, the scheduled workflow skips the job before mutation rather than passing a partial provenance smoke.
- Derive R2 cleanup keys from returned `/photos/*` URLs only, keep them in the smoke artifact, and delete those exact keys from the QA bucket in `finally` before/alongside D1 cleanup.

## Context / References
- `BACKLOG.md`
- `spoonjoy/tasks/2026-06-10-1521-planning-next-work-queue.md`
- `scripts/smoke-live.mjs`
- `scripts/smoke-live-helpers.mjs`
- `scripts/smoke-api-live.mjs`
- `app/routes/api.$.ts`
- `app/routes/mcp.ts`
- `app/lib/spoonjoy-api.server.ts`
- `app/lib/spoonjoy-api-request.server.ts`
- `app/lib/image-upload-tools.server.ts`
- `app/lib/image-storage.server.ts`
- `app/lib/recipe-image.ts`
- `test/routes/api.test.ts`
- `test/routes/mcp.test.ts`
- `test/lib/mcp/spoonjoy-tools.server.test.ts`

## Notes
The smoke should write a JSON artifact with created IDs, image URLs, cover IDs, MCP/API check names, cleanup output, and any screenshots only if browser debugging is useful. The script must refuse remote non-QA targets unless explicitly expanded in a later task.

## Progress Log
- 2026-06-11 12:21 Created
- 2026-06-11 12:47 Reviewer found the first plan under-scoped. Added regenerate/status coverage, provenance proof, exact R2 cleanup, EXIF orientation assertions, and CI/scheduled QA gating before implementation.
