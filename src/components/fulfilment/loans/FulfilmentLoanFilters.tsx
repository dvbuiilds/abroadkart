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
import { useConsultants } from '@app/hooks/useConsultants';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'initiated', label: 'Initiated' },
  { value: 'documentsPending', label: 'Documents Pending' },
  { value: 'underReview', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'disbursed', label: 'Disbursed' },
  { value: 'closed', label: 'Closed' },
];

export function FulfilmentLoanFilters({
  search,
  status,
  consultantId,
  onSearchChange,
  onStatusChange,
  onConsultantChange,
}: {
  search: string;
  status: string;
  consultantId: string;
  onSearchChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onConsultantChange: (v: string) => void;
}) {
  const [localSearch, setLocalSearch] = useState(search);
  const onSearchChangeRef = useRef(onSearchChange);
  onSearchChangeRef.current = onSearchChange;

  useEffect(() => {
    const t = setTimeout(() => onSearchChangeRef.current(localSearch), 300);
    return () => clearTimeout(t);
  }, [localSearch]);

  const { data: consultantsData } = useConsultants();
  const consultants = consultantsData?.consultants ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by student or consultant..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="max-w-sm"
        />
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
        <Select value={consultantId || 'all'} onValueChange={(v) => onConsultantChange(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Consultant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All consultants</SelectItem>
            {consultants.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name ?? c.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
