/**
 * Task - tenant-scoped; assignedTo and createdBy reference User.
 */

import { list } from "@keystone-6/core";
import {
  text,
  relationship,
  checkbox,
  timestamp,
  select,
} from "@keystone-6/core/fields";
import { isAuthenticated, filterByTenant } from "../access/rules";
import { autoSetTenantHook } from "../hooks/autoSetTenant";
import { afterOperationWithCache } from "../hooks/cacheInvalidation";

export const Task = list({
  access: {
    operation: {
      query: ({ session }) => isAuthenticated(session),
      create: ({ session }) => isAuthenticated(session),
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
      ref: "Consultant.tasks",
      many: false,
    }),
    student: relationship({
      ref: "Student.tasks",
      many: false,
    }),
    title: text({ validation: { isRequired: true } }),
    description: text({ ui: { displayMode: "textarea" } }),
    taskType: select({
      options: [
        { label: "Document Upload", value: "documentUpload" },
        { label: "Phone Call", value: "phoneCall" },
        { label: "Meeting", value: "meeting" },
        { label: "Application", value: "application" },
        { label: "Loan Approval", value: "loanApproval" },
        { label: "Visa Application", value: "visaApplication" },
      ],
      validation: { isRequired: true },
    }),
    status: select({
      options: [
        { label: "Todo", value: "todo" },
        { label: "In Progress", value: "inProgress" },
        { label: "Done", value: "done" },
        { label: "Blocked", value: "blocked" },
      ],
      defaultValue: "todo",
    }),
    priority: select({
      options: [
        { label: "Low", value: "low" },
        { label: "Medium", value: "medium" },
        { label: "High", value: "high" },
        { label: "Urgent", value: "urgent" },
      ],
      defaultValue: "medium",
    }),
    dueDate: timestamp(),
    assignedTo: relationship({ ref: "User", many: false }),
    createdBy: relationship({ ref: "User", many: false }),
    isDeleted: checkbox({ defaultValue: false }),
    createdAt: timestamp({ defaultValue: { kind: "now" } }),
    updatedAt: timestamp({ db: { updatedAt: true } }),
  },
  hooks: {
    resolveInput: autoSetTenantHook("create"),
    afterOperation: afterOperationWithCache("tasks"),
  },
});
