'use client';

import { useMemo, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { PageHeader } from '@app/components/shared/PageHeader';
import { Button } from '@app/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/components/ui/select';
import { PrepaidCardTable } from '@app/components/fulfilment/cards/PrepaidCardTable';
import { PrepaidCardCreateDialog } from '@app/components/fulfilment/cards/PrepaidCardCreateDialog';
import { EmptyState } from '@app/components/shared/EmptyState';
import { LoadingSpinner } from '@app/components/shared/LoadingSpinner';
import { usePrepaidCards, useUpdatePrepaidCard } from '@app/hooks/usePrepaidCards';
import type { PrepaidCardListItem } from '@app/graphql/types';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

const PAGE_SIZE = 20;
const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'active', label: 'Active' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'expired', label: 'Expired' },
];

export default function FulfilmentCardsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Math.max(0, parseInt(searchParams.get('page') ?? '1', 10) - 1);
  const status = searchParams.get('status') ?? 'all';

  const variables = useMemo(() => {
    const where: Record<string, unknown> = {};
    if (status !== 'all') where.status = { equals: status };
    return {
      where,
      orderBy: [{ createdAt: 'desc' }],
      take: PAGE_SIZE,
      skip: page * PAGE_SIZE,
    };
  }, [status, page]);

  const { data, isLoading, isError } = usePrepaidCards(variables);
  const updateCard = useUpdatePrepaidCard();

  const updateParams = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === '' || v === 'all') next.delete(k);
      else next.set(k, v);
    });
    router.replace(`${pathname}?${next.toString()}`);
  };

  const [createOpen, setCreateOpen] = useState(false);

  const handleBlock = async (card: PrepaidCardListItem) => {
    try {
      await updateCard.mutateAsync({ id: card.id, data: { status: 'blocked' } });
      toast.success('Card blocked');
    } catch {
      toast.error('Failed to block card');
    }
  };

  const handleUnblock = async (card: PrepaidCardListItem) => {
    try {
      await updateCard.mutateAsync({ id: card.id, data: { status: 'active' } });
      toast.success('Card unblocked');
    } catch {
      toast.error('Failed to unblock card');
    }
  };

  const handleActivate = async (card: PrepaidCardListItem) => {
    try {
      await updateCard.mutateAsync({ id: card.id, data: { status: 'active' } });
      toast.success('Card activated');
    } catch {
      toast.error('Failed to activate card');
    }
  };

  const cards = data?.prepaidCards ?? [];

  if (isError) {
    return (
      <div className="space-y-4">
        <PageHeader title="Prepaid Cards" breadcrumbs={[{ label: 'Cards' }]} />
        <p className="text-destructive">Failed to load prepaid cards.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Prepaid Cards"
        breadcrumbs={[{ label: 'Cards', href: '/fulfilment/cards' }]}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Card
          </Button>
        }
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Select value={status} onValueChange={(v) => updateParams({ status: v, page: '1' })}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : cards.length === 0 ? (
        <EmptyState
          title="No prepaid cards"
          description="Create a prepaid card to get started."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Card
            </Button>
          }
        />
      ) : (
        <PrepaidCardTable
          cards={cards}
          onBlock={handleBlock}
          onUnblock={handleUnblock}
          onActivate={handleActivate}
        />
      )}

      <PrepaidCardCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
