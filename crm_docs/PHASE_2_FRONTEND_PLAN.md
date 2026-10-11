# Phase 2: Frontend UI Alignment — Detailed Plan

**Status**: Planning  
**Scope**: Next.js frontend to consume Phase 1 schema changes  
**Target Branch**: `fb_crm_base`  

---

## Design Principles

Before diving into file-by-file changes, these principles guide every decision:

### 1. **Separation of Concerns**
- Each component has a single responsibility
- Form sections (Identity, Academic, Financial, etc.) are separate, composable components
- Data validation is isolated in Zod schemas
- Reusable field components for common UI patterns

### 2. **Type Safety First**
- Full TypeScript coverage with no `any` types
- Zod schema changes are the source of truth, not manual type updates
- Generated types from schema (via `z.infer<typeof schema>`)
- Breaking schema changes should cause build errors, not runtime surprises

### 3. **Consistency Over Novelty**
- Reuse existing UI patterns (Badge, Select, Dialog, Sheet patterns already in place)
- Follow existing `studentLabelMap` pattern for option rendering
- Maintain existing Hook patterns (`useStudents`, `useCreateStudent`, etc.)
- No new dependency patterns or styling frameworks

### 4. **Progressive Enhancement**
- Frontend form works with optional/nullable fields—don't force all new fields as required yet
- Phased field visibility: basic set (Phase 2a) → extended set (Phase 2b)
- Lazy-load tabs/sections if performance becomes a concern (premature optimization avoided for now)

### 5. **Accessibility by Default**
- All form fields have explicit labels linked to inputs
- Error messages are accessible and contextual
- Color is never the only indicator (e.g., priority badge needs icon + text, not just color)
- Proper ARIA labels on dynamic regions (tabs, lists)

### 6. **No Premature Abstraction**
- Three similar fields → keep as-is, don't extract yet
- Utility functions only when duplicated 3+ times and the pattern is stable
- Component props stay flat (no heavy object destructuring) to keep signatures readable
- Comments only for the "why," not the "what"

---

## File Organization — Current + Phase 2

### Current Structure (Phase 1 End State)
```
src/
├── lib/
│   ├── students/
│   │   └── options.ts              ← stage/country/budget options
│   └── validations/
│       └── student.ts              ← Zod schemas
├── components/consultant/
│   └── students/
│       ├── StudentCreateDialog.tsx
│       ├── StudentEditSheet.tsx
│       ├── StudentTable.tsx
│       ├── StudentFilters.tsx
│       ├── StudentOverview.tsx
│       ├── StudentApplicationsTab.tsx
│       ├── StudentDocumentsTab.tsx
│       ├── StudentLoansTab.tsx
│       ├── StudentTasksTab.tsx
│       └── StudentPagination.tsx
├── app/consultant/
│   └── students/
│       ├── page.tsx                ← list view
│       └── [id]/page.tsx            ← detail view
└── hooks/
    └── useStudents.ts              ← query/mutation hooks
```

### Phase 2 Additions
```
src/lib/
├── students/
│   ├── options.ts                  ← UPDATED: new enums (stage/priority/gender/source/etc)
│   └── helpers.ts                  ← NEW: formatTargetCountries, priorityVariant, etc.
├── validations/
│   ├── student.ts                  ← UPDATED: new fields in schema
│   └── interaction.ts              ← NEW: Interaction create/update schemas
└── payments/
    └── options.ts                  ← NEW: feeType, paymentStatus options
components/consultant/students/
├── StudentCreateDialog.tsx         ← UPDATED: sectioned form layout
├── StudentEditSheet.tsx            ← UPDATED: sectioned form layout
├── StudentTable.tsx                ← UPDATED: add priority/counsellor columns
├── StudentFilters.tsx              ← UPDATED: add priority/stage/counsellor filters
├── StudentOverview.tsx             ← UPDATED: display new fields in sections
├── StudentApplicationsTab.tsx      ← UPDATED: show offer/scholarship fields
├── StudentDocumentsTab.tsx         ← UPDATED: show due dates, new doc types
├── StudentLoansTab.tsx             ← (no changes)
├── StudentTasksTab.tsx             ← (no changes)
├── StudentPagination.tsx           ← (no changes)
│
├── form/                           ← NEW: sectioned form components
│   ├── StudentIdentitySection.tsx
│   ├── StudentAcademicSection.tsx
│   ├── StudentTestScoresSection.tsx
│   ├── StudentWorkExperienceSection.tsx
│   ├── StudentGoalsSection.tsx
│   ├── StudentFinancialSection.tsx
│   ├── StudentVisaSection.tsx
│   ├── StudentCrmStatusSection.tsx
│   └── useStudentFormState.ts      ← shared form state logic
│
├── StudentInteractionsTab.tsx      ← NEW: CRM touchpoint timeline
├── StudentPaymentsTab.tsx          ← NEW: payment history + create inline
│
└── interactions/
    ├── InteractionCreate.tsx       ← NEW: quick interaction log
    └── InteractionTimeline.tsx     ← NEW: timeline display
```

