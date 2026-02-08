import { z } from 'zod';

const documentTypeOptions = [
  'passport',
  'birthCertificate',
  'sop',
  'resume',
  'transcripts',
  'englishTest',
  'financialDocs',
  'bankStatement',
  'loanAgreement',
] as const;

/** Form schema: use studentId and optional applicationId/loanApplicationId; map to connect in submit handler */
export const documentUploadSchema = z.object({
  studentId: z.string().uuid('Select a student'),
  applicationId: z.string().uuid().optional(),
  loanApplicationId: z.string().uuid().optional(),
  documentType: z.enum(documentTypeOptions),
});

export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
