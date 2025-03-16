import React from "react";

// TYPES
import type { GetServerSidePropsContext } from "next";
import type { ResponseType } from "../../types/api-types";

// UTILS
import { fetchWithTimeout } from "@app/utils/fetch-utils";

// CONFIGS
import { apiEndPoints, apiPath } from "@app/config/api-config";

interface PageDataType {
  id: string;
  data: {}[];
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const pageId = context.params?.pageId;

  const response = await fetchWithTimeout(
    `${apiPath}${apiEndPoints.getBlogData}?pageId=${pageId}`
  );
  const jsonResponse: ResponseType<PageDataType> = await response.json();

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

const BlogPage = (props: { pageData: [] }) => {
  console.log("@@ props", props);
  return <div>BlogPage</div>;
};

export default BlogPage;
