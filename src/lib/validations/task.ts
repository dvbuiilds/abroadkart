import { z } from 'zod';

const taskTypeOptions = [
  'documentUpload',
  'phoneCall',
  'meeting',
  'application',
  'loanApproval',
  'visaApplication',
] as const;
const statusOptions = ['todo', 'inProgress', 'done', 'blocked'] as const;
const priorityOptions = ['low', 'medium', 'high', 'urgent'] as const;

/** Form schema: use studentId and optional assignedToId; map to connect in submit handler */
export const taskCreateSchema = z.object({
  studentId: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  taskType: z.enum(taskTypeOptions),
  status: z.enum(statusOptions).optional().default('todo'),
  priority: z.enum(priorityOptions).optional().default('medium'),
  dueDate: z.string().optional(),
  assignedToId: z.string().uuid().optional(),
});

export const taskUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  taskType: z.enum(taskTypeOptions).optional(),
  status: z.enum(statusOptions).optional(),
  priority: z.enum(priorityOptions).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  assignedTo: z.object({ connect: z.object({ id: z.string().uuid() }) }).optional(),
});

export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
