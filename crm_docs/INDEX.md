# 📋 Abroad Kart - Documentation Index

**Version**: 1.1  
**Status**: Complete  
**Last Updated**: February 2026

---

## 🎯 Quick Start

**New to the project?** Start here:

1. **Read First**: [Master Requirements Document](./REQUIREMENTS_MASTER.md)
2. **Phase 1**: [Foundation & Authentication](./PHASE_1_FOUNDATION.md)
3. **Phase 2**: [Core Schema & Data Model](./PHASE_2_SCHEMA.md)

---

## 📚 Complete Documentation Structure

### Main Documents

```
Abroad Kart Web Application
│
├─ 📄 REQUIREMENTS_MASTER.md (START HERE)
│  ├─ Executive Summary
│  ├─ Project Overview
│  ├─ Architecture Diagram
│  ├─ Tech Stack
│  ├─ Core Features by Role
│  ├─ Phase Documentation Links
│  ├─ Component Guide
│  └─ All Appendices Listed
│
├─ 📄 PHASE_1_FOUNDATION.md (Weeks 1-2) ✅
│  ├─ Keystone Setup
│  ├─ Database Connection
│  ├─ better-auth authentication
│  ├─ Admin Panel
│  └─ Testing Strategy
│
├─ 📄 PHASE_2_SCHEMA.md (Weeks 3-4) ✅
│  ├─ Multi-Tenant Architecture
│  ├─ All 13 Core Entities
│  ├─ Access Control Rules
│  ├─ Hooks & Auto-Assignment
│  ├─ Caching Strategy
│  ├─ GraphQL API
│  └─ Seed Data
│
├─ 📄 PHASE_3_CONSULTANT_PORTAL.md (Weeks 5-7) ✅
│  ├─ Next.js Setup
│  ├─ Dashboard Design
│  ├─ Student Management UI
│  ├─ Application Workflow
│  ├─ Loan Management UI
│  └─ Component Examples
├─ 📄 PHASE3_PROGRESS.md ✅
│  ├─ Patterns (React Query, URL filters, dialogs)
│  ├─ Component layout & known limits
│  └─ Testing checklist
│
├─ 📄 PHASE_4_FULFILMENT_PORTAL.md (Weeks 8-10) ⏳
│  ├─ Fulfilment Dashboard
│  ├─ Loan Approval Workflow
│  ├─ Document Verification Queue
│  ├─ Disbursement Management
│  └─ Analytics Dashboards
│
└─ ... (More phases to follow)
```

---

## 📑 Appendices

### Appendix A: Database Schema

**File**: `APPENDIX_DATABASE.md`

Complete schema definitions for all 13 entities:

- User, Consultant, Student, StudentDocument
- University, Program, Application
- LoanApplication, AccommodationBooking
- Reimbursement, PrepaidCard
- Task, ActivityLog

**Contains**:

- Full TypeScript entity definitions
- Access control rules per entity
- Relationships diagram
- Database indexes
- Migration guide

---

### Appendix B: GraphQL API Reference

**File**: `APPENDIX_GRAPHQL_API.md`

Complete GraphQL API with examples:

- 20+ query examples with variables
- 15+ mutation examples
- Subscription examples
- Filtering & pagination patterns
- Error handling
- Batch operations

---

### Appendix C: ShadCN Components Reference

**File**: `APPENDIX_SHADCN.md`

Complete guide to ShadCN UI components:

- **Data Display**: Table, Badge, Progress, Card
- **Forms**: Form, Input, Textarea, Select, Checkbox, RadioGroup
- **Layout**: Tabs, Accordion, Dialog, Sheet
- **Navigation**: Sidebar, Breadcrumb, DropdownMenu
- **Feedback**: Toast, Alert, Skeleton
- **Visualization**: Charts via Recharts
- **Accessibility** & **Theming** guides

**Each component includes**:

- Purpose & use cases
- Props & configuration
- Implementation examples
- Best practices

---

### Appendix D: better-auth integration

**File**: [APPENDIX_AUTH_SETUP.md](./APPENDIX_AUTH_SETUP.md)

Step-by-step better-auth setup:

