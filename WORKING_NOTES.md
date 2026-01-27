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

### 2026-01-27 - OAuth Account Unlinking Implementation (Unit 4b)

**Implementation Complete:** `unlinkOAuthAccount` function in `app/lib/oauth-user.server.ts` fully implemented.

**Function Signature:**
```typescript
unlinkOAuthAccount(db: PrismaClient, userId: string, provider: string): Promise<UnlinkOAuthResult>
```

**Implementation Logic:**
1. Verify user exists via `db.user.findUnique` → `user_not_found` error if not
2. Check if provider is linked to user via `db.oAuth.findUnique` on `userId_provider` compound index → `provider_not_linked` error if not
3. Check if this is the only auth method:
   - Has password? (`user.hashedPassword !== null`)
   - Has multiple OAuth providers? (`db.oAuth.count > 1`)
   - If neither → `only_auth_method` error (cannot unlink)
4. Delete OAuth record via `db.oAuth.delete`
5. Return success with `unlinkedProvider` containing provider, providerUserId, providerUsername

**Error Types Returned:**
- `user_not_found` - User ID doesn't exist in database
- `provider_not_linked` - Provider is not linked to this user
- `only_auth_method` - Cannot unlink because it's the user's only way to log in

**Safety Check Logic:**
- User can unlink if they have a password (`hashedPassword` is not null) — they can still log in
- User can unlink if they have other OAuth providers (OAuth.count > 1) — they can still log in with the other provider
- User CANNOT unlink if: no password AND only one OAuth provider — they would be locked out

**All 41 tests passing with no warnings.**

### 2026-01-27 - OAuth Account Unlinking Work Check (Unit 4c)

**Verification Complete:** All acceptance criteria from Units 4a/4b verified.

**Test Coverage:**
- 41 tests for oauth-user.server.ts (all passing)
- 100% statement, branch, function, and line coverage
- No warnings

**unlinkOAuthAccount Tests (7 tests):**
1. ✅ Unlink when user has a password
2. ✅ Unlink when user has multiple OAuth providers (no password)
3. ✅ Error: `only_auth_method` - no password AND single OAuth
4. ✅ Error: `provider_not_linked` - provider not linked to user
5. ✅ Error: `user_not_found` - user ID doesn't exist
6. ✅ Unlink correct provider when user has multiple OAuth + password
7. ✅ Returns `unlinkedProvider` info on success

**Functions Verified:**
1. `generateUsername` (13 tests) - username derivation, collision handling, special chars
2. `createOAuthUser` (12 tests) - user creation, email validation, collision errors
3. `findExistingOAuthAccount` (4 tests) - lookup for returning users
4. `linkOAuthAccount` (8 tests) - account linking with all error cases
5. `unlinkOAuthAccount` (7 tests) - account unlinking with safety checks

**Safety Check Logic Verified:**
- User can unlink if they have a password (`hashedPassword` is not null)
- User can unlink if they have multiple OAuth providers (`OAuth.count > 1`)
- User CANNOT unlink if: no password AND only one OAuth provider

**Error Types Returned by unlinkOAuthAccount:**
- `user_not_found` - User ID doesn't exist in database
- `provider_not_linked` - Provider is not linked to this user
- `only_auth_method` - Cannot unlink because it's the user's only way to log in

**Result:** No changes needed - implementation was complete from Units 4a/4b.

### 2026-01-27 - Apple OAuth Initiation Tests (Unit 5a)

**Tests Written:** 12 failing tests for Apple OAuth initiation in `test/lib/apple-oauth.server.test.ts`

**Function Signatures Defined:**
```typescript
generateOAuthState(): string
createAppleAuthorizationURL(config: AppleOAuthConfig, redirectUri: string, state: string): URL
```

**generateOAuthState Tests (3 tests):**
1. Should generate a random state string
2. Should generate unique state values on each call
3. Should generate URL-safe state values (alphanumeric, underscore, hyphen only)

