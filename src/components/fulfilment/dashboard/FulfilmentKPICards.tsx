'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@app/components/ui/card';
import { Skeleton } from '@app/components/ui/skeleton';
import { useFulfilmentKPIs } from '@app/hooks/useFulfilmentDashboard';
import { CreditCard, FileStack, Receipt } from 'lucide-react';

export function FulfilmentKPICards() {
  const { data, isLoading, isError } = useFulfilmentKPIs();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-sm text-destructive">Failed to load dashboard metrics.</div>
    );
  }

  const cards = [
    {
      title: 'Loans Under Review',
      value: data.loansUnderReview ?? 0,
      href: '/fulfilment/loans?status=underReview',
      icon: CreditCard,
    },
    {
      title: 'Loans Approved',
      value: data.loansApproved ?? 0,
      href: '/fulfilment/loans?status=approved',
      icon: CreditCard,
    },
    {
      title: 'Loans Disbursed',
      value: data.loansDisbursed ?? 0,
      href: '/fulfilment/loans?status=disbursed',
      icon: CreditCard,
    },
    {
      title: 'Pending Documents',
      value: data.pendingDocuments ?? 0,
      href: '/fulfilment/documents?status=pending',
      icon: FileStack,
    },
    {
      title: 'Pending Reimbursements',
      value: data.pendingReimbursements ?? 0,
      href: '/fulfilment/reimbursements?status=pending',
      icon: Receipt,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link key={card.title} href={card.href}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{card.value}</p>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
