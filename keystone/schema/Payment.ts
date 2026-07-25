/**
 * Payment - consultancy fees collected from students.
 * Distinct from LoanApplication/Reimbursement/PrepaidCard (which model money to students).
 * Tenant-scoped.
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
import { isAuthenticated, isSuperAdmin, filterByTenant } from "../access/rules";
import { autoSetTenantHook } from "../hooks/autoSetTenant";
import { afterOperationWithCache } from "../hooks/cacheInvalidation";

export const Payment = list({
  access: {
    operation: {
      query: ({ session }) => isAuthenticated(session),
      create: ({ session }) => isAuthenticated(session),
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
      ref: "Consultant.payments",
      many: false,
    }),
    student: relationship({
      ref: "Student.payments",
      many: false,
    }),
    feeType: select({
      options: [
        { label: "Consultation Fee", value: "consultationFee" },
        { label: "Application Fee", value: "applicationFee" },
        { label: "Visa Filing Fee", value: "visaFilingFee" },
        { label: "Commission", value: "commission" },
        { label: "Miscellaneous", value: "misc" },
      ],
      validation: { isRequired: true },
    }),
    amount: integer({
      validation: { isRequired: true },
    }),
    currency: text({
      defaultValue: "INR",
      validation: { isRequired: true },
    }),
    paymentStatus: select({
      options: [
        { label: "Pending", value: "pending" },
        { label: "Partial", value: "partial" },
        { label: "Paid", value: "paid" },
      ],
      defaultValue: "pending",
    }),
    paymentDate: timestamp(),
    paymentMethod: select({
      options: [
        { label: "Cash", value: "cash" },
        { label: "UPI", value: "upi" },
        { label: "Bank Transfer", value: "bankTransfer" },
        { label: "Card", value: "card" },
      ],
    }),
    invoice: file({
      storage: "invoices",
    }),
    createdAt: timestamp({
      defaultValue: { kind: "now" },
    }),
  },
  hooks: {
    resolveInput: autoSetTenantHook("create"),
    afterOperation: afterOperationWithCache("payments"),
  },
  graphql: {
    plural: "Payments",
  },
});
