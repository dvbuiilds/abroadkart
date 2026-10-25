"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@app/components/ui/dialog";
import { LeadForm } from "./LeadForm";

/**
 * Full-width call to action that opens the counselling form in a dialog. The
 * same form also appears in the sidebar and after the FAQ.
 */
export function LeadCtaBanner({ sourceSlug }: { sourceSlug: string }) {
  return (
    <section
      aria-labelledby="cta-heading"
      className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-10 text-white md:px-12 md:py-14"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-white/10 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 left-1/3 size-64 rounded-full bg-white/5 blur-3xl"
      />

      <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="max-w-xl">
          <h2 id="cta-heading" className="text-2xl font-bold tracking-tight md:text-3xl">
            Planning to study abroad?
          </h2>
          <p className="mt-2 text-blue-100">
            Talk to a counsellor — free, no obligation.
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600"
            >
              Talk to a counsellor
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-2xl p-0">
            <DialogHeader className="sr-only">
              <DialogTitle>Talk to a counsellor</DialogTitle>
              <DialogDescription>
                Leave your email and a counsellor will contact you.
              </DialogDescription>
            </DialogHeader>
            <div className="p-6">
              <LeadForm sourceSlug={sourceSlug} variant="plain" />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
