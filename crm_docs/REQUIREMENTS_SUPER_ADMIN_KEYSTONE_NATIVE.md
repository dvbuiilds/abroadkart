# Requirements: Super-admin Keystone on native port (3001) + retained Next `/admin` (3000)

**Status**: **Implemented** (core behavior — verify Clerk redirect URLs in Dashboard after deploy)  
**Last updated**: April 2026  
**Related**: [ADMIN_PROXY.md](./ADMIN_PROXY.md), [PHASE_1_FOUNDATION](./PHASE_1_FOUNDATION.md), [APPENDIX_CLERK_SETUP](./APPENDIX_CLERK_SETUP.md)

---

## 1. Executive summary

Super-admins need a **stable, reliable** Keystone Admin UI and GraphQL experience **without** webpack HMR WebSocket failures and **without** an HTTP-only Next.js proxy in the critical path. The product **retains** `https://<app>/admin` on the **Next.js application (port 3000 in dev)** for **non–super-admin** users and existing flows; it is **not retired**. Super-admin CMS work is **canonical** on the **Keystone origin (port 3001 in dev)** with **the same identity** (Clerk + Keystone `User`), **super-admin only**, accepting a **separate Clerk browser session on that origin** if required.

---

## 2. Problem statement

### 2.1 Observed issues (today)

| Issue | Cause (technical) |
|--------|-------------------|
| Repeated `webpack-hmr` WebSocket failures when using proxied admin | Keystone Admin is a Next.js **dev** bundle; HMR opens `ws://<page-host>/admin/_next/webpack-hmr`. On **`http://localhost:3000/admin`**, the page host is Next; `src/app/admin/[...path]/route.ts` proxies with **`fetch`**, which **cannot** upgrade WebSockets to Keystone on 3001. |
| Intermittent GraphQL failures via `POST /api/graphql` on 3000 | Extra hop (Next Route Handler → Keystone), Clerk + multipart + header forwarding edge cases; harder to reason about than **same-origin** `3001/api/graphql` from the Admin UI. |

### 2.2 Constraint from current Keystone session

`keystone/lib/clerkAuth.ts` resolves the session **only** from `Authorization: Bearer <JWT>`. A browser opened directly on **`http://localhost:3001/admin`** does not send that header on navigation, so the Admin UI does not receive a session today.

---

## 3. Goals and non-goals

### 3.1 Goals

1. **G1 — Stability**: Super-admin Keystone Admin and its GraphQL traffic run on the **Keystone HTTP server** (default dev port **3001**), so **dev HMR** and **Admin ↔ GraphQL** share the normal Next-on-Keystone dev stack (no broken WS through the App Router proxy).
2. **G2 — Same users**: **One** Clerk organization / users; **one** Keystone `User` model; **super-admin** still defined by existing role rules (`session?.role === 'superAdmin'` in `keystone/keystone.ts` `isAccessAllowed`).
3. **G3 — Optional second sign-in on 3001**: Acceptable for super-admins to complete Clerk sign-in **once per origin** for `localhost:3001` (or production Keystone host), distinct from the session cookie on `localhost:3000`.
4. **G4 — Retain 3000 `/admin`**: The Next route **`/admin`** remains deployed and used for **non–super-admin** audiences (see §5.2). It is **explicitly not retired**.

### 3.2 Non-goals

- **NG1**: Replacing Clerk as the identity provider for super-admins.
- **NG2**: Granting non–super-admin roles access to full Keystone Admin on 3001 (unless a future requirement explicitly changes `isAccessAllowed`).
- **NG3**: Retiring or removing the Next.js app’s `/admin` tree without a replacement product decision.

---

## 4. Audiences and entry points (target)

| Audience | Canonical entry (dev) | Auth model (target) | Keystone Admin UI |
|----------|------------------------|---------------------|---------------------|
| **Super-admin** (CMS / data model work) | `http://localhost:3001/admin` | Clerk **browser session on 3001 origin** (cookies) **or** Bearer where injected | **Yes** — primary stable surface |
| **Non–super-admin** (“normal” platform users) | `http://localhost:3000/...` and **`http://localhost:3000/admin`** per product | Clerk on **3000** only | **No** full Keystone Admin (or only proxied/denied flows as defined in §5.2) |

**Production**: replace hosts with deployed Next URL vs deployed Keystone API/admin URL (same split: Next origin vs Keystone origin).

---

## 5. Functional requirements

### 5.1 Super-admin on Keystone origin (3001)

