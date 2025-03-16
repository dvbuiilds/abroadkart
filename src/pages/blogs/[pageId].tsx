import React from "react";

import Link from "next/link";
import Image from "next/image";

// ICONS
import { BsDot } from "react-icons/bs";

// TYPES
import type { GetServerSidePropsContext } from "next";
import type { ResponseType } from "../../types/api-types";

// UTILS
import { fetchWithTimeout } from "@app/utils/fetch-utils";

// CONFIGS
import { apiEndPoints, apiPath } from "@app/config/api-config";

const PageSectionKeysMap = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  p: "p",
  img: "img",
  a: "a",
} as const;

type PageSectionKeys = keyof typeof PageSectionKeysMap;

interface PageDataType {
  pageId: string;
  data: Record<PageSectionKeys, string>[];
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

const renderSection = (
  section: Record<PageSectionKeys, string>,
  index: number
) => {
  const key = Object.keys(section)[0];
  const content = section[key as PageSectionKeys];

  switch (key) {
    case PageSectionKeysMap.h1: {
      return (
        <h1
          className="text-2xl font-semibold py-3 md:font-bold md:text-3xl"
          key={`h1-${index}`}
        >
          {content}
        </h1>
      );
    }
    case PageSectionKeysMap.h2: {
      return (
        <h2
          className="text-xl font-medium py-2 md:font-semibold md:text-2xl"
          key={`h2-${index}`}
        >
          {content}
        </h2>
      );
    }
    case PageSectionKeysMap.h3: {
      return (
        <h3 className="" key={`h3-${index}`}>
          {content}
        </h3>
      );
    }
    case PageSectionKeysMap.h4: {
      return (
        <h4 className="" key={`h4-${index}`}>
          {content}
        </h4>
      );
    }
    case PageSectionKeysMap.p: {
      return (
        <p className="text-justify" key={`p-${index}`}>
          {content}
        </p>
      );
    }
    case PageSectionKeysMap.img: {
      return (
        <Image className="" key={`img-${index}`} src={content} alt="Alt Text" />
      );
    }
    // case PageSectionKeysMap.a: {
    //   return <
    // }
    default: {
      return <></>;
    }
  }
};

const BlogPage = (props: { pageData: PageDataType }) => {
  return (
    <div className="px-2 py-2 md:px-32 lg:px-48">
      <div className="flex flex-row items-center justify-center ">
        <Link href="/blogs" className="text-decoration-none">
          Blogs
        </Link>
        <BsDot size={32} />
        <p>{"Title of the Page"}</p>
      </div>
      {props.pageData.data.map(renderSection)}
    </div>
  );
};

export default BlogPage;
