"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@app/components/shared/PageHeader";
import { Button } from "@app/components/ui/button";
import { Badge } from "@app/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@app/components/ui/tabs";
import { LoadingSpinner } from "@app/components/shared/LoadingSpinner";
import { useStudent } from "@app/hooks/useStudents";
import { StudentOverview } from "@app/components/consultant/students/StudentOverview";
import { StudentApplicationsTab } from "@app/components/consultant/students/StudentApplicationsTab";
import { StudentLoansTab } from "@app/components/consultant/students/StudentLoansTab";
import { StudentDocumentsTab } from "@app/components/consultant/students/StudentDocumentsTab";
import { StudentTasksTab } from "@app/components/consultant/students/StudentTasksTab";
import { StudentEditSheet } from "@app/components/consultant/students/StudentEditSheet";
import { Pencil } from "lucide-react";
import type { Student } from "@app/graphql/types";

const STAGE_VARIANTS: Record<
  string,
  "default" | "secondary" | "outline" | "success" | "warning"
> = {
  lead: "secondary",
  prospect: "secondary",
  applied: "outline",
  inLoanProcess: "warning",
  enrolled: "success",
  graduated: "default",
};

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: student, isLoading, isError } = useStudent(id);
  const [editOpen, setEditOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError || !student) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Student"
          breadcrumbs={[
            { label: "Students", href: "/consultant/students" },
            { label: "Not found" },
          ]}
        />
        <p className="text-destructive">Student not found.</p>
      </div>
    );
  }

  const name = student.fullName ?? student.email ?? "Student";

  return (
    <div className="space-y-4">
      <PageHeader
        title={name}
        breadcrumbs={[
          { label: "Students", href: "/consultant/students" },
          { label: name },
        ]}
        actions={
          <>
            <Badge
              variant={
                STAGE_VARIANTS[student.currentStage ?? ""] ?? "secondary"
              }
            >
              {student.currentStage ?? "—"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditStudent(student);
                setEditOpen(true);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </>
        }
      />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">
            Applications ({student.applications?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="loans">
            Loans ({student.loanApplications?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="documents">
            Documents ({student.documents?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="tasks">
            Tasks ({student.tasks?.length ?? 0})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <StudentOverview student={student} />
        </TabsContent>
        <TabsContent value="applications" className="mt-4">
          <StudentApplicationsTab
            studentId={id}
            applications={student.applications}
            onCreateClick={() =>
              router.push(`/consultant/applications?new=1&studentId=${id}`)
            }
          />
        </TabsContent>
        <TabsContent value="loans" className="mt-4">
          <StudentLoansTab
            loans={student.loanApplications}
            onCreateClick={() =>
              router.push(`/consultant/loans?new=1&studentId=${id}`)
            }
          />
        </TabsContent>
        <TabsContent value="documents" className="mt-4">
          <StudentDocumentsTab
            documents={student.documents}
            onUploadClick={() =>
              router.push(`/consultant/documents?upload=1&studentId=${id}`)
            }
          />
        </TabsContent>
        <TabsContent value="tasks" className="mt-4">
          <StudentTasksTab
            tasks={student.tasks}
            onCreateClick={() =>
              router.push(`/consultant/tasks?new=1&studentId=${id}`)
            }
          />
        </TabsContent>
      </Tabs>

      {editStudent && (
        <StudentEditSheet
          student={editStudent}
          open={editOpen}
          onOpenChange={(open) => {
            setEditOpen(open);
            if (!open) setEditStudent(null);
          }}
        />
      )}
    </div>
  );
}
