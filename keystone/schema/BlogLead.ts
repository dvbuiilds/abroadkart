/**
 * BlogLead - enquiries submitted from the blog's lead form.
 *
 * Only the Next.js server can create these: it sends the x-internal-key header.
 * Everything else (query, update, delete) is superAdmin only.
 * Not tenant-scoped.
 */

import { list } from "@keystone-6/core";
import { select, text, timestamp } from "@keystone-6/core/fields";
import { isSuperAdmin, hasInternalKey } from "../access/rules";
import { isValidEmail } from "../lib/isValidEmail";

export const BlogLead = list({
  access: {
    operation: {
      query: ({ session }) => isSuperAdmin(session),
      create: ({ context }) => hasInternalKey({ context }),
      update: ({ session }) => isSuperAdmin(session),
      delete: ({ session }) => isSuperAdmin(session),
    },
  },
  fields: {
    email: text({ validation: { isRequired: true } }),
    name: text(),
    phone: text(),
    message: text({ ui: { displayMode: "textarea" } }),
    sourceSlug: text(),
    sourceUrl: text(),
    utmSource: text(),
    utmMedium: text(),
    utmCampaign: text(),
    status: select({
      options: [
        { label: "New", value: "new" },
        { label: "Contacted", value: "contacted" },
        { label: "Closed", value: "closed" },
      ],
      defaultValue: "new",
      validation: { isRequired: true },
    }),
    createdAt: timestamp({
      defaultValue: { kind: "now" },
    }),
  },
  hooks: {
    validateInput: ({ resolvedData, addValidationError, operation }) => {
      // On update, email is only checked when the caller is changing it.
      if (operation === "create" || resolvedData.email !== undefined) {
        if (!isValidEmail(resolvedData.email as string | undefined)) {
          addValidationError("email must be a valid email address");
        }
      }
    },
  },
  ui: {
    labelField: "email",
    listView: {
      initialColumns: ["email", "name", "status", "createdAt"],
    },
  },
  graphql: {
    plural: "BlogLeads",
  },
});
