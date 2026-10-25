import { Card, CardContent, CardHeader } from "@app/components/ui/card";
import { LoanStatusBadge } from "@app/components/consultant/loans/LoanStatusBadge";
import type { LoanApplication } from "@app/graphql/types";
import { format } from "date-fns";

const LOAN_STEPS = [
  "initiated",
  "documentsPending",
  "underReview",
  "approved",
  "disbursed",
];

export function LoanDetail({ loan }: { loan: LoanApplication }) {
  const currentIndex = LOAN_STEPS.indexOf(loan.status ?? "initiated");
  const progress =
    currentIndex >= 0 ? ((currentIndex + 1) / LOAN_STEPS.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <p className="text-sm font-medium text-muted-foreground">Status</p>
        </CardHeader>
        <CardContent className="space-y-2">
          <LoanStatusBadge status={loan.status} />
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {LOAN_STEPS.map((s, i) => (i <= currentIndex ? s : null))
              .filter(Boolean)
              .join(" → ")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <p className="text-sm font-medium text-muted-foreground">Student</p>
        </CardHeader>
        <CardContent>
          <p className="font-medium">
            {loan.student?.fullName ?? loan.student?.email ?? "—"}
          </p>
          {loan.student?.phone && (
            <p className="text-sm text-muted-foreground">
              {loan.student.phone}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <p className="text-sm font-medium text-muted-foreground">
            Loan Terms
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid gap-2 sm:grid-cols-2">
            <p className="text-sm">
              Requested: {loan.currency ?? "INR"}{" "}
              {(loan.loanAmountRequested ?? 0).toLocaleString()}
            </p>
            <p className="text-sm">
              Approved: {loan.currency ?? "INR"}{" "}
              {(loan.loanAmountApproved ?? 0).toLocaleString()}
            </p>
            <p className="text-sm">Tenure: {loan.loanTenure ?? "—"} months</p>
            <p className="text-sm">
              Interest rate: {loan.interestRate ?? "—"}%
            </p>
            <p className="text-sm">
              EMI:{" "}
              {loan.emi != null
                ? `${loan.currency ?? "INR"} ${loan.emi.toLocaleString()}`
                : "—"}
            </p>
          </div>
          {loan.approvedAt && (
            <p className="text-xs text-muted-foreground">
              Approved: {format(new Date(loan.approvedAt), "MMM d, yyyy")}
            </p>
          )}
          {loan.disburseDate && (
            <p className="text-xs text-muted-foreground">
              Disbursed: {format(new Date(loan.disburseDate), "MMM d, yyyy")}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <p className="text-sm font-medium text-muted-foreground">Remarks</p>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <p className="text-xs text-muted-foreground">Consultant</p>
            <p className="text-sm">{loan.consultantRemarks ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              Fulfilment (read-only)
            </p>
            <p className="text-sm text-muted-foreground">
              {loan.fulfilmentRemarks ?? "—"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
