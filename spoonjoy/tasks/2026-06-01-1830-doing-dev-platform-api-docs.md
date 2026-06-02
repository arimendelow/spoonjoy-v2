# Doing: Spoonjoy Developer Platform API And Docs

**Status**: drafting
**Execution Mode**: direct
**Created**: 2026-06-01 18:39
**Planning**: ./2026-06-01-1830-planning-dev-platform-api-docs.md
**Artifacts**: ./2026-06-01-1830-doing-dev-platform-api-docs/

## Execution Mode

- **pending**: Awaiting user approval before each unit starts (interactive)
- **spawn**: Spawn sub-agent for each unit (parallel/autonomous)
- **direct**: Execute units sequentially in current session (default)

## Objective
Expose Spoonjoy as a developer-friendly platform layer on top of the existing public-by-default Chef graph, so external clients can safely read, mutate, sync, and document Spoonjoy data through stable contracts. Deliver a deployed API documentation surface that can be sent to an external developer, while keeping MCP, REST, OAuth, API tokens, and future client profiles aligned through one source of truth.

## Upstream Work Items
- None

## Completion Criteria
- [ ] Public developer docs are deployed and reachable at `https://spoonjoy.app/developers`.
- [ ] A versioned `/api/v1` contract exists for discovery/health, OpenAPI/spec, public recipe search/detail, public cookbook search/detail, authenticated shopping-list read/sync/item mutations, and authenticated personal API token list/create/revoke metadata; ordinary first-slice workflows do not require raw `/api/tools/:operation`.
- [ ] Machine-readable API reference exists for the supported developer surface, with request schemas, response schemas, examples, errors, auth requirements, and scope requirements.
- [ ] Docs clearly explain public-by-default Chef graph semantics and authenticated/private or mutating surfaces.
- [ ] Auth docs and implementation distinguish personal API tokens, OAuth/PKCE apps, MCP clients, and delegated/device-style authorization.
- [ ] Existing OAuth/API/MCP docs drift is resolved, including refresh-token behavior and any mismatch between REST coverage and operation-layer coverage.
- [ ] Fine-grained scopes `public:read`, `recipes:read`, `shopping_list:read`, `shopping_list:write`, `cookbooks:read`, `tokens:read`, `tokens:write`, and `offline_access` are represented in docs, stored on API credentials, backward-compatible with existing `kitchen:read` / `kitchen:write` grants, and enforced for the supported v1 surface.
- [ ] The supported `/api/v1` surface follows the explicit per-endpoint scope matrix from the planning doc, including anonymous access for public recipe/cookbook reads and authenticated-only access for shopping-list and token surfaces.
- [ ] Integration-safety primitives are implemented and documented for the proving slice: idempotent shopping-list add/check/remove mutations, machine-readable errors, request IDs, rate-limit guidance, shopping-list cursor/sync behavior, shopping-list item tombstones, and documented last-writer-wins semantics for shopping-list checked/delete state.
- [ ] At least one sample or guide demonstrates an external client using the docs to authenticate and operate against Spoonjoy.
- [ ] The implemented docs/spec do not drift from REST/MCP operation metadata for the supported surface.
- [ ] Deployed verification proves the docs URL and relevant API endpoints work after deployment.
- [ ] 100% test coverage on all new code
- [ ] All tests pass
- [ ] No warnings

## Code Coverage Requirements
**MANDATORY: 100% coverage on all new code.**
- No `[ExcludeFromCodeCoverage]` or equivalent on new code
- All branches covered (if/else, switch, try/catch)
- All error paths tested
- Edge cases: null, empty, boundary values

## TDD Requirements
**Strict TDD — no exceptions:**
1. **Tests first**: Write failing tests BEFORE any implementation
2. **Verify failure**: Run tests, confirm they FAIL (red)
3. **Minimal implementation**: Write just enough code to pass
4. **Verify pass**: Run tests, confirm they PASS (green)
5. **Refactor**: Clean up, keep tests green
6. **No skipping**: Never write implementation without failing test first

## Work Units

### Legend
⬜ Not started · 🔄 In progress · ✅ Done · ❌ Blocked

**CRITICAL: Every unit header MUST start with status emoji (⬜ for new units).**

### ⬜ Unit 0: Setup/Research
**What**: Confirm branch/task-doc state, verify route/deploy/test patterns, and capture the implementation baseline for API, OAuth, token, shopping-list, docs, and deployment work.
**Output**: Notes/logs in `./2026-06-01-1830-doing-dev-platform-api-docs/` with current branch, current route files, relevant test commands, and deployment command choice.
**Acceptance**: Artifacts exist; no code behavior changed; doing doc remains accurate after source inspection.

