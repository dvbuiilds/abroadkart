# Phase 2: Core Schema & Data Model

**Status**: ✅ Done  
**Duration**: Weeks 3-4  
**Goal**: Implement complete data model with multi-tenancy, access control, and GraphQL API  
**Previous Doc**: [Phase 1: Foundation](./PHASE_1_FOUNDATION.md)  
**Next Doc**: [Phase 3: Consultant Portal](./PHASE_3_CONSULTANT_PORTAL.md)  
**Related**: [Database Schema Appendix](./APPENDIX_DATABASE_SCHEMA.md), [GraphQL API Appendix](./APPENDIX_GRAPHQL_API.md)

---

## Table of Contents

1. [Overview](#overview)
2. [Core Principles](#core-principles)
3. [Schema Design](#schema-design)
4. [Access Control Rules](#access-control-rules)
5. [Database Entities](#database-entities)
6. [Hooks & Auto-Assignment](#hooks--auto-assignment)
7. [Caching Strategy](#caching-strategy)
8. [GraphQL API Generation](#graphql-api-generation)
9. [Seed Data](#seed-data)
10. [Testing Phase 2](#testing-phase-2)
11. [Deliverables Checklist](#deliverables-checklist)

---

## Overview

Phase 2 transforms basic Keystone setup into a full multi-tenant CRM by:
- Implementing all core Lists: Student, Application, Loan, Accommodation, etc.
- Adding multi-tenant filtering via `tenant_id` on all business entities
- Defining role-based access control (consultant vs fulfilment vs superAdmin)
- Setting up Redis caching for GraphQL queries
- Creating seed data for testing

---

## Core Principles

### Multi-Tenancy Pattern

- **Pattern**: Shared database, shared schema
- **Implementation**: Every multi-tenant entity has `tenant` relationship to `Consultant`
- **Filtering**: KeystoneJS access rules auto-filter queries by `tenant_id`
- **Why**: Simplest to build, best for reporting, scales to thousands of tenants

### Access Control Hierarchy

```
┌─────────────────────────────────────┐
│          superAdmin                  │
│  (Full system access, all tenants)  │
└─────────────────────────────────────┘
                │
    ┌───────────┴───────────┐
    ▼                       ▼
fulfilment          consultantAdmin
(Cross-tenant       (Own tenant only)
access to loans,        │
accommodations)     ┌───┴────┐
                    ▼        ▼
            consultantAgent   
            (Own tenant,      
             limited fields)  
```

### Caching Strategy (Phase 2)

- **Redis Configuration**:
  - graphql-redis-cache for full query caching
  - Resolver-level cache for expensive aggregations
  - Cache TTLs vary by entity (1-60 minutes)

- **Invalidation**:
  - Keystone hooks invalidate on mutations
  - Pattern-based invalidation: `students:tenant:{id}`

---

## Schema Design

### User Roles

```typescript
export const UserRole = {
  SUPER_ADMIN: 'superAdmin',
  FULFILMENT: 'fulfilment',
  CONSULTANT_ADMIN: 'consultantAdmin',
  CONSULTANT_AGENT: 'consultantAgent',
};

export const isConsultantRole = (role: string) =>
  ['consultantAdmin', 'consultantAgent'].includes(role);

export const isFulfilmentRole = (role: string) =>
  ['fulfilment', 'superAdmin'].includes(role);
```

### Tenant Assignment Rules

| Operation | Role | Can Assign Tenant? | Result |
|-----------|------|-------------------|--------|
| Create Student | consultantAgent | No | Auto-assigned from session |
| Create Student | fulfilment | Yes | Can choose any tenant |
| Create Student | superAdmin | Yes | Can choose any tenant |
| Update Student | consultantAgent | No | Tenant immutable |
| Query Students | consultantAgent | - | Filtered to own tenant |
| Query Students | fulfilment | - | See all tenants |

---

## Database Entities

### Core Lists to Implement

1. **User** (updated from Phase 1)
2. **Consultant**
3. **Student**
4. **StudentDocument**
5. **University**
6. **Program**
7. **Application**
8. **LoanApplication**
9. **AccommodationBooking**
10. **Reimbursement**
11. **PrepaidCard**
12. **Task**
13. **ActivityLog**

Full schema details in [Database Schema Appendix](./APPENDIX_DATABASE_SCHEMA.md)

---

## Access Control Rules

### Rule Functions

**access/rules.ts**:
```typescript
export const isAuthenticated = ({ session }: { session: any }) => {
  return !!session;
};

export const isSuperAdmin = ({ session }: { session: any }) => {
  return session?.data?.role === 'superAdmin';
};

export const isFulfilment = ({ session }: { session: any }) => {
  return ['fulfilment', 'superAdmin'].includes(session?.data?.role);
};

export const isConsultant = ({ session }: { session: any }) => {
  return ['consultantAdmin', 'consultantAgent'].includes(session?.data?.role);
};

export const filterByTenant = ({ session }: { session: any }) => {
  if (isFulfilment({ session })) return true; // No filter
  
  if (!session?.data?.tenant?.id) {
    return false; // No tenant access
  }
  
  return {
    tenant: { id: { equals: session.data.tenant.id } }
  };
};

export const canUpdateLoanStatus = ({ session, item }: any) => {
  // Only fulfilment can change status
  return isFulfilment({ session });
};

export const canReadFulfilmentRemarks = ({ session, item }: any) => {
  // Fulfilment always; consultants only own tenant
  if (isFulfilment({ session })) return true;
  return item.tenant.id === session?.data?.tenant?.id;
};
```

### Student Access Example

```typescript
export const Student = list({
  access: {
    operation: {
      query: isAuthenticated,
      create: isConsultant,
      update: isAuthenticated,
      delete: () => false, // Soft deletes only
    },
    filter: {
      query: filterByTenant,
      update: filterByTenant,
    },
  },
  
  hooks: {
    resolveInput: ({ operation, resolvedData, context }) => {
      if (operation === 'create' && !resolvedData.tenant && context.session?.data?.tenant) {
        resolvedData.tenant = { connect: { id: context.session.data.tenant.id } };
      }
      return resolvedData;
    },
  },
  
  fields: {
    tenant: relationship({ ref: 'Consultant.students' }),
    fullName: text({ validation: { isRequired: true } }),
    email: text({ validation: { isRequired: true } }),
    // ... other fields
  },
});
```

### LoanApplication Access Example

```typescript
export const LoanApplication = list({
  access: {
    operation: {
      query: isAuthenticated,
      create: isConsultant,
      update: isAuthenticated,
      delete: () => false,
    },
    filter: {
      query: filterByTenant,
      update: isAuthenticated,
    },
  },
  
  fields: {
    tenant: relationship({ ref: 'Consultant.loanApplications' }),
    student: relationship({ ref: 'Student.loanApplications' }),
    
    status: select({
      options: [
        { label: 'Initiated', value: 'initiated' },
        { label: 'Documents Pending', value: 'documentsPending' },
        { label: 'Under Review', value: 'underReview' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Disbursed', value: 'disbursed' },
      ],
      access: {
        update: ({ session }) => isFulfilment({ session }),
      },
    }),
    
    consultantRemarks: text({
      access: {
        update: ({ session }) => isConsultant({ session }),
      },
    }),
    
    fulfilmentRemarks: text({
      access: {
        read: isAuthenticated,
        update: ({ session }) => isFulfilment({ session }),
      },
    }),
    
    assignedFulfilmentExec: relationship({
      ref: 'User',
      access: {
        update: ({ session }) => isFulfilment({ session }),
      },
    }),
    
    // ... other fields
  },
});
```

---

## Hooks & Auto-Assignment

### Auto-Set Tenant Hook

**hooks/autoSetTenant.ts**:
```typescript
export function autoSetTenantHook(operation: 'create' | 'update') {
  return ({ resolvedData, context }: any) => {
    if (operation === 'create' && !resolvedData.tenant && context.session?.data?.tenant) {
      resolvedData.tenant = { connect: { id: context.session.data.tenant.id } };
    }
    return resolvedData;
  };
}
```

### Activity Logging Hook

**hooks/logActivity.ts**:
```typescript
export const logActivityHook = {
  afterOperation: async ({ operation, item, context, listKey }: any) => {
    if (!['create', 'update'].includes(operation)) return;
    if (!context.session) return; // Skip for sudo/system operations

    await context.sudo().query.ActivityLog.createOne({
      data: {
        tenant: item.tenantId 
          ? { connect: { id: item.tenantId } } 
          : null,
        actor: { connect: { id: context.session.data.id } },
        entityType: listKey,
        entityId: item.id,
        action: `${operation}d`,
        metadata: JSON.stringify({
          timestamp: new Date(),
          actor: context.session.data.email,
        }),
      },
    });
  },
};
```

---

## Caching Strategy

### Redis Setup

**lib/redis.ts**:
```typescript
import { Redis } from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export async function getCached<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  const data = await fetchFn();
  await redis.set(key, JSON.stringify(data), 'EX', ttl);
  return data;
}

export async function invalidatePattern(pattern: string) {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
```

### GraphQL Cache Integration

**keystone.ts**:
```typescript
import { GraphQLRedisCache } from 'graphql-redis-cache';
import { redis } from './lib/redis';

const cache = new GraphQLRedisCache({
  redisClient: redis,
  ttl: 300, // 5 minutes default
  defaultKeySerializer: (query, variables, context) => {
    const tenantId = context.session?.data?.tenant?.id || 'global';
    const role = context.session?.data?.role;
    return `gql:${tenantId}:${role}:${query}:${JSON.stringify(variables)}`;
  },
});

export default config({
  // ... other config
  graphql: {
    apolloConfig: {
      plugins: [cache.plugin()],
    },
  },
});
```

### Cache Invalidation on Mutations

```typescript
export const Student = list({
  // ... access, fields
  
  hooks: {
    afterOperation: async ({ operation, item, context }) => {
      if (['create', 'update', 'delete'].includes(operation)) {
        await invalidatePattern(`gql:${item.tenantId}:*:*students*`);
        await redis.del(`student:${item.id}`);
      }
    },
  },
});

export const LoanApplication = list({
  // ... access, fields
  
  hooks: {
    afterOperation: async ({ operation, item, context }) => {
      if (['create', 'update', 'delete'].includes(operation)) {
        await invalidatePattern(`gql:${item.tenantId}:*:*loans*`);
        await redis.del(`loan:${item.id}`);
        await redis.del(`stats:loans:${item.tenantId}`);
      }
    },
  },
});
```

---

## GraphQL API Generation

### Auto-Generated Queries

KeystoneJS automatically generates:
- `students` → list of all students (filtered by access rules)
- `student(where: { id: "..." })` → single student
- `loanApplications` → list of loans
- `loanApplication(where: { id: "..." })` → single loan

### Example Queries

**Get all students (consultant sees own, fulfilment sees all)**:
```graphql
query GetStudents {
  students(orderBy: { createdAt: desc }) {
    id
    fullName
    email
    currentStage
    applications { status program { name } }
  }
}
```

**Get all loans in pending status**:
```graphql
query GetPendingLoans {
  loanApplications(where: { status: { equals: "initiated" } }) {
    id
    student { fullName email }
    loanAmountRequested
    status
  }
}
```

**Approve loan (fulfilment only)**:
```graphql
mutation ApproveLoan($id: ID!) {
  updateLoanApplication(
    where: { id: $id }
    data: { 
      status: "approved"
      fulfilmentRemarks: "Approved by bank XYZ"
      approvedAt: "2026-01-20T10:00:00Z"
    }
  ) {
    id
    status
    approvedAt
  }
}
```

See [GraphQL API Appendix](./APPENDIX_GRAPHQL_API.md) for complete API reference.

---

## Seed Data

**seeds/seed.ts**:
```typescript
import { keystoneContext } from '../context';

export async function seed() {
  const context = keystoneContext;

  // Create consultants
  const consultantA = await context.sudo().query.Consultant.createOne({
    data: {
      name: 'ABC Consultants',
      slug: 'abc-consultants',
      contactEmail: 'admin@abc.com',
      status: 'active',
    },
  });

  const consultantB = await context.sudo().query.Consultant.createOne({
    data: {
      name: 'XYZ Education',
      slug: 'xyz-education',
      contactEmail: 'admin@xyz.com',
      status: 'active',
    },
  });

  // Create users
  await context.sudo().query.User.createOne({
    data: {
      clerkUserId: 'clerk_user_1',
      email: 'agent@abc.com',
      name: 'Agent A',
      role: 'consultantAgent',
      tenant: { connect: { id: consultantA.id } },
      isActive: true,
    },
  });

  // Create students
  await context.sudo().query.Student.createOne({
    data: {
      tenant: { connect: { id: consultantA.id } },
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      countryOfResidence: 'IN',
      currentStage: 'lead',
    },
  });

  console.log('Seed data created');
}
```

Run seed:
```bash
cd keystone
npm run seed
```

---

## Testing Phase 2

### GraphQL Testing

Use Keystone GraphQL Playground (http://localhost:3001/api/graphql):

1. **Test consultant query filtering**:
   - Log in as consultant agent
   - Query students → should only see own tenant
   
2. **Test fulfilment cross-tenant access**:
   - Log in as fulfilment
   - Query loanApplications → should see all tenants

3. **Test field-level access**:
   - Query `fulfilmentRemarks` as consultant → should return null
   - Query as fulfilment → should see value

4. **Test mutations**:
   - Consultant creates student → auto-set tenant
   - Fulfilment approves loan → status updates

### Access Control Tests

```typescript
// keystone/__tests__/access.test.ts
import { setupTestRunner } from '@keystone-6/core/testing';
import config from '../keystone';

const runner = setupTestRunner({ config });

test('Consultant can only query own students', async () => {
  const session = {
    data: {
      id: '1',
      role: 'consultantAgent',
      tenant: { id: 'tenant-a', name: 'ABC' },
    },
  };
  
  const { context } = await runner({ context: { session } });
  const students = await context.query.Student.findMany();
  
  expect(students.every(s => s.tenantId === 'tenant-a')).toBe(true);
});

test('Fulfilment can query all loans', async () => {
  const session = {
    data: { id: '1', role: 'fulfilment', tenant: null },
  };
  
  const { context } = await runner({ context: { session } });
  const loans = await context.query.LoanApplication.findMany();
  
  // Should see loans from all tenants
  expect(loans.length > 0).toBe(true);
});
```

---

## Deliverables Checklist

- [ ] All 13 core Lists implemented with full fields
- [ ] Access control rules defined for all Lists
- [ ] Multi-tenant filtering working (verified in GraphQL Playground)
- [ ] Hooks for auto-tenant-assignment and activity logging
- [ ] Redis caching configured and working
- [ ] Cache invalidation on mutations working
- [ ] Seed data script created and tested
- [ ] GraphQL schema complete and documented
- [ ] Access control tests passing
- [ ] Database indexes created for performance
- [ ] Documentation updated in [Database Schema Appendix](./APPENDIX_DATABASE_SCHEMA.md)

---

## Next Steps

Once Phase 2 is complete, proceed to:  
**[Phase 3: Consultant Portal](./PHASE_3_CONSULTANT_PORTAL.md)**

This phase will implement the Next.js consultant-facing UI using ShadCN components and TanStack React Query.

---

**Questions or Issues?** Open a GitHub issue or email [your-email@abroadkart.com]
