import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@app/components/ui/table";
import { Badge } from "@app/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import type { TaskListItem } from "@app/graphql/types";
import { format } from "date-fns";
import { useUpdateTask } from "@app/hooks/useTasks";

export function TaskTable({ tasks }: { tasks: TaskListItem[] }) {
  const updateTask = useUpdateTask();

  const onStatusChange = (taskId: string, status: string) => {
    updateTask.mutate({ id: taskId, data: { status } });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Student</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id}>
            <TableCell className="font-medium">{task.title ?? "—"}</TableCell>
            <TableCell>{task.student?.fullName ?? "—"}</TableCell>
            <TableCell>
              <Badge variant="outline">{task.priority ?? "—"}</Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {task.dueDate
                ? format(new Date(task.dueDate), "MMM d, yyyy")
                : "—"}
            </TableCell>
            <TableCell>
              <Select
                value={task.status ?? "todo"}
                onValueChange={(v) => onStatusChange(task.id, v)}
                disabled={updateTask.isPending}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Todo</SelectItem>
                  <SelectItem value="inProgress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
