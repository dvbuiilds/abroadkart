import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  studentCreateSchema,
  type StudentCreateInput,
} from "@app/lib/validations/student";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@app/components/ui/dialog";
import { Button } from "@app/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@app/components/ui/form";
import { Input } from "@app/components/ui/input";
import { useCreateStudent } from "@app/hooks/useStudents";
import {
  STAGE_OPTIONS,
  TARGET_COUNTRY_OPTIONS,
  TARGET_YEAR_OPTIONS,
  STUDY_LEVEL_OPTIONS,
  PREFERRED_INTAKE_OPTIONS,
  FUNDING_TYPE_OPTIONS,
  PRIORITY_OPTIONS,
  GENDER_OPTIONS,
} from "@app/lib/students/options";
import { Sparkles } from "lucide-react";
import { StudentIdentitySection } from "./form/StudentIdentitySection";
import { StudentAcademicSection } from "./form/StudentAcademicSection";
import { StudentTestScoresSection } from "./form/StudentTestScoresSection";
import { StudentWorkExperienceSection } from "./form/StudentWorkExperienceSection";
import { StudentGoalsSection } from "./form/StudentGoalsSection";
import { StudentFinancialSection } from "./form/StudentFinancialSection";
import { StudentVisaSection } from "./form/StudentVisaSection";
import { StudentCrmStatusSection } from "./form/StudentCrmStatusSection";

function generateTestData(): StudentCreateInput {
  const firstNames = ["Priya", "Arjun", "Sneha", "Rahul", "Ananya", "Vikram"];
  const lastNames = ["Sharma", "Patel", "Kumar", "Singh", "Reddy", "Nair"];
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  const name = `${first} ${last}`;
  const slug = `${first.toLowerCase()}.${last.toLowerCase()}`;
  const timestamp = Date.now().toString(36).slice(-6);

  return {
    fullName: name,
    email: `${slug}+${timestamp}@example.com`,
    phone: `+91-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    countryOfResidence: "IN",
    gender: GENDER_OPTIONS[Math.floor(Math.random() * GENDER_OPTIONS.length)].value,
    city: "Bangalore",
    targetCountries: [TARGET_COUNTRY_OPTIONS[Math.floor(Math.random() * TARGET_COUNTRY_OPTIONS.length)].value],
    currentStage: STAGE_OPTIONS[Math.floor(Math.random() * 3)].value,
    priority: PRIORITY_OPTIONS[Math.floor(Math.random() * PRIORITY_OPTIONS.length)].value,
    stream: "Computer Science",
    academicScore: 8.5,
    academicScoreType: "cgpa",
    yearOfPassing: 2023,
    institutionName: "IIT Bangalore",
    targetCourses: ["Master of Computer Science", "Data Science"],
    studyLevel: "postgraduate",
    preferredIntake: PREFERRED_INTAKE_OPTIONS[Math.floor(Math.random() * PREFERRED_INTAKE_OPTIONS.length)].value,
    targetYear: TARGET_YEAR_OPTIONS[Math.floor(Math.random() * TARGET_YEAR_OPTIONS.length)].value,
    budgetTuition: 25000,
    budgetLiving: 15000,
    budgetCurrency: "USD",
    fundingType: FUNDING_TYPE_OPTIONS[Math.floor(Math.random() * FUNDING_TYPE_OPTIONS.length)].value,
    loanPreApproved: Math.random() > 0.5,
    workExperience: "1",
    employer: "Infosys",
    designation: "Software Engineer",
    ieltsScore: 7.5,
    greScore: 315,
    finalScore: 8.3,
    passportAvailable: true,
    priorVisaRefusals: false,
    notes: "Test student - generated for QA",
  };
}

export function StudentCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const createStudent = useCreateStudent();

  const form = useForm<StudentCreateInput>({
    resolver: zodResolver(studentCreateSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      countryOfResidence: "",
      currentStage: "lead",
      priority: "warm",
      targetCountries: [],
      budgetCurrency: "USD",
      loanPreApproved: false,
      passportAvailable: false,
      priorVisaRefusals: false,
    },
  });

  const onSubmit = async (data: StudentCreateInput) => {
    try {
      await createStudent.mutateAsync({
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
      });
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (e) {
      console.error(e);
      form.setError("root", {
        message: "Failed to create student. Please try again.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Student</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Basic Information</h3>
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
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
                      <Input type="email" placeholder="john@example.com" {...field} />
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
                      <Input placeholder="+1 234 567 8900" {...field} />
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
                      <Input placeholder="e.g., IN" {...field} />
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
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => form.reset(generateTestData())}
              >
                <Sparkles className="mr-1.5 h-4 w-4" />
                Generate test data
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createStudent.isPending}>
                  {createStudent.isPending ? "Creating..." : "Create Student"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
