# Appendix A: Complete Database Schema

**Related**: [Phase 2: Core Schema & Data Model](./PHASE_2_SCHEMA.md)

---

## Schema Overview

The schema follows a **multi-tenant** pattern with the `Consultant` as the tenant root. All business entities maintain relationships to the Consultant for proper data isolation.

---

## Complete Entity Definitions

### 1. User

```typescript
export const User = list({
  access: {
    operation: {
      query: isAuthenticated,
      create: isSuperAdmin,
      update: ({ session, item }) => {
        if (isSuperAdmin({ session })) return true;
        return session?.data?.id === item.id; // Users can update own
      },
      delete: isSuperAdmin,
    },
  },

  fields: {
    authUserId: text({
      validation: { isRequired: true },
      isIndexed: 'unique',
    }),

    email: text({
      validation: { 
        isRequired: true,
        match: { regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      },
      isIndexed: true,
    }),

    name: text({ validation: { isRequired: true } }),

    role: select({
      options: [
        { label: 'Super Admin', value: 'superAdmin' },
        { label: 'Fulfilment', value: 'fulfilment' },
        { label: 'Consultant Admin', value: 'consultantAdmin' },
        { label: 'Consultant Agent', value: 'consultantAgent' },
      ],
      validation: { isRequired: true },
      access: {
        update: ({ session }) => isSuperAdmin({ session }),
      },
    }),

    tenant: relationship({
      ref: 'Consultant.users',
      many: false,
      db: { map: 'tenant_id' },
      access: {
        create: isSuperAdmin,
        update: isSuperAdmin,
      },
    }),

    isActive: checkbox({
      default: true,
      db: { map: 'is_active' },
    }),

    lastLoginAt: timestamp({
      db: { map: 'last_login_at' },
    }),

    createdAt: timestamp({
      defaultValue: { kind: 'now' },
      db: { map: 'created_at' },
    }),

    updatedAt: timestamp({
      db: { updatedAt: true, map: 'updated_at' },
    }),
  },

  graphql: {
    plural: 'Users',
  },

  hooks: {
    afterOperation: logActivityHook,
  },
});
```

---

### 2. Consultant

```typescript
export const Consultant = list({
  access: {
    operation: {
      query: ({ session }) => {
        if (isSuperAdmin({ session })) return true;
        // Consultants can query their own
        return { id: { equals: session?.data?.tenant?.id } };
      },
      create: isSuperAdmin,
      update: ({ session }) => isSuperAdmin({ session }),
      delete: isSuperAdmin,
    },
  },

  fields: {
    name: text({
      validation: { isRequired: true },
      db: { map: 'consultant_name' },
    }),

    slug: text({
      isIndexed: 'unique',
      db: { map: 'consultant_slug' },
    }),

    contactEmail: text({
      validation: {
        isRequired: true,
        match: { regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      },
      db: { map: 'contact_email' },
    }),

    contactPhone: text({
      db: { map: 'contact_phone' },
    }),

    country: text({
      defaultValue: 'IN',
      db: { map: 'country_code' },
    }),

    city: text(),

    status: select({
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Suspended', value: 'suspended' },
      ],
      defaultValue: 'active',
    }),

    tier: select({
      options: [
        { label: 'Starter', value: 'starter' },
        { label: 'Professional', value: 'professional' },
        { label: 'Enterprise', value: 'enterprise' },
      ],
      defaultValue: 'starter',
    }),

    // One-to-Many relationships
    users: relationship({ ref: 'User.tenant', many: true }),
    students: relationship({ ref: 'Student.tenant', many: true }),
    applications: relationship({ ref: 'Application.tenant', many: true }),
    loanApplications: relationship({ ref: 'LoanApplication.tenant', many: true }),
    accommodations: relationship({ ref: 'AccommodationBooking.tenant', many: true }),
    reimbursements: relationship({ ref: 'Reimbursement.tenant', many: true }),
    prepaidCards: relationship({ ref: 'PrepaidCard.tenant', many: true }),
    tasks: relationship({ ref: 'Task.tenant', many: true }),
    activityLogs: relationship({ ref: 'ActivityLog.tenant', many: true }),

    createdAt: timestamp({
      defaultValue: { kind: 'now' },
      db: { map: 'created_at' },
    }),

    updatedAt: timestamp({
      db: { updatedAt: true, map: 'updated_at' },
    }),
  },

  hooks: {
    afterOperation: logActivityHook,
  },
});
```

