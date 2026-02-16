/**
 * University - reference data. Public read; superAdmin-only mutations.
 */

import { list } from "@keystone-6/core";
import {
  text,
  relationship,
  integer,
  decimal,
  timestamp,
  checkbox,
  file,
} from "@keystone-6/core/fields";
import { isSuperAdmin } from "../access/rules";

export const University = list({
  access: {
    operation: {
      query: () => true,
      create: ({ session }) => isSuperAdmin(session),
      update: ({ session }) => isSuperAdmin(session),
      delete: ({ session }) => isSuperAdmin(session),
    },
  },
  fields: {
    name: text({ validation: { isRequired: true } }),
    slug: text({ isIndexed: "unique" }),
    country: text({ validation: { isRequired: true } }),
    city: text(),
    website: text(),
    acceptanceRate: decimal(),
    ranking: integer(),
    programs: relationship({ ref: "Program.university", many: true }),
    logo: file({ storage: "university_logos" }),
    isActive: checkbox({ defaultValue: true }),
    createdAt: timestamp({ defaultValue: { kind: "now" } }),
  },
});
