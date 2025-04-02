import React from "react";
import { FAQSection as FAQSectionNode } from "./types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@app/components/ui/accordion";

export const FAQSection = (props: { data: FAQSectionNode }) => {
  return (
    <section>
      <h2 className="text-2xl py-2 font-bold">{props.data.title}</h2>
      <Accordion type="single" collapsible className="w-full">
        {props.data.content.map(({ q, a }, index) => (
          <AccordionItem
            key={`faq_${index}`}
            value={`item-${index}`}
            className="bg-white my-4 rounded-lg shadow-sm border border-gray-100 overflow-hidden"
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50 transition-colors">
              <span className="text-left font-medium text-lg">{q}</span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 pt-2">
              <p className="text-gray-600">{a}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};
