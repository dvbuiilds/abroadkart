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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@app/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Pencil } from "lucide-react";
import type { StudentListItem } from "@app/graphql/types";
import { format } from "date-fns";

const STAGE_VARIANTS: Record<
  string,
  "default" | "secondary" | "outline" | "success" | "warning"
> = {
  lead: "secondary",
  prospect: "secondary",
  applied: "outline",
  inLoanProcess: "warning",
  enrolled: "success",
  graduated: "default",
};

export function StudentTable({
  students,
  onEdit,
}: {
  students: StudentListItem[];
  onEdit: (student: StudentListItem) => void;
}) {
  const router = useRouter();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Country</TableHead>
          <TableHead>Stage</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-[70px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow
            key={student.id}
            className="cursor-pointer"
            onClick={() => router.push(`/consultant/students/${student.id}`)}
          >
            <TableCell className="font-medium">
              {student.fullName ?? "—"}
            </TableCell>
            <TableCell>{student.email ?? "—"}</TableCell>
            <TableCell>{student.countryOfResidence ?? "—"}</TableCell>
            <TableCell>
              <Badge
                variant={
                  STAGE_VARIANTS[student.currentStage ?? ""] ?? "secondary"
                }
              >
                {student.currentStage ?? "—"}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {student.createdAt
                ? format(new Date(student.createdAt), "MMM d, yyyy")
                : "—"}
            </TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/consultant/students/${student.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(student)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
