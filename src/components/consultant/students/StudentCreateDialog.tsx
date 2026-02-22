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
import { Checkbox } from "@app/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import { useCreateStudent } from "@app/hooks/useStudents";
import {
  BUDGET_PER_YEAR_OPTIONS,
  PROGRAM_DISCIPLINE_OPTIONS,
  QUALIFICATION_OPTIONS,
  STAGE_OPTIONS,
  TARGET_COUNTRY_OPTIONS,
  TARGET_YEAR_OPTIONS,
  TEST_SCORE_FIELDS,
  WORK_EXPERIENCE_OPTIONS,
} from "@app/lib/students/options";
import { Sparkles } from "lucide-react";

/** Generates valid test data for the student create form (for testing) */
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
    countryOfResidence: "India",
    targetCountry: TARGET_COUNTRY_OPTIONS[Math.floor(Math.random() * TARGET_COUNTRY_OPTIONS.length)].value,
    currentStage: STAGE_OPTIONS[Math.floor(Math.random() * 3)].value,
    qualification: QUALIFICATION_OPTIONS[Math.floor(Math.random() * QUALIFICATION_OPTIONS.length)].value,
    targetYear: TARGET_YEAR_OPTIONS[Math.floor(Math.random() * TARGET_YEAR_OPTIONS.length)].value,
    budgetPerYear: BUDGET_PER_YEAR_OPTIONS[Math.floor(Math.random() * BUDGET_PER_YEAR_OPTIONS.length)].value,
    programDisciplines: ["computerScience", "engineering", "business"],
    workExperience: WORK_EXPERIENCE_OPTIONS[Math.floor(Math.random() * WORK_EXPERIENCE_OPTIONS.length)].value,
    openForScholarshipsLoans: Math.random() > 0.5,
    ieltsScore: 7,
    toeflScore: 95,
    pteScore: 65,
    gmatScore: 650,
    greScore: 315,
    satScore: 1350,
    actScore: 28,
    finalScore: 8.5,
    parentMonthlyIncome: 75000,
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
      targetCountry: "AUS",
      currentStage: "lead",
      qualification: "bachelors",
      targetYear: "2026",
      budgetPerYear: "lt20k",
      programDisciplines: [],
      openForScholarshipsLoans: false,
    },
  });

  const onSubmit = async (data: StudentCreateInput) => {
    try {
      await createStudent.mutateAsync({
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
        ieltsScore:
          data.ieltsScore != null ? String(data.ieltsScore) : undefined,
        toeflScore:
          data.toeflScore != null ? String(data.toeflScore) : undefined,
        pteScore: data.pteScore != null ? String(data.pteScore) : undefined,
        gmatScore:
          data.gmatScore != null ? String(data.gmatScore) : undefined,
        greScore: data.greScore != null ? String(data.greScore) : undefined,
        satScore: data.satScore != null ? String(data.satScore) : undefined,
        actScore: data.actScore != null ? String(data.actScore) : undefined,
        finalScore:
          data.finalScore != null ? String(data.finalScore) : undefined,
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Student</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      {...field}
                    />
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
                    <Input placeholder="e.g. IN, US" {...field} />
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
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
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 8.2"
                      {...field}
                      value={field.value ?? ""}
                    />
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
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
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
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
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
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
                      const isChecked = (field.value ?? []).includes(
                        option.value
                      );
                      return (
                        <label
                          key={option.value}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              const next = new Set(field.value ?? []);
                              if (checked) {
                                next.add(option.value);
                              } else {
                                next.delete(option.value);
                              }
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

            <p className="pt-2 text-sm font-semibold text-muted-foreground">
              Test Scores
            </p>
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
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Optional"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <p className="pt-2 text-sm font-semibold text-muted-foreground">
              Other Details
            </p>
            <FormField
              control={form.control}
              name="workExperience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Experience</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
                    <Input {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.formState.errors.root && (
              <p className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2">
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
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
