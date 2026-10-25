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
import { reimbursementActionSchema } from '@app/lib/validations/reimbursement';
import { useUpdateReimbursement } from '@app/hooks/useReimbursements';
import type { ReimbursementListItem } from '@app/graphql/types';
import { toast } from 'sonner';

export function ReimbursementActionDialog({
  open,
  onOpenChange,
  reimbursement,
  action,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reimbursement: ReimbursementListItem | null;
  action: 'approve' | 'reject' | 'reimbursed';
}) {
  const mutation = useUpdateReimbursement();
  const statusValue = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'reimbursed';
  const form = useForm({
    resolver: zodResolver(reimbursementActionSchema),
    defaultValues: { status: statusValue, remarks: '' },
  });

  const onSubmit = async (data: { status: string; remarks?: string }) => {
    if (!reimbursement) return;
    try {
      const updateData: Record<string, unknown> = { status: statusValue };
      if (data.remarks) updateData.remarks = data.remarks;
      if (statusValue === 'approved') updateData.approvedAt = new Date().toISOString();
      if (statusValue === 'reimbursed') {
        updateData.reimbursedAt = new Date().toISOString();
      }
      await mutation.mutateAsync({ id: reimbursement.id, data: updateData });
      toast.success(`Reimbursement ${statusValue}`);
      onOpenChange(false);
      form.reset();
    } catch {
      toast.error('Failed to update reimbursement');
    }
  };

  const title =
    action === 'approve'
      ? 'Approve Reimbursement'
      : action === 'reject'
        ? 'Reject Reimbursement'
        : 'Mark as Reimbursed';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {reimbursement && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {reimbursement.student?.fullName} — {(reimbursement.amount ?? 0).toLocaleString()}{' '}
                {reimbursement.currency ?? 'INR'}
              </p>
              <FormField
                control={form.control}
                name="remarks"
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
                  {mutation.isPending ? 'Saving...' : 'Confirm'}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