### New Payment Pages
```
src/components/consultant/payments/
├── PaymentList.tsx                ← NEW: list with tenant filter, search, date range
├── PaymentDetail.tsx              ← NEW: modal/sheet showing invoice, method, etc.
├── PaymentCreate.tsx              ← NEW: form to create payment
├── PaymentStatusBadge.tsx         ← NEW: visual status indicator
└── options.ts                     ← shared FeeType/PaymentStatus options

src/app/consultant/payments/
├── page.tsx                       ← NEW: payment list page
└── [id]/page.tsx                  ← NEW: payment detail page (optional, can be modal)
```

---

## Phase 2a: Foundation (Options, Validation, Helpers)

### Task 1: Update `src/lib/students/options.ts`

**Changes**:
- Replace 6-value `STAGE_OPTIONS` → 9-value (add: contacted, counsellingDone, docsCollection, offerReceived, visaFiled; drop: prospect, inLoanProcess, graduated)
- Replace `BUDGET_PER_YEAR_OPTIONS` → two new options: `BUDGET_TUITION_RANGES` (for a dropdown) or `null` if made into numeric free-entry
- Add `PRIORITY_OPTIONS`: Hot/Warm/Cold
- Add `GENDER_OPTIONS`: Male/Female/Other
- Add `SOURCE_OPTIONS`: Reddit/Instagram/Referral/Walk-in/Google/Facebook/LinkedIn/Other
- Add `STUDY_LEVEL_OPTIONS`: Undergraduate/Postgraduate/PhD/Diploma/Certificate
- Add `PREFERRED_INTAKE_OPTIONS`: January/May/September
- Add `FUNDING_TYPE_OPTIONS`: Self-funded/Education Loan/Scholarship/Parents
- Add `ACADEMIC_SCORE_TYPE_OPTIONS`: Percentage/CGPA
- Add `TARGET_COURSES_OPTIONS` (optional, or free-text if students type custom courses)
- **Deprecate** (keep for backward compat, don't remove yet): `BUDGET_PER_YEAR_OPTIONS`, `TARGET_COUNTRY_OPTIONS` (upgrade to plural targetCountries array)
- Add label maps for all new enums (standard pattern)

**Rationale**: Centralize option lists so they're single source of truth for both form rendering and data validation.

**File Size**: ~150 lines (vs current 96)

---

### Task 2: Create `src/lib/students/helpers.ts`

**Purpose**: Small utility functions to reduce clutter in components.

**Functions**:
```typescript
export function formatTargetCountries(countries: string[]): string
  // "AUS, UK, IRL" 

export function priorityVariant(priority: "hot" | "warm" | "cold"): BadgeVariant
  // maps to Badge color props

export function stageLabel(stage: string): string
  // stage → human label (uses label maps)

export function isStudentComplete(student: StudentDetail): boolean
  // check if all mandatory fields are filled (for "ready to apply" indicator)

export function calculateProfileStrength(student: StudentDetail): number
  // return 0–100% based on field completion
```

**Rationale**: Avoid inline logic in components, make functions testable.

---

### Task 3: Update `src/lib/validations/student.ts`

**Changes**:
- Add `targetCountries` (z.array(z.string())) — **breaking**: replaces `targetCountry` (single enum)
- Remove or deprecate `budgetPerYear` enum
- Add `budgetTuition`, `budgetLiving`, `budgetCurrency` (integers + string)
- Replace `openForScholarshipsLoans` → `loanPreApproved` (rename)
- Add full new section:
  ```typescript
  gender?: z.enum(['male', 'female', 'other']),
  city?: z.string(),
  state?: z.string(),
  source?: z.enum(['reddit', 'instagram', 'referral', 'walkIn', 'google', 'facebook', 'linkedin', 'other']),
  stream?: z.string(),
  subjects?: z.array(z.string()).optional(),
  academicScore?: z.number().optional(),
  academicScoreType?: z.enum(['percentage', 'cgpa']),
  backlogCount?: z.number().int().optional(),
  yearOfPassing?: z.number().int().optional(),
  institutionName?: z.string().optional(),
  duolingoScore?: optionalNullableNumber.optional(),
  testAppearingDate?: z.coerce.date().optional(),
  employer?: z.string().optional(),
  designation?: z.string().optional(),
  gapExplanation?: z.string().optional(),
  targetCourses?: z.array(z.string()).optional(),
  studyLevel?: z.enum(['undergraduate', 'postgraduate', 'phd', 'diploma', 'certificate']),
  preferredIntake?: z.enum(['january', 'may', 'september']),
  fundingType?: z.enum(['selfFunded', 'educationLoan', 'scholarship', 'parents']),
  priorVisaRefusals?: z.boolean().optional(),
  refusalCountries?: z.array(z.string()).optional(),
  refusalReason?: z.string().optional(),
  passportAvailable?: z.boolean().optional(),
  passportExpiry?: z.coerce.date().optional(),
  priority?: z.enum(['hot', 'warm', 'cold']).optional(),
  lostReason?: z.string().optional(),
  currentStage?: z.enum([9 new values]).optional().default('lead'),
  assignedCounsellor?: z.string().uuid().optional(),
  ```
- Keep existing test score fields (ielts, toefl, pte, gmat, gre, sat, act, final, parentMonthlyIncome, notes)
- Schema should allow ~80% of fields as optional so forms can be filled progressively
- Add `StudentDetailInput` type for the full student object (extends createSchema with more fields)

**Rationale**: Schema-first design; TypeScript derives from schema, not vice versa. Breaking changes surface as build errors, forcing deliberate UI fixes.

---

### Task 4: Create `src/lib/validations/interaction.ts`

```typescript
export const interactionCreateSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
  type: z.enum(['call', 'whatsapp', 'email', 'inPersonMeeting', 'reddit', 'walkIn', 'other']),
  direction: z.enum(['inbound', 'outbound']),
  notes: z.string().min(1, 'Note required'),
  nextAction: z.string().optional(),
  nextActionDate: z.coerce.date().optional(),
});

export type InteractionCreateInput = z.infer<typeof interactionCreateSchema>;
```

---

### Task 5: Create `src/lib/payments/options.ts`

```typescript
export const FEE_TYPE_OPTIONS = [
  { value: 'consultationFee', label: 'Consultation Fee' },
  { value: 'applicationFee', label: 'Application Fee' },
  { value: 'visaFilingFee', label: 'Visa Filing Fee' },
  { value: 'commission', label: 'Commission' },
  { value: 'misc', label: 'Miscellaneous' },
] as const;

export const PAYMENT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'partial', label: 'Partial' },
  { value: 'paid', label: 'Paid' },
] as const;

export const PAYMENT_METHOD_OPTIONS = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'bankTransfer', label: 'Bank Transfer' },
  { value: 'card', label: 'Card' },
] as const;

// label maps...
```

---

## Phase 2b: Form Components (Sectioned Form)

### Design Decision: Tabs vs Accordion vs Scroll Sections

**Choice**: Scroll sections with visual grouping.  
**Rationale**:
- Tabs = extra click overhead; users need to see all fields at once while filling
- Accordion = hides context; harder to reference related fields
- Sections = CSS dividers, user scrolls naturally, mobile-friendly

Form layout:
```
[Header: "Create Student" / "Edit {Name}"]
[Basic Info: Name, Email, Phone, Country (always visible above scroll)]

[Scrollable Content]
  ╔═ Identity ═════════════╗
  ║ Gender, City, State    ║
  ║ Source, ...            ║
  ╚════════════════════════╝
  
  ╔═ Academic ════════════╗
  ║ Stream, Subjects, ... ║
  ╚═══════════════════════╝
  
  ╔═ Study Goals ═════════╗
  ║ Target Countries[], ... ║
  ╚═══════════════════════╝
  
  ╔═ Financial ═══════════╗
  ║ Budget, Funding, ...  ║
  ╚═══════════════════════╝
  
  ╔═ Visa & Travel ═══════╗
  ║ Passport, Refusals... ║
  ╚═══════════════════════╝
  
  ╔═ CRM Status ══════════╗
  ║ Stage, Priority,      ║
  ║ Counsellor, ...       ║
  ╚═══════════════════════╝
  
  [Test Scores] (can collapse or scroll if needed)
  
  [Cancel] [Save] (sticky footer or fixed)
```

### Task 6: Create Section Components

**File**: `src/components/consultant/students/form/StudentIdentitySection.tsx`

```typescript
interface StudentIdentitySectionProps {
  form: UseFormReturn<StudentCreateInput>;  // react-hook-form
}

export function StudentIdentitySection({ form }: StudentIdentitySectionProps) {
  // Gender select
  // City text input
  // State text input
  // Source select
  // Uses FormField/FormControl/FormLabel from existing UI kit
}
```

**Pattern**: 
- Each section is a named export component
- Takes form object from `useForm` (passed from parent)
- Renders its own FormField wrappers
- No local state; all state is in parent form

**List of 8 section components to create**:
1. `StudentIdentitySection.tsx` — gender, city, state, source
2. `StudentAcademicSection.tsx` — stream, subjects, academicScore/Type, backlog, year, institution
3. `StudentTestScoresSection.tsx` — ielts, toefl, pte, gmat, gre, sat, act, duolingo, testAppearingDate, finalScore
4. `StudentWorkExperienceSection.tsx` — employer, designation, gapExplanation, workExperience (bucket)
5. `StudentGoalsSection.tsx` — targetCountries[], targetCourses[], studyLevel, preferredIntake, targetYear
6. `StudentFinancialSection.tsx` — budgetTuition, budgetLiving, budgetCurrency, fundingType, loanPreApproved, parentMonthlyIncome
7. `StudentVisaSection.tsx` — priorVisaRefusals, refusalCountries[], refusalReason, passportAvailable, passportExpiry
8. `StudentCrmStatusSection.tsx` — currentStage, priority, lostReason, assignedCounsellor (counsel user select)

**Each section is ~40–60 lines** (FormField + label + validation UI).

---

### Task 7: Update `StudentCreateDialog.tsx`

**Changes**:
- Wrap form in scrollable container with sections
- Move existing form fields into appropriate sections
- Remove inline field definitions; import section components
- Keep test data generation (updateTestData function)
- Structure:
  ```typescript
  <Form {...form}>
    <div className="space-y-6">
      <BasicInfoSection form={form} />  {/* name, email, phone, country */}
      <div className="space-y-4">
        <StudentIdentitySection form={form} />
        <StudentAcademicSection form={form} />
        {/* ... all 8 sections */}
      </div>
      <DialogFooter>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={form.handleSubmit(onSubmit)}>Create</Button>
      </DialogFooter>
    </div>
  </Form>
  ```

**File Size**: ~180 lines (vs current ~250, simpler due to extracted sections)

---

### Task 8: Update `StudentEditSheet.tsx`

**Same structure as CreateDialog** but:
- Load student data into form via `defaultValues` from GraphQL query
- Add a "Changed Fields" indicator (optional polish: show which fields have unsaved changes)
- Mutation: `useUpdateStudent` instead of `useCreateStudent`

---

## Phase 2c: List & Detail Views

### Task 9: Update `StudentTable.tsx`

**New columns to add**:
- **Priority** (after Stage) — Badge with color: Hot (red), Warm (yellow), Cold (grey)
- **Assigned Counsellor** (after Priority) — Show counsellor name or "Unassigned"
- **Target Countries** (optional, can replace existing Target Country column) — Show comma-separated or chip badges

**Changes**:
- Update `STAGE_VARIANTS` map to use new 9 stages (add colors for contacted/counsellingDone/offerReceived/visaFiled, keep applied/enrolled success colors)
- Add `PRIORITY_VARIANTS` map:
  ```typescript
  const PRIORITY_VARIANTS = {
    hot: 'destructive',
    warm: 'warning', 
    cold: 'secondary',
  };
  ```
- Render priority badge with icon (Flame for hot, Thermometer for warm, Snowflake for cold — use lucide-react)
- For counsellor column, show `assignedCounsellor?.name` or placeholder
- Consider: if target countries is an array, show as "AUS, UK" or chips

**Rationale**: Prioritized students are visible at a glance; counsellor assignment is now part of the CRM workflow.

---

### Task 10: Update `StudentFilters.tsx`

**New filters to add**:
- **Priority** (multi-select checkbox group) — Hot, Warm, Cold
- **Stage** (already exists, verify uses 9-value enum)
- **Assigned Counsellor** (select, populated from User list where role includes consultant)
- **Target Country** (multi-select, for students with targetCountries array) — keep or replace existing

**Implementation**:
- Use existing FilterItem/FilterGroup UI pattern if present, otherwise create simple Checkbox/Select groups
- Each filter updates URL params: `?priority=hot,warm&stage=applied&counsellor=user-123`
- Pass filters to GraphQL query for server-side filtering

---

### Task 11: Update `StudentOverview.tsx`

**Add new sections to student detail view**:
- **Identity Card** — gender, city, state, source (quick info)
- **Academic Background** — institution, stream, subjects, score/type, backlog, year passing
- **Target Goals** — targetCountries[], targetCourses[], studyLevel, preferredIntake, targetYear
- **Financial Profile** — budgetTuition, budgetLiving, budgetCurrency, fundingType, loanPreApproved
- **Visa Status** — passportAvailable, passportExpiry, priorVisaRefusals, refusalCountries[], refusalReason
- **CRM Status** — stage, priority, assignedCounsellor, lostReason (if stage=lost)

**Layout**: Sidebar-based or card grid (match existing pattern)

**Rationale**: Students info is now rich; detail view should expose the complete profile without requiring form edit.

---

### Task 12: Update `StudentApplicationsTab.tsx`

**Add new fields to Application display**:
- Show `offerReceived` status indicator
- If status = offerReceived/conditional/deferred, show:
  - Offer letter file link (download button)
  - Tuition fee offered (display as currency)
  - Scholarship awarded (display as currency)
  - Conditional requirements (if status = conditional, show as collapsible/expandable text)

**Rationale**: Application timeline is now enriched with financial/offer data; users need to see it in context.

---

### Task 13: Update `StudentDocumentsTab.tsx`

**Add new features**:
- Show new document types: lor, markSheet, ieltsScoreCard, visaForm, photo (in document list)
- Show `dueDate` for each document (if present) — format as "Due: Jan 15" or show as red/yellow badge if overdue/due-soon
- Update status enum rendering to show new values: received, uploadedToPortal (between pending and verified)
- Add "Due Soon" filter/indicator (show docs due within 7 days in different color)

**Rationale**: Document checklist is now driven by CRM milestones; users need due-date visibility.

---

## Phase 2d: New Tabs & Pages

### Task 14: Create `StudentInteractionsTab.tsx`

**Purpose**: CRM touchpoint timeline (separate from ActivityLog audit trail).

**UI**: 
- Timeline list grouped by date
- Each interaction shows:
  - Date/time
  - Type badge (Call/WhatsApp/Email/In-person/Reddit/Walk-in)
  - Direction badge (Inbound/Outbound) — maybe just color-code
  - Counsellor name
  - Notes (first 100 chars, expandable)
  - Next action + due date (if set)
  - Action menu: Edit, Delete (superAdmin only)
- Inline form at bottom to quickly log new interaction (collapse/expand)

**Layout**:
```
[Interactions Timeline]
  ↓ Jan 24, 2:30 PM — Call (Outbound)
    Ravi Kumar: Discussed visa requirements, follow-up needed
    Next: Get docs checklist → Due: Jan 30
    [Edit] [Delete]
  
  ↓ Jan 22, 10:00 AM — WhatsApp (Inbound)
    Auto-logged by system: Student asked about scholarship options
    [View Details]

[Quick Log Interaction]
  Type: [Call ▼] Direction: [Outbound ▼]
  Notes: [                              ]
  Next action: [                        ]
  Due date: [Jan 30 ▼]
  [Clear] [Log]
```

**Data Flow**:
- Query: `{ interactions(student: id) { type direction counsellor notes nextAction nextActionDate createdAt } }`
- Mutation: `createInteraction(studentId, type, direction, notes, nextAction, nextActionDate)`

**File Size**: ~200 lines

---

### Task 15: Create `StudentPaymentsTab.tsx`

**Purpose**: Show payment history for student + quick payment logging.

**UI**:
- Table/list of payments:
  - Date, Type (fee type), Amount, Currency, Status (badge: Pending/Partial/Paid), Method, Invoice link
- Summary bar: "Total owed: ₹50,000 | Paid: ₹20,000 | Outstanding: ₹30,000"
- Inline form to quickly create payment

**Layout**:
```
[Payment Summary]
  Total: ₹50,000 USD | Paid: ₹20,000 | Due: ₹30,000

[Payment History]
  Jan 20  Consultation Fee  ₹10,000 USD  Paid        UPI      [Invoice.pdf]
  Jan 15  Application Fee   ₹15,000 USD  Partial     Card     [Invoice.pdf]
  Jan 10  Visa Filing Fee   ₹25,000 USD  Pending     —        [—]

[Log Payment]
  Fee Type: [Consultation Fee ▼]
  Amount: [          ] Currency: [USD ▼]
  Status: [Paid ▼]
  Date: [Jan 20 ▼]
  Method: [UPI ▼]
  Invoice: [Upload file]
  [Clear] [Log Payment]
```

**File Size**: ~180 lines

---

### Task 16: Create Payment Pages (Optional for Phase 2)

If time permits, create dedicated payment management pages:

**`src/app/consultant/payments/page.tsx`**:
- Payment list for entire tenant
- Filters: Date range, Student, Fee type, Status
- Bulk actions: Export CSV, Mark as Paid
- Link to create new payment (+ student selector)

**`src/components/consultant/payments/PaymentList.tsx`**:
- Reusable payment table (used on main payments page and in student detail)
- Sortable columns (date, amount, status)
- Search by student name/email

**File Size**: ~150 lines each

---

## Phase 2e: Hooks & GraphQL

### Task 17: Update `hooks/useStudents.ts`

**Add/Update**:
- `useCreateStudent()` — already exists, verify it handles new fields (payload should include all new schema fields)
- `useUpdateStudent()` — already exists, same verification
- `useStudentDetail(id)` — verify it queries new fields (interact relationship, payments relationship, assignedCounsellor)
- Create `useInteractions(studentId)` — NEW: query interactions for a student
- Create `useCreateInteraction()` — NEW: mutation to log interaction
- Create `useUpdateInteraction()` — NEW: mutation to edit interaction
- Create `useDeleteInteraction()` — NEW: mutation to delete interaction (superAdmin only)
- Create `usePayments(studentId)` — NEW: query payments for a student
- Create `useCreatePayment()` — NEW: mutation to create payment
- Create `useUpdatePayment()` — NEW: mutation to update payment
- Create `useCounsellorList()` — NEW: query all User records with consultant roles (for assignment dropdown)

**Rationale**: Hooks are the GraphQL boundary; ensure all new queries/mutations are represented.

---

### Task 18: GraphQL Schema Verification

**Verify** (no changes needed if Keystone auto-generates correctly, but worth checking):
- `Student` type includes: targetCountries[], targetCourses[], gender, source, priority, assignedCounsellor, interactions, payments, etc.
- `Interaction` type exists with: id, type, direction, notes, nextAction, nextActionDate, createdAt, counsellor (User), student, tenant
- `Payment` type exists with: id, feeType, amount, currency, paymentStatus, paymentDate, paymentMethod, invoice, createdAt, student, tenant
- User type includes: staffTitle, specializationCountries[]

**If schema is missing fields**: Keystone build should fail, re-run `npm run build` to see errors and regenerate.

---

## Implementation Order & Phases

### Phase 2a: Foundation (2–3 days)
1. Task 1: Update options.ts
2. Task 2: Create helpers.ts
3. Task 3: Update validation/student.ts
4. Task 4: Create validation/interaction.ts
5. Task 5: Create payments/options.ts
6. **Checkpoint**: `npm run build` passes, no TS errors in these files

### Phase 2b: Form Refactor (3–4 days)
7. Task 6: Create 8 section components (parallel work)
8. Task 7: Update StudentCreateDialog
9. Task 8: Update StudentEditSheet
10. Task 17: Update hooks
11. **Checkpoint**: Create/edit forms work, no validation errors, can submit student data

### Phase 2c: List & Detail (2–3 days)
12. Task 9: Update StudentTable
13. Task 10: Update StudentFilters
14. Task 11: Update StudentOverview
15. Task 12: Update StudentApplicationsTab
16. Task 13: Update StudentDocumentsTab
17. **Checkpoint**: Student list/detail view shows all new fields, filters work

### Phase 2d: New Features (2–3 days)
18. Task 14: Create StudentInteractionsTab
19. Task 15: Create StudentPaymentsTab
20. Task 16: Create payment pages (optional)
21. **Checkpoint**: Interaction logging works, payment tracking works

### Phase 2e: Polish (1 day)
22. Task 18: Verify GraphQL schema
23. Test mobile responsiveness
24. Cross-browser test (Chrome, Safari)
25. Accessibility audit (keyboard nav, screen reader)

---

## Testing Strategy

### Unit Tests
- Zod schema validation: e.g., `studentCreateSchema.parse({...})` validates required/optional fields
- Helpers: e.g., `priorityVariant('hot')` returns correct badge variant

### Component Tests (React Testing Library)
- Section components render fields correctly
- Form submission triggers correct mutation
- Filters update URL params
- Interaction form clears after submission

### Integration Tests
- Create student → list shows up
- Edit student → data persists
- Delete interaction → list updates
- Assign counsellor → table shows counsellor name

### Manual Testing (Priority Order)
1. **Create new student** with all new fields (smoke test)
2. **Edit existing student** → all sections load with data
3. **Filter by priority** → results match filter
4. **Assign counsellor** → table column updates
5. **Log interaction** → appears in timeline
6. **Create payment** → appears in payments tab
7. **Mobile responsiveness** → form scrolls nicely on phone

---

## Success Criteria

By end of Phase 2:
- ✅ No TypeScript errors in student-related files
- ✅ Form renders all new fields organized into sections
- ✅ Student list shows priority/counsellor columns with filters
- ✅ Student detail displays complete profile (academic, visa, financial, CRM status)
- ✅ Interaction tab shows CRM touchpoint timeline
- ✅ Payment tab shows consultancy fee tracking
- ✅ All GraphQL queries/mutations work end-to-end
- ✅ Mobile layout is usable (no horizontal scroll)
- ✅ Accessibility: keyboard navigation, ARIA labels, color contrast

---

## Known Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| `targetCountries` array handling in form | Add MultiSelect or Checkbox group; seed with empty array if null |
| New required fields break existing workflows | Make all new fields optional in Phase 2; harden as required in Phase 3 |
| `assignedCounsellor` relationship can cause N+1 queries | Use GraphQL fragments to batch-load counsellor data; Monitor query performance |
| Payment invoice file upload in inline form | Simplify Phase 2: upload in modal only, not inline form yet; defer to Phase 3 |
| Test data generation needs update | Update `generateTestData()` function to include new fields |
| GraphQL schema doesn't match Keystone schema | Re-run `npm run generate` if schema mismatch occurs; rebuild frontend |

---

## Next Steps (Approval Required)

Once Phase 2 is approved:
1. Begin with Phase 2a foundation work (options, validation, helpers)
2. Build & test checkpoint after each phase section
3. Gather feedback on form layout/UX before full rollout
4. Plan Phase 3 (dashboard, advanced filters, CSV export) once Phase 2 is solid

---

**Document Version**: 1.0  
**Created**: 2026-07-25  
**Status**: Ready for implementation approval
