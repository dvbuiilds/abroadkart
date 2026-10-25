import Link from "next/link";
import { useRouter } from "next/navigation";
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

export function LoanTable({ loans }: { loans: LoanListItem[] }) {
  const router = useRouter();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-[70px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loans.map((loan) => (
          <TableRow
            key={loan.id}
            className="cursor-pointer"
            onClick={() => router.push(`/consultant/loans/${loan.id}`)}
          >
            <TableCell className="font-medium">
              {loan.student?.fullName ?? loan.student?.email ?? "—"}
            </TableCell>
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
            <TableCell onClick={(e) => e.stopPropagation()}>
              <Button asChild variant="ghost" size="sm">
                <Link href={`/consultant/loans/${loan.id}`}>View</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
