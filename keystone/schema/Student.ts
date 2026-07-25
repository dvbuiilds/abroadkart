/**
 * Student - tenant-scoped. Consultants create; tenant auto-set on create.
 * CRM entity per spec: full lifecycle from lead to enrolled.
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

    /* === Identity & Contact === */
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
    gender: select({
      options: [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
        { label: "Other", value: "other" },
      ],
    }),
    city: text(),
    state: text(),
    countryOfResidence: text({ validation: { isRequired: true } }),
    source: select({
      options: [
        { label: "Reddit", value: "reddit" },
        { label: "Instagram", value: "instagram" },
        { label: "Referral", value: "referral" },
        { label: "Walk-in", value: "walkIn" },
        { label: "Google", value: "google" },
        { label: "Facebook", value: "facebook" },
        { label: "LinkedIn", value: "linkedin" },
        { label: "Other", value: "other" },
      ],
    }),

    /* === Academic Background === */
    qualification: select({
      options: [
        { label: "10th", value: "10th" },
        { label: "12th", value: "12th" },
        { label: "Bachelors", value: "bachelors" },
        { label: "Masters", value: "masters" },
      ],
    }),
    stream: text(),
    subjects: json(),
    academicScore: decimal(),
    academicScoreType: select({
      options: [
        { label: "Percentage", value: "percentage" },
        { label: "CGPA", value: "cgpa" },
      ],
    }),
    backlogCount: integer(),
    yearOfPassing: integer(),
    institutionName: text(),

    /* === English & Standardised Test Scores === */
    ieltsScore: decimal(),
    toeflScore: decimal(),
    pteScore: decimal(),
    duolingoScore: decimal(),
    gmatScore: decimal(),
    greScore: decimal(),
    satScore: decimal(),
    actScore: decimal(),
    finalScore: decimal(),
    testAppearingDate: timestamp(),

    /* === Work Experience === */
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
    employer: text(),
    designation: text(),
    gapExplanation: text({ ui: { displayMode: "textarea" } }),

    /* === Study Abroad Goals === */
    targetCountries: json(),
    targetCourses: json(),
    studyLevel: select({
      options: [
        { label: "Undergraduate", value: "undergraduate" },
        { label: "Postgraduate", value: "postgraduate" },
        { label: "PhD", value: "phd" },
        { label: "Diploma", value: "diploma" },
        { label: "Certificate", value: "certificate" },
      ],
    }),
    preferredIntake: select({
      options: [
        { label: "January", value: "january" },
        { label: "May", value: "may" },
        { label: "September", value: "september" },
      ],
    }),
    targetYear: select({
      options: [
        { label: "2026", value: "2026" },
        { label: "2027", value: "2027" },
        { label: "2028", value: "2028" },
        { label: "2029", value: "2029" },
      ],
    }),
    programDisciplines: json(),

    /* === Financial Profile === */
    budgetTuition: integer(),
    budgetLiving: integer(),
    budgetCurrency: text({ defaultValue: "USD" }),
    fundingType: select({
      options: [
        { label: "Self-funded", value: "selfFunded" },
        { label: "Education Loan", value: "educationLoan" },
        { label: "Scholarship", value: "scholarship" },
        { label: "Parents", value: "parents" },
      ],
    }),
    loanPreApproved: checkbox({ defaultValue: false }),

    /* === Visa & Travel History === */
    priorVisaRefusals: checkbox({ defaultValue: false }),
    refusalCountries: json(),
    refusalReason: text({ ui: { displayMode: "textarea" } }),
    passportAvailable: checkbox({ defaultValue: false }),
    passportExpiry: timestamp(),

    /* === CRM Status & Assignment === */
    currentStage: select({
      options: [
        { label: "Lead", value: "lead" },
        { label: "Contacted", value: "contacted" },
        { label: "Counselling Done", value: "counsellingDone" },
        { label: "Docs Collection", value: "docsCollection" },
        { label: "Applied", value: "applied" },
        { label: "Offer Received", value: "offerReceived" },
        { label: "Visa Filed", value: "visaFiled" },
        { label: "Enrolled", value: "enrolled" },
        { label: "Lost", value: "lost" },
      ],
      defaultValue: "lead",
      isIndexed: true,
    }),
    priority: select({
      options: [
        { label: "Hot", value: "hot" },
        { label: "Warm", value: "warm" },
        { label: "Cold", value: "cold" },
      ],
    }),
    lostReason: text(),
    assignedCounsellor: relationship({ ref: "User", many: false }),

    /* === Relationships === */
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
    interactions: relationship({ ref: "Interaction.student", many: true }),
    payments: relationship({ ref: "Payment.student", many: true }),

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
