import type { NextApiRequest, NextApiResponse } from "next";

// TYPES
import {
  BlogResponse,
  TableOfContentsNode,
} from "@app/components/BlogTemplates/Template1/types";

// UTILS
import mongoDBClient from "../../../server/db/mongodb";

// CONFIGS
import { PageSectionKeysMap } from "@app/components/BlogTemplates/Template1/config";

const db = mongoDBClient.db();
const blogsCollection = db.collection("blogs");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: { message: "HTTP Method not allowed. ", status: 405 },
    });
  }

  try {
    const data: BlogResponse =
      typeof req.body === "string" ? await JSON.parse(req.body) : req.body;

    const blogInstance = await blogsCollection.findOne({
      pageId: data.pageId,
    });
    if (blogInstance) {
      return res.status(403).json({
        success: false,
        error: { message: "Blog already exists", status: 403 },
      });
    }

    // Data Transformation
    const transformedData = transformDataForDB(data);
    if (!transformedData) {
      return res.status(500).json({
        success: false,
        error: {
          message:
            "Internal Server Error. Blog could not be created at this time. please try again later.",
          status: 500,
        },
      });
    }
    const response = await blogsCollection.insertOne(transformedData);
    if (!response.acknowledged) {
      return res.status(500).json({
        success: false,
        error: {
          message:
            "Internal Server Error. Blog could not be created at this time. please try again later.",
          status: 500,
        },
      });
    }
    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error creating the blog: ", error);
    return res.status(500).json({
      success: false,
      error: { message: "Error creating blog.", status: 500 },
    });
  }
}

const transformDataForDB = (data: BlogResponse): BlogResponse | null => {
  // Setting publishedDate and lastModifiedDate to current date.
  data.blogMetaData.publishedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  data.blogMetaData.lastModifiedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Logic to create table of contents from pageData at the time of blog creation to save computation at the time of page request by client.
  const tableOfContentsData: TableOfContentsNode[] = [];
  try {
    for (let index = 0; index < data.pageData.length; ++index) {
      const section = data.pageData[index];
      if (
        section.sectionType === PageSectionKeysMap.h1 ||
        section.sectionType === PageSectionKeysMap.h2 ||
        section.sectionType === PageSectionKeysMap.h3 ||
        section.sectionType === PageSectionKeysMap.h4
      ) {
        const sectionId = `#${section.content
          .split(" ")
          .map((word) => word.toLowerCase())
          .join("-")}`;
        section.id = sectionId;
        if (section.sectionType === PageSectionKeysMap.h2) {
          tableOfContentsData.push({
            label: section.content,
            id: sectionId,
            children: [],
          });
        } else if (section.sectionType === PageSectionKeysMap.h3) {
          tableOfContentsData[tableOfContentsData.length - 1].children.push({
            label: section.content,
            id: sectionId,
            children: [],
          });
        } else if (section.sectionType === PageSectionKeysMap.h4) {
          tableOfContentsData[tableOfContentsData.length - 1].children[
            tableOfContentsData[tableOfContentsData.length - 1].children
              .length - 1
          ].children.push({
            label: section.content,
            id: sectionId,
            children: [],
          });
        }
      }
      console.log(
        "@@ tableOfContentsData",
        JSON.stringify(tableOfContentsData, null, 2)
      );
    }
  } catch (error) {
    console.error("Error creating table of contents: ", error);
    return null;
  }

  return {
    ...data,
    tableOfContents: {
      sectionType: PageSectionKeysMap.tableOfContents,
      title: "Table of Contents",
      content: tableOfContentsData,
    },
  };
};