- Same Postgres (`auth` schema + Keystone `public`)
- JWT + JWKS for Keystone
- Next.js routes and middleware
- Keystone session and Admin SSO
- Environment variables

---

### Appendix E: Keystone Admin Proxy

**File**: `ADMIN_PROXY.md`

better-auth + JWT proxy for Keystone Admin UI (superAdmin only):

- Architecture and request flow
- Files involved (admin page, proxy routes, admin-auth)
- Access control (middleware, document vs static asset checks)
- Troubleshooting: Content-Encoding, static assets, auth() usage, GraphQL proxy, middleware matcher

---

### Appendix F: Deployment & DevOps

**File**: [APPENDIX_DEPLOYMENT.md](./APPENDIX_DEPLOYMENT.md)

Docker, environments, CI/CD patterns, and related ops notes.

---

## 🔗 Document Relationships

```
REQUIREMENTS_MASTER.md
        ↓
        ├─→ PHASE_1_FOUNDATION.md
        │       ↓
        ├─→ PHASE_2_SCHEMA.md
        │   ├─→ APPENDIX_DATABASE.md
        │   └─→ APPENDIX_GRAPHQL_API.md
        │
        ├─→ PHASE_3_CONSULTANT_PORTAL.md
        │   ├─→ PHASE3_PROGRESS.md (Implementation & patterns)
        │   ├─→ APPENDIX_SHADCN.md
        │   └─→ REQUIREMENTS_MASTER.md (Component Guide)
        │
        ├─→ PHASE_4_FULFILMENT_PORTAL.md
        │   └─→ APPENDIX_SHADCN.md
        │
        ├─→ APPENDIX_AUTH_SETUP.md (For Auth)
        ├─→ ADMIN_PROXY.md (Keystone Admin + better-auth)
        ├─→ APPENDIX_DEPLOYMENT.md (For DevOps)
        └─→ APPENDIX_SHADCN.md (UI Components)
```

---

## 📋 Document Summary Table

| Document                  | Purpose                     | Status      | Weeks |
| ------------------------- | --------------------------- | ----------- | ----- |
| REQUIREMENTS_MASTER       | Project overview & spec     | ✅ Complete | -     |
| PHASE_1_FOUNDATION        | Setup & authentication      | ✅ Complete | 1-2   |
| PHASE_2_SCHEMA            | Data model & API            | ✅ Complete | 3-4   |
| APPENDIX_DATABASE         | Entity definitions          | ✅ Complete | -     |
| APPENDIX_GRAPHQL_API      | API examples                | ✅ Complete | -     |
| APPENDIX_SHADCN           | Component reference         | ✅ Complete | -     |
| PHASE_3_CONSULTANT_PORTAL | Consultant UI               | ✅ Complete | 5-7   |
| PHASE3_PROGRESS           | Phase 3 patterns & progress | ✅ Complete | -     |
| PHASE_4_FULFILMENT_PORTAL | Fulfilment UI               | ⏳ Next     | 8-10  |
| ADMIN_PROXY               | Keystone Admin proxy + better-auth | ✅ Complete | -     |
| REQUIREMENTS_SUPER_ADMIN_KEYSTONE_NATIVE | Super-admin native CMS + 3000 `/admin` | ✅ Complete | - |
| APPENDIX_AUTH_SETUP       | better-auth integration      | ✅ Complete | -     |
| APPENDIX_DEPLOYMENT       | DevOps & deployment         | ✅ Draft    | -     |

---

## 🎯 By Role

### Consultant Agent

**Read**:

- [PHASE_3_CONSULTANT_PORTAL.md](./PHASE_3_CONSULTANT_PORTAL.md)
- [PHASE3_PROGRESS.md](./PHASE3_PROGRESS.md) (Implementation summary & patterns)
- [APPENDIX_SHADCN.md](./APPENDIX_SHADCN.md) (Component examples)

**Reference**:

- [APPENDIX_GRAPHQL_API.md](./APPENDIX_GRAPHQL_API.md) (Query/mutation examples)

---

### Fulfilment Executive

**Read**:

