'use client';

import { useMemo, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { PageHeader } from '@app/components/shared/PageHeader';
import { DocumentQueueFilters } from '@app/components/fulfilment/documents/DocumentQueueFilters';
import { DocumentQueueTable } from '@app/components/fulfilment/documents/DocumentQueueTable';
import { DocumentReviewSheet } from '@app/components/fulfilment/documents/DocumentReviewSheet';
import { EmptyState } from '@app/components/shared/EmptyState';
import { LoadingSpinner } from '@app/components/shared/LoadingSpinner';
import { useDocumentQueue } from '@app/hooks/useDocumentQueue';
import type { StudentDocumentListItem } from '@app/graphql/types';

const PAGE_SIZE = 20;

export default function FulfilmentDocumentsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Math.max(0, parseInt(searchParams.get('page') ?? '1', 10) - 1);
  const documentType = searchParams.get('documentType') ?? 'all';
  const status = searchParams.get('status') ?? 'pending';
  const search = searchParams.get('search') ?? '';

  const variables = useMemo(() => {
    const conditions: Record<string, unknown>[] = [];
    if (documentType !== 'all') conditions.push({ documentType: { equals: documentType } });
    if (status !== 'all') conditions.push({ verificationStatus: { equals: status } });
    if (search.trim()) {
      conditions.push({
        OR: [
          { student: { fullName: { contains: search.trim(), mode: 'insensitive' } } },
          { student: { email: { contains: search.trim(), mode: 'insensitive' } } },
        ],
      });
    }
    const where = conditions.length === 0 ? {} : conditions.length === 1 ? conditions[0] : { AND: conditions };
    return {
      where,
      orderBy: [{ uploadedAt: 'asc' }],
      take: PAGE_SIZE,
      skip: page * PAGE_SIZE,
    };
  }, [documentType, status, search, page]);

  const { data, isLoading, isError } = useDocumentQueue(variables);

  const updateParams = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === '' || v === 'all') next.delete(k);
      else next.set(k, v);
    });
    router.replace(`${pathname}?${next.toString()}`);
  };

  const [selectedDoc, setSelectedDoc] = useState<StudentDocumentListItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleSelectDocument = (doc: StudentDocumentListItem) => {
    setSelectedDoc(doc);
    setSheetOpen(true);
  };

  const documents = data?.studentDocuments ?? [];

  if (isError) {
    return (
      <div className="space-y-4">
        <PageHeader title="Document Verification" breadcrumbs={[{ label: 'Documents' }]} />
        <p className="text-destructive">Failed to load documents.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Document Verification"
        breadcrumbs={[{ label: 'Documents', href: '/fulfilment/documents' }]}
      />

      <DocumentQueueFilters
        search={search}
        documentType={documentType}
        status={status}
        onSearchChange={(v) => updateParams({ search: v, page: '1' })}
        onDocumentTypeChange={(v) => updateParams({ documentType: v, page: '1' })}
        onStatusChange={(v) => updateParams({ status: v, page: '1' })}
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          title="No documents found"
          description="No documents match your filters."
        />
      ) : (
        <DocumentQueueTable documents={documents} onSelectDocument={handleSelectDocument} />
      )}

      <DocumentReviewSheet
        document={selectedDoc}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
