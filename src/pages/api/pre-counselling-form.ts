import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
// UTILS
import mongoDBClient from "../../server/db/mongodb"; // Import the MongoClient instance

const db = mongoDBClient.db();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const userId = session.user?.id;
  const collection = db.collection("pre-counselling-form");

  if (req.method === "GET") {
    try {
      const formEntry = await collection.findOne({ userId });
      if (!formEntry) {
        return res
          .status(404)
          .json({ success: false, message: "No entry found" });
      }
      return res.status(200).json({ success: true, data: formEntry });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  if (req.method === "POST") {
    try {
      const { answers } = req.body;
      const newEntry = {
        userId,
        answers: answers || {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await collection.insertOne(newEntry);
      return res
        .status(201)
        .json({ success: true, message: "Form entry created" });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Error saving entry" });
    }
  }

  if (req.method === "PUT") {
    try {
      const { answers } = req.body;
      await collection.updateOne(
        { userId },
        { $set: { answers, updatedAt: new Date() } }
      );
      return res.status(200).json({ success: true, message: "Draft saved" });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Error saving draft" });
    }
  }

  return res
    .status(405)
    .json({ success: false, message: "Method not allowed" });
}
