import { NextApiRequest, NextApiResponse } from "next";

// TYPES
import { ResponseType, User } from "@app/types/api-types";

// UTILS
import mongoDBClient from "../../../server/db/mongodb"; // Import MongoDB client

export default async function getSessionHandler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType<User>>
) {
  const { sessionID } = req.cookies;

  if (!sessionID) {
    return res.status(401).json({
      success: false,
      error: { message: "Not authenticated", status: 401 },
    });
  }

  // Get the database instance
  const db = mongoDBClient.db();

  // Retrieve session data from the database
  const session = await db
    .collection("sessions")
    .findOne({ sessionId: sessionID });

  if (!session || new Date() > new Date(session.expiresAt)) {
    return res.status(401).json({
      success: false,
      error: { message: "Session expired", status: 401 },
    });
  }

  // Retrieve user details
  const user = await db.collection("users").findOne({ _id: session.userId });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: { message: "User not found", status: 404 },
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
    },
  });
}
