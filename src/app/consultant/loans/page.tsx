'use client';

import { useMemo, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { PageHeader } from '@app/components/shared/PageHeader';
import { Button } from '@app/components/ui/button';
import { LoanTable } from '@app/components/consultant/loans/LoanTable';
import { LoanCreateDialog } from '@app/components/consultant/loans/LoanCreateDialog';
import { EmptyState } from '@app/components/shared/EmptyState';
import { LoadingSpinner } from '@app/components/shared/LoadingSpinner';
import { useLoans } from '@app/hooks/useLoans';
import { Plus } from 'lucide-react';

const PAGE_SIZE = 10;

export default function LoansPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Math.max(0, parseInt(searchParams.get('page') ?? '1', 10) - 1);
  const status = searchParams.get('status') ?? 'all';
  const studentId = searchParams.get('studentId') ?? '';

  const variables = useMemo(() => {
    const where: Record<string, unknown> = {
      isDeleted: { not: { equals: true } },
    };
    if (status !== 'all') where.status = { equals: status };
    if (studentId) where.student = { id: { equals: studentId } };
    return { where, orderBy: [{ createdAt: 'desc' }], take: PAGE_SIZE, skip: page * PAGE_SIZE };
  }, [status, studentId, page]);

  const { data, isLoading, isError } = useLoans(variables);

  const updateParams = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === '' || v === 'all') next.delete(k);
      else next.set(k, v);
    });
    router.replace(`${pathname}?${next.toString()}`);
  };

  const [createOpen, setCreateOpen] = useState(false);
  const showCreate = createOpen || searchParams.get('new') === '1';
  const preselectedStudentId = searchParams.get('studentId') || undefined;

  const loans = data?.loanApplications ?? [];

  if (isError) {
    return (
      <div className="space-y-4">
        <PageHeader title="Loans" />
        <p className="text-destructive">Failed to load loans.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Loans"
        breadcrumbs={[{ label: 'Loans' }]}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Initiate Loan
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : loans.length === 0 ? (
        <EmptyState
          title="No loans yet"
          description="Initiate a loan for a student."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Initiate Loan
            </Button>
          }
        />
      ) : (
        <LoanTable loans={loans} />
      )}

      <LoanCreateDialog
        open={showCreate}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) updateParams({ new: '', studentId: '' });
        }}
        preselectedStudentId={preselectedStudentId}
        onSuccess={() => updateParams({})}
      />
    </div>
  );
}