---

### 3. Student

```typescript
export const Student = list({
  access: {
    operation: {
      query: isAuthenticated,
      create: isConsultant,
      update: isAuthenticated,
      delete: () => false, // Soft delete only
    },
    filter: {
      query: filterByTenant,
      update: filterByTenant,
    },
  },

  fields: {
    tenant: relationship({
      ref: 'Consultant.students',
      many: false,
      db: { map: 'tenant_id' },
    }),

    fullName: text({
      validation: { isRequired: true },
      db: { map: 'full_name' },
    }),

    email: text({
      validation: {
        isRequired: true,
        match: { regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      },
      isIndexed: true,
    }),

    phone: text({
      validation: { isRequired: true },
    }),

    dateOfBirth: timestamp({
      db: { map: 'date_of_birth' },
    }),

    countryOfResidence: text({
      validation: { isRequired: true },
      db: { map: 'country_of_residence' },
    }),

    targetCountry: text({
      db: { map: 'target_country' },
    }),

    currentStage: select({
      options: [
        { label: 'Lead', value: 'lead' },
        { label: 'Prospect', value: 'prospect' },
        { label: 'Applied', value: 'applied' },
        { label: 'In Loan Process', value: 'inLoanProcess' },
        { label: 'Enrolled', value: 'enrolled' },
        { label: 'Graduated', value: 'graduated' },
      ],
      defaultValue: 'lead',
      db: { map: 'current_stage' },
    }),

    educationLevel: select({
      options: [
        { label: 'High School', value: 'highSchool' },
        { label: 'Bachelor', value: 'bachelor' },
        { label: 'Master', value: 'master' },
        { label: 'PhD', value: 'phd' },
      ],
      db: { map: 'education_level' },
    }),

    workExperience: integer({
      db: { map: 'work_experience_years' },
    }),

    englishTestScore: decimal({
      db: { map: 'english_test_score' },
    }),

    englishTestType: select({
      options: [
        { label: 'IELTS', value: 'IELTS' },
        { label: 'TOEFL', value: 'TOEFL' },
        { label: 'PTE', value: 'PTE' },
      ],
      db: { map: 'english_test_type' },
    }),

    parentMonthlyIncome: integer({
      db: { map: 'parent_monthly_income' },
    }),

    // Relationships
    applications: relationship({ ref: 'Application.student', many: true }),
    documents: relationship({ ref: 'StudentDocument.student', many: true }),
    loanApplications: relationship({ ref: 'LoanApplication.student', many: true }),
    accommodations: relationship({ ref: 'AccommodationBooking.student', many: true }),
    reimbursements: relationship({ ref: 'Reimbursement.student', many: true }),
    prepaidCard: relationship({ ref: 'PrepaidCard.student' }),
    tasks: relationship({ ref: 'Task.student', many: true }),

    notes: richText({ db: { map: 'student_notes' } }),

    isDeleted: checkbox({
      defaultValue: false,
      db: { map: 'is_deleted' },
    }),

    createdAt: timestamp({
      defaultValue: { kind: 'now' },
      db: { map: 'created_at' },
    }),

    updatedAt: timestamp({
      db: { updatedAt: true, map: 'updated_at' },
    }),
  },

  hooks: {
    resolveInput: autoSetTenantHook('create'),
    afterOperation: logActivityHook,
  },
});
```

---

### 4. University

