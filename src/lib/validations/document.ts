import { z } from "zod";
import { getMaxSizeForDocumentType } from "@app/lib/documents/constants";

const documentTypeOptions = [
  "passport",
  "birthCertificate",
  "sop",
  "resume",
  "transcripts",
  "englishTest",
  "financialDocs",
  "bankStatement",
  "loanAgreement",
] as const;

/** Form schema: studentId, documentType, optional file; optional applicationId/loanApplicationId */
export const documentUploadSchema = z
  .object({
    studentId: z.string().uuid("Select a student"),
    applicationId: z.string().uuid().optional(),
    loanApplicationId: z.string().uuid().optional(),
    documentType: z.enum(documentTypeOptions),
    file: z.instanceof(File).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.documentType) return;
    if (!data.file) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select a PDF file",
        path: ["file"],
      });
      return;
    }
    if (!data.file) return;
    if (data.file.type !== "application/pdf") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Only PDF is allowed",
        path: ["file"],
      });
      return;
    }
    const maxBytes = getMaxSizeForDocumentType(data.documentType);
    if (data.file.size > maxBytes) {
      const limit =
        data.documentType === "bankStatement"
          ? "1 MB"
          : "100 KB";
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `File must be under ${limit}`,
        path: ["file"],
      });
    }
  });

export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
