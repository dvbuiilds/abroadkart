import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaUsersLine } from "react-icons/fa6";
import type { BlogPageData, BlogSectionType } from "./types";
import { PageSectionKeysMap } from "./config";
import { BreadcrumbsSection } from "./BreadcrumbsSection";

const renderSection = (section: BlogSectionType) => {
  switch (section.sectionType) {
    case PageSectionKeysMap.breadcrumbs: {
      return <BreadcrumbsSection data={section.content} />;
    }
    case PageSectionKeysMap.h1: {
      return (
        <h1 className="text-2xl font-semibold py-3 md:font-bold md:text-3xl">
          {section.content}
        </h1>
      );
    }
    case PageSectionKeysMap.h2: {
      return (
        <h2 className="text-xl font-medium py-2 md:font-semibold md:text-2xl">
          {section.content}
        </h2>
      );
    }
    case PageSectionKeysMap.h3: {
      return <h3 className="">{section.content}</h3>;
    }
    case PageSectionKeysMap.h4: {
      return <h4 className="">{section.content}</h4>;
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
          <p className="text-center">{section.imgCredit}</p>
        </div>
      );
    }
    case PageSectionKeysMap.a: {
      return (
        <Link href={section.href}>{`${section.label}: ${section.cta}`}</Link>
      );
    }
    case PageSectionKeysMap.info: {
      return (
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center justify-center gap-3">
            <FaUsersLine size={42} />
            <div className="flex flex-col justify-center">
              <p className="text-sm font-semibold">{section.authorName}</p>
              <p className="text-xs">{section.authorBio}</p>
            </div>
          </div>
          <p className="italic">{section.datePublished}</p>
        </div>
      );
    }
    default: {
      return null;
    }
  }
};

export const Page = (props: { data: BlogPageData }) => {
  return (
    <div className="px-2 py-2 md:px-32 lg:px-48">
      {props.data.pageData.map((section, index) => (
        <div key={`section-${section.sectionType}_${index}`} className="py-1">
          {renderSection(section)}
        </div>
      ))}
    </div>
  );
};
