import type { NextApiRequest, NextApiResponse } from "next";

// THIRD PARTY
import bcrypt from "bcryptjs"; // For password comparison
import { v4 as uuidv4 } from "uuid"; // For generating session IDs

// TYPES
import type { User, ResponseType } from "../../../types/api-types";

// UTILS
import mongoDBClient from "../../../server/db/mongodb"; // Import MongoDB client

const environment = process.env.ENVIRONMENT ?? "development";
const EXPIRY_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const responseHeaderCookieValue =
  environment === "development"
    ? "HttpOnly; SameSite=Strict; Path=/"
    : "HttpOnly; Secure; SameSite=Strict; Path=/";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType<User>>
) {
  // Allow only POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: { message: "Method Not Allowed.", status: 405 },
    });
  }

  // Extract email and password from the request body
  const { email, password } = req.body;

  // Validate input fields
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: { message: "Email and password are required.", status: 400 },
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

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: { message: "Invalid credentials.", status: 401 },
      });
    }

    // Create a new session
    const sessionId = uuidv4();
    await db.collection("sessions").insertOne({
      sessionId,
      userId: user._id,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + EXPIRY_DURATION),
    });

    // Set HttpOnly cookie with the session ID
    res.setHeader(
      "Set-Cookie",
      `sessionID=${sessionId}; ${responseHeaderCookieValue}`
    );

    // If successful, return the user's details (excluding sensitive information)
    return res.status(200).json({
      success: true,
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
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
