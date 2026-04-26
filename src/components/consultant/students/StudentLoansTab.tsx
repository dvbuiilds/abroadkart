import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@app/components/ui/table";
import { Badge } from "@app/components/ui/badge";
import { Button } from "@app/components/ui/button";
import type { LoanListItem } from "@app/graphql/types";
import { format } from "date-fns";

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "outline" | "success" | "warning" | "destructive"
> = {
  initiated: "secondary",
  documentsPending: "warning",
  underReview: "outline",
  approved: "success",
  rejected: "destructive",
  disbursed: "default",
  closed: "secondary",
};

export function StudentLoansTab({
  loans,
  onCreateClick,
}: {
  loans?: LoanListItem[];
  onCreateClick?: () => void;
}) {
  const list = loans ?? [];

  return (
    <div className="space-y-4">
      {onCreateClick && (
        <div className="flex justify-end">
          <Button size="sm" onClick={onCreateClick}>
            Add Loan
          </Button>
        </div>
      )}
      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">No loans yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((loan) => (
              <TableRow key={loan.id}>
                <TableCell>
                  {loan.currency ?? "INR"}{" "}
                  {(
                    loan.loanAmountRequested ??
                    loan.loanAmountApproved ??
                    0
                  ).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={STATUS_VARIANTS[loan.status ?? ""] ?? "secondary"}
                  >
                    {loan.status ?? "—"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {loan.createdAt
                    ? format(new Date(loan.createdAt), "MMM d, yyyy")
                    : "—"}
                </TableCell>
                <TableCell>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/consultant/loans/${loan.id}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
