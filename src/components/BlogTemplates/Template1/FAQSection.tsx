import React from "react";
import { FAQSection as FAQSectionNode } from "./types";

export const FAQSection = (props: { data: FAQSectionNode }) => {
  return (
    <section className="px-3">
      <h2 className="text-2xl py-2 font-bold">{props.data.title}</h2>
      <div className="">
        {props.data.content.map(({ q, a }, index) => (
          <div key={index} className="py-2">
            <h3 className="font-semibold">{q}</h3>
            <p>{a}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
