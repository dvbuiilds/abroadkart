# AbroadKart CRM – Master Requirements Document

**Version:** 2.0 (Enhanced with Caching, UI, and Detailed Phases)  
**Date:** January 18, 2026  
**Product:** Multi-Tenant Study Abroad Consultant CRM with Central Fulfilment Platform

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Technology Stack Overview](#technology-stack-overview)
3. [System Architecture](#system-architecture)
4. [Phase-by-Phase Implementation Guide](#phase-by-phase-implementation-guide)
5. [Core Principles](#core-principles)
6. [Contact & Support](#contact--support)

---

## Executive Summary

AbroadKart CRM is a **multi-tenant B2B2C SaaS platform** enabling study abroad consultants to manage complete student lifecycles (onboarding → enrollment) while providing AbroadKart with centralized fulfilment capabilities for loans and accommodations.

### Key Stakeholders
- **Consultants (Tenants)**: Study abroad agencies managing students and requests
- **AbroadKart (Platform Owner)**: Fulfilment team processing loans and accommodations
- **Students (End Users)**: Applicants managed by consultants and processed by AbroadKart

### Core Value Propositions
- **For Consultants**: Single platform for student management with real-time status updates
- **For AbroadKart**: Centralized cross-tenant dashboard with full visibility and control
- **For Students**: Faster processing and transparency

---

## Technology Stack Overview

### Frontend Stack
- **Framework**: Next.js 14 (App Router, TypeScript)
- **UI Components**: ShadCN/UI (copy-paste Radix UI + TailwindCSS)
- **Client-Side Caching**: TanStack React Query (@tanstack/react-query)
- **Forms**: react-hook-form + zod validation
- **Tables**: @tanstack/react-table with ShadCN components
- **GraphQL Client**: graphql-request
- **Authentication**: @clerk/nextjs integration

### Backend Stack
- **Runtime**: Node.js 20 LTS
- **CMS/GraphQL API**: KeystoneJS 6.x
- **Database**: PostgreSQL 16.x
- **ORM**: Prisma (via Keystone)
- **Caching**: Redis (ioredis) + graphql-redis-cache
- **Authentication**: Clerk (JWT validation)
- **Storage**: Cloudflare R2 (S3-compatible)
- **Styling**: TailwindCSS 3.x

### Deployment Stack
- **Backend**: Railway / Render (Node.js + PostgreSQL)
- **Frontend**: Vercel / Railway (Next.js)
- **Database**: Railway PostgreSQL / Supabase (managed)
- **Cache**: Redis Cloud / Upstash (managed Redis)
- **Storage**: Cloudflare R2
- **Auth**: Clerk (managed)

---

## System Architecture

### Data Flow: Multi-Tenant Model
```
┌─────────────────────────────────────────┐
│    Consultant Tenant A (Company)        │
├─────────────────────────────────────────┤
│ Users: AgentA, AdminA                   │
│ Data: Students, Applications, Loans     │
│ All rows have tenant_id = TenantA       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│    Consultant Tenant B (Company)        │
├─────────────────────────────────────────┤
│ Users: AgentB, AdminB                   │
│ Data: Students, Applications, Loans     │
│ All rows have tenant_id = TenantB       │
└─────────────────────────────────────────┘

                    │
                    ▼
    ┌──────────────────────────────┐
    │  Centralized PostgreSQL DB   │
    │  (Shared Schema Pattern)     │
    │  All data with tenant_id     │
    └──────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
    Redis      Logs/Events  Backups
    Cache
```

### 3-Tier Caching Strategy
```
┌─────────────────────────────────────────────────┐
│   Frontend (Next.js App)                         │
│   TanStack React Query - Client Cache           │
│   (1-5 min TTL per query type)                  │
└────────────────────┬────────────────────────────┘
                     │
                     ▼ GraphQL Requests
┌─────────────────────────────────────────────────┐
│   KeystoneJS + GraphQL API                      │
│   1. graphql-redis-cache (full query cache)     │
│   2. Resolver-level cache (expensive ops)       │
│   3. Hooks invalidate on mutations              │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│   PostgreSQL + Redis                            │
│   Database queries + indexed lookups            │
└─────────────────────────────────────────────────┘
```

---

## Phase-by-Phase Implementation Guide

### Phase Breakdown

This project is divided into **6 implementation phases**. Each phase has its own detailed specification document.

| Phase | Duration | Focus | Document |
|-------|----------|-------|----------|
| **Phase 1** | Weeks 1-2 | Foundation, Infrastructure, Auth | [Phase 1: Foundation & Infrastructure](./PHASE_1_FOUNDATION.md) |
| **Phase 2** | Weeks 3-4 | Core Schema, Multi-Tenancy, GraphQL | [Phase 2: Core Schema & Data Model](./PHASE_2_SCHEMA.md) |
| **Phase 3** | Weeks 5-7 | Consultant Portal UI & Features | [Phase 3: Consultant Portal](./PHASE_3_CONSULTANT_PORTAL.md) |
| **Phase 4** | Weeks 8-10 | AbroadKart Admin Portal & Fulfilment | [Phase 4: Admin Portal](./PHASE_4_ADMIN_PORTAL.md) |
| **Phase 5** | Weeks 11-12 | Testing, Security, Performance, Polish | [Phase 5: Hardening & Testing](./PHASE_5_HARDENING.md) |
| **Phase 6** | Week 13+ | Production Launch & Support | [Phase 6: Production & Launch](./PHASE_6_LAUNCH.md) |

### How to Use This Documentation

1. **Start with this master document** to understand the overall architecture.
2. **Follow each phase sequentially** using the linked documents.
3. **Each phase document includes**:
   - Detailed tasks and deliverables
   - Code examples and setup instructions
   - Database schemas and GraphQL APIs
   - UI components and wireframes
   - Testing checklist
4. **Use this master doc as a reference** for cross-phase concerns (auth, caching, access control).

---

## Core Principles

### Multi-Tenancy
- **Pattern**: Shared database, shared schema with `tenant_id` column on all business entities
- **Why**: Simplest to build, best for reporting, scales to thousands of tenants
- **Enforcement**: All queries filtered by session user's tenant (via KeystoneJS access rules)

### Authentication (Clerk)
- **Flow**: User signs in via Clerk → Keystone creates/updates User record → maps clerkUserId → resolves role + tenant
- **JWT Validation**: Every GraphQL request includes Clerk JWT; KeystoneJS custom session validates it
- **Roles**: `consultantAdmin`, `consultantAgent`, `fulfilment`, `superAdmin`

### Authorization (Access Control)
- **Consultant Roles**: See only their own tenant's data
- **Fulfilment Roles**: Cross-tenant access for loans, accommodations, reimbursements
- **Field-Level**: Some fields writable only by fulfilment (e.g., `fulfilmentRemarks`)
- **Implementation**: Keystone `access` rules + hooks for audit logging

### Caching Strategy
- **Client (React Query)**: Query cache 1-5 min, stale time varies by entity
- **Backend (Redis)**: GraphQL query cache 2-10 min, resolver cache 5-15 min
- **Invalidation**: Keystone hooks invalidate Redis keys on mutations
- **TTLs**: Aggressive for stable data (programs 1hr), aggressive for volatile data (loans 30sec)

### API Protocol
- **GraphQL**: All data operations via Keystone GraphQL endpoint
- **No REST endpoints**: Use GraphQL for consistency and caching benefits

---

## Contact & Support

For questions or clarifications during development:
- **Email**: [your-email@abroadkart.com]
- **GitHub Issues**: Raise questions as GitHub issues in the repo
- **Documentation**: Refer to phase documents for specific details

---

## Quick Start for Cursor AI

1. **Review this master document** for overall architecture.
2. **Start with Phase 1**: [Phase 1: Foundation & Infrastructure](./PHASE_1_FOUNDATION.md)
3. **Proceed sequentially** through phases 2-6.
4. **Use cross-references** between documents (links above).
5. **Raise issues** for any unclear requirements.

---

## File Structure

```
docs/
├── README.md (this file)
├── PHASE_1_FOUNDATION.md
├── PHASE_2_SCHEMA.md
├── PHASE_3_CONSULTANT_PORTAL.md
├── PHASE_4_ADMIN_PORTAL.md
├── PHASE_5_HARDENING.md
├── PHASE_6_LAUNCH.md
├── APPENDIX_SHADCN_COMPONENTS.md
├── APPENDIX_GRAPHQL_API.md
├── APPENDIX_DATABASE_SCHEMA.md
└── APPENDIX_CLERK_AUTH.md
```

---

**Last Updated**: January 18, 2026  
**Next**: Proceed to [Phase 1: Foundation & Infrastructure](./PHASE_1_FOUNDATION.md)
