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

  return {
    props: {
      pageData: jsonResponse.data,
    },
  };
};

const BlogPage = (props: { pageData: BlogPageData }) => {
  return <BlogPageTemplate data={props.pageData} />;
};

export default BlogPage;
