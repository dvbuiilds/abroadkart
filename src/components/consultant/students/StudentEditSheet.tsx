import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentCreateSchema, type StudentCreateInput } from '@app/lib/validations/student';
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
import { useUpdateStudent } from '@app/hooks/useStudents';
import type { StudentListItem } from '@app/graphql/types';
import { StudentIdentitySection } from './form/StudentIdentitySection';
import { StudentAcademicSection } from './form/StudentAcademicSection';
import { StudentTestScoresSection } from './form/StudentTestScoresSection';
import { StudentWorkExperienceSection } from './form/StudentWorkExperienceSection';
import { StudentGoalsSection } from './form/StudentGoalsSection';
import { StudentFinancialSection } from './form/StudentFinancialSection';
import { StudentVisaSection } from './form/StudentVisaSection';
import { StudentCrmStatusSection } from './form/StudentCrmStatusSection';

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

  const form = useForm<StudentCreateInput>({
    resolver: zodResolver(studentCreateSchema),
    defaultValues: {
      fullName: student.fullName ?? '',
      email: student.email ?? '',
      phone: student.phone ?? '',
      countryOfResidence: student.countryOfResidence ?? '',
      gender: (student.gender as StudentCreateInput['gender']) || undefined,
      city: student.city ?? '',
      state: student.state ?? '',
      source: (student.source as StudentCreateInput['source']) || undefined,
      qualification: (student.qualification as StudentCreateInput['qualification']) || undefined,
      stream: student.stream ?? '',
      subjects: (student.subjects as string[]) || [],
      academicScore: student.academicScore != null ? Number(student.academicScore) : undefined,
      academicScoreType: (student.academicScoreType as StudentCreateInput['academicScoreType']) || undefined,
      backlogCount: student.backlogCount != null ? Number(student.backlogCount) : undefined,
      yearOfPassing: student.yearOfPassing != null ? Number(student.yearOfPassing) : undefined,
      institutionName: student.institutionName ?? '',
      duolingoScore: student.duolingoScore != null ? Number(student.duolingoScore) : undefined,
      testAppearingDate: student.testAppearingDate ? new Date(student.testAppearingDate) : undefined,
      ieltsScore: student.ieltsScore != null ? Number(student.ieltsScore) : undefined,
      toeflScore: student.toeflScore != null ? Number(student.toeflScore) : undefined,
      pteScore: student.pteScore != null ? Number(student.pteScore) : undefined,
      gmatScore: student.gmatScore != null ? Number(student.gmatScore) : undefined,
      greScore: student.greScore != null ? Number(student.greScore) : undefined,
      satScore: student.satScore != null ? Number(student.satScore) : undefined,
      actScore: student.actScore != null ? Number(student.actScore) : undefined,
      finalScore: student.finalScore != null ? Number(student.finalScore) : undefined,
      workExperience: (student.workExperience as StudentCreateInput['workExperience']) || undefined,
      employer: student.employer ?? '',
      designation: student.designation ?? '',
      gapExplanation: student.gapExplanation ?? '',
      targetCountries: (student.targetCountries as string[]) || [],
      targetCourses: (student.targetCourses as string[]) || [],
      studyLevel: (student.studyLevel as StudentCreateInput['studyLevel']) || undefined,
      preferredIntake: (student.preferredIntake as StudentCreateInput['preferredIntake']) || undefined,
      targetYear: (student.targetYear as StudentCreateInput['targetYear']) || undefined,
      budgetTuition: student.budgetTuition != null ? Number(student.budgetTuition) : undefined,
      budgetLiving: student.budgetLiving != null ? Number(student.budgetLiving) : undefined,
      budgetCurrency: student.budgetCurrency ?? 'USD',
      fundingType: (student.fundingType as StudentCreateInput['fundingType']) || undefined,
      loanPreApproved: student.loanPreApproved ?? false,
      priorVisaRefusals: student.priorVisaRefusals ?? false,
      refusalCountries: (student.refusalCountries as string[]) || [],
      refusalReason: student.refusalReason ?? '',
      passportAvailable: student.passportAvailable ?? false,
      passportExpiry: student.passportExpiry ? new Date(student.passportExpiry) : undefined,
      currentStage: (student.currentStage as StudentCreateInput['currentStage']) ?? 'lead',
      priority: (student.priority as StudentCreateInput['priority']) || undefined,
      lostReason: student.lostReason ?? '',
      assignedCounsellor: student.assignedCounsellor?.id,
      parentMonthlyIncome: student.parentMonthlyIncome ?? undefined,
      notes: student.notes ?? '',
    },
  });

  const onSubmit = async (data: StudentCreateInput) => {
    try {
      await updateStudent.mutateAsync({
        id: student.id,
        data: {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          countryOfResidence: data.countryOfResidence,
          gender: data.gender,
          city: data.city,
          state: data.state,
          source: data.source,
          qualification: data.qualification,
          stream: data.stream,
          subjects: data.subjects,
          academicScore: data.academicScore,
          academicScoreType: data.academicScoreType,
          backlogCount: data.backlogCount,
          yearOfPassing: data.yearOfPassing,
          institutionName: data.institutionName,
          duolingoScore: data.duolingoScore,
          testAppearingDate: data.testAppearingDate,
          ieltsScore: data.ieltsScore != null ? String(data.ieltsScore) : undefined,
          toeflScore: data.toeflScore != null ? String(data.toeflScore) : undefined,
          pteScore: data.pteScore != null ? String(data.pteScore) : undefined,
          gmatScore: data.gmatScore != null ? String(data.gmatScore) : undefined,
          greScore: data.greScore != null ? String(data.greScore) : undefined,
          satScore: data.satScore != null ? String(data.satScore) : undefined,
          actScore: data.actScore != null ? String(data.actScore) : undefined,
          finalScore: data.finalScore != null ? String(data.finalScore) : undefined,
          workExperience: data.workExperience,
          employer: data.employer,
          designation: data.designation,
          gapExplanation: data.gapExplanation,
          targetCountries: data.targetCountries,
          targetCourses: data.targetCourses,
          studyLevel: data.studyLevel,
          preferredIntake: data.preferredIntake,
          targetYear: data.targetYear,
          budgetTuition: data.budgetTuition,
          budgetLiving: data.budgetLiving,
          budgetCurrency: data.budgetCurrency,
          fundingType: data.fundingType,
          loanPreApproved: data.loanPreApproved,
          priorVisaRefusals: data.priorVisaRefusals,
          refusalCountries: data.refusalCountries,
          refusalReason: data.refusalReason,
          passportAvailable: data.passportAvailable,
          passportExpiry: data.passportExpiry,
          currentStage: data.currentStage,
          priority: data.priority,
          lostReason: data.lostReason,
          assignedCounsellor: data.assignedCounsellor,
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
      <SheetContent className="overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Edit Student: {student.fullName}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Basic Information</h3>
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
            </div>

            <StudentIdentitySection form={form} />
            <StudentAcademicSection form={form} />
            <StudentTestScoresSection form={form} />
            <StudentWorkExperienceSection form={form} />
            <StudentGoalsSection form={form} />
            <StudentFinancialSection form={form} />
            <StudentVisaSection form={form} />
            <StudentCrmStatusSection form={form} />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="border-t pt-4">
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <textarea
                      placeholder="Any additional notes..."
                      className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      {...field}
                      value={field.value ?? ''}
                    />
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
