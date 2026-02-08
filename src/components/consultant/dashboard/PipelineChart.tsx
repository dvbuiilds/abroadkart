"use client";

import { Card, CardContent, CardHeader } from "@app/components/ui/card";
import { Skeleton } from "@app/components/ui/skeleton";
import { usePipelineCounts } from "@app/hooks/useDashboard";

const STAGES = [
  { key: "lead", label: "Lead" },
  { key: "prospect", label: "Prospect" },
  { key: "applied", label: "Applied" },
  { key: "inLoanProcess", label: "In Loan Process" },
  { key: "enrolled", label: "Enrolled" },
  { key: "graduated", label: "Graduated" },
] as const;

export function PipelineChart() {
  const { data, isLoading, isError } = usePipelineCounts();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {STAGES.map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardHeader>
          <p className="text-sm font-medium">Pipeline Overview</p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Unable to load pipeline.
          </p>
        </CardContent>
      </Card>
    );
  }

  const counts = STAGES.map((s) => ({ ...s, count: data[s.key] ?? 0 }));
  const max = Math.max(...counts.map((c) => c.count), 1);

  return (
    <Card>
      <CardHeader>
        <p className="text-sm font-medium">Pipeline Overview</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {counts.map(({ key, label, count }) => (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{label}</span>
                <span className="font-medium">{count}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${(count / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
