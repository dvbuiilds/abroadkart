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
    provider: 'postgresql',
    url: process.env.DATABASE_URL!,
    enableLogging: process.env.NODE_ENV === 'development',
    idField: { kind: 'uuid' },
  },
  lists,
  session: clerkSession,
  ui: {
    isAccessAllowed: ({ session }) => !!session,
  },
  storage: {
    r2_storage: {
      kind: "s3",
      type: "file",
      bucketName: process.env.R2_BUCKET_NAME!,
      region: "auto",
      endpoint: process.env.R2_ENDPOINT,
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      signed: { expiry: 3600 },
    },
    student_documents: {
      kind: "s3",
      type: "file",
      bucketName: process.env.R2_BUCKET_NAME!,
      region: "auto",
      endpoint: process.env.R2_ENDPOINT,
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      signed: { expiry: 3600 },
    },
    receipts: {
      kind: "s3",
      type: "file",
      bucketName: process.env.R2_BUCKET_NAME!,
      region: "auto",
      endpoint: process.env.R2_ENDPOINT,
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      signed: { expiry: 3600 },
    },
    university_logos: {
      kind: "s3",
      type: "file",
      bucketName: process.env.R2_BUCKET_NAME!,
      region: "auto",
      endpoint: process.env.R2_ENDPOINT,
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      signed: { expiry: 3600 },
    },
  },
  server: {
    cors: {
      origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : ['http://localhost:3000'],
      credentials: true,
    },
    port: process.env.PORT ? parseInt(process.env.PORT) : 3001,
  },
  graphql: {
    path: '/api/graphql',
    apolloConfig: {
      introspection: process.env.NODE_ENV !== 'production',
    },
  },
});