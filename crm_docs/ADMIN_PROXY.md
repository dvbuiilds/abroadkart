# Keystone Admin Proxy with Clerk Auth

**Purpose**: Document the proxy setup that enables Keystone Admin UI access via Next.js with Clerk authentication, restricted to superAdmin users only.  
**Related**: [PHASE_1_FOUNDATION](./PHASE_1_FOUNDATION.md) (Clerk, Keystone), [APPENDIX_CLERK_SETUP](./APPENDIX_CLERK_SETUP.md), [REQUIREMENTS_SUPER_ADMIN_KEYSTONE_NATIVE](./REQUIREMENTS_SUPER_ADMIN_KEYSTONE_NATIVE.md) (super-admin canonical on **3001**; **`3000/admin`** retained — redirects super-admins, non–super-admin UX unchanged)

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Files Involved](#files-involved)
4. [Access Control](#access-control)
5. [Resolution plan: stable admin (dev & prod)](#resolution-plan-stable-admin-dev--prod)
6. [Troubleshooting & Fixes](#troubleshooting--fixes)
7. [Security Notes](#security-notes)

---

## Overview

The Keystone Admin UI runs on the Keystone server (default **`http://localhost:3001`**) under **`/admin`**.

**Super-admins (canonical)**: Open **`http://localhost:3001/admin`** in the browser. Keystone resolves Clerk via **`authenticateRequest`** (session cookies on the **3001** origin) and/or **`Authorization: Bearer`** (`keystone/lib/clerkAuth.ts`). Set **`CLERK_PUBLISHABLE_KEY`** in `keystone/.env` (same as Next’s publishable key). Unauthenticated HTML navigations to `/admin` are redirected to **`{FRONTEND_URL}/sign-in?redirect_url=…`** (see `keystone/lib/adminBrowserAuthMiddleware.ts`).

**`http://localhost:3000/admin`** (Next.js):

- Still protected by Clerk middleware and **`getAdminAuth()`** (superAdmin check on the entry page).
- **Super-admins** are **redirected** to **`{NEXT_PUBLIC_KEYSTONE_URL}/admin`** (stable CMS).
- **Non–super-admins** see the existing access-denied experience on the entry page; proxied **`/admin/*`** routes remain for static edge cases (see [REQUIREMENTS_SUPER_ADMIN_KEYSTONE_NATIVE.md](./REQUIREMENTS_SUPER_ADMIN_KEYSTONE_NATIVE.md)).
- Where the proxy still runs, it **injects** `Authorization: Bearer …` for upstream Keystone requests.

Full spec: [REQUIREMENTS_SUPER_ADMIN_KEYSTONE_NATIVE.md](./REQUIREMENTS_SUPER_ADMIN_KEYSTONE_NATIVE.md).

---

## Architecture

```
User → localhost:3000/admin
       ↓
Middleware (Clerk) → auth.protect()
       ↓
/admin page.tsx → getAdminAuth() → redirect to sign-in | access denied | /admin/users
       ↓
/admin/[...path] route → proxy to Keystone with Authorization: Bearer <token>
       ↓
Keystone localhost:3001/admin/* (HTML, _next assets)
       ↓
Admin UI JS → /api/graphql (relative)
       ↓
Next.js /api/graphql route → proxy to Keystone with Authorization: Bearer <token>
       ↓
Keystone localhost:3001/api/graphql
```

---

## Files Involved

| File | Role |
|------|------|
| `src/app/admin/page.tsx` | Entry page: checks auth, redirects to sign-in or `/admin/users` |
| `src/app/admin/[...path]/route.ts` | Proxies `/admin/*` (HTML, assets) to Keystone with JWT |
| `src/app/api/graphql/route.ts` | Proxies GraphQL requests to Keystone with JWT |
| `src/lib/admin-auth.ts` | Resolves Clerk user and superAdmin role via Keystone `GET_CURRENT_USER` |
| `src/middleware.ts` | Protects `/admin` and `/admin/(.*)` so Clerk runs for all admin routes |
| `keystone/keystone.ts` | `ui.basePath: '/admin'`, `isAccessAllowed` requires `session?.role === 'superAdmin'` |
| `keystone/lib/clerkAuth.ts` | Verifies JWT and maps to Keystone User |

---

## Access Control

- **Middleware**: All `/admin` and `/admin/*` routes require Clerk sign-in (`auth.protect()`).
- **Document requests**: Full `getAdminAuth()` check (Clerk token + Keystone `GET_CURRENT_USER` + superAdmin role).
- **Static assets** (`_next`, `__next`, `.js`, `.css`, etc.): Lightweight check (Clerk token only) to avoid GraphQL load on every asset request.
- **Keystone**: `isAccessAllowed` requires `session?.role === 'superAdmin'` in all environments.

---

## Resolution plan: stable admin (dev & prod)

Two separate issues affect “stability” today: **(A)** the Admin UI’s **webpack HMR WebSocket** cannot traverse the App Router `fetch` proxy, and **(B)** **`POST /api/graphql`** failures (often **404** forwarded from the wrong upstream or wrong port).

### Goals

- **Production**: Super-admins use the **Keystone public origin** for Admin (e.g. `https://<api-host>/admin`) with Clerk session on that host; GraphQL same-origin where possible.
- **Local dev**: Super-admins use **`http://localhost:3001/admin`** (native Keystone + Clerk cookies; set **`CLERK_PUBLISHABLE_KEY`** in `keystone/.env`). **`3000/admin`** redirects them here. **No mystery 404s** on `/api/graphql` once env wiring is correct.

### Phase 0 — Verify wiring (15 minutes)

1. **Keystone** runs from `keystone/` with `npm run dev` (or `start`); confirm **`keystone/.env`** `PORT` matches what Next expects (default **3001** if unset).
2. **Next** `.env.local` sets **`NEXT_PUBLIC_KEYSTONE_URL=http://localhost:3001`** (must **not** be `http://localhost:3000` — that causes self-proxy loops and bogus statuses).
3. **Smoke tests**
   - `curl -sS -X POST http://localhost:3001/api/graphql -H 'Content-Type: application/json' -d '{"query":"{ __typename }"}'` → **200** with `data`.
   - While signed in as superAdmin in the browser, `POST http://localhost:3000/api/graphql` with the same JSON → **200** (if **404**, see Phase 1).

### Phase 1 — Eliminate GraphQL 404 / proxy failures

1. **Confirm source of 404** in DevTools: response body/headers from Next vs forwarded Apollo/Keystone.
2. **Implemented**: `src/app/api/graphql/route.ts` logs upstream URL and status in **development** when the upstream response status is **≥ 400**.
3. **Implemented**: `src/lib/keystone-url.ts` + checks in `src/app/api/graphql/route.ts` and `src/app/admin/[...path]/route.ts` return **502** with a clear JSON error if `NEXT_PUBLIC_KEYSTONE_URL` is the **same origin** as the Next app (self-proxy loop), or **500** if the env value is not a valid URL. README and `.env.local.example` document the **`PORT` / `NEXT_PUBLIC_KEYSTONE_URL`** alignment requirement.

**Exit criteria**: `POST /api/graphql` from the proxied admin returns **200** for metadata and normal mutations while authenticated as superAdmin.

### Phase 2 — HMR / WebSocket (legacy / optional tracks)

Super-admin **canonical** dev URL is **`http://localhost:3001/admin`** (see [REQUIREMENTS_SUPER_ADMIN_KEYSTONE_NATIVE.md](./REQUIREMENTS_SUPER_ADMIN_KEYSTONE_NATIVE.md)); HMR runs on Keystone’s dev server.

| Track | When to use | Work |
|--------|-------------|------|
| **2a — Legacy** | Old bookmarks hit **`3000/admin/_next`** only | **webpack-hmr** may still log failures for proxied dev assets; safe to ignore if you use **3001** for CMS. |
| **2b — Production parity** | Staging/prod | Run Keystone **`build` + `start`**; no dev HMR in the browser. |
| **2c — WS proxy** | Rare | WebSocket-capable reverse proxy in front of Next + Keystone if you must hot-reload **through** `3000` (dev only). |

### Phase 3 — Docs and onboarding

1. **Implemented**: **README** §6, **`.env.local.example`**, **`keystone/.env.example`** (`CLERK_PUBLISHABLE_KEY`, `KEYSTONE_PUBLIC_URL`, `PORT`), and [REQUIREMENTS_SUPER_ADMIN_KEYSTONE_NATIVE.md](./REQUIREMENTS_SUPER_ADMIN_KEYSTONE_NATIVE.md).

### Summary

Super-admins: **native Keystone origin + Clerk publishable key**. **`3000/admin`** remains for access checks and redirects. Phase 0–1 guardrails still apply to **`/api/graphql`** on Next when used.

---

## Troubleshooting & Fixes

Issues encountered during implementation and their resolutions.

### 1. Next.js 15 async `params`

**Symptom**: `params.path` used synchronously caused runtime error: `params should be awaited`.

**Fix**: Use `params: Promise<{ path?: string[] }>` and await before use:

```ts
type RouteContext = { params: Promise<{ path?: string[] }> };
const { path } = await ctx.params;
```

---

### 2. ERR_CONTENT_DECODING_FAILED

**Symptom**: Network tab showed `(failed) net::ERR_CONTENT_DECODING_FAILED` for `/admin/users`.

**Cause**: Keystone sends compressed responses (`Content-Encoding: gzip`). The proxy forwarded both body and headers; the browser tried to decompress and failed (mismatch or stream corruption).

**Fix**: Strip encoding headers from the response before returning:

```ts
const responseHeaders = new Headers(upstreamResponse.headers);
responseHeaders.delete("Content-Encoding");
responseHeaders.delete("Transfer-Encoding");
```

---

### 3. Static assets returning 500

**Symptom**: Document loaded (200) but `webpack.js`, `main.js`, `_app.js`, etc. returned 500.

**Cause**: Every request (including assets) ran `getAdminAuth()`, which performs a GraphQL call. Under concurrent load this caused failures.

**Fix**: For static asset paths (`_next`, `__next`, `.js`, `.css`, etc.), use a lightweight check (Clerk token only) and skip the GraphQL role check:

```ts
if (isStaticAsset(pathStr)) {
  const { userId, getToken } = await auth();
  if (userId) token = await getToken();
  if (!token) return new Response("Unauthorized", { status: 401 });
} else {
  const authResult = await getAdminAuth();
  // ...
}
```

---

### 4. Clerk `auth()` not available for static assets

**Symptom**: `Clerk: auth() was called but Clerk can't detect usage of clerkMiddleware()`.

**Cause**: The middleware matcher excluded paths with `_next` and file extensions (`.js`, `.css`). Requests to `/admin/_next/static/.../webpack.js` never ran Clerk middleware, so `auth()` had no context.

**Fix**: Add `/admin` and `/admin/(.*)` to the middleware matcher so Clerk runs for all admin routes:

```ts
matcher: [
  "/((?!.+\\.[\\w]+$|_next).*)",
  "/",
  "/(api|trpc)(.*)",
  "/admin",
  "/admin/(.*)",
],
```

---

### 5. GraphQL 404

**Symptom**: Admin UI made requests to `localhost:3000/api/graphql` which returned 404.

**Cause**: Admin UI uses relative URLs. When loaded at `localhost:3000/admin/users`, `/api/graphql` resolves to `localhost:3000/api/graphql`. Next.js had no route for it.

**Fix**: Add `src/app/api/graphql/route.ts` to proxy GraphQL requests to Keystone with the Clerk JWT.

---

### 6. GraphQL 500 (auth usage)

**Symptom**: GraphQL proxy returned 500.

**Cause**: Incorrect usage of Clerk `auth()`: `auth().getToken()` calls `.getToken()` on a Promise. `auth()` returns a Promise; `getToken` is on the resolved object.

**Fix**: Destructure and await correctly:

```ts
const { getToken } = await auth();
const token = await getToken();
```

---

### 7. WebSocket `webpack-hmr` failures on `localhost:3000`

**Symptom**: Console shows repeated failures for `ws://localhost:3000/admin/_next/webpack-hmr`.

**Cause**: Keystone’s Admin UI is a Next.js dev bundle that opens a **WebSocket** for HMR. `src/app/admin/[...path]/route.ts` proxies with **`fetch`**, which cannot complete a WebSocket upgrade (`101 Switching Protocols`).

**Mitigation**: Use **`http://localhost:3001/admin`** for super-admin CMS in dev, or ignore noise if you still load proxied **`_next`** assets from **3000**. See [REQUIREMENTS_SUPER_ADMIN_KEYSTONE_NATIVE.md](./REQUIREMENTS_SUPER_ADMIN_KEYSTONE_NATIVE.md).

---

### 8. Native **`3001/admin`** still fails (404, redirect loop, or “publishable key”)

**Symptom**: Admin on **3001** never loads, dev console shows Clerk warnings, or you bounce between **3000** sign-in and **3001** forever.

**Causes / fixes**:

1. Set **`CLERK_PUBLISHABLE_KEY`** in **`keystone/.env`** (same value as **`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`** on Next). Without it, cookie-based `authenticateRequest` is skipped.
2. In **Clerk Dashboard**, allow **`http://localhost:3001/*`** (and your production Keystone URL) in **redirect URLs** / **allowed origins** so `redirect_url=http://localhost:3001/admin` works from **`/sign-in`** on **3000**.
3. Set **`KEYSTONE_PUBLIC_URL`** if Keystone is not reachable at the default `http://localhost:<PORT>` (used in `redirect_url` and CORS).

---

## Security Notes

- On **3000**, Clerk session is server-side; Bearer tokens for Keystone are added in Route Handlers, not exposed in URLs.
- On **3001**, Clerk **session cookies** apply to the Keystone origin; keep **HTTPS** and strict **redirect URL** allowlists in production.
- Middleware protects **`/admin`** on Next; Keystone **`isAccessAllowed`** still enforces **superAdmin** for the Admin UI.
- The Next **GraphQL** proxy forwards Bearer only when present; unauthenticated requests receive no token for protected operations.

---

**Last Updated**: April 2026
