import type { NextApiRequest, NextApiResponse } from "next";

// TYPES
import { BlogPageData } from "@app/components/BlogTemplates/Template1/types";

// UTILS
import mongoDBClient from "../../../server/db/mongodb";

const db = mongoDBClient.db();
const blogsCollection = db.collection("blogs");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: { message: "HTTP Method not allowed. " },
    });
  }

  try {
    const data: BlogPageData =
      typeof req.body === "string" ? await JSON.parse(req.body) : req.body;

    const blogInstance = await blogsCollection.findOne({
      pageId: data.pageId,
    });
    if (blogInstance) {
      return res.status(403).json({
        success: false,
        error: { message: "Blog already exists", status: 403 },
      });
    }
    const response = await blogsCollection.insertOne(data);
    if (!response.acknowledged) {
      return res.status(500).json({
        success: false,
        error: {
          message:
            "Internal Server Error. Blog could not be created at this time. please try again later.",
          status: 500,
        },
      });
    }
    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error creating the blog: ", error);
    return res.status(500).json({
      success: false,
      message: "Error creating blog.",
    });
  }
}
