import React from "react";

// COMPONENTS
import { Page as BlogPageTemplate } from "@app/components/BlogTemplates/Template1/Page";

// TYPES
import type { GetServerSidePropsContext } from "next";
import type { ResponseType } from "../../types/api-types";
import type {
  BlogPageData,
  TableOfContentsNode,
} from "@app/components/BlogTemplates/Template1/types";

// UTILS
import { fetchWithTimeout } from "@app/utils/fetch-utils";

// CONFIGS
import { apiEndPoints, apiPath } from "@app/config/api-config";
import { PageSectionKeysMap } from "@app/components/BlogTemplates/Template1/config";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const pageId = context.params?.pageId;

  const response = await fetchWithTimeout(
    `${apiPath}${apiEndPoints.getBlogData}?pageId=${pageId}`
  );
  if (!response.success) {
    console.log("@@ fetch response is unsuccessful.");
    return {
      notFound: true,
    };
  }

  const jsonResponse: ResponseType<BlogPageData> = response.data;
  if (!jsonResponse.success) {
    console.error("pageData not fetched. ", jsonResponse.error);
    return {
      notFound: true,
    };
  }

  // generating BreadCrumbs
  const breadcrumbs = [
    { label: "Blogs", link: "/blogs" },
    {
      label: jsonResponse.data.category
        .split("")
        .map((char, index) => {
          if (index === 0) return char.toUpperCase();
          return char;
        })
        .join(""),
      link: encodeURI(jsonResponse.data.category),
    },
    { label: jsonResponse.data.title, link: "#" },
  ];

  const tableOfContentsData: TableOfContentsNode[] = [];
  let firstH2Index = 0;
  let firstH2IndexFound = false;

  // Simultaneously generating Table of Contents and pageData.
  const pageData: BlogPageData["pageData"] = [
    { sectionType: PageSectionKeysMap.breadcrumbs, content: breadcrumbs },
    ...jsonResponse.data.pageData.map((section, index) => {
      if (
        section.sectionType === PageSectionKeysMap.h1 ||
        section.sectionType === PageSectionKeysMap.h2 ||
        section.sectionType === PageSectionKeysMap.h3 ||
        section.sectionType === PageSectionKeysMap.h4
      ) {
        const sectionId = `#${section.content
          .split(" ")
          .map((word) => word.toLowerCase())
          .join("-")}`;
        if (section.sectionType === PageSectionKeysMap.h2) {
          tableOfContentsData.push({
            label: section.content,
            id: sectionId,
            children: [],
          });
          if (!firstH2IndexFound) {
            firstH2Index = index;
            firstH2IndexFound = true;
          }
        } else if (section.sectionType === PageSectionKeysMap.h3) {
          tableOfContentsData[tableOfContentsData.length - 1].children.push({
            label: section.content,
            id: sectionId,
            children: [],
          });
        } else if (section.sectionType === PageSectionKeysMap.h4) {
          tableOfContentsData[tableOfContentsData.length - 1].children[
            tableOfContentsData[tableOfContentsData.length - 1].children
              .length - 1
          ].children.push({
            label: section.content,
            id: sectionId,
            children: [],
          });
        }
        return { ...section, id: sectionId };
      }
      return section;
    }),
  ];

  pageData.splice(firstH2Index + 1, 0, {
    sectionType: PageSectionKeysMap.tableOfContents,
    title: "Table of Contents",
    content: tableOfContentsData,
  });

  return {
    props: {
      pageData: {
        ...jsonResponse.data,
        pageData,
      },
    },
  };
};

const BlogPage = (props: { pageData: BlogPageData }) => {
  return <BlogPageTemplate data={props.pageData} />;
};

export default BlogPage;
