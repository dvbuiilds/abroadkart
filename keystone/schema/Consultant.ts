/**
 * Consultant - tenant root. Only superAdmin can create/update/delete.
 */

import { list } from "@keystone-6/core";
import { text, relationship, timestamp, select } from "@keystone-6/core/fields";
import { isSuperAdmin, isFulfilment } from "../access/rules";
import { logActivityHook } from "../hooks/logActivity";

export const Consultant = list({
  access: {
    operation: {
      query: ({ session }) => {
        if (!session) return false;
        if (isSuperAdmin(session)) return true;
        if (isFulfilment({ session })) return true;
        return Boolean(session.tenantId);
      },
      create: ({ session }) => isSuperAdmin(session),
      update: ({ session }) => isSuperAdmin({ session }),
      delete: ({ session }) => isSuperAdmin({ session }),
    },
    filter: {
      query: ({ session }) => {
        if (!session) return false;
        if (isSuperAdmin(session)) return true;
        if (isFulfilment({ session })) return true;
        if (session.tenantId) return { id: { equals: session.tenantId } };
        return false;
      },
    },
  },
  fields: {
    name: text({ validation: { isRequired: true } }),
    slug: text({
      validation: { isRequired: true },
      isIndexed: "unique",
    }),
    contactEmail: text({
      validation: {
        isRequired: true,
        match: { regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      },
    }),
    contactPhone: text(),
    country: text({ defaultValue: "IN" }),
    city: text(),
    status: select({
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Suspended", value: "suspended" },
      ],
      defaultValue: "active",
    }),
    tier: select({
      options: [
        { label: "Starter", value: "starter" },
        { label: "Professional", value: "professional" },
        { label: "Enterprise", value: "enterprise" },
      ],
      defaultValue: "starter",
    }),
    users: relationship({ ref: "User.tenant", many: true }),
    students: relationship({ ref: "Student.tenant", many: true }),
    applications: relationship({ ref: "Application.tenant", many: true }),
    loanApplications: relationship({
      ref: "LoanApplication.tenant",
      many: true,
    }),
    accommodations: relationship({
      ref: "AccommodationBooking.tenant",
      many: true,
    }),
    reimbursements: relationship({ ref: "Reimbursement.tenant", many: true }),
    prepaidCards: relationship({ ref: "PrepaidCard.tenant", many: true }),
    tasks: relationship({ ref: "Task.tenant", many: true }),
    activityLogs: relationship({ ref: "ActivityLog.tenant", many: true }),
    createdAt: timestamp({ defaultValue: { kind: "now" } }),
    updatedAt: timestamp({ db: { updatedAt: true } }),
  },
  hooks: {
    afterOperation: logActivityHook.afterOperation,
  },
});
