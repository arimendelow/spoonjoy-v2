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

### 2026-01-27 - Environment Config Implementation

**Implementation Details:**

Created `app/lib/env.server.ts` with:
- `getGoogleOAuthConfig(env)` - Validates GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- `getAppleOAuthConfig(env)` - Validates APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY
- `validateOAuthEnv(env)` - Validates all OAuth vars at once, reports all missing in single error

**Test Infrastructure Change:**

Added `tsconfig-paths` and custom Module._resolveFilename patch in `test/setup.ts` to enable `require('~/lib/env.server')` in tests. This was needed because:
- Tests use dynamic `require()` for TDD purposes (allows tests to load even when module doesn't exist)
- Vitest's ESM mode doesn't apply path aliases to runtime `require()` calls
- Standard tsconfig-paths `register()` didn't work with Vitest's module resolution

### 2026-01-27 - Environment Config Work Check (Unit 1c)

**Changes Made:**

1. **Fixed coverage reporting** - Converted tests from dynamic `require()` to static ESM imports. The original TDD approach used `require()` so tests could load before the module existed, but this bypassed Istanbul's instrumentation, showing 0% coverage. Now properly reports 100% coverage.

2. **Added missing edge cases** - The original 15 tests had gaps in empty string coverage:
   - Added test for `GOOGLE_CLIENT_SECRET` as empty string
   - Added tests for each Apple env var as empty string (`APPLE_CLIENT_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY`)
   - Added test for `validateOAuthEnv` treating empty strings as missing
   - Total: 20 tests (was 15)

**Coverage Result:** 100% statements, branches, functions, and lines on env.server.ts

**Implementation Review:** Complete and correct for Arctic library requirements:
- Google: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET ✓
- Apple: APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY ✓

### 2026-01-27 - OAuth User Creation Tests (Unit 2a)

**Tests Written:** 21 failing tests for OAuth user creation in `test/lib/oauth-user.server.test.ts`

**Function Signatures Defined:**
```typescript
generateUsername(db: PrismaClient, name: string | null, email: string | null): Promise<string>
createOAuthUser(db: PrismaClient, oauthData: OAuthUserData): Promise<CreateOAuthUserResult>
```

**OAuthUserData Interface:**
```typescript
interface OAuthUserData {
  provider: string;
  providerUserId: string;
  providerUsername: string;
  email: string;
  name: string | null;
}
```

**Username Generation Rules (from tests):**
1. Derive from name if available (e.g., "John Smith" → "john-smith")
2. Fall back to email local part if no name (e.g., "bob@example.com" → "bob")
3. Replace dots with hyphens, strip special characters
4. Handle `+` in email (e.g., "user+tag@example.com" → "user")
5. On collision, append incremental number (e.g., "alice" → "alice-1" → "alice-2")
6. If no name or email, generate random fallback like "user-[random]"

**createOAuthUser Behavior (from tests):**
1. Creates User with null hashedPassword/salt (OAuth-only user)
2. Creates OAuth record linking provider to user
3. Lowercases email before storage
4. Returns `{success: false, error: "account_exists", message: "...log in..."}` if email already exists
5. Email collision check is case-insensitive
6. Handles username collisions automatically via generateUsername

**Stub Implementation:** Created `app/lib/oauth-user.server.ts` with function stubs that throw "Not implemented" errors.

### 2026-01-27 - OAuth User Creation Implementation (Unit 2b)

**Implementation Complete:** Both functions in `app/lib/oauth-user.server.ts` now fully implemented.

**generateUsername Implementation:**
- Derives username from name first (lowercased, spaces → hyphens, special chars removed)
- Falls back to email local part if no usable name
- Handles `+` in email by taking only the part before `+`
- Replaces dots with hyphens in email-derived usernames
- Generates random `user-[alphanumeric]` fallback if no name/email
- Checks for collisions via `db.user.findUnique` and appends `-1`, `-2`, etc.

**createOAuthUser Implementation:**
- Normalizes email to lowercase before storage and collision check
- Uses `db.user.findFirst` with lowercase email for case-insensitive collision check
- Returns `{success: false, error: "account_exists", message: "..."}` if email exists
- Creates User with null hashedPassword/salt (OAuth-only user)
- Creates OAuth record in same transaction via Prisma nested create
- Returns `{success: true, user: {id, email, username}}`

**All 21 tests passing with no warnings.**

### 2026-01-27 - OAuth User Creation Work Check (Unit 2c)

**Changes Made:**

1. **Added findExistingOAuthAccount function** - Function to look up existing OAuth accounts by provider + providerUserId for returning user scenarios. Uses Prisma's compound unique index `@@unique([provider, providerUserId])` for efficient lookups.

2. **Added missing email handling** - Updated `OAuthUserData.email` to accept `string | null` and added validation to return `{success: false, error: "email_required", message: "..."}` when email is missing (e.g., Apple "Hide My Email" feature).

3. **Added tests for new functionality:**
   - 4 tests for `findExistingOAuthAccount` (found, not found, different provider, different providerUserId)
   - 2 tests for missing email handling (null and empty string)
   - Total: 27 tests (was 21)

**Coverage Result:** 100% statements, branches, functions, and lines on oauth-user.server.ts

**Functions Exported:**
- `generateUsername(db, name, email)` - Generate unique username from name or email
- `createOAuthUser(db, oauthData)` - Create new OAuth user with validation
- `findExistingOAuthAccount(db, provider, providerUserId)` - Look up returning users

**Error Types Returned by createOAuthUser:**
- `email_required` - Email not provided by OAuth provider
- `account_exists` - Email already exists in system (user should log in to link account)

### 2026-01-27 - OAuth Account Linking Tests (Unit 3a)

**Tests Written:** 7 failing tests for `linkOAuthAccount` function in `test/lib/oauth-user.server.test.ts`

**Function Signature Defined:**
```typescript
linkOAuthAccount(db: PrismaClient, userId: string, oauthData: LinkOAuthData): Promise<LinkOAuthResult>
```

**New Interfaces:**
```typescript
interface LinkOAuthData {
  provider: string;
  providerUserId: string;
  providerUsername: string;
}

interface LinkOAuthResult {
  success: boolean;
  oauthRecord?: {
    provider: string;
    providerUserId: string;
    providerUsername: string;
  };
  error?: string;
  message?: string;
}
```

**linkOAuthAccount Behavior (from tests):**
1. Creates OAuth record linking provider to existing user
2. Returns `{success: true, oauthRecord: {...}}` on success
3. Returns `{success: false, error: "provider_already_linked", message: "..."}` if same provider already linked to this user
4. Returns `{success: false, error: "provider_account_taken", message: "..."}` if OAuth account already linked to different user
5. Returns `{success: false, error: "user_not_found", message: "..."}` if userId doesn't exist
6. Stores providerUsername correctly (including special characters)

**Database Constraint Used:** `@@unique([userId, provider])` - each user can only have one record per provider

**Difference from createOAuthUser:**
- `createOAuthUser` - For signup flow: creates new User + OAuth record together
- `linkOAuthAccount` - For logged-in users: adds OAuth record to existing user

**Total Tests:** 34 (was 27) - 7 new failing tests for TDD

### 2026-01-27 - OAuth Account Linking Implementation (Unit 3b)

**Implementation Complete:** `linkOAuthAccount` function in `app/lib/oauth-user.server.ts` fully implemented.

**Function Signature:**
```typescript
linkOAuthAccount(db: PrismaClient, userId: string, oauthData: LinkOAuthData): Promise<LinkOAuthResult>
```

**Implementation Logic:**
1. Verify user exists via `db.user.findUnique` → `user_not_found` error if not
2. Check if user already has this provider linked via `db.oAuth.findUnique` on `userId_provider` compound index → `provider_already_linked` error if so
3. Check if OAuth account (provider + providerUserId) is already linked to a different user via `db.oAuth.findUnique` on `provider_providerUserId` compound index → `provider_account_taken` error if so
4. Create OAuth record with `db.oAuth.create`
5. Return success with oauthRecord containing provider, providerUserId, providerUsername

**Error Types Returned:**
- `user_not_found` - User ID doesn't exist in database
- `provider_already_linked` - User already has this OAuth provider linked (e.g., can't link two Google accounts)
- `provider_account_taken` - OAuth account is already linked to a different user

**Database Constraints Used:**
- `@@unique([userId, provider])` - ensures one record per user per provider
- `@@unique([provider, providerUserId])` - ensures one record per OAuth account

**All 34 tests passing with no warnings.**

### 2026-01-27 - OAuth Account Linking Work Check (Unit 3c)

**Verification Complete:** All acceptance criteria from Units 3a/3b verified.

**Test Coverage:**
- 34 tests for oauth-user.server.ts (all passing)
- 100% statement, branch, function, and line coverage
- No warnings

**Functions Verified:**
1. `generateUsername` (13 tests) - username derivation, collision handling, special chars
2. `createOAuthUser` (12 tests) - user creation, email validation, collision errors
3. `findExistingOAuthAccount` (4 tests) - lookup for returning users
4. `linkOAuthAccount` (8 tests) - account linking with all error cases

**linkOAuthAccount Edge Cases Verified:**
- ✅ Success: link new provider to existing user
- ✅ Success: link Apple to user with existing Google (multiple providers)
- ✅ Error: `user_not_found` - user ID doesn't exist
- ✅ Error: `provider_already_linked` - user already has this provider linked
- ✅ Error: `provider_account_taken` - OAuth account linked to different user
- ✅ Stores providerUsername correctly (including special chars/emoji)

**Database Constraints Used:**
- `@@unique([provider, providerUserId])` - one record per OAuth account
- `@@unique([userId, provider])` - one record per user per provider

**Result:** No changes needed - implementation was complete from Units 3a/3b.

### 2026-01-27 - OAuth Account Unlinking Tests (Unit 4a)

**Tests Written:** 7 failing tests for `unlinkOAuthAccount` function in `test/lib/oauth-user.server.test.ts`

**Function Signature Defined:**
```typescript
unlinkOAuthAccount(db: PrismaClient, userId: string, provider: string): Promise<UnlinkOAuthResult>
```

**New Interface:**
```typescript
interface UnlinkOAuthResult {
  success: boolean;
  unlinkedProvider?: {
    provider: string;
    providerUserId: string;
    providerUsername: string;
  };
  error?: string;
  message?: string;
}
```

**unlinkOAuthAccount Behavior (from tests):**
1. Deletes OAuth record linking provider to user
2. Returns `{success: true, unlinkedProvider: {...}}` on success
3. Returns `{success: false, error: "only_auth_method", message: "..."}` if provider is the only way to log in (no password AND no other OAuth providers)
4. Returns `{success: false, error: "provider_not_linked", message: "..."}` if provider is not linked to user
5. Returns `{success: false, error: "user_not_found", message: "..."}` if userId doesn't exist

**Auth Method Check Logic:**
- User can unlink if they have a password (hashedPassword is not null)
- User can unlink if they have other OAuth providers (OAuth.count > 1)
- User CANNOT unlink if: no password AND only one OAuth provider

**Difference from linkOAuthAccount:**
- `linkOAuthAccount` - Adds OAuth record to existing user
- `unlinkOAuthAccount` - Removes OAuth record, with safety check for "last auth method"

**Error Types Defined:**
- `user_not_found` - User ID doesn't exist in database
- `provider_not_linked` - Provider is not linked to this user
- `only_auth_method` - Cannot unlink because it's the user's only way to log in

**Total Tests:** 41 (was 34) - 7 new failing tests for TDD

---

## For Future Tasks

[Things to remember or consider for later work]
