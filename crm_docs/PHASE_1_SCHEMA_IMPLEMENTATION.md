# Phase 1: CRM Schema Implementation — Complete

**Status**: ✅ **DONE**  
**Date**: 2026-07-25  
**Commit**: `3d8e27c`  
**Branch**: `fb_crm_base`

## What Was Implemented

### New Entities

#### 1. **Interaction** (`keystone/schema/Interaction.ts`)
Manually-logged CRM touchpoints for tracking calls, WhatsApp, emails, meetings, and other counsellor interactions with students.

**Fields**:
- `student` (relationship), `counsellor` (relationship), `tenant` (relationship)
- `type` (select: Call/WhatsApp/Email/In-person Meeting/Reddit/Walk-in/Other)
- `direction` (select: Inbound/Outbound)
- `notes` (textarea), `nextAction`, `nextActionDate`
- `createdAt` (timestamp)

**Access**: Tenant-scoped. Any authenticated user can log/update interactions; superAdmin can delete.  
**Hooks**: Auto-sets tenant on create; logs to ActivityLog and invalidates cache.

---

#### 2. **Payment** (`keystone/schema/Payment.ts`)
Consultancy fees collected from students (distinct from loans/reimbursements that flow *to* students).

**Fields**:
- `student` (relationship), `tenant` (relationship)
- `feeType` (select: Consultation Fee/Application Fee/Visa Filing Fee/Commission/Misc)
- `amount` (integer), `currency` (text, default "INR")
- `paymentStatus` (select: Pending/Partial/Paid)
- `paymentDate`, `paymentMethod` (select: Cash/UPI/Bank Transfer/Card)
- `invoice` (file, storage: `invoices/` prefix)
- `createdAt`

**Access**: Tenant-scoped. Editable by any authenticated tenant member.  
**Hooks**: Same as Interaction.

---

### Extended Entities

#### 3. **Student** (`keystone/schema/Student.ts`) — ~45 fields, grouped by spec section

**Identity & Contact**:
- `gender` (select: Male/Female/Other)
- `city`, `state`
- `source` (select: Reddit/Instagram/Referral/Walk-in/Google/Facebook/LinkedIn/Other)

**Academic Background**:
- `stream` (text), `subjects` (json array)
- `academicScore` (decimal), `academicScoreType` (select: Percentage/CGPA)
- `backlogCount`, `yearOfPassing`, `institutionName`

**Test Scores**:
- Added `duolingoScore`, `testAppearingDate` (existing IELTS/TOEFL/PTE/GRE/GMAT/SAT/ACT/final retained)

**Work Experience**:
- `employer`, `designation`, `gapExplanation` (textarea)
- Existing `workExperience` bucket select retained

**Study Goals**:
- Converted `targetCountry` (single select) → `targetCountries` (json array)
- Added `targetCourses` (json array), `studyLevel` (select), `preferredIntake` (select)
- Kept `targetYear`

**Financial**:
- Replaced `budgetPerYear` → `budgetTuition` + `budgetLiving` + `budgetCurrency`
- Added `fundingType` (select: Self-funded/Education Loan/Scholarship/Parents)
- Renamed `openForScholarshipsLoans` → `loanPreApproved`

**Visa & Travel** (new section):
- `priorVisaRefusals` (checkbox), `refusalCountries` (json array), `refusalReason` (textarea)
- `passportAvailable` (checkbox), `passportExpiry` (timestamp)

**CRM Status**:
- **Stage pipeline**: 9 stages (was 6)
  - `lead`, `contacted`, `counsellingDone`, `docsCollection`, `applied`, `offerReceived`, `visaFiled`, `enrolled`, `lost`
  - Dropped: `prospect`, `inLoanProcess` (loan status tracked separately), `graduated` (folded into `enrolled`)
- `priority` (select: Hot/Warm/Cold) — new
- `lostReason` (text) — new
- `assignedCounsellor` (relationship to `User`) — **new**, enables individual staff assignment

**New relationships**: `interactions`, `payments` (back-refs from Interaction/Payment)

---

#### 4. **Application** (`keystone/schema/Application.ts`)

**New status enum values**:
- Added: `offerReceived`, `conditional`, `deferred`
- Kept: draft, submitted, underReview, waitlisted, accepted, rejected

**New fields**:
- `offerLetter` (file, storage: `offer_letters/`)
- `conditionalRequirements` (textarea)
- `tuitionFeeOffered`, `scholarshipAwarded` (integers)

---

#### 5. **StudentDocument** (`keystone/schema/StudentDocument.ts`)

