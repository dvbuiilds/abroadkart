import { Card, CardContent, CardHeader } from "@app/components/ui/card";
import { Badge } from "@app/components/ui/badge";
import type { Student } from "@app/graphql/types";
import { format } from "date-fns";

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
            <p className="font-medium">{student.targetCountry ?? "—"}</p>
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
            <p className="text-xs text-muted-foreground">Education Level</p>
            <p className="font-medium">{student.educationLevel ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">English Test</p>
            <p className="font-medium">
              {[student.englishTestType, student.englishTestScore]
                .filter(Boolean)
                .join(" ") || "—"}
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
