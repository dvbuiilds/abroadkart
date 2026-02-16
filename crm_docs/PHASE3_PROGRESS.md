# Phase 3: Consultant Portal – Progress & Knowledge Transfer

Implementation summary, patterns, and known limits for the Consultant Portal (Next.js App Router, React Query, Keystone GraphQL).

**Status**: Complete (Verified)  
**Last Updated**: February 2026

---

## 1. Architecture Overview

- **Routes**: All consultant UI under `src/app/consultant/`: dashboard, students (list + `[id]`), applications (list + `[id]`), loans (list + `[id]`), documents, tasks.
- **Layout**: `src/app/consultant/layout.tsx` wraps with `RequireRole` (consultantAdmin, consultantAgent), ErrorBoundary, sidebar, and topbar.
- **Data**: GraphQL at `/api/graphql`; Keystone uses `take`/`skip` (not `first`/`last`). Multi-tenant filtering via session `tenantId`; list access uses `filterByTenant` on the backend.

---

## 2. Patterns

### 2.1 React Query + graphql-request

- **Client**: `useGraphQLClient()` from `src/hooks/useGraphQLClient` (reads Clerk token, sends to `/api/graphql`).
- **Query keys**: `['entity', filters]` for lists (e.g. `['students', { search, stage, page }]`), `['entity', id]` for single items.
- **Mutations**: Invalidate related keys (e.g. create student → invalidate `['students']`, create application → invalidate `['applications']` and `['students', …, id]`).

### 2.2 URL state for list filters and pagination

- List pages use `useSearchParams` + `useRouter` + `usePathname`.
- Helper `updateParams(updates)` replaces the query string via `router.replace(pathname + '?' + new URLSearchParams)`.
- Keeps filters and page in URL for shareable links and back/forward. Local filter state (e.g. search input) is synced from URL in a `useEffect` where needed (e.g. StudentFilters).

### 2.3 Dialog and sheet forms

- **Create**: Dialogs opened by `?new=1` or `?upload=1`, optionally `?studentId=...` to preselect and disable student field.
- **Edit**: Sheets (e.g. StudentEditSheet) open with partial entity; submit maps form IDs to GraphQL `connect: { id }` inputs.
- **Validation**: Zod schemas in `src/lib/validations/` (student, application, loan, task, document); form schemas use IDs; submit handlers map to Keystone create/update input shapes.

### 2.4 Auth and role guard

- **RequireRole**: Client component that uses `useCurrentUser` (Clerk `userId` → `GET_CURRENT_USER`). Renders children only for consultantAdmin/consultantAgent; otherwise redirect or message.
- **Note**: `superAdmin` role is not included in the default allowed roles. To grant superAdmin access to the Consultant Portal, add `'superAdmin'` to the `CONSULTANT_ROLES` array in `RequireRole.tsx`.
- **Middleware**: Protects `/consultant/*` with Clerk (signed-in check); role check is client-side in the layout.

---

## 3. Component Layout

| Area              | Location                                                                  | Notes                                                                    |
| ----------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Consultant layout | `src/app/consultant/layout.tsx`                                           | RequireRole, ErrorBoundary, sidebar, topbar                              |
| Sidebar / Topbar  | `src/components/consultant/ConsultantSidebar.tsx`, `ConsultantTopbar.tsx` | Nav links, user menu                                                     |
| Shared UI         | `src/components/shared/`                                                  | LoadingSpinner, EmptyState, ErrorBoundary, PageHeader                    |
| UI primitives     | `src/components/ui/`                                                      | badge, skeleton, table, tabs, dropdown-menu, etc.                        |
| Dashboard         | `src/components/consultant/dashboard/`                                    | KPICards, RecentActivity, TaskSummary, PipelineChart                     |
| Students          | `src/components/consultant/students/`                                     | Filters, table, pagination, create dialog, edit sheet, detail tabs       |
| Applications      | `src/components/consultant/applications/`                                 | Filters, table, create dialog, detail                                    |
| Loans             | `src/components/consultant/loans/`                                        | Table, create dialog, detail (progress bar, read-only fulfilment fields) |
| Documents         | `src/components/consultant/documents/`                                    | Table, upload dialog (see Known limits)                                  |
| Tasks             | `src/components/consultant/tasks/`                                        | Filters, table, create dialog, inline status Select                      |

