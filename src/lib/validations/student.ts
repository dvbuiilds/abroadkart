import { z } from 'zod';
import {
  BUDGET_PER_YEAR_OPTIONS,
  PROGRAM_DISCIPLINE_OPTIONS,
  QUALIFICATION_OPTIONS,
  STAGE_OPTIONS,
  TARGET_COUNTRY_OPTIONS,
  TARGET_YEAR_OPTIONS,
  WORK_EXPERIENCE_OPTIONS,
} from '@app/lib/students/options';

const stageOptions = STAGE_OPTIONS.map((option) => option.value) as [
  (typeof STAGE_OPTIONS)[number]['value'],
  ...(typeof STAGE_OPTIONS)[number]['value'][]
];
const targetCountryOptions = TARGET_COUNTRY_OPTIONS.map((option) => option.value) as [
  (typeof TARGET_COUNTRY_OPTIONS)[number]['value'],
  ...(typeof TARGET_COUNTRY_OPTIONS)[number]['value'][]
];
const qualificationOptions = QUALIFICATION_OPTIONS.map((option) => option.value) as [
  (typeof QUALIFICATION_OPTIONS)[number]['value'],
  ...(typeof QUALIFICATION_OPTIONS)[number]['value'][]
];
const targetYearOptions = TARGET_YEAR_OPTIONS.map((option) => option.value) as [
  (typeof TARGET_YEAR_OPTIONS)[number]['value'],
  ...(typeof TARGET_YEAR_OPTIONS)[number]['value'][]
];
const budgetPerYearOptions = BUDGET_PER_YEAR_OPTIONS.map((option) => option.value) as [
  (typeof BUDGET_PER_YEAR_OPTIONS)[number]['value'],
  ...(typeof BUDGET_PER_YEAR_OPTIONS)[number]['value'][]
];
const workExperienceOptions = WORK_EXPERIENCE_OPTIONS.map((option) => option.value) as [
  (typeof WORK_EXPERIENCE_OPTIONS)[number]['value'],
  ...(typeof WORK_EXPERIENCE_OPTIONS)[number]['value'][]
];
const programDisciplineOptions = PROGRAM_DISCIPLINE_OPTIONS.map((option) => option.value) as [
  (typeof PROGRAM_DISCIPLINE_OPTIONS)[number]['value'],
  ...(typeof PROGRAM_DISCIPLINE_OPTIONS)[number]['value'][]
];

const optionalNullableNumber = z.preprocess(
  (value) => {
    if (value === '' || value == null) return null;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return Number(value);
    return value;
  },
  z.number().nullable()
);

export const studentCreateSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  countryOfResidence: z.string().min(1, 'Select a country'),
  targetCountry: z.enum(targetCountryOptions),
  currentStage: z.enum(stageOptions).optional().default('lead'),
  qualification: z.enum(qualificationOptions),
  targetYear: z.enum(targetYearOptions),
  budgetPerYear: z.enum(budgetPerYearOptions),
  programDisciplines: z.array(z.enum(programDisciplineOptions)).min(1, 'Select at least one discipline'),
  workExperience: z.enum(workExperienceOptions).optional(),
  openForScholarshipsLoans: z.boolean().optional().default(false),
  ieltsScore: optionalNullableNumber.optional(),
  toeflScore: optionalNullableNumber.optional(),
  pteScore: optionalNullableNumber.optional(),
  gmatScore: optionalNullableNumber.optional(),
  greScore: optionalNullableNumber.optional(),
  satScore: optionalNullableNumber.optional(),
  actScore: optionalNullableNumber.optional(),
  finalScore: optionalNullableNumber.optional(),
  parentMonthlyIncome: z.coerce.number().int().min(0).optional(),
  notes: z.string().optional(),
});

export const studentUpdateSchema = studentCreateSchema.partial();

export type StudentCreateInput = z.infer<typeof studentCreateSchema>;
export type StudentUpdateInput = z.infer<typeof studentUpdateSchema>;