```typescript
export const University = list({
  access: {
    operation: {
      query: () => true, // Public
      create: isSuperAdmin,
      update: isSuperAdmin,
      delete: isSuperAdmin,
    },
  },

  fields: {
    name: text({
      validation: { isRequired: true },
    }),

    slug: text({
      isIndexed: 'unique',
    }),

    country: text({
      validation: { isRequired: true },
    }),

    city: text(),

    website: text(),

    acceptanceRate: decimal({
      db: { map: 'acceptance_rate' },
    }),

    ranking: integer(),

    programs: relationship({ ref: 'Program.university', many: true }),

    logo: file({ storage: 'university_logos' }),

    isActive: checkbox({ defaultValue: true }),

    createdAt: timestamp({
      defaultValue: { kind: 'now' },
      db: { map: 'created_at' },
    }),
  },
});
```

---

### 5. Program

```typescript
export const Program = list({
  access: {
    operation: {
      query: () => true,
      create: isSuperAdmin,
      update: isSuperAdmin,
      delete: isSuperAdmin,
    },
  },

  fields: {
    name: text({
      validation: { isRequired: true },
    }),

    university: relationship({
      ref: 'University.programs',
      many: false,
      validation: { isRequired: true },
    }),

    level: select({
      options: [
        { label: 'Bachelor', value: 'bachelor' },
        { label: 'Master', value: 'master' },
        { label: 'PhD', value: 'phd' },
      ],
      validation: { isRequired: true },
    }),

    field: text({
      validation: { isRequired: true },
    }),

    tuitionFeePerYear: integer({
      db: { map: 'tuition_fee_per_year' },
    }),

    currency: text({ defaultValue: 'USD' }),

    duration: integer({
      db: { map: 'duration_months' },
    }),

    startDate: timestamp({
      db: { map: 'start_date' },
    }),

    applications: relationship({ ref: 'Application.program', many: true }),

    isActive: checkbox({ defaultValue: true }),

    createdAt: timestamp({
      defaultValue: { kind: 'now' },
      db: { map: 'created_at' },
    }),
  },
});
```

---

### 6. Application

```typescript
export const Application = list({
  access: {
    operation: {
      query: isAuthenticated,
      create: isConsultant,
      update: isAuthenticated,
      delete: () => false,
    },
    filter: {
      query: filterByTenant,
      update: filterByTenant,
    },
  },

  fields: {
    tenant: relationship({
      ref: 'Consultant.applications',
      many: false,
      db: { map: 'tenant_id' },
    }),

    student: relationship({
      ref: 'Student.applications',
      many: false,
      validation: { isRequired: true },
    }),

    program: relationship({
      ref: 'Program.applications',
      many: false,
      validation: { isRequired: true },
    }),

    status: select({
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Submitted', value: 'submitted' },
        { label: 'Under Review', value: 'underReview' },
        { label: 'Waitlisted', value: 'waitlisted' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Rejected', value: 'rejected' },
      ],
      defaultValue: 'draft',
    }),

    applicationDate: timestamp({
      db: { map: 'application_date' },
    }),

    responseDate: timestamp({
      db: { map: 'response_date' },
    }),

    gre: integer(),
    gmat: integer(),
    gpa: decimal(),

    documents: relationship({ ref: 'StudentDocument.application', many: true }),

    remarks: richText(),

    isDeleted: checkbox({ defaultValue: false }),

    createdAt: timestamp({
      defaultValue: { kind: 'now' },
      db: { map: 'created_at' },
    }),

    updatedAt: timestamp({
      db: { updatedAt: true, map: 'updated_at' },
    }),
  },

  hooks: {
    resolveInput: autoSetTenantHook('create'),
    afterOperation: logActivityHook,
  },
});
```

---

### 7. StudentDocument

