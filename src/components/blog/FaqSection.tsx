import { createElement } from "react";
import parse, {
  domToReact,
  type DOMNode,
  type Element,
  type HTMLReactParserOptions,
} from "html-react-parser";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import type { Faq } from "@app/lib/blog/types";
import { classifyHref } from "@app/lib/blog/links";

/** Formatting that survives from the stored answer. Everything else is unwrapped. */
const KEPT_TAGS = new Set(["p", "strong", "b", "em", "i", "ul", "ol", "li"]);

/**
 * Answers are stored as HTML fragments with leftover editor wrappers and
 * classes. Keep the paragraphs, lists, emphasis and links; drop attributes,
 * wrappers, scripts and styles. The visible text is unchanged.
 */
const answerOptions: HTMLReactParserOptions = {
  replace(node: DOMNode) {
    if (node.type !== "tag") return undefined;
    const element = node as Element;
    const { name, attribs } = element;
    const children = () => domToReact(element.children as DOMNode[], answerOptions);

    if (name === "script" || name === "style") return null;
    if (name === "br") return <br />;

    if (name === "a") {
      const link = classifyHref(attribs.href);
      switch (link.kind) {
        case "internal":
          return <Link href={link.href}>{children()}</Link>;
        case "anchor":
          return <a href={link.href}>{children()}</a>;
        case "external":
          return (
            <a href={link.href} target="_blank" rel="noopener noreferrer">
              {children()}
              <ArrowUpRight aria-hidden="true" className="ml-0.5 inline size-3.5 align-[-0.1em]" />
            </a>
          );
        case "none":
          return <>{children()}</>;
      }
    }

    if (KEPT_TAGS.has(name)) return createElement(name, null, children());
    return <>{children()}</>;
  },
};

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
            <div className="space-y-3 px-5 pb-5 leading-relaxed text-gray-700 [&_a]:font-medium [&_a]:text-blue-700 [&_a]:underline [&_a]:underline-offset-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5">
              {parse(faq.answer, answerOptions)}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
