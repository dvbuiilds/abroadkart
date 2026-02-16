'use client';

import { useEffect, useRef, useState } from 'react';
import { Input } from '@app/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/components/ui/select';

const DOCUMENT_TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'passport', label: 'Passport' },
  { value: 'birthCertificate', label: 'Birth Certificate' },
  { value: 'sop', label: 'SOP' },
  { value: 'resume', label: 'Resume' },
  { value: 'transcripts', label: 'Academic Transcripts' },
  { value: 'englishTest', label: 'English Test' },
  { value: 'financialDocs', label: 'Financial Documents' },
  { value: 'bankStatement', label: 'Bank Statement' },
  { value: 'loanAgreement', label: 'Loan Agreement' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
];

export function DocumentQueueFilters({
  search,
  documentType,
  status,
  onSearchChange,
  onDocumentTypeChange,
  onStatusChange,
}: {
  search: string;
  documentType: string;
  status: string;
  onSearchChange: (v: string) => void;
  onDocumentTypeChange: (v: string) => void;
  onStatusChange: (v: string) => void;
}) {
  const [localSearch, setLocalSearch] = useState(search);
  const onSearchChangeRef = useRef(onSearchChange);
  onSearchChangeRef.current = onSearchChange;

  useEffect(() => {
    const t = setTimeout(() => onSearchChangeRef.current(localSearch), 300);
    return () => clearTimeout(t);
  }, [localSearch]);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <Input
        placeholder="Search by student name..."
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        className="max-w-sm"
      />
      <Select value={documentType} onValueChange={onDocumentTypeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Document type" />
        </SelectTrigger>
        <SelectContent>
          {DOCUMENT_TYPE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