**Extended documentType enum**:
- Added: `lor`, `markSheet`, `ieltsScoreCard`, `visaForm`, `photo`
- Existing: passport, birthCertificate, sop, resume, transcripts, englishTest, financialDocs, bankStatement, loanAgreement

**Extended verificationStatus enum**:
- Added: `received`, `uploadedToPortal` (between `pending` and `verified`)
- Existing: pending, verified, rejected

**New field**:
- `dueDate` (timestamp) — enables checklist with due dates

---

#### 6. **Program** (`keystone/schema/Program.ts`)

**New fields**:
- `minIeltsScore` (decimal), `minCgpa` (decimal) — program-level thresholds
- `applicationFee` (integer), `applicationPortalUrl` (text)

---

#### 7. **User** (`keystone/schema/User.ts`) — cosmetic extensions

**New fields** (descriptive, not access-control):
- `staffTitle` (select: Admin/Senior Counsellor/Counsellor/Visa Specialist/Document Executive)
- `specializationCountries` (json array)

Note: The existing `role` field (superAdmin/fulfilment/consultantAdmin/consultantAgent) is unchanged and remains the source of truth for access control.

---

#### 8. **Consultant** (`keystone/schema/Consultant.ts`)

**Added back-relationships**:
- `interactions: relationship({ ref: "Interaction.tenant", many: true })`
- `payments: relationship({ ref: "Payment.tenant", many: true })`

---

### File Storage

Added two new R2 bucket prefixes in `keystone/keystone.ts`:
- `invoices/` — for Payment invoice files
- `offer-letters/` — for Application offer letter files

---

## Seeds Updated

**`keystone/seeds/seed-students.ts`**:
- Full rewrite with realistic seed data for all 10 students under new schema
- Maps old stage values appropriately
- Includes new fields: gender, city, state, source, academic details, visa history, etc.

**`keystone/seeds/seed.ts`**:
- Updated 3 student seed records to use new schema

---

## Build & Verification

✅ **Schema Compilation**: Passed  
```
$ npm run build
✨ Generated GraphQL and Prisma schemas
✨ Compiling successful
```

✅ **Keystone Admin UI**: Both `/interactions` and `/payments` list pages auto-generated and registered.

⏳ **Database Schema Push**: Requires running Postgres instance  
```
$ npm run db:push
# Do this when DB is available
```

---

## What's NOT Broken Yet (frontend-wise)

The Next.js app (`src/`) still **builds** successfully because:
- Frontend imports are in `src/lib/validations/student.ts`, `src/lib/students/options.ts`, `src/components/consultant/students/*`
- These files have TypeScript errors now (enums changed, new required fields) but don't block build
- **Phase 2** will fix these deliberately with form/UI updates

---

## Next Steps: Phase 2 (UI Alignment)

When ready, Phase 2 will:
1. Restructure `StudentCreateDialog`/`StudentEditSheet` into sectioned form (Identity → Academic → Tests → Work → Goals → Financial → Visa → CRM Status)
2. Update `STAGE_OPTIONS`/`STAGE_VARIANTS`, `usePipelineCounts`
3. Add Priority badge, Counsellor column/filter to student list
4. New `StudentInteractionsTab` for interaction timeline
5. New Payments pages (list/detail/create)
6. Document checklist UI with due dates
7. Application detail UI for offer/scholarship fields

---

## How to Run DB Push

When your Postgres is up:

```bash
cd keystone
npm run db:push
# or
npm run generate
```

Prisma will:
1. Detect schema changes (new tables, new columns)
2. Create `Interaction` and `Payment` tables
3. Add ~20 columns to `Student` table
4. Extend `Application`, `StudentDocument`, `Program`, `User` tables
5. Accept destructive changes (old data dropped, as planned)

Then seed:
```bash
npm run seed
# and/or
npm run seed:students
```

---

## Summary

| Aspect | Status |
|---|---|
| New entities (Interaction, Payment) | ✅ Created |
| Extended Student (identity/academic/visa/goals/financial/CRM) | ✅ Complete |
| Extended Application, StudentDocument, Program, User, Consultant | ✅ Complete |
| Access control (no changes to roles) | ✅ Unchanged, safe |
| Hooks (auto-tenant, cache invalidation, activity logging) | ✅ Integrated |
| Seeds updated | ✅ Complete |
| Keystone build | ✅ Passes |
| TypeScript/ESLint | ✅ Schema valid (frontend has expected type errors) |
| Database push | ⏳ Pending (requires running DB) |

---

**Phase 1 is complete and ready for database synchronization.**
