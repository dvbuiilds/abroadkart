import type { NextApiRequest, NextApiResponse } from "next";

// THIRD PARTY
import bcrypt from "bcryptjs"; // For password hashing

// TYPES
import type { User, ResponseType } from "../../../types/api-types";

// UTILS
import mongoDBClient from "../../../server/db/mongodb"; // Import the MongoClient instance
import { getNameAbbreviation } from "@app/utils/name-abbreviation";

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

  // Extract data from the request body by parsing the string. This is required because the body is a string. This is done because the headers are set to application/json and textual json is expected at the server side.
  const { name, email, password, phoneNumber } = await JSON.parse(req.body);

  // Validate the request body
  if (!name || !email || !password || !phoneNumber) {
    return res.status(400).json({
      success: false,
      error: { message: "All fields are required.", status: 400 },
    });
  }

  // Validate name (only alphabets and spaces)
  const nameRegex = /^[A-Za-z\s]+$/;
  if (!nameRegex.test(name)) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Name can only contain alphabets and spaces.",
        status: 400,
      },
    });
  }

  // Validate email format (must contain '@' and '.' with characters in between)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: {
        message:
          "Invalid email format. Email must contain '@' and '.' with characters in between.",
        status: 400,
      },
    });
  }

  // Validate phone number (only digits, +, -, and at least length of 10)
  const phoneRegex = /^[\d+\-]+$/; // Only digits, '+', and '-'
  if (!phoneRegex.test(phoneNumber) || phoneNumber.length < 10) {
    return res.status(400).json({
      success: false,
      error: {
        message:
          "Phone number can only contain digits, '+', '-', and must be at least 10 characters long.",
        status: 400,
      },
    });
  }

  // Validate password strength (minimum length of 6 characters)
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Password must be at least 6 characters long.",
        status: 400,
      },
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
        success: false,
        error: {
          message: "A user with this email or phone number already exists.",
          status: 400,
        },
      });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    const nameAbbreviation = getNameAbbreviation(name);

    // Create a new user
    const newUser = await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword, // Store the hashed password
      phoneNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
      provider: "credentials",
      haveFilledPreCounsellingForm: false,
      nameAbbreviation,
    });

    // Return success response
    return res.status(201).json({
      success: true,
      data: {
        id: newUser.insertedId.toString(),
        name,
        email,
        phoneNumber,
        provider: "credentials",
        haveFilledPreCounsellingForm: false,
        nameAbbreviation,
      },
    });
  } catch (error) {
    console.error("Error during signup:", error);
    return res.status(500).json({
      success: false,
      error: {
        message: "Internal Server Error. Please try again later.",
        status: 500,
      },
    });
  }
}
