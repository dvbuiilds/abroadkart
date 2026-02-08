/**
 * KeystoneJS schema definitions
 * Phase 1: Minimal schema with User and Consultant lists
 */

import { list } from "@keystone-6/core";
import {
  text,
  relationship,
  checkbox,
  timestamp,
  select,
} from "@keystone-6/core/fields";
import { isAuthenticated, isSuperAdmin } from "../access/rules";

// User list (maps to Clerk)
export const User = list({
  access: {
    operation: {
      query: ({ session }) => isAuthenticated(session),
      create: () => false, // Created via Clerk webhook only
      update: ({ session }) => isAuthenticated(session),
      delete: () => false,
    },
    filter: {
      query: ({ session }) => {
        // Super admin and fulfilment can see all users
        if (isSuperAdmin(session) || session?.data?.role === "fulfilment") {
          return true;
        }
        // Consultants can only see users in their tenant
        if (session?.data?.tenantId) {
          return { tenant: { id: { equals: session.data.tenantId } } };
        }
        return false;
      },
    },
  },
  fields: {
    clerkUserId: text({
      validation: { isRequired: true },
      isIndexed: "unique",
      isFilterable: true,
    }),
    email: text({
      validation: { isRequired: true },
      isIndexed: "unique",
      isFilterable: true,
    }),
    name: text({ validation: { isRequired: false } }),
    role: select({
      type: "string",
      options: [
        { label: "Super Admin", value: "superAdmin" },
        { label: "Fulfilment", value: "fulfilment" },
        { label: "Consultant Admin", value: "consultantAdmin" },
        { label: "Consultant Agent", value: "consultantAgent" },
      ],
      defaultValue: "consultantAgent",
      validation: { isRequired: true },
      isIndexed: true,
    }),
    tenant: relationship({
      ref: "Consultant.users",
      many: false,
      isFilterable: true,
    }),
    isActive: checkbox({ defaultValue: true }),
    createdAt: timestamp({
      defaultValue: { kind: "now" },
      validation: { isRequired: false },
    }),
    updatedAt: timestamp({
      defaultValue: { kind: "now" },
      db: { updatedAt: true },
      validation: { isRequired: false },
    }),
  },
});

// Consultant list (minimal for Phase 1)
export const Consultant = list({
  access: {
    operation: {
      query: ({ session }) => isAuthenticated(session),
      create: ({ session }) => isSuperAdmin(session),
      update: ({ session }) => isAuthenticated(session),
      delete: () => false,
    },
    filter: {
      query: ({ session }) => {
        // Super admin and fulfilment can see all consultants
        if (isSuperAdmin(session) || session?.data?.role === "fulfilment") {
          return true;
        }
        // Consultants can only see their own tenant
        if (session?.data?.tenantId) {
          return { id: { equals: session.data.tenantId } };
        }
        return false;
      },
    },
  },
  fields: {
    name: text({ validation: { isRequired: true } }),
    slug: text({
      validation: { isRequired: true },
      isIndexed: "unique",
      isFilterable: true,
    }),
    contactEmail: text({
      validation: { isRequired: false },
      isFilterable: true,
    }),
    status: select({
      type: "string",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Suspended", value: "suspended" },
      ],
      defaultValue: "active",
      validation: { isRequired: true },
      isIndexed: true,
    }),
    users: relationship({
      ref: "User.tenant",
      many: true,
    }),
    createdAt: timestamp({
      defaultValue: { kind: "now" },
      validation: { isRequired: false },
    }),
    updatedAt: timestamp({
      defaultValue: { kind: "now" },
      db: { updatedAt: true },
      validation: { isRequired: false },
    }),
  },
});

export const lists = {
  User,
  Consultant,
};
