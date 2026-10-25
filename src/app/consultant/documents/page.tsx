'use client';

import { useMemo, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { PageHeader } from '@app/components/shared/PageHeader';
import { Button } from '@app/components/ui/button';
import { DocumentTable } from '@app/components/consultant/documents/DocumentTable';
import { DocumentUploadDialog } from '@app/components/consultant/documents/DocumentUploadDialog';
import { EmptyState } from '@app/components/shared/EmptyState';
import { LoadingSpinner } from '@app/components/shared/LoadingSpinner';
import { useDocuments } from '@app/hooks/useDocuments';
import { Plus } from 'lucide-react';

const PAGE_SIZE = 20;

export default function DocumentsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Math.max(0, parseInt(searchParams.get('page') ?? '1', 10) - 1);
  const studentId = searchParams.get('studentId') ?? '';

  const variables = useMemo(() => {
    const where: Record<string, unknown> = {};
    if (studentId) where.student = { id: { equals: studentId } };
    return { where, orderBy: [{ uploadedAt: 'desc' }], take: PAGE_SIZE, skip: page * PAGE_SIZE };
  }, [studentId, page]);

  const { data, isLoading, isError } = useDocuments(variables);

  const updateParams = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === '') next.delete(k);
      else next.set(k, v);
    });
    router.replace(`${pathname}?${next.toString()}`);
  };

  const [uploadOpen, setUploadOpen] = useState(false);
  const showUpload = uploadOpen || searchParams.get('upload') === '1';
  const preselectedStudentId = searchParams.get('studentId') || undefined;

  const documents = data?.studentDocuments ?? [];

  if (isError) {
    return (
      <div className="space-y-4">
        <PageHeader title="Documents" />
        <p className="text-destructive">Failed to load documents.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Documents"
        breadcrumbs={[{ label: 'Documents' }]}
        actions={
          <Button onClick={() => setUploadOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          title="No documents yet"
          description="Upload a document for a student."
          action={
            <Button onClick={() => setUploadOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          }
        />
      ) : (
        <DocumentTable documents={documents} />
      )}

      <DocumentUploadDialog
        open={showUpload}
        onOpenChange={(open) => {
          setUploadOpen(open);
          if (!open) updateParams({ upload: '', studentId: '' });
        }}
        preselectedStudentId={preselectedStudentId}
        onSuccess={() => updateParams({})}
      />
    </div>
  );
}
