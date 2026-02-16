import { z } from 'zod';

export const prepaidCardCreateSchema = z.object({
  studentId: z.string().uuid('Select a student'),
  cardNumber: z.string().min(1, 'Card number is required'),
  balance: z.coerce.number().int().min(0, 'Balance must be non-negative'),
  currency: z.string().min(1, 'Currency is required').default('USD'),
  cardProvider: z.string().optional(),
  status: z.enum(['inactive', 'active', 'blocked', 'expired']).optional().default('inactive'),
});

export const prepaidCardUpdateSchema = z.object({
  status: z.enum(['active', 'blocked', 'expired']),
  balance: z.coerce.number().int().min(0).optional(),
});

export type PrepaidCardCreateInput = z.infer<typeof prepaidCardCreateSchema>;
export type PrepaidCardUpdateInput = z.infer<typeof prepaidCardUpdateSchema>;
