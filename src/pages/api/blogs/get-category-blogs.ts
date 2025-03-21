import type { NextApiRequest, NextApiResponse } from "next";

// UTILS
import mongoDBClient from "../../../server/db/mongodb";
import {
  BlogPageData,
  BlogSectionType,
} from "@app/components/BlogTemplates/Template1/types";

const db = mongoDBClient.db();
const blogsCollection = db.collection("blogs");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: { message: "HTTP Method not allowed. " },
    });
  }
  try {
    const { category } = req.query;

    if (!category || typeof category !== "string") {
      return res.status(400).json({ message: "Category is required" });
    }

    const blogs = await blogsCollection
      .find({ category }) // Filter by category
      .sort({ createdAt: -1 }) // Sort by createdAt field in descending order (newest first)
      .toArray();

    if (!blogs) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Blogs not found with given category: ${category}`,
          status: 404,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: blogs.map((blogData) => ({
        pageId: blogData.pageId,
        title: blogData.title,
        featuredImg:
          blogData.pageData.filter(
            (blog: BlogSectionType) => blog.sectionType === "img"
          )?.src || "", // featuredImg to be added later.
      })),
    });
  } catch (error) {
    console.error("Error fetching category blogs:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