| ID | Requirement |
|----|-------------|
| **FR-SA-1** | Super-admin can open Keystone Admin at **`{KEYSTONE_ORIGIN}/admin`** (path unchanged: `ui.basePath: '/admin'`). |
| **FR-SA-2** | After Clerk sign-in valid for that origin, Keystone **session** resolves to the same `User` as today (lookup by `clerkUserId` / Clerk `sub`). |
| **FR-SA-3** | `isAccessAllowed` continues to require **`role === 'superAdmin'`**; all other roles denied Admin UI. |
| **FR-SA-4** | Admin UI client uses **same-origin** **`/api/graphql`** on Keystone (no dependency on Next proxy for this flow). |
| **FR-SA-5** | Dev HMR for Admin UI is **not** required to traverse Next on 3000. |

### 5.2 Next `/admin` on 3000 (not retired; not primary for super-admin CMS)

| ID | Requirement |
|----|-------------|
| **FR-N-1** | Route **`/admin`** on the Next application **remains** (middleware, pages, proxy handler) — **not removed** from the codebase or routing table. |
| **FR-N-2** | **`/admin` on 3000 serves non–super-admin users** (product-facing): e.g. informational page, access denied with link to super-admin entry on Keystone origin, or future lightweight admin tools **without** requiring the unstable proxied Keystone dev bundle for **super-admin daily work**. |
| **FR-N-3** | **Super-admin primary CMS** is **not** mandated through **`3000/admin`** once **FR-SA-*** is shipped; super-admins are **directed** to Keystone origin (docs, in-app copy, optional redirect). |
| **FR-N-4** | If the proxied Keystone path remains available for edge cases, behavior must be **documented** (supported vs deprecated for super-admins) to avoid two conflicting “sources of truth.” |

**Note (current vs target)**: Today `src/app/admin/page.tsx` uses `getAdminAuth()` and only allows **superAdmin** through to the proxied CMS. Implementing **FR-N-2** / **FR-N-3** implies a **behavior change** on 3000 for super-admins (redirect or “use CMS on …” message). That is **intentional** per this requirements doc.

---

## 6. Technical design (Keystone / Clerk)

### 6.1 Session strategy: dual mode in `clerkAuth.ts`

**Today**: Read JWT from `Authorization: Bearer …` only.

**Target**:

1. **Bearer path** (unchanged): If `Authorization` header present, `verifyToken` (existing `@clerk/backend` usage) and load Keystone `User` — keeps **`3000` proxy** working for any flow that still injects Bearer.
2. **Cookie path** (new): If no Bearer, use Clerk’s **request authentication** for the **incoming HTTP request** on the Keystone process (headers + URL), e.g. **`authenticateRequest`** from `@clerk/backend` (or `@clerk/express` if Express integration is cleaner), reading the **session JWT from cookies** Clerk sets for **this host**.

Both paths must resolve to the same **Keystone `User`** record and the same **`role`** field for `isAccessAllowed`.

**Dependencies**: Confirm `@clerk/backend` (already in `keystone/package.json`) exposes a request-based API suitable for raw `IncomingMessage` / Fetch `Request` from Keystone’s Express stack.

### 6.2 Clerk Dashboard / JWT

| Item | Action |
|------|--------|
| **Allowed origins / redirect URLs** | Add **Keystone public origin** (e.g. `http://localhost:3001`, production API URL if Admin is served from same host). |
| **`authorizedParties` in `clerkAuth.ts`** | Today includes `FRONTEND_URL` and `http://localhost:3000`. **Extend** to include Keystone origin(s) used in `verifyToken` / cookie session so tokens minted for **3001** validate. |
| **JWT template** | Ensure claims used for role (`public_metadata.role` or template claims) remain available for **both** Bearer templates used by Next and **session** path on 3001. |

### 6.3 Unauthenticated access to `/admin` on Keystone

When a user hits **`{KEYSTONE_ORIGIN}/admin`** without a valid Clerk session:

- **Option A**: Keystone / Express **redirect** to Clerk **hosted sign-in** with `redirect_url` back to `{KEYSTONE_ORIGIN}/admin/...`.
- **Option B**: Return **401** with link (less smooth).

Implementation likely uses **`server.extendExpressApp`** in `keystone/keystone.ts` (Keystone 6) to register middleware **before** Admin static handling, **only** for paths under `/admin`, without breaking GraphQL or health routes.

### 6.4 CORS and `credentials`

Today `server.cors.origin` is effectively **`FRONTEND_URL`** or `http://localhost:3000`.

**Target**: Browser **Admin on 3001** calling **`3001/api/graphql`** is **same-origin** — CORS not required for that pair. If any **browser** client on **3000** still calls **3001** GraphQL with cookies/credentials, CORS must allow that origin explicitly.

**Rule**: Keep CORS minimal; prefer **same-origin** for Admin+GraphQL on Keystone.

### 6.5 Environment variables (suggested)

