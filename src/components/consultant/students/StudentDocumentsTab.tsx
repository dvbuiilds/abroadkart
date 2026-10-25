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
import { format, isWithinInterval, addDays } from "date-fns";
import { AlertCircle } from "lucide-react";

export function StudentDocumentsTab({
  documents,
  onUploadClick,
}: {
  documents?: StudentDocumentListItem[];
  onUploadClick?: () => void;
}) {
  const list = documents ?? [];
  const today = new Date();
  const sevenDaysFromNow = addDays(today, 7);

  const isDueSoon = (dueDate: string | null | undefined): boolean => {
    if (!dueDate) return false;
    const date = new Date(dueDate);
    return isWithinInterval(date, { start: today, end: sevenDaysFromNow });
  };

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
              <TableHead>Due Date</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead>File</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((doc) => (
              <TableRow key={doc.id} className={isDueSoon(doc.dueDate) && !doc.file ? "bg-orange-50 dark:bg-orange-950" : ""}>
                <TableCell className="font-medium">{doc.documentType ?? "—"}</TableCell>
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
                <TableCell>
                  <div className="flex items-center gap-2">
                    {doc.dueDate ? (
                      <>
                        <span className="text-muted-foreground">
                          {format(new Date(doc.dueDate), "MMM d, yyyy")}
                        </span>
                        {isDueSoon(doc.dueDate) && !doc.file && (
                          <div title="Due soon">
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                          </div>
                        )}
                      </>
                    ) : (
                      "—"
                    )}
                  </div>
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
