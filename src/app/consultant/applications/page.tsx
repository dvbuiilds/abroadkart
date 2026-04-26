"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { PageHeader } from "@app/components/shared/PageHeader";
import { Button } from "@app/components/ui/button";
import { ApplicationFilters } from "@app/components/consultant/applications/ApplicationFilters";
import { ApplicationTable } from "@app/components/consultant/applications/ApplicationTable";
import { ApplicationCreateDialog } from "@app/components/consultant/applications/ApplicationCreateDialog";
import { EmptyState } from "@app/components/shared/EmptyState";
import { LoadingSpinner } from "@app/components/shared/LoadingSpinner";
import { useApplications } from "@app/hooks/useApplications";
import { Plus } from "lucide-react";

const PAGE_SIZE = 10;

export default function ApplicationsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Math.max(0, parseInt(searchParams.get("page") ?? "1", 10) - 1);
  const status = searchParams.get("status") ?? "all";
  const studentId = searchParams.get("studentId") ?? "";

  const variables = useMemo(() => {
    const where: Record<string, unknown> = {
      isDeleted: { not: { equals: true } },
    };
    if (status !== "all") where.status = { equals: status };
    if (studentId) where.student = { id: { equals: studentId } };
    return {
      where,
      orderBy: [{ applicationDate: "desc" }],
      take: PAGE_SIZE,
      skip: page * PAGE_SIZE,
    };
  }, [status, studentId, page]);

  const { data, isLoading, isError } = useApplications(variables);

  const updateParams = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === "" || v === "all") next.delete(k);
      else next.set(k, v);
    });
    router.replace(`${pathname}?${next.toString()}`);
  };

  const [createOpen, setCreateOpen] = useState(false);

  const applications = data?.applications ?? [];

  const showCreate = createOpen || searchParams.get("new") === "1";
  const preselectedStudentId = searchParams.get("studentId") || undefined;

  if (isError) {
    return (
      <div className="space-y-4">
        <PageHeader title="Applications" />
        <p className="text-destructive">Failed to load applications.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Applications"
        breadcrumbs={[{ label: "Applications" }]}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Application
          </Button>
        }
      />

      <ApplicationFilters
        status={status}
        onStatusChange={(v) => updateParams({ status: v, page: "1" })}
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Create an application for a student."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Application
            </Button>
          }
        />
      ) : (
        <ApplicationTable applications={applications} />
      )}

      <ApplicationCreateDialog
        open={showCreate}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) updateParams({ new: "", studentId: "" });
        }}
        preselectedStudentId={preselectedStudentId}
        onSuccess={() => updateParams({})}
      />
    </div>
  );
}
