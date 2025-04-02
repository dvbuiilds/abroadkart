import type { NextApiRequest, NextApiResponse } from "next";
import { generateSitemap } from "../../scripts/generateSitemap";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await generateSitemap();
    if (!response.success) {
      return res.status(500).json(response.error);
    }
    res.status(200).json({ message: "Sitemap updated!" });
  } catch (error) {
    console.error("Error in sitemap update API. ", error);
    return res
      .status(500)
      .json({ message: "Error in sitemap update API.", status: 500 });
  }
}