```typescript
export const StudentDocument = list({
  access: {
    operation: {
      query: isAuthenticated,
      create: isAuthenticated,
      update: isAuthenticated,
      delete: isAuthenticated,
    },
    filter: {
      query: filterByTenant,
      update: filterByTenant,
    },
  },

  fields: {
    student: relationship({
      ref: 'Student.documents',
      many: false,
      validation: { isRequired: true },
    }),

    application: relationship({
      ref: 'Application.documents',
      many: false,
    }),

    loanApplication: relationship({
      ref: 'LoanApplication.documents',
      many: false,
    }),

    documentType: select({
      options: [
        { label: 'Passport', value: 'passport' },
        { label: 'Birth Certificate', value: 'birthCertificate' },
        { label: 'SOP', value: 'sop' },
        { label: 'Resume', value: 'resume' },
        { label: 'Academic Transcripts', value: 'transcripts' },
        { label: 'English Test', value: 'englishTest' },
        { label: 'Financial Documents', value: 'financialDocs' },
        { label: 'Bank Statement', value: 'bankStatement' },
        { label: 'Loan Agreement', value: 'loanAgreement' },
      ],
      validation: { isRequired: true },
      db: { map: 'document_type' },
    }),

    file: file({
      storage: 'student_documents',
      validation: { isRequired: true },
    }),

    verificationStatus: select({
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Verified', value: 'verified' },
        { label: 'Rejected', value: 'rejected' },
      ],
      defaultValue: 'pending',
      db: { map: 'verification_status' },
      access: {
        update: ({ session }) => isFulfilment({ session }),
      },
    }),

    verificationRemarks: text({
      db: { map: 'verification_remarks' },
      access: {
        update: ({ session }) => isFulfilment({ session }),
      },
    }),

    uploadedAt: timestamp({
      defaultValue: { kind: 'now' },
      db: { map: 'uploaded_at' },
    }),

    createdAt: timestamp({
      defaultValue: { kind: 'now' },
      db: { map: 'created_at' },
    }),
  },

  hooks: {
    afterOperation: logActivityHook,
  },
});
```

---

