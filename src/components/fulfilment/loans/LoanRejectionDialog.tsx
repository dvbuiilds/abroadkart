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
import { Textarea } from '@app/components/ui/textarea';
import { loanRejectionSchema } from '@app/lib/validations/fulfilment-loan';
import { useUpdateLoanStatus } from '@app/hooks/useFulfilmentLoans';
import { toast } from 'sonner';

export function LoanRejectionDialog({
  open,
  onOpenChange,
  loanId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loanId: string;
}) {
  const mutation = useUpdateLoanStatus();
  const form = useForm({
    resolver: zodResolver(loanRejectionSchema),
    defaultValues: { fulfilmentRemarks: '' },
  });

  const onSubmit = async (data: { fulfilmentRemarks: string }) => {
    try {
      await mutation.mutateAsync({
        id: loanId,
        data: {
          status: 'rejected',
          fulfilmentRemarks: data.fulfilmentRemarks,
        },
      });
      toast.success('Loan rejected');
      onOpenChange(false);
      form.reset();
    } catch {
      toast.error('Failed to reject loan');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Loan</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fulfilmentRemarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for rejection (required)</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} placeholder="Explain why this loan is being rejected..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={mutation.isPending}>
                {mutation.isPending ? 'Rejecting...' : 'Reject'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
