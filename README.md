# AbroadKart CRM Platform

Multi-tenant CRM platform for study abroad consultants built with Next.js, KeystoneJS, PostgreSQL, and Clerk authentication.

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
- **Clerk** - Authentication and user management

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
- Clerk account (for authentication)
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

### 2. Start Docker Services

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Verify services are running
docker-compose ps
```

PostgreSQL: `localhost:5432`
- User: `postgres`
- Password: `password`
- Database: `abroadkart`

Redis: `localhost:6379`

### 3. Configure Environment Variables

#### Backend (keystone/.env)

Copy `keystone/.env.example` to `keystone/.env` and fill in:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/abroadkart
REDIS_URL=redis://localhost:6379
SESSION_SECRET=generate-a-random-32-char-string
CLERK_SECRET_KEY=sk_test_...
CLERK_JWKS_URL=https://your-clerk-instance.clerk.accounts.dev/.well-known/jwks.json
CLERK_JWT_ISSUER=https://your-clerk-instance.clerk.accounts.dev
CLERK_JWT_AUDIENCE=abroadkart-api
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=abroadkart-docs
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
FRONTEND_URL=http://localhost:3000
# Same pk as Next.js — required for Clerk browser session on Keystone (native admin).
CLERK_PUBLISHABLE_KEY=pk_test_...
# Optional; default is http://localhost:<PORT>
# KEYSTONE_PUBLIC_URL=http://localhost:3001
```

#### Frontend (.env.local)

Copy `.env.local.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_KEYSTONE_URL=http://localhost:3001
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
```

`NEXT_PUBLIC_KEYSTONE_URL` must be the **Keystone** origin (default `http://localhost:3001`). It must **not** be `http://localhost:3000` (that creates a self-proxy loop and breaks `/api/graphql`).

### 4. Set Up Clerk

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Enable Email/Password and Google OAuth sign-in methods
3. Configure redirect URLs:
   - Local: `http://localhost:3000/*` and **`http://localhost:3001/*`** (Keystone native admin + `redirect_url` back from sign-in)
   - Production: `https://your-domain.com/*` and your **Keystone** public URL pattern if split from the web app
4. Create a JWT template named `abroadkart-keystone` with these claims:
   ```json
   {
     "sub": "{{user.id}}",
     "email": "{{user.primary_email_address}}",
     "role": "{{user.public_metadata.role}}",
     "tenant_id": "{{user.organization_memberships.organization.id}}",
     "tenant_name": "{{user.organization_memberships.organization.name}}"
   }
   ```
5. Set up webhook endpoint: `http://localhost:3000/api/webhooks/clerk` (use ngrok for local testing)

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
- **Keystone Admin (super-admin, canonical)**: **`http://localhost:3001/admin`** — Clerk **browser session** on the Keystone origin (set **`CLERK_PUBLISHABLE_KEY`** in `keystone/.env`). Unauthenticated HTML visits redirect to **`http://localhost:3000/sign-in?redirect_url=…`**; after sign-in, use the stable native dev server (HMR on **3001**). Details: [REQUIREMENTS_SUPER_ADMIN_KEYSTONE_NATIVE.md](./crm_docs/REQUIREMENTS_SUPER_ADMIN_KEYSTONE_NATIVE.md).
- **`http://localhost:3000/admin`**: Still used for **Clerk sign-in / access checks** for non–super-admin messaging; **super-admins** are **redirected** to **`{NEXT_PUBLIC_KEYSTONE_URL}/admin`**. Static asset requests under `/admin/_next` may still proxy for signed-in users who hit old URLs.

If you change Keystone’s port in `keystone/.env` (`PORT=…`), set **`NEXT_PUBLIC_KEYSTONE_URL`** in `.env.local` to the same origin.

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

## Phase 1 Features

- ✅ KeystoneJS backend with PostgreSQL
- ✅ Clerk authentication integration
- ✅ Multi-tenant foundation (User and Consultant entities)
- ✅ Docker Compose for local development
- ✅ GraphQL API endpoint
- ✅ React Query client setup
- ✅ Next.js App Router structure
- ✅ Clerk webhook handler

## Deployment

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
- [ ] Clerk sign-up page loads
- [ ] User can sign up via Clerk
- [ ] Clerk webhook creates User in Keystone
- [ ] Protected routes require authentication

## Documentation

See `crm_docs/` for detailed documentation:
- `MASTER_REQUIREMENTS.md` - Overall architecture
- `PHASE_1_FOUNDATION.md` - Phase 1 setup guide
- `PHASE_2_SCHEMA.md` - Database schema (upcoming)
- `APPENDIX_CLERK_SETUP.md` - Clerk integration details

## Next Steps

After Phase 1 completion, proceed to **Phase 2: Core Schema & Data Model**:
- Implement all 13 core entities
- Complete multi-tenancy with tenant filtering
- Comprehensive access control rules
- GraphQL API with caching
- Seed data for testing

## Support

For questions or issues, please refer to the documentation in `crm_docs/` or create an issue in the repository.