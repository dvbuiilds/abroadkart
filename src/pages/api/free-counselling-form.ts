import { NextApiRequest, NextApiResponse } from "next";

// UTILS
import mongoDBClient from "../../server/db/mongodb"; // Import the MongoClient instance

const db = mongoDBClient.db();
const collection = db.collection("free-counselling-form");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    {
      return res.status(405).json({
        success: false,
        error: {
          message: "Method not allowed.",
          status: 405,
        },
      });
    }
  }
  const {
    email,
    whatsappNumber,
    targetCountry,
    targetUniversity,
    targetCourse,
    targetYear,
    message,
  } = req.body;

  // Validation checks
  if (!email || !/^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid or missing email.", status: 400 },
    });
  }

  if (!whatsappNumber || !/^\d{10,15}$/.test(whatsappNumber)) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Invalid or missing WhatsApp number.",
        status: 400,
      },
    });
  }

  if (!targetCountry || typeof targetCountry !== "string") {
    return res.status(400).json({
      success: false,
      error: { message: "Target country is required.", status: 400 },
    });
  }

  if (targetUniversity && typeof targetUniversity !== "string") {
    return res.status(400).json({
      success: false,
      error: {
        message: "Target university must be a valid string.",
        status: 400,
      },
    });
  }

  if (!targetCourse || typeof targetCourse !== "string") {
    return res.status(400).json({
      success: false,
      error: { message: "Target course is required.", status: 400 },
    });
  }

  const currentYear = new Date().getFullYear();
  if (
    !targetYear ||
    isNaN(targetYear) ||
    targetYear < currentYear ||
    targetYear > currentYear + 10
  ) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid target year.", status: 400 },
    });
  }

  if (message && typeof message !== "string") {
    return res.status(400).json({
      success: false,
      error: { message: "Message must be a valid string.", status: 400 },
    });
  }

  try {
    const formInstance = await collection.findOne({
      $or: [{ email }, { whatsappNumber }],
    });
    if (formInstance) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Form already submitted.",
          status: 400,
        },
      });
    }
    const dbResponse = await collection.insertOne({
      ...req.body,
      timestamp: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      }),
    });
    if (!dbResponse) {
      return res.status(500).json({
        success: false,
        error: {
          message: "Error in connecting with DB, form data could not be saved.",
          status: 500,
        },
      });
    }
    return res.status(200).json({ success: true, data: dbResponse });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        message: String(error),
        status: 500,
      },
    });
  }
}
