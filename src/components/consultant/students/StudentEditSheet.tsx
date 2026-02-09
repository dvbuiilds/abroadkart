import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentUpdateSchema, type StudentUpdateInput } from '@app/lib/validations/student';
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
import { Input } from '@app/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/components/ui/select';
import { useUpdateStudent } from '@app/hooks/useStudents';
import type { StudentListItem } from '@app/graphql/types';

const STAGE_OPTIONS = [
  { value: 'lead', label: 'Lead' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'applied', label: 'Applied' },
  { value: 'inLoanProcess', label: 'In Loan Process' },
  { value: 'enrolled', label: 'Enrolled' },
  { value: 'graduated', label: 'Graduated' },
];

const EDUCATION_OPTIONS = [
  { value: 'highSchool', label: 'High School' },
  { value: 'bachelor', label: 'Bachelor' },
  { value: 'master', label: 'Master' },
  { value: 'phd', label: 'PhD' },
];

const ENGLISH_TEST_OPTIONS = [
  { value: 'IELTS', label: 'IELTS' },
  { value: 'TOEFL', label: 'TOEFL' },
  { value: 'PTE', label: 'PTE' },
];

export function StudentEditSheet({
  student,
  open,
  onOpenChange,
}: {
  student: StudentListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateStudent = useUpdateStudent();

  const form = useForm<StudentUpdateInput>({
    resolver: zodResolver(studentUpdateSchema),
    defaultValues: {
      fullName: student.fullName ?? '',
      email: student.email ?? '',
      phone: student.phone ?? '',
      countryOfResidence: student.countryOfResidence ?? '',
      targetCountry: '',
      currentStage: (student.currentStage as StudentUpdateInput['currentStage']) ?? 'lead',
      educationLevel: undefined,
      englishTestType: undefined,
      englishTestScore: undefined,
    },
  });

  const onSubmit = async (data: StudentUpdateInput) => {
    try {
      await updateStudent.mutateAsync({
        id: student.id,
        data: {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          countryOfResidence: data.countryOfResidence,
          targetCountry: data.targetCountry,
          currentStage: data.currentStage,
          educationLevel: data.educationLevel,
          workExperience: data.workExperience,
          englishTestScore: data.englishTestScore != null ? String(data.englishTestScore) : undefined,
          englishTestType: data.englishTestType,
          parentMonthlyIncome: data.parentMonthlyIncome,
          notes: data.notes,
        },
      });
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      form.setError('root', { message: 'Failed to update student.' });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit Student</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="countryOfResidence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country of Residence</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="targetCountry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Country</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currentStage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stage</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STAGE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
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
              name="educationLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Education Level</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EDUCATION_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
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
              name="englishTestType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>English Test</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ENGLISH_TEST_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
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
              name="englishTestScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test Score</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.formState.errors.root && (
              <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
            )}
            <Button type="submit" disabled={updateStudent.isPending} className="w-full">
              {updateStudent.isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
