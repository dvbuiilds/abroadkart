# Phase 1: Foundation & Infrastructure

**Duration**: Weeks 1-2  
**Goal**: Set up project structure, database, better-auth, Cloudflare R2, and basic deployment  
**Previous Doc**: [Master Requirements](./MASTER_REQUIREMENTS.md)  
**Next Doc**: [Phase 2: Core Schema](./PHASE_2_SCHEMA.md)

---

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Database Setup](#database-setup)
4. [better-auth setup](#better-auth-setup)
5. [Keystone Configuration](#keystone-configuration)
6. [Cloudflare R2 Setup](#cloudflare-r2-setup)
7. [Next.js Setup](#nextjs-setup)
8. [Deployment Configuration](#deployment-configuration)
9. [Environment Variables](#environment-variables)
10. [Testing Phase 1](#testing-phase-1)
11. [Deliverables Checklist](#deliverables-checklist)

---

## Overview

Phase 1 establishes the foundation for a multi-tenant CRM by:

- Creating a monorepo structure (Keystone backend + Next.js frontend)
- Setting up PostgreSQL locally and in production
- Integrating better-auth for authentication ([APPENDIX_AUTH_SETUP.md](./APPENDIX_AUTH_SETUP.md))
- Configuring Cloudflare R2 for storage
- Deploying both services to dev/staging environments

---

## Project Structure

```
abroadkart-crm/
├── keystone/                          # Backend CMS
│   ├── schema/
│   │   └── index.ts                  # List definitions (Phase 2)
│   ├── access/
│   │   ├── rules.ts                  # Reusable access functions
│   │   └── roles.ts                  # Role definitions
│   ├── hooks/
│   │   ├── autoSetTenant.ts          # Auto-assign tenant on create
│   │   └── logActivity.ts            # Activity logging hooks
│   ├── lib/
│   │   ├── betterAuthSession.ts      # better-auth JWT session (Keystone)
│   │   ├── redis.ts                  # Redis caching client
│   │   └── utils.ts                  # Helper functions
│   ├── keystone.ts                   # Main config
│   ├── .env.example
│   └── package.json
│
├── app/                               # Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx            # Root layout
│   │   │   ├── page.tsx              # Landing page
│   │   │   ├── sign-in/page.tsx      # better-auth sign-in
│   │   │   ├── sign-up/page.tsx      # better-auth sign-up
│   │   │   ├── app/                  # Consultant routes (protected)
│   │   │   │   ├── layout.tsx
│   │   │   │   └── dashboard/page.tsx
│   │   │   └── admin/                # Admin routes (protected)
│   │   │       ├── layout.tsx
│   │   │       └── dashboard/page.tsx
│   │   ├── components/
│   │   │   ├── Providers.tsx         # React Query providers
│   │   │   └── ShadCN/               # Component copies from shadcn/ui
│   │   ├── lib/
│   │   │   ├── graphql.ts            # GraphQL client
│   │   │   ├── react-query.ts        # React Query setup
│   │   │   └── utils.ts
│   │   └── styles/globals.css
│   ├── middleware.ts                 # better-auth session cookie gate
│   ├── .env.local
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── docker-compose.yml                 # Local Postgres + Redis
├── .gitignore
├── package.json                       # Workspace root
└── README.md
```

---

## Database Setup

### Local Development (Docker)

**docker-compose.yml**:

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: abroadkart
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - abroadkart

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - abroadkart

volumes:
  postgres_data:
  redis_data:

networks:
  abroadkart:
    driver: bridge
```

**Startup**:

```bash
docker-compose up -d
# Postgres: localhost:5432, user: postgres, password: password, db: abroadkart
# Redis: localhost:6379
```

### Production Database

**Railway Postgres Setup**:

1. Create Railway project
2. Add Postgres service
3. Get connection string: `postgresql://user:pass@host:5432/abroadkart`
4. Store in `.env` as `DATABASE_URL`

**Redis Setup (Railway or Upstash)**:

1. Add Redis service (Railway) or create Upstash account
2. Get connection string: `redis://host:port`
3. Store in `.env` as `REDIS_URL`

---

## better-auth setup

See **[APPENDIX_AUTH_SETUP.md](./APPENDIX_AUTH_SETUP.md)** for the full picture. Summary:

### 1. Packages (root `package.json`)

- `better-auth`, `kysely`, `pg`, `jose`, `@opentelemetry/api` (for CLI loading)

### 2. Next.js

- **`src/lib/auth.ts`** — `betterAuth()` with Postgres `auth` schema, `jwt` plugin, `databaseHooks.user.create.after` → `syncKeystoneUserFromAuthUser`, `databaseHooks.session.create.after` → update Keystone `User.lastLoginAt`.
- **`src/lib/auth-client.ts`** — `createAuthClient({ basePath: "/api/auth" })`.
- **`src/app/api/auth/[...all]/route.ts`** — better-auth handler.
- **`src/middleware.ts`** — `getSessionCookie` from `better-auth/cookies`; redirect to `/sign-in?callbackUrl=…`.
- **Sign-in / sign-up** — `/sign-in`, `/sign-up` with `SignInPageClient` / `SignUpPageClient`.

### 3. Keystone

- **`keystone/lib/betterAuthSession.ts`** — session from `Authorization: Bearer` or `ab_admin_session` cookie; JWT verified via JWKS.
- **`keystone/lib/verifyBetterAuthJwt.ts`** — `jose` + `BETTER_AUTH_JWKS_URL`.
- **User** list uses **`authUserId`** (unique).

### 4. User provisioning

On **sign-up**, better-auth creates `auth.user` and the **`user.create.after`** hook inserts the Keystone `User` row.

---

## Keystone Configuration

### Minimal keystone.ts (Phase 1)

```typescript
import { config } from "@keystone-6/core";
import { withAuth } from "@keystone-6/auth";
import { lists } from "./schema";
import { betterAuthSession } from "./lib/betterAuthSession";

export default withAuth(
  config({
    db: {
      provider: "postgresql",
      url: process.env.DATABASE_URL!,
    },
    lists,
    session: betterAuthSession,
    ui: {
      isAccessAllowed: ({ session }) => !!session,
    },
    storage: {
      r2_storage: {
        kind: "s3",
        type: "file",
        bucketName: process.env.R2_BUCKET_NAME!,
        region: "auto",
        endpoint: process.env.R2_ENDPOINT,
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
        signed: { expiry: 3600 },
      },
    },
    server: {
      cors: {
        origin: [process.env.FRONTEND_URL!],
      },
    },
  }),
);
```

### Minimal schema/index.ts (Phase 1)

```typescript
import { list } from "@keystone-6/core";
import {
  text,
  relationship,
  checkbox,
  timestamp,
} from "@keystone-6/core/fields";

// User list (authUserId links to better-auth user id)
export const User = list({
  access: {
    operation: {
      query: ({ session }) => !!session,
      create: () => false, // Created via better-auth hook on sign-up
      update: ({ session }) => !!session,
      delete: () => false,
    },
  },
  fields: {
    authUserId: text({ validation: { isRequired: true }, isIndexed: "unique" }),
    email: text({ validation: { isRequired: true }, isIndexed: "unique" }),
    name: text(),
    role: text(), // Will expand to enum in Phase 2
    isActive: checkbox({ defaultValue: true }),
    createdAt: timestamp({ defaultValue: { kind: "now" } }),
  },
});

// Consultant list (minimal for Phase 1)
export const Consultant = list({
  access: {
    operation: {
      query: ({ session }) => !!session,
      create: ({ session }) => session?.data?.role === "superAdmin",
      update: ({ session }) => !!session,
      delete: () => false,
    },
  },
  fields: {
    name: text({ validation: { isRequired: true } }),
    slug: text({ isIndexed: "unique" }),
    contactEmail: text(),
    status: text(), // Will expand to enum in Phase 2
    createdAt: timestamp({ defaultValue: { kind: "now" } }),
  },
});

export const lists = {
  User,
  Consultant,
};
```

---

## Cloudflare R2 Setup

### 1. Create R2 Bucket

1. Go to Cloudflare Dashboard
2. Navigate to R2 → Create bucket
3. Name: `abroadkart-docs`
4. Choose default region
5. Create

### 2. Generate API Token

1. In Cloudflare → R2 → Settings
2. Create API Token
3. Copy:
   - Account ID: `1234567890abcdef`
   - Access Key ID
   - Secret Access Key

### 3. Configure Environment Variables

```
R2_ACCOUNT_ID=1234567890abcdef
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=abroadkart-docs
R2_ENDPOINT=https://1234567890abcdef.r2.cloudflarestorage.com
```

### 4. Test Upload

```typescript
// lib/r2Client.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToR2(key: string, body: Buffer) {
  return s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: body,
    }),
  );
}
```

---

## Next.js Setup

### 1. Create Next.js App

```bash
npx create-next-app@latest app --typescript --tailwind --app --eslint
cd app
```

### 2. Install Dependencies

```bash
npm install better-auth graphql-request @tanstack/react-query @hookform/resolvers react-hook-form zod kysely pg jose
npm install -D @types/node typescript
```

### 3. Configure TailwindCSS & ShadCN

```bash
# Add shadcn/ui init
npx shadcn-ui@latest init
# Choose: TypeScript (yes), style (default), color (slate)

# Add initial components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add form
```

### 4. React Query Setup

**lib/react-query.tsx**:

```typescript
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### 5. GraphQL Client Setup

**lib/graphql-client.ts** (pattern — use app’s [`src/lib/graphql-client.ts`](../src/lib/graphql-client.ts)):

```typescript
import { GraphQLClient } from "graphql-request";
import { useMemo } from "react";
// useGraphQLClient() obtains Bearer JWT via GET /api/auth/token with session cookies
```

---

## Deployment Configuration

### Railway Deployment (Recommended for Phase 1)

#### Backend (KeystoneJS)

1. Push code to GitHub
2. Create Railway project
3. Add Postgres service
4. Deploy from GitHub:
   - **Root directory**: `keystone`
   - **Build command**: `npm run build`
   - **Start command**: `npm run start`
5. Set environment variables:
   ```
   DATABASE_URL=... (from Railway Postgres)
   REDIS_URL=... (from Redis service)
   SESSION_SECRET=random-string
   BETTER_AUTH_JWKS_URL=https://your-next-app/api/auth/jwks
   BETTER_AUTH_ISSUER=...
   BETTER_AUTH_AUDIENCE=...
   R2_*=...
   FRONTEND_URL=https://your-app.vercel.app
   ```

#### Frontend (Next.js)

1. Deploy to Vercel
2. Connect GitHub repository
3. **Root directory**: `app`
4. Set environment variables:
   ```
   NEXT_PUBLIC_KEYSTONE_URL=https://your-api.railway.app
   BETTER_AUTH_SECRET=...
   BETTER_AUTH_URL=https://your-next-app
   DATABASE_URL=... (same DB as Keystone for better-auth)
   ```

---

## Environment Variables

### Backend (.env in keystone/)

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/abroadkart

# Redis (for caching)
REDIS_URL=redis://localhost:6379

# better-auth JWT verification (Next must be reachable for JWKS in dev)
BETTER_AUTH_JWKS_URL=http://localhost:3000/api/auth/jwks
BETTER_AUTH_ISSUER=http://localhost:3000
BETTER_AUTH_AUDIENCE=http://localhost:3000
SESSION_SECRET=generate-32-char-random-string

# Cloudflare R2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret
R2_BUCKET_NAME=abroadkart-docs
R2_ENDPOINT=https://your-id.r2.cloudflarestorage.com

# Frontend
FRONTEND_URL=http://localhost:3000

```

### Frontend (.env.local in app/)

```env
NEXT_PUBLIC_KEYSTONE_URL=http://localhost:3001
DATABASE_URL=postgresql://... (same as Keystone)
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000
```

---

## Testing Phase 1

### Local Development Checklist

- [x] Docker Compose running (Postgres + Redis)
- [x] Keystone starts: `cd keystone && npm run dev`
- [x] Keystone admin UI accessible at `http://localhost:3001/admin`
- [x] Next.js starts: `yarn dev` (from project root)
- [x] Frontend accessible at `http://localhost:3000`
- [x] Sign-in page loads (`/sign-in`)
- [x] User can sign up via better-auth
- [x] User created in Keystone User table
- [x] R2 bucket accessible via SDK

### Test Commands

```bash
# Backend
cd keystone
npm install
npm run dev
# Keystone admin: http://localhost:3001/api/admin

# Frontend (new terminal)
cd app
npm install
npm run dev
# App: http://localhost:3000

# Test GraphQL
curl 'http://localhost:3001/api/graphql' \
  -H 'Content-Type: application/json' \
  -d '{ "query": "{ __typename }" }'
```

---

## Deliverables Checklist

- [x] Monorepo structure created
- [x] Docker Compose file with Postgres + Redis
- [x] Keystone initialized and configured
- [x] better-auth configured and integrated
- [x] Next.js app initialized with ShadCN
- [x] Cloudflare R2 bucket created
- [x] Environment variables documented
- [x] Backend deployment to Railway configured
- [x] Frontend deployment to Vercel configured
- [x] README with local setup instructions
- [x] All tests passing

---

## Next Steps

Once Phase 1 is complete, proceed to:  
**[Phase 2: Core Schema & Data Model](./PHASE_2_SCHEMA.md)**

This phase will implement all core Lists (Student, Application, Loan, etc.) with multi-tenancy and access control rules.

---

**Questions or Issues?** Open a GitHub issue or email [your-email@abroadkart.com]
