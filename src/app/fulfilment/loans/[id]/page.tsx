'use client';

import { use } from 'react';
import { PageHeader } from '@app/components/shared/PageHeader';
import { FulfilmentLoanDetail } from '@app/components/fulfilment/loans/FulfilmentLoanDetail';
import { LoadingSpinner } from '@app/components/shared/LoadingSpinner';
import { useFulfilmentLoan } from '@app/hooks/useFulfilmentLoans';

export default function FulfilmentLoanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: loan, isLoading, isError } = useFulfilmentLoan(id);

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
            { label: 'Loans', href: '/fulfilment/loans' },
            { label: 'Detail' },
          ]}
        />
        <p className="text-destructive">Failed to load loan.</p>
      </div>
    );
  }

  const shortId = loan.id.slice(0, 8);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Loan ${shortId}`}
        breadcrumbs={[
          { label: 'Loans', href: '/fulfilment/loans' },
          { label: shortId },
        ]}
      />

      <FulfilmentLoanDetail loan={loan} />
    </div>
  );
}
