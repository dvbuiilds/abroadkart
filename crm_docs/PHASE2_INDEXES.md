# Phase 2: Database Indexes

Keystone/Prisma auto-creates indexes for:

- **Unique fields**: `User.clerkUserId`, `User.email`, `Consultant.slug`, `University.slug`
- **Relationship foreign keys**: `tenantId`, `studentId`, `actorId`, etc. (single-column indexes)
- **Scalar `isIndexed: true`**: e.g. `Student.email`

Generated `schema.prisma` includes `@@index([tenantId])` (and similar) where applicable.

## Optional composite indexes (add via migration if needed)

For high volume, consider adding:

```sql
-- ActivityLog: lookups by entity
CREATE INDEX idx_activity_entity ON "ActivityLog"(entity_type, entity_id);
CREATE INDEX idx_activity_date ON "ActivityLog"(created_at);

-- Student: filter by stage
CREATE INDEX idx_student_stage ON "Student"(current_stage);

-- Application / LoanApplication: filter by status
CREATE INDEX idx_application_status ON "Application"(status);
CREATE INDEX idx_loan_status ON "LoanApplication"(status);
```

To add after Phase 2: create an empty migration and add the SQL above, then run `prisma migrate deploy`.
