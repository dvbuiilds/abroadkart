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
  json,
} from "@keystone-6/core/fields";
import { isAuthenticated, isConsultant, filterByTenant, isSuperAdmin, isFulfilment } from "../access/rules";
import { autoSetTenantHook } from "../hooks/autoSetTenant";
import { afterOperationWithCache } from "../hooks/cacheInvalidation";

export const Student = list({
  access: {
    operation: {
      query: ({ session }) => isAuthenticated(session),
      create: ({ session }) => isConsultant({ session }) || isSuperAdmin({ session }) || isFulfilment({ session }),
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
    targetCountry: select({
      options: [
        { label: "Australia", value: "AUS" },
        { label: "Ireland", value: "IRL" },
        { label: "United Kingdom", value: "UK" },
        { label: "France", value: "FR" },
        { label: "Germany", value: "GER" },
        { label: "New Zealand", value: "NZ" },
        { label: "Poland", value: "POL" },
      ],
      validation: { isRequired: true },
    }),
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
    qualification: select({
      options: [
        { label: "Intermediate", value: "intermediate" },
        { label: "Bachelors", value: "bachelors" },
        { label: "Masters", value: "masters" },
      ],
    }),
    workExperience: select({
      options: [
        { label: "0 years", value: "0" },
        { label: "1 year", value: "1" },
        { label: "2 years", value: "2" },
        { label: "3 years", value: "3" },
        { label: "4 years", value: "4" },
        { label: "4+ years", value: "4plus" },
      ],
    }),
    ieltsScore: decimal(),
    toeflScore: decimal(),
    pteScore: decimal(),
    gmatScore: decimal(),
    greScore: decimal(),
    satScore: decimal(),
    actScore: decimal(),
    finalScore: decimal(),
    targetYear: select({
      options: [
        { label: "2026", value: "2026" },
        { label: "2027", value: "2027" },
        { label: "2028", value: "2028" },
        { label: "2029", value: "2029" },
      ],
    }),
    programDisciplines: json(),
    budgetPerYear: select({
      options: [
        { label: "<20K USD", value: "lt20k" },
        { label: "20-30K USD", value: "20to30k" },
        { label: "30-40K USD", value: "30to40k" },
        { label: "40-50K USD", value: "40to50k" },
        { label: ">50K USD", value: "gt50k" },
      ],
    }),
    openForScholarshipsLoans: checkbox({ defaultValue: false }),
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
