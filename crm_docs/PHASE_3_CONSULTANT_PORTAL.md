## `PHASE_3_CONSULTANT_PORTAL.md`

```md
# Phase 3: Consultant Portal (Next.js UI)

**Duration**: Weeks 5–7  
**Previous**: [Phase 2: Core Schema](./PHASE_2_SCHEMA.md)  
**Next**: [Phase 4: Fulfilment Portal](./PHASE_4_FULFILMENT_PORTAL.md)  
**Related**: [ShadCN Components](./APPENDIX_SHADCN.md), [GraphQL API](./APPENDIX_GRAPHQL_API.md)

---

## 1. Goals

Implement a production-ready Consultant Portal for:

- Consultant Admins
- Consultant Agents

Key outcomes:

- Manage students, applications, loans, documents, tasks.
- Provide actionable dashboards per consultant tenant.
- Respect role-based access and multi-tenancy constraints.

---

## 2. High-Level Screens

1. **Login & Onboarding**
   - Clerk-hosted or custom sign-in/sign-up.
   - Post-login role and tenant resolution.

2. **Dashboard**
   - KPIs: Total students, applications, loans in process, conversion rate.
   - Recent activity (students created, loans initiated).
   - Task list for today / this week.

3. **Students**
   - Student list (table with filters, search, pagination).
   - Student detail with tabs:
     - Overview
     - Applications
     - Loans
     - Documents
     - Tasks / Notes

4. **Applications**
   - List of university applications per consultant.
   - Detail view with university, program, status timeline.

5. **Loans**
   - List of loan applications (consultant’s tenant only).
   - Initiate new loan for a student.
   - Track loan status, EMI info (read-only).

6. **Documents**
   - Student documents list.
   - Upload flows for required document types.

7. **Tasks**
   - Tasks assigned to logged-in user.
   - Create task linked to a student.

---

## 3. Tech Stack & Integration

- **Framework**: Next.js App Router
- **Auth**: `@clerk/nextjs`
- **UI**: ShadCN + Tailwind CSS
- **Data**: Apollo Client (GraphQL) or React Query + GraphQL adapter
- **State**: Local component state + server cache

API endpoint:

- `NEXT_PUBLIC_API_URL = https://api.abroadkart.com/graphql` (prod)
- `http://localhost:3001/api/graphql` (dev)

---

## 4. Routes & Navigation

Top-level App Router structure (example):

```text
/app
  /layout.tsx               (ClerkProvider, base shell)
  /consultant
    /layout.tsx             (Sidebar + TopBar)
    /dashboard/page.tsx
    /students/page.tsx
    /students/[id]/page.tsx
    /applications/page.tsx
    /applications/[id]/page.tsx
    /loans/page.tsx
    /loans/[id]/page.tsx
    /documents/page.tsx
    /tasks/page.tsx
Use role guard:

Restrict /consultant/* to roles: consultantAdmin, consultantAgent.

5. ShadCN Components per Screen
5.1 Dashboard
Card – KPI cards.

Table – Recent students / loans.

Badge – Status indicators.

Tabs – Switch between overview/analytics.

Chart (via Recharts) – Funnel or trend chart.

5.2 Student List
Table – Data grid with columns: name, email, country, stage, createdAt.

Input – Search by name/email.

Select – Filter by stage.

DropdownMenu – Row actions (view, edit, archive).

Pagination – Page controls.

5.3 Student Detail
Breadcrumb – “Students / John Doe”.

Tabs – Overview / Applications / Loans / Documents / Tasks.

Card – Personal info, education, test scores.

Badge – Current stage.

Button – Primary actions (Create application, Create loan).

5.4 Forms
Form, Input, Select, Textarea, Checkbox, RadioGroup.

Dialog – Create/Edit student.

Sheet – Slide-over edit panels for secondary details.

Validation via react-hook-form + zod.

See APPENDIX_SHADCN.md for detailed examples.

6. GraphQL Operations (Consultant Portal)
6.1 Queries
students with filters:

where: { currentStage, fullName_contains, createdAt_gte }

Automatically tenant-filtered via Keystone access rules.

student(id) with nested:

applications, loanApplications, documents, tasks.

applications, loanApplications for dashboards.

6.2 Mutations
createStudent, updateStudent.

createApplication, updateApplication (status changes limited).

createLoanApplication (consultant side fields only).

createStudentDocument (upload handle from storage integration).

createTask, updateTask.

Access rules (from Phase 2) ensure:

Consultants can only access their own tenant data.

Field-level restrictions (e.g., cannot update fulfilment-only fields).

7. UX Requirements
Fast navigation (< 300ms perceived where possible via client caching).

Clear loading states (ShadCN Skeleton).

Inline error feedback (ShadCN Alert or FormMessage).

Mobile-friendly layouts for key flows (student view, tasks).

Keyboard accessibility:

Tab navigation across actionable components.

Dialogs focus-trap and Esc to close.

8. Analytics & Events
Front-end events (for future analytics):

student_created, student_updated.

application_created, loan_initiated.

document_uploaded.

task_completed.

Log at least to console during Phase 3, with future integration to an analytics platform.

9. Acceptance Criteria
Consultant Agent can:

Create a student, application, and loan for that student.

Upload documents and see them linked.

View only data for own tenant.

Consultant Admin can:

See all tenant students, applications, loans.

View team-level metrics on dashboard.

All key operations:

Are guarded by Clerk auth + role checks.

Respect Keystone access rules.

Have appropriate loading & error states in the UI.