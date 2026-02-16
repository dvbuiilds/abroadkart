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
import { useDocumentsForAnalytics } from '@app/hooks/useFulfilmentAnalytics';

const DOC_TYPE_LABELS: Record<string, string> = {
  passport: 'Passport',
  transcripts: 'Transcripts',
  financialDocs: 'Financial Docs',
  offerLetter: 'Offer Letter',
  visa: 'Visa',
  other: 'Other',
};

export function DocumentRejectionRates() {
  const { data, isLoading, isError } = useDocumentsForAnalytics(1000);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-52" />
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
          <CardTitle>Document Rejection Rates by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load chart data.</p>
        </CardContent>
      </Card>
    );
  }

  const docs = data.studentDocuments ?? [];
  const byType = new Map<string, { total: number; rejected: number }>();

  for (const doc of docs) {
    const type = doc.documentType ?? 'other';
    const entry = byType.get(type) ?? { total: 0, rejected: 0 };
    entry.total += 1;
    if (doc.verificationStatus === 'rejected') {
      entry.rejected += 1;
    }
    byType.set(type, entry);
  }

  const chartData = Array.from(byType.entries())
    .map(([type, { total, rejected }]) => ({
      name: DOC_TYPE_LABELS[type] ?? type,
      rate: total > 0 ? Math.round((rejected / total) * 100) : 0,
      total,
      rejected,
    }))
    .filter((d) => d.total > 0)
    .sort((a, b) => b.rate - a.rate);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Rejection Rate by Type</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
            <Tooltip formatter={(value: number | undefined, name: string | undefined, props: unknown) => {
              const p = props as { payload?: { total?: number; rejected?: number } };
              return [`${value ?? 0}% (${p?.payload?.rejected ?? 0}/${p?.payload?.total ?? 0} rejected)`, name ?? ''];
            }} />
            <Bar dataKey="rate" name="Rejection %" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
