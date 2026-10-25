'use client';

import { useState } from 'react';
import { Button } from '@app/components/ui/button';
import { LoanApprovalDialog } from './LoanApprovalDialog';
import { LoanRejectionDialog } from './LoanRejectionDialog';
import { LoanDisbursementDialog } from './LoanDisbursementDialog';
import type { LoanApplication } from '@app/graphql/types';
import { useUpdateLoanStatus } from '@app/hooks/useFulfilmentLoans';
import { toast } from 'sonner';

export function LoanActionButtons({ loan }: { loan: LoanApplication }) {
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [disburseOpen, setDisburseOpen] = useState(false);
  const mutation = useUpdateLoanStatus();
  const status = loan.status ?? '';

  const handleMoveToReview = async () => {
    try {
      await mutation.mutateAsync({
        id: loan.id,
        data: { status: 'underReview' },
      });
      toast.success('Moved to under review');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleRequestDocs = async () => {
    try {
      await mutation.mutateAsync({
        id: loan.id,
        data: { status: 'documentsPending' },
      });
      toast.success('Status updated to documents pending');
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {status === 'underReview' && (
          <>
            <Button onClick={() => setApproveOpen(true)}>Approve</Button>
            <Button variant="destructive" onClick={() => setRejectOpen(true)}>
              Reject
            </Button>
            <Button variant="outline" onClick={handleRequestDocs} disabled={mutation.isPending}>
              Request Docs
            </Button>
          </>
        )}
        {status === 'approved' && (
          <Button onClick={() => setDisburseOpen(true)}>Disburse</Button>
        )}
        {status === 'documentsPending' && (
          <Button onClick={handleMoveToReview} disabled={mutation.isPending}>
            Move to Review
          </Button>
        )}
      </div>

      <LoanApprovalDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        loanId={loan.id}
        defaultValues={{
          loanAmountApproved: loan.loanAmountRequested ?? undefined,
          interestRate: loan.interestRate ? parseFloat(loan.interestRate) : undefined,
          emi: loan.emi ?? undefined,
          fulfilmentRemarks: loan.fulfilmentRemarks ?? undefined,
        }}
      />
      <LoanRejectionDialog open={rejectOpen} onOpenChange={setRejectOpen} loanId={loan.id} />
      <LoanDisbursementDialog open={disburseOpen} onOpenChange={setDisburseOpen} loanId={loan.id} />
    </>
  );
}
