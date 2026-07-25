import Link from "next/link";
import { Card, CardContent, CardHeader } from "@app/components/ui/card";
import { Badge } from "@app/components/ui/badge";
import { Button } from "@app/components/ui/button";
import type { ApplicationListItem } from "@app/graphql/types";
import { format } from "date-fns";
import { Plus, FileText } from "lucide-react";

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "outline" | "success" | "warning" | "destructive"
> = {
  drafted: "secondary",
  submitted: "outline",
  underReview: "warning",
  accepted: "success",
  rejected: "destructive",
  waitlisted: "warning",
  offerReceived: "success",
  conditional: "warning",
  deferred: "outline",
};

export function StudentApplicationsTab({
  applications,
  onCreateClick,
}: {
  applications?: ApplicationListItem[];
  studentId: string;
  onCreateClick?: () => void;
}) {
  const list = applications ?? [];

  return (
    <div className="space-y-4">
      {onCreateClick && (
        <div className="flex justify-end">
          <Button size="sm" onClick={onCreateClick}>
            <Plus className="mr-2 h-4 w-4" />
            Add Application
          </Button>
        </div>
      )}
      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">No applications yet.</p>
      ) : (
        <div className="space-y-4">
          {list.map((app) => (
            <Card key={app.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-medium">
                      {app.program?.name ?? "Program"}
                    </h4>
                    {app.program?.university?.name && (
                      <p className="text-sm text-muted-foreground">
                        {app.program.university.name}
                      </p>
                    )}
                  </div>
                  <Badge variant={STATUS_VARIANTS[app.status ?? ""] ?? "outline"}>
                    {app.status ?? "—"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Application Date
                    </p>
                    <p className="font-medium">
                      {app.applicationDate
                        ? format(new Date(app.applicationDate), "MMM d, yyyy")
                        : "—"}
                    </p>
                  </div>
                  {app.tuitionFeeOffered != null && (
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Tuition Fee Offered
                      </p>
                      <p className="font-medium">
                        ${Number(app.tuitionFeeOffered).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {app.scholarshipAwarded != null && (
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Scholarship Awarded
                      </p>
                      <p className="font-medium">
                        ${Number(app.scholarshipAwarded).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {app.conditionalRequirements && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Conditional Requirements
                    </p>
                    <p className="text-sm">{app.conditionalRequirements}</p>
                  </div>
                )}

                {app.offerLetter?.url && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Offer Letter
                    </p>
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={app.offerLetter.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        {app.offerLetter.filename ?? "Download"}
                      </a>
                    </Button>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/consultant/applications/${app.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
