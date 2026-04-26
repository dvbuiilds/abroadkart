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
import type { PrepaidCardListItem } from '@app/graphql/types';
import { format } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  inactive: 'outline',
  active: 'default',
  blocked: 'destructive',
  expired: 'secondary',
};

function maskCardNumber(num: string | null): string {
  if (!num) return '—';
  if (num.length <= 8) return num;
  return '****' + num.slice(-4);
}

export function PrepaidCardTable({
  cards,
  onBlock,
  onUnblock,
  onActivate,
}: {
  cards: PrepaidCardListItem[];
  onBlock: (c: PrepaidCardListItem) => void;
  onUnblock: (c: PrepaidCardListItem) => void;
  onActivate: (c: PrepaidCardListItem) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Card</TableHead>
          <TableHead>Student</TableHead>
          <TableHead>Balance</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Issued</TableHead>
          <TableHead className="w-[70px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cards.map((card) => (
          <TableRow key={card.id}>
            <TableCell className="font-mono text-sm">
              {maskCardNumber(card.cardNumber)}
            </TableCell>
            <TableCell className="font-medium">
              {card.student?.fullName ?? card.student?.email ?? '—'}
            </TableCell>
            <TableCell>
              {(card.balance ?? 0).toLocaleString()} {card.currency ?? 'USD'}
            </TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANTS[card.status ?? ''] ?? 'secondary'}>
                {card.status ?? '—'}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {card.issuedAt ? format(new Date(card.issuedAt), 'MMM d, yyyy') : '—'}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {card.status === 'inactive' && (
                    <DropdownMenuItem onClick={() => onActivate(card)}>Activate</DropdownMenuItem>
                  )}
                  {card.status === 'active' && (
                    <DropdownMenuItem onClick={() => onBlock(card)}>Block</DropdownMenuItem>
                  )}
                  {card.status === 'blocked' && (
                    <DropdownMenuItem onClick={() => onUnblock(card)}>Unblock</DropdownMenuItem>
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
