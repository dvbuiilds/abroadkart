import React from "react";

// COMPONENTS
import { Page as BlogPageTemplate } from "@app/components/BlogTemplates/Template1/Page";

// TYPES
import type { GetServerSidePropsContext } from "next";
import type { ResponseType } from "../../types/api-types";
import type { BlogPageData } from "@app/components/BlogTemplates/Template1/types";

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

  const pageData: BlogPageData["pageData"] = [
    { sectionType: PageSectionKeysMap.breadcrumbs, content: breadcrumbs },
    ...jsonResponse.data.pageData,
  ];

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
