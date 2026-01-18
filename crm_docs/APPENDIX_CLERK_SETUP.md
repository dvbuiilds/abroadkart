Appendix D: Clerk Authentication & Access Control Setup
Related: Master Requirements | Phase 1: Foundation | Phase 2: Core Schema

1. Overview
This appendix describes how Clerk is used as the single source of identity for:

Consultant Portal (Next.js)

Fulfilment Portal (Next.js)

Keystone GraphQL API (authorization, tenancy, and roles)

Clerk provides sign-in, sign-up, sessions, organizations (tenants), and JWTs consumed by Keystone for access control.

2. Clerk Project & Environment
2.1 Clerk Application
Create a Clerk application, enable email/password and any required OAuth providers, and configure redirect URLs:

Local: http://localhost:3000/*, http://localhost:4000/*

Production: https://consultant.abroadkart.com/*, https://fulfilment.abroadkart.com/*

2.2 Environment Variables
Shared (frontend + Keystone):

Bash

CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_TEMPLATE=abroadkart-keystone
CLERK_BASE_URL=https://api.clerk.com
Frontend only:

Bash

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$CLERK_PUBLISHABLE_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
Keystone only:

Bash

CLERK_JWKS_URL=https://clerk.<your-instance>.com/.well-known/jwks.json
CLERK_JWT_ISSUER=https://clerk.<your-instance>.com
CLERK_JWT_AUDIENCE=abroadkart-api
3. JWT Template for Keystone
Keystone expects a Clerk-signed JWT containing:

sub → Clerk user ID

email → primary email

role → app role (superAdmin, fulfilment, consultantAdmin, consultantAgent)

tenant_id → consultant/organization ID

tenant_name → consultant/organization name

Example JWT template (Clerk Dashboard → JWT Templates):

JSON

{
  "sub": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "role": "{{user.public_metadata.role}}",
  "tenant_id": "{{user.organization_memberships.organization.id}}",
  "tenant_name": "{{user.organization_memberships.organization.name}}"
}
4. Next.js Integration (Consultant & Fulfilment)
Assumes Next.js 14+ App Router and @clerk/nextjs SDK.

4.1 Install
Bash

npm install @clerk/nextjs
4.2 Root Layout
src/app/layout.tsx:

TypeScript

import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
4.3 Route Protection
src/middleware.ts:

TypeScript

import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: ['/', '/health'],
  ignoredRoutes: ['/api/webhooks(.*)'],
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
4.4 Usage in Components
TypeScript

'use client';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs';

export function TopBar() {
  const { user } = useUser();
  return (
    <header className="flex justify-between items-center px-4 py-2 border-b">
      <span className="font-semibold">Abroad Kart</span>
      <div className="flex items-center gap-3">
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <span className="text-sm text-muted-foreground">
            {user?.primaryEmailAddress?.emailAddress}
          </span>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}
5. Keystone Integration
5.1 Session Extraction from JWT
Install jose:

Bash

npm install jose
keystone/auth/clerkSession.ts:

TypeScript

import { jwtVerify } from 'jose';

const ISSUER = process.env.CLERK_JWT_ISSUER!;
const AUDIENCE = process.env.CLERK_JWT_AUDIENCE!;

async function getKey() {
  const res = await fetch(process.env.CLERK_JWKS_URL!);
  const jwks = await res.json();
  const [key] = jwks.keys;
  const pem = `-----BEGIN CERTIFICATE-----\n${key.x5c[0]}\n-----END CERTIFICATE-----`;
  return await crypto.subtle.importKey(
    'spki',
    Buffer.from(pem.replace(/-----(BEGIN|END) CERTIFICATE-----/g, ''), 'base64'),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );
}

export async function getSessionFromAuthHeader(auth?: string) {
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice('Bearer '.length);
  try {
    const key = await getKey();
    const { payload } = await jwtVerify(token, key, { issuer: ISSUER, audience: AUDIENCE });
    return {
      data: {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        tenant: payload.tenant_id
          ? { id: payload.tenant_id, name: payload.tenant_name }
          : null,
      },
    };
  } catch (e) {
    console.error('JWT verification failed', e);
    return null;
  }
}
5.2 Wiring into Keystone Context
keystone.ts (conceptual):

TypeScript

import { config } from '@keystone-6/core';
import { lists } from './schema';
import { getSessionFromAuthHeader } from './auth/clerkSession';

export default config({
  db: { provider: 'postgresql', url: process.env.DATABASE_URL! },
  lists,
  server: {
    extendExpressApp: (app, createContext) => {
      app.use(async (req: any, _res, next) => {
        const auth = req.headers.authorization as string | undefined;
        req.keystoneSession = await getSessionFromAuthHeader(auth);
        next();
      });
    },
  },
  context: {
    createContext: ({ req, context }) => {
      const session = (req as any).keystoneSession ?? null;
      return { ...context, session };
    },
  },
});
6. Role & Tenant Mapping
6.1 Role Storage in Clerk
Store role in public_metadata.role on Clerk user. Assign this during onboarding (Super Admin only). Example:

JSON

{
  "public_metadata": {
    "role": "consultantAgent"
  }
}
6.2 Tenant Mapping
Use Clerk Organizations to represent Consultant tenants.

Map organization ID to Consultant.id in Keystone.

tenant_id claim in JWT holds organization/consultant ID.

7. Syncing Users to Keystone
On first API hit, ensure a corresponding User record exists.

TypeScript

export async function ensureKeystoneUser(context: any, session: any) {
  if (!session?.data?.id) return null;
  const existing = await context.sudo().query.User.findOne({
    where: { clerkUserId: session.data.id },
    query: 'id',
  });
  if (existing) return existing;
  return context.sudo().query.User.createOne({
    data: {
      clerkUserId: session.data.id,
      email: session.data.email,
      role: session.data.role,
      tenant: session.data.tenant?.id
        ? { connect: { id: session.data.tenant.id } }
        : undefined,
      isActive: true,
    },
  });
}
Call this from a Keystone hook on first authenticated operation.

8. Frontend Role Guards
Example role-guard wrapper:

TypeScript

'use client';
import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export function RequireRole({
  allowed,
  children,
}: {
  allowed: string[];
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  if (!isLoaded) return null;
  const role = user?.publicMetadata?.role as string | undefined;
  if (!role || !allowed.includes(role)) {
    redirect('/unauthorized');
  }
  return <>{children}</>;
}
Usage:

TypeScript

export default function FulfilmentDashboardPage() {
  return (
    <RequireRole allowed={['fulfilment', 'superAdmin']}>
      <FulfilmentDashboard />
    </RequireRole>
  );
}
9. Security Notes
Validate Clerk JWT server-side for every Keystone request.

Never trust role or tenant_id from the client without verification.

Restrict editing of public_metadata.role to Super Admin flows.

Short-lived JWTs: Rely on Clerk for session refresh.

Logging: Log auth errors and failed verifications for audit purposes.