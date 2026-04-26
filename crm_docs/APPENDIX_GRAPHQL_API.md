# Appendix B: GraphQL API Reference

**Related**: [Phase 2: Core Schema & Data Model](./PHASE_2_SCHEMA.md)

---

## Query API

### Student Queries

**List all students (with pagination)**:
```graphql
query GetStudents(
  $first: Int = 10
  $skip: Int = 0
  $where: StudentWhereInput
  $orderBy: [StudentOrderByInput!]
) {
  students(first: $first, skip: $skip, where: $where, orderBy: $orderBy) {
    id
    fullName
    email
    phone
    currentStage
    countryOfResidence
    targetCountry
    educationLevel
    englishTestScore
    englishTestType
    createdAt
    updatedAt
  }
  studentsCount(where: $where)
}
```

**Variables Example**:
```json
{
  "first": 20,
  "skip": 0,
  "where": {
    "currentStage": { "equals": "applied" }
  },
  "orderBy": [{ "createdAt": "desc" }]
}
```

**Get single student with full profile**:
```graphql
query GetStudentProfile($id: ID!) {
  student(where: { id: $id }) {
    id
    fullName
    email
    phone
    dateOfBirth
    countryOfResidence
    targetCountry
    educationLevel
    workExperience
    englishTestScore
    englishTestType
    parentMonthlyIncome
    currentStage
    
    applications {
      id
      status
      program {
        id
        name
        university {
          name
          country
        }
      }
      applicationDate
      responseDate
      gpa
      gre
      gmat
    }
    
    loanApplications {
      id
      status
      loanAmountRequested
      loanAmountApproved
      currency
      loanTenure
      interestRate
      approvedAt
      disburseDate
    }
    
    accommodations {
      id
      city
      accommodationType
      monthlyRent
      currency
      checkInDate
      checkOutDate
      status
    }
    
    documents {
      id
      documentType
      verificationStatus
      uploadedAt
    }
    
    prepaidCard {
      id
      balance
      currency
      status
      expiryDate
    }
    
    createdAt
    updatedAt
  }
}
```

### Application Queries

**Get all applications with filtering**:
```graphql
query GetApplications(
  $where: ApplicationWhereInput
  $orderBy: [ApplicationOrderByInput!]
) {
  applications(where: $where, orderBy: $orderBy) {
    id
    student {
      id
      fullName
      email
    }
    program {
      id
      name
      level
      field
      tuitionFeePerYear
      university {
        name
        country
      }
    }
    status
    applicationDate
    responseDate
    gpa
    gre
    gmat
    documents {
      id
      documentType
      verificationStatus
    }
  }
}
```

**Filter by status and date range**:
```json
{
  "where": {
    "AND": [
      { "status": { "equals": "underReview" } },
      { "applicationDate": { "gte": "2026-01-01T00:00:00Z" } }
    ]
  },
  "orderBy": [{ "applicationDate": "desc" }]
}
```

### Loan Application Queries

**Get all pending loan applications**:
```graphql
query GetPendingLoans {
  loanApplications(
    where: { 
      status: { 
        in: ["initiated", "documentsPending", "underReview"]
      }
    }
    orderBy: { createdAt: desc }
  ) {
    id
    student {
      id
      fullName
      email
      phone
    }
    status
    loanAmountRequested
    loanAmountApproved
    currency
    interestRate
    emi
    loanTenure
    consultantRemarks
    fulfilmentRemarks
    assignedFulfilmentExec {
      id
      name
      email
    }
    createdAt
  }
}
```

**Get loan analytics dashboard**:
```graphql
query GetLoanAnalytics($tenantId: ID!) {
  # Total loans by status
  initiatedLoans: loanApplicationsCount(
    where: { status: { equals: "initiated" }, tenant: { id: { equals: $tenantId } } }
  )
  
  underReviewLoans: loanApplicationsCount(
    where: { status: { equals: "underReview" }, tenant: { id: { equals: $tenantId } } }
  )
  
  approvedLoans: loanApplicationsCount(
    where: { status: { equals: "approved" }, tenant: { id: { equals: $tenantId } } }
  )
  
  disburseLoans: loanApplicationsCount(
    where: { status: { equals: "disbursed" }, tenant: { id: { equals: $tenantId } } }
  )
  
  rejectedLoans: loanApplicationsCount(
    where: { status: { equals: "rejected" }, tenant: { id: { equals: $tenantId } } }
  )
}
```

### Document Queries

**Get all pending documents for verification**:
```graphql
query GetPendingDocuments {
  studentDocuments(
    where: {
      verificationStatus: { equals: "pending" }
    }
    orderBy: { uploadedAt: asc }
  ) {
    id
    student {
      id
      fullName
      email
    }
    documentType
    verificationStatus
    file {
      id
      url
      filename
    }
    uploadedAt
  }
}
```

