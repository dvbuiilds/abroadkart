import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "todo", label: "Todo" },
  { value: "inProgress", label: "In Progress" },
  { value: "done", label: "Done" },
  { value: "blocked", label: "Blocked" },
];

const PRIORITY_OPTIONS = [
  { value: "all", label: "All priorities" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export function TaskFilters({
  status,
  priority,
  onStatusChange,
  onPriorityChange,
}: {
  status: string;
  priority: string;
  onStatusChange: (v: string) => void;
  onPriorityChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-4">
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[160px]">
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
      <Select value={priority} onValueChange={onPriorityChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          {PRIORITY_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
