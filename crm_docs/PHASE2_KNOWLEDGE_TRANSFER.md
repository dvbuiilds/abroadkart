# Phase 2: Knowledge Transfer

Why specific algorithms, logic, libraries, and patterns were chosen; benefits and risks.

---

## 1. KeystoneJS (v8.x)

**Why**: Generates GraphQL API and Prisma schema from declarative list definitions. Reduces CRUD and access-control boilerplate.

**Benefits**:
- Declarative access control becomes SQL-level filters (no N+1).
- Single `filterByTenant` drives multi-tenant isolation.
- Admin UI and GraphQL schema stay in sync with schema.

**Risks**: Tight coupling to Prisma; schema changes need migrations. Custom resolvers require `extendGraphqlSchema`.

---

## 2. ioredis (v5.3)

**Why**: Redis client with reconnection, cluster/sentinel support, and good TypeScript support. Already used in Phase 1.

**Benefits**: `getCached` / `invalidatePattern` for query caching and mutation invalidation. Reconnection and error handling built in.

**Risks**: `redis.keys(pattern)` in `invalidatePattern` is O(N). For very large key sets, switch to SCAN-based iteration.

---

## 3. Shared-database multi-tenancy (tenant_id)

**Why**: One schema, one DB; isolation via `WHERE tenant_id = X` in access filters.

**Benefits**: Single DB to operate; easy cross-tenant reporting for fulfilment; scales to many tenants.

**Risks**: A bug in access control could leak data. Mitigations: central `filterByTenant`, access tests, and Keystone’s declarative filters.

---

## 4. Factory for hooks: `autoSetTenantHook('create')`

**Why**: Many lists need “set tenant from session on create” with the same behaviour.

**Benefits**: One implementation reused everywhere; changes in one place.

**Risks / Gotcha (fixed Feb 2026)**:
The factory takes a `targetOp` parameter, but the inner function **must** destructure Keystone's runtime `operation` from the hook args and compare against `targetOp`. An earlier version compared the static factory parameter against the string `"create"`, which was always true and caused the hook to run on both create and update. The fix:

```typescript
export function autoSetTenantHook(targetOp: "create" | "update") {
  return ({ resolvedData, context, operation }: ResolveInputArgs) => {
    //                                ^^^^^^^^^ runtime value from Keystone
    if (operation === targetOp && !resolvedData.tenant && tenantId) { ... }
  };
}
```

**Rule**: Always use the runtime `operation` from Keystone's hook args, never rely solely on a closure parameter for operation filtering.

---

## 5. Cloudflare R2 (S3-compatible) for file storage

**Why**: Keystone’s `file` field supports S3; R2 has zero egress and fits document-heavy CRM.

**Benefits**: Pre-signed URLs (e.g. 3600s); separate configs (student_documents, receipts, university_logos) for organisation.

**Risks**: Slightly higher latency than some S3 regions; acceptable for documents.

---

## 6. Soft deletes (isDeleted + delete: () => false)

**Why**: CRM and audit needs require keeping history; hard deletes are disabled.

**Benefits**: Recovery, audit trail, and compliance.

**Risks**: All list queries should exclude `isDeleted: true` where relevant (e.g. in Phase 3 UI filters).

---

## 7. ActivityLog as system-only list

**Why**: `create/update/delete: () => false`; only `logActivityHook` (via `context.sudo()`) creates entries.

**Benefits**: Users cannot create or alter audit records.

**Risks**: If the hook throws, the parent mutation still commits (afterOperation). Consider try/catch and logging.

**Gotcha (fixed Feb 2026) — `afterOperationWithCache` vs `cacheInvalidationAfterOperation`**:
The hooks module exports two functions:
- `cacheInvalidationAfterOperation(key)` — **only** invalidates Redis cache.
- `afterOperationWithCache(key)` — logs to `ActivityLog` **and** invalidates cache.

All tenant-scoped entities must use `afterOperationWithCache` to maintain a consistent audit trail. An earlier bug had `PrepaidCard` using `cacheInvalidationAfterOperation`, which silently omitted prepaid card operations from the activity log.

**Rule**: Every tenant-scoped entity (Student, Application, LoanApplication, AccommodationBooking, Reimbursement, Task, StudentDocument, PrepaidCard) must use `afterOperationWithCache` in its `hooks.afterOperation`. Only use `cacheInvalidationAfterOperation` when activity logging is explicitly not wanted (e.g. for internal/system-only lists).

---

## 8. UUID primary keys

**Why**: `idField: { kind: 'uuid' }` in Keystone config.

**Benefits**: No sequential ID leakage; safe in URLs; globally unique across tables.

**Risks**: Slightly larger and ~10% slower index performance than integers; acceptable at current scale.

---

## 9. Access rules: `filterByTenant` return shape

**Why**: Keystone turns filter return values into Prisma `where`; `{ tenant: { id: { equals: tenantId } } }` becomes a single WHERE clause.

**Benefits**: DB does filtering; no N+1; consistent pattern for all tenant-scoped lists.

**Risks**: Session must always carry `tenantId` for consultants; better-auth JWT → Keystone session shape must match (`authUserId` lookup).

---

## 10. StudentDocument filter via student.tenant

**Why**: StudentDocument has no direct `tenant` field; visibility is by student’s tenant.

**Benefits**: No denormalised tenant on documents; single source of truth (student → tenant).

**Risks**: Filter is `{ student: { tenant: { id: { equals } } } }`; slightly more complex than a direct tenant filter.

**Gotcha (fixed Feb 2026) — missing `filter.delete`**:
An earlier version defined `filter.query` and `filter.update` but omitted `filter.delete`. Because `operation.delete` was set to `isAuthenticated`, any authenticated user could delete documents belonging to other tenants — a multi-tenant isolation breach.

**Rule**: When a list allows delete (`operation.delete` is not `() => false`), it **must** also define `filter.delete` with the same tenant-scoping filter as `filter.query` and `filter.update`. This applies to any entity, but is especially easy to miss on entities like StudentDocument that use an indirect tenant path (`student.tenant`). The fix extracts a shared `filterDocByTenant` helper used by all three filter hooks.

---

## 11. Conventions & Checklist for New Entities

When adding a new tenant-scoped Keystone list, verify all of the following:

1. **`afterOperation` uses `afterOperationWithCache`** (not `cacheInvalidationAfterOperation`) so that mutations are logged to `ActivityLog`.
2. **`resolveInput` uses `autoSetTenantHook("create")`** and the hook destructures `operation` from Keystone's runtime args (not just the factory closure).
3. **Every allowed operation has a matching `filter`**: if `operation.delete` is not `() => false`, then `filter.delete` must be defined with the same tenant-scoping as `filter.query` and `filter.update`.
4. **Indirect tenant paths** (e.g. `student.tenant` instead of `tenant`) must be mirrored in all three filter hooks — extract a shared helper function to avoid drift.
