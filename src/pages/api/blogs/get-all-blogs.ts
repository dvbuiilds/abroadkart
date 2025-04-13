import type { NextApiRequest, NextApiResponse } from "next";

// UTILS
import mongoDBClient from "../../../server/db/mongodb";

const PAGE_SIZE = 9;
const db = mongoDBClient.db();
const blogsCollection = db.collection("blogs");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Extract query params
    const { start = "0", end, category } = req.query;
    const startIndex = parseInt(start as string, 10) || 0;
    const endIndex = parseInt(end as string, 10) || undefined;

    // Build query filter
    const filter: any = {};

    if (category) {
      const categories = Array.isArray(category) ? category : [category];
      filter.category = { $in: categories };
    }

    // Fetch blogs from MongoDB
    const blogs = await blogsCollection
      .find(filter)
      .sort({ publishedAt: -1 }) // Descending order
      .skip(startIndex)
      .limit(endIndex ? endIndex - startIndex : PAGE_SIZE)
      .toArray();

    if (!blogs || !blogs?.length) {
      return res.status(404).json({
        success: false,
        error: { message: "Pages Not Found.", status: 404 },
      });
    }

    // Get total blog count for pagination logic
    const totalBlogs = await blogsCollection.countDocuments(filter);
    const isLastPage = startIndex + PAGE_SIZE >= totalBlogs;

    return res.status(200).json({
      success: true,
      data: {
        start: startIndex,
        end: startIndex + blogs.length - 1,
        isLastPage,
        blogs: blogs.map((blog) => ({
          pageId: blog.pageId,
          title: blog.title,
          category: blog.category,
          blogMetaData: blog.blogMetaData,
          featuredImg: blog.featuredImg,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching blogs data: ", error);
    return res.status(500).json({
      success: false,
      error: { message: "Error Fetching the Blogs data.", status: 500 },
    });
  }
}