---

## 4. GraphQL and Hooks

- **Types and operations**: `src/graphql/types.ts`, `queries/`, `mutations/`.
- **Dashboard pipeline**: Separate count variables per stage (e.g. `whereLead`, `whereProspect`); no variable spread in the pipeline query.
- **Hooks**: `useStudents`, `useApplications`, `useLoans`, `useDocuments`, `useTasks`, `useDashboard`, `useCurrentUser`, `useReference` (e.g. programs). All use `useGraphQLClient()` and consistent query keys.

---

## 5. Known Limits and Deferred Work

### 5.1 Document file upload

- **Backend**: `createStudentDocument` requires a `file` (FileFieldInput / upload). Keystone file field is tied to R2 (or S3).
- **Portal**: Document list and upload dialog exist; the dialog does **not** send a file. Submit is disabled with "Upload (coming soon)" and a note to use Keystone Admin for file uploads.
- **To implement later**: Either multipart GraphQL (e.g. `apollo-upload-client` or equivalent) and pass `file` into `createStudentDocument`, or a Next.js API route that accepts `multipart/form-data`, uploads to R2, then creates the StudentDocument with the file reference.

### 5.2 Task assignedTo

- Create task form does not include an assigned-to picker (optional enhancement via tenant users query and dropdown).

### 5.3 Soft deletes

- Backend uses `isDeleted`; list UIs do not yet expose a "show deleted" filter. Default behaviour is to exclude deleted where applicable in backend filters.

---

## 6. Testing Checklist

- [x] **Auth**: Sign in as consultant; confirm redirect to dashboard; sign out; confirm /consultant requires sign-in.
- [x] **Role**: Access with non-consultant role; confirm access denied or redirect. Note: `superAdmin` was initially blocked — needs to be added to `CONSULTANT_ROLES` in `RequireRole.tsx` for admin access.
- [x] **Dashboard**: KPIs, recent activity, task summary, pipeline chart load without error.
- [x] **Students**: List with search/stage/page; create student; open detail; edit in sheet; tabs (Overview, Applications, Loans, Documents, Tasks).
- [x] **Applications**: List with status filter; create (student + program); open detail; status badges/steps.
- [x] **Loans**: List; create (student, optional application); detail with progress bar and read-only fulfilment fields.
- [x] **Documents**: List loads; upload dialog opens and shows "coming soon" (no file upload).
- [x] **Tasks**: List with status/priority filters; create task; inline status change (todo / inProgress / done / blocked).
- [ ] **Multi-tenant**: With two tenants, confirm each consultant sees only their tenant's data (backend filterByTenant). _(Deferred — requires two tenant setup.)_
- [x] **Loading / error / empty**: Each list and detail shows loading state; error boundary catches errors; empty states show where applicable.
- [x] **Lint/build**: `yarn build` and `yarn lint` pass.

**Verified by**: User (Feb 2026)

---

## 7. Dependencies Added in Phase 3

- `date-fns` – date formatting in tables and dashboard.
- `@radix-ui/react-tabs`, `@radix-ui/react-dropdown-menu` – used by consultant UI (tabs, dropdowns).
- React Query and graphql-request were already in use; no Recharts dependency (pipeline uses a simple bar representation).

---

## 8. Quick Reference

| Need                       | Location                              |
| -------------------------- | ------------------------------------- |
| GraphQL types & operations | `src/graphql/`                        |
| React Query hooks          | `src/hooks/`                          |
| Form validation            | `src/lib/validations/`                |
| Consultant routes          | `src/app/consultant/`                 |
| Role guard                 | `src/components/auth/RequireRole.tsx` |
| Path alias                 | `@app/*` → `./src/*`                  |

---

**Next**: Phase 4 (Fulfilment Portal) or follow-up work (document upload, task assignee picker, soft-delete filter in UI).
