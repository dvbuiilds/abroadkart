import { Input } from "@app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import { useEffect, useRef, useState } from "react";
import { STAGE_OPTIONS, PRIORITY_OPTIONS } from "@app/lib/students/options";

const STAGE_FILTER_OPTIONS = [
  { value: "all", label: "All stages" },
  ...STAGE_OPTIONS,
];

const PRIORITY_FILTER_OPTIONS = [
  { value: "all", label: "All priorities" },
  ...PRIORITY_OPTIONS,
];

export function StudentFilters({
  search,
  stage,
  priority,
  counsellor,
  onSearchChange,
  onStageChange,
  onPriorityChange,
  onCounselllorChange,
}: {
  search: string;
  stage: string;
  priority: string;
  counsellor: string;
  onSearchChange: (v: string) => void;
  onStageChange: (v: string) => void;
  onPriorityChange: (v: string) => void;
  onCounselllorChange: (v: string) => void;
}) {
  const [localSearch, setLocalSearch] = useState(search);
  const onSearchChangeRef = useRef(onSearchChange);
  onSearchChangeRef.current = onSearchChange;

  useEffect(() => {
    const t = setTimeout(() => onSearchChangeRef.current(localSearch), 300);
    return () => clearTimeout(t);
  }, [localSearch]);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap">
      <Input
        placeholder="Search by name or email..."
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        className="max-w-sm"
      />
      <Select value={stage} onValueChange={onStageChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Stage" />
        </SelectTrigger>
        <SelectContent>
          {STAGE_FILTER_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={priority} onValueChange={onPriorityChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          {PRIORITY_FILTER_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        placeholder="Filter by counsellor name..."
        value={counsellor}
        onChange={(e) => onCounselllorChange(e.target.value)}
        className="max-w-sm"
      />
    </div>
  );
}
