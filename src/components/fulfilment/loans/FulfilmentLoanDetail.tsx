'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@app/components/ui/tabs';
import { Progress } from '@app/components/ui/progress';
import { Badge } from '@app/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@app/components/ui/table';
import { Textarea } from '@app/components/ui/textarea';
import { Button } from '@app/components/ui/button';
import { LoanActionButtons } from './LoanActionButtons';
import { useActivityLogsForLoan, useUpdateLoanStatus } from '@app/hooks/useFulfilmentLoans';
import type { LoanApplication } from '@app/graphql/types';
import { format } from 'date-fns';

const LOAN_STEPS = ['initiated', 'documentsPending', 'underReview', 'approved', 'disbursed'];
const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  pending: 'outline',
  verified: 'default',
  rejected: 'destructive',
};

export function FulfilmentLoanDetail({ loan }: { loan: LoanApplication }) {
  const [remarks, setRemarks] = useState(loan.fulfilmentRemarks ?? '');
  const [remarksDirty, setRemarksDirty] = useState(false);
  const updateLoan = useUpdateLoanStatus();
  const { data: activityLogs } = useActivityLogsForLoan(loan.id);

  const currentIndex = LOAN_STEPS.indexOf(loan.status ?? 'initiated');
  const progress = currentIndex >= 0 ? ((currentIndex + 1) / LOAN_STEPS.length) * 100 : 0;

  const handleSaveRemarks = async () => {
    if (!remarksDirty) return;
    try {
      await updateLoan.mutateAsync({
        id: loan.id,
        data: { fulfilmentRemarks: remarks },
      });
      setRemarksDirty(false);
    } catch {
      // toast handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <LoanActionButtons loan={loan} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <p className="text-sm font-medium text-muted-foreground">Progress</p>
            </CardHeader>
            <CardContent>
              <Progress value={progress} className="h-2" />
              <p className="mt-2 text-xs text-muted-foreground">
                {LOAN_STEPS.slice(0, currentIndex + 1).join(' → ')}
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <p className="text-sm font-medium text-muted-foreground">Student</p>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{loan.student?.fullName ?? loan.student?.email ?? '—'}</p>
                <p className="text-sm text-muted-foreground">{loan.student?.email ?? '—'}</p>
                <p className="text-sm text-muted-foreground">{loan.student?.phone ?? '—'}</p>
                <p className="text-sm">Stage: {loan.student?.currentStage ?? '—'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <p className="text-sm font-medium text-muted-foreground">Loan Terms</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid gap-2 sm:grid-cols-2">
                  <p className="text-sm">
                    Requested: {loan.currency ?? 'INR'}{' '}
                    {(loan.loanAmountRequested ?? 0).toLocaleString()}
                  </p>
                  <p className="text-sm">
                    Approved: {loan.currency ?? 'INR'}{' '}
                    {(loan.loanAmountApproved ?? 0).toLocaleString()}
                  </p>
                  <p className="text-sm">Tenure: {loan.loanTenure ?? '—'} months</p>
                  <p className="text-sm">Interest: {loan.interestRate ?? '—'}%</p>
                  <p className="text-sm">
                    EMI: {loan.emi != null ? `${loan.currency ?? 'INR'} ${loan.emi.toLocaleString()}` : '—'}
                  </p>
                </div>
                {loan.approvedAt && (
                  <p className="text-xs text-muted-foreground">
                    Approved: {format(new Date(loan.approvedAt), 'MMM d, yyyy')}
                  </p>
                )}
                {loan.disburseDate && (
                  <p className="text-xs text-muted-foreground">
                    Disbursed: {format(new Date(loan.disburseDate), 'MMM d, yyyy')}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <p className="text-sm font-medium text-muted-foreground">Consultant</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{loan.tenant?.name ?? '—'}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {loan.consultantRemarks ?? 'No remarks'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="text-sm font-medium text-muted-foreground">Fulfilment Remarks</p>
            </CardHeader>
            <CardContent className="space-y-2">
              <Textarea
                value={remarks}
                onChange={(e) => {
                  setRemarks(e.target.value);
                  setRemarksDirty(true);
                }}
                rows={4}
                placeholder="Add internal notes..."
              />
              {remarksDirty && (
                <Button size="sm" onClick={handleSaveRemarks} disabled={updateLoan.isPending}>
                  {updateLoan.isPending ? 'Saving...' : 'Save'}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <p className="text-sm font-medium text-muted-foreground">Documents</p>
            </CardHeader>
            <CardContent>
              {!loan.documents || loan.documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents attached.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loan.documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>{doc.documentType ?? '—'}</TableCell>
                        <TableCell>
                          <Badge variant={STATUS_VARIANTS[doc.verificationStatus ?? ''] ?? 'secondary'}>
                            {doc.verificationStatus ?? '—'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {doc.verificationRemarks ?? '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <p className="text-sm font-medium text-muted-foreground">Activity</p>
            </CardHeader>
            <CardContent>
              {!activityLogs || activityLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity recorded.</p>
              ) : (
                <ul className="space-y-2">
                  {activityLogs.map((log) => (
                    <li key={log.id} className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">
                        {format(new Date(log.createdAt ?? ''), 'MMM d, HH:mm')}
                      </span>
                      <span>{log.action ?? '—'}</span>
                      <span className="text-muted-foreground">
                        by {log.actor?.name ?? log.actor?.email ?? 'System'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
