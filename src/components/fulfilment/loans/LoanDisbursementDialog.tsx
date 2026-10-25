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
import { loanDisbursementSchema } from '@app/lib/validations/fulfilment-loan';
import { useUpdateLoanStatus } from '@app/hooks/useFulfilmentLoans';
import { toast } from 'sonner';

export function LoanDisbursementDialog({
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
    resolver: zodResolver(loanDisbursementSchema),
    defaultValues: {
      disburseDate: new Date().toISOString().slice(0, 10),
    },
  });

  const onSubmit = async (data: { disburseDate: string }) => {
    try {
      await mutation.mutateAsync({
        id: loanId,
        data: {
          status: 'disbursed',
          disburseDate: new Date(data.disburseDate).toISOString(),
        },
      });
      toast.success('Loan disbursed');
      onOpenChange(false);
      form.reset();
    } catch {
      toast.error('Failed to disburse loan');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Disburse Loan</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="disburseDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disburse Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                {mutation.isPending ? 'Disbursing...' : 'Disburse'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
