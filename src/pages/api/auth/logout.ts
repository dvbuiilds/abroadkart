import { NextApiRequest, NextApiResponse } from "next";

// TYPES
import { ResponseType } from "@app/types/api-types";

// UTILS
import mongoDBClient from "../../../server/db/mongodb"; // Import MongoDB client

export default async function logoutHandler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType<null>>
) {
  const { sessionID } = req.cookies;

  if (!sessionID) {
    return res.status(400).json({
      success: false,
      error: { message: "No session found", status: 400 },
    });
  }

  try {
    // Get the database instance
    const db = mongoDBClient.db();

    // Remove the session from the database
    await db.collection("sessions").deleteOne({ sessionId: sessionID });

    // Clear the session cookie
    res.setHeader(
      "Set-Cookie",
      "sessionID=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0"
    );

    return res.status(200).json({ success: true, data: null });
  } catch (error) {
    console.error("Error during logout:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Internal Server Error", status: 500 },
    });
  }
}
