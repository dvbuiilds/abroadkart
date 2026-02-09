'use client';

import { useMemo, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { PageHeader } from '@app/components/shared/PageHeader';
import { Button } from '@app/components/ui/button';
import { TaskFilters } from '@app/components/consultant/tasks/TaskFilters';
import { TaskTable } from '@app/components/consultant/tasks/TaskTable';
import { TaskCreateDialog } from '@app/components/consultant/tasks/TaskCreateDialog';
import { EmptyState } from '@app/components/shared/EmptyState';
import { LoadingSpinner } from '@app/components/shared/LoadingSpinner';
import { useTasks } from '@app/hooks/useTasks';
import { Plus } from 'lucide-react';

const PAGE_SIZE = 20;

export default function TasksPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Math.max(0, parseInt(searchParams.get('page') ?? '1', 10) - 1);
  const status = searchParams.get('status') ?? 'all';
  const priority = searchParams.get('priority') ?? 'all';
  const studentId = searchParams.get('studentId') ?? '';

  const variables = useMemo(() => {
    const where: Record<string, unknown> = {
      isDeleted: { not: { equals: true } },
    };
    if (status !== 'all') where.status = { equals: status };
    if (priority !== 'all') where.priority = { equals: priority };
    if (studentId) where.student = { id: { equals: studentId } };
    return { where, orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }] as Record<string, string>[], take: PAGE_SIZE, skip: page * PAGE_SIZE };
  }, [status, priority, studentId, page]);

  const { data, isLoading, isError } = useTasks(variables);

  const updateParams = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === '' || v === 'all') next.delete(k);
      else next.set(k, v);
    });
    router.replace(`${pathname}?${next.toString()}`);
  };

  const [createOpen, setCreateOpen] = useState(false);
  const showCreate = createOpen || searchParams.get('new') === '1';
  const preselectedStudentId = searchParams.get('studentId') || undefined;

  const tasks = data?.tasks ?? [];

  if (isError) {
    return (
      <div className="space-y-4">
        <PageHeader title="Tasks" />
        <p className="text-destructive">Failed to load tasks.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Tasks"
        breadcrumbs={[{ label: 'Tasks' }]}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        }
      />

      <TaskFilters
        status={status}
        priority={priority}
        onStatusChange={(v) => updateParams({ status: v, page: '1' })}
        onPriorityChange={(v) => updateParams({ priority: v, page: '1' })}
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="Create a task to get started."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          }
        />
      ) : (
        <TaskTable tasks={tasks} />
      )}

      <TaskCreateDialog
        open={showCreate}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) updateParams({ new: '', studentId: '' });
        }}
        preselectedStudentId={preselectedStudentId}
        onSuccess={() => updateParams({})}
      />
    </div>
  );
}
