'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@app/components/ui/card';
import { Badge } from '@app/components/ui/badge';
import { Skeleton } from '@app/components/ui/skeleton';
import { useRecentActivity } from '@app/hooks/useDashboard';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export function RecentActivity() {
  const { data, isLoading, isError } = useRecentActivity(5);

  const recent = useMemo(() => {
    if (!data) return [];

    const items: Array<{
      id: string;
      type: 'student' | 'application' | 'loan';
      label: string;
      href: string;
      time: string | null;
    }> = [];

    data.recentStudents?.forEach((s) => {
      items.push({
        id: `student-${s.id}`,
        type: 'student',
        label: `Student added: ${s.fullName || s.email || s.id}`,
        href: `/consultant/students/${s.id}`,
        time: s.createdAt,
      });
    });
    data.recentApplications?.forEach((a) => {
      const prog = a.program?.name ?? a.program?.university?.name ?? 'Application';
      items.push({
        id: `app-${a.id}`,
        type: 'application',
        label: `${a.student?.fullName ?? 'Student'}: ${prog}`,
        href: `/consultant/applications/${a.id}`,
        time: a.applicationDate,
      });
    });
    data.recentLoans?.forEach((l) => {
      items.push({
        id: `loan-${l.id}`,
        type: 'loan',
        label: `Loan ${l.loanAmountRequested ?? ''} for ${l.student?.fullName ?? 'Student'}`,
        href: `/consultant/loans/${l.id}`,
        time: l.createdAt,
      });
    });

    items.sort((a, b) => {
      const tA = a.time ? new Date(a.time).getTime() : 0;
      const tB = b.time ? new Date(b.time).getTime() : 0;
      return tB - tA;
    });

    return items.slice(0, 8);
  }, [data]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardHeader>
          <p className="text-sm font-medium">Recent Activity</p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Unable to load recent activity.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <p className="text-sm font-medium">Recent Activity</p>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity.</p>
        ) : (
          <ul className="space-y-2">
            {recent.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between gap-2 rounded-md py-1.5 text-sm hover:bg-muted/50"
                >
                  <span className="truncate">{item.label}</span>
                  <span className="flex shrink-0 items-center gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {item.type}
                    </Badge>
                    {item.time && (
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
