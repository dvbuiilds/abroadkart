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
  file,
} from "@keystone-6/core/fields";
import { isAuthenticated, isConsultant, isSuperAdmin, isFulfilment, filterByTenant } from "../access/rules";
import { autoSetTenantHook } from "../hooks/autoSetTenant";
import { logActivityHook } from "../hooks/logActivity";

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
        { label: "Offer Received", value: "offerReceived" },
        { label: "Conditional", value: "conditional" },
        { label: "Accepted", value: "accepted" },
        { label: "Rejected", value: "rejected" },
        { label: "Deferred", value: "deferred" },
      ],
      defaultValue: "draft",
      isIndexed: true,
    }),
    applicationDate: timestamp(),
    responseDate: timestamp(),
    gre: integer(),
    gmat: integer(),
    gpa: decimal(),
    offerLetter: file({
      storage: "offer_letters",
    }),
    conditionalRequirements: text({
      ui: { displayMode: "textarea" },
    }),
    tuitionFeeOffered: integer(),
    scholarshipAwarded: integer(),
    documents: relationship({ ref: "StudentDocument.application", many: true }),
    remarks: text({ ui: { displayMode: "textarea" } }),
    isDeleted: checkbox({ defaultValue: false }),
    createdAt: timestamp({ defaultValue: { kind: "now" } }),
    updatedAt: timestamp({ db: { updatedAt: true } }),
  },
  hooks: {
    resolveInput: autoSetTenantHook("create"),
    afterOperation: logActivityHook.afterOperation,
  },
});
