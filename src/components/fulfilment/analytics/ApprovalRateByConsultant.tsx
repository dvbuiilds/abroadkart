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

export function ApprovalRateByConsultant() {
  const { data, isLoading, isError } = useLoansForAnalytics(500);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-56" />
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
          <CardTitle>Approval Rate by Consultant</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load chart data.</p>
        </CardContent>
      </Card>
    );
  }

  const loans = data.loanApplications ?? [];
  const byTenant = new Map<string, { total: number; approved: number }>();

  for (const loan of loans) {
    const tenantName = loan.tenant?.name ?? 'Unknown';
    const entry = byTenant.get(tenantName) ?? { total: 0, approved: 0 };
    entry.total += 1;
    if (loan.status === 'approved' || loan.status === 'disbursed' || loan.status === 'closed') {
      entry.approved += 1;
    }
    byTenant.set(tenantName, entry);
  }

  const chartData = Array.from(byTenant.entries())
    .map(([name, { total, approved }]) => ({
      name: name.length > 20 ? name.slice(0, 20) + '…' : name,
      rate: total > 0 ? Math.round((approved / total) * 100) : 0,
      total,
      approved,
    }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval Rate by Consultant (Top 10)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
            <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value: number | undefined) => [`${value ?? 0}%`, 'Approval Rate']} />
            <Bar dataKey="rate" name="Approval %" fill="#22c55e" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