### ⬜ Unit 1a: Credential Scopes And Idempotency Schema — Tests
**What**: Write failing tests for adding credential scopes and idempotency storage. Cover `prisma/schema.prisma`, root migration `migrations/0015_api_scopes_and_idempotency.sql`, cleanup hooks, and auth helper behavior.
**Output**: Tests in `test/scripts/migration-0015-api-scopes-and-idempotency.test.ts`, `test/lib/api-auth.server.test.ts`, and cleanup/setup updates as needed.
**Acceptance**: Focused tests FAIL because `ApiCredential.scopes`, `ApiIdempotencyKey`, scope normalization, scope expansion, and scoped credential creation are not implemented yet.

### ⬜ Unit 1b: Credential Scopes And Idempotency Schema — Implementation
**What**: Add `ApiCredential.scopes`, `ApiIdempotencyKey`, migration SQL, Prisma schema changes, and auth helper support for scope parsing, legacy `kitchen:read` / `kitchen:write` expansion, and scoped credential creation.
**Output**: Updated `prisma/schema.prisma`, root migration, generated Prisma client artifacts if needed, `app/lib/api-auth.server.ts`, cleanup/setup helpers, and passing focused tests.
**Acceptance**: Unit 1a tests PASS; `pnpm run build` succeeds with no warnings.

### ⬜ Unit 1c: Credential Scopes And Idempotency Schema — Coverage & Refactor
**What**: Verify coverage for new scope/idempotency code, add missing edge-case tests, and refactor names/types if needed.
**Output**: Coverage/test output saved to artifacts; any refactor commits keep behavior unchanged.
**Acceptance**: 100% coverage on new/changed schema helper code; focused tests and build still PASS.

### ⬜ Unit 2a: `/api/v1` Contract And Scope Matrix — Tests
**What**: Write failing tests for `api/v1` routing, response envelope, machine-readable errors, request IDs, OpenAPI endpoint, public recipe/cookbook reads, authenticated shopping-list/token surfaces, and the exact scope matrix from planning.
**Output**: Tests in `test/routes/api-v1.test.ts` and supporting test helpers.
**Acceptance**: Focused tests FAIL because `/api/v1/*`, public cookbook v1 resources, OpenAPI v1 endpoint, and scope enforcement do not exist yet.

### ⬜ Unit 2b: `/api/v1` Contract And Scope Matrix — Implementation
**What**: Add route registration and implementation for `app/routes/api.v1.$.ts` plus server helpers as needed. Implement v1 discovery/health/openapi, public recipe search/detail, public cookbook search/detail, authenticated token list/create/revoke, scoped auth checks, request IDs, and machine-readable errors.
**Output**: Updated `app/routes.ts`, new v1 API route/server helpers, updated operation registry helpers if needed, and passing focused tests.
**Acceptance**: Unit 2a tests PASS; legacy `/api/*` tests still PASS; `pnpm run build` succeeds with no warnings.

### ⬜ Unit 2c: `/api/v1` Contract And Scope Matrix — Coverage & Refactor
**What**: Verify coverage for the v1 API route/helpers and add tests for null/empty/boundary/error paths such as malformed JSON, missing scope, revoked token, anonymous public access, unknown endpoint, and CORS/OPTIONS where applicable.
**Output**: Coverage/test output saved to artifacts; refactors keep v1 route behavior stable.
**Acceptance**: 100% coverage on new/changed v1 API code; focused tests and build still PASS.

### ⬜ Unit 3a: Shopping-List Sync And Idempotent Mutations — Tests
**What**: Write failing tests for v1 shopping-list sync cursor responses, deleted-item tombstones, `clientMutationId` idempotency for add/check/remove, replayed mutation responses, last-writer-wins checked/delete semantics, and scope failures.
**Output**: Additional tests in `test/routes/api-v1.test.ts` or focused `test/lib` helpers for idempotent v1 mutations.
**Acceptance**: Focused tests FAIL because sync cursors, tombstone payloads, and mutation replay are not implemented yet.

### ⬜ Unit 3b: Shopping-List Sync And Idempotent Mutations — Implementation
**What**: Implement shopping-list sync payloads and idempotent v1 add/check/remove behavior on top of existing shopping-list operations and the new idempotency table.
**Output**: Updated v1 API route/server helpers and any shared formatting helpers needed for shopping-list sync.
**Acceptance**: Unit 3a tests PASS; `pnpm run build` succeeds with no warnings.

### ⬜ Unit 3c: Shopping-List Sync And Idempotent Mutations — Coverage & Refactor
**What**: Verify 100% coverage for sync/idempotency helpers, including empty list, deleted-only changes, duplicate mutation key with mismatched operation/body, and invalid cursor/error handling.
**Output**: Coverage/test output saved to artifacts; refactors keep v1 shopping behavior stable.
**Acceptance**: 100% coverage on new/changed shopping-list sync/idempotency code; focused tests and build still PASS.

