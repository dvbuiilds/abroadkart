/**
 * Reimbursement - tenant-scoped. Status/approvedAt/reimbursedAt updated by fulfilment.
 */

import { list } from "@keystone-6/core";
import {
  text,
  relationship,
  timestamp,
  select,
  integer,
  file,
} from "@keystone-6/core/fields";
import {
  isAuthenticated,
  isConsultant,
  isFulfilment,
  filterByTenant,
} from "../access/rules";
import { autoSetTenantHook } from "../hooks/autoSetTenant";
import { afterOperationWithCache } from "../hooks/cacheInvalidation";

export const Reimbursement = list({
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
      ref: "Consultant.reimbursements",
      many: false,
    }),
    student: relationship({
      ref: "Student.reimbursements",
      many: false,
    }),
    category: select({
      options: [
        { label: "Application Fee", value: "applicationFee" },
        { label: "IELTS", value: "ielts" },
        { label: "Visa Fee", value: "visaFee" },
        { label: "Travel", value: "travel" },
        { label: "Accommodation", value: "accommodation" },
      ],
      validation: { isRequired: true },
    }),
    amount: integer({ validation: { isRequired: true } }),
    currency: text({ defaultValue: "INR" }),
    status: select({
      options: [
        { label: "Pending", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" },
        { label: "Reimbursed", value: "reimbursed" },
      ],
      defaultValue: "pending",
      access: {
        update: ({ session }) => isFulfilment({ session }),
      },
    }),
    receipt: file({ storage: "receipts" }),
    requestedAt: timestamp(),
    approvedAt: timestamp({
      access: {
        update: ({ session }) => isFulfilment({ session }),
      },
    }),
    reimbursedAt: timestamp({
      access: {
        update: ({ session }) => isFulfilment({ session }),
      },
    }),
    remarks: text(),
    createdAt: timestamp({ defaultValue: { kind: "now" } }),
  },
  hooks: {
    resolveInput: autoSetTenantHook("create"),
    afterOperation: afterOperationWithCache("reimbursements"),
  },
});
