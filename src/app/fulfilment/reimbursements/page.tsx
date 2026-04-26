'use client';

import { useMemo, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { PageHeader } from '@app/components/shared/PageHeader';
import { ReimbursementFilters } from '@app/components/fulfilment/reimbursements/ReimbursementFilters';
import { ReimbursementTable } from '@app/components/fulfilment/reimbursements/ReimbursementTable';
import { ReimbursementActionDialog } from '@app/components/fulfilment/reimbursements/ReimbursementActionDialog';
import { EmptyState } from '@app/components/shared/EmptyState';
import { LoadingSpinner } from '@app/components/shared/LoadingSpinner';
import { useReimbursements } from '@app/hooks/useReimbursements';
import type { ReimbursementListItem } from '@app/graphql/types';

const PAGE_SIZE = 20;

export default function FulfilmentReimbursementsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Math.max(0, parseInt(searchParams.get('page') ?? '1', 10) - 1);
  const status = searchParams.get('status') ?? 'all';
  const category = searchParams.get('category') ?? 'all';

  const variables = useMemo(() => {
    const where: Record<string, unknown> = {};
    if (status !== 'all') where.status = { equals: status };
    if (category !== 'all') where.category = { equals: category };
    return {
      where,
      orderBy: [{ createdAt: 'desc' }],
      take: PAGE_SIZE,
      skip: page * PAGE_SIZE,
    };
  }, [status, category, page]);

  const { data, isLoading, isError } = useReimbursements(variables);

  const updateParams = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === '' || v === 'all') next.delete(k);
      else next.set(k, v);
    });
    router.replace(`${pathname}?${next.toString()}`);
  };

  const [actionReimbursement, setActionReimbursement] = useState<ReimbursementListItem | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'reimbursed'>('approve');
  const [dialogOpen, setDialogOpen] = useState(false);

  const reimbursements = data?.reimbursements ?? [];

  if (isError) {
    return (
      <div className="space-y-4">
        <PageHeader title="Reimbursements" breadcrumbs={[{ label: 'Reimbursements' }]} />
        <p className="text-destructive">Failed to load reimbursements.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Reimbursements"
        breadcrumbs={[{ label: 'Reimbursements', href: '/fulfilment/reimbursements' }]}
      />

      <ReimbursementFilters
        status={status}
        category={category}
        onStatusChange={(v) => updateParams({ status: v, page: '1' })}
        onCategoryChange={(v) => updateParams({ category: v, page: '1' })}
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : reimbursements.length === 0 ? (
        <EmptyState
          title="No reimbursements found"
          description="No reimbursement requests match your filters."
        />
      ) : (
        <ReimbursementTable
          reimbursements={reimbursements}
          onApprove={(r) => {
            setActionReimbursement(r);
            setActionType('approve');
            setDialogOpen(true);
          }}
          onReject={(r) => {
            setActionReimbursement(r);
            setActionType('reject');
            setDialogOpen(true);
          }}
          onMarkReimbursed={(r) => {
            setActionReimbursement(r);
            setActionType('reimbursed');
            setDialogOpen(true);
          }}
        />
      )}

      <ReimbursementActionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        reimbursement={actionReimbursement}
        action={actionType}
      />
    </div>
  );
}
