import { z } from 'zod';

export const loanApprovalSchema = z.object({
  loanAmountApproved: z.coerce.number().int().positive('Approved amount must be positive'),
  interestRate: z.coerce.number().positive('Interest rate must be positive'),
  emi: z.coerce.number().int().positive('EMI must be positive'),
  fulfilmentRemarks: z.string().optional(),
});

export const loanRejectionSchema = z.object({
  fulfilmentRemarks: z.string().min(10, 'Please provide a reason for rejection (min 10 characters)'),
});

export const loanDisbursementSchema = z.object({
  disburseDate: z.string().min(1, 'Disburse date is required'),
});

export type LoanApprovalInput = z.infer<typeof loanApprovalSchema>;
export type LoanRejectionInput = z.infer<typeof loanRejectionSchema>;
export type LoanDisbursementInput = z.infer<typeof loanDisbursementSchema>;
