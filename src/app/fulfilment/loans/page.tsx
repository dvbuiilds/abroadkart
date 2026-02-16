'use client';

import { useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { PageHeader } from '@app/components/shared/PageHeader';
import { FulfilmentLoanFilters } from '@app/components/fulfilment/loans/FulfilmentLoanFilters';
import { FulfilmentLoanTable } from '@app/components/fulfilment/loans/FulfilmentLoanTable';
import { FulfilmentLoanPagination } from '@app/components/fulfilment/loans/FulfilmentLoanPagination';
import { EmptyState } from '@app/components/shared/EmptyState';
import { LoadingSpinner } from '@app/components/shared/LoadingSpinner';
import { useFulfilmentLoans } from '@app/hooks/useFulfilmentLoans';

const PAGE_SIZE = 10;

export default function FulfilmentLoansPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Math.max(0, parseInt(searchParams.get('page') ?? '1', 10) - 1);
  const status = searchParams.get('status') ?? 'all';
  const consultantId = searchParams.get('consultant') ?? '';
  const search = searchParams.get('search') ?? '';

  const variables = useMemo(() => {
    const conditions: Record<string, unknown>[] = [
      { isDeleted: { not: { equals: true } } },
    ];
    if (status !== 'all') conditions.push({ status: { equals: status } });
    if (consultantId) conditions.push({ tenant: { id: { equals: consultantId } } });
    if (search.trim()) {
      conditions.push({
        OR: [
          { student: { fullName: { contains: search.trim(), mode: 'insensitive' } } },
          { student: { email: { contains: search.trim(), mode: 'insensitive' } } },
          { tenant: { name: { contains: search.trim(), mode: 'insensitive' } } },
        ],
      });
    }
    const where = conditions.length === 1 ? conditions[0] : { AND: conditions };
    return {
      where,
      orderBy: [{ createdAt: 'desc' }],
      take: PAGE_SIZE,
      skip: page * PAGE_SIZE,
    };
  }, [status, consultantId, search, page]);

  const { data, isLoading, isError } = useFulfilmentLoans(variables);

  const updateParams = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === '' || v === 'all') next.delete(k);
      else next.set(k, v);
    });
    router.replace(`${pathname}?${next.toString()}`);
  };

  const loans = data?.loanApplications ?? [];
  const total = data?.loanApplicationsCount ?? 0;

  if (isError) {
    return (
      <div className="space-y-4">
        <PageHeader title="Loan Queue" breadcrumbs={[{ label: 'Loans' }]} />
        <p className="text-destructive">Failed to load loans.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Loan Queue"
        breadcrumbs={[{ label: 'Loans', href: '/fulfilment/loans' }]}
      />

      <FulfilmentLoanFilters
        search={search}
        status={status}
        consultantId={consultantId}
        onSearchChange={(v) => updateParams({ search: v, page: '1' })}
        onStatusChange={(v) => updateParams({ status: v, page: '1' })}
        onConsultantChange={(v) => updateParams({ consultant: v, page: '1' })}
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : loans.length === 0 ? (
        <EmptyState
          title="No loans found"
          description="No loan applications match your filters."
        />
      ) : (
        <>
          <FulfilmentLoanTable loans={loans} />
          <FulfilmentLoanPagination
            total={total}
            skip={page * PAGE_SIZE}
            onPageChange={(skip) =>
              updateParams({ page: String(Math.floor(skip / PAGE_SIZE) + 1) })
            }
          />
        </>
      )}
    </div>
  );
}