### 8. LoanApplication

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
      update: filterByTenant,
    },
  },

  fields: {
    tenant: relationship({
      ref: 'Consultant.loanApplications',
      many: false,
      db: { map: 'tenant_id' },
    }),

    student: relationship({
      ref: 'Student.loanApplications',
      many: false,
      validation: { isRequired: true },
    }),

    application: relationship({
      ref: 'Application',
      many: false,
    }),

    status: select({
      options: [
        { label: 'Initiated', value: 'initiated' },
        { label: 'Documents Pending', value: 'documentsPending' },
        { label: 'Under Review', value: 'underReview' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Disbursed', value: 'disbursed' },
        { label: 'Closed', value: 'closed' },
      ],
      defaultValue: 'initiated',
      access: {
        update: ({ session }) => isFulfilment({ session }),
      },
    }),

    loanAmountRequested: integer({
      db: { map: 'loan_amount_requested' },
    }),

    loanAmountApproved: integer({
      db: { map: 'loan_amount_approved' },
      access: {
        update: ({ session }) => isFulfilment({ session }),
      },
    }),

    currency: text({ defaultValue: 'INR' }),

    loanTenure: integer({
      db: { map: 'loan_tenure_months' },
    }),

    interestRate: decimal({
      db: { map: 'interest_rate' },
      access: {
        update: ({ session }) => isFulfilment({ session }),
      },
    }),

    emi: integer(),

    consultantRemarks: richText({
      db: { map: 'consultant_remarks' },
      access: {
        update: ({ session }) => isConsultant({ session }),
      },
    }),

    fulfilmentRemarks: richText({
      db: { map: 'fulfilment_remarks' },
      access: {
        read: isAuthenticated,
        update: ({ session }) => isFulfilment({ session }),
      },
    }),

    approvedAt: timestamp({
      db: { map: 'approved_at' },
      access: {
        update: ({ session }) => isFulfilment({ session }),
      },
    }),

    disburseDate: timestamp({
      db: { map: 'disburse_date' },
      access: {
        update: ({ session }) => isFulfilment({ session }),
      },
    }),

    assignedFulfilmentExec: relationship({
      ref: 'User',
      access: {
        update: ({ session }) => isFulfilment({ session }),
      },
    }),

    documents: relationship({ ref: 'StudentDocument.loanApplication', many: true }),

    isDeleted: checkbox({ defaultValue: false }),

    createdAt: timestamp({
      defaultValue: { kind: 'now' },
      db: { map: 'created_at' },
    }),

    updatedAt: timestamp({
      db: { updatedAt: true, map: 'updated_at' },
    }),
  },

  hooks: {
    resolveInput: autoSetTenantHook('create'),
    afterOperation: logActivityHook,
  },
});
```

---

### 9. AccommodationBooking

```typescript
export const AccommodationBooking = list({
  access: {
    operation: {
      query: isAuthenticated,
      create: isConsultant,
      update: isAuthenticated,
      delete: () => false,
    },
    filter: {
      query: filterByTenant,
      update: filterByTenant,
    },
  },

  fields: {
    tenant: relationship({
      ref: 'Consultant.accommodations',
      many: false,
      db: { map: 'tenant_id' },
    }),

    student: relationship({
      ref: 'Student.accommodations',
      many: false,
      validation: { isRequired: true },
    }),

    city: text({
      validation: { isRequired: true },
    }),

    accommodationType: select({
      options: [
        { label: 'University Dorm', value: 'universityDorm' },
        { label: 'Shared Apartment', value: 'sharedApartment' },
        { label: 'Private Studio', value: 'privateStudio' },
        { label: 'Homestay', value: 'homestay' },
      ],
      validation: { isRequired: true },
      db: { map: 'accommodation_type' },
    }),

    address: text(),

    monthlyRent: integer({ db: { map: 'monthly_rent' } }),

    currency: text({ defaultValue: 'USD' }),

    checkInDate: timestamp({
      db: { map: 'check_in_date' },
    }),

    checkOutDate: timestamp({
      db: { map: 'check_out_date' },
    }),

    status: select({
      options: [
        { label: 'Inquiry', value: 'inquiry' },
        { label: 'Booked', value: 'booked' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Occupied', value: 'occupied' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      defaultValue: 'inquiry',
    }),

    landlordName: text({ db: { map: 'landlord_name' } }),

    landlordContact: text({ db: { map: 'landlord_contact' } }),

    isDeleted: checkbox({ defaultValue: false }),

    createdAt: timestamp({
      defaultValue: { kind: 'now' },
      db: { map: 'created_at' },
    }),

    updatedAt: timestamp({
      db: { updatedAt: true, map: 'updated_at' },
    }),
  },

  hooks: {
    resolveInput: autoSetTenantHook('create'),
    afterOperation: logActivityHook,
  },
});
```

---

### 10. Reimbursement

```typescript
export const Reimbursement = list({
  access: {
    operation: {
      query: isAuthenticated,
      create: isConsultant,
      update: isAuthenticated,
      delete: () => false,
    },
    filter: {
      query: filterByTenant,
      update: filterByTenant,
    },
  },

  fields: {
    tenant: relationship({
      ref: 'Consultant.reimbursements',
      many: false,
      db: { map: 'tenant_id' },
    }),

    student: relationship({
      ref: 'Student.reimbursements',
      many: false,
      validation: { isRequired: true },
    }),

    category: select({
      options: [
        { label: 'Application Fee', value: 'applicationFee' },
        { label: 'IELTS', value: 'ielts' },
        { label: 'Visa Fee', value: 'visaFee' },
        { label: 'Travel', value: 'travel' },
        { label: 'Accommodation', value: 'accommodation' },
      ],
      validation: { isRequired: true },
    }),

    amount: integer({ validation: { isRequired: true } }),

    currency: text({ defaultValue: 'INR' }),

    status: select({
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Reimbursed', value: 'reimbursed' },
      ],
      defaultValue: 'pending',
      access: {
        update: ({ session }) => isFulfilment({ session }),
      },
    }),

    receipt: file({ storage: 'receipts' }),

    requestedAt: timestamp({ db: { map: 'requested_at' } }),

    approvedAt: timestamp({
      db: { map: 'approved_at' },
      access: {
        update: ({ session }) => isFulfilment({ session }),
      },
    }),

    reimbursedAt: timestamp({
      db: { map: 'reimbursed_at' },
      access: {
        update: ({ session }) => isFulfilment({ session }),
      },
    }),

    remarks: text(),

    createdAt: timestamp({
      defaultValue: { kind: 'now' },
      db: { map: 'created_at' },
    }),
  },

  hooks: {
    resolveInput: autoSetTenantHook('create'),
    afterOperation: logActivityHook,
  },
});
```

---

### 11. PrepaidCard

```typescript
export const PrepaidCard = list({
  access: {
    operation: {
      query: isAuthenticated,
      create: isFulfilment,
      update: isAuthenticated,
      delete: () => false,
    },
    filter: {
      query: filterByTenant,
      update: filterByTenant,
    },
  },

  fields: {
    tenant: relationship({
      ref: 'Consultant.prepaidCards',
      many: false,
      db: { map: 'tenant_id' },
    }),

    student: relationship({
      ref: 'Student.prepaidCard',
      many: false,
      validation: { isRequired: true },
    }),

    cardNumber: text({
      validation: { isRequired: true },
      db: { map: 'card_number' },
    }),

    balance: integer(),

    currency: text({ defaultValue: 'USD' }),

    cardProvider: text({ db: { map: 'card_provider' } }),

    status: select({
      options: [
        { label: 'Inactive', value: 'inactive' },
        { label: 'Active', value: 'active' },
        { label: 'Blocked', value: 'blocked' },
        { label: 'Expired', value: 'expired' },
      ],
      defaultValue: 'inactive',
    }),

    issuedAt: timestamp({ db: { map: 'issued_at' } }),

    expiryDate: timestamp({ db: { map: 'expiry_date' } }),

    createdAt: timestamp({
      defaultValue: { kind: 'now' },
      db: { map: 'created_at' },
    }),
  },

  hooks: {
    resolveInput: autoSetTenantHook('create'),
  },
});
```

---

### 12. Task

```typescript
export const Task = list({
  access: {
    operation: {
      query: isAuthenticated,
      create: isAuthenticated,
      update: isAuthenticated,
      delete: () => false,
    },
    filter: {
      query: filterByTenant,
      update: filterByTenant,
    },
  },

  fields: {
    tenant: relationship({
      ref: 'Consultant.tasks',
      many: false,
      db: { map: 'tenant_id' },
    }),

    student: relationship({
      ref: 'Student.tasks',
      many: false,
      validation: { isRequired: true },
    }),

    title: text({ validation: { isRequired: true } }),

    description: richText(),

    taskType: select({
      options: [
        { label: 'Document Upload', value: 'documentUpload' },
        { label: 'Phone Call', value: 'phoneCall' },
        { label: 'Meeting', value: 'meeting' },
        { label: 'Application', value: 'application' },
        { label: 'Loan Approval', value: 'loanApproval' },
        { label: 'Visa Application', value: 'visaApplication' },
      ],
      validation: { isRequired: true },
      db: { map: 'task_type' },
    }),

    status: select({
      options: [
        { label: 'Todo', value: 'todo' },
        { label: 'In Progress', value: 'inProgress' },
        { label: 'Done', value: 'done' },
        { label: 'Blocked', value: 'blocked' },
      ],
      defaultValue: 'todo',
    }),

    priority: select({
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Urgent', value: 'urgent' },
      ],
      defaultValue: 'medium',
    }),

    dueDate: timestamp({ db: { map: 'due_date' } }),

    assignedTo: relationship({
      ref: 'User',
    }),

    createdBy: relationship({
      ref: 'User',
      db: { map: 'created_by' },
    }),

    isDeleted: checkbox({ defaultValue: false }),

    createdAt: timestamp({
      defaultValue: { kind: 'now' },
      db: { map: 'created_at' },
    }),

    updatedAt: timestamp({
      db: { updatedAt: true, map: 'updated_at' },
    }),
  },

  hooks: {
    resolveInput: autoSetTenantHook('create'),
    afterOperation: logActivityHook,
  },
});
```

---

### 13. ActivityLog

```typescript
export const ActivityLog = list({
  access: {
    operation: {
      query: isAuthenticated,
      create: () => false, // System only
      update: () => false,
      delete: () => false,
    },
    filter: {
      query: filterByTenant,
    },
  },

  fields: {
    tenant: relationship({
      ref: 'Consultant.activityLogs',
      many: false,
      db: { map: 'tenant_id' },
    }),

    actor: relationship({
      ref: 'User',
      validation: { isRequired: true },
    }),

    entityType: text({
      validation: { isRequired: true },
      db: { map: 'entity_type' },
    }),

    entityId: text({
      validation: { isRequired: true },
      db: { map: 'entity_id' },
    }),

    action: select({
      options: [
        { label: 'Created', value: 'created' },
        { label: 'Updated', value: 'updated' },
        { label: 'Deleted', value: 'deleted' },
        { label: 'Accessed', value: 'accessed' },
      ],
      validation: { isRequired: true },
    }),

    metadata: json(),

    createdAt: timestamp({
      defaultValue: { kind: 'now' },
      db: { map: 'created_at' },
    }),
  },

  graphql: {
    plural: 'ActivityLogs',
  },
});
```

---

## Relationships Summary

```
User
├── tenant → Consultant (Many-to-One)

