# Active Tasks

Current work in progress. One task actively worked at a time.

---

## 🎯 CURRENT: Auth + OAuth Implementation

**Type**: coding
**Created**: 2026-01-27
**Status**: ready-to-start

### Objective
Validate basic auth (✅ complete), add Apple OAuth (primary), then Google OAuth.

### Audit Results
- ✅ login/signup/logout routes
- ✅ session management (cookies, 30 day expiry)
- ✅ password hashing (bcrypt)
- ✅ OAuth model in prisma schema
- ✅ User model supports OAuth-only users
- ❌ no OAuth routes
- ❌ no OAuth helper functions

### Work Units (TDD)

#### Unit 1: OAuth Utility Functions
**Files:** `app/lib/auth.server.ts`, `test/lib/auth.server.test.ts`
**Scope:**
- [ ] `findOrCreateOAuthUser(provider, providerUserId, providerUsername, email?)` — find existing OAuth link or create new user
- [ ] `linkOAuthAccount(userId, provider, providerUserId, providerUsername)` — link OAuth to existing user
- [ ] Tests for: new user creation, existing user lookup, account linking, duplicate prevention

#### Unit 2a: Apple OAuth Initiation
**Files:** `app/routes/auth.apple.tsx`, `test/routes/auth.apple.test.ts`
**Scope:**
- [ ] Route that redirects to Apple's authorization URL
- [ ] State parameter for CSRF protection
- [ ] Proper scopes (name, email)

#### Unit 2b: Apple OAuth Callback
**Files:** `app/routes/auth.apple.callback.tsx`, `test/routes/auth.apple.callback.test.ts`
**Scope:**
- [ ] Handle Apple's POST response (id_token)
- [ ] Verify JWT, extract user info
- [ ] Call findOrCreateOAuthUser
- [ ] Create session, redirect

#### Unit 2c: Apple Sign-In Button
**Files:** `app/routes/login.tsx`, `app/routes/signup.tsx`
**Scope:**
- [ ] Add "Sign in with Apple" button
- [ ] Link to auth/apple route

#### Unit 3a: Google OAuth Initiation
**Files:** `app/routes/auth.google.tsx`, `test/routes/auth.google.test.ts`
**Scope:**
- [ ] Route that redirects to Google's authorization URL
- [ ] State parameter for CSRF protection

#### Unit 3b: Google OAuth Callback
**Files:** `app/routes/auth.google.callback.tsx`, `test/routes/auth.google.callback.test.ts`
**Scope:**
- [ ] Handle Google's response (code)
- [ ] Exchange code for tokens
- [ ] Get user info from Google
- [ ] Call findOrCreateOAuthUser
- [ ] Create session, redirect

#### Unit 3c: Google Sign-In Button
**Files:** `app/routes/login.tsx`, `app/routes/signup.tsx`
**Scope:**
- [ ] Add "Sign in with Google" button
- [ ] Link to auth/google route

### Environment Setup Needed
- Apple Developer account: Service ID, Key, Team ID
- Google Cloud Console: OAuth Client ID, Secret

### Progress Log

#### 2026-01-27 - ready-to-start
Audit complete. Work units defined. Ready to begin with Unit 1.

---

## ROADMAP (revised 2026-01-27)

1. **auth + oauth** ← CURRENT
2. recipe CRUD validation
3. steps & ingredients (add stepOutputUse)
4. image upload
5. deployment (validation checkpoint)
6. search + fellow chefs
7. recipe sharing + forking + spooning
8. UI polish (catalyst, aesthetic TBD)
9. MCP
10. mobile app

---

## BACKLOG (deferred items)

- Pagination (Phase 2)
- Reorder steps (Phase 3)
- Edit cookbook title (Phase 5)
- Check off shopping list items (Phase 6)
- Clear completed shopping items (Phase 6)

---

## Notes

- Only one task in "CURRENT" at a time
- OAuth: Apple first, Google second
- stepOutputUse: blocking, core to SJ recipe structure
- UI polish: NO assumptions, discuss aesthetic first
