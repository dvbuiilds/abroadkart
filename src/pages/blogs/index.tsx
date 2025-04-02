import { FC, useState } from "react";
import { BlogsListingLayout } from "@app/components/BlogTemplates/Template1/BlogsListingLayout";
import { BlogsAPIResponse } from "@app/components/BlogTemplates/Template1/types";
import { BlogCard } from "@app/components/BlogCard";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import { Loader } from "lucide-react";
import type { GetServerSidePropsContext } from "next";
import type { ResponseType } from "@app/types/api-types";
import { fetchWithTimeout } from "@app/utils/fetch-utils";
import { apiEndPoint, apiPath } from "@app/config/api-config";
import { BlogCategories } from "@app/components/BlogTemplates/Template1/config";

interface BlogsProps {
  title: string;
  blogs: BlogsAPIResponse["blogs"];
  paginationParams: { start: number; end: number; isLastPage: boolean };
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const category = context.query.category;
  const url =
    `${apiEndPoint}${apiPath.getAllBlogs}` +
    (typeof category === "string"
      ? `?category=${category}`
      : Array.isArray(category)
      ? category.map((cat) => `?category=${cat}`).join("")
      : "");
  const response: ResponseType<ResponseType<BlogsAPIResponse>> =
    await fetchWithTimeout(url);
  if (!response.success) {
    console.error("blogs API response not fetched. ", response.error);
    return {
      notFound: true,
    };
  }
  const jsonResponse = response.data;
  if (!jsonResponse.success) {
    console.error("blogs API response not fetched. ", jsonResponse.error);
    return {
      notFound: true,
    };
  }

  return {
    props: {
      title: "Our Blogs - One Stop for all your requirements",
      blogs: jsonResponse.data.blogs,
      paginationParams: {
        start: jsonResponse.data.start,
        end: jsonResponse.data.end,
        isLastPage: jsonResponse.data.isLastPage,
      },
    },
  };
};

const Blogs: FC<BlogsProps> = ({ title, blogs, paginationParams }) => {
  const [selectedCategories, updateSelectedCategories] = useState<
    Array<String>
  >([]);
  const [filteredBlogs, updateFilteredBlogs] =
    useState<BlogsAPIResponse["blogs"]>(blogs);
  const [updatedPaginationParams, updatePaginationParams] = useState<{
    start: number;
    end: number;
    isLastPage: boolean;
  }>(paginationParams);
  const [apiStatus, updateAPIStatus] = useState<
    "idle" | "loading" | "success" | "failure"
  >("idle");

  const handleCategoryChange = (category: string) => {
    updateSelectedCategories((prev) => {
      const isSelected = prev.includes(category);
      const updatedCategories = isSelected
        ? prev.filter((prevCategory) => prevCategory !== category)
        : [...prev, category];
      if (updatedCategories.length) {
        updateFilteredBlogs(
          blogs.filter((blog) => updatedCategories.includes(blog.category))
        );
      } else {
        updateFilteredBlogs(blogs);
      }

      return updatedCategories;
    });
  };

  const fetchMoreBlogs = async () => {
    if (updatedPaginationParams.isLastPage) {
      return;
    }
    updateAPIStatus("loading");
    const url =
      `${apiEndPoint}${apiPath.getAllBlogs}?start=${updatedPaginationParams.end}` +
      (selectedCategories.length
        ? selectedCategories.map((category) => `?category=${category}`).join("")
        : "");

    const response: ResponseType<ResponseType<BlogsAPIResponse>> =
      await fetchWithTimeout(url);
    if (!response.success) {
      alert("Could not load more stories. Please try again after sometime.");
      console.error(response.error);
      updatePaginationParams((prev) => ({ ...prev, isLastPage: true }));
      updateAPIStatus("failure");
      return;
    }
    const jsonResponse = response.data;
    if (!jsonResponse.success) {
      alert("Could not load more stories. Please try again after sometime.");
      console.error(jsonResponse.error);
      updatePaginationParams((prev) => ({ ...prev, isLastPage: true }));
      updateAPIStatus("failure");
      return;
    }
    updateFilteredBlogs(jsonResponse.data.blogs);
    updatePaginationParams({
      start: jsonResponse.data.start,
      end: jsonResponse.data.end,
      isLastPage: jsonResponse.data.isLastPage,
    });
    setTimeout(() => {
      updateAPIStatus("success");
    }, 2000);
  };

  return (
    <BlogsListingLayout
      title={title}
      LeftSideElement={
        <CategoriesListing
          selectedCategories={selectedCategories}
          handleCategoryChange={handleCategoryChange}
        />
      }
    >
      <div className="flex flex-col items-center gap-20 px-4 md:px-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {filteredBlogs.map((blog) => (
            <BlogCard
              key={blog.pageId}
              data={{
                date: blog.blogMetaData.publishedDate,
                imgUrl: blog.featuredImg.src,
                pageId: blog.pageId,
                title: blog.title,
              }}
            />
          ))}
        </div>
        {!updatedPaginationParams.isLastPage ? (
          <div className="py-4">
            <Button onClick={fetchMoreBlogs}>
              Load More Blogs
              {apiStatus === "loading" ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
            </Button>
          </div>
        ) : null}
      </div>
    </BlogsListingLayout>
  );
};

export default Blogs;

const CategoriesListing = ({
  selectedCategories,
  handleCategoryChange,
}: {
  selectedCategories: Array<String>;
  handleCategoryChange: (_: string) => void;
}) => {
  return (
    <div className="px-4 w-full md:w-[220px]">
      <h2 className="text-xl font-semibold py-2">Choose Categories</h2>
      <div className="flex flex-col gap-1">
        {BlogCategories.map((category, index) => (
          <label
            key={`${index}_${category}`}
            className="flex flex-row gap-2 cursor-pointer items-center"
          >
            <Input
              type="checkbox"
              className="w-4 h-4"
              checked={selectedCategories.includes(category)}
              onChange={() => handleCategoryChange(category)}
            />
            {category}
          </label>
        ))}
      </div>
    </div>
  );
};
