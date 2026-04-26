# Archived Pages Router Code

> **Historical snapshot.** Current authentication is **better-auth** — see [crm_docs/APPENDIX_AUTH_SETUP.md](./crm_docs/APPENDIX_AUTH_SETUP.md).

This document preserves the source code of Pages Router files that were removed during the migration to App Router. Use this for reference when re-implementing blog, dashboard, or counselling features.

---

## Blog APIs

### src/pages/api/blogs/create-blog.ts

```typescript
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
```

### src/pages/api/blogs/get-all-blogs.ts

```typescript
import type { NextApiRequest, NextApiResponse } from "next";

// UTILS
import mongoDBClient from "../../../server/db/mongodb";

const PAGE_SIZE = 9;
const db = mongoDBClient.db();
const blogsCollection = db.collection("blogs");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { start = "0", end, category } = req.query;
    const startIndex = parseInt(start as string, 10) || 0;
    const endIndex = parseInt(end as string, 10) || undefined;

    const filter: any = {};
    if (category) {
      const categories = Array.isArray(category) ? category : [category];
      filter.category = { $in: categories };
    }

    const blogs = await blogsCollection
      .find(filter)
      .sort({ publishedAt: -1 })
      .skip(startIndex)
      .limit(endIndex ? endIndex - startIndex : PAGE_SIZE)
      .toArray();

    if (!blogs || !blogs?.length) {
      return res.status(404).json({
        success: false,
        error: { message: "Pages Not Found.", status: 404 },
      });
    }

    const totalBlogs = await blogsCollection.countDocuments(filter);
    const isLastPage = startIndex + PAGE_SIZE >= totalBlogs;

    return res.status(200).json({
      success: true,
      data: {
        start: startIndex,
        end: startIndex + blogs.length - 1,
        isLastPage,
        blogs: blogs.map((blog) => ({
          pageId: blog.pageId,
          title: blog.title,
          category: blog.category,
          blogMetaData: blog.blogMetaData,
          featuredImg: blog.featuredImg,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching blogs data: ", error);
    return res.status(500).json({
      success: false,
      error: { message: "Error Fetching the Blogs data.", status: 500 },
    });
  }
}
```

### src/pages/api/blogs/get-blog.ts

```typescript
import type { NextApiRequest, NextApiResponse } from "next";

import mongoDBClient from "../../../server/db/mongodb";

const db = mongoDBClient.db();
const blogsCollection = db.collection("blogs");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: { message: "HTTP Method not allowed. " },
    });
  }

  try {
    const pageId = req.query.pageId;
    const response = await blogsCollection.findOne({ pageId });
    if (!response) {
      return res.status(404).json({
        success: false,
        error: { message: "Page not found." },
      });
    }
    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error fetching blog data: ", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching blog data.",
    });
  }
}
```

### src/pages/api/blogs/update-blog.ts

```typescript
import type { NextApiRequest, NextApiResponse } from "next";

import { BlogResponse } from "@app/components/BlogTemplates/Template1/types";
import mongoDBClient from "../../../server/db/mongodb";

const db = mongoDBClient.db();
const blogsCollection = db.collection("blogs");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).json({
      success: false,
      error: { message: "HTTP Method not allowed. ", status: 405 },
    });
  }

  try {
    const data: BlogResponse =
      typeof req.body === "string" ? await JSON.parse(req.body) : req.body;

    if (!data.pageId || !data.title || !data.category || !data.pageData) {
      return res.status(400).json({
        success: false,
        error: { message: "Missing required fields", status: 400 },
      });
    }

    data.blogMetaData.lastModifiedDate = new Date().toLocaleDateString(
      "en-US",
      { year: "numeric", month: "numeric", day: "numeric" }
    );

    const updatedBlog = await blogsCollection.findOneAndUpdate(
      { pageId: data.pageId },
      { $set: { ...data } },
      { returnDocument: "after" }
    );

    if (!updatedBlog) {
      return res.status(404).json({
        success: false,
        error: { message: "Blog not found!", status: 404 },
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedBlog,
    });
  } catch (error) {
    console.error("Error updating the blog: ", error);
    return res.status(500).json({
      success: false,
      error: { message: "Error updating blog.", status: 500 },
    });
  }
}
```

---

## Counselling Form APIs

### src/pages/api/pre-counselling-form.ts

```typescript
import { NextApiRequest, NextApiResponse } from "next";

import type { QuestionsSets } from "@app/types/form-types";
import type { ResponseType } from "@app/types/api-types";
import mongoDBClient from "../../server/db/mongodb";

const db = mongoDBClient.db();
const collection = db.collection("pre-counselling-form");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType<QuestionsSets>>
) {
  const email = req.headers["email"];
  if (req.method === "POST") {
    const body = req.body as QuestionsSets;
    const qnas = body.map((set) => set.questions).flat();
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
  } else {
    return res.status(405).json({
      success: false,
      error: {
        message: "Method not allowed.",
        status: 405,
      },
    });
  }
}
```

### src/pages/api/free-counselling-form.ts

