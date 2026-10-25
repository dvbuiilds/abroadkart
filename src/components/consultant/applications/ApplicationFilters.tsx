import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "underReview", label: "Under Review" },
  { value: "waitlisted", label: "Waitlisted" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

export function ApplicationFilters({
  status,
  onStatusChange,
}: {
  status: string;
  onStatusChange: (v: string) => void;
}) {
  return (
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
  );
}
