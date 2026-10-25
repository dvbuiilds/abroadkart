'use client';

import { Card, CardContent, CardHeader } from '@app/components/ui/card';
import { Skeleton } from '@app/components/ui/skeleton';
import { useDashboardKPIs } from '@app/hooks/useDashboard';

export function KPICards() {
  const { data, isLoading, isError } = useDashboardKPIs();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
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

  const totalStudents = data.totalStudents ?? 0;
  const enrolled = data.enrolledStudents ?? 0;
  const conversionRate = totalStudents > 0 ? Math.round((enrolled / totalStudents) * 100) : 0;

  const cards = [
    { title: 'Total Students', value: data.totalStudents },
    { title: 'Active Applications', value: data.activeApplications },
    { title: 'Loans In Process', value: data.loansInProcess },
    { title: 'Conversion Rate', value: `${conversionRate}%`, sub: 'enrolled / total' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="pb-2">
            <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{card.value}</p>
            {card.sub && (
              <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
