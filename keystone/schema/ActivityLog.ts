/**
 * ActivityLog - system-only audit log. Do NOT attach logActivityHook to this list.
 */

import { list } from "@keystone-6/core";
import {
  text,
  relationship,
  select,
  timestamp,
  json,
} from "@keystone-6/core/fields";
import { isAuthenticated, filterByTenant } from "../access/rules";

export const ActivityLog = list({
  access: {
    operation: {
      query: ({ session }) => isAuthenticated(session),
      create: () => false,
      update: () => false,
      delete: () => false,
    },
    filter: {
      query: (args) => filterByTenant({ session: args.session }),
    },
  },
  fields: {
    tenant: relationship({
      ref: "Consultant.activityLogs",
      many: false,
    }),
    actor: relationship({
      ref: "User",
      many: false,
    }),
    entityType: text({
      validation: { isRequired: true },
    }),
    entityId: text({
      validation: { isRequired: true },
    }),
    action: select({
      options: [
        { label: "Created", value: "created" },
        { label: "Updated", value: "updated" },
        { label: "Deleted", value: "deleted" },
        { label: "Accessed", value: "accessed" },
      ],
      validation: { isRequired: true },
    }),
    metadata: json(),
    createdAt: timestamp({
      defaultValue: { kind: "now" },
    }),
  },
  graphql: {
    plural: "ActivityLogs",
  },
});
