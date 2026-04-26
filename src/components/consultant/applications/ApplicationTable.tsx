import Link from "next/link";
import { useRouter } from "next/navigation";
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

export function ApplicationTable({
  applications,
}: {
  applications: ApplicationListItem[];
}) {
  const router = useRouter();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>University / Program</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="w-[70px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((app) => (
          <TableRow
            key={app.id}
            className="cursor-pointer"
            onClick={() => router.push(`/consultant/applications/${app.id}`)}
          >
            <TableCell className="font-medium">
              {app.student?.fullName ?? app.student?.email ?? "—"}
            </TableCell>
            <TableCell>
              {app.program?.university?.name ?? "—"} /{" "}
              {app.program?.name ?? "—"}
            </TableCell>
            <TableCell>
              <Badge variant="outline">{app.status ?? "—"}</Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {app.applicationDate
                ? format(new Date(app.applicationDate), "MMM d, yyyy")
                : "—"}
            </TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <Button asChild variant="ghost" size="sm">
                <Link href={`/consultant/applications/${app.id}`}>View</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