### User & Consultant Queries

**Get all consultants (superAdmin only)**:
```graphql
query GetConsultants {
  consultants {
    id
    name
    contactEmail
    status
    tier
    users {
      id
      email
      role
      isActive
    }
    studentsCount: studentsCount
    applicationsCount: applicationsCount
    loanApplicationsCount: loanApplicationsCount
    createdAt
  }
}
```

**Get tenant users**:
```graphql
query GetTenantUsers($tenantId: ID!) {
  users(
    where: { tenant: { id: { equals: $tenantId } } }
  ) {
    id
    email
    name
    role
    isActive
    lastLoginAt
    createdAt
  }
}
```

---

## Mutation API

### Create Student

```graphql
mutation CreateStudent($data: StudentCreateInput!) {
  createStudent(data: $data) {
    id
    fullName
    email
    phone
    currentStage
    createdAt
  }
}
```

**Input Variables**:
```json
{
  "data": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "countryOfResidence": "IN",
    "targetCountry": "US",
    "educationLevel": "bachelor",
    "currentStage": "lead"
  }
}
```

### Create Application

```graphql
mutation CreateApplication($data: ApplicationCreateInput!) {
  createApplication(data: $data) {
    id
    student {
      fullName
    }
    program {
      name
      university {
        name
      }
    }
    status
    createdAt
  }
}
```

**Input Variables**:
```json
{
  "data": {
    "student": { "connect": { "id": "student-id" } },
    "program": { "connect": { "id": "program-id" } },
    "status": "draft",
    "gpa": 3.8,
    "gre": 320
  }
}
```

### Create Loan Application

```graphql
mutation CreateLoanApplication($data: LoanApplicationCreateInput!) {
  createLoanApplication(data: $data) {
    id
    student {
      fullName
    }
    status
    loanAmountRequested
    currency
    createdAt
  }
}
```

**Input Variables**:
```json
{
  "data": {
    "student": { "connect": { "id": "student-id" } },
    "application": { "connect": { "id": "application-id" } },
    "loanAmountRequested": 500000,
    "currency": "INR",
    "loanTenure": 60,
    "consultantRemarks": "Student has strong profile"
  }
}
```

### Update Loan Status (Fulfilment Only)

```graphql
mutation UpdateLoanStatus(
  $id: ID!
  $status: LoanApplicationStatusType!
  $remarks: String
  $amount: Int
) {
  updateLoanApplication(
    where: { id: $id }
    data: {
      status: $status
      fulfilmentRemarks: $remarks
      loanAmountApproved: $amount
    }
  ) {
    id
    status
    loanAmountApproved
    fulfilmentRemarks
    updatedAt
  }
}
```

**Input Variables**:
```json
{
  "id": "loan-123",
  "status": "approved",
  "remarks": "Approved by bank XYZ",
  "amount": 450000
}
```

### Approve & Disburse Loan

```graphql
mutation ApproveLoan($id: ID!, $interestRate: Float!) {
  updateLoanApplication(
    where: { id: $id }
    data: {
      status: "approved"
      interestRate: $interestRate
      approvedAt: "2026-01-20T10:00:00Z"
      fulfilmentRemarks: "Loan approved and ready for disbursement"
    }
  ) {
    id
    status
    interestRate
    emi
    approvedAt
  }
}
```

### Disburse Loan

```graphql
mutation DisburseLoan($id: ID!) {
  updateLoanApplication(
    where: { id: $id }
    data: {
      status: "disbursed"
      disburseDate: "2026-01-25T10:00:00Z"
      fulfilmentRemarks: "Amount disbursed to student's prepaid card"
    }
  ) {
    id
    status
    disburseDate
    updatedAt
  }
}
```

### Update Application Status

```graphql
mutation UpdateApplicationStatus(
  $id: ID!
  $status: ApplicationStatusType!
) {
  updateApplication(
    where: { id: $id }
    data: { status: $status }
  ) {
    id
    status
    responseDate
  }
}
```

### Upload Document

```graphql
mutation UploadDocument(
  $data: StudentDocumentCreateInput!
) {
  createStudentDocument(data: $data) {
    id
    student {
      fullName
    }
    documentType
    verificationStatus
    uploadedAt
  }
}
```

**Input Variables**:
```json
{
  "data": {
    "student": { "connect": { "id": "student-id" } },
    "application": { "connect": { "id": "application-id" } },
    "documentType": "transcript",
    "file": "file-upload-handle"
  }
}
```

### Verify Document (Fulfilment Only)

