import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs"; // For password hashing
import mongoDBClient from "../../../server/db/mongodb"; // Import the MongoClient instance

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

  // Extract data from the request body
  const { name, email, password, phoneNumber } = req.body;

  // Validate the request body
  if (!name || !email || !password || !phoneNumber) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Validate name (only alphabets and spaces)
  const nameRegex = /^[A-Za-z\s]+$/;
  if (!nameRegex.test(name)) {
    return res.status(400).json({
      error: "Name can only contain alphabets and spaces.",
    });
  }

  // Validate email format (must contain '@' and '.' with characters in between)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error:
        "Invalid email format. Email must contain '@' and '.' with characters in between.",
    });
  }

  // Validate phone number (only digits, +, -, and at least length of 10)
  const phoneRegex = /^[\d+\-]+$/; // Only digits, '+', and '-'
  if (!phoneRegex.test(phoneNumber) || phoneNumber.length < 10) {
    return res.status(400).json({
      error:
        "Phone number can only contain digits, '+', '-', and must be at least 10 characters long.",
    });
  }

  // Validate password strength (minimum length of 6 characters)
  if (password.length < 6) {
    return res.status(400).json({
      error: "Password must be at least 6 characters long.",
    });
  }

  try {
    // Get the database instance
    const db = mongoDBClient.db(); // Use the default database specified in the URI

    // Check if a user with the same email or phone number already exists
    const existingUser = await db.collection("users").findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (existingUser) {
      return res.status(400).json({
        error: "A user with this email or phone number already exists.",
      });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword, // Store the hashed password
      phoneNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Return success response
    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.insertedId.toString(),
        name,
        email,
        phoneNumber,
      },
    });
  } catch (error) {
    console.error("Error during signup:", error);
    return res.status(500).json({
      error: "Internal Server Error. Please try again later.",
    });
  }
}
