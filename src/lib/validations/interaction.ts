import { z } from 'zod';

const interactionTypeOptions = [
  'call',
  'whatsapp',
  'email',
  'inPersonMeeting',
  'reddit',
  'walkIn',
  'other',
] as const;

const interactionDirectionOptions = ['inbound', 'outbound'] as const;

export const interactionCreateSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
  type: z.enum(interactionTypeOptions),
  direction: z.enum(interactionDirectionOptions),
  notes: z.string().min(1, 'Note is required').max(5000, 'Note must be less than 5000 characters'),
  nextAction: z.string().max(500).optional(),
  nextActionDate: z.coerce.date().optional(),
});

export const interactionUpdateSchema = interactionCreateSchema.partial();

export type InteractionCreateInput = z.infer<typeof interactionCreateSchema>;
export type InteractionUpdateInput = z.infer<typeof interactionUpdateSchema>;

export const INTERACTION_TYPE_OPTIONS = [
  { value: 'call', label: 'Call' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
  { value: 'inPersonMeeting', label: 'In-person Meeting' },
  { value: 'reddit', label: 'Reddit' },
  { value: 'walkIn', label: 'Walk-in' },
  { value: 'other', label: 'Other' },
] as const;

export const INTERACTION_DIRECTION_OPTIONS = [
  { value: 'inbound', label: 'Inbound' },
  { value: 'outbound', label: 'Outbound' },
] as const;

export const interactionTypeLabelMap = Object.fromEntries(
  INTERACTION_TYPE_OPTIONS.map((o) => [o.value, o.label])
) as Record<string, string>;

export const interactionDirectionLabelMap = Object.fromEntries(
  INTERACTION_DIRECTION_OPTIONS.map((o) => [o.value, o.label])
) as Record<string, string>;
