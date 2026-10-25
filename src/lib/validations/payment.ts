import { z } from 'zod';
import { FEE_TYPE_OPTIONS, PAYMENT_STATUS_OPTIONS, PAYMENT_METHOD_OPTIONS, CURRENCY_OPTIONS } from '@app/lib/payments/options';

const feeTypeOptions = FEE_TYPE_OPTIONS.map((option) => option.value) as [
  (typeof FEE_TYPE_OPTIONS)[number]['value'],
  ...(typeof FEE_TYPE_OPTIONS)[number]['value'][]
];

const paymentStatusOptions = PAYMENT_STATUS_OPTIONS.map((option) => option.value) as [
  (typeof PAYMENT_STATUS_OPTIONS)[number]['value'],
  ...(typeof PAYMENT_STATUS_OPTIONS)[number]['value'][]
];

const paymentMethodOptions = PAYMENT_METHOD_OPTIONS.map((option) => option.value) as [
  (typeof PAYMENT_METHOD_OPTIONS)[number]['value'],
  ...(typeof PAYMENT_METHOD_OPTIONS)[number]['value'][]
];

const currencyOptions = CURRENCY_OPTIONS.map((option) => option.value) as [
  (typeof CURRENCY_OPTIONS)[number]['value'],
  ...(typeof CURRENCY_OPTIONS)[number]['value'][]
];

export const paymentCreateSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
  feeType: z.enum(feeTypeOptions),
  amount: z.coerce.number().int().min(0, 'Amount must be greater than 0'),
  currency: z.enum(currencyOptions).default('INR'),
  paymentStatus: z.enum(paymentStatusOptions).default('pending'),
  paymentDate: z.coerce.date(),
  paymentMethod: z.enum(paymentMethodOptions).optional(),
});

export const paymentUpdateSchema = paymentCreateSchema.partial();

export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;
export type PaymentUpdateInput = z.infer<typeof paymentUpdateSchema>;
