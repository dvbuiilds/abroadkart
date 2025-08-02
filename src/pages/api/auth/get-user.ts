import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../server/db/mongodb";
import { ResponseType, User } from "@app/types/api-types";
import { getNameAbbreviation } from "@app/utils/name-abbreviation";
import { serverSideCache } from "../../../utils/server-side/ServerSideCache";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType<User>>
) {
  // Allow only GET requests
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

  // Ensure email is a string
  const emailString = Array.isArray(email) ? email[0] : email;

  if (!emailString) {
    return res.status(400).json({
      success: false,
      error: { message: "Email is required.", status: 400 },
    });
  }
  try {
    // Create cache key using email
    const userCacheKey = [emailString];

    // Check cache for user data
    const cachedUserData = serverSideCache.get(userCacheKey);

    let user = null;
    let form = null;

    if (cachedUserData !== undefined) {
      // Use cached data
      user = cachedUserData.user;
      form = cachedUserData.form;
    } else {
      // Find the user by email
      user = await db.collection("users").findOne({ email });
      form = await db.collection("pre-counselling-form").findOne({ email });

      // Cache the results
      serverSideCache.set(userCacheKey, { user, form });
    }

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
        haveFilledPreCounsellingForm: !!form,
        picture: user.picture,
        nameAbbreviation:
          user.nameAbbreviation ?? getNameAbbreviation(user.name),
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