**createAppleAuthorizationURL Tests (9 tests):**
1. Should return a valid Apple authorization URL (appleid.apple.com/auth/authorize)
2. Should include client_id parameter
3. Should include redirect_uri parameter
4. Should include state parameter for CSRF protection
5. Should include response_type=code
6. Should include response_mode=form_post (required by Apple when requesting scopes)
7. Should request email scope
8. Should request name scope
9. Should include both email and name in scope parameter

**Design Decisions:**
- Created separate module `app/lib/apple-oauth.server.ts` for Apple-specific OAuth utilities
- Uses `AppleOAuthConfig` type from `env.server.ts` for config input
- Returns `URL` object rather than string for easier manipulation/testing
- State generation should produce URL-safe values only (no encoding needed)
- Scopes requested: `email` and `name` (space-separated in URL)

**Apple-Specific Requirements (from Arctic docs):**
- `response_mode=form_post` is required when requesting scopes
- This means callback route must handle POST requests (not GET)
- SameSite=None cookie setting needed for CSRF state cookie

**Total Tests:** 12 failing tests for TDD (no implementation yet)

### 2026-01-27 - Apple OAuth Initiation Implementation (Unit 5b)

**Implementation Complete:** Both functions in `app/lib/apple-oauth.server.ts` fully implemented.

**generateOAuthState Implementation:**
- Uses `crypto.getRandomValues()` with 32 bytes for cryptographic randomness
- Converts to base64url encoding (URL-safe: A-Z, a-z, 0-9, -, _)
- Removes padding characters (=) for cleaner URLs
- Returns unique values on each call (32 bytes of randomness = 256 bits of entropy)

**createAppleAuthorizationURL Implementation:**
- Creates URL to `https://appleid.apple.com/auth/authorize`
- Sets required parameters:
  - `client_id` - Apple app identifier from config
  - `redirect_uri` - Callback URL for OAuth flow
  - `state` - CSRF protection token
  - `response_type=code` - Standard OAuth authorization code flow
  - `response_mode=form_post` - Required by Apple when requesting scopes
  - `scope=email name` - Requests email and name scopes

**Key Implementation Details:**
- Did NOT use Arctic library for URL generation - Apple's authorize URL is simple enough to construct directly
- Arctic will be used for token exchange in callback handler (future unit)
- `response_mode=form_post` means callback route must handle POST requests (not GET)

**All 12 tests passing with no warnings.**

### 2026-01-27 - Apple OAuth Initiation Work Check (Unit 5c)

**Verification Complete:** All acceptance criteria from Units 5a/5b verified.

**Test Coverage:**
- 15 tests for apple-oauth.server.ts (was 12, added 3)
- 100% statement, branch, function, and line coverage
- No warnings

**Edge Cases Added:**
1. **State length validation** - Ensures generated state is at least 32 characters (sufficient entropy for security)
2. **State special character encoding** - Verifies URLSearchParams properly encodes special characters (&, =, +)
3. **Redirect URI encoding** - Verifies redirect_uri with query parameters is properly encoded

**Functions Verified:**
1. `generateOAuthState` (4 tests) - random generation, uniqueness, URL-safety, minimum length
2. `createAppleAuthorizationURL` (11 tests) - URL structure, all required parameters, scope handling, URL encoding

**Implementation Review:**
- `generateOAuthState` uses `crypto.getRandomValues()` with 32 bytes (256 bits entropy) - adequate security
- `createAppleAuthorizationURL` constructs proper Apple authorize URL with all required params
- `response_mode=form_post` correctly set (Apple requirement when requesting scopes)
- Scopes correctly set to `email name`

**Result:** Added 3 edge case tests for URL encoding and state length validation. Implementation was complete from Units 5a/5b.

### 2026-01-27 - Apple OAuth Callback Tests (Unit 6a)

**Tests Written:** 44 failing tests for Apple OAuth callback handling (TDD)

