# Keystone Admin Proxy with Clerk Auth

**Purpose**: Document the proxy setup that enables Keystone Admin UI access via Next.js with Clerk authentication, restricted to superAdmin users only.  
**Related**: [PHASE_1_FOUNDATION](./PHASE_1_FOUNDATION.md) (Clerk, Keystone), [APPENDIX_CLERK_SETUP](./APPENDIX_CLERK_SETUP.md)

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Files Involved](#files-involved)
4. [Access Control](#access-control)
5. [Troubleshooting & Fixes](#troubleshooting--fixes)
6. [Security Notes](#security-notes)

---

## Overview

The Keystone Admin UI is served by Keystone at `http://localhost:3001/admin`. To use Clerk for authentication and restrict access to superAdmin users, we proxy the Admin UI through Next.js at `http://localhost:3000/admin`. The proxy:

- Enforces Clerk sign-in via middleware
- Verifies superAdmin role via Keystone `GET_CURRENT_USER`
- Injects the Clerk JWT into all proxied requests so Keystone can resolve the session
- Proxies GraphQL requests to Keystone (Admin UI uses relative `/api/graphql`)

**Entry point**: `http://localhost:3000/admin` (not `localhost:3001/admin`)

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

## Security Notes

- Token is obtained server-side from Clerk cookies; it is never exposed to the client.
- Middleware protects all `/admin` routes; unauthenticated users are redirected to sign-in.
- Keystone `isAccessAllowed` enforces superAdmin at the backend; the proxy adds a second layer.
- GraphQL proxy forwards the token only when present; unauthenticated requests receive no token and Keystone will deny protected operations.

---

**Last Updated**: February 2026
