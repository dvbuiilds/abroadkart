'use client';

import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@app/components/ui/alert';
import { useOverdueItems } from '@app/hooks/useFulfilmentDashboard';
import { AlertTriangle } from 'lucide-react';

export function OverdueAlerts() {
  const { data, isLoading, isError } = useOverdueItems(10);

  if (isLoading || isError || !data) return null;

  const overdueLoans = data.overdueLoans ?? [];
  const overdueDocs = data.overdueDocuments ?? [];
  const total = overdueLoans.length + overdueDocs.length;

  if (total === 0) return null;

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>SLA breach (over 48h)</AlertTitle>
      <AlertDescription>
        <span className="font-medium">{total} overdue items</span>
        {overdueLoans.length > 0 && (
          <span>
            {' '}
            — {overdueLoans.length} loan(s) in review:{' '}
            {overdueLoans.slice(0, 3).map((l) => l.student?.fullName ?? 'Unknown').join(', ')}
            {overdueLoans.length > 3 && ` +${overdueLoans.length - 3} more`}
          </span>
        )}
        {overdueDocs.length > 0 && (
          <span>
            {' '}
            — {overdueDocs.length} document(s) pending verification
          </span>
        )}
        <div className="mt-2">
          <Link
            href="/fulfilment/loans?status=underReview"
            className="text-sm font-medium underline hover:no-underline"
          >
            View loan queue
          </Link>
          {' · '}
          <Link
            href="/fulfilment/documents?status=pending"
            className="text-sm font-medium underline hover:no-underline"
          >
            View document queue
          </Link>
        </div>
      </AlertDescription>
    </Alert>
  );
}