**Files Created/Modified:**
- `test/lib/apple-oauth.server.test.ts` - Added 18 tests for `verifyAppleCallback`
- `test/lib/apple-oauth-callback.server.test.ts` - New file with 26 tests for `handleAppleOAuthCallback`
- `app/lib/apple-oauth.server.ts` - Added types and stub for `verifyAppleCallback`
- `app/lib/apple-oauth-callback.server.ts` - New file with types and stub for `handleAppleOAuthCallback`

**Architecture Decision: Two-Layer Callback Handling**

Split callback handling into two functions:
1. `verifyAppleCallback` - Low-level token verification (Arctic integration)
2. `handleAppleOAuthCallback` - High-level orchestration (user/session management)

This separation allows:
- Testing Arctic integration separately from business logic
- Reusing `verifyAppleCallback` if needed elsewhere
- Clear responsibility boundaries

**verifyAppleCallback Interface:**
```typescript
interface AppleCallbackData {
  code: string;      // Authorization code from Apple
  state: string;     // CSRF state
  user?: string;     // User JSON (first sign-in only)
}

interface AppleUser {
  id: string;              // Apple's sub claim
  email: string;
  emailVerified: boolean;
  isPrivateEmail: boolean; // Hide My Email
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
}

interface AppleCallbackResult {
  success: boolean;
  appleUser?: AppleUser;
  error?: string;
  message?: string;
}
```

**verifyAppleCallback Tests (18 tests):**
1. Token verification errors (invalid code, missing state/code)
2. User ID extraction from ID token
3. Email extraction from ID token
4. Error handling (OAuth2RequestError, network errors)
5. Name parsing from user parameter (first sign-in)
6. Missing name handling (returning user)
7. Invalid JSON in user parameter
8. Private email (is_private_email claim)
9. email_verified as string "true" (Apple quirk)
10. Full name construction from parts

**handleAppleOAuthCallback Interface:**
```typescript
interface AppleOAuthCallbackParams {
  db: PrismaClient;
  appleUser: AppleUser;
  currentUserId: string | null;  // null = not logged in
  redirectTo: string | null;
}

type AppleOAuthCallbackAction = "user_created" | "user_logged_in" | "account_linked";

interface AppleOAuthCallbackResult {
  success: boolean;
  userId?: string;
  action?: AppleOAuthCallbackAction;
  redirectTo: string;
  error?: string;
  message?: string;
}
```

**handleAppleOAuthCallback Flow:**
1. If `currentUserId` set → Link Apple to existing user (account_linked)
2. If Apple ID exists in DB → Log in returning user (user_logged_in)
3. If email exists in DB → Error (account_exists - must log in to link)
4. Otherwise → Create new user (user_created)

**handleAppleOAuthCallback Tests (26 tests):**
- New user creation (5 tests): username generation, providerUsername handling
- Returning user login (2 tests): existing user, subsequent logins without name
- Account linking (4 tests): success, different email, account taken, already linked
- Email collision (2 tests): not logged in, case-insensitive
- Session creation (3 tests): userId in result for session
- Redirect logic (6 tests): default redirects, custom redirectTo, error redirects
- Action types (4 tests): user_created, user_logged_in, account_linked

**Apple OAuth Quirks Handled:**
1. `email_verified` returns as string "true" instead of boolean true
2. `is_private_email` indicates Hide My Email relay address
3. User name only sent on first sign-in (subsequent logins have null)
4. User parameter is JSON string that may be malformed

**Stub Implementations:** Both functions throw "Not implemented" for TDD.

**Total New Tests:** 44 failing (18 + 26) - all existing 1329 tests still pass.

### 2026-01-27 - Apple OAuth Callback Implementation (Unit 6b)

**Implementation Complete:** Both functions fully implemented and all tests pass.

