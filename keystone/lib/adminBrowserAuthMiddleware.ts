import type { Express, Request as ExpressRequest } from "express";
import { getClerkBackendClient } from "./clerkBackendClient";
import { getClerkAuthorizedParties } from "./clerkAuthorizedParties";
import { expressRequestToWebRequest } from "./expressRequestToWebRequest";
import { getKeystonePublicUrl } from "./keystonePublicUrl";

function getRequestPathname(req: ExpressRequest): string {
  return (req.originalUrl || req.url || "/").split("?")[0] || "/";
}

function isAdminHtmlDocumentRequest(req: ExpressRequest): boolean {
  if (req.method !== "GET") return false;
  const pathname = getRequestPathname(req);
  if (!pathname.startsWith("/admin")) return false;
  if (pathname.includes("/_next") || pathname.includes("/__next")) return false;
  if (/\.[a-z0-9]+$/i.test(pathname)) return false;
  const accept = (req.headers.accept || "").toLowerCase();
  if (!accept) return true;
  if (accept.includes("text/html")) return true;
  if (accept.includes("*/*")) return true;
  return false;
}

function sendMissingPublishableKeyHelp(res: import("express").Response) {
  res
    .status(503)
    .type("html")
    .send(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Keystone admin — configuration</title></head>
<body style="font-family:system-ui;max-width:42rem;margin:2rem auto;padding:0 1rem">
  <h1>Keystone Admin needs Clerk publishable key</h1>
  <p>Add to <code>keystone/.env</code> (same value as Next.js <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code>):</p>
  <pre style="background:#f4f4f5;padding:1rem;border-radius:8px">CLERK_PUBLISHABLE_KEY=pk_test_...</pre>
  <p>Then restart <code>npm run dev</code> in the <code>keystone/</code> folder. In the Clerk Dashboard, allow redirects to <code>http://localhost:3001/admin</code>.</p>
  <p><a href="${getKeystonePublicUrl()}/api/graphql">GraphQL endpoint</a></p>
</body></html>`);
}

/**
 * Clerk browser session on the Keystone host: handshake + redirect unauthenticated
 * HTML navigations under `/admin` to the Next.js sign-in page with `redirect_url` back here.
 */
export function registerAdminClerkBrowserMiddleware(app: Express) {
  app.get("/", (_req, res) => {
    const base = getKeystonePublicUrl();
    res
      .type("text")
      .send(
        `AbroadKart Keystone\n- Admin UI: ${base}/admin\n- GraphQL: ${base}/api/graphql\n`,
      );
  });

  app.use(async (req, res, next) => {
    if (!isAdminHtmlDocumentRequest(req as ExpressRequest)) return next();

    const clerk = getClerkBackendClient();
    if (!clerk) {
      console.warn(
        "[keystone] Admin browser auth disabled: set CLERK_PUBLISHABLE_KEY (or NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) in keystone/.env — same value as Next.js publishable key.",
      );
      return sendMissingPublishableKeyHelp(res);
    }

    try {
      const webReq = expressRequestToWebRequest(req as ExpressRequest);
      const state = await clerk.authenticateRequest(webReq, {
        authorizedParties: getClerkAuthorizedParties(),
      });

      if (state.status === "handshake") {
        const location = state.headers.get("location");
        state.headers.forEach((value, key) => {
          if (!value) return;
          if (key.toLowerCase() === "location") return;
          res.append(key, value);
        });
        if (location) return res.redirect(307, location);
        return res.status(307).end();
      }

      if (state.status === "signed-out") {
        if (process.env.NODE_ENV === "development") {
          console.info(
            "[keystone] /admin HTML: Clerk signed-out",
            state.reason,
            state.message || "",
          );
        }
        const keystonePublic = getKeystonePublicUrl();
        const path = (req as ExpressRequest).originalUrl || req.url || "/admin";
        const returnTo = encodeURIComponent(`${keystonePublic}${path}`);
        const front = (process.env.FRONTEND_URL || "http://localhost:3000").replace(
          /\/+$/,
          "",
        );
        return res.redirect(302, `${front}/sign-in?redirect_url=${returnTo}`);
      }
    } catch (e) {
      console.error("[keystone] admin Clerk browser middleware:", e);
    }

    next();
  });
}
