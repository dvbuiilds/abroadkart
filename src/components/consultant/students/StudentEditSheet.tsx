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
import { Checkbox } from '@app/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/components/ui/select';
import { useUpdateStudent } from '@app/hooks/useStudents';
import type { StudentListItem } from '@app/graphql/types';
import {
  BUDGET_PER_YEAR_OPTIONS,
  PROGRAM_DISCIPLINE_OPTIONS,
  QUALIFICATION_OPTIONS,
  STAGE_OPTIONS,
  TARGET_COUNTRY_OPTIONS,
  TARGET_YEAR_OPTIONS,
  TEST_SCORE_FIELDS,
  WORK_EXPERIENCE_OPTIONS,
} from '@app/lib/students/options';

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
      targetCountry: (student.targetCountry as StudentUpdateInput['targetCountry']) || undefined,
      currentStage: (student.currentStage as StudentUpdateInput['currentStage']) ?? 'lead',
      qualification: student.qualification as StudentUpdateInput['qualification'],
      targetYear: student.targetYear as StudentUpdateInput['targetYear'],
      budgetPerYear: student.budgetPerYear as StudentUpdateInput['budgetPerYear'],
      programDisciplines: (student.programDisciplines ?? []) as StudentUpdateInput['programDisciplines'],
      openForScholarshipsLoans: student.openForScholarshipsLoans ?? false,
      workExperience: student.workExperience as StudentUpdateInput['workExperience'],
      ieltsScore: student.ieltsScore != null ? Number(student.ieltsScore) : undefined,
      toeflScore: student.toeflScore != null ? Number(student.toeflScore) : undefined,
      pteScore: student.pteScore != null ? Number(student.pteScore) : undefined,
      gmatScore: student.gmatScore != null ? Number(student.gmatScore) : undefined,
      greScore: student.greScore != null ? Number(student.greScore) : undefined,
      satScore: student.satScore != null ? Number(student.satScore) : undefined,
      actScore: student.actScore != null ? Number(student.actScore) : undefined,
      finalScore: student.finalScore != null ? Number(student.finalScore) : undefined,
      parentMonthlyIncome: student.parentMonthlyIncome ?? undefined,
      notes: student.notes ?? '',
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
          qualification: data.qualification,
          workExperience: data.workExperience,
          targetYear: data.targetYear,
          budgetPerYear: data.budgetPerYear,
          programDisciplines: data.programDisciplines,
          openForScholarshipsLoans: data.openForScholarshipsLoans,
          ieltsScore: data.ieltsScore != null ? String(data.ieltsScore) : undefined,
          toeflScore: data.toeflScore != null ? String(data.toeflScore) : undefined,
          pteScore: data.pteScore != null ? String(data.pteScore) : undefined,
          gmatScore: data.gmatScore != null ? String(data.gmatScore) : undefined,
          greScore: data.greScore != null ? String(data.greScore) : undefined,
          satScore: data.satScore != null ? String(data.satScore) : undefined,
          actScore: data.actScore != null ? String(data.actScore) : undefined,
          finalScore: data.finalScore != null ? String(data.finalScore) : undefined,
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
            <p className="text-sm font-semibold text-muted-foreground">
              Personal Information
            </p>
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
            <p className="pt-2 text-sm font-semibold text-muted-foreground">
              Academic Preferences
            </p>
            <FormField
              control={form.control}
              name="qualification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qualification</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {QUALIFICATION_OPTIONS.map((o) => (
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
              name="finalScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Final Score (Last Course)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} value={field.value ?? ''} />
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
                  <Select onValueChange={field.onChange} value={field.value ?? ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TARGET_COUNTRY_OPTIONS.map((o) => (
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
              name="targetYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Year</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TARGET_YEAR_OPTIONS.map((o) => (
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
              name="budgetPerYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Per Year</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BUDGET_PER_YEAR_OPTIONS.map((o) => (
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
              name="programDisciplines"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Program Disciplines</FormLabel>
                  <div className="grid grid-cols-2 gap-2 rounded-md border p-3">
                    {PROGRAM_DISCIPLINE_OPTIONS.map((option) => {
                      const isChecked = (field.value ?? []).includes(option.value);
                      return (
                        <label key={option.value} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              const next = new Set(field.value ?? []);
                              if (checked) next.add(option.value);
                              else next.delete(option.value);
                              field.onChange(Array.from(next));
                            }}
                          />
                          {option.label}
                        </label>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="pt-2 text-sm font-semibold text-muted-foreground">Test Scores</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {TEST_SCORE_FIELDS.map((scoreField) => (
                <FormField
                  key={scoreField.key}
                  control={form.control}
                  name={scoreField.key}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{scoreField.label}</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <p className="pt-2 text-sm font-semibold text-muted-foreground">Other Details</p>
            <FormField
              control={form.control}
              name="workExperience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Experience</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {WORK_EXPERIENCE_OPTIONS.map((o) => (
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
              name="openForScholarshipsLoans"
              render={({ field }) => (
                <FormItem>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={!!field.value}
                      onCheckedChange={(checked) => field.onChange(!!checked)}
                    />
                    Open for Scholarships & Loans
                  </label>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
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
