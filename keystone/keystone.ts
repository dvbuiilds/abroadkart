/**
 * KeystoneJS configuration
 */

import { config } from "@keystone-6/core";
import { clerkSession } from "./lib/clerkAuth";
import { User } from "./schema/User";
import { Consultant } from "./schema/Consultant";
import { ActivityLog } from "./schema/ActivityLog";
import { University } from "./schema/University";
import { Program } from "./schema/Program";
import { Student } from "./schema/Student";
import { StudentDocument } from "./schema/StudentDocument";
import { Application } from "./schema/Application";
import { LoanApplication } from "./schema/LoanApplication";
import { AccommodationBooking } from "./schema/AccommodationBooking";
import { Reimbursement } from "./schema/Reimbursement";
import { PrepaidCard } from "./schema/PrepaidCard";
import { Task } from "./schema/Task";

const lists = {
  User,
  Consultant,
  ActivityLog,
  University,
  Program,
  Student,
  StudentDocument,
  Application,
  LoanApplication,
  AccommodationBooking,
  Reimbursement,
  PrepaidCard,
  Task,
};

export default config({
  db: {
    provider: "postgresql",
    url: process.env.DATABASE_URL!,
    enableLogging: process.env.NODE_ENV === "development",
    idField: { kind: "uuid" },
  },
  lists,
  session: clerkSession,
  ui: {
    isAccessAllowed: ({ session }) => {
      // In development, allow access to Admin UI without auth
      if (process.env.NODE_ENV !== "production") return true;
      return !!session;
    },
  },
  storage: (() => {
    const r2Base = {
      kind: "s3" as const,
      type: "file" as const,
      bucketName: process.env.R2_BUCKET_NAME!,
      region: "auto",
      endpoint: process.env.R2_ENDPOINT,
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      signed: { expiry: 3600 },
    };
    return {
      student_documents: { ...r2Base, pathPrefix: "student-documents/" },
      receipts: { ...r2Base, pathPrefix: "receipts/" },
      university_logos: { ...r2Base, pathPrefix: "university-logos/" },
    };
  })(),
  server: {
    cors: {
      origin: process.env.FRONTEND_URL
        ? [process.env.FRONTEND_URL]
        : ["http://localhost:3000"],
      credentials: true,
    },
    port: process.env.PORT ? parseInt(process.env.PORT) : 3001,
  },
  graphql: {
    path: "/api/graphql",
    apolloConfig: {
      introspection: process.env.NODE_ENV !== "production",
    },
  },
});
