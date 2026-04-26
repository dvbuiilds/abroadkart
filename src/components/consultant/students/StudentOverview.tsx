import { Card, CardContent, CardHeader } from "@app/components/ui/card";
import { Badge } from "@app/components/ui/badge";
import type { Student } from "@app/graphql/types";
import { format } from "date-fns";
import {
  budgetPerYearLabelMap,
  programDisciplineLabelMap,
  qualificationLabelMap,
  targetCountryLabelMap,
  targetYearLabelMap,
  workExperienceLabelMap,
} from "@app/lib/students/options";

const STAGE_VARIANTS: Record<
  string,
  "default" | "secondary" | "outline" | "success" | "warning"
> = {
  lead: "secondary",
  prospect: "secondary",
  applied: "outline",
  inLoanProcess: "warning",
  enrolled: "success",
  graduated: "default",
};

export function StudentOverview({ student }: { student: Student }) {
  return (
    <Card>
      <CardHeader>
        <p className="text-sm font-medium text-muted-foreground">
          Basic Information
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="font-medium">{student.email ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Phone</p>
            <p className="font-medium">{student.phone ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              Country of Residence
            </p>
            <p className="font-medium">{student.countryOfResidence ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Target Country</p>
            <p className="font-medium">
              {student.targetCountry
                ? targetCountryLabelMap[student.targetCountry] ??
                  student.targetCountry
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Current Stage</p>
            <Badge
              variant={
                STAGE_VARIANTS[student.currentStage ?? ""] ?? "secondary"
              }
            >
              {student.currentStage ?? "—"}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Qualification</p>
            <p className="font-medium">
              {student.qualification
                ? qualificationLabelMap[student.qualification] ??
                  student.qualification
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Target Year</p>
            <p className="font-medium">
              {student.targetYear
                ? targetYearLabelMap[student.targetYear] ?? student.targetYear
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Budget Per Year</p>
            <p className="font-medium">
              {student.budgetPerYear
                ? budgetPerYearLabelMap[student.budgetPerYear] ??
                  student.budgetPerYear
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Work Experience</p>
            <p className="font-medium">
              {student.workExperience
                ? workExperienceLabelMap[student.workExperience] ??
                  student.workExperience
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              Open for Scholarships & Loans
            </p>
            <p className="font-medium">
              {student.openForScholarshipsLoans ? "Yes" : "No"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Created</p>
            <p className="font-medium">
              {student.createdAt
                ? format(new Date(student.createdAt), "MMM d, yyyy")
                : "—"}
            </p>
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Program Disciplines</p>
          <p className="font-medium">
            {Array.isArray(student.programDisciplines) &&
            student.programDisciplines.length
              ? student.programDisciplines
                  .map(
                    (discipline) =>
                      programDisciplineLabelMap[discipline] ?? discipline
                  )
                  .join(", ")
              : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Test Scores</p>
          <p className="font-medium">
            {[
              student.ieltsScore != null
                ? `IELTS: ${Number(student.ieltsScore).toFixed(2)}`
                : null,
              student.toeflScore != null
                ? `TOEFL: ${Number(student.toeflScore).toFixed(2)}`
                : null,
              student.pteScore != null
                ? `PTE: ${Number(student.pteScore).toFixed(2)}`
                : null,
              student.gmatScore != null
                ? `GMAT: ${Number(student.gmatScore).toFixed(2)}`
                : null,
              student.greScore != null
                ? `GRE: ${Number(student.greScore).toFixed(2)}`
                : null,
              student.satScore != null
                ? `SAT: ${Number(student.satScore).toFixed(2)}`
                : null,
              student.actScore != null
                ? `ACT: ${Number(student.actScore).toFixed(2)}`
                : null,
            ]
              .filter(Boolean)
              .join(" | ") || "—"}
          </p>
        </div>
        {student.notes && (
          <div>
            <p className="text-xs text-muted-foreground">Notes</p>
            <p className="text-sm">{student.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
