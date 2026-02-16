"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader } from "@app/components/ui/card";
import { Badge } from "@app/components/ui/badge";
import { Button } from "@app/components/ui/button";
import { Skeleton } from "@app/components/ui/skeleton";
import { useTasks, useUpdateTask } from "@app/hooks/useTasks";
import Link from "next/link";
import { format, isToday, isThisWeek } from "date-fns";
import { useCurrentUser } from "@app/hooks/useCurrentUser";

export function TaskSummary() {
  const { user } = useCurrentUser();
  const currentUserId = user?.id;

  const taskVariables = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfDay.getTime() + 7 * 24 * 60 * 60 * 1000);
    endOfWeek.setHours(23, 59, 59, 999);

    return {
      where: {
        isDeleted: { not: { equals: true } },
        ...(currentUserId
          ? { assignedTo: { id: { equals: currentUserId } } }
          : {}),
        dueDate: {
          gte: startOfDay.toISOString(),
          lte: endOfWeek.toISOString(),
        },
      },
      orderBy: [{ dueDate: "asc" }],
      take: 10,
      skip: 0,
    };
  }, [currentUserId]);

  const { data, isLoading, isError } = useTasks(taskVariables);

  const updateTask = useUpdateTask();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardHeader>
          <p className="text-sm font-medium">Tasks (this week)</p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Unable to load tasks.</p>
        </CardContent>
      </Card>
    );
  }

  const tasks = data.tasks ?? [];

  const markDone = (id: string) => {
    updateTask.mutate({ id, data: { status: "done" } });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <p className="text-sm font-medium">Tasks (this week)</p>
        <Button asChild variant="ghost" size="sm">
          <Link href="/consultant/tasks">View all</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tasks due this week.
          </p>
        ) : (
          <ul className="space-y-2">
            {tasks.slice(0, 5).map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/consultant/students/${task.student?.id ?? "#"}`}
                    className="font-medium hover:underline"
                  >
                    {task.title}
                  </Link>
                  {task.dueDate && (
                    <p className="text-xs text-muted-foreground">
                      {isToday(new Date(task.dueDate))
                        ? `Today ${format(new Date(task.dueDate), "HH:mm")}`
                        : isThisWeek(new Date(task.dueDate))
                          ? format(new Date(task.dueDate), "EEE, MMM d")
                          : format(new Date(task.dueDate), "MMM d")}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Badge
                    variant={task.status === "done" ? "secondary" : "outline"}
                  >
                    {task.status}
                  </Badge>
                  {task.status !== "done" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markDone(task.id)}
                      disabled={updateTask.isPending}
                    >
                      Done
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
