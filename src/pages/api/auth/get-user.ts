import { NextApiRequest, NextApiResponse } from "next";
import mongoDBClient from "../../../server/db/mongodb"; // Import MongoDB client
import { ResponseType, User } from "@app/types/api-types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType<User | null>>
) {
  // Allow only POST requests
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: { message: "Method Not Allowed.", status: 405 },
    });
  }

  // Extract email and password from the request body
  const { email } = req.query;

  // Validate input fields
  if (!email) {
    return res.status(400).json({
      success: false,
      error: { message: "Email is required.", status: 400 },
    });
  }
  try {
    // Get the database instance
    const db = mongoDBClient.db();

    // Find the user by email
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: "User not found.", status: 404 },
      });
    }

    // If successful, return the user's details (excluding sensitive information)
    return res.status(200).json({
      success: true,
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        provider: user.provider,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({
      success: false,
      error: {
        message: "Internal Server Error. Please try again later.",
        status: 500,
      },
    });
  }
}