| Variable | Purpose |
|----------|---------|
| `KEYSTONE_PUBLIC_URL` | Public base URL of Keystone (e.g. `https://api.example.com` or `http://localhost:3001`) for redirects and `authorizedParties`. |
| `FRONTEND_URL` | Next app origin (3000); remains for CORS and Clerk flows targeting the main app. |
| Existing Clerk secrets | Unchanged. |

### 6.6 Security notes

- **HTTPS** in production for both origins; secure cookies.
- **Origin allowlist** in Clerk must match actual deployed hosts; avoid wildcards beyond product policy.
- **No long-lived secrets in query strings** for sign-in handoff; use Clerk’s standard redirect + cookie model.
- **Session fixation**: Use Clerk’s documented flows; do not roll custom token-in-URL for session establishment.

---

## 7. Next.js application (3000) — technical expectations

| Area | Detail |
|------|--------|
| **Routes** | `src/app/admin/*`, `src/middleware.ts` matcher, `src/app/api/graphql/route.ts` **remain** unless a later task explicitly consolidates or removes duplicate super-admin paths. |
| **Product behavior** | Implement **FR-N-2** / **FR-N-3** in UI and/or server components (redirect super-admins to `KEYSTONE_PUBLIC_URL/admin`, show “normal user” content for others). |
| **GraphQL** | Consultant and app traffic may continue using **`NEXT_PUBLIC_KEYSTONE_URL`** and/or `/api/graphql` proxy as today; document whether super-admin **must** use 3001 GraphQL for CMS to avoid dual-path confusion. |

---

## 8. Testing matrix (acceptance)

| Case | Expected |
|------|----------|
| Super-admin, first visit **3001/admin** | Redirect to Clerk sign-in for **3001**; after login, Admin loads; GraphQL **200** for `__typename` or metadata query. |
| Super-admin, repeat visit **3001** | Session cookie present; Admin loads without 404. |
| Consultant on **3001/admin** | Denied by `isAccessAllowed` (existing rule). |
| **Non–super-admin** on **3000/admin** | Per **FR-N-2** (product-defined page or tool — not full Keystone Admin unless explicitly allowed). |
| **Super-admin** on **3000/admin** | Per **FR-N-3**: not primary CMS; redirect or messaging to **3001** (once implemented). |
| Bearer-injected proxy (if retained) | Still resolves session when `Authorization` present (regression test). |

---

## 9. Rollout checklist (implementation)

1. **Clerk Dashboard**: Add **`http://localhost:3001`** (and production Keystone origin) to **Allowed origins**; add **`http://localhost:3001/admin`** (and paths you use) to **Redirect allow list** so `sign-in?redirect_url=http://localhost:3001/...` is accepted.  
2. **`keystone/.env`**: Set **`CLERK_PUBLISHABLE_KEY`** (same value as Next `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`). Optionally set **`KEYSTONE_PUBLIC_URL`** (defaults to `http://localhost:<PORT>`).  
3. **Done in repo**: `authorizedParties` includes `FRONTEND_URL` + `KEYSTONE_PUBLIC_URL` + localhost defaults (`keystone/lib/clerkAuthorizedParties.ts`).  
4. **Done in repo**: Cookie path in `keystone/lib/clerkAuth.ts` via `createClerkClient` + `authenticateRequest`; **HTML GET `/admin`** unauthenticated → redirect to **`{FRONTEND_URL}/sign-in?redirect_url=...`** (`keystone/lib/adminBrowserAuthMiddleware.ts` + `server.extendExpressApp`).  
5. **Done in repo**: CORS allows `FRONTEND_URL` and `getKeystonePublicUrl()`.  
6. **Done in repo**: Next **`/admin`** entry and **non-static** `[...path]` **GET/HEAD** for super-admins **307** to **`{NEXT_PUBLIC_KEYSTONE_URL}/admin...`**.  

---

## 10. Open decisions (product / engineering)

1. **Exact UX on `3000/admin` for signed-in super-admin**: hard redirect vs dismissible banner vs keep proxy as “fallback” (discouraged for stability).  
2. **Whether to disable Bearer proxy for super-admin-only paths** to reduce maintenance surface, or keep for break-glass / automation.  
3. **Production hostnames**: single API domain serving both GraphQL and Admin vs split — affects Clerk URLs and CORS.  

---

## 11. Document history

| Date | Change |
|------|--------|
| 2026-04 | Initial draft from architecture discussion (HMR, GraphQL reliability, dual origin, retain 3000 `/admin`). |
| 2026-04 | Implemented: dual `clerkAuth` (Bearer + `authenticateRequest`), Express middleware for sign-in redirect + handshake, Next super-admin redirects to Keystone origin, CORS + env examples. |
