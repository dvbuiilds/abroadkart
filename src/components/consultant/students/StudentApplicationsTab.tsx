import Link from "next/link";
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
import type { ApplicationListItem } from "@app/graphql/types";
import { format } from "date-fns";
import { Plus } from "lucide-react";

export function StudentApplicationsTab({
  applications,
  onCreateClick,
}: {
  applications?: ApplicationListItem[];
  studentId: string;
  onCreateClick?: () => void;
}) {
  const list = applications ?? [];

  return (
    <div className="space-y-4">
      {onCreateClick && (
        <div className="flex justify-end">
          <Button size="sm" onClick={onCreateClick}>
            <Plus className="mr-2 h-4 w-4" />
            Add Application
          </Button>
        </div>
      )}
      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">No applications yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Program / University</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((app) => (
              <TableRow key={app.id}>
                <TableCell>
                  {app.program?.name ?? "—"}
                  {app.program?.university?.name && (
                    <span className="text-muted-foreground">
                      {" "}
                      @ {app.program.university.name}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{app.status ?? "—"}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {app.applicationDate
                    ? format(new Date(app.applicationDate), "MMM d, yyyy")
                    : "—"}
                </TableCell>
                <TableCell>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/consultant/applications/${app.id}`}>
                      View
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
