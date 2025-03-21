import { PageSectionKeysMap } from "./config";

export interface BlogPageData {
  pageId: string;
  title: string;
  category: string;
  pageData: BlogSectionType[];
}

export type BlogSectionType =
  | BreadcrumbsSection
  | HeadingSection
  //   | H1Section
  //   | H2Section
  //   | H3Section
  //   | H4Section
  | PSection
  | InfoSection
  | ImgSection
  | InterlinkingSection
  | FAQSection;

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
  datePublished: string;
}

interface ImgSection {
  sectionType: typeof PageSectionKeysMap.img;
  src: string;
  alt: string;
  imgCredit: string;
}

interface InterlinkingSection {
  sectionType: typeof PageSectionKeysMap.a;
  href: string;
  label: string;
  cta: string;
}

interface FAQSection {
  sectionType: typeof PageSectionKeysMap.faq;
  content: { q: string; a: string }[];
}