- [PHASE_4_FULFILMENT_PORTAL.md](./PHASE_4_FULFILMENT_PORTAL.md)
- [APPENDIX_SHADCN.md](./APPENDIX_SHADCN.md) (Component examples)

**Reference**:

- [APPENDIX_GRAPHQL_API.md](./APPENDIX_GRAPHQL_API.md) (Mutations for approvals)

---

### Backend Developer

**Read**:

- [PHASE_1_FOUNDATION.md](./PHASE_1_FOUNDATION.md) (Setup)
- [PHASE_2_SCHEMA.md](./PHASE_2_SCHEMA.md) (Architecture)

**Reference**:

- [APPENDIX_DATABASE.md](./APPENDIX_DATABASE.md) (All entities)
- [APPENDIX_GRAPHQL_API.md](./APPENDIX_GRAPHQL_API.md) (API generation)
- [ADMIN_PROXY.md](./ADMIN_PROXY.md) (Keystone Admin + better-auth proxy)
- [REQUIREMENTS_SUPER_ADMIN_KEYSTONE_NATIVE.md](./REQUIREMENTS_SUPER_ADMIN_KEYSTONE_NATIVE.md) (Super-admin on Keystone origin; `3000/admin` retained)

---

### Frontend Developer

**Read**:

- [PHASE_3_CONSULTANT_PORTAL.md](./PHASE_3_CONSULTANT_PORTAL.md) (UI)
- [APPENDIX_SHADCN.md](./APPENDIX_SHADCN.md) (Components)

**Reference**:

- [APPENDIX_GRAPHQL_API.md](./APPENDIX_GRAPHQL_API.md) (Queries/mutations)
- [REQUIREMENTS_MASTER.md](./REQUIREMENTS_MASTER.md) (Feature spec)

---

### DevOps / Infrastructure

**Read** _(When available)_:

- APPENDIX_DEPLOYMENT.md
- [APPENDIX_AUTH_SETUP.md](./APPENDIX_AUTH_SETUP.md) (for auth infrastructure)

---

### Project Manager

**Read**:

- [REQUIREMENTS_MASTER.md](./REQUIREMENTS_MASTER.md) (Overview & roadmap)
- Individual phase docs for timeline tracking

---

## 📖 How to Navigate

### Finding Information

**"I want to know about [X]"**

| Looking For          | Document             | Section                     |
| -------------------- | -------------------- | --------------------------- |
| System architecture  | REQUIREMENTS_MASTER  | Architecture                |
| Database schema      | APPENDIX_DATABASE    | Complete Entity Definitions |
| GraphQL queries      | APPENDIX_GRAPHQL_API | Query API                   |
| ShadCN components    | APPENDIX_SHADCN      | Data Display, Forms, etc    |
| Student workflow     | REQUIREMENTS_MASTER  | Key Workflows               |
| Phase timeline       | REQUIREMENTS_MASTER  | Implementation Roadmap      |
| Loan processing flow | REQUIREMENTS_MASTER  | Workflow 2: Loan Processing |
| Access control       | PHASE_2_SCHEMA       | Access Control Rules        |
| Authentication setup | PHASE_1_FOUNDATION   | better-auth setup           |
| Keystone Admin proxy | ADMIN_PROXY          | Architecture, Troubleshooting|
| Super-admin CMS split (3001 / 3000) | REQUIREMENTS_SUPER_ADMIN_KEYSTONE_NATIVE | Full spec |
| UI component example | APPENDIX_SHADCN      | Component sections          |

---

## 🔍 Cross-References

### Entity Cross-References

**Student Entity**:

- Defined in: APPENDIX_DATABASE.md
- Used in workflows: REQUIREMENTS_MASTER.md (Workflow 1)
- UI form: APPENDIX_SHADCN.md (Student Create Form)
- GraphQL: APPENDIX_GRAPHQL_API.md (Student Queries)

**LoanApplication Entity**:

- Defined in: APPENDIX_DATABASE.md
- Used in workflows: REQUIREMENTS_MASTER.md (Workflow 2)
- Access rules: PHASE_2_SCHEMA.md (Access Control Rules)
- UI: PHASE_4_FULFILMENT_PORTAL.md
- GraphQL: APPENDIX_GRAPHQL_API.md (Loan Queries/Mutations)

