import { Input } from "@app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import { useEffect, useRef, useState } from "react";

const STAGE_OPTIONS = [
  { value: "all", label: "All stages" },
  { value: "lead", label: "Lead" },
  { value: "prospect", label: "Prospect" },
  { value: "applied", label: "Applied" },
  { value: "inLoanProcess", label: "In Loan Process" },
  { value: "enrolled", label: "Enrolled" },
  { value: "graduated", label: "Graduated" },
];

export function StudentFilters({
  search,
  stage,
  onSearchChange,
  onStageChange,
}: {
  search: string;
  stage: string;
  onSearchChange: (v: string) => void;
  onStageChange: (v: string) => void;
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
          {STAGE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
