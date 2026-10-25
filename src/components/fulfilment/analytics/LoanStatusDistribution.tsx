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
import { useLoanStatusCounts } from '@app/hooks/useFulfilmentAnalytics';

const STATUS_LABELS: Record<string, string> = {
  initiated: 'Initiated',
  documentsPending: 'Docs Pending',
  underReview: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
  disbursed: 'Disbursed',
  closed: 'Closed',
};

export function LoanStatusDistribution() {
  const { data, isLoading, isError } = useLoanStatusCounts();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
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
          <CardTitle>Loan Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load chart data.</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    { name: STATUS_LABELS.initiated, count: data.initiated ?? 0, fill: '#94a3b8' },
    { name: STATUS_LABELS.documentsPending, count: data.documentsPending ?? 0, fill: '#f59e0b' },
    { name: STATUS_LABELS.underReview, count: data.underReview ?? 0, fill: '#3b82f6' },
    { name: STATUS_LABELS.approved, count: data.approved ?? 0, fill: '#22c55e' },
    { name: STATUS_LABELS.rejected, count: data.rejected ?? 0, fill: '#ef4444' },
    { name: STATUS_LABELS.disbursed, count: data.disbursed ?? 0, fill: '#10b981' },
    { name: STATUS_LABELS.closed, count: data.closed ?? 0, fill: '#64748b' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" name="Loans" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
