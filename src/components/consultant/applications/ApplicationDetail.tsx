import { Card, CardContent, CardHeader } from "@app/components/ui/card";
import { Badge } from "@app/components/ui/badge";
import type { Application } from "@app/graphql/types";
import { format } from "date-fns";

const STATUS_STEPS = [
  "draft",
  "submitted",
  "underReview",
  "waitlisted",
  "accepted",
  "rejected",
];

export function ApplicationDetail({
  application,
}: {
  application: Application;
}) {
  const currentIndex = STATUS_STEPS.indexOf(application.status ?? "draft");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <p className="text-sm font-medium text-muted-foreground">Status</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {STATUS_STEPS.map((step, i) => (
              <Badge
                key={step}
                variant={
                  i <= currentIndex
                    ? i === currentIndex
                      ? "default"
                      : "secondary"
                    : "outline"
                }
              >
                {step}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <p className="text-sm font-medium text-muted-foreground">
            Program & University
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="font-medium">{application.program?.name ?? "—"}</p>
          <p className="text-sm text-muted-foreground">
            {application.program?.university?.name ?? "—"}
            {application.program?.university?.country &&
              `, ${application.program.university.country}`}
          </p>
          {application.program?.field && (
            <p className="text-sm">Field: {application.program.field}</p>
          )}
          {application.program?.tuitionFeePerYear != null && (
            <p className="text-sm">
              Tuition: {application.program.currency ?? "USD"}{" "}
              {application.program.tuitionFeePerYear.toLocaleString()}/year
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <p className="text-sm font-medium text-muted-foreground">
            Student & Scores
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="font-medium">
            {application.student?.fullName ?? application.student?.email ?? "—"}
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {application.gpa != null && (
              <p className="text-sm">GPA: {application.gpa}</p>
            )}
            {application.gre != null && (
              <p className="text-sm">GRE: {application.gre}</p>
            )}
            {application.gmat != null && (
              <p className="text-sm">GMAT: {application.gmat}</p>
            )}
          </div>
          {application.applicationDate && (
            <p className="text-sm text-muted-foreground">
              Application date:{" "}
              {format(new Date(application.applicationDate), "MMM d, yyyy")}
            </p>
          )}
          {application.responseDate && (
            <p className="text-sm text-muted-foreground">
              Response date:{" "}
              {format(new Date(application.responseDate), "MMM d, yyyy")}
            </p>
          )}
          {application.remarks && (
            <p className="text-sm pt-2">Remarks: {application.remarks}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
