import type { NextApiRequest, NextApiResponse } from "next";

// UTILS
import mongoDBClient from "../../../server/db/mongodb";

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
    const pageId = req.query.pageId;
    const response = await blogsCollection.findOne({
      pageId,
    });
    if (!response) {
      return res.status(404).json({
        success: false,
        error: { message: "Page not found." },
      });
    }
    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error fetching blog data: ", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching blog data.",
    });
  }
}
