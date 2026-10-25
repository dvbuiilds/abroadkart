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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/components/ui/select';
import { prepaidCardCreateSchema, type PrepaidCardCreateInput } from '@app/lib/validations/prepaid-card';
import { useCreatePrepaidCard } from '@app/hooks/usePrepaidCards';
import { useStudents } from '@app/hooks/useStudents';
import { toast } from 'sonner';

export function PrepaidCardCreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useCreatePrepaidCard();
  const { data: studentsData } = useStudents({
    where: { isDeleted: { not: { equals: true } } },
    orderBy: [{ fullName: 'asc' }],
    take: 200,
    skip: 0,
  });
  const students = studentsData?.students ?? [];

  const form = useForm<PrepaidCardCreateInput>({
    resolver: zodResolver(prepaidCardCreateSchema),
    defaultValues: {
      studentId: '',
      cardNumber: '',
      balance: 0,
      currency: 'USD',
      cardProvider: '',
      status: 'inactive',
    },
  });

  const onSubmit = async (data: PrepaidCardCreateInput) => {
    const student = students.find((s) => s.id === data.studentId);
    if (!student?.tenant?.id) {
      toast.error('Selected student has no tenant');
      return;
    }
    try {
      await mutation.mutateAsync({
        student: { connect: { id: data.studentId } },
        tenant: { connect: { id: student.tenant.id } },
        cardNumber: data.cardNumber,
        balance: data.balance,
        currency: data.currency,
        cardProvider: data.cardProvider || undefined,
        status: data.status,
        issuedAt: new Date().toISOString(),
      });
      toast.success('Prepaid card created');
      onOpenChange(false);
      form.reset();
    } catch {
      toast.error('Failed to create prepaid card');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Prepaid Card</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.fullName ?? s.email ?? s.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Card number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Balance</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? 0}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="USD" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cardProvider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Provider (optional)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} placeholder="Provider name" />
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
                {mutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
