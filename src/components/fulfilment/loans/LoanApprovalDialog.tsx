'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@app/components/ui/dialog';
import { Button } from '@app/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@app/components/ui/form';
import { Input } from '@app/components/ui/input';
import { Textarea } from '@app/components/ui/textarea';
import { loanApprovalSchema, type LoanApprovalInput } from '@app/lib/validations/fulfilment-loan';
import { useUpdateLoanStatus } from '@app/hooks/useFulfilmentLoans';
import { toast } from 'sonner';

export function LoanApprovalDialog({
  open,
  onOpenChange,
  loanId,
  defaultValues,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loanId: string;
  defaultValues?: Partial<LoanApprovalInput>;
}) {
  const mutation = useUpdateLoanStatus();
  const form = useForm<LoanApprovalInput>({
    resolver: zodResolver(loanApprovalSchema),
    defaultValues: {
      loanAmountApproved: defaultValues?.loanAmountApproved ?? 0,
      interestRate: defaultValues?.interestRate ?? 0,
      emi: defaultValues?.emi ?? 0,
      fulfilmentRemarks: defaultValues?.fulfilmentRemarks ?? '',
    },
  });

  const onSubmit = async (data: LoanApprovalInput) => {
    try {
      await mutation.mutateAsync({
        id: loanId,
        data: {
          status: 'approved',
          loanAmountApproved: data.loanAmountApproved,
          interestRate: String(data.interestRate),
          emi: data.emi,
          fulfilmentRemarks: data.fulfilmentRemarks || undefined,
          approvedAt: new Date().toISOString(),
        },
      });
      toast.success('Loan approved');
      onOpenChange(false);
      form.reset();
    } catch {
      toast.error('Failed to approve loan');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Approve Loan</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="loanAmountApproved"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Approved Amount</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="interestRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interest Rate (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>EMI</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fulfilmentRemarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks (optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value ?? ''} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Approving...' : 'Approve'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
