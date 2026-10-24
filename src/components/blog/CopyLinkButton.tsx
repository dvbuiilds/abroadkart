"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { toast } from "sonner";

/** Copies the post's canonical URL. Shows a check mark and a toast for two seconds. */
export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      toast.error("Could not copy the link. Please copy it from the address bar.");
      return;
    }
    setCopied(true);
    toast.success("Link copied");
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Link copied" : "Copy link"}
      className="inline-flex size-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
    >
      {copied ? (
        <Check aria-hidden="true" className="size-4 text-emerald-600" />
      ) : (
        <Link2 aria-hidden="true" className="size-4" />
      )}
    </button>
  );
}
