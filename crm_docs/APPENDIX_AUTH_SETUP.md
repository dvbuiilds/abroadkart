# Appendix D: better-auth — Authentication & Access Control

**Related**: [Master Requirements](./REQUIREMENTS_MASTER.md) · [Phase 1: Foundation](./PHASE_1_FOUNDATION.md) · [Phase 2: Core Schema](./PHASE_2_SCHEMA.md)

## 1. Overview

This appendix describes **better-auth** as the identity layer for:

- Consultant Portal (Next.js)
- Fulfilment Portal (Next.js)
- Keystone GraphQL API (authorization, tenancy, and roles)

Authentication is **self-hosted** in the Next.js app: email/password, optional Google OAuth, sessions, and JWTs (with JWKS) consumed by Keystone. There is **no Clerk** and no third-party identity webhooks.

## 2. Architecture

- **Single PostgreSQL database**
  - **`public` schema** — Keystone lists (including `User` with **`authUserId`** linking to better-auth `auth.user.id`).
  - **`auth` schema** — better-auth tables (`user`, `session`, `account`, `verification`, `jwks`) managed by Kysely; migrations via `yarn auth:migrate` (see §4 below).
- **JWT + JWKS** — Tokens are issued by better-auth’s `jwt` plugin; Keystone verifies them with `jose` using the JWKS URL (`/api/auth/jwks` on the Next origin).

## 3. Environment variables

### Next.js (repo root, e.g. `.env.local`)

| Variable                                    | Purpose                                                                                                                                                              |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                              | Same DB as Keystone; better-auth uses the `auth` schema                                                                                                              |
| `BETTER_AUTH_SECRET`                        | Signing secret for sessions                                                                                                                                          |
| `BETTER_AUTH_URL`                           | Public origin of the Next app (e.g. `http://localhost:3000`)                                                                                                         |
| `NEXT_PUBLIC_KEYSTONE_URL`                  | Keystone HTTP origin (e.g. `http://localhost:3001`)                                                                                                                  |
| `BETTER_AUTH_JWKS_URL` / issuer / audience  | Used by Keystone for JWT verify (see Keystone env)                                                                                                                   |
| `ABROADKART_BOOTSTRAP_SUPERADMIN_EMAIL`     | Optional: first user with this email gets `superAdmin` in Keystone on sign-up; everyone else gets **`pending`** until a super admin assigns a role in Keystone Admin |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional: enable Google OAuth when both are set                                                                                                                      |

### Keystone (`keystone/.env`)

| Variable               | Purpose                                                            |
| ---------------------- | ------------------------------------------------------------------ |
| `BETTER_AUTH_JWKS_URL` | e.g. `http://localhost:3000/api/auth/jwks`                         |
| `BETTER_AUTH_ISSUER`   | Must match JWT `iss` (typically same as `BETTER_AUTH_URL` on Next) |
| `BETTER_AUTH_AUDIENCE` | Must match JWT `aud`                                               |
| `FRONTEND_URL`         | Next app origin (CORS, SSO redirects)                              |
| `KEYSTONE_PUBLIC_URL`  | Public URL of this Keystone server (optional; defaults apply)      |

## 4. First-time setup

1. Ensure Postgres is running and run: `CREATE SCHEMA IF NOT EXISTS auth;`
2. From **`keystone/`**: `yarn db:push`
3. From **repo root** (with `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`): **`yarn auth:migrate`**

Verification: after `yarn auth:migrate`, confirm `auth` tables exist and sign-in at `/sign-in` works with a test user.

## 5. Next.js integration

| Concern              | Location                                                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Server config        | [`src/lib/auth.ts`](../src/lib/auth.ts)                                                                                                                       |
| Client               | [`src/lib/auth-client.ts`](../src/lib/auth-client.ts)                                                                                                         |
| API routes           | [`src/app/api/auth/[...all]/route.ts`](../src/app/api/auth/[...all]/route.ts)                                                                                 |
| Route protection     | [`src/middleware.ts`](../src/middleware.ts) — `getSessionCookie` from `better-auth/cookies`                                                                   |
| Sign-in / sign-up    | `/sign-in`, `/sign-up` ([`SignInPageClient`](../src/components/auth/SignInPageClient.tsx), [`SignUpPageClient`](../src/components/auth/SignUpPageClient.tsx)) |
| User menu / sign-out | [`UserMenu`](../src/components/auth/UserMenu.tsx)                                                                                                             |

## 6. Keystone integration

| Concern                        | Location                                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------- |
| Session (JWT)                  | [`keystone/lib/betterAuthSession.ts`](../keystone/lib/betterAuthSession.ts)                 |
| JWKS verify                    | [`keystone/lib/verifyBetterAuthJwt.ts`](../keystone/lib/verifyBetterAuthJwt.ts)             |
| Admin HTML gate + SSO callback | [`keystone/lib/adminBetterAuthMiddleware.ts`](../keystone/lib/adminBetterAuthMiddleware.ts) |

Keystone `User` links via **`authUserId`** (not `clerkUserId`). On sign-up, [`syncKeystoneUserFromAuthUser`](../src/lib/sync-keystone-user.ts) inserts the Keystone row. On sign-in, a **`session.create`** database hook updates **`lastLoginAt`** on the Keystone `User` row.

## 7. Keystone Admin SSO (super-admin)

```mermaid
sequenceDiagram
  participant Browser
  participant Keystone as Keystone :3001
  participant Next as Next :3000
  Browser->>Keystone: GET /admin (no session cookie)
  Keystone->>Next: 302 FRONTEND_URL/api/auth/keystone-sso?redirect_url=...
  Next->>Next: Session cookie present? Mint JWT via /api/auth/token
  Next->>Keystone: 302 /admin/_sso_callback?token=JWT&redirect=/admin
  Keystone->>Browser: Set ab_admin_session HttpOnly; redirect /admin
```

Optional minimal test pages: `/ba/sign-in`, `/ba/sign-up`.

## 8. GraphQL from the app

Obtain a JWT via **`GET /api/auth/token`** with a valid better-auth session cookie, then call Keystone **`POST /api/graphql`** with **`Authorization: Bearer &lt;jwt&gt;`**.

## 9. Security notes

- Validate JWTs server-side in Keystone (`verifyBetterAuthJwt`); do not trust role from the client alone.
- Use HTTPS in production; keep `BETTER_AUTH_SECRET` and DB credentials out of client bundles.
- No Clerk-style webhooks: user sync is handled in better-auth `databaseHooks`.

**Last updated**: April 2026
