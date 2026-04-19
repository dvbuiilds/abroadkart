# AbroadKart CRM Platform

Multi-tenant CRM platform for study abroad consultants built with Next.js, KeystoneJS, PostgreSQL, and [better-auth](https://www.better-auth.com/) for authentication (email/password + optional Google OAuth; JWT + JWKS for Keystone).

## Project Structure

```
abroadkart/
├── keystone/              # KeystoneJS backend (GraphQL API)
│   ├── schema/           # Data models
│   ├── access/           # Access control rules
│   ├── hooks/            # Database hooks
│   └── lib/              # Utilities
├── src/                  # Next.js frontend
│   ├── app/              # App Router (new)
│   ├── pages/            # Pages Router (existing)
│   └── components/       # React components
└── docker-compose.yml    # Local development services
```

## Tech Stack

### Backend

- **KeystoneJS 6** - Headless CMS and GraphQL API
- **PostgreSQL 16** - Primary database
- **Redis 7** - Caching layer
- **better-auth** - Authentication (Postgres `auth` schema, JWT for Keystone GraphQL)

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **ShadCN/UI** - UI components
- **TanStack React Query** - Client-side caching
- **GraphQL Request** - GraphQL client

## Prerequisites

- Node.js 20 LTS or higher
- Docker and Docker Compose
- Postgres reachable for app + `auth` schema (see below)
- Cloudflare account (for R2 storage)

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install Keystone dependencies
cd keystone
npm install
cd ..
```

### 2. Environment variables (two files)

There are **two** env files:

| File | Purpose |
|------|--------|
| **`.env`** (repo root) | Next.js (`yarn dev` / Docker `nextjs` service) **and** Compose secrets (`POSTGRES_PASSWORD`, `REDIS_PASSWORD`). Copy from [`.env.example`](./.env.example). |
| **`keystone/.env`** | Keystone only. Copy from [`keystone/.env.example`](./keystone/.env.example). Use the **same** `POSTGRES_PASSWORD` / `REDIS_PASSWORD` as in root `.env` inside `DATABASE_URL` / `REDIS_URL`. |

When you run **`docker compose`**, `DATABASE_URL` for Keystone and Next is **overridden** in [`docker-compose.yml`](./docker-compose.yml) so containers use the `postgres` and `redis` hostnames; your files can keep `localhost` URLs for local dev.

### 3. Start Docker Services

```bash
# Start PostgreSQL and Redis
docker compose up -d

# Verify services are running
docker compose ps
```

PostgreSQL: `localhost:5432` — user `postgres`, database `abroadkart`, password: value you set in **`.env`** as `POSTGRES_PASSWORD`.

Redis: `localhost:6379` — password: value you set in **`.env`** as `REDIS_PASSWORD` (required; Redis is started with `--requirepass`).

### 4. Fill in `.env` and `keystone/.env`

Copy [`.env.example`](./.env.example) → **`.env`** and [`keystone/.env.example`](./keystone/.env.example) → **`keystone/.env`**, then set secrets and R2 values. Root **`.env`** holds Compose passwords, **`BETTER_AUTH_SECRET`**, **`PUBLIC_APP_URL`** / **`PUBLIC_ADMIN_URL`** (browser-facing origins), and `DATABASE_URL` for local dev. **`keystone/.env`** holds the same **`PUBLIC_*`** pair (must match), session secret, R2, and localhost-style `DATABASE_URL` / `REDIS_URL` / `BETTER_AUTH_JWKS_URL` — Docker Compose overrides those three with internal hostnames at runtime.

**`PUBLIC_ADMIN_URL`** must be the **Keystone** origin (default `http://localhost:3001`), not the Next origin. Legacy: `NEXT_PUBLIC_KEYSTONE_URL` is still read if **`PUBLIC_ADMIN_URL`** is unset.

Optional: Next.js also loads **`.env.local`** if present; it overrides **`.env`** for the same keys—remove or align it so it does not conflict with **`.env`**.

With **Docker Compose**, [`db/init`](./db/init) and the [`nextjs-migrate`](./docker-compose.yml) service create the `auth` schema and Better Auth tables before Next.js starts. Otherwise (local Postgres only): `CREATE SCHEMA IF NOT EXISTS auth;`, then `cd keystone && yarn db:push`, then from the repo root `yarn auth:migrate`.

**Sign-in:** use **`/sign-in`** and **`/sign-up`**. For Keystone admin SSO, open **`http://localhost:3001/admin`** (redirects via **`/api/auth/keystone-sso`** when needed). Details: [crm_docs/APPENDIX_AUTH_SETUP.md](./crm_docs/APPENDIX_AUTH_SETUP.md).

### 5. Set Up Cloudflare R2

1. Create an R2 bucket in Cloudflare dashboard
2. Generate API tokens with read/write permissions
3. Update R2 environment variables in `keystone/.env`

### 6. Start Development Servers

Start **Keystone first**, then Next.js, so GraphQL and admin assets are available when the app proxies to them.

#### Terminal 1: Keystone Backend

```bash
cd keystone
npm run dev
```

- **GraphQL (direct, for smoke tests / tools)**: `http://localhost:3001/api/graphql`
- **Keystone Admin (super-admin, canonical)**: **`http://localhost:3001/admin`** — unauthenticated visits redirect via Next **`/api/auth/keystone-sso`** using a better-auth session + JWT cookie flow. Sign in with better-auth first (`/sign-in`), then open admin. See [crm_docs/APPENDIX_AUTH_SETUP.md](./crm_docs/APPENDIX_AUTH_SETUP.md).
- **`http://localhost:3000/admin`**: Proxies to Keystone; **super-admins** need a valid better-auth session + role in Keystone.

If you change Keystone’s port in `keystone/.env` (`PORT=…`), set **`PUBLIC_ADMIN_URL`** in **`.env`** (and **`keystone/.env`**) to the same origin, or rely on the default `http://localhost:<PORT>` when **`PUBLIC_ADMIN_URL`** is unset.

**Smoke tests** (with Keystone running):

```bash
curl -sS -X POST http://localhost:3001/api/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ __typename }"}'
```

Expect HTTP **200** and JSON `data`.

#### Terminal 2: Next.js Frontend

```bash
npm run dev
```

Frontend: `http://localhost:3000`

Full proxy architecture and troubleshooting: [crm_docs/ADMIN_PROXY.md](./crm_docs/ADMIN_PROXY.md).

## Features

- ✅ KeystoneJS backend with PostgreSQL
- ✅ better-auth (email/password, optional Google; JWT + JWKS for Keystone)
- ✅ Multi-tenant foundation (User and Consultant entities)
- ✅ Docker Compose for local development
- ✅ GraphQL API endpoint
- ✅ React Query client setup
- ✅ Next.js App Router structure

## Deployment

Full stack (Postgres, Redis, Keystone, Next.js) with Docker: copy **`.env.example`** → **`.env`** and **`keystone/.env.example`** → **`keystone/.env`**, fill secrets, then follow [**DEPLOY.md**](./DEPLOY.md).

### Backend (Railway)

1. Push code to GitHub
2. Create Railway project
3. Add PostgreSQL service
4. Deploy from GitHub:
   - Root directory: `keystone`
   - Build command: `npm install && npm run build`
   - Start command: `npm run start`
5. Set environment variables in Railway dashboard

### Frontend (Vercel)

1. Push code to GitHub
2. Connect repository to Vercel
3. Root directory: `.` (project root)
4. Framework: Next.js
5. Set environment variables in Vercel dashboard

## Testing Checklist

- [ ] Docker Compose starts successfully
- [ ] Keystone dev server runs on port 3001
- [ ] Keystone admin UI accessible
- [ ] GraphQL endpoint responds
- [ ] Next.js dev server runs on port 3000
- [ ] Sign-up page loads (`/sign-up`)
- [ ] User can sign up (better-auth creates Keystone `User` via hook)
- [ ] Protected routes require authentication

## Documentation

See `crm_docs/` for detailed documentation:

- [crm_docs/INDEX.md](./crm_docs/INDEX.md) — documentation map
- [crm_docs/REQUIREMENTS_MASTER.md](./crm_docs/REQUIREMENTS_MASTER.md) — product requirements
- [crm_docs/PHASE_1_FOUNDATION.md](./crm_docs/PHASE_1_FOUNDATION.md) — Phase 1 setup
- [crm_docs/PHASE_2_SCHEMA.md](./crm_docs/PHASE_2_SCHEMA.md) — schema & access control
- [crm_docs/APPENDIX_AUTH_SETUP.md](./crm_docs/APPENDIX_AUTH_SETUP.md) — better-auth + Keystone

## Next Steps

After Phase 1 completion, proceed to **Phase 2: Core Schema & Data Model**:

- Implement all 13 core entities
- Complete multi-tenancy with tenant filtering
- Comprehensive access control rules
- GraphQL API with caching
- Seed data for testing

## Support

For questions or issues, please refer to the documentation in `crm_docs/` or create an issue in the repository.
