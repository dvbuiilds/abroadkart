"use client";

import { useParams } from "next/navigation";
import { PageHeader } from "@app/components/shared/PageHeader";
import { LoadingSpinner } from "@app/components/shared/LoadingSpinner";
import { useApplication } from "@app/hooks/useApplications";
import { ApplicationDetail } from "@app/components/consultant/applications/ApplicationDetail";

export default function ApplicationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: application, isLoading, isError } = useApplication(id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError || !application) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Application"
          breadcrumbs={[
            { label: "Applications", href: "/consultant/applications" },
            { label: "Not found" },
          ]}
        />
        <p className="text-destructive">Application not found.</p>
      </div>
    );
  }

  const title = application.program?.name
    ? `${application.student?.fullName ?? "Student"} – ${application.program.name}`
    : "Application";

  return (
    <div className="space-y-4">
      <PageHeader
        title={title}
        breadcrumbs={[
          { label: "Applications", href: "/consultant/applications" },
          { label: title },
        ]}
      />
      <ApplicationDetail application={application} />
    </div>
  );
}
