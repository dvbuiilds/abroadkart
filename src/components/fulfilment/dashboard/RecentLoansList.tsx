'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@app/components/ui/table';
import { Badge } from '@app/components/ui/badge';
import { Card, CardContent, CardHeader } from '@app/components/ui/card';
import { Skeleton } from '@app/components/ui/skeleton';
import { useFulfilmentRecentLoans } from '@app/hooks/useFulfilmentDashboard';
import { format } from 'date-fns';

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  initiated: 'secondary',
  documentsPending: 'outline',
  underReview: 'default',
  approved: 'default',
  rejected: 'destructive',
  disbursed: 'secondary',
  closed: 'secondary',
};

export function RecentLoansList() {
  const router = useRouter();
  const { data, isLoading, isError } = useFulfilmentRecentLoans(10);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardHeader>
          <p className="text-sm font-medium">Recent Loans</p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load recent loans.</p>
        </CardContent>
      </Card>
    );
  }

  const loans = data.loanApplications ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <p className="text-sm font-medium">Recent Loans</p>
        <Link
          href="/fulfilment/loans"
          className="text-sm font-medium text-primary hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {loans.length === 0 ? (
          <p className="text-sm text-muted-foreground">No loans yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Consultant</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.map((loan) => (
                <TableRow
                  key={loan.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/fulfilment/loans/${loan.id}`)}
                >
                  <TableCell className="font-medium">
                    {loan.student?.fullName ?? '—'}
                  </TableCell>
                  <TableCell>{loan.tenant?.name ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[loan.status ?? ''] ?? 'secondary'}>
                      {loan.status ?? '—'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {loan.loanAmountApproved ?? loan.loanAmountRequested ?? '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {loan.createdAt ? format(new Date(loan.createdAt), 'MMM d, yyyy') : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
