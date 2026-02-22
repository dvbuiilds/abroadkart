export const TARGET_COUNTRY_OPTIONS = [
  { value: "AUS", label: "Australia" },
  { value: "IRL", label: "Ireland" },
  { value: "UK", label: "United Kingdom" },
  { value: "FR", label: "France" },
  { value: "GER", label: "Germany" },
  { value: "NZ", label: "New Zealand" },
  { value: "POL", label: "Poland" },
] as const;

export const STAGE_OPTIONS = [
  { value: "lead", label: "Lead" },
  { value: "prospect", label: "Prospect" },
  { value: "applied", label: "Applied" },
  { value: "inLoanProcess", label: "In Loan Process" },
  { value: "enrolled", label: "Enrolled" },
  { value: "graduated", label: "Graduated" },
] as const;

export const QUALIFICATION_OPTIONS = [
  { value: "intermediate", label: "Intermediate" },
  { value: "bachelors", label: "Bachelors" },
  { value: "masters", label: "Masters" },
] as const;

export const TARGET_YEAR_OPTIONS = [
  { value: "2026", label: "2026" },
  { value: "2027", label: "2027" },
  { value: "2028", label: "2028" },
  { value: "2029", label: "2029" },
] as const;

export const BUDGET_PER_YEAR_OPTIONS = [
  { value: "lt20k", label: "<20K USD" },
  { value: "20to30k", label: "20-30K USD" },
  { value: "30to40k", label: "30-40K USD" },
  { value: "40to50k", label: "40-50K USD" },
  { value: "gt50k", label: ">50K USD" },
] as const;

export const WORK_EXPERIENCE_OPTIONS = [
  { value: "0", label: "0 years" },
  { value: "1", label: "1 year" },
  { value: "2", label: "2 years" },
  { value: "3", label: "3 years" },
  { value: "4", label: "4 years" },
  { value: "4plus", label: "4+ years" },
] as const;

export const PROGRAM_DISCIPLINE_OPTIONS = [
  { value: "computerScience", label: "Computer Science" },
  { value: "dataScience", label: "Data Science" },
  { value: "engineering", label: "Engineering" },
  { value: "medicine", label: "Medicine" },
  { value: "business", label: "Business" },
  { value: "law", label: "Law" },
  { value: "artsAndDesign", label: "Arts & Design" },
  { value: "socialSciences", label: "Social Sciences" },
  { value: "education", label: "Education" },
  { value: "agriculture", label: "Agriculture" },
] as const;

export const TEST_SCORE_FIELDS = [
  { key: "ieltsScore", label: "IELTS" },
  { key: "toeflScore", label: "TOEFL" },
  { key: "pteScore", label: "PTE" },
  { key: "gmatScore", label: "GMAT" },
  { key: "greScore", label: "GRE" },
  { key: "satScore", label: "SAT" },
  { key: "actScore", label: "ACT" },
] as const;

export const targetCountryLabelMap = Object.fromEntries(
  TARGET_COUNTRY_OPTIONS.map((o) => [o.value, o.label])
) as Record<string, string>;

export const qualificationLabelMap = Object.fromEntries(
  QUALIFICATION_OPTIONS.map((o) => [o.value, o.label])
) as Record<string, string>;

export const targetYearLabelMap = Object.fromEntries(
  TARGET_YEAR_OPTIONS.map((o) => [o.value, o.label])
) as Record<string, string>;

export const budgetPerYearLabelMap = Object.fromEntries(
  BUDGET_PER_YEAR_OPTIONS.map((o) => [o.value, o.label])
) as Record<string, string>;

export const workExperienceLabelMap = Object.fromEntries(
  WORK_EXPERIENCE_OPTIONS.map((o) => [o.value, o.label])
) as Record<string, string>;

export const programDisciplineLabelMap = Object.fromEntries(
  PROGRAM_DISCIPLINE_OPTIONS.map((o) => [o.value, o.label])
) as Record<string, string>;
