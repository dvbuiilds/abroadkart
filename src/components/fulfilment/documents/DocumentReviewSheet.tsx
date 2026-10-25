'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@app/components/ui/sheet';
import { Button } from '@app/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@app/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@app/components/ui/radio-group';
import { Label } from '@app/components/ui/label';
import { Textarea } from '@app/components/ui/textarea';
import { Card, CardContent } from '@app/components/ui/card';
import { documentVerifySchema } from '@app/lib/validations/document-verification';
import { useVerifyDocument } from '@app/hooks/useDocumentQueue';
import type { StudentDocumentListItem } from '@app/graphql/types';
import { toast } from 'sonner';

export function DocumentReviewSheet({
  document,
  open,
  onOpenChange,
}: {
  document: StudentDocumentListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useVerifyDocument();
  const form = useForm({
    resolver: zodResolver(documentVerifySchema),
    defaultValues: {
      verificationStatus: 'verified' as 'verified' | 'rejected',
      verificationRemarks: '',
    },
  });

  const resetForm = () => {
    form.reset({ verificationStatus: 'verified', verificationRemarks: '' });
  };

  const onSubmit = async (data: { verificationStatus: 'verified' | 'rejected'; verificationRemarks?: string }) => {
    if (!document) return;
    try {
      await mutation.mutateAsync({
        id: document.id,
        data: {
          verificationStatus: data.verificationStatus,
          verificationRemarks: data.verificationStatus === 'rejected' ? data.verificationRemarks : undefined,
        },
      });
      toast.success(data.verificationStatus === 'verified' ? 'Document verified' : 'Document rejected');
      onOpenChange(false);
      resetForm();
    } catch {
      toast.error('Failed to update document');
    }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm(); }}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Review Document</SheetTitle>
        </SheetHeader>
        {document && (
          <div className="mt-6 space-y-6">
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm font-medium">Student</p>
                <p className="text-muted-foreground">{document.student?.fullName ?? document.student?.email ?? '—'}</p>
                <p className="text-sm text-muted-foreground mt-1">{document.documentType}</p>
                {document.file?.url && (
                  <a
                    href={document.file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm text-primary hover:underline"
                  >
                    View file
                  </a>
                )}
              </CardContent>
            </Card>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="verificationStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Decision</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col gap-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="verified" id="verified" />
                            <Label htmlFor="verified">Verified</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="rejected" id="rejected" />
                            <Label htmlFor="rejected">Rejected</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="verificationRemarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Remarks {form.watch('verificationStatus') === 'rejected' && '(required)'}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value ?? ''}
                          rows={4}
                          placeholder="Add remarks (required if rejected)"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? 'Saving...' : 'Submit'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
