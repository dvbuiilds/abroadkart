'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@app/components/ui/card';
import { Skeleton } from '@app/components/ui/skeleton';
import { useFulfilmentKPIs } from '@app/hooks/useFulfilmentDashboard';
import { FileStack } from 'lucide-react';

export function PendingDocumentsSummary() {
  const { data, isLoading, isError } = useFulfilmentKPIs();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardHeader>
          <p className="text-sm font-medium">Pending Documents</p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load.</p>
        </CardContent>
      </Card>
    );
  }

  const count = data.pendingDocuments ?? 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <FileStack className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium">Pending Documents</p>
        </div>
        <Link
          href="/fulfilment/documents?status=pending"
          className="text-sm font-medium text-primary hover:underline"
        >
          Verify queue
        </Link>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{count}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Documents awaiting verification
        </p>
      </CardContent>
    </Card>
  );
}
