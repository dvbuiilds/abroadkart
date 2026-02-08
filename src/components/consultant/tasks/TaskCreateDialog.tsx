import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  taskCreateSchema,
  type TaskCreateInput,
} from "@app/lib/validations/task";
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
import { Textarea } from "@app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import { useCreateTask } from "@app/hooks/useTasks";
import { useStudents } from "@app/hooks/useStudents";

const TASK_TYPES = [
  { value: "documentUpload", label: "Document Upload" },
  { value: "phoneCall", label: "Phone Call" },
  { value: "meeting", label: "Meeting" },
  { value: "application", label: "Application" },
  { value: "loanApproval", label: "Loan Approval" },
  { value: "visaApplication", label: "Visa Application" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export function TaskCreateDialog({
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
  const createTask = useCreateTask();

  const { data: studentsData } = useStudents({
    where: { isDeleted: { not: { equals: true } } },
    orderBy: [{ fullName: "asc" }],
    take: 200,
    skip: 0,
  });

  const form = useForm<TaskCreateInput>({
    resolver: zodResolver(taskCreateSchema),
    defaultValues: {
      studentId: preselectedStudentId ?? "",
      title: "",
      description: "",
      taskType: "documentUpload",
      priority: "medium",
      dueDate: undefined,
    },
  });

  const onSubmit = async (data: TaskCreateInput) => {
    try {
      await createTask.mutateAsync({
        ...(data.studentId
          ? { student: { connect: { id: data.studentId } } }
          : {}),
        title: data.title,
        description: data.description,
        taskType: data.taskType,
        priority: data.priority,
        dueDate: data.dueDate
          ? new Date(data.dueDate).toISOString()
          : undefined,
        ...(data.assignedToId
          ? { assignedTo: { connect: { id: data.assignedToId } } }
          : {}),
      });
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (e) {
      console.error(e);
      form.setError("root", { message: "Failed to create task." });
    }
  };

  const students = studentsData?.students ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student (optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
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
              name="taskType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TASK_TYPES.map((o) => (
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
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map((o) => (
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
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value ?? ""} rows={3} />
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
              <Button type="submit" disabled={createTask.isPending}>
                {createTask.isPending ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
