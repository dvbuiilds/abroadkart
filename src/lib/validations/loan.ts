import { z } from 'zod';

/** Form schema: use studentId and optional applicationId; map to connect in submit handler */
export const loanCreateSchema = z.object({
  studentId: z.string().uuid('Select a student'),
  applicationId: z.string().uuid().optional(),
  loanAmountRequested: z.coerce.number().int().min(1, 'Loan amount is required'),
  currency: z.string().optional().default('INR'),
  loanTenure: z.coerce.number().int().min(1).optional(),
  consultantRemarks: z.string().optional(),
});

export type LoanCreateInput = z.infer<typeof loanCreateSchema>;
