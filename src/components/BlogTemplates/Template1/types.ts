import { PageSectionKeysMap } from "./config";

// Below is the type of the response that BE will send us.
export interface BlogMetaData {
  title: string;
  description: string;
  author: string;
  authorBio: string;
  publishedDate: string;
  lastModifiedDate: string;
  keywords: string;
}

export interface BlogResponse {
  pageId: string;
  title: string;
  category: string;
  blogMetaData: BlogMetaData;
  featuredImg: {
    src: string;
    alt: string;
    imgCredits: string;
  };
  breadcrumbs: Breadcrumbs;
  faqs: Omit<FAQSection, "sectionType">;
  pageData: BlogResponseSectionType[];
}

export type BlogResponseSectionType =
  | HeadingSection
  | PSection
  | ImgSection
  | InterlinkingSection
  | TableOfContentsSection;

// Below are the types for the data that we will use to render Blog data.
export interface BlogPageData {
  pageId: string;
  title: string;
  category: string;
  pageData: BlogSectionType[];
  metaData: BlogMetaData;
}

export type BlogSectionType =
  | BreadcrumbsSection
  | HeadingSection
  | PSection
  | InfoSection
  | ImgSection
  | InterlinkingSection
  | FAQSection
  | TableOfContentsSection;

interface BreadcrumbsSection {
  sectionType: typeof PageSectionKeysMap.breadcrumbs;
  content: Breadcrumbs;
}

export type Breadcrumbs = {
  label: string;
  link: string;
}[];

interface HeadingSection {
  sectionType:
    | typeof PageSectionKeysMap.h1
    | typeof PageSectionKeysMap.h2
    | typeof PageSectionKeysMap.h3
    | typeof PageSectionKeysMap.h4;
  id: string;
  content: string;
}

interface H1Section {
  sectionType: typeof PageSectionKeysMap.h1;
  content: string;
}

interface H2Section {
  sectionType: typeof PageSectionKeysMap.h2;
  content: string;
}

interface H3Section {
  sectionType: typeof PageSectionKeysMap.h3;
  content: string;
}

interface H4Section {
  sectionType: typeof PageSectionKeysMap.h4;
  content: string;
}

interface PSection {
  sectionType: typeof PageSectionKeysMap.p;
  content: string;
}

interface InfoSection {
  sectionType: typeof PageSectionKeysMap.info;
  authorName: string;
  authorBio: string;
  publishedDate: string;
}

interface ImgSection {
  sectionType: typeof PageSectionKeysMap.img;
  src: string;
  alt: string;
  imgCredits: string;
}

interface InterlinkingSection {
  sectionType: typeof PageSectionKeysMap.a;
  href: string;
  label: string;
  cta: string;
}

export interface FAQSection {
  sectionType: typeof PageSectionKeysMap.faq;
  title: string;
  content: { q: string; a: string }[];
}

export interface TableOfContentsNode {
  label: string;
  id: string;
  children: TableOfContentsNode[];
}

export interface TableOfContentsSection {
  sectionType: typeof PageSectionKeysMap.tableOfContents;
  title: string;
  content: TableOfContentsNode[];
}
