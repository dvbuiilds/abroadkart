import type { NextApiRequest, NextApiResponse } from "next";

// UTILS
import mongoDBClient from "../../../server/db/mongodb";

const db = mongoDBClient.db();
const blogsCollection = db.collection("blogs");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const order = req.query.order ?? "desc";
    const sortParam = order === "desc" ? -1 : 1;
    if (req.method !== "GET") {
      return res.status(405).json({
        success: false,
        error: { message: "HTTP Method not allowed. ", status: 405 },
      });
    }
    const response = await blogsCollection.find().sort(sortParam).toArray();
    if (!response) {
      return res.status(404).json({
        success: false,
        error: { message: "Pages Not Found.", status: 404 },
      });
    }
    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error fetching blogs data: ", error);
    return res.status(500).json({
      success: false,
      error: { message: "Error Fetching the Blogs data.", status: 500 },
    });
  }
}
