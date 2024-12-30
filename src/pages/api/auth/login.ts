import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs"; // For password comparison
import mongoDBClient from "../../../server/db/mongodb"; // Import MongoDB client

type ResponseData = {
  message?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Allow only POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Extract email and password from the request body
  const { email, password } = req.body;

  // Validate input fields
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    // Get the database instance
    const db = mongoDBClient.db();

    // Find the user by email
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // If successful, return the user's details (excluding sensitive information)
    return res.status(200).json({
      message: "Login successful.",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({
      error: "Internal Server Error. Please try again later.",
    });
  }
}
