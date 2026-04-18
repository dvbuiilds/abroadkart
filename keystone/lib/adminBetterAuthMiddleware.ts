import type { Express, Request as ExpressRequest } from "express";
import { getKeystonePublicUrl } from "./keystonePublicUrl";
import { verifyBetterAuthJwt } from "./verifyBetterAuthJwt";
import { isKeystoneAdminDebug } from "./adminDebug";

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

function getCookie(req: ExpressRequest, name: string): string | undefined {
  const raw = req.headers.cookie;
  if (!raw) return undefined;
  for (const part of raw.split(";")) {
    const trimmed = part.trim();
    const i = trimmed.indexOf("=");
    if (i === -1) continue;
    const k = trimmed.slice(0, i).trim();
    if (k === name) {
      return decodeURIComponent(trimmed.slice(i + 1));
    }
  }
  return undefined;
}

const ADMIN_SESSION_COOKIE = "ab_admin_session";

/**
 * Keystone Admin: SSO handoff with Next.js better-auth + HttpOnly cookie for HTML navigations.
 */
export function registerAdminBetterAuthMiddleware(app: Express) {
  // Admin UI Next app uses `basePath: '/admin'`. Some clients resolve GraphQL as
  // `/admin/api/graphql`, but Keystone only mounts Apollo at `graphql.path` (`/api/graphql`).
  // Without this, those requests 404 and the Admin UI shows "An error occurred when loading Admin Metadata".
  app.use((req, _res, next) => {
    const u = req.url ?? "";
    if (u.startsWith("/admin/api/graphql")) {
      if (process.env.NODE_ENV === "development") {
        console.info(
          "[keystone] rewriting",
          u.split("?")[0],
          "-> /api/graphql (see graphql.path in keystone.ts)",
        );
      }
      req.url = u.slice("/admin".length) || "/";
    }
    next();
  });

  /** Log every GraphQL HTTP request/response (Admin metadata loads via POST /api/graphql). */
  app.use((req, res, next) => {
    const pathOnly = (req.originalUrl || req.url || "").split("?")[0] || "";
    if (!pathOnly.includes("/api/graphql")) return next();

    const t0 = Date.now();
    const hasAuth = !!req.headers.authorization;
    const hasAbCookie = !!(req.headers.cookie || "").includes(
      `${ADMIN_SESSION_COOKIE}=`,
    );
    if (isKeystoneAdminDebug()) {
      console.info("[keystone][graphql-http] →", req.method, pathOnly, {
        hasAuthorizationHeader: hasAuth,
        hasAbAdminSessionCookie: hasAbCookie,
      });
    }
    res.on("finish", () => {
      if (!isKeystoneAdminDebug()) return;
      const ms = Date.now() - t0;
      console.info("[keystone][graphql-http] ←", req.method, pathOnly, {
        status: res.statusCode,
        ms,
      });
    });
    next();
  });

  app.get("/", (_req, res) => {
    const base = getKeystonePublicUrl();
    res
      .type("text")
      .send(
        `AbroadKart Keystone\n- Admin UI: ${base}/admin\n- GraphQL: ${base}/api/graphql\n`,
      );
  });

  app.get("/admin/_sso_callback", async (req, res) => {
    const token =
      typeof req.query.token === "string" ? req.query.token : undefined;
    const redirectRaw =
      typeof req.query.redirect === "string" ? req.query.redirect : "/admin";
    const redirectTo = redirectRaw.startsWith("/") ? redirectRaw : "/admin";

    if (!token) {
      return res.status(400).type("text").send("Missing token query parameter");
    }

    try {
      await verifyBetterAuthJwt(token);
    } catch (e) {
      console.error("[keystone] /admin/_sso_callback JWT verify failed:", e);
      return res.status(401).type("text").send("Invalid or expired token");
    }

    // Path must be "/" so the browser also sends this cookie on `/api/graphql`.
    // `path: "/admin"` would exclude GraphQL, so Admin UI metadata requests had no session.
    res.cookie(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });

    return res.redirect(302, redirectTo);
  });

  app.use(async (req, res, next) => {
    if (!isAdminHtmlDocumentRequest(req as ExpressRequest)) return next();

    const pathname = getRequestPathname(req as ExpressRequest);
    if (pathname.startsWith("/admin/_sso_callback")) return next();

    const cookieToken = getCookie(req as ExpressRequest, ADMIN_SESSION_COOKIE);
    if (cookieToken) {
      try {
        await verifyBetterAuthJwt(cookieToken);
        return next();
      } catch {
        /* redirect to SSO */
      }
    }

    const keystonePublic = getKeystonePublicUrl();
    const path = (req as ExpressRequest).originalUrl || req.url || "/admin";
    const returnTo = encodeURIComponent(`${keystonePublic}${path}`);
    const front = (process.env.FRONTEND_URL || "http://localhost:3000").replace(
      /\/+$/,
      "",
    );
    return res.redirect(
      302,
      `${front}/api/auth/keystone-sso?redirect_url=${returnTo}`,
    );
  });
}
