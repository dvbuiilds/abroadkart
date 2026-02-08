import { z } from 'zod';

const stageOptions = ['lead', 'prospect', 'applied', 'inLoanProcess', 'enrolled', 'graduated'] as const;
const educationLevelOptions = ['highSchool', 'bachelor', 'master', 'phd'] as const;
const englishTestTypeOptions = ['IELTS', 'TOEFL', 'PTE'] as const;

export const studentCreateSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  countryOfResidence: z.string().min(1, 'Select a country'),
  targetCountry: z.string().optional(),
  currentStage: z.enum(stageOptions).optional().default('lead'),
  educationLevel: z.enum(educationLevelOptions).optional(),
  workExperience: z.coerce.number().int().min(0).optional(),
  englishTestScore: z.union([z.string(), z.number()]).optional(),
  englishTestType: z.enum(englishTestTypeOptions).optional(),
  parentMonthlyIncome: z.coerce.number().int().min(0).optional(),
  notes: z.string().optional(),
});

export const studentUpdateSchema = studentCreateSchema.partial();

export type StudentCreateInput = z.infer<typeof studentCreateSchema>;
export type StudentUpdateInput = z.infer<typeof studentUpdateSchema>;
