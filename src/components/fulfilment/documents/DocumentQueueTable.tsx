'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@app/components/ui/table';
import { Badge } from '@app/components/ui/badge';
import type { StudentDocumentListItem } from '@app/graphql/types';
import { format } from 'date-fns';

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  pending: 'outline',
  verified: 'default',
  rejected: 'destructive',
};

export function DocumentQueueTable({
  documents,
  onSelectDocument,
}: {
  documents: StudentDocumentListItem[];
  onSelectDocument: (doc: StudentDocumentListItem) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Document Type</TableHead>
          <TableHead>Uploaded At</TableHead>
          <TableHead>Consultant</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((doc) => (
          <TableRow
            key={doc.id}
            className="cursor-pointer"
            onClick={() => onSelectDocument(doc)}
          >
            <TableCell className="font-medium">
              {doc.student?.fullName ?? doc.student?.email ?? '—'}
            </TableCell>
            <TableCell>{doc.documentType ?? '—'}</TableCell>
            <TableCell className="text-muted-foreground">
              {doc.uploadedAt ? format(new Date(doc.uploadedAt), 'MMM d, yyyy') : '—'}
            </TableCell>
            <TableCell>{doc.student?.tenant?.name ?? '—'}</TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANTS[doc.verificationStatus ?? ''] ?? 'secondary'}>
                {doc.verificationStatus ?? '—'}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
