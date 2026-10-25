'use client';

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
import type { ReimbursementListItem } from '@app/graphql/types';
import { format } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  pending: 'outline',
  approved: 'default',
  rejected: 'destructive',
  reimbursed: 'secondary',
};

const CATEGORY_LABELS: Record<string, string> = {
  applicationFee: 'Application Fee',
  ielts: 'IELTS',
  visaFee: 'Visa Fee',
  travel: 'Travel',
  accommodation: 'Accommodation',
};

export function ReimbursementTable({
  reimbursements,
  onApprove,
  onReject,
  onMarkReimbursed,
}: {
  reimbursements: ReimbursementListItem[];
  onApprove: (r: ReimbursementListItem) => void;
  onReject: (r: ReimbursementListItem) => void;
  onMarkReimbursed: (r: ReimbursementListItem) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Requested</TableHead>
          <TableHead className="w-[70px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reimbursements.map((r) => (
          <TableRow key={r.id}>
            <TableCell className="font-medium">
              {r.student?.fullName ?? r.student?.email ?? '—'}
            </TableCell>
            <TableCell>{CATEGORY_LABELS[r.category ?? ''] ?? r.category ?? '—'}</TableCell>
            <TableCell>
              {(r.amount ?? 0).toLocaleString()} {r.currency ?? 'INR'}
            </TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANTS[r.status ?? ''] ?? 'secondary'}>
                {r.status ?? '—'}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {r.requestedAt ? format(new Date(r.requestedAt), 'MMM d, yyyy') : r.createdAt ? format(new Date(r.createdAt), 'MMM d, yyyy') : '—'}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {r.status === 'pending' && (
                    <>
                      <DropdownMenuItem onClick={() => onApprove(r)}>Approve</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onReject(r)}>Reject</DropdownMenuItem>
                    </>
                  )}
                  {r.status === 'approved' && (
                    <DropdownMenuItem onClick={() => onMarkReimbursed(r)}>
                      Mark Reimbursed
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
