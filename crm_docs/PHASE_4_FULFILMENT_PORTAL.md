## `PHASE_4_FULFILMENT_PORTAL.md`

```md
# Phase 4: Fulfilment Portal (Next.js UI)

**Duration**: Weeks 8–10  
**Previous**: [Phase 3: Consultant Portal](./PHASE_3_CONSULTANT_PORTAL.md)  
**Related**: [GraphQL API](./APPENDIX_GRAPHQL_API.md), [ShadCN Components](./APPENDIX_SHADCN.md)

---

## 1. Goals

Implement a dedicated Fulfilment Portal for users with roles:

- `fulfilment`
- `superAdmin` (with additional cross-tenant capabilities)

Key outcomes:

- Centralized view of all loan applications across all consultants.
- Document verification queue.
- Reimbursement and prepaid card management.
- High-level analytics and SLA monitoring.

---

## 2. High-Level Screens

1. **Fulfilment Dashboard**
   - KPIs: loans in review, approved, disbursed, average TAT.
   - Pending document verifications.
   - Reimbursement queue highlights.

2. **Loan Queue**
   - List of all loan applications (cross-tenant).
   - Filters by status, consultant, date, amount.
   - Bulk actions (e.g., assign fulfilment exec).

3. **Loan Detail**
   - Student summary.
   - Loan details: requested vs approved, interest rate, EMI.
   - Document list and verification states.
   - Fulfilment-only fields: remarks, internal notes.

4. **Document Verification**
   - Queue of documents with status `pending`.
   - Inline review and status update (verified/rejected).
   - Reason capture for rejections.

5. **Reimbursements**
   - List and detail view.
   - Approve/reject flow.
   - Export for finance if needed.

6. **Prepaid Cards**
   - Card issuance list.
   - Balance and status.
   - Block/unblock card actions.

7. **Analytics**
   - Loan approval rate by consultant.
   - Rejection reasons distribution.
   - TAT by stage.

---

## 3. Tech Stack & Routing

- Same stack as Consultant Portal (Next.js + ShadCN + Apollo Client).
- Auth via Clerk; routes restricted to `fulfilment` and `superAdmin`.

Suggested route structure:

```text
/app
  /fulfilment
    /layout.tsx           (Fulfilment shell)
    /dashboard/page.tsx
    /loans/page.tsx
    /loans/[id]/page.tsx
    /documents/page.tsx
    /reimbursements/page.tsx
    /cards/page.tsx
    /analytics/page.tsx
Use shared layout shell with:

Sidebar (Fulfilment-specific nav).

Top bar with user info and quick filters (e.g., consultant selection).

4. ShadCN Components per Screen
4.1 Fulfilment Dashboard
Card – KPI tiles.

Tabs – Switch between overview and SLA views.

Table – Top pending loans / documents.

Alert – Highlight overdue items.

BarChart / LineChart – Trends.

4.2 Loan Queue
Table – Loans list (columns: ID, student, consultant, status, amount, updatedAt).

Select – Status filter.

Input – Student/consultant search.

DropdownMenu – Row actions (view, assign).

Badge – Status and priority.

Accordion – Advanced filters.

4.3 Loan Detail
Breadcrumb – “Loans / LOAN-123”.

Card – Summary blocks (Student, Loan Terms, Consultant).

Tabs – Overview / Documents / Timeline.

Textarea – Fulfilment remarks.

Button – Approve / Reject / Disburse.

Dialog – Confirmation for state changes.

4.4 Document Queue
Table – Pending documents (student, type, uploadedAt, consultant).

Badge – Verification status.

Dialog / Sheet – Document preview & decision.

RadioGroup – Verified / Rejected.

Textarea – Rejection reason.

See APPENDIX_SHADCN.md for component-level examples.

5. GraphQL Operations (Fulfilment Portal)
5.1 Queries
loanApplications with:

Filters on status, tenant, createdAt, loanAmountRequested.

loanApplication(id):

Includes student, tenant, documents, reimbursements.

studentDocuments:

where: { verificationStatus: { equals: "pending" } }.

reimbursements and prepaidCards for lists.

No tenant filter is applied for fulfilment roles by Keystone access rules, enabling cross-tenant visibility.

5.2 Mutations
updateLoanApplication:

Change status from underReview → approved / rejected / disbursed.

Set loanAmountApproved, interestRate, emi, approvedAt, disburseDate.

Update fulfilmentRemarks.

updateStudentDocument:

Set verificationStatus and verificationRemarks.

updateReimbursement:

status: pending → approved/rejected/reimbursed.

createPrepaidCard / updatePrepaidCard:

Issue cards, update status (active/blocked/expired).

Access rules:

Only fulfilment and superAdmin can mutate these fulfilment-specific fields.

All changes logged in ActivityLog.

6. Workflows
6.1 Loan Approval Workflow (Fulfilment)
Fulfilment opens Loan Queue (default filter: underReview and documentsPending).

Selects a loan → Loan Detail.

Reviews:

Student profile summary.

Application info.

Uploaded documents.

If documents are incomplete:

Set status to documentsPending.

Add fulfilmentRemarks with requested docs.

If approved:

Set loanAmountApproved, interestRate, emi.

Set status to approved.

Once bank confirms disbursal:

Set status to disbursed.

Optionally create/update PrepaidCard record.

6.2 Document Verification Workflow
Fulfilment opens Document Queue.

Filters by document type (e.g., financialDocs).

Opens a document:

Preview via file viewer.

Cross-checks data.

Sets verificationStatus:

verified → downstream workflows continue.

rejected → add verificationRemarks, consultant notified.

7. UX & SLA Considerations
Emphasize speed and clarity:

Quick filters for status and consultant.

Clear color coding for stages and priorities.

SLA cues:

Highlight items breaching defined TAT (e.g., >48h under review).

Use Alert components on dashboard for overdue loans/documents.

Accessibility:

Same requirements as Consultant Portal:

Keyboard navigation

Screen-reader-friendly labels

High-contrast where possible

8. Analytics
Example metrics:

Approval rates per consultant, per month.

Average time:

From initiated → approved.

From approved → disbursed.

Rejection reasons distribution.

Document rejection rates by type.

These can be powered by aggregated GraphQL queries or materialized views in DB (later phases).

9. Acceptance Criteria
Fulfilment user can:

See all loans across all tenants.

Approve/reject/disburse loans according to rules.

Verify documents and record reasons.

Manage reimbursements and track statuses.

Super Admin can:

View same plus higher-level analytics.

Confirm cross-tenant filters and metrics.

All critical flows:

Respect access control and logging.

Provide clear UI feedback on success/failure.