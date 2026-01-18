# Phase 1: Foundation & Infrastructure

**Duration**: Weeks 1-2  
**Goal**: Set up project structure, database, Clerk auth, Cloudflare R2, and basic deployment  
**Previous Doc**: [Master Requirements](./MASTER_REQUIREMENTS.md)  
**Next Doc**: [Phase 2: Core Schema](./PHASE_2_SCHEMA.md)

---

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Database Setup](#database-setup)
4. [Clerk Authentication Setup](#clerk-authentication-setup)
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
- Integrating Clerk for authentication
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
│   │   ├── clerkAuth.ts              # Clerk JWT validation & session
│   │   ├── redis.ts                  # Redis caching client
│   │   └── utils.ts                  # Helper functions
│   ├── keystone.ts                   # Main config
│   ├── .env.example
│   └── package.json
│
├── app/                               # Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx            # Root layout with Clerk provider
│   │   │   ├── page.tsx              # Landing page
│   │   │   ├── sign-in/page.tsx      # Clerk sign-in page
│   │   │   ├── sign-up/page.tsx      # Clerk sign-up page
│   │   │   ├── app/                  # Consultant routes (protected)
│   │   │   │   ├── layout.tsx
│   │   │   │   └── dashboard/page.tsx
│   │   │   └── admin/                # Admin routes (protected)
│   │   │       ├── layout.tsx
│   │   │       └── dashboard/page.tsx
│   │   ├── components/
│   │   │   ├── Providers.tsx         # Clerk + React Query providers
│   │   │   └── ShadCN/               # Component copies from shadcn/ui
│   │   ├── lib/
│   │   │   ├── graphql.ts            # GraphQL client
│   │   │   ├── react-query.ts        # React Query setup
│   │   │   └── utils.ts
│   │   └── styles/globals.css
│   ├── middleware.ts                 # Clerk middleware
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
version: '3.8'

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

## Clerk Authentication Setup

### 1. Create Clerk Project

1. Go to https://clerk.com
2. Sign up / log in
3. Create new application
4. Choose sign-in methods:
   - Email & Password
   - Google OAuth (recommended)
5. Copy API keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (public, expose in frontend)
   - `CLERK_SECRET_KEY` (private, backend only)

### 2. Configure Clerk Settings

**In Clerk Dashboard**:
- **Allowed Origins**: Add `localhost:3000`, `app.abroadkart.com` (prod)
- **Redirect URLs**: Add `/app/dashboard` (consultant), `/admin/dashboard` (admin)
- **Email Domain**: Use default or custom domain
- **User Metadata**: Add custom fields (optional, Phase 2)

### 3. Backend: Keystone Session with Clerk

**keystone/lib/clerkAuth.ts**:
```typescript
import { statelessSessions } from '@keystone-6/core/session';
import { verifyToken } from '@clerk/clerk-sdk-node';

export const clerkSession = statelessSessions({
  secret: process.env.SESSION_SECRET!,
  
  async get({ req, createContext }) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return;
    
    try {
      // Verify Clerk JWT
      const clerkPayload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });
      
      if (!clerkPayload.sub) return;
      
      // Look up User in Keystone by clerkUserId
      const context = await createContext();
      const user = await context.sudo().query.User.findOne({
        where: { clerkUserId: clerkPayload.sub },
        query: `
          id
          email
          name
          role
          tenant { id slug name }
          isActive
        `,
      });
      
      if (!user || !user.isActive) return;
      
      return {
        itemId: user.id,
        listKey: 'User',
        data: user,
      };
    } catch (err) {
      console.error('Clerk token verification failed:', err);
      return;
    }
  },
});
```

**keystone.ts**:
```typescript
import { config } from '@keystone-6/core';
import { clerkSession } from './lib/clerkAuth';

export default config({
  // ... other config
  session: clerkSession,
});
```

### 4. Frontend: Next.js Clerk Integration

**app/middleware.ts** (Clerk auth middleware):
```typescript
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Public routes (no auth required)
  publicRoutes: ["/", "/about", "/pricing", "/sign-in", "/sign-up"],
  // Routes to ignore
  ignoredRoutes: ["/api/webhooks/clerk"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

**app/layout.tsx** (Clerk provider wrapper):
```typescript
import { ClerkProvider } from "@clerk/nextjs";
import { ReactQueryProvider } from "@/lib/react-query";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <ReactQueryProvider>
            {children}
          </ReactQueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

**app/sign-in/page.tsx**:
```typescript
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn redirectUrl="/app/dashboard" />
    </div>
  );
}
```

### 5. Webhook: Sync Clerk Users to Keystone

**app/api/webhooks/clerk/route.ts**:
```typescript
import { Webhook } from 'svix';
import { keystoneContext } from '@/lib/keystone'; // Set up in Phase 1

export async function POST(req: Request) {
  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);

  // Verify webhook signature
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  const msg = wh.verify(payload, headers) as any;

  const { type, data } = msg;

  // Create User on signup
  if (type === 'user.created') {
    const primaryEmail = data.email_addresses.find((e: any) => e.primary)?.email_address;
    
    await keystoneContext.sudo().query.User.createOne({
      data: {
        clerkUserId: data.id,
        email: primaryEmail,
        name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
        role: 'consultantAgent', // Default role
        tenant: null, // Assigned later by admin
        isActive: true,
      },
    });
  }

  // Update User on profile change
  if (type === 'user.updated') {
    const primaryEmail = data.email_addresses.find((e: any) => e.primary)?.email_address;
    
    await keystoneContext.sudo().query.User.updateOne({
      where: { clerkUserId: data.id },
      data: {
        email: primaryEmail,
        name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
      },
    });
  }

  return Response.json({ ok: true });
}
```

---

## Keystone Configuration

### Minimal keystone.ts (Phase 1)

```typescript
import { config } from '@keystone-6/core';
import { withAuth } from '@keystone-6/auth';
import { lists } from './schema';
import { clerkSession } from './lib/clerkAuth';

export default withAuth(
  config({
    db: {
      provider: 'postgresql',
      url: process.env.DATABASE_URL!,
    },
    lists,
    session: clerkSession,
    ui: {
      isAccessAllowed: ({ session }) => !!session,
    },
    storage: {
      r2_storage: {
        kind: 's3',
        type: 'file',
        bucketName: process.env.R2_BUCKET_NAME!,
        region: 'auto',
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
  })
);
```

### Minimal schema/index.ts (Phase 1)

```typescript
import { list } from '@keystone-6/core';
import { text, relationship, checkbox, timestamp } from '@keystone-6/core/fields';

// User list (maps to Clerk)
export const User = list({
  access: {
    operation: {
      query: ({ session }) => !!session,
      create: () => false, // Created via Clerk webhook
      update: ({ session }) => !!session,
      delete: () => false,
    },
  },
  fields: {
    clerkUserId: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
    email: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
    name: text(),
    role: text(), // Will expand to enum in Phase 2
    isActive: checkbox({ defaultValue: true }),
    createdAt: timestamp({ defaultValue: { kind: 'now' } }),
  },
});

// Consultant list (minimal for Phase 1)
export const Consultant = list({
  access: {
    operation: {
      query: ({ session }) => !!session,
      create: ({ session }) => session?.data?.role === 'superAdmin',
      update: ({ session }) => !!session,
      delete: () => false,
    },
  },
  fields: {
    name: text({ validation: { isRequired: true } }),
    slug: text({ isIndexed: 'unique' }),
    contactEmail: text(),
    status: text(), // Will expand to enum in Phase 2
    createdAt: timestamp({ defaultValue: { kind: 'now' } }),
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
    })
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
npm install @clerk/nextjs graphql-request @tanstack/react-query @hookform/resolvers react-hook-form zod
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

**lib/graphql.ts**:
```typescript
import { GraphQLClient } from 'graphql-request';
import { useAuth } from '@clerk/nextjs';

export const useGraphQLClient = () => {
  const { getToken } = useAuth();
  
  return new GraphQLClient(
    process.env.NEXT_PUBLIC_KEYSTONE_URL + '/api/graphql',
    {
      headers: async () => {
        const token = await getToken();
        return {
          Authorization: token ? `Bearer ${token}` : '',
        };
      },
    }
  );
};
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
   CLERK_SECRET_KEY=...
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
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
   CLERK_SECRET_KEY=...
   ```

---

## Environment Variables

### Backend (.env in keystone/)

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/abroadkart

# Redis (for caching)
REDIS_URL=redis://localhost:6379

# Clerk Auth
CLERK_SECRET_KEY=sk_test_...
SESSION_SECRET=generate-32-char-random-string

# Cloudflare R2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret
R2_BUCKET_NAME=abroadkart-docs
R2_ENDPOINT=https://your-id.r2.cloudflarestorage.com

# Frontend
FRONTEND_URL=http://localhost:3000

# Clerk Webhook (optional, for later)
CLERK_WEBHOOK_SECRET=whsec_...
```

### Frontend (.env.local in app/)

```env
NEXT_PUBLIC_KEYSTONE_URL=http://localhost:3001
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/app/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/app/dashboard
```

---

## Testing Phase 1

### Local Development Checklist

- [ ] Docker Compose running (Postgres + Redis)
- [ ] Keystone starts: `cd keystone && npm run dev`
- [ ] Keystone admin UI accessible at `http://localhost:3001/api/admin`
- [ ] Next.js starts: `cd app && npm run dev`
- [ ] Frontend accessible at `http://localhost:3000`
- [ ] Clerk sign-in page loads
- [ ] User can sign up via Clerk
- [ ] User created in Keystone User table
- [ ] R2 bucket accessible via SDK

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

- [ ] Monorepo structure created
- [ ] Docker Compose file with Postgres + Redis
- [ ] Keystone initialized and configured
- [ ] Clerk project created and integrated
- [ ] Next.js app initialized with ShadCN
- [ ] Cloudflare R2 bucket created
- [ ] Environment variables documented
- [ ] Backend deployment to Railway configured
- [ ] Frontend deployment to Vercel configured
- [ ] Clerk webhook endpoint ready (optional)
- [ ] README with local setup instructions
- [ ] All tests passing

---

## Next Steps

Once Phase 1 is complete, proceed to:  
**[Phase 2: Core Schema & Data Model](./PHASE_2_SCHEMA.md)**

This phase will implement all core Lists (Student, Application, Loan, etc.) with multi-tenancy and access control rules.

---

**Questions or Issues?** Open a GitHub issue or email [your-email@abroadkart.com]
