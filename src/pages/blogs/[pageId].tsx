import React from "react";

// COMPONENTS
import { Page as BlogPageTemplate } from "@app/components/BlogTemplates/Template1/Page";

// TYPES
import type { GetServerSidePropsContext } from "next";
import type { ResponseType } from "../../types/api-types";
import type {
  BlogPageData,
  BlogResponse,
  BlogSectionType,
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

  const jsonResponse: ResponseType<BlogResponse> = response.data;
  if (!jsonResponse.success) {
    console.error("pageData not fetched. ", jsonResponse.error);
    return {
      notFound: true,
    };
  }

  const pageData: BlogSectionType[] = [
    {
      sectionType: PageSectionKeysMap.breadcrumbs,
      content: jsonResponse.data.breadcrumbs,
    },
    {
      sectionType: PageSectionKeysMap.h1,
      id: jsonResponse.data.pageId,
      content: jsonResponse.data.title,
    },
    {
      sectionType: PageSectionKeysMap.info,
      authorName: jsonResponse.data.blogMetaData.author,
      authorBio: jsonResponse.data.blogMetaData.authorBio,
      publishedDate: jsonResponse.data.blogMetaData.publishedDate,
    },
    {
      sectionType: PageSectionKeysMap.img,
      src: jsonResponse.data.featuredImg.src,
      alt: jsonResponse.data.featuredImg.alt,
      imgCredits: jsonResponse.data.featuredImg.imgCredits,
    },
    ...jsonResponse.data.pageData,
    { sectionType: PageSectionKeysMap.faq, ...jsonResponse.data.faqs },
  ];

  const seoSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: jsonResponse.data.blogMetaData.title,
        description: jsonResponse.data.blogMetaData.description,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://abroadkart.com/blogs/${jsonResponse.data.pageId}`,
        },
        author: {
          "@type": "Person",
          name: jsonResponse.data.blogMetaData.author,
          url: "https://abroadkart.com",
        },
        publisher: {
          "@type": "Organization",
          name: "AbroadKart",
          logo: {
            "@type": "ImageObject",
            url: "https://abroadkart.com/logo.png",
          },
        },
        datePublished: jsonResponse.data.blogMetaData.publishedDate,
        dateModified: jsonResponse.data.blogMetaData.lastModifiedDate,
        image: {
          "@type": "ImageObject",
          url: jsonResponse.data.featuredImg.src,
          width: 1000,
          height: 600,
        },
        url: `https://abroadkart.com/blogs/${jsonResponse.data.pageId}`,
        articleSection: jsonResponse.data.category,
        keywords: jsonResponse.data.blogMetaData.keywords,
        wordCount: 1000,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: jsonResponse.data.breadcrumbs.map(
          (breadcrumbs, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: breadcrumbs.label,
            item: breadcrumbs.link,
          })
        ),
      },
      {
        "@type": "FAQPage",
        mainEntity: jsonResponse.data.faqs.content.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.a,
          },
        })),
      },
    ],
  };

  return {
    props: {
      pageData: {
        ...jsonResponse.data,
        pageData,
        metaData: {
          ...jsonResponse.data.blogMetaData,
          seoSchema,
        },
      },
    },
  };
};

const BlogPage = (props: { pageData: BlogPageData }) => {
  return <BlogPageTemplate data={props.pageData} />;
};

export default BlogPage;
