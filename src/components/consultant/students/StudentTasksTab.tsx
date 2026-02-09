import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@app/components/ui/table";
import { Badge } from "@app/components/ui/badge";
import { Button } from "@app/components/ui/button";
import type { TaskListItem } from "@app/graphql/types";
import { format } from "date-fns";

export function StudentTasksTab({
  tasks,
  onCreateClick,
}: {
  tasks?: TaskListItem[];
  onCreateClick?: () => void;
}) {
  const list = tasks ?? [];

  return (
    <div className="space-y-4">
      {onCreateClick && (
        <div className="flex justify-end">
          <Button size="sm" onClick={onCreateClick}>
            Add Task
          </Button>
        </div>
      )}
      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tasks yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">
                  {task.title ?? "—"}
                </TableCell>
                <TableCell>{task.taskType ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline">{task.priority ?? "—"}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{task.status ?? "—"}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {task.dueDate
                    ? format(new Date(task.dueDate), "MMM d, yyyy")
                    : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
