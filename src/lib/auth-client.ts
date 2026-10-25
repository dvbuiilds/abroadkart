"use client";

import { createAuthClient } from "better-auth/react";

/** Same-origin `/api/auth`; avoids baking a public URL into the client bundle. */
export const authClient = createAuthClient({
  basePath: "/api/auth",
});
