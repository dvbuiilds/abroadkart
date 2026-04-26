import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  documentUploadSchema,
  type DocumentUploadInput,
} from "@app/lib/validations/document";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import { useStudents } from "@app/hooks/useStudents";
import { useUploadDocumentWithFile } from "@app/hooks/useDocuments";
import { getMaxSizeForDocumentType } from "@app/lib/documents/constants";
import { toast } from "sonner";
import { FileUp } from "lucide-react";

const DOCUMENT_TYPES = [
  { value: "passport", label: "Passport" },
  { value: "birthCertificate", label: "Birth Certificate" },
  { value: "sop", label: "SOP" },
  { value: "resume", label: "Resume" },
  { value: "transcripts", label: "Academic Transcripts" },
  { value: "englishTest", label: "English Test" },
  { value: "financialDocs", label: "Financial Documents" },
  { value: "bankStatement", label: "Bank Statement" },
  { value: "loanAgreement", label: "Loan Agreement" },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentUploadDialog({
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
  const { data: studentsData } = useStudents({
    where: { isDeleted: { not: { equals: true } } },
    orderBy: [{ fullName: "asc" }],
    take: 200,
    skip: 0,
  });

  const uploadMutation = useUploadDocumentWithFile();

  const form = useForm<DocumentUploadInput>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      studentId: preselectedStudentId ?? "",
      documentType: undefined,
      file: undefined,
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset({
        studentId: preselectedStudentId ?? "",
        documentType: undefined,
        file: undefined,
      });
    }
    onOpenChange(nextOpen);
  };

  const documentType = form.watch("documentType");
  const selectedFile = form.watch("file");
  const fileError = form.formState.errors.file?.message;
  const maxSizeLabel =
    documentType === "bankStatement" ? "1 MB" : documentType ? "100 KB" : null;

  const onSubmit = form.handleSubmit(async (data) => {
    if (!data.file) return;
    const loadingId = toast.loading("Uploading document…");
    try {
      await uploadMutation.mutateAsync({
        file: data.file,
        studentId: data.studentId,
        documentType: data.documentType,
        applicationId: data.applicationId,
        loanApplicationId: data.loanApplicationId,
      });
      toast.dismiss(loadingId);
      toast.success("Document uploaded");
      form.reset({
        studentId: data.studentId,
        documentType: undefined,
        file: undefined,
      });
      onSuccess?.();
      handleOpenChange(false);
    } catch (err) {
      toast.dismiss(loadingId);
      const message = err instanceof Error ? err.message : "Upload failed";
      toast.error(message);
      form.setError("root", { message });
    }
  });

  const students = studentsData?.students ?? [];
  const isSubmitting = uploadMutation.isPending;
  const canSubmit =
    form.formState.isValid &&
    !!documentType &&
    !!selectedFile &&
    !isSubmitting;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
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
              name="documentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Type</FormLabel>
                  <Select
                    onValueChange={(v) => {
                      field.onChange(v);
                      form.setValue("file", undefined);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DOCUMENT_TYPES.map((o) => (
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
            {documentType && (
              <FormField
                control={form.control}
                name="file"
                render={({ field: fileField }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      PDF file
                      {maxSizeLabel && (
                        <span className="text-xs font-normal text-muted-foreground">
                          (max {maxSizeLabel})
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <label
                          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 transition-colors ${
                            fileError
                              ? "border-destructive bg-destructive/5 hover:bg-destructive/10"
                              : "border-muted-foreground/25 bg-muted/30 hover:border-muted-foreground/50 hover:bg-muted/50"
                          }`}
                        >
                          <input
                            type="file"
                            accept=".pdf,application/pdf"
                            className="sr-only"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              fileField.onChange(f ?? undefined);
                              form.trigger("file");
                              if (!f || !documentType) return;
                              if (f.type !== "application/pdf") {
                                toast.error("Only PDF is allowed");
                                return;
                              }
                              const maxBytes =
                                getMaxSizeForDocumentType(documentType);
                              if (f.size > maxBytes) {
                                const limit =
                                  documentType === "bankStatement"
                                    ? "1 MB"
                                    : "100 KB";
                                toast.error(`File must be under ${limit}`);
                              }
                            }}
                          />
                          <FileUp className="mb-2 h-8 w-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {selectedFile
                              ? selectedFile.name
                              : "Choose PDF (click to open file manager)"}
                          </span>
                          {selectedFile && (
                            <span className="mt-1 text-xs text-muted-foreground">
                              {formatFileSize(selectedFile.size)}
                            </span>
                          )}
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {form.formState.errors.root && (
              <p className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmit}>
                {isSubmitting ? "Uploading…" : "Upload"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
