/**
 * PrepaidCard - created by fulfilment only; tenant-scoped.
 */

import { list } from "@keystone-6/core";
import {
  text,
  relationship,
  timestamp,
  select,
  integer,
} from "@keystone-6/core/fields";
import { isAuthenticated, isFulfilment, isSuperAdmin, filterByTenant } from "../access/rules";
import { autoSetTenantHook } from "../hooks/autoSetTenant";
import { afterOperationWithCache } from "../hooks/cacheInvalidation";

export const PrepaidCard = list({
  access: {
    operation: {
      query: ({ session }) => isAuthenticated(session),
      create: ({ session }) => isFulfilment({ session }) || isSuperAdmin({ session }),
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
      ref: "Consultant.prepaidCards",
      many: false,
    }),
    student: relationship({
      ref: "Student.prepaidCard",
      many: false,
    }),
    cardNumber: text({ validation: { isRequired: true } }),
    balance: integer(),
    currency: text({ defaultValue: "USD" }),
    cardProvider: text(),
    status: select({
      options: [
        { label: "Inactive", value: "inactive" },
        { label: "Active", value: "active" },
        { label: "Blocked", value: "blocked" },
        { label: "Expired", value: "expired" },
      ],
      defaultValue: "inactive",
    }),
    issuedAt: timestamp(),
    expiryDate: timestamp(),
    createdAt: timestamp({ defaultValue: { kind: "now" } }),
  },
  hooks: {
    resolveInput: autoSetTenantHook("create"),
    afterOperation: afterOperationWithCache("prepaidCards"),
  },
});