**verifyAppleCallback Implementation:**
- Validates state and code parameters (returns `invalid_state` or `invalid_code` errors)
- Uses Arctic library's `Apple` class to exchange authorization code for tokens
- Calls `decodeIdToken` from Arctic to extract JWT claims (sub, email, email_verified, is_private_email)
- Parses user parameter JSON for name info (first sign-in only)
- Constructs fullName from firstName + lastName with proper null handling
- Handles Apple quirks: `email_verified` as string "true", `is_private_email` claim
- Error handling: `oauth_error` for OAuth2RequestError, `network_error` for fetch failures, `invalid_code` for other errors

**handleAppleOAuthCallback Implementation:**
- Flow 1: If `currentUserId` is set → Link Apple account using `linkOAuthAccount`
- Flow 2: If Apple account exists in DB → Return existing user with `user_logged_in` action
- Flow 3: Case-insensitive email collision check using raw SQL (`LOWER(email)`) for SQLite
- Flow 4: Create new user using `createOAuthUser` with `user_created` action
- Sets `providerUsername` to fullName or email as fallback
- Returns appropriate `redirectTo` based on flow (custom, settings, or default "/")

**Key Implementation Decisions:**
1. **Raw SQL for email collision:** SQLite doesn't support Prisma's `mode: "insensitive"`, so used raw SQL with `LOWER(email)` for case-insensitive matching
2. **Error propagation:** Errors from `linkOAuthAccount` and `createOAuthUser` are passed through directly (e.g., `provider_already_linked`, `provider_account_taken`, `account_exists`)
3. **Arctic integration:** Used Arctic's classes directly rather than wrapping them further

**Test Mock Fix:**
Original tests had `vi.mock("arctic")` inside test functions (incorrect - Vitest hoists mocks). Fixed by:
- Moving mock to module level using `vi.hoisted()` for state
- Using class-based mock for `Apple` instead of `vi.fn().mockImplementation()`
- Making mock state mutable so tests can configure return values

**All 1373 tests pass with no warnings.**

### 2026-01-27 - Apple OAuth Callback Work Check (Unit 6c)

**Verification Complete:** All acceptance criteria from Units 6a/6b verified.

**Coverage Gaps Identified and Fixed:**

1. **apple-oauth-callback.server.ts line 146** - The `createOAuthUser` error return path was uncovered. Added test that mocks `createOAuthUser` to return `email_required` error, verifying defensive error handling.

2. **apple-oauth.server.ts line 225** - The `||` fallback for empty `error.message` was uncovered. Added test for `OAuth2RequestError` with empty message, verifying fallback to "OAuth error occurred".

3. **apple-oauth-callback.server.ts line 83** - The `??` branch for `fullName ?? email` in account linking was only testing when `fullName` is set. Added test for account linking when `fullName` is null, verifying email is used as `providerUsername`.

**Tests Added:**
1. `should propagate createOAuthUser errors when user creation fails` - Tests defensive error handling for createOAuthUser failures
2. `should handle OAuth2RequestError with empty message` - Tests fallback message for errors without message
3. `should use email as providerUsername when linking without fullName` - Tests email fallback in account linking flow

**Final Test Count:** 1376 tests (was 1373)

**Coverage Result:** 100% statements, branches, functions, and lines on all OAuth files:
- `apple-oauth.server.ts` - 100% all metrics
- `apple-oauth-callback.server.ts` - 100% all metrics
- `oauth-user.server.ts` - 100% all metrics
- `env.server.ts` - 100% all metrics

**Functions Verified:**
1. `verifyAppleCallback` (18 tests) - Token verification, user data extraction, error handling
2. `handleAppleOAuthCallback` (28 tests) - User creation, login, linking, redirects

**Error Cases Covered:**
- verifyAppleCallback: `invalid_state`, `invalid_code`, `oauth_error`, `network_error`
- handleAppleOAuthCallback: `account_exists`, `provider_already_linked`, `provider_account_taken`, `email_required` (via createOAuthUser)

**No warnings in test output.**

### 2026-01-27 - Google OAuth Initiation Tests (Unit 7a)

