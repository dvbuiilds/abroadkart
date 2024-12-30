import { NextApiRequest, NextApiResponse } from "next";
import mongoDBClient from "../../../server/db/mongodb"; // Import MongoDB client

export default async function getSessionHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { sessionID } = req.cookies;

  if (!sessionID) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  // Get the database instance
  const db = mongoDBClient.db();

  // Retrieve session data from the database
  const session = await db
    .collection("sessions")
    .findOne({ sessionId: sessionID });

  if (!session || new Date() > new Date(session.expiresAt)) {
    return res.status(401).json({ error: "Session expired" });
  }

  // Retrieve user details
  const user = await db.collection("users").findOne({ _id: session.userId });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.status(200).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
    },
  });
}
