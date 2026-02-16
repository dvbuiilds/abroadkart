'use client';

import { useMemo, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { PageHeader } from '@app/components/shared/PageHeader';
import { Button } from '@app/components/ui/button';
import { StudentFilters } from '@app/components/consultant/students/StudentFilters';
import { StudentTable } from '@app/components/consultant/students/StudentTable';
import { StudentPagination } from '@app/components/consultant/students/StudentPagination';
import { StudentCreateDialog } from '@app/components/consultant/students/StudentCreateDialog';
import { StudentEditSheet } from '@app/components/consultant/students/StudentEditSheet';
import { EmptyState } from '@app/components/shared/EmptyState';
import { LoadingSpinner } from '@app/components/shared/LoadingSpinner';
import { useStudents } from '@app/hooks/useStudents';
import type { StudentListItem } from '@app/graphql/types';
import { Plus } from 'lucide-react';

const PAGE_SIZE = 10;

export default function StudentsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Math.max(0, parseInt(searchParams.get('page') ?? '1', 10) - 1);
  const search = searchParams.get('search') ?? '';
  const stage = searchParams.get('stage') ?? 'all';

  const variables = useMemo(() => {
    const where: Record<string, unknown> = {
      isDeleted: { not: { equals: true } },
    };
    if (search.trim()) {
      where.OR = [
        { fullName: { contains: search.trim(), mode: 'insensitive' } },
        { email: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }
    if (stage !== 'all') {
      where.currentStage = { equals: stage };
    }
    return { where, orderBy: [{ createdAt: 'desc' }], take: PAGE_SIZE, skip: page * PAGE_SIZE };
  }, [search, stage, page]);

  const { data, isLoading, isError } = useStudents(variables);

  const updateParams = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === '' || v === 'all' || v === '1') next.delete(k);
      else next.set(k, v);
    });
    router.replace(`${pathname}?${next.toString()}`);
  };

  const [createOpen, setCreateOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<StudentListItem | null>(null);

  const students = data?.students ?? [];
  const total = data?.studentsCount ?? 0;

  if (isError) {
    return (
      <div className="space-y-4">
        <PageHeader title="Students" />
        <p className="text-destructive">Failed to load students.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Students"
        breadcrumbs={[{ label: 'Students' }]}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        }
      />

      <StudentFilters
        search={search}
        stage={stage}
        onSearchChange={(v) => updateParams({ search: v, page: '1' })}
        onStageChange={(v) => updateParams({ stage: v, page: '1' })}
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : students.length === 0 ? (
        <EmptyState
          title="No students yet"
          description="Add your first student to get started."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          }
        />
      ) : (
        <>
          <StudentTable students={students} onEdit={setEditStudent} />
          <StudentPagination
            total={total}
            skip={page * PAGE_SIZE}
            onPageChange={(skip) => updateParams({ page: String(Math.floor(skip / PAGE_SIZE) + 1) })}
          />
        </>
      )}

      <StudentCreateDialog open={createOpen} onOpenChange={setCreateOpen} />

      {editStudent && (
        <StudentEditSheet
          student={editStudent}
          open={!!editStudent}
          onOpenChange={(open) => !open && setEditStudent(null)}
        />
      )}
    </div>
  );
}
