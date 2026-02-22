/**
 * User - maps to Clerk. Created via webhook; role/tenant updated by superAdmin.
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
import { logActivityHook } from "../hooks/logActivity";

export const User = list({
  access: {
    operation: {
      query: ({ session }) => isAuthenticated(session),
      create: ({ session }) => isSuperAdmin(session),
      update: ({ session }) => isAuthenticated(session),
      delete: ({ session }) => isSuperAdmin(session),
    },
    filter: {
      query: ({ session }) => {
        if (!session) return false;
        if (isSuperAdmin(session) || session.role === "fulfilment") return true;
        if (session.tenantId)
          return { tenant: { id: { equals: session.tenantId } } };
        // Consultant without tenant: allow seeing own record (for GET_CURRENT_USER)
        return { id: { equals: session.id } };
      },
    },
    item: {
      update: (args) => {
        const session = args.session;
        if (!session) return false;
        if (isSuperAdmin(session)) return true;
        // Users can update their own profile
        const item = (args as { item?: { id?: unknown } }).item;
        if (!item?.id) return false;
        return session.id === String(item.id);
      },
    },
  },
  fields: {
    clerkUserId: text({
      validation: { isRequired: true },
      isIndexed: "unique",
    }),
    email: text({
      validation: {
        isRequired: true,
        match: { regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      },
      isIndexed: "unique",
    }),
    name: text({ validation: { isRequired: false } }),
    role: select({
      options: [
        { label: "Super Admin", value: "superAdmin" },
        { label: "Fulfilment", value: "fulfilment" },
        { label: "Consultant Admin", value: "consultantAdmin" },
        { label: "Consultant Agent", value: "consultantAgent" },
      ],
      validation: { isRequired: true },
      defaultValue: "consultantAgent",
      access: {
        update: ({ session }) => isSuperAdmin({ session }),
      },
    }),
    tenant: relationship({
      ref: "Consultant.users",
      many: false,
      access: {
        create: ({ session }) => isSuperAdmin({ session }),
        update: ({ session }) => isSuperAdmin({ session }),
      },
    }),
    isActive: checkbox({ defaultValue: true }),
    lastLoginAt: timestamp(),
    createdAt: timestamp({ defaultValue: { kind: "now" } }),
    updatedAt: timestamp({ db: { updatedAt: true } }),
  },
  graphql: {
    plural: "Users",
  },
  hooks: {
    afterOperation: logActivityHook.afterOperation,
  },
});
