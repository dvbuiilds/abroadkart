/**
 * LoanApplication - tenant-scoped. Status and fulfilment fields restricted to fulfilment role.
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
import {
  isAuthenticated,
  isConsultant,
  isFulfilment,
  filterByTenant,
} from "../access/rules";
import { autoSetTenantHook } from "../hooks/autoSetTenant";
import { afterOperationWithCache } from "../hooks/cacheInvalidation";

export const LoanApplication = list({
  access: {
    operation: {
      query: ({ session }) => isAuthenticated(session),
      create: ({ session }) => isConsultant({ session }),
      update: ({ session }) => isAuthenticated(session),
      delete: () => false,
    },
    filter: {
      query: filterByTenant,
      update: filterByTenant,
    },
  },
  fields: {
    tenant: relationship({
      ref: "Consultant.loanApplications",
      many: false,
    }),
    student: relationship({
      ref: "Student.loanApplications",
      many: false,
    }),
    application: relationship({
      ref: "Application",
      many: false,
    }),
    status: select({
      options: [
        { label: "Initiated", value: "initiated" },
        { label: "Documents Pending", value: "documentsPending" },
        { label: "Under Review", value: "underReview" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" },
        { label: "Disbursed", value: "disbursed" },
        { label: "Closed", value: "closed" },
      ],
      defaultValue: "initiated",
      isIndexed: true,
      access: {
        update: ({ session }) => isFulfilment({ session }),
      },
    }),
    loanAmountRequested: integer(),
    loanAmountApproved: integer({
      access: {
        update: ({ session }) => isFulfilment({ session }),
      },
    }),
    currency: text({ defaultValue: "INR" }),
    loanTenure: integer(),
    interestRate: decimal({
      access: {
        update: ({ session }) => isFulfilment({ session }),
      },
    }),
    emi: integer(),
    consultantRemarks: text({
      ui: { displayMode: "textarea" },
      access: {
        update: ({ session }) => isConsultant({ session }),
      },
    }),
    fulfilmentRemarks: text({
      ui: { displayMode: "textarea" },
      access: {
        read: ({ session }) => isAuthenticated(session),
        update: ({ session }) => isFulfilment({ session }),
      },
    }),
    approvedAt: timestamp({
      access: {
        update: ({ session }) => isFulfilment({ session }),
      },
    }),
    disburseDate: timestamp({
      access: {
        update: ({ session }) => isFulfilment({ session }),
      },
    }),
    assignedFulfilmentExec: relationship({
      ref: "User",
      many: false,
      access: {
        update: ({ session }) => isFulfilment({ session }),
      },
    }),
    documents: relationship({
      ref: "StudentDocument.loanApplication",
      many: true,
    }),
    isDeleted: checkbox({ defaultValue: false }),
    createdAt: timestamp({ defaultValue: { kind: "now" } }),
    updatedAt: timestamp({ db: { updatedAt: true } }),
  },
  hooks: {
    resolveInput: autoSetTenantHook("create"),
    afterOperation: afterOperationWithCache("loanApplications"),
  },
});