---

## ❓ FAQ - Document Location

**Q: Where do I find entity definitions?**  
A: APPENDIX_DATABASE.md - Complete Entity Definitions section

**Q: How do I write a GraphQL query?**  
A: APPENDIX_GRAPHQL_API.md - Query API section with examples

**Q: What ShadCN components should I use for the student list?**  
A: APPENDIX_SHADCN.md - Table component with StudentTable example

**Q: How does multi-tenancy work?**  
A: PHASE_2_SCHEMA.md - Core Principles & Multi-Tenancy Pattern section

**Q: What are the access control rules?**  
A: PHASE_2_SCHEMA.md - Access Control Rules section

**Q: How do I setup better-auth?**  
A: [APPENDIX_AUTH_SETUP.md](./APPENDIX_AUTH_SETUP.md)

**Q: How does the Keystone Admin proxy work with better-auth?**  
A: ADMIN_PROXY.md - Architecture, Access Control, Troubleshooting

**Q: What's the complete system architecture?**  
A: REQUIREMENTS_MASTER.md - Architecture section

**Q: How do I add a new field to an entity?**  
A: REQUIREMENTS_MASTER.md - Support & Documentation → Common Questions

---

## 📞 Getting Help

**Having trouble?** Check these docs in order:

1. **Common Questions**: REQUIREMENTS_MASTER.md → Support & Documentation
2. **Specific Section**: Find in Table of Contents of relevant doc
3. **Component Help**: APPENDIX_SHADCN.md → Component sections
4. **API Help**: APPENDIX_GRAPHQL_API.md → Examples
5. **Schema Help**: APPENDIX_DATABASE.md → Entity Definitions

---

## 🚀 Version History

| Version | Date         | Changes                                                                     |
| ------- | ------------ | --------------------------------------------------------------------------- |
| 1.0     | Jan 18, 2026 | Initial complete documentation for Phases 1-2 + Appendices A-C              |
| 1.1     | Feb 2026     | Phase 3 Consultant Portal complete; PHASE3_PROGRESS.md added; INDEX updated |
| 1.2     | Feb 2026     | Add ADMIN_PROXY.md (Keystone Admin proxy; auth migrated to better-auth Apr 2026) |
| 1.4     | Apr 2026     | Clerk removed; auth consolidated in [APPENDIX_AUTH_SETUP.md](./APPENDIX_AUTH_SETUP.md) |
| 1.3     | TBD          | Add Phase 4 documentation, Appendix D & E                                    |
| 2.0     | TBD          | Post-launch updates & improvements                                          |

---

## 🎓 Recommended Reading Order

### For Getting Started (30 min)

1. This document (INDEX.md) - 5 min
2. REQUIREMENTS_MASTER.md (Executive Summary + Architecture) - 15 min
3. PHASE_1_FOUNDATION.md (Overview section) - 10 min

### For Backend Development (2 hours)

1. REQUIREMENTS_MASTER.md (Architecture + Tech Stack) - 20 min
2. PHASE_1_FOUNDATION.md - 30 min
3. PHASE_2_SCHEMA.md - 30 min
4. APPENDIX_DATABASE.md - 20 min
5. APPENDIX_GRAPHQL_API.md (first 30 examples) - 20 min

### For Frontend Development (2 hours)

1. REQUIREMENTS_MASTER.md (Full document) - 30 min
2. APPENDIX_GRAPHQL_API.md (Query examples) - 20 min
3. APPENDIX_SHADCN.md - 40 min
4. PHASE_3_CONSULTANT_PORTAL.md (when available) - 30 min

### For DevOps (1 hour)

1. REQUIREMENTS_MASTER.md (Architecture + Tech Stack) - 15 min
2. APPENDIX_DEPLOYMENT.md (when available) - 30 min
3. [APPENDIX_AUTH_SETUP.md](./APPENDIX_AUTH_SETUP.md) - 15 min

---

**Last Updated**: February 2026  
**Next Update**: After Phase 4 completion  
**Maintained By**: Development Team
