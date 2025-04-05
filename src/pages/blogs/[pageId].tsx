// COMPONENTS
import { Page as BlogPageTemplate } from "@app/components/BlogTemplates/Template1/Page";

// TYPES
import type { GetServerSidePropsContext } from "next";
import type { ResponseType } from "../../types/api-types";
import type {
  BlogPageData,
  BlogResponse,
  BlogsAPIResponse,
  BlogSectionType,
} from "@app/components/BlogTemplates/Template1/types";
import { BlogLayout } from "@app/components/BlogTemplates/Template1/BlogLayout";

// UTILS
import { fetchWithTimeout } from "@app/utils/fetch-utils";

// CONFIGS
import { apiEndPoint, apiPath } from "@app/config/api-config";
import { PageSectionKeysMap } from "@app/components/BlogTemplates/Template1/config";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const pageId = context.params?.pageId;

  const response = await fetchWithTimeout(
    `${apiEndPoint}${apiPath.getBlogData}?pageId=${pageId}`
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
      sectionType: PageSectionKeysMap.img,
      src: jsonResponse.data.featuredImg.src,
      alt: jsonResponse.data.featuredImg.alt,
      imgCredits: jsonResponse.data.featuredImg.imgCredits,
    },
    ...jsonResponse.data.pageData,
    { sectionType: PageSectionKeysMap.faq, ...jsonResponse.data.faqs },
  ];

  const relatedBlogsResponse = await fetchWithTimeout(
    `${apiEndPoint}${apiPath.getAllBlogs}?category=${jsonResponse.data.category}`
  );
  if (relatedBlogsResponse.success) {
    const relatedBlogsJsonResponse: ResponseType<BlogsAPIResponse> =
      relatedBlogsResponse.data;
    if (relatedBlogsJsonResponse.success) {
      const relatedBlogs = relatedBlogsJsonResponse.data.blogs.filter(
        (blog) => blog.pageId !== jsonResponse.data.pageId
      );
      if (relatedBlogs.length) {
        pageData.push({
          sectionType: PageSectionKeysMap.relatedBlogs,
          title: "Related Blogs",
          blogs: relatedBlogs,
        });
      } else {
        console.error("@@ Related Blogs API Error: No related blogs found.");
      }
    } else {
      console.error(
        "@@ Related Blogs Data Error: ",
        relatedBlogsJsonResponse.error
      );
    }
  } else {
    console.error("@@ Related Blogs API Error: ", relatedBlogsResponse.error);
  }

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
          seoSchema: JSON.stringify(seoSchema),
        },
      },
    },
  };
};

const BlogPage = (props: { pageData: BlogPageData }) => {
  return (
    <BlogLayout
      breadcrumbs={props.pageData.breadcrumbs}
      title={props.pageData.title}
      authorInfo={{
        sectionType: PageSectionKeysMap.info,
        authorName: props.pageData.metaData.author,
        authorBio: props.pageData.metaData.authorBio,
        publishedDate: props.pageData.metaData.publishedDate,
        lastModifiedDate: props.pageData.metaData.lastModifiedDate,
      }}
      tableOfContents={props.pageData.tableOfContents}
    >
      <BlogPageTemplate data={props.pageData} />
    </BlogLayout>
  );
};

export default BlogPage;
