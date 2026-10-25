'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/components/ui/select';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'reimbursed', label: 'Reimbursed' },
];

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All categories' },
  { value: 'applicationFee', label: 'Application Fee' },
  { value: 'ielts', label: 'IELTS' },
  { value: 'visaFee', label: 'Visa Fee' },
  { value: 'travel', label: 'Travel' },
  { value: 'accommodation', label: 'Accommodation' },
];

export function ReimbursementFilters({
  status,
  category,
  onStatusChange,
  onCategoryChange,
}: {
  status: string;
  category: string;
  onStatusChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
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
      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          {CATEGORY_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
