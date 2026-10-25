export const FEE_TYPE_OPTIONS = [
  { value: 'consultationFee', label: 'Consultation Fee' },
  { value: 'applicationFee', label: 'Application Fee' },
  { value: 'visaFilingFee', label: 'Visa Filing Fee' },
  { value: 'commission', label: 'Commission' },
  { value: 'misc', label: 'Miscellaneous' },
] as const;

export const PAYMENT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'partial', label: 'Partial' },
  { value: 'paid', label: 'Paid' },
] as const;

export const PAYMENT_METHOD_OPTIONS = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'bankTransfer', label: 'Bank Transfer' },
  { value: 'card', label: 'Card' },
] as const;

export const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'INR', label: 'INR (₹)' },
  { value: 'AUD', label: 'AUD (A$)' },
] as const;

export const feeTypeLabelMap = Object.fromEntries(
  FEE_TYPE_OPTIONS.map((o) => [o.value, o.label])
) as Record<string, string>;

export const paymentStatusLabelMap = Object.fromEntries(
  PAYMENT_STATUS_OPTIONS.map((o) => [o.value, o.label])
) as Record<string, string>;

export const paymentMethodLabelMap = Object.fromEntries(
  PAYMENT_METHOD_OPTIONS.map((o) => [o.value, o.label])
) as Record<string, string>;

export const currencyLabelMap = Object.fromEntries(
  CURRENCY_OPTIONS.map((o) => [o.value, o.label])
) as Record<string, string>;
