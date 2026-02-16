import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { applicationCreateSchema, type ApplicationCreateInput } from '@app/lib/validations/application';
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
import { useCreateApplication } from '@app/hooks/useApplications';
import { useStudents } from '@app/hooks/useStudents';
import { usePrograms } from '@app/hooks/useReference';

export function ApplicationCreateDialog({
  open,
  onOpenChange,
  preselectedStudentId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedStudentId?: string;
  onSuccess?: () => void;
}) {
  const createApplication = useCreateApplication();

  const { data: studentsData } = useStudents({
    where: { isDeleted: { not: { equals: true } } },
    orderBy: [{ fullName: 'asc' }],
    take: 200,
    skip: 0,
  });

  const { data: programsData } = usePrograms({
    where: {},
    orderBy: [{ name: 'asc' }],
    take: 200,
    skip: 0,
  });

  const form = useForm<ApplicationCreateInput>({
    resolver: zodResolver(applicationCreateSchema),
    defaultValues: {
      studentId: preselectedStudentId ?? '',
      programId: '',
      status: 'draft',
      gpa: undefined,
      gre: undefined,
      gmat: undefined,
    },
  });

  const onSubmit = async (data: ApplicationCreateInput) => {
    try {
      await createApplication.mutateAsync({
        student: { connect: { id: data.studentId } },
        program: { connect: { id: data.programId } },
        status: data.status,
        gpa: data.gpa != null ? (typeof data.gpa === 'string' ? parseFloat(data.gpa) : data.gpa) : undefined,
        gre: data.gre,
        gmat: data.gmat,
        remarks: data.remarks,
      });
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (e) {
      console.error(e);
      form.setError('root', { message: 'Failed to create application.' });
    }
  };

  const students = studentsData?.students ?? [];
  const programs = programsData?.programs ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Application</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!!preselectedStudentId}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.fullName ?? s.email}
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
              name="programId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Program</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select program" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {programs.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} ({p.university?.name})
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="underReview">Under Review</SelectItem>
                      <SelectItem value="waitlisted">Waitlisted</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gpa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GPA (optional)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="e.g. 3.8" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GRE (optional)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 320" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gmat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GMAT (optional)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 700" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.formState.errors.root && (
              <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={createApplication.isPending}>
                {createApplication.isPending ? 'Creating...' : 'Create Application'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
