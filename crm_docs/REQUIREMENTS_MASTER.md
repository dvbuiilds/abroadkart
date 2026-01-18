# Abroad Kart Web Application - Complete Requirements Document

**Version**: 1.0  
**Last Updated**: January 18, 2026  
**Status**: Phase 1 & 2 Finalized

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [Architecture](#architecture)
4. [Tech Stack](#tech-stack)
5. [Core Features by Role](#core-features-by-role)
6. [Phase Documentation](#phase-documentation)
7. [Component Guide](#component-guide)
8. [Appendices](#appendices)

---

## Executive Summary

**Abroad Kart** is a **multi-tenant CRM platform** enabling education consultants to manage student applications, loan processing, visa applications, and accommodation bookings. The platform serves three user roles:
- **Consultants** (agents/admins) managing student portfolios
- **Fulfilment Team** processing loans and disbursements across all consultants
- **Super Admin** managing system configuration and consultant onboarding

---

## Project Overview

### Problem Statement

Education consultants lack integrated tools to:
- Track student journey from inquiry to enrollment
- Process loans efficiently across multiple banks/partners
- Manage document verification and compliance
- Coordinate with fulfilment teams
- Generate insights on student success rates

### Solution

A centralized, multi-tenant platform that:
- Automates student pipeline management
- Streamlines loan application and disbursement
- Ensures document compliance and verification
- Provides real-time visibility and analytics
- Scales to support hundreds of consultants

### Target Users

| Role | Count | Daily Usage | Key Tasks |
|------|-------|------------|-----------|
| Consultant Agent | 500+ | High | Create students, track applications, submit loans |
| Consultant Admin | 100+ | Medium | Review team work, generate reports |
| Fulfilment Executive | 50+ | High | Process loans, disburse, verify documents |
| Super Admin | 5-10 | Low | Onboard consultants, system config |

---

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend Applications                       │
│  ┌──────────────────────┐           ┌──────────────────────────┐│
│  │  Consultant Portal   │           │    Fulfilment Portal     ││
│  │  (Next.js + React)   │           │   (Next.js + React)      ││
│  └──────────────────────┘           └──────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                            │
                    ┌───────┴────────┐
                    ▼                ▼
        ┌──────────────────────────────────────┐
        │     Clerk Authentication Service     │
        │  (Identity, SSO, Access Tokens)      │
        └──────────────────────────────────────┘
                    │
                    ▼
        ┌──────────────────────────────────────┐
        │    GraphQL API Layer (Apollo)         │
        │  ┌─────────────────────────────────┐ │
        │  │  KeystoneJS CMS & Headless API  │ │
        │  │  (Auto-generated GraphQL)       │ │
        │  └─────────────────────────────────┘ │
        │  - Auto access control              │
        │  - Multi-tenancy                    │
        │  - Hooks & middleware               │
        └──────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
    ┌────────┐ ┌────────┐ ┌──────────┐
    │   DB   │ │ Redis  │ │  Storage │
    │ (PG)   │ │(Cache) │ │(S3/GCS)  │
    └────────┘ └────────┘ └──────────┘
```

### Data Flow

**Consultant Creating Student**:
```
1. Consultant Portal → Form Entry
2. Next.js Route → API Call
3. Apollo Client → GraphQL Mutation (createStudent)
4. KeystoneJS → Access Control Check
5. Auto-assign Tenant → Create in DB
6. Cache Invalidation → Redis update
7. Activity Log → Log creation
8. Portal UI → Success message
```

**Fulfilment Processing Loan**:
```
1. Fulfilment Portal → Loan details page
2. Review documents, calculate EMI
3. GraphQL Mutation (updateLoanApplication)
4. KeystoneJS → Role check (fulfilment only)
5. Update status → approved/rejected
6. Generate documents → PDF certificate
7. Cache invalidation → Refresh stats
8. Activity log → Log approval
9. Webhook → Trigger disbursement flow
```

---

## Tech Stack

### Backend

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **CMS & API** | KeystoneJS 6 | Headless CMS with auto-generated GraphQL |
| **Database** | PostgreSQL 14+ | Multi-tenant data store |
| **Cache** | Redis 6+ | GraphQL query caching, session store |
| **Authentication** | Clerk | Identity, SSO, MFA |
| **File Storage** | S3 / Google Cloud Storage | Document storage |
| **API Gateway** | Apollo Server | GraphQL federation & middleware |

### Frontend

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | Next.js 14+ | React SSR + Vercel deployment |
| **UI Components** | ShadCN UI | Pre-built component library |
| **Data Fetching** | TanStack React Query | Client state + caching |
| **GraphQL Client** | Apollo Client 4 | GraphQL query management |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Forms** | React Hook Form | Form state management |
| **Rich Text** | Slate.js | Document editing |

### DevOps & Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Containerization** | Docker | Consistent environments |
| **Orchestration** | Kubernetes / Docker Compose | Container management |
| **CI/CD** | GitHub Actions | Automated testing & deployment |
| **Monitoring** | Datadog / New Relic | Performance & error tracking |
| **Logging** | Cloudwatch / ELK | Centralized logging |
| **Email** | SendGrid | Transactional emails |

---

## Core Features by Role

### Consultant Agent Features

**Dashboard**:
- Student pipeline overview (lead → enrolled)
- Pending tasks for today
- Recent student activity
- Quick-access links to key workflows

**Student Management**:
- Create new student record
- View student profile with timeline
- Track educational background
- View all student communications

**Application Management**:
- Create applications to universities
- Track application status
- Upload required documents
- View acceptance/rejection responses

**Loan Management**:
- Initiate loan applications
- Add consultant remarks
- Upload supporting documents
- Track loan status
- View EMI calculations

**Accommodation Management**:
- Search for accommodation options
- Book accommodation
- Track check-in/check-out dates

**Tasks & Notes**:
- Create tasks and reminders
- Add notes to student records
- Collaborate with team

**Reports**:
- Student pipeline report
- Application conversion rates
- Loan success metrics
- Reimbursement tracking

---

### Consultant Admin Features

**All Agent features, plus**:

**Team Management**:
- View all team members
- Track team productivity
- View team member activity logs

**Quality Control**:
- Review student records
- Verify document uploads
- Check data compliance

**Reporting & Analytics**:
- Team performance dashboard
- Revenue analysis
- Student success rates
- Custom report builder

---

### Fulfilment Executive Features

**Dashboard**:
- Loans pending approval across all consultants
- Document verification queue
- Disbursement status
- System-wide analytics

**Loan Processing**:
- View all loan applications
- Approve/reject with remarks
- Set approved amount
- Calculate EMI
- Assign to disbursement partner

**Document Verification**:
- Queue of pending documents
- Verification workflow
- Issue resolution tracking
- Compliance audit logs

**Reimbursement Management**:
- Process reimbursement requests
- Track approval status
- Process payments

**Prepaid Card Management**:
- Issue prepaid cards
- Track balance and usage
- Freeze/unblock cards

**Analytics & Reporting**:
- Loan approval rates
- Average processing time
- Document rejection reasons
- Fulfillment metrics

---

### Super Admin Features

**Consultant Management**:
- Onboard new consultants
- Configure tier/plan
- Enable/disable consultants
- View consultant analytics

**User Management**:
- Create/disable users
- Assign roles
- Reset passwords
- Audit login history

**System Configuration**:
- University & program database
- Bank partner integration
- Email templates
- SMS configuration

**Audit & Compliance**:
- Complete activity logs
- Data export for compliance
- Access controls audit
- System health monitoring

---

## Phase Documentation

### Phase 1: Foundation & Authentication ✅
**Duration**: Weeks 1-2  
**Deliverables**:
- Keystone project setup
- Database connection
- Clerk authentication integration
- Basic Admin panel
- Initial schema

**Links**:
- [Phase 1: Foundation & Authentication](./PHASE_1_FOUNDATION.md)

---

### Phase 2: Core Schema & Data Model 🔄
**Duration**: Weeks 3-4  
**Deliverables**:
- 13 core entities with relationships
- Multi-tenant access control
- GraphQL API auto-generation
- Redis caching
- Seed data

**Related Documentation**:
- [Phase 2: Core Schema & Data Model](./PHASE_2_SCHEMA.md)
- [Appendix A: Database Schema](./APPENDIX_DATABASE.md)
- [Appendix B: GraphQL API Reference](./APPENDIX_GRAPHQL_API.md)

---

### Phase 3: Consultant Portal UI
**Duration**: Weeks 5-7  
**Deliverables**:
- Next.js project setup
- Clerk authentication integration
- Dashboard page
- Student CRUD pages
- Application management
- Loan application flow
- Document upload

**Components**: Dashboard, DataTable, Forms, Cards, Modals

---

### Phase 4: Fulfilment Portal UI
**Duration**: Weeks 8-10  
**Deliverables**:
- Fulfilment dashboard
- Loan approval workflow
- Document verification queue
- Reimbursement processing
- Prepaid card management
- Analytics dashboards

**Components**: Kanban boards, Charts, Approval workflows

---

### Phase 5: Integration & Advanced Features
**Duration**: Weeks 11-12  
**Deliverables**:
- Bank partner integrations
- Disbursement workflows
- Email notifications
- SMS alerts
- Bulk operations
- Advanced reporting
- API webhooks

---

### Phase 6: Testing, Optimization & Launch
**Duration**: Weeks 13-14  
**Deliverables**:
- End-to-end testing
- Performance optimization
- Security audit
- Documentation
- Training materials
- Production deployment

---

## Component Guide

### ShadCN Components Used Throughout Platform

#### Data Display
- **Table** - Student lists, loan tables, activity logs
- **Pagination** - Navigate large datasets
- **Badge** - Status indicators (loan status, verification status)
- **Progress** - Loan approval progress, document upload progress

#### Forms & Input
- **Button** - All CTA buttons (primary, secondary, destructive)
- **Input** - Text fields in forms
- **Select** - Dropdown selections (country, university, status)
- **Checkbox** - Multi-select options
- **RadioGroup** - Mutually exclusive choices
- **Textarea** - Multi-line remarks and notes
- **Form** - Form wrapper with validation

#### Layout & Organization
- **Card** - Section containers, dashboard cards
- **Tabs** - View switching (profile, applications, loans)
- **Accordion** - Collapsible sections
- **Dialog/Modal** - Confirmation dialogs, edit forms
- **Sheet/Drawer** - Side panel for details

#### Feedback & Status
- **Alert** - Error/warning messages
- **Toast** - Notifications for actions
- **Spinner/Loader** - Loading states
- **Skeleton** - Content placeholders

#### Navigation
- **Sidebar** - Main navigation menu
- **Breadcrumb** - Navigation hierarchy
- **Dropdown Menu** - User menu, action menus

#### Data Visualization
- **Chart** (using Recharts integration) - Dashboards, reports

See [Appendix C: ShadCN Components Reference](./APPENDIX_SHADCN.md) for detailed examples.

---

## Key Workflows

### Workflow 1: Student Onboarding

```
Consultant Agent
│
├─ 1. Create new student record
│    ├─ Personal details
│    ├─ Country of residence
│    └─ Target country
│
├─ 2. Add student documents
│    ├─ Upload passport
│    ├─ Upload academic transcripts
│    └─ Mark as pending verification
│
├─ 3. Create application
│    ├─ Select university & program
│    ├─ Add test scores (GRE, GMAT, IELTS)
│    └─ Set status to draft
│
└─ 4. Track progress
     ├─ Application submitted
     ├─ Under review
     └─ Accepted / Rejected

Fulfilment Exec
└─ Verify documents → Update verification status
```

### Workflow 2: Loan Processing

```
Consultant Agent
│
├─ 1. Create loan application
│    ├─ Specify loan amount needed
│    ├─ Select tenure
│    └─ Add consultant remarks
│
├─ 2. Upload loan documents
│    ├─ Co-applicant details
│    ├─ Income certificate
│    └─ Collateral documents
│
└─ 3. Submit for approval
     └─ Status: "Under Review"

Fulfilment Exec
│
├─ 1. Review application
│    ├─ Verify documents
│    ├─ Check student eligibility
│    └─ Calculate EMI
│
├─ 2. Approve/Reject
│    ├─ Set approved amount
│    ├─ Set interest rate
│    └─ Add remarks
│
└─ 3. Disburse funds
     ├─ Create prepaid card
     ├─ Load approved amount
     └─ Send disbursement confirmation
```

### Workflow 3: Document Verification

```
Consultant Agent
├─ Upload document (Passport, Transcripts, etc.)
└─ Mark as "Pending Verification"

Fulfilment Exec
├─ 1. View pending documents queue
├─ 2. Download and review
├─ 3. Approve or Request Resubmission
│    ├─ If approved → Mark as "Verified"
│    └─ If rejected → Add remarks and re-request
├─ 4. Update verification status
└─ 5. Trigger downstream workflows (loan approval, etc.)

Consultant Agent
└─ Receive notification and follow up
```

---

## Authentication & Access Control

### Clerk Integration Points

```
┌─────────────────────────────────────┐
│   Consultant Portal / Portal UI      │
└─────────────────────────────────────┘
           │
    ┌──────▼──────────────────┐
    │  Clerk Auth Provider    │
    │  - ClerkProvider        │
    │  - SignedIn/SignedOut   │
    │  - useAuth() hook       │
    │  - useUser() hook       │
    └──────┬──────────────────┘
           │
    ┌──────▼──────────────────────────┐
    │  Set Session Data in context    │
    │  - userId                       │
    │  - email                        │
    │  - org_id (tenant)              │
    │  - role (from custom claims)    │
    └──────┬──────────────────────────┘
           │
    ┌──────▼──────────────────────────┐
    │  Apollo Client Auth Middleware  │
    │  - Attach JWT to headers        │
    │  - Send in Authorization header │
    └──────┬──────────────────────────┘
           │
    ┌──────▼──────────────────────────┐
    │  KeystoneJS Validation         │
    │  - Extract from headers        │
    │  - Validate JWT signature      │
    │  - Populate context.session    │
    │  - Apply access rules          │
    └──────┬──────────────────────────┘
           │
    ┌──────▼──────────────────────────┐
    │  GraphQL Resolver              │
    │  - Check permissions           │
    │  - Apply filters               │
    │  - Return authorized data      │
    └──────────────────────────────────┘
```

### Role-Based Access Rules

#### Super Admin
- Full system access
- Can view all tenants
- Can manage users across all tenants
- Can configure system settings

#### Fulfilment
- Cross-tenant access to loans and documents
- Cannot create students (consultants only)
- Can view all applications and documents
- Can approve/reject/disburse loans
- Can verify documents

#### Consultant Admin
- Own tenant only
- Can manage team members
- Can view all students in tenant
- Can add/edit/delete within tenant
- Cannot approve loans (fulfilment only)

#### Consultant Agent
- Own tenant only
- Can create/edit students assigned to them
- Cannot approve loans
- Cannot verify documents (fulfilment only)
- Can view own students and applications

---

## Database Connection & Usage

### Connection String Format

```bash
# PostgreSQL (recommended)
DATABASE_URL=postgresql://user:password@host:5432/abroadkart

# MongoDB
DATABASE_URL=mongodb+srv://user:password@cluster.mongodb.net/abroadkart

# Environment variables
export DATABASE_URL=...
export REDIS_URL=redis://localhost:6379
export CLERK_SECRET_KEY=...
export S3_BUCKET_NAME=...
```

### Keystone Configuration

```typescript
// keystone.ts
export default config({
  db: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL,
    enableLogging: process.env.NODE_ENV === 'development',
  },
  
  graphql: {
    path: '/api/graphql',
    apolloConfig: {
      // Cache plugin, authentication
    },
  },
  
  storage: {
    student_documents: {
      kind: 's3',
      type: 'file',
      bucketName: process.env.S3_BUCKET_NAME,
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_KEY,
    },
  },
});
```

### Usage Examples

**Query students (automatically filtered by tenant)**:
```typescript
// Client code
const { data } = await client.query({
  query: GET_STUDENTS,
  variables: { tenantId: session.tenant.id }
});

// KeystoneJS access rule
filter: {
  query: filterByTenant // Auto-applies WHERE tenant_id = session.tenant.id
}
```

**Create student (auto-assign tenant)**:
```typescript
const { data } = await client.mutate({
  mutation: CREATE_STUDENT,
  variables: {
    fullName: "John Doe",
    email: "john@example.com",
    // tenant is auto-assigned from session
  }
});
```

---

## ShadCN Components Summary

### Core Components by Page

**Consultant Dashboard**:
- Sidebar (navigation)
- Card (metric cards)
- Stat Counter
- BarChart (conversion funnel)
- Table (recent students)
- Button (action CTA)

**Student Management**:
- Tabs (profile, applications, loans)
- Table (student list)
- Form (create/edit student)
- Input, Select, Textarea (form fields)
- Badge (status indicators)
- Dialog (confirm delete)

**Loan Management**:
- Kanban (loan status workflow)
- Card (loan details)
- Progress (approval progress)
- Button (actions: approve, reject, disburse)
- Toast (action feedback)

**Document Management**:
- Table (document list)
- Badge (verification status)
- Dropzone (upload)
- Dialog (preview)

**Fulfilment Dashboard**:
- LineChart (approval trends)
- BarChart (lender distribution)
- Table (pending approvals)
- Alert (high-priority items)

---

## Appendices

### Appendix A: Database Schema
Complete schema for all 13 entities with relationships, field definitions, and access control.

**Document**: [APPENDIX_DATABASE.md](./APPENDIX_DATABASE.md)

**Contents**:
- User entity with roles
- Consultant (tenant) entity
- Student entity with relationships
- Application & Program entities
- LoanApplication entity
- Document verification
- Accommodation & Reimbursement
- PrepaidCard & Task
- ActivityLog (audit trail)

---

### Appendix B: GraphQL API Reference
Complete GraphQL API with examples for queries, mutations, subscriptions, filtering, and pagination.

**Document**: [APPENDIX_GRAPHQL_API.md](./APPENDIX_GRAPHQL_API.md)

**Contents**:
- Student queries with filtering
- Application queries
- Loan queries with analytics
- All mutations (create, update, approve, disburse)
- Subscription examples
- Error handling
- Batch operations
- Pagination & sorting

---

### Appendix C: ShadCN Components Reference
Detailed guide to all ShadCN components used, with examples, props, and customization.

**Document**: [APPENDIX_SHADCN.md](./APPENDIX_SHADCN.md) *(Create next)*

**Contents**:
- Component library overview
- Data display components
- Form components
- Layout components
- Navigation components
- Feedback components
- Data visualization
- Accessibility features
- Theming & customization

---

### Appendix D: Clerk Integration Guide
Step-by-step Clerk setup for both KeystoneJS and Next.js.

**Document**: [APPENDIX_CLERK_SETUP.md](./APPENDIX_CLERK_SETUP.md) *(Create next)*

**Contents**:
- Clerk organization setup
- JWT configuration
- KeystoneJS middleware
- Next.js authentication
- Role & organization sync
- Session management

---

### Appendix E: Deployment & DevOps
Infrastructure setup, Docker containerization, and CI/CD pipeline.

**Document**: [APPENDIX_DEPLOYMENT.md](./APPENDIX_DEPLOYMENT.md) *(Create next)*

**Contents**:
- Docker setup
- Kubernetes manifests
- GitHub Actions CI/CD
- Database migrations
- Redis setup
- Environment management
- Monitoring setup

---

## Implementation Roadmap

```
Week 1-2:    Phase 1 - Foundation
             ├─ KeystoneJS setup
             ├─ Clerk authentication
             └─ Basic admin panel
                      │
Week 3-4:    Phase 2 - Core Schema
             ├─ 13 entities
             ├─ Access control
             ├─ GraphQL API
             └─ Redis caching
                      │
Week 5-7:    Phase 3 - Consultant Portal
             ├─ Dashboard
             ├─ Student CRUD
             ├─ Applications
             └─ Loans UI
                      │
Week 8-10:   Phase 4 - Fulfilment Portal
             ├─ Loan approval UI
             ├─ Document verification
             ├─ Disbursement workflow
             └─ Analytics
                      │
Week 11-12:  Phase 5 - Integrations
             ├─ Bank integrations
             ├─ Email/SMS
             ├─ Webhooks
             └─ Advanced features
                      │
Week 13-14:  Phase 6 - Launch
             ├─ Testing
             ├─ Optimization
             ├─ Security audit
             └─ Production deployment
```

---

## Success Metrics

### Functional Metrics
- ✅ All user workflows complete
- ✅ API response time < 500ms
- ✅ 99.9% uptime SLA
- ✅ All access control rules enforced
- ✅ Multi-tenancy isolation verified

### User Metrics
- Consultant adoption rate > 80%
- Average task time < 2 minutes
- Loan approval turnaround < 24 hours
- Document verification accuracy > 95%

### Business Metrics
- Cost per transaction < target
- Consultant revenue growth > 30%
- Customer satisfaction > 4.5/5
- Support ticket volume < 5%

---

## Security & Compliance

### Data Security
- Encryption at rest (DB + storage)
- Encryption in transit (TLS 1.3)
- Key management via AWS KMS / Vault
- Regular security audits

### Access Control
- Role-based access control (RBAC)
- Multi-tenant isolation
- Audit logging for all operations
- Session timeout (30 min)

### Compliance
- GDPR compliance for EU consultants
- Data retention policies
- Right to deletion (soft deletes)
- Data export for users

---

## Support & Documentation

### Getting Started
1. Read [Phase 1: Foundation](./PHASE_1_FOUNDATION.md) first
2. Then proceed to [Phase 2: Core Schema](./PHASE_2_SCHEMA.md)
3. Reference [Appendix A: Database Schema](./APPENDIX_DATABASE.md) for entity details
4. Use [Appendix B: GraphQL API](./APPENDIX_GRAPHQL_API.md) for API examples

### Common Questions
- **Q: How do I add a new field to Student?**  
  A: Edit the Student List in `keystone.ts`, add field definition, run `npm run prisma migrate`

- **Q: How do I create a custom GraphQL query?**  
  A: KeystoneJS auto-generates queries for all Lists. Use filtering/sorting to customize.

- **Q: How do I enforce role-based access?**  
  A: Use access rules in List configuration. See Appendix A for examples.

- **Q: Where do I upload documents?**  
  A: S3 storage configured in `keystone.ts` storage config.

---

## Contact & Escalation

- **Technical Issues**: [GitHub Issues]()
- **Feature Requests**: [GitHub Discussions]()
- **Support Email**: [support@abroadkart.com]()
- **Architecture Questions**: [Your email]()

---

**Last Updated**: January 18, 2026  
**Next Review**: February 1, 2026  
**Version**: 1.0