Consultant (Root Tenant Entity)
├── users → User (One-to-Many)
├── students → Student (One-to-Many)
├── applications → Application (One-to-Many)
├── loanApplications → LoanApplication (One-to-Many)
├── accommodations → AccommodationBooking (One-to-Many)
├── reimbursements → Reimbursement (One-to-Many)
├── prepaidCards → PrepaidCard (One-to-Many)
├── tasks → Task (One-to-Many)
└── activityLogs → ActivityLog (One-to-Many)

Student
├── tenant → Consultant (Many-to-One)
├── applications → Application (One-to-Many)
├── documents → StudentDocument (One-to-Many)
├── loanApplications → LoanApplication (One-to-Many)
├── accommodations → AccommodationBooking (One-to-Many)
├── reimbursements → Reimbursement (One-to-Many)
├── prepaidCard → PrepaidCard (One-to-One)
└── tasks → Task (One-to-Many)

Application
├── tenant → Consultant (Many-to-One)
├── student → Student (Many-to-One)
├── program → Program (Many-to-One)
└── documents → StudentDocument (One-to-Many)

Program
├── university → University (Many-to-One)
└── applications → Application (One-to-Many)

University
└── programs → Program (One-to-Many)
```

---

## Database Indexes

For optimal performance, ensure these indexes are created:

```sql
-- User indexes
CREATE UNIQUE INDEX idx_user_auth_user_id ON "User"("authUserId");
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_tenant ON "User"(tenant_id);

