# Keystone Admin proxy with better-auth

**Purpose**: How super-admins reach Keystone Admin from Next.js using **better-auth** (session + JWT), restricted to **superAdmin** in Keystone.  
**Related**: [PHASE_1_FOUNDATION](./PHASE_1_FOUNDATION.md), [APPENDIX_AUTH_SETUP](./APPENDIX_AUTH_SETUP.md), [REQUIREMENTS_SUPER_ADMIN_KEYSTONE_NATIVE](./REQUIREMENTS_SUPER_ADMIN_KEYSTONE_NATIVE.md)

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Files involved](#files-involved)
4. [Access control](#access-control)
5. [Stable admin (dev & prod)](#stable-admin-dev--prod)
6. [Troubleshooting](#troubleshooting)
7. [Security notes](#security-notes)

---

## Overview

Keystone Admin UI runs on the Keystone server (default **`http://localhost:3001`**) under **`/admin`**.

**Super-admins (canonical)**: Open **`http://localhost:3001/admin`**. If not authenticated for Admin HTML, Keystone redirects to **`{FRONTEND_URL}/api/auth/keystone-sso`**, which uses the better-auth **session cookie** on Next to mint a JWT and complete **`/admin/_sso_callback`** (sets **`ab_admin_session`**). See [`keystone/lib/adminBetterAuthMiddleware.ts`](../keystone/lib/adminBetterAuthMiddleware.ts).

**`http://localhost:3000/admin`** (Next.js):

- [`src/app/admin/page.tsx`](../src/app/admin/page.tsx) uses **`getAdminAuth()`** (better-auth session + Keystone GraphQL role check).
- **Super-admins** are redirected to **`{NEXT_PUBLIC_KEYSTONE_URL}/admin`**.
- **Others** see access denied or sign-in redirect.
- **[...path] route** ([`src/app/admin/[...path]/route.ts`](../src/app/admin/[...path]/route.ts)): proxies some requests upstream with **`Authorization: Bearer`** from [`getBetterAuthJwtFromNextRequest`](../src/lib/auth-server.ts); GET/HEAD may **307** to Keystone to avoid broken HMR through the proxy.

Full spec: [REQUIREMENTS_SUPER_ADMIN_KEYSTONE_NATIVE.md](./REQUIREMENTS_SUPER_ADMIN_KEYSTONE_NATIVE.md).

---

## Architecture

```
User → localhost:3000/admin
       ↓
middleware (getSessionCookie) — session required
       ↓
/admin page.tsx → getAdminAuth() → sign-in | forbidden | redirect KEYSTONE/admin
       ↓
/admin/[...path] → optional proxy OR 307 to Keystone with Bearer JWT
       ↓
Keystone :3001/admin — betterAuthSession verifies JWT (Bearer or ab_admin_session)
       ↓
POST /api/graphql — same JWT rules
```

---

## Files involved

| File | Role |
|------|------|
| `src/app/admin/page.tsx` | Entry: `getAdminAuth()`, redirect to Keystone |
| `src/app/admin/[...path]/route.ts` | Proxy / redirect for `/admin/*` |
| `src/app/api/graphql/route.ts` | Proxies GraphQL to Keystone with Bearer JWT |
| `src/lib/admin-auth.ts` | better-auth session + `GET_CURRENT_USER` superAdmin check |
| `src/lib/auth-server.ts` | Mint JWT from cookies for API routes |
| `src/middleware.ts` | `getSessionCookie` — unauthenticated → `/sign-in?callbackUrl=…` |
| `keystone/keystone.ts` | `ui.basePath: '/admin'`, `isAccessAllowed` superAdmin |
| `keystone/lib/betterAuthSession.ts` | Session from Bearer or `ab_admin_session` |
| `keystone/lib/verifyBetterAuthJwt.ts` | JWKS JWT verification |

---

## Access control

- **Next middleware**: Protected routes need a better-auth session cookie (public paths include `/api/auth`, `/sign-in`, `/sign-up`, `/ba/*`, etc.).
- **Admin entry**: `getAdminAuth()` requires GraphQL-confirmed **`role === 'superAdmin'`**.
- **Static assets** under `/admin/*`: lightweight JWT from cookies (see route handler).
- **Keystone**: `isAccessAllowed` requires **`session?.role === 'superAdmin'`** for Admin UI.

---

## Stable admin (dev & prod)

- **Dev**: Prefer **`http://localhost:3001/admin`** for daily CMS work so HMR matches Keystone’s Admin bundle.
- **Env**: **`NEXT_PUBLIC_KEYSTONE_URL`** must be the Keystone origin (e.g. `http://localhost:3001`), not the Next origin — avoids self-proxy loops ([`src/lib/keystone-url.ts`](../src/lib/keystone-url.ts)).

---

## Troubleshooting

### Next.js 15 async `params`

Use `params: Promise<{ path?: string[] }>` and `await ctx.params`.

### ERR_CONTENT_DECODING_FAILED

Strip `Content-Encoding` and `Transfer-Encoding` from proxied responses when forwarding from Keystone.

### GraphQL 404 on `:3000`

Admin UI may POST to same-origin `/api/graphql`; ensure [`src/app/api/graphql/route.ts`](../src/app/api/graphql/route.ts) proxies to Keystone with Bearer JWT.

### WebSocket `webpack-hmr` on `:3000`

Use **`3001/admin`** for Keystone Admin in dev, or expect HMR noise when loading proxied `_next` assets through Next.

---

## Security notes

- JWTs are minted server-side; prefer HTTPS in production.
- **`ab_admin_session`** is HttpOnly, path `/admin`, short TTL (see middleware).
- Keystone enforces **superAdmin** for Admin UI regardless of Next.

**Last updated**: April 2026