**Tests Written:** 18 failing tests for Google OAuth initiation in `test/lib/google-oauth.server.test.ts`

**Function Signatures Defined:**
```typescript
generateCodeVerifier(): string
createGoogleAuthorizationURL(config: GoogleOAuthConfig, redirectUri: string, state: string, codeVerifier: string): URL
```

**Key Differences from Apple OAuth:**

| Feature | Apple | Google |
|---------|-------|--------|
| PKCE | Not used | Required (code_challenge + code_verifier) |
| Callback type | POST (form_post) | GET (standard redirect) |
| Scopes | email, name | openid, email, profile |
| Auth endpoint | appleid.apple.com/auth/authorize | accounts.google.com/o/oauth2/v2/auth |

**generateCodeVerifier Tests (4 tests):**
1. Should generate a random code verifier string
2. Should generate unique values on each call
3. Should generate URL-safe values (RFC 7636: A-Z, a-z, 0-9, hyphen, period, underscore, tilde)
4. Should generate between 43-128 characters per RFC 7636

**createGoogleAuthorizationURL Tests (14 tests):**
1. Should return valid Google authorization URL (accounts.google.com/o/oauth2/v2/auth)
2. Should include client_id parameter
3. Should include redirect_uri parameter
4. Should include state parameter (CSRF protection)
5. Should include response_type=code
6. Should include code_challenge parameter (PKCE)
7. Should include code_challenge_method=S256 (PKCE)
8. Should request openid scope
9. Should request email scope
10. Should request profile scope
11. Should include all required scopes (openid, email, profile)
12. Should properly encode special characters in state
13. Should properly encode redirect_uri with query parameters
14. Should generate different code_challenge for different code_verifier

**PKCE (RFC 7636) Notes:**
- `code_verifier` is a cryptographically random string (43-128 chars)
- `code_challenge` is base64url(SHA-256(code_verifier))
- `code_challenge_method=S256` indicates SHA-256 was used
- Verifier must be stored client-side to send during token exchange

**Stub Implementation:** `app/lib/google-oauth.server.ts` with function stubs that throw "Not implemented".

**Total New Tests:** 18 failing (TDD) - all 1376 existing tests still pass.

### 2026-01-27 - Google OAuth Initiation Implementation (Unit 7b)

**Implementation Complete:** Both functions in `app/lib/google-oauth.server.ts` fully implemented.

**generateCodeVerifier Implementation:**
- Uses `crypto.getRandomValues()` with 32 bytes (256 bits of entropy)
- Converts to base64url encoding (URL-safe: A-Z, a-z, 0-9, -, _)
- Removes padding characters (=) for cleaner URLs
- Produces 43-character output (within RFC 7636 range of 43-128)

**createGoogleAuthorizationURL Implementation:**
- Creates URL to `https://accounts.google.com/o/oauth2/v2/auth`
- Sets required OAuth 2.0 parameters:
  - `client_id` - Google app identifier from config
  - `redirect_uri` - Callback URL for OAuth flow
  - `state` - CSRF protection token
  - `response_type=code` - Standard authorization code flow
  - `scope=openid email profile` - OpenID Connect + user profile
- Sets PKCE parameters:
  - `code_challenge` - base64url(SHA-256(code_verifier))
  - `code_challenge_method=S256` - Indicates SHA-256 was used

**Key Implementation Decision: Pure JS SHA-256**

The tests expect `createGoogleAuthorizationURL` to be synchronous, but Web Crypto API's `crypto.subtle.digest()` is async. Options considered:
1. Make function async - Would break test expectations
2. Use a library like `js-sha256` - Adds dependency
3. Implement SHA-256 in pure JavaScript - No deps, synchronous

Chose option 3: Implemented pure JS SHA-256 following FIPS 180-4 spec. The implementation:
- Uses standard SHA-256 constants K (cube roots of first 64 primes)
- Uses standard initial hash values H (square roots of first 8 primes)
- Processes messages in 512-bit chunks with proper padding
- Produces correct 256-bit (32-byte) digests

