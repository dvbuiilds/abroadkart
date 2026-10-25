"use client";

import { useParams } from "next/navigation";
import { PageHeader } from "@app/components/shared/PageHeader";
import { LoadingSpinner } from "@app/components/shared/LoadingSpinner";
import { useLoan } from "@app/hooks/useLoans";
import { LoanDetail } from "@app/components/consultant/loans/LoanDetail";

export default function LoanDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: loan, isLoading, isError } = useLoan(id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError || !loan) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Loan"
          breadcrumbs={[
            { label: "Loans", href: "/consultant/loans" },
            { label: "Not found" },
          ]}
        />
        <p className="text-destructive">Loan not found.</p>
      </div>
    );
  }

  const title = loan.student?.fullName
    ? `Loan – ${loan.student.fullName}`
    : `Loan ${loan.id.slice(0, 8)}`;

  return (
    <div className="space-y-4">
      <PageHeader
        title={title}
        breadcrumbs={[
          { label: "Loans", href: "/consultant/loans" },
          { label: title },
        ]}
      />
      <LoanDetail loan={loan} />
    </div>
  );
}
