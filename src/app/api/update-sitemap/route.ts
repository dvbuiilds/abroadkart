import { generateSitemap } from "@app/scripts/generateSitemap";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = await generateSitemap();
    if (!response.success) {
      return NextResponse.json(response.error, { status: 500 });
    }
    return NextResponse.json({ message: "Sitemap updated!" });
  } catch (error) {
    console.error("Error in sitemap update API. ", error);
    return NextResponse.json(
      { message: "Error in sitemap update API.", status: 500 },
      { status: 500 },
    );
  }
}
