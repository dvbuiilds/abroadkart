import { Button } from "@app/components/ui/button";
import { Download } from "lucide-react";

export function DownloadCsvButton({
  onClick,
  isLoading = false,
  label = "Download CSV",
}: {
  onClick: () => void;
  isLoading?: boolean;
  label?: string;
}) {
  return (
    <Button variant="outline" onClick={onClick} disabled={isLoading}>
      <Download className="mr-2 h-4 w-4" />
      {isLoading ? "Preparing CSV..." : label}
    </Button>
  );
}
