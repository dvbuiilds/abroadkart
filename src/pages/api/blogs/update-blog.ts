import type { NextApiRequest, NextApiResponse } from "next";

// TYPES
import { BlogResponse } from "@app/components/BlogTemplates/Template1/types";

// UTILS
import mongoDBClient from "../../../server/db/mongodb";

const db = mongoDBClient.db();
const blogsCollection = db.collection("blogs");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).json({
      success: false,
      error: { message: "HTTP Method not allowed. ", status: 405 },
    });
  }

  try {
    const data: BlogResponse =
      typeof req.body === "string" ? await JSON.parse(req.body) : req.body;

    // Validation: Check if required fields are present
    if (!data.pageId || !data.title || !data.category || !data.pageData) {
      return res.status(400).json({
        success: false,
        error: { message: "Missing required fields", status: 400 },
      });
    }

    // Setting lastModifiedDate to current date.
    data.blogMetaData.lastModifiedDate = new Date().toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      }
    );

    // Find and update the blog entry in the database
    const updatedBlog = await blogsCollection.findOneAndUpdate(
      { pageId: data.pageId }, // Find blog by pageId
      { $set: { ...data } }, // Update fields
      { returnDocument: "after" }
    );

    if (!updatedBlog) {
      return res.status(404).json({
        success: false,
        error: { message: "Blog not found!", status: 404 },
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedBlog,
    });
  } catch (error) {
    console.error("Error updating the blog: ", error);
    return res.status(500).json({
      success: false,
      error: { message: "Error updating blog.", status: 500 },
    });
  }
}
