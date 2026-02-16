'use client';

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@app/components/ui/dropdown-menu';
import { Button } from '@app/components/ui/button';
import type { LoanListItem } from '@app/graphql/types';
import { format } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';

const STATUS_VARIANTS: Record<
  string,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  initiated: 'secondary',
  documentsPending: 'outline',
  underReview: 'default',
  approved: 'default',
  rejected: 'destructive',
  disbursed: 'secondary',
  closed: 'secondary',
};

export function FulfilmentLoanTable({ loans }: { loans: LoanListItem[] }) {
  const router = useRouter();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Student</TableHead>
          <TableHead>Consultant</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Amount Requested</TableHead>
          <TableHead>Amount Approved</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-[70px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loans.map((loan) => (
          <TableRow
            key={loan.id}
            className="cursor-pointer"
            onClick={() => router.push(`/fulfilment/loans/${loan.id}`)}
          >
            <TableCell className="font-mono text-xs">
              {loan.id.slice(0, 8)}…
            </TableCell>
            <TableCell className="font-medium">
              {loan.student?.fullName ?? loan.student?.email ?? '—'}
            </TableCell>
            <TableCell>{loan.tenant?.name ?? '—'}</TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANTS[loan.status ?? ''] ?? 'secondary'}>
                {loan.status ?? '—'}
              </Badge>
            </TableCell>
            <TableCell>
              {(loan.loanAmountRequested ?? 0).toLocaleString()}{' '}
              {loan.currency ?? 'INR'}
            </TableCell>
            <TableCell>
              {(loan.loanAmountApproved ?? 0).toLocaleString()}{' '}
              {loan.currency ?? 'INR'}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {loan.createdAt
                ? format(new Date(loan.createdAt), 'MMM d, yyyy')
                : '—'}
            </TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => router.push(`/fulfilment/loans/${loan.id}`)}
                  >
                    View
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
