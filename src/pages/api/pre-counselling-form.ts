import { NextApiRequest, NextApiResponse } from "next";

// TYPES
import type { Questionnaire } from "@app/types/form-types";
import type { ResponseType } from "@app/types/api-types";

// UTILS
import mongoDBClient from "../../server/db/mongodb"; // Import the MongoClient instance

const db = mongoDBClient.db();
const collection = db.collection("pre-counselling-form");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType<Questionnaire>>
) {
  const email = req.headers["email"];
  if (req.method === "POST") {
    const body = req.body as Questionnaire;
    const qnas = body.map((set) => set.info).flat();
    try {
      const dbResponse = await collection.insertOne({ email, form: qnas });
      if (!dbResponse) {
        return res.status(500).json({
          success: false,
          error: {
            message:
              "Error in connecting with DB, form data could not be saved.",
            status: 500,
          },
        });
      }
      return res.status(200).json({ success: true, data: body });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          message: String(error),
          status: 500,
        },
      });
    }
  }
  //  else if (req.method === "GET") {
  //   try {
  //     const dbResponse = await collection.findOne({ email });
  //     if(!dbResponse){
  //       return res.status(404).json({
  //         success: false,
  //         error:{
  //           message: "No form data found for the given email.",
  //           status: 404
  //         }
  //       })
  //     }
  //     // return res.status(200).json({ success: true, data: dbResponse });
  //   } catch (error) {
  //     return res.status(500).json({
  //       success: false,
  //       error: {
  //         message: "Error in connecting with DB to get form data.",
  //         status: 500,
  //       },
  //     });
  //   }
  // }
  else {
    return res.status(405).json({
      success: false,
      error: {
        message: "Method not allowed.",
        status: 405,
      },
    });
  }
}
