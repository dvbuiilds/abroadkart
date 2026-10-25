/**
 * Approved descriptions for the blog categories. The WordPress export has none,
 * so the category pages would otherwise show "Articles about X.". Approved
 * 2026-10-19. An export description, when present, takes precedence.
 */
export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "application-assistance":
    "Guides to the application paperwork for studying abroad, including letters of recommendation, I-20 forms and universities that waive application fees.",
  counselling:
    "Advice for planning your study abroad journey, from choosing between an MBA and a PGDM to meeting admission requirements and preparing for visa interviews.",
  "course-university-selection":
    "How to choose a course and university abroad, with program comparisons, university lists and guides to syllabi, application requirements and costs.",
  "education-loan":
    "How Indian students can finance their studies abroad, with a guide to the education loan application process.",
  others:
    "Practical guides for studying abroad that don't fit elsewhere, covering visa paperwork, bank balances, credit scores, accommodation and academic transcripts.",
  scholarships: "Scholarships and financial aid for Indian students planning to study abroad.",
  "standardised-test-preparation":
    "Preparation guides for English and admission tests such as IELTS, TOEFL, PTE and Duolingo, with tips for high scores and avoiding common mistakes.",
  "study-cost":
    "What studying abroad costs, including tuition, living expenses and hidden fees, with breakdowns for popular destinations.",
  "top-universities":
    "Rankings-based guides to top universities and business schools for international students, plus advice on dual degree programs.",
  visa: "Student visa guides for popular destinations, covering interviews, proof of funds, post-study work options and recent policy changes.",
  "work-experience":
    "How work experience affects your study abroad plans, including whether an MS in the USA needs it and how to build a strong profile.",
};

/** The export description when it has text, otherwise the approved overlay. */
export function resolveCategoryDescription(slug: string, exported: string | undefined): string {
  if (exported && exported.trim().length > 0) return exported;
  return CATEGORY_DESCRIPTIONS[slug] ?? "";
}
