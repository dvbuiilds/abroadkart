import { z } from 'zod';

export const reimbursementActionSchema = z.object({
  status: z.enum(['approved', 'rejected', 'reimbursed']),
  remarks: z.string().optional(),
});

export type ReimbursementActionInput = z.infer<typeof reimbursementActionSchema>;
