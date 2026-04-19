/**
 * KeystoneJS configuration
 */

import { config } from "@keystone-6/core";
import { registerAdminBetterAuthMiddleware } from "./lib/adminBetterAuthMiddleware";
import { betterAuthSession } from "./lib/betterAuthSession";
import { getKeystonePublicUrl } from "./lib/keystonePublicUrl";
import { getPublicAppUrl, getPublicAdminUrl } from "./lib/publicUrls";
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
import { ADMIN_HOME_PAGE_SRC } from "./lib/adminHomePageTemplate";

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
  session: betterAuthSession,
  ui: {
    basePath: "/admin",
    isAccessAllowed: ({ session }) => {
      return session?.role === "superAdmin";
    },
    getAdditionalFiles: [
      async () => [
        {
          mode: "write",
          outputPath: "pages/index.js",
          src: ADMIN_HOME_PAGE_SRC,
        },
      ],
    ],
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
      origin: (() => {
        const origins = new Set<string>();
        origins.add(getPublicAppUrl());
        origins.add(getPublicAdminUrl());
        const legacyFront = process.env.FRONTEND_URL?.replace(/\/+$/, "");
        if (legacyFront) origins.add(legacyFront);
        origins.add(getKeystonePublicUrl());
        return Array.from(origins);
      })(),
      credentials: true,
    },
    port: process.env.PORT ? parseInt(process.env.PORT) : 3001,
    extendExpressApp: (app) => {
      registerAdminBetterAuthMiddleware(app);
    },
  },
  graphql: {
    path: "/api/graphql",
    apolloConfig: {
      introspection: process.env.NODE_ENV !== "production",
      formatError: (formattedError, _error) => {
        if (process.env.NODE_ENV === "development") {
          console.error("[keystone][graphql resolver/formatError]", {
            message: formattedError.message,
            code: formattedError.extensions?.code,
            path: formattedError.path,
          });
        }
        return formattedError;
      },
      plugins: [
        {
          async requestDidStart() {
            if (process.env.NODE_ENV !== "development") return {};
            return {
              async didResolveOperation(rc) {
                console.info("[keystone][graphql] resolved operation", {
                  name: rc.operationName ?? "(anonymous)",
                });
              },
            };
          },
        },
      ],
    },
  },
});
