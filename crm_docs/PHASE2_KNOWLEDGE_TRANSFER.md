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

**Risks**: None significant.

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

---

## 8. UUID primary keys

**Why**: `idField: { kind: 'uuid' }` in Keystone config.

**Benefits**: No sequential ID leakage; safe in URLs; globally unique across tables.

**Risks**: Slightly larger and ~10% slower index performance than integers; acceptable at current scale.

---

## 9. Access rules: `filterByTenant` return shape

**Why**: Keystone turns filter return values into Prisma `where`; `{ tenant: { id: { equals: tenantId } } }` becomes a single WHERE clause.

**Benefits**: DB does filtering; no N+1; consistent pattern for all tenant-scoped lists.

**Risks**: Session must always carry `tenantId` for consultants; Clerk auth and session shape must match.

---

## 10. StudentDocument filter via student.tenant

**Why**: StudentDocument has no direct `tenant` field; visibility is by student’s tenant.

**Benefits**: No denormalised tenant on documents; single source of truth (student → tenant).

**Risks**: Filter is `{ student: { tenant: { id: { equals } } } }`; slightly more complex than a direct tenant filter.
