import { z } from 'zod';

export const documentVerifySchema = z
  .object({
    verificationStatus: z.enum(['verified', 'rejected']),
    verificationRemarks: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.verificationStatus === 'rejected') {
        return (data.verificationRemarks ?? '').trim().length >= 10;
      }
      return true;
    },
    { message: 'Rejection reason is required (min 10 characters)', path: ['verificationRemarks'] }
  );

export type DocumentVerifyInput = z.infer<typeof documentVerifySchema>;
