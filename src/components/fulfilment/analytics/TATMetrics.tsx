'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@app/components/ui/card';
import { Skeleton } from '@app/components/ui/skeleton';
import { useLoansForAnalytics } from '@app/hooks/useFulfilmentAnalytics';
import { differenceInHours } from 'date-fns';

export function TATMetrics() {
  const { data, isLoading, isError } = useLoansForAnalytics(500);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Turnaround Time (TAT) by Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load chart data.</p>
        </CardContent>
      </Card>
    );
  }

  const loans = data.loanApplications ?? [];
  const initiatedToApproved: number[] = [];
  const approvedToDisbursed: number[] = [];

  for (const loan of loans) {
    const createdAt = loan.createdAt ? new Date(loan.createdAt) : null;
    const approvedAt = loan.approvedAt ? new Date(loan.approvedAt) : null;
    const disburseDate = loan.disburseDate ? new Date(loan.disburseDate) : null;

    if (createdAt && approvedAt && (loan.status === 'approved' || loan.status === 'disbursed' || loan.status === 'closed')) {
      initiatedToApproved.push(Math.max(0, differenceInHours(approvedAt, createdAt)));
    }
    if (approvedAt && disburseDate && (loan.status === 'disbursed' || loan.status === 'closed')) {
      approvedToDisbursed.push(Math.max(0, differenceInHours(disburseDate, approvedAt)));
    }
  }

  const avgInitToApproved =
    initiatedToApproved.length > 0
      ? Math.round(initiatedToApproved.reduce((a, b) => a + b, 0) / initiatedToApproved.length)
      : 0;
  const avgApprovedToDisburse =
    approvedToDisbursed.length > 0
      ? Math.round(approvedToDisbursed.reduce((a, b) => a + b, 0) / approvedToDisbursed.length)
      : 0;

  const chartData = [
    { stage: 'Initiated → Approved', hours: avgInitToApproved, count: initiatedToApproved.length },
    { stage: 'Approved → Disbursed', hours: avgApprovedToDisburse, count: approvedToDisbursed.length },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Average Turnaround Time (TAT) by Stage</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value: number | undefined, name: string | undefined, props: unknown) => {
              const p = props as { payload?: { count?: number } };
              return [`${value ?? 0} hours (${p?.payload?.count ?? 0} loans)`, name ?? ''];
            }} />
            <Bar dataKey="hours" name="Avg Hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
