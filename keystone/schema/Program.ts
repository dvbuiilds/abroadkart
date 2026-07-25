/**
 * Program - belongs to University. Public read; superAdmin-only mutations.
 */

import { list } from "@keystone-6/core";
import {
  text,
  relationship,
  integer,
  timestamp,
  select,
  checkbox,
  decimal,
} from "@keystone-6/core/fields";
import { isSuperAdmin } from "../access/rules";

export const Program = list({
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
    university: relationship({
      ref: "University.programs",
      many: false,
    }),
    level: select({
      options: [
        { label: "Bachelor", value: "bachelor" },
        { label: "Master", value: "master" },
        { label: "PhD", value: "phd" },
      ],
      validation: { isRequired: true },
    }),
    field: text({ validation: { isRequired: true } }),
    tuitionFeePerYear: integer(),
    currency: text({ defaultValue: "USD" }),
    duration: integer(),
    startDate: timestamp(),
    minIeltsScore: decimal(),
    minCgpa: decimal(),
    applicationFee: integer(),
    applicationPortalUrl: text(),
    applications: relationship({ ref: "Application.program", many: true }),
    isActive: checkbox({ defaultValue: true }),
    createdAt: timestamp({ defaultValue: { kind: "now" } }),
  },
});