```typescript
import { NextApiRequest, NextApiResponse } from "next";

import mongoDBClient from "../../server/db/mongodb";

const db = mongoDBClient.db();
const collection = db.collection("free-counselling-form");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: { message: "Method not allowed.", status: 405 },
    });
  }
  const {
    email,
    whatsappNumber,
    targetCountry,
    targetUniversity,
    targetCourse,
    targetYear,
    message,
  } = req.body;

  if (!email || !/^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid or missing email.", status: 400 },
    });
  }
  if (!whatsappNumber || !/^\d{10,15}$/.test(whatsappNumber)) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid or missing WhatsApp number.", status: 400 },
    });
  }
  if (!targetCountry || typeof targetCountry !== "string") {
    return res.status(400).json({
      success: false,
      error: { message: "Target country is required.", status: 400 },
    });
  }
  if (!targetCourse || typeof targetCourse !== "string") {
    return res.status(400).json({
      success: false,
      error: { message: "Target course is required.", status: 400 },
    });
  }
  const currentYear = new Date().getFullYear();
  if (
    !targetYear ||
    isNaN(targetYear) ||
    targetYear < currentYear ||
    targetYear > currentYear + 10
  ) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid target year.", status: 400 },
    });
  }

  try {
    const formInstance = await collection.findOne({
      $or: [{ email }, { whatsappNumber }],
    });
    if (formInstance) {
      return res.status(400).json({
        success: false,
        error: { message: "Form already submitted.", status: 400 },
      });
    }
    const dbResponse = await collection.insertOne({
      ...req.body,
      timestamp: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      }),
    });
    if (!dbResponse) {
      return res.status(500).json({
        success: false,
        error: {
          message: "Error in connecting with DB, form data could not be saved.",
          status: 500,
        },
      });
    }
    return res.status(200).json({ success: true, data: dbResponse });
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
```

---

## Blog Pages

### src/pages/blogs/index.tsx

See full file in project history — contains getServerSideProps, BlogsListingLayout, BlogCard, category filtering, pagination.

### src/pages/blogs/[pageId].tsx

See full file in project history — contains getServerSideProps, BlogPageTemplate, BlogLayout, SEO schema, related blogs fetch.

---

## Dashboard Pages

### src/pages/dashboard/index.tsx

```typescript
import Link from "next/link";
import { Alert } from "@app/components/Alert";
import { GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (session?.user?.haveFilledPreCounsellingForm) {
    return { props: { haveFilledPreCounsellingForm: true } };
  }
  return { props: { haveFilledPreCounsellingForm: false } };
};

const Dashboard = ({
  haveFilledPreCounsellingForm,
}: {
  haveFilledPreCounsellingForm: boolean;
}) => {
  if (!haveFilledPreCounsellingForm) {
    return (
      <div className="flex flex-col items-center h-full gap-4 bg-white rounded-md p-1">
        <Link href="/dashboard/pre-counselling-form" className="w-full">
          <Alert
            message="Fill up this brief form and unlock free resources worth $1000."
            type="info"
          />
        </Link>
        <section className="flex flex-col gap-2 items-center">
          <h3 className="text-xl text-gray-500 font-semibold">
            Check Out Our Latest Blogs
          </h3>
          <p>Stay informed with helpful articles, tips, and insights on studying abroad.</p>
          <Link href="https://abroadkart.com" className="text-blue-600 hover:underline">
            Explore Blogs &gt;
          </Link>
        </section>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center align-center h-full gap-4">
      <section className="flex flex-col gap-2 items-center">
        <h3 className="text-4xl text-gray-500 font-semibold">
          Thanks for filling out the form!
        </h3>
        <p className="px-16">
          Your information has been received successfully. Our team will review
          your details and will contact you shortly.
        </p>
        <h3 className="text-xl text-gray-500 font-semibold">What to Expect Next</h3>
        <p className="px-16">
          A member of our counselling team will reach out to you within 48 hours.
        </p>
      </section>
      <section className="flex flex-col gap-2 items-center">
        <h3 className="text-xl text-gray-500 font-semibold">
          Check Out Our Latest Blogs
        </h3>
        <Link href="https://abroadkart.com" className="text-blue-600 hover:underline">
          Explore Blogs &gt;
        </Link>
      </section>
      <section className="flex flex-col gap-2 items-center">
        Feel free to reach out to us if you have any questions.
        {/* Contact information should be loaded from environment variables or configuration */}
      </section>
    </div>
  );
};

export default Dashboard;
```

### src/pages/dashboard/pre-counselling-form.tsx

See full file in project history — contains multi-step form with QuestionTypeMap, FormProgressBar, Form, useUserSession, localStorage persistence, API submission.

---

## NextAuth

### src/pages/api/auth/[...nextauth].ts

See full file in project history — NextAuth config with GoogleProvider, CredentialsProvider, bcrypt, MongoDB users collection, serverSideCache, callbacks for signIn/jwt/session.

### src/pages/api/auth/get-user.ts

See full file in project history — GET handler to fetch user by email from MongoDB, returns user + haveFilledPreCounsellingForm.

### src/pages/api/auth/signup.ts

See full file in project history — POST handler for user registration, bcrypt hash, MongoDB users collection, validation.

---

## Auth Pages (replaced by App Router + better-auth)

### src/pages/login.tsx

NextAuth login page with email/password and Google OAuth via useUserSession.triggerLogin.

### src/pages/signup.tsx

Custom signup form calling api/auth/signup.

---

## Context and Config

### src/context/UserSessionContext.tsx

NextAuth session context — useSession, signIn, signOut, getSession, triggerLogin/triggerLogout, fetchUserDetails, route protection via checkIfRouteIsProtected.

### src/config/form-questions-config.ts

```typescript
export const QuestionTypeMap = {
  TEXT: "TEXT",
  SELECT: "SELECT",
  MULTISELECT: "MULTISELECT",
} as const;
```

### src/components/DashboardLayout.tsx

Dashboard layout with Navbar, ProfileMenu, DashboardSideBar (collapsible), sidebar links for Dashboard and Pre-Counselling, logout button. Uses useUserSession for user and triggerLogout.
