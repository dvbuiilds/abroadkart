import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loanCreateSchema,
  type LoanCreateInput,
} from "@app/lib/validations/loan";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import { useCreateLoan } from "@app/hooks/useLoans";
import { useStudents } from "@app/hooks/useStudents";
import { useApplications } from "@app/hooks/useApplications";

export function LoanCreateDialog({
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
  const createLoan = useCreateLoan();

  const { data: studentsData } = useStudents({
    where: { isDeleted: { not: { equals: true } } },
    orderBy: [{ fullName: "asc" }],
    take: 200,
    skip: 0,
  });

  const { data: applicationsData } = useApplications({
    where: preselectedStudentId
      ? {
          student: { id: { equals: preselectedStudentId } },
          isDeleted: { not: { equals: true } },
        }
      : { isDeleted: { not: { equals: true } } },
    orderBy: [{ applicationDate: "desc" }],
    take: 50,
    skip: 0,
  });

  const form = useForm<LoanCreateInput>({
    resolver: zodResolver(loanCreateSchema),
    defaultValues: {
      studentId: preselectedStudentId ?? "",
      applicationId: undefined,
      loanAmountRequested: undefined,
      currency: "INR",
      loanTenure: undefined,
      consultantRemarks: "",
    },
  });

  const onSubmit = async (data: LoanCreateInput) => {
    try {
      await createLoan.mutateAsync({
        student: { connect: { id: data.studentId } },
        ...(data.applicationId
          ? { application: { connect: { id: data.applicationId } } }
          : {}),
        loanAmountRequested: data.loanAmountRequested,
        currency: data.currency,
        loanTenure: data.loanTenure,
        consultantRemarks: data.consultantRemarks || undefined,
      });
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (e) {
      console.error(e);
      form.setError("root", { message: "Failed to create loan." });
    }
  };

  const students = studentsData?.students ?? [];
  const applications = applicationsData?.applications ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Initiate Loan</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!!preselectedStudentId}
                  >
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
              name="applicationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application (optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select application" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {applications.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.program?.name} – {a.program?.university?.name}
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
              name="loanAmountRequested"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loan Amount Requested</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="INR">INR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="loanTenure"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tenure (months, optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="consultantRemarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks (optional)</FormLabel>
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
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createLoan.isPending}>
                {createLoan.isPending ? "Creating..." : "Initiate Loan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
