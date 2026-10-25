# Architecture Snapshot (as of 2026-07-25)

This is a verified, code-level summary — cross-checked against `keystone/` and `src/` rather than taken from the planning docs in this folder (which are partly aspirational/stale, e.g. dated Jan–Feb 2026). Use this as the quick orientation; use `INDEX.md` and its linked docs for deep dives, but verify specifics against code before relying on them.

## What this is
Abroad Kart: a multi-tenant CRM for study-abroad consultancy. Tenants are **Consultant** agencies; each has Users (agents/admins) who manage Students through applications, loans, documents, accommodation, and reimbursements. A **Fulfilment** team works cross-tenant to process loans/documents. A **Super Admin** manages everything via Keystone's native Admin UI.

## Two apps, one repo
- **`src/`** — Next.js 15 (App Router, React 19) frontend. This is the only thing end users hit directly (port 3000-ish).
- **`keystone/`** — separate KeystoneJS 6 app (own `package.json`, own `node_modules`) that owns the Postgres schema, auto-generates the GraphQL API at `/api/graphql`, and serves the Keystone Admin UI at `/admin` on its own port (3001, per `keystone/keystone.ts:96`). Next.js proxies `/admin/*` through to it (see `src/app/admin/[...path]/route.ts` and `ADMIN_PROXY.md`).

They share one Postgres database: Keystone owns the `public` schema (business data), better-auth owns an `auth` schema (see `APPENDIX_AUTH_SETUP.md`).

## Auth (better-auth, not Clerk)
- `src/lib/auth.ts` / `auth-server.ts` / `auth-client.ts` wire up **better-auth** with its own Postgres tables (`auth` schema).
- Next.js middleware (`src/middleware.ts`) does a cheap cookie-presence check only — redirects to `/sign-in` if no session cookie, otherwise passes through. No role check happens here.
- Actual role-based routing happens post-login in `src/lib/dashboard-redirect.ts`: it fetches the current user's role via GraphQL and sends `superAdmin → /admin`, `fulfilment → /fulfilment/dashboard`, `consultantAdmin`/`consultantAgent → /consultant/dashboard`.
- Keystone itself never talks to better-auth's DB directly for session checks — instead the frontend fetches a **JWT** from `GET /api/auth/token` and calls Keystone's GraphQL endpoint with `Authorization: Bearer <jwt>`. Keystone verifies it via JWKS (`betterAuthSession`, see `keystone/lib/`) and loads the `User` row by `authUserId` to build `context.session`.
- There's a leftover `src/app/api/webhooks/clerk/` route — evidence of a prior Clerk-based auth setup that was migrated away (see recent commit "enhance docker-auth-migrate.sh for Better Auth table validation"). Worth confirming with you whether that route is still needed or is dead code.
- Keystone Admin UI (`/admin`) is gated to `role === "superAdmin"` only (`keystone/keystone.ts:52-54`), fronted by a separate better-auth-aware proxy/SSO flow (`ADMIN_PROXY.md`, `src/app/api/auth/keystone-sso/`).
- There's also a `src/app/ba/` (sign-in/sign-up) — a second, public-marked auth entry point (`isPublicPath` in middleware treats `/ba` as public) — worth asking you what this is for (B2B/agency self-serve signup?) since it's not covered in the docs.

## Roles & multi-tenancy
Five roles (`keystone/access/roles.ts`): `pending`, `superAdmin`, `fulfilment`, `consultantAdmin`, `consultantAgent`. New sign-ups presumably land as `pending` until a super admin assigns a real role.

Tenancy model (`keystone/access/rules.ts`):
- Every tenant-scoped list has a `tenant` relationship to `Consultant`.
- `filterByTenant` access filter: fulfilment/superAdmin get `true` (unfiltered/see-all), everyone else gets `{ tenant: { id: { equals: session.tenantId } } }`. No tenant on session → no rows.
- `autoSetTenantHook` (`keystone/hooks/autoSetTenant.ts`) stamps `tenant` on create from the session, so consultants can't set/spoof another tenant's ID.
- This is row-level multi-tenancy via a shared-schema, discriminator-column pattern (not schema-per-tenant or DB-per-tenant).

## Data model (13 Keystone lists)
`User, Consultant, ActivityLog, University, Program, Student, StudentDocument, Application, LoanApplication, AccommodationBooking, Reimbursement, PrepaidCard, Task` — all registered in `keystone/keystone.ts`. Matches `APPENDIX_DATABASE.md`'s 13-entity list. `Student` is the hub: relationships fan out to applications, documents, loan applications, accommodations, reimbursements, one prepaid card, and tasks.

Every tenant-scoped list's mutation hooks do two things via `afterOperationWithCache(key)` (`keystone/hooks/cacheInvalidation.ts`):
1. `logActivityHook` — writes an `ActivityLog` row (audit trail).
2. `cacheInvalidationAfterOperation` — calls Redis `invalidatePattern('gql:<tenantId>:*:*<key>*')`.

## Redis: wired for invalidation, not yet for reads
Confirmed by grep: `keystone/lib/redis.ts` exports `getCached()` (cache-aside read-through helper) but **it's never called anywhere in the codebase**. Only `invalidatePattern()` is used, on every mutation. So today Redis connects and receives invalidation calls that delete keys that were never written — effectively a no-op. This matches what you said: Redis is present but unused. If/when query caching is added, it should reuse the existing `gql:<tenantId>:...` key convention so the invalidation hooks start being meaningful instead of needing rework.

## File storage
Not S3/GCS as the older docs say — actual config (`keystone/keystone.ts:65-82`) uses **Cloudflare R2** via the S3-compatible API (`forcePathStyle: true`, per the recent "fix: enable forcePathStyle for S3 compatibility" commit), three buckets/prefixes: `student_documents`, `receipts`, `university_logos`.

## Frontend route structure (`src/app/`)
- `(auth)` — sign-in/sign-up/forgot-password (public)
- `(dashboard)/dashboard` — likely a generic/legacy landing route
- `consultant/` — dashboard, students, applications, loans, documents, tasks (agent/admin portal)
- `fulfilment/` — dashboard, loans, documents, cards (prepaid), reimbursements, analytics (cross-tenant ops portal)
- `admin/` — proxy through to Keystone Admin UI
- `ba/` — separate auth entry (purpose unconfirmed, see above)
- `api/` — better-auth catch-all, Keystone GraphQL proxy, consultant document upload, sitemap, legacy Clerk webhook

## Tech stack corrections vs. the older docs
- Auth is **better-auth**, not Clerk (Clerk webhook route is a leftover).
- Storage is **Cloudflare R2**, not generic S3/GCS.
- Redis caching is **not active** yet (invalidation-only, unused read path).
- No evidence of Apollo Server "federation" — it's Keystone's built-in Apollo instance with custom logging/error-formatting plugins.

## Open questions worth asking you
1. Is `src/app/ba/` and its sign-in/sign-up flow a distinct signup path (e.g., self-serve agency onboarding) that should be documented?
2. Is the Clerk webhook route (`src/app/api/webhooks/clerk/`) dead code safe to remove, or still receiving traffic?
3. Any near-term plan to actually use Redis for read caching, or should `getCached` be considered unused/removable for now?