### ⬜ Unit 4a: Developer Docs, OpenAPI, And Existing Docs Drift — Tests
**What**: Write failing tests for the `/developers` route, route metadata, docs content, OpenAPI schema content, docs links to v1 endpoints, OAuth refresh-token documentation correction, and route registration.
**Output**: Tests in `test/routes/developers.test.tsx`, `test/routes/api-v1-openapi.test.ts` if split, and docs-drift assertions as needed.
**Acceptance**: Focused tests FAIL because `/developers`, OpenAPI schemas/examples, and docs updates are incomplete.

### ⬜ Unit 4b: Developer Docs, OpenAPI, And Existing Docs Drift — Implementation
**What**: Add the `/developers` route and any reusable docs/reference data. Generate or construct the supported OpenAPI document from the same v1 contract metadata used by the route. Update `docs/api.md`, `docs/claude-connector.md`, and `docs/ouroboros-mcp.md` to resolve drift and point developers to `/developers`.
**Output**: `app/routes/developers.tsx`, route registration, v1 OpenAPI/reference helpers, updated docs, and passing focused tests.
**Acceptance**: Unit 4a tests PASS; `pnpm run build` succeeds with no warnings.

### ⬜ Unit 4c: Developer Docs, OpenAPI, And Existing Docs Drift — Coverage & Refactor
**What**: Verify docs/OpenAPI coverage, add tests for edge cases in schema generation, and inspect the rendered docs page for layout/text issues.
**Output**: Coverage/test output and any local screenshot or HTML smoke notes saved to artifacts.
**Acceptance**: 100% coverage on new docs/reference code; focused tests and build still PASS.

### ⬜ Unit 5a: Client Guide And Sample Workflow — Tests
**What**: Write failing tests or docs assertions for a complete external-client guide that creates a token, calls `/api/v1/shopping-list/sync`, performs an idempotent shopping-list mutation, and reads public recipes/cookbooks.
**Output**: Tests that assert sample commands and docs snippets remain aligned with actual v1 endpoints and scopes.
**Acceptance**: Tests FAIL until the guide/sample is added and aligned with implemented endpoints.

### ⬜ Unit 5b: Client Guide And Sample Workflow — Implementation
**What**: Add the guide/sample to `/developers` and repo docs. Keep it broadly useful instead of overfitting to Pebble: explain how tiny-device, mobile, CLI, web, and agent clients use the same v1 primitives.
**Output**: Updated developer docs route/docs files and passing guide/sample tests.
**Acceptance**: Unit 5a tests PASS; `pnpm run build` succeeds with no warnings.

### ⬜ Unit 5c: Client Guide And Sample Workflow — Coverage & Refactor
**What**: Verify guide/sample coverage and polish wording for public-by-default Chef graph, private shopping list, scopes, sync, and idempotency.
**Output**: Coverage/test output saved to artifacts; no unsupported claims in docs.
**Acceptance**: 100% coverage on new/changed guide-support code; focused tests and build still PASS.

### ⬜ Unit 6a: Full Verification — Tests
**What**: Run the full required verification gate before deployment: targeted tests, full coverage, typecheck, and build.
**Output**: Logs in artifacts for `pnpm test:coverage`, `pnpm run typecheck`, and `pnpm run build`.
**Acceptance**: All verification commands PASS with no warnings.

### ⬜ Unit 6b: Deploy And Live API Docs Verification — Implementation
**What**: Deploy to production using the repo-supported deploy command, then live-smoke the deployed docs/spec/API endpoints.
**Output**: Deploy log and live verification logs in artifacts. Verify at minimum `https://spoonjoy.app/developers`, `https://spoonjoy.app/api/v1`, `https://spoonjoy.app/api/v1/openapi.json`, a public recipe/cookbook endpoint or empty success response, and public docs links.
**Acceptance**: Production deploy succeeds; live docs URL and v1 API endpoints return expected responses with no warnings in logs available to this task.

### ⬜ Unit 6c: Final Documentation Sync And Completion
**What**: Mark completion criteria in doing/planning docs based on evidence, send the repo-required Slugger completion message, and prepare the final user-facing link.
**Output**: Updated task docs, final verification summary, and Slugger notification.
**Acceptance**: Doing doc status is `done`, planning criteria are synced, all commits are atomic, branch is pushed if a remote is configured, and the final response can give the deployed developer docs URL.

## Execution
- **TDD strictly enforced**: tests → red → implement → green → refactor
- Commit after each phase (1a, 1b, 1c)
- Push after each unit complete
- Run full test suite before marking unit done
- **All artifacts**: Save outputs, logs, data to `./2026-06-01-1830-doing-dev-platform-api-docs/` directory
- **Fixes/blockers**: Spawn sub-agent immediately — don't ask, just do it
- **Decisions made**: Update docs immediately, commit right away

## Progress Log
- 2026-06-01 18:39 Created from planning doc