```graphql
mutation VerifyDocument(
  $id: ID!
  $status: VerificationStatusType!
  $remarks: String
) {
  updateStudentDocument(
    where: { id: $id }
    data: {
      verificationStatus: $status
      verificationRemarks: $remarks
    }
  ) {
    id
    documentType
    verificationStatus
    verificationRemarks
  }
}
```

### Create Accommodation Booking

```graphql
mutation CreateAccommodation(
  $data: AccommodationBookingCreateInput!
) {
  createAccommodationBooking(data: $data) {
    id
    student {
      fullName
    }
    city
    accommodationType
    monthlyRent
    status
  }
}
```

**Input Variables**:
```json
{
  "data": {
    "student": { "connect": { "id": "student-id" } },
    "city": "New York",
    "accommodationType": "sharedApartment",
    "monthlyRent": 1200,
    "currency": "USD",
    "checkInDate": "2026-08-15T00:00:00Z"
  }
}
```

### Create Task

```graphql
mutation CreateTask($data: TaskCreateInput!) {
  createTask(data: $data) {
    id
    student {
      fullName
    }
    title
    status
    priority
    dueDate
  }
}
```

**Input Variables**:
```json
{
  "data": {
    "student": { "connect": { "id": "student-id" } },
    "title": "Submit English test score",
    "taskType": "documentUpload",
    "priority": "high",
    "dueDate": "2026-02-01T00:00:00Z",
    "assignedTo": { "connect": { "id": "user-id" } }
  }
}
```

---

## Subscription API (Real-time Updates)

### Subscribe to Loan Status Changes

```graphql
subscription OnLoanStatusChange($id: ID!) {
  loanApplicationUpdated(where: { id: $id }) {
    id
    status
    updatedAt
    fulfilmentRemarks
  }
}
```

### Subscribe to New Tasks

```graphql
subscription OnNewTask($tenantId: ID!) {
  taskCreated(where: { tenant: { id: { equals: $tenantId } } }) {
    id
    title
    priority
    dueDate
    student {
      fullName
    }
  }
}
```

---

## Batch Operations

### Bulk Update Loan Status

```graphql
mutation BulkUpdateLoans(
  $ids: [ID!]!
  $status: LoanApplicationStatusType!
) {
  updateLoanApplications(
    data: [
      # This would be handled via multiple mutations in the client
    ]
  ) {
    id
    status
  }
}
```

**Client-side implementation** (recommended):
```typescript
async function bulkUpdateLoans(ids: string[], status: string) {
  const mutations = ids.map(id => 
    updateLoanApplication({ id, status })
  );
  
  return Promise.all(mutations);
}
```

---

## Error Handling

All mutations return standardized error responses:

```graphql
{
  "errors": [
    {
      "message": "Access denied",
      "extensions": {
        "code": "FORBIDDEN",
        "details": "Consultant can only update own loans"
      }
    }
  ]
}
```

**Common error codes**:
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Entity not found
- `INVALID_INPUT` - Validation error
- `UNAUTHENTICATED` - Not logged in
- `CONFLICT` - Business logic conflict

---

## Filtering Examples

### Filter Students by Multiple Conditions

```json
{
  "where": {
    "AND": [
      { "currentStage": { "equals": "applied" } },
      { "countryOfResidence": { "equals": "IN" } },
      { "englishTestScore": { "gte": 7.0 } },
      { "createdAt": { "gte": "2026-01-01T00:00:00Z" } }
    ]
  }
}
```

### Search Students by Name

```json
{
  "where": {
    "fullName": { "contains": "John", "mode": "insensitive" }
  }
}
```

### Complex Application Filter

```json
{
  "where": {
    "OR": [
      { "status": { "equals": "rejected" } },
      {
        "AND": [
          { "status": { "equals": "submitted" } },
          { "applicationDate": { "lt": "2025-12-01T00:00:00Z" } }
        ]
      }
    ]
  }
}
```

---

## Pagination Examples

### Offset-based Pagination

```graphql
query {
  students(first: 10, skip: 20) {
    id
    fullName
  }
  studentsCount
}
```

### Cursor-based Pagination (Advanced)

```graphql
query {
  students(first: 10, after: "cursor123") {
    edges {
      node {
        id
        fullName
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

---

## Sorting Examples

### Sort by Multiple Fields

```json
{
  "orderBy": [
    { "createdAt": "desc" },
    { "fullName": "asc" }
  ]
}
```

### Sort with Nested Relations

```json
{
  "orderBy": [
    { "loanApplications": { "approvedAt": "desc" } }
  ]
}
```

---

**Back to Phase 2**: [Phase 2: Core Schema & Data Model](./PHASE_2_SCHEMA.md)
