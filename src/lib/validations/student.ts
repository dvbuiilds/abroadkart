import { z } from 'zod';
import {
  PROGRAM_DISCIPLINE_OPTIONS,
  QUALIFICATION_OPTIONS,
  STAGE_OPTIONS,
  TARGET_YEAR_OPTIONS,
  WORK_EXPERIENCE_OPTIONS,
  PRIORITY_OPTIONS,
  GENDER_OPTIONS,
  SOURCE_OPTIONS,
  STUDY_LEVEL_OPTIONS,
  PREFERRED_INTAKE_OPTIONS,
  FUNDING_TYPE_OPTIONS,
  ACADEMIC_SCORE_TYPE_OPTIONS,
} from '@app/lib/students/options';

const stageOptions = STAGE_OPTIONS.map((option) => option.value) as [
  (typeof STAGE_OPTIONS)[number]['value'],
  ...(typeof STAGE_OPTIONS)[number]['value'][]
];
const qualificationOptions = QUALIFICATION_OPTIONS.map((option) => option.value) as [
  (typeof QUALIFICATION_OPTIONS)[number]['value'],
  ...(typeof QUALIFICATION_OPTIONS)[number]['value'][]
];
const targetYearOptions = TARGET_YEAR_OPTIONS.map((option) => option.value) as [
  (typeof TARGET_YEAR_OPTIONS)[number]['value'],
  ...(typeof TARGET_YEAR_OPTIONS)[number]['value'][]
];
const workExperienceOptions = WORK_EXPERIENCE_OPTIONS.map((option) => option.value) as [
  (typeof WORK_EXPERIENCE_OPTIONS)[number]['value'],
  ...(typeof WORK_EXPERIENCE_OPTIONS)[number]['value'][]
];
const programDisciplineOptions = PROGRAM_DISCIPLINE_OPTIONS.map((option) => option.value) as [
  (typeof PROGRAM_DISCIPLINE_OPTIONS)[number]['value'],
  ...(typeof PROGRAM_DISCIPLINE_OPTIONS)[number]['value'][]
];
const priorityOptions = PRIORITY_OPTIONS.map((option) => option.value) as [
  (typeof PRIORITY_OPTIONS)[number]['value'],
  ...(typeof PRIORITY_OPTIONS)[number]['value'][]
];
const genderOptions = GENDER_OPTIONS.map((option) => option.value) as [
  (typeof GENDER_OPTIONS)[number]['value'],
  ...(typeof GENDER_OPTIONS)[number]['value'][]
];
const sourceOptions = SOURCE_OPTIONS.map((option) => option.value) as [
  (typeof SOURCE_OPTIONS)[number]['value'],
  ...(typeof SOURCE_OPTIONS)[number]['value'][]
];
const studyLevelOptions = STUDY_LEVEL_OPTIONS.map((option) => option.value) as [
  (typeof STUDY_LEVEL_OPTIONS)[number]['value'],
  ...(typeof STUDY_LEVEL_OPTIONS)[number]['value'][]
];
const preferredIntakeOptions = PREFERRED_INTAKE_OPTIONS.map((option) => option.value) as [
  (typeof PREFERRED_INTAKE_OPTIONS)[number]['value'],
  ...(typeof PREFERRED_INTAKE_OPTIONS)[number]['value'][]
];
const fundingTypeOptions = FUNDING_TYPE_OPTIONS.map((option) => option.value) as [
  (typeof FUNDING_TYPE_OPTIONS)[number]['value'],
  ...(typeof FUNDING_TYPE_OPTIONS)[number]['value'][]
];
const academicScoreTypeOptions = ACADEMIC_SCORE_TYPE_OPTIONS.map((option) => option.value) as [
  (typeof ACADEMIC_SCORE_TYPE_OPTIONS)[number]['value'],
  ...(typeof ACADEMIC_SCORE_TYPE_OPTIONS)[number]['value'][]
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

  gender: z.enum(genderOptions).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  source: z.enum(sourceOptions).optional(),

  qualification: z.enum(qualificationOptions).optional(),
  stream: z.string().optional(),
  subjects: z.array(z.string()).optional(),
  academicScore: z.coerce.number().optional(),
  academicScoreType: z.enum(academicScoreTypeOptions).optional(),
  backlogCount: z.coerce.number().int().optional(),
  yearOfPassing: z.coerce.number().int().optional(),
  institutionName: z.string().optional(),

  duolingoScore: optionalNullableNumber.optional(),
  testAppearingDate: z.coerce.date().optional(),
  ieltsScore: optionalNullableNumber.optional(),
  toeflScore: optionalNullableNumber.optional(),
  pteScore: optionalNullableNumber.optional(),
  gmatScore: optionalNullableNumber.optional(),
  greScore: optionalNullableNumber.optional(),
  satScore: optionalNullableNumber.optional(),
  actScore: optionalNullableNumber.optional(),
  finalScore: optionalNullableNumber.optional(),

  workExperience: z.enum(workExperienceOptions).optional(),
  employer: z.string().optional(),
  designation: z.string().optional(),
  gapExplanation: z.string().optional(),

  targetCountries: z.array(z.string()).optional(),
  targetCourses: z.array(z.string()).optional(),
  studyLevel: z.enum(studyLevelOptions).optional(),
  preferredIntake: z.enum(preferredIntakeOptions).optional(),
  targetYear: z.enum(targetYearOptions).optional(),

  budgetTuition: z.coerce.number().int().optional(),
  budgetLiving: z.coerce.number().int().optional(),
  budgetCurrency: z.string().optional().default('USD'),
  fundingType: z.enum(fundingTypeOptions).optional(),
  loanPreApproved: z.boolean().optional().default(false),

  priorVisaRefusals: z.boolean().optional().default(false),
  refusalCountries: z.array(z.string()).optional(),
  refusalReason: z.string().optional(),
  passportAvailable: z.boolean().optional().default(false),
  passportExpiry: z.coerce.date().optional(),

  currentStage: z.enum(stageOptions).optional().default('lead'),
  priority: z.enum(priorityOptions).optional(),
  lostReason: z.string().optional(),
  assignedCounsellor: z.string().uuid().optional(),

  parentMonthlyIncome: z.coerce.number().int().min(0).optional(),
  notes: z.string().optional(),

  programDisciplines: z.array(z.enum(programDisciplineOptions)).optional(),
});

export const studentUpdateSchema = studentCreateSchema.partial();

export type StudentCreateInput = z.infer<typeof studentCreateSchema>;
export type StudentUpdateInput = z.infer<typeof studentUpdateSchema>;
