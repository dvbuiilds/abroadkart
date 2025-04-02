import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { BlogPageData, BlogSectionType } from "./types";
import { FAQSection } from "./FAQSection";
import { PageSectionKeysMap } from "./config";

const renderSection = (section: BlogSectionType) => {
  switch (section.sectionType) {
    case PageSectionKeysMap.h2: {
      return (
        <h2
          className="text-xl font-medium py-2 md:font-semibold md:text-2xl"
          id={section.id}
        >
          {section.content}
        </h2>
      );
    }
    case PageSectionKeysMap.h3: {
      return <h3 id={section.id}>{section.content}</h3>;
    }
    case PageSectionKeysMap.h4: {
      return <h4 id={section.id}>{section.content}</h4>;
    }
    case PageSectionKeysMap.p: {
      return <p className="text-justify">{section.content}</p>;
    }
    case PageSectionKeysMap.img: {
      return (
        <div className="flex flex-col items-center justify-center gap-1">
          <Image
            src={section.src}
            alt={section.alt}
            width={1000}
            height={600}
            priority
          />
          {section.imgCredits ? (
            <p className="text-center italic">{section.imgCredits}</p>
          ) : null}
        </div>
      );
    }
    case PageSectionKeysMap.a: {
      return (
        <Link href={section.href}>
          <div className="border-l-2 border-black rounded-sm pl-2">
            {`${section.label}: ${section.cta}`}
          </div>
        </Link>
      );
    }
    case PageSectionKeysMap.faq: {
      return <FAQSection data={section} />;
    }
    default: {
      return null;
    }
  }
};

export const Page = (props: { data: BlogPageData }) => {
  return (
    <div>
      {props.data.pageData.map((section, index) => (
        <div key={`section-${section.sectionType}_${index}`} className="py-1">
          {renderSection(section)}
        </div>
      ))}
    </div>
  );
};
