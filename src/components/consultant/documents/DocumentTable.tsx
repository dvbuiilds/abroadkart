import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@app/components/ui/table";
import { Badge } from "@app/components/ui/badge";
import type { StudentDocumentListItem } from "@app/graphql/types";
import { format } from "date-fns";

export function DocumentTable({
  documents,
}: {
  documents: StudentDocumentListItem[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Uploaded</TableHead>
          <TableHead>File</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((doc) => (
          <TableRow key={doc.id}>
            <TableCell className="font-medium">
              {doc.student?.fullName ?? doc.student?.email ?? "—"}
            </TableCell>
            <TableCell>{doc.documentType ?? "—"}</TableCell>
            <TableCell>
              <Badge
                variant={
                  doc.verificationStatus === "verified"
                    ? "success"
                    : doc.verificationStatus === "rejected"
                      ? "destructive"
                      : "secondary"
                }
              >
                {doc.verificationStatus ?? "pending"}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {doc.uploadedAt
                ? format(new Date(doc.uploadedAt), "MMM d, yyyy")
                : "—"}
            </TableCell>
            <TableCell>
              {doc.file?.url ? (
                <a
                  href={doc.file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {doc.file.filename ?? "View"}
                </a>
              ) : (
                "—"
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
