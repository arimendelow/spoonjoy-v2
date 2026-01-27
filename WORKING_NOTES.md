# Working Notes & Decisions

This file is for Claude to document decisions, learnings, and notes during implementation.

**Purpose:**
- Record decisions made during implementation (library choices, architecture decisions, etc.)
- Note things to remember for future tasks
- Document gotchas or learnings discovered along the way
- Track any deviations from the plan and why

**Usage:**
- Check this file at the start of each work session
- Add notes as you work
- Reference past decisions when relevant

---

## Decisions Log

### 2026-01-27 - OAuth Library Selection

**Decision: Use Arctic**

**Context:** Need OAuth library for Apple + Google login on React Router v7 + Cloudflare Workers with D1/Prisma.

**Libraries Evaluated:**

| Library | Cloudflare Workers | Apple + Google | Complexity | Documentation |
|---------|-------------------|----------------|------------|---------------|
| Arctic | ✅ Native support | ✅ Both supported | Low (focused) | Excellent |
| remix-auth | ✅ Works | ⚠️ Google yes, Apple unclear | Medium (strategy pattern) | Good |
| Lucia/oslo | ⚠️ Works, but Argon2 issues | ✅ Both | High (full auth system) | Good |

**Why Arctic:**

1. **Perfect Cloudflare Workers fit**: Runs on Web Crypto API without polyfills, no native dependencies
2. **Explicit Apple + Google support**: Both providers documented with clear examples
3. **Minimal scope**: Just OAuth token exchange - doesn't impose session/user management patterns
4. **Schema alignment**: Returns provider ID + profile data → maps directly to our OAuth model (provider, providerUserId, providerUsername)
5. **Implementation clarity**: Well-documented, focused API means higher Claude implementation success likelihood
6. **No password hashing concerns**: Unlike Lucia/oslo which has Argon2 CPU time issues on Workers

**Why not remix-auth:**
- Additional abstraction layer (Authenticator + Strategy pattern) that we don't need
- Apple strategy support is less clear
- More complexity for simple OAuth use case

**Why not Lucia/oslo:**
- Full auth framework when we only need OAuth client
- Argon2 password hashing has known issues on Cloudflare Workers (CPU time limits)
- Overkill since we just need OAuth, not full session management

**Apple OAuth Note:**
Apple requires `response_mode=form_post` which sends a POST callback instead of GET with query params. Need to handle this in the callback route and adjust CSRF/cookie settings (SameSite=None).

**Implementation approach:**
- Use Arctic directly for OAuth flows
- Handle redirects/callbacks in React Router actions
- Store tokens and user info ourselves using existing session infrastructure
- Map provider response to our OAuth model fields

**Sources:**
- [Arctic v3 Documentation](https://arcticjs.dev/)
- [Arctic Google Provider](https://arcticjs.dev/providers/google)
- [Arctic Apple Provider](https://arcticjs.dev/providers/apple)
- [remix-auth GitHub](https://github.com/sergiodxa/remix-auth)
- [Lucia Auth Cloudflare Workers discussion](https://github.com/lucia-auth/lucia/discussions/515)

---

## Implementation Notes

### 2026-01-27 - Environment Config Validation Design

**Approach:** Create `app/lib/env.server.ts` with functions to validate OAuth environment variables.

**Functions planned:**
- `getGoogleOAuthConfig(env)` - Validates and returns Google OAuth config
- `getAppleOAuthConfig(env)` - Validates and returns Apple OAuth config
- `validateOAuthEnv(env)` - Validates all OAuth env vars at once, throws with all missing vars

**Required env vars:**
- Google: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- Apple: `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY`

**Design decisions:**
- Functions accept `env` object parameter (Cloudflare Workers pattern) rather than reading from `process.env`
- Throw descriptive errors for missing vars rather than returning null/undefined
- Treat empty strings as missing (falsy check)
- `validateOAuthEnv` reports ALL missing vars at once (better DX than one-at-a-time errors)

**Tests:** 15 failing tests written in `test/lib/env.server.test.ts` (TDD)

---

## For Future Tasks

[Things to remember or consider for later work]
