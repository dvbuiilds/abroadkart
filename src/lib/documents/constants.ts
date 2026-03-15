/**
 * Document upload limits and allowed types for consultant document upload.
 * Bank Statement: 1 MB; all other types: 100 KB. PDF only.
 */

export const ALLOWED_MIME = "application/pdf" as const;
export const ALLOWED_EXTENSIONS = [".pdf"] as const;

const BANK_STATEMENT_MAX_BYTES = 1024 * 1024; // 1 MB
const OTHER_DOCS_MAX_BYTES = 100 * 1024; // 100 KB

export const DOCUMENT_UPLOAD_LIMITS: Record<string, number> = {
  bankStatement: BANK_STATEMENT_MAX_BYTES,
  passport: OTHER_DOCS_MAX_BYTES,
  birthCertificate: OTHER_DOCS_MAX_BYTES,
  sop: OTHER_DOCS_MAX_BYTES,
  resume: OTHER_DOCS_MAX_BYTES,
  transcripts: OTHER_DOCS_MAX_BYTES,
  englishTest: OTHER_DOCS_MAX_BYTES,
  financialDocs: OTHER_DOCS_MAX_BYTES,
  loanAgreement: OTHER_DOCS_MAX_BYTES,
};

export function getMaxSizeForDocumentType(documentType: string): number {
  return DOCUMENT_UPLOAD_LIMITS[documentType] ?? OTHER_DOCS_MAX_BYTES;
}