This is similar to how Apple OAuth generates state synchronously using `crypto.getRandomValues()`.

**Difference from Apple OAuth:**
- Apple: No PKCE, uses `response_mode=form_post` (POST callback)
- Google: Uses PKCE, standard GET redirect callback

**All 1394 tests passing with no warnings.**

### 2026-01-27 - Google OAuth Initiation Work Check (Unit 7c)

**Verification Complete:** All acceptance criteria from Units 7a/7b verified.

**Test Coverage:**
- 19 tests for google-oauth.server.ts (was 18, added 1)
- 100% statement, branch, function, and line coverage
- No warnings

**Edge Case Added:**
1. **RFC 7636 test vector** - Added test verifying the SHA-256 implementation produces correct code_challenge using the RFC 7636 Appendix B test vector (`dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk` → `E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM`). This validates the pure JavaScript SHA-256 implementation is correct.

**Functions Verified:**
1. `generateCodeVerifier` (4 tests) - random generation, uniqueness, URL-safety, length (43-128 chars per RFC 7636)
2. `createGoogleAuthorizationURL` (15 tests) - URL structure, all required parameters, PKCE code_challenge, scope handling, URL encoding, RFC 7636 test vector

**Implementation Review:**
- `generateCodeVerifier` uses `crypto.getRandomValues()` with 32 bytes (256 bits entropy) - produces 43-char base64url output
- `createGoogleAuthorizationURL` constructs proper Google authorize URL with all required OAuth 2.0 + PKCE params
- Pure JavaScript SHA-256 implementation validated against RFC 7636 Appendix B test vector
- Scopes correctly set to `openid email profile`

**Key Differences from Apple OAuth:**
| Feature | Apple | Google |
|---------|-------|--------|
| PKCE | Not used | Required (code_challenge + code_verifier) |
| Callback type | POST (form_post) | GET (standard redirect) |
| Scopes | email, name | openid, email, profile |
| Auth endpoint | appleid.apple.com | accounts.google.com |

**Result:** Added 1 edge case test for SHA-256 correctness. Implementation was complete from Units 7a/7b.

### 2026-01-27 - Google OAuth Callback Tests (Unit 8a)

**Tests Written:** 48 failing tests for Google OAuth callback handling (TDD)

**Files Created/Modified:**
- `test/lib/google-oauth.server.test.ts` - Added 22 tests for `verifyGoogleCallback`
- `test/lib/google-oauth-callback.server.test.ts` - New file with 26 tests for `handleGoogleOAuthCallback`
- `app/lib/google-oauth.server.ts` - Added types and stub for `verifyGoogleCallback`
- `app/lib/google-oauth-callback.server.ts` - New file with types and stub for `handleGoogleOAuthCallback`

**Architecture Decision: Two-Layer Callback Handling (Same as Apple)**

Split callback handling into two functions:
1. `verifyGoogleCallback` - Low-level token verification with PKCE + userinfo fetch
2. `handleGoogleOAuthCallback` - High-level orchestration (user/session management)

**verifyGoogleCallback Interface:**
```typescript
interface GoogleCallbackData {
  code: string;           // Authorization code from Google
  state: string;          // CSRF state
  codeVerifier: string;   // PKCE code verifier from initiation
}

interface GoogleUser {
  id: string;             // Google's sub claim
  email: string;
  emailVerified: boolean;
  name: string | null;
  givenName: string | null;
  familyName: string | null;
  picture: string | null;
}

interface GoogleCallbackResult {
  success: boolean;
  googleUser?: GoogleUser;
  error?: string;
  message?: string;
}
```

**verifyGoogleCallback Tests (22 tests):**
1. Token verification with PKCE (8 tests): invalid code, missing state/code/codeVerifier, OAuth errors, network errors
2. User info fetch (11 tests): user ID, email, name fields, picture, email_verified, userinfo errors, network errors
3. Result structure (3 tests): success with all fields, error handling, null fields

