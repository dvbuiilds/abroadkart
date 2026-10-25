import { z } from 'zod';

const statusOptions = ['draft', 'submitted', 'underReview', 'waitlisted', 'accepted', 'rejected'] as const;

/** Form schema: use studentId and programId; map to connect in submit handler */
export const applicationCreateSchema = z.object({
  studentId: z.string().uuid('Select a student'),
  programId: z.string().uuid('Select a program'),
  status: z.enum(statusOptions).optional().default('draft'),
  applicationDate: z.string().optional(),
  gpa: z.union([z.string(), z.number()]).optional(),
  gre: z.coerce.number().int().min(0).max(340).optional(),
  gmat: z.coerce.number().int().min(0).optional(),
  remarks: z.string().optional(),
});

export const applicationUpdateSchema = z.object({
  status: z.enum(statusOptions).optional(),
  responseDate: z.string().datetime().optional(),
  gpa: z.union([z.string(), z.number()]).optional(),
  gre: z.coerce.number().int().min(0).max(340).optional(),
  gmat: z.coerce.number().int().min(0).optional(),
  remarks: z.string().optional(),
});

export type ApplicationCreateInput = z.infer<typeof applicationCreateSchema>;
export type ApplicationUpdateInput = z.infer<typeof applicationUpdateSchema>;
