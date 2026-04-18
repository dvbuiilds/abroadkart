# Requirements: Super-admin Keystone on native port (3001) + Next `/admin` (3000)

**Status**: **Implemented** (better-auth SSO + JWT; see [APPENDIX_AUTH_SETUP.md](./APPENDIX_AUTH_SETUP.md))  
**Last updated**: April 2026  
**Related**: [ADMIN_PROXY.md](./ADMIN_PROXY.md), [PHASE_1_FOUNDATION](./PHASE_1_FOUNDATION.md), [APPENDIX_AUTH_SETUP](./APPENDIX_AUTH_SETUP.md)

---

## 1. Executive summary

Super-admins need a **stable** Keystone Admin UI and GraphQL on the **Keystone HTTP server** (default dev port **3001**), avoiding webpack HMR WebSocket failures through an App Router `fetch` proxy. The Next app at **`/admin`** remains for entry, auth checks, and redirects. Identity is **better-auth** (same Postgres DB); Keystone sessions resolve from a **better-auth JWT** (`Authorization: Bearer` or HttpOnly `ab_admin_session` on `/admin` after SSO).

---

## 2. Problem statement

| Issue | Cause |
|-------|--------|
| `webpack-hmr` WebSocket failures on proxied admin | Keystone Admin is a Next dev bundle; HMR cannot traverse `fetch` proxy from `3000`. |
| Extra hop GraphQL on `3000` | Prefer same-origin `3001/api/graphql` from Admin on Keystone. |

Legacy note: Keystone previously expected Bearer-only; **HTML** navigations to `3001/admin` now use **SSO**: redirect to Next → mint JWT → `/admin/_sso_callback` sets `ab_admin_session`. See [`keystone/lib/adminBetterAuthMiddleware.ts`](../keystone/lib/adminBetterAuthMiddleware.ts).

---

## 3. Goals and non-goals

### Goals

1. **G1 — Stability**: Super-admin CMS on Keystone origin; dev HMR stays on Keystone’s stack.
2. **G2 — Same users**: One Keystone `User` model; `authUserId` links to better-auth `user.id`; `session?.role === 'superAdmin'` for Admin UI (`keystone/keystone.ts` `isAccessAllowed`).
3. **G3 — SSO**: Unauthenticated HTML GET `/admin` on Keystone redirects to `{FRONTEND_URL}/api/auth/keystone-sso?redirect_url=…`.
4. **G4 — Retain `3000/admin`**: Next route remains; super-admins are redirected to Keystone Admin URL when appropriate.

### Non-goals

- **NG1**: Third-party hosted identity (e.g. Clerk) — replaced by self-hosted better-auth.
- **NG2**: Non–super-admin full Keystone Admin on 3001 (unless requirements change).

---

## 4. Audiences and entry points

| Audience | Canonical entry (dev) | Auth |
|----------|----------------------|------|
| **Super-admin** | `http://localhost:3001/admin` (or Next `/admin` → redirect) | better-auth session on Next + JWT for Keystone |
| **Other roles** | `http://localhost:3000/...` | better-auth; no full Keystone Admin |

---

## 5. Technical design (better-auth + Keystone)

### 5.1 Session strategy

- **`keystone/lib/betterAuthSession.ts`**: Reads `Authorization: Bearer <jwt>` **or** cookie `ab_admin_session` on `/admin`.
- **`keystone/lib/verifyBetterAuthJwt.ts`**: JWKS from `BETTER_AUTH_JWKS_URL`, validates `iss` / `aud`.
- **Subject `sub`**: better-auth user id → load Keystone `User` by **`authUserId`**.

### 5.2 JWKS

better-auth serves JWKS at **`{BETTER_AUTH_URL}/api/auth/jwks`** (Next origin). Keystone env must point `BETTER_AUTH_JWKS_URL` at that URL.

### 5.3 Unauthenticated `/admin` on Keystone

Express middleware (`registerAdminBetterAuthMiddleware`) redirects HTML document requests under `/admin` to **`{FRONTEND_URL}/api/auth/keystone-sso`**, which mints a short-lived JWT and redirects to **`/admin/_sso_callback?token=…`**, which sets **`ab_admin_session`** (HttpOnly, path `/admin`).

### 5.4 Environment variables

| Variable | Purpose |
|----------|---------|
| `BETTER_AUTH_JWKS_URL` | e.g. `http://localhost:3000/api/auth/jwks` |
| `BETTER_AUTH_ISSUER` / `BETTER_AUTH_AUDIENCE` | Must match JWT claims |
| `FRONTEND_URL` | Next origin for SSO redirect |
| `KEYSTONE_PUBLIC_URL` | Keystone public URL (redirects, CORS) |

---

## 6. Next.js (3000)

- **`src/app/admin/page.tsx`**: `getAdminAuth()` → better-auth session + GraphQL `superAdmin` check → redirect to `{NEXT_PUBLIC_KEYSTONE_URL}/admin`.
- **`src/app/admin/[...path]/route.ts`**: Proxies non-GET / static assets with Bearer JWT from cookies where needed; GET/HEAD often **307** to Keystone origin.

---

## 7. Testing matrix (acceptance)

| Case | Expected |
|------|----------|
| Super-admin, `3001/admin` without cookie | Redirect through SSO; then Admin loads |
| Super-admin repeat visit | `ab_admin_session` valid → Admin loads |
| Non–super-admin | `isAccessAllowed` denies Admin UI |

---

## 8. Document history

| Date | Change |
|------|--------|
| 2026-04 | Initial draft (HMR, dual origin). |
| 2026-04 | **Migrated to better-auth**: JWT + JWKS; SSO handoff; removed Clerk/cookie `authenticateRequest` design. |
