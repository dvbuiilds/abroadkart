/**
 * Student - tenant-scoped. Consultants create; tenant auto-set on create.
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
import { isAuthenticated, isConsultant, filterByTenant } from "../access/rules";
import { autoSetTenantHook } from "../hooks/autoSetTenant";
import { afterOperationWithCache } from "../hooks/cacheInvalidation";

export const Student = list({
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
      ref: "Consultant.students",
      many: false,
    }),
    fullName: text({ validation: { isRequired: true } }),
    email: text({
      validation: {
        isRequired: true,
        match: { regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      },
      isIndexed: true,
    }),
    phone: text({ validation: { isRequired: true } }),
    dateOfBirth: timestamp(),
    countryOfResidence: text({ validation: { isRequired: true } }),
    targetCountry: text(),
    currentStage: select({
      options: [
        { label: "Lead", value: "lead" },
        { label: "Prospect", value: "prospect" },
        { label: "Applied", value: "applied" },
        { label: "In Loan Process", value: "inLoanProcess" },
        { label: "Enrolled", value: "enrolled" },
        { label: "Graduated", value: "graduated" },
      ],
      defaultValue: "lead",
      isIndexed: true,
    }),
    educationLevel: select({
      options: [
        { label: "High School", value: "highSchool" },
        { label: "Bachelor", value: "bachelor" },
        { label: "Master", value: "master" },
        { label: "PhD", value: "phd" },
      ],
    }),
    workExperience: integer(),
    englishTestScore: decimal(),
    englishTestType: select({
      options: [
        { label: "IELTS", value: "IELTS" },
        { label: "TOEFL", value: "TOEFL" },
        { label: "PTE", value: "PTE" },
      ],
    }),
    parentMonthlyIncome: integer(),
    applications: relationship({ ref: "Application.student", many: true }),
    documents: relationship({ ref: "StudentDocument.student", many: true }),
    loanApplications: relationship({ ref: "LoanApplication.student", many: true }),
    accommodations: relationship({
      ref: "AccommodationBooking.student",
      many: true,
    }),
    reimbursements: relationship({ ref: "Reimbursement.student", many: true }),
    prepaidCard: relationship({ ref: "PrepaidCard.student", many: false }),
    tasks: relationship({ ref: "Task.student", many: true }),
    notes: text({ ui: { displayMode: "textarea" } }),
    isDeleted: checkbox({ defaultValue: false }),
    createdAt: timestamp({ defaultValue: { kind: "now" } }),
    updatedAt: timestamp({ db: { updatedAt: true } }),
  },
  hooks: {
    resolveInput: autoSetTenantHook("create"),
    afterOperation: afterOperationWithCache("students"),
  },
});
