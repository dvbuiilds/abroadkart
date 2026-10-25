import { Badge } from "@app/components/ui/badge";

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

export function LoanStatusBadge({ status }: { status: string | null }) {
  return (
    <Badge variant={STATUS_VARIANTS[status ?? ""] ?? "secondary"}>
      {status ?? "—"}
    </Badge>
  );
}
