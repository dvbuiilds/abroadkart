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
import type { StudentDocumentListItem } from "@app/graphql/types";
import { format } from "date-fns";

export function StudentDocumentsTab({
  documents,
  onUploadClick,
}: {
  documents?: StudentDocumentListItem[];
  onUploadClick?: () => void;
}) {
  const list = documents ?? [];

  return (
    <div className="space-y-4">
      {onUploadClick && (
        <div className="flex justify-end">
          <Button size="sm" onClick={onUploadClick}>
            Upload Document
          </Button>
        </div>
      )}
      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">No documents yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead>File</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((doc) => (
              <TableRow key={doc.id}>
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
      )}
    </div>
  );
}
