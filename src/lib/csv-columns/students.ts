import type { CsvColumn } from "@app/lib/csv-export";
import type { Student } from "@app/graphql/types";
import {
  budgetPerYearLabelMap,
  programDisciplineLabelMap,
  qualificationLabelMap,
  targetCountryLabelMap,
  targetYearLabelMap,
  workExperienceLabelMap,
} from "@app/lib/students/options";

const formatDate = (value: unknown) => {
  if (!value) return "";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

export const STUDENT_CSV_COLUMNS: CsvColumn<Student>[] = [
  { key: "fullName", header: "Full Name" },
  { key: "email", header: "Email" },
  { key: "phone", header: "Phone" },
  { key: "countryOfResidence", header: "Country Of Residence" },
  {
    key: "targetCountry",
    header: "Target Country",
    transform: (value) =>
      value ? (targetCountryLabelMap[String(value)] ?? String(value)) : "",
  },
  { key: "currentStage", header: "Current Stage" },
  {
    key: "qualification",
    header: "Qualification",
    transform: (value) =>
      value ? (qualificationLabelMap[String(value)] ?? String(value)) : "",
  },
  {
    key: "workExperience",
    header: "Work Experience",
    transform: (value) =>
      value ? (workExperienceLabelMap[String(value)] ?? String(value)) : "",
  },
  {
    key: "targetYear",
    header: "Target Year",
    transform: (value) =>
      value ? (targetYearLabelMap[String(value)] ?? String(value)) : "",
  },
  {
    key: "budgetPerYear",
    header: "Budget Per Year",
    transform: (value) =>
      value ? (budgetPerYearLabelMap[String(value)] ?? String(value)) : "",
  },
  {
    key: "programDisciplines",
    header: "Program Disciplines",
    transform: (value) => {
      if (!Array.isArray(value)) return "";
      return value
        .map((entry) => programDisciplineLabelMap[String(entry)] ?? String(entry))
        .join(", ");
    },
  },
  {
    key: "openForScholarshipsLoans",
    header: "Open For Scholarships And Loans",
    transform: (value) => (value ? "Yes" : "No"),
  },
  { key: "ieltsScore", header: "IELTS" },
  { key: "toeflScore", header: "TOEFL" },
  { key: "pteScore", header: "PTE" },
  { key: "gmatScore", header: "GMAT" },
  { key: "greScore", header: "GRE" },
  { key: "satScore", header: "SAT" },
  { key: "actScore", header: "ACT" },
  { key: "finalScore", header: "Final Score" },
  { key: "parentMonthlyIncome", header: "Parent Monthly Income" },
  { key: "notes", header: "Notes" },
  { key: "createdAt", header: "Created At", transform: formatDate },
  { key: "updatedAt", header: "Updated At", transform: formatDate },
];
