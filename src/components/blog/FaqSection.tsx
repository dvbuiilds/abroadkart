import { Plus } from "lucide-react";
import type { Faq } from "@app/lib/blog/types";

/**
 * FAQ list built from native <details>. Browsers render closed panels' text
 * to crawlers, and the answers are in the first HTML response. Radix Accordion
 * unmounts closed panels, so it is not used here.
 */
export function FaqSection({ faqs }: { faqs: Faq[] }) {
  if (faqs.length === 0) return null;

  return (
    <section aria-labelledby="faq" className="mt-16 border-t border-gray-100 pt-12">
      <h2
        id="faq"
        className="scroll-mt-24 text-[1.625rem] font-bold tracking-tight text-gray-900 md:text-3xl"
      >
        Frequently Asked Questions
      </h2>

      <div className="mt-6 space-y-3">
        {faqs.map((faq) => (
          <details
            key={faq.order}
            className="faq-item group rounded-xl border border-gray-200 bg-white open:shadow-sm"
          >
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-xl px-5 py-4 text-base font-semibold leading-snug text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 [&::-webkit-details-marker]:hidden">
              {faq.question}
              <Plus
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-blue-600 transition-transform duration-200 group-open:rotate-45"
              />
            </summary>
            <div className="px-5 pb-5 leading-relaxed text-gray-700">{faq.answer}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
