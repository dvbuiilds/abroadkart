/**
 * StudentDocument - file uploads; verification by fulfilment.
 * Tenant is derived from student for multi-tenant filtering.
 */

import { list } from "@keystone-6/core";
import {
  text,
  relationship,
  timestamp,
  select,
  file,
} from "@keystone-6/core/fields";
import {
  isAuthenticated,
  isFulfilment,
  filterByTenant,
  type FilterByTenantResult,
} from "../access/rules";

function isTenantFilter(
  f: FilterByTenantResult,
): f is { tenant: { id: { equals: string } } } {
  return typeof f === "object" && f !== null && "tenant" in f;
}
import { afterOperationWithCache } from "../hooks/cacheInvalidation";

export const StudentDocument = list({
  access: {
    operation: {
      query: ({ session }) => isAuthenticated(session),
      create: ({ session }) => isAuthenticated(session),
      update: ({ session }) => isAuthenticated(session),
      delete: ({ session }) => isAuthenticated(session),
    },
    filter: {
      query: ({ session }) => {
        const f = filterByTenant({ session });
        if (f === true) return true;
        if (f === false) return false;
        if (isTenantFilter(f)) {
          return { student: { tenant: { id: { equals: f.tenant.id.equals } } } };
        }
        return false;
      },
      update: ({ session }) => {
        const f = filterByTenant({ session });
        if (f === true) return true;
        if (f === false) return false;
        if (isTenantFilter(f)) {
          return { student: { tenant: { id: { equals: f.tenant.id.equals } } } };
        }
        return false;
      },
    },
  },
  fields: {
    student: relationship({
      ref: "Student.documents",
      many: false,
    }),
    application: relationship({
      ref: "Application.documents",
      many: false,
    }),
    loanApplication: relationship({
      ref: "LoanApplication.documents",
      many: false,
    }),
    documentType: select({
      options: [
        { label: "Passport", value: "passport" },
        { label: "Birth Certificate", value: "birthCertificate" },
        { label: "SOP", value: "sop" },
        { label: "Resume", value: "resume" },
        { label: "Academic Transcripts", value: "transcripts" },
        { label: "English Test", value: "englishTest" },
        { label: "Financial Documents", value: "financialDocs" },
        { label: "Bank Statement", value: "bankStatement" },
        { label: "Loan Agreement", value: "loanAgreement" },
      ],
      validation: { isRequired: true },
    }),
    file: file({
      storage: "student_documents",
    }),
    verificationStatus: select({
      options: [
        { label: "Pending", value: "pending" },
        { label: "Verified", value: "verified" },
        { label: "Rejected", value: "rejected" },
      ],
      defaultValue: "pending",
      access: {
        update: ({ session }) => isFulfilment({ session }),
      },
    }),
    verificationRemarks: text({
      access: {
        update: ({ session }) => isFulfilment({ session }),
      },
    }),
    uploadedAt: timestamp({ defaultValue: { kind: "now" } }),
    createdAt: timestamp({ defaultValue: { kind: "now" } }),
  },
  hooks: {
    afterOperation: afterOperationWithCache("studentDocuments"),
  },
});
