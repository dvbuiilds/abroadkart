import { Button } from "@app/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 10;

export function StudentPagination({
  total,
  skip,
  onPageChange,
}: {
  total: number;
  skip: number;
  onPageChange: (skip: number) => void;
}) {
  const page = Math.floor(skip / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="flex items-center justify-between px-2 py-2">
      <p className="text-sm text-muted-foreground">
        Showing {skip + 1}–{Math.min(skip + PAGE_SIZE, total)} of {total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(0, skip - PAGE_SIZE))}
          disabled={!hasPrev}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <span className="text-sm">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(skip + PAGE_SIZE)}
          disabled={!hasNext}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