-- Student indexes
CREATE INDEX idx_student_tenant ON "Student"(tenant_id);
CREATE INDEX idx_student_email ON "Student"(email);
CREATE INDEX idx_student_stage ON "Student"(current_stage);

-- Application indexes
CREATE INDEX idx_application_tenant ON "Application"(tenant_id);
CREATE INDEX idx_application_student ON "Application"(student_id);
CREATE INDEX idx_application_status ON "Application"(status);

-- LoanApplication indexes
CREATE INDEX idx_loan_tenant ON "LoanApplication"(tenant_id);
CREATE INDEX idx_loan_student ON "LoanApplication"(student_id);
CREATE INDEX idx_loan_status ON "LoanApplication"(status);

-- ActivityLog indexes
CREATE INDEX idx_activity_tenant ON "ActivityLog"(tenant_id);
CREATE INDEX idx_activity_entity ON "ActivityLog"(entity_type, entity_id);
CREATE INDEX idx_activity_date ON "ActivityLog"(created_at);
```

---

## Connection String Format

```bash
# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/abroadkart

# MongoDB
DATABASE_URL=mongodb+srv://user:password@cluster.mongodb.net/abroadkart?retryWrites=true&w=majority

# MySQL (via Prisma adapter)
DATABASE_URL=mysql://user:password@localhost:3306/abroadkart
```

---

## Migration Guide

When schema changes between phases:

```bash
# Generate Prisma schema
npx keystone prisma migrate dev --name describe_changes

# Create migration
npx keystone prisma migrate resolve --rolled-back migration_name

# Apply to production
npx keystone prisma migrate deploy
```

---

**Back to Phase 2**: [Phase 2: Core Schema & Data Model](./PHASE_2_SCHEMA.md)
