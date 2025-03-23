import React from "react";
import { Breadcrumbs, InfoSection, TableOfContentsSection } from "./types";
import { BreadcrumbsSection } from "./BreadcrumbsSection";
import { BlogInfo } from "./BlogInfo";
import { Form } from "./Form";
import { TableOfContents } from "./TableOfContent";

interface BlogLayoutProps {
  authorInfo: InfoSection;
  breadcrumbs?: Breadcrumbs;
  children: React.ReactNode;
  tableOfContents?: TableOfContentsSection;
  title: string;
}

export const BlogLayout: React.FC<BlogLayoutProps> = ({
  authorInfo,
  title,
  breadcrumbs,
  children,
  tableOfContents,
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-2">
      {breadcrumbs ? <BreadcrumbsSection data={breadcrumbs} /> : null}
      <h1 className="text-2xl font-semibold py-3 px-3 md:font-bold md:text-3xl">
        {title}
      </h1>
      <div className="flex flex-col md:flex-row w-full max-w-[1280px] mx-auto px-4 lg:px-8 gap-4">
        {/* Left - Table of Contents */}
        <aside className="w-full md:w-[220px] lg:w-[250px] flex-shrink-0">
          <div className="sticky top-10">
            {authorInfo ? <BlogInfo data={authorInfo} /> : null}
            {tableOfContents ? (
              <TableOfContents data={tableOfContents} />
            ) : null}
          </div>
        </aside>

        {/* Center - Blog Content */}
        <main className="flex-1 min-w-0">{children}</main>

        {/* Right - Form */}
        <aside className="w-full md:w-[280px] flex-shrink-0">
          <div className="sticky top-10">
            <Form />
          </div>
        </aside>
      </div>
    </div>
  );
};