**Key Difference from Apple OAuth:**
- Google uses PKCE (code_verifier required for token exchange)
- Google uses GET callback (standard redirect, not POST)
- Google uses userinfo endpoint for user data (not ID token claims)
- Google returns name, given_name, family_name (not firstName/lastName in user parameter)

**handleGoogleOAuthCallback Interface:**
```typescript
interface GoogleOAuthCallbackParams {
  db: PrismaClient;
  googleUser: GoogleUser;
  currentUserId: string | null;  // null = not logged in
  redirectTo: string | null;
}

type GoogleOAuthCallbackAction = "user_created" | "user_logged_in" | "account_linked";

interface GoogleOAuthCallbackResult {
  success: boolean;
  userId?: string;
  action?: GoogleOAuthCallbackAction;
  redirectTo: string;
  error?: string;
  message?: string;
}
```

**handleGoogleOAuthCallback Flow (Same as Apple):**
1. If `currentUserId` set → Link Google to existing user (account_linked)
2. If Google ID exists in DB → Log in returning user (user_logged_in)
3. If email exists in DB → Error (account_exists - must log in to link)
4. Otherwise → Create new user (user_created)

**handleGoogleOAuthCallback Tests (26 tests):**
- New user creation (5 tests): username generation, providerUsername handling
- Returning user login (2 tests): existing user, subsequent logins
- Account linking (5 tests): success, different email, account taken, already linked, email fallback
- Error handling (1 test): createOAuthUser error propagation
- Email collision (2 tests): not logged in, case-insensitive
- Session creation (3 tests): userId in result for session
- Redirect logic (6 tests): default redirects, custom redirectTo, error redirects
- Action types (4 tests): user_created, user_logged_in, account_linked, none on error

**Stub Implementations:** Both functions throw "Not implemented" for TDD.

**Total New Tests:** 48 failing (22 + 26) - all existing 1395 tests still pass.

### 2026-01-27 - Google OAuth Callback Implementation (Unit 8b)

**Implementation Complete:** Both functions fully implemented and all tests pass.

**verifyGoogleCallback Implementation:**
- Validates state, code, and codeVerifier parameters
- Uses dynamic import for Arctic's `Google` class to enable test mocking
- Creates Google client with `new Google(clientId, clientSecret, redirectUri)`
- Exchanges authorization code for tokens with PKCE via `validateAuthorizationCode(code, codeVerifier)`
- Fetches user info from `https://openidconnect.googleapis.com/v1/userinfo` using access token
- Extracts user data: id (sub), email, email_verified, name, given_name, family_name, picture
- Handles nullable fields with `?? null` fallbacks
- Error handling: `invalid_state`, `invalid_code`, `invalid_code_verifier`, `oauth_error`, `network_error`, `userinfo_error`

**handleGoogleOAuthCallback Implementation:**
- Same flow as Apple OAuth callback handler (identical pattern)
- Flow 1: If `currentUserId` is set → Link Google account using `linkOAuthAccount`
- Flow 2: If Google account exists in DB → Return existing user with `user_logged_in` action
- Flow 3: Case-insensitive email collision check using raw SQL (`LOWER(email)`) for SQLite
- Flow 4: Create new user using `createOAuthUser` with `user_created` action
- Sets `providerUsername` to name or email as fallback
- Returns appropriate `redirectTo` based on flow

**Key Differences from Apple OAuth:**
| Feature | Apple | Google |
|---------|-------|--------|
| PKCE | Not used | Required (code_verifier in token exchange) |
| Callback type | POST (form_post) | GET (standard redirect) |
| User data source | ID token claims | Userinfo endpoint |
| Name fields | firstName/lastName in user param | name/given_name/family_name in userinfo |
| Scopes | email, name | openid, email, profile |

**All 1443 tests passing with no warnings.**

---

## For Future Tasks

[Things to remember or consider for later work]
