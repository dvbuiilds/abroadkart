/**
 * Application - student's application to a program. Tenant-scoped.
 */

import { list } from "@keystone-6/core";
import {
  text,
  relationship,
  checkbox,
  timestamp,
  select,
  integer,
  decimal,
} from "@keystone-6/core/fields";
import { isAuthenticated, isConsultant, isSuperAdmin, isFulfilment, filterByTenant } from "../access/rules";
import { autoSetTenantHook } from "../hooks/autoSetTenant";
import { afterOperationWithCache } from "../hooks/cacheInvalidation";

export const Application = list({
  access: {
    operation: {
      query: ({ session }) => isAuthenticated(session),
      create: ({ session }) =>
        isConsultant({ session }) || isSuperAdmin({ session }) || isFulfilment({ session }),
      update: ({ session }) => isAuthenticated(session),
      delete: ({ session }) => isSuperAdmin(session),
    },
    filter: {
      query: filterByTenant,
      update: filterByTenant,
    },
  },
  fields: {
    tenant: relationship({
      ref: "Consultant.applications",
      many: false,
    }),
    student: relationship({
      ref: "Student.applications",
      many: false,
    }),
    program: relationship({
      ref: "Program.applications",
      many: false,
    }),
    status: select({
      options: [
        { label: "Draft", value: "draft" },
        { label: "Submitted", value: "submitted" },
        { label: "Under Review", value: "underReview" },
        { label: "Waitlisted", value: "waitlisted" },
        { label: "Accepted", value: "accepted" },
        { label: "Rejected", value: "rejected" },
      ],
      defaultValue: "draft",
      isIndexed: true,
    }),
    applicationDate: timestamp(),
    responseDate: timestamp(),
    gre: integer(),
    gmat: integer(),
    gpa: decimal(),
    documents: relationship({ ref: "StudentDocument.application", many: true }),
    remarks: text({ ui: { displayMode: "textarea" } }),
    isDeleted: checkbox({ defaultValue: false }),
    createdAt: timestamp({ defaultValue: { kind: "now" } }),
    updatedAt: timestamp({ db: { updatedAt: true } }),
  },
  hooks: {
    resolveInput: autoSetTenantHook("create"),
    afterOperation: afterOperationWithCache("applications"),
  },
});
