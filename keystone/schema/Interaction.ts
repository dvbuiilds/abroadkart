/**
 * Interaction - manually-logged CRM touchpoints (calls, WhatsApp, emails, meetings).
 * Separate from ActivityLog which is a machine-written audit trail.
 * Tenant-scoped.
 */

import { list } from "@keystone-6/core";
import {
  text,
  relationship,
  timestamp,
  select,
} from "@keystone-6/core/fields";
import { isAuthenticated, isSuperAdmin, filterByTenant } from "../access/rules";
import { autoSetTenantHook } from "../hooks/autoSetTenant";
import { logActivityHook } from "../hooks/logActivity";

export const Interaction = list({
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
      ref: "Consultant.interactions",
      many: false,
    }),
    student: relationship({
      ref: "Student.interactions",
      many: false,
    }),
    counsellor: relationship({
      ref: "User",
      many: false,
    }),
    type: select({
      options: [
        { label: "Call", value: "call" },
        { label: "WhatsApp", value: "whatsapp" },
        { label: "Email", value: "email" },
        { label: "In-person Meeting", value: "inPersonMeeting" },
        { label: "Reddit", value: "reddit" },
        { label: "Walk-in", value: "walkIn" },
        { label: "Other", value: "other" },
      ],
      validation: { isRequired: true },
    }),
    direction: select({
      options: [
        { label: "Inbound", value: "inbound" },
        { label: "Outbound", value: "outbound" },
      ],
      validation: { isRequired: true },
    }),
    notes: text({
      ui: { displayMode: "textarea" },
      validation: { isRequired: true },
    }),
    nextAction: text(),
    nextActionDate: timestamp(),
    createdAt: timestamp({
      defaultValue: { kind: "now" },
    }),
  },
  hooks: {
    resolveInput: autoSetTenantHook("create"),
    afterOperation: logActivityHook.afterOperation,
  },
  graphql: {
    plural: "Interactions",
  },
});
