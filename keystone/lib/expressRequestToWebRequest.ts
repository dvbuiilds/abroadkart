import type { Request as ExpressRequest } from "express";

/**
 * Build a Fetch API Request from Express for Clerk `authenticateRequest`.
 */
export function expressRequestToWebRequest(req: ExpressRequest): Request {
  const protoHeader = req.headers["x-forwarded-proto"];
  const proto =
    (Array.isArray(protoHeader) ? protoHeader[0] : protoHeader) ||
    req.protocol ||
    "http";
  const host = req.get("host") || `localhost:${process.env.PORT || "3001"}`;
  const path = req.originalUrl || req.url || "/";
  const url = `${proto}://${host}${path}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    if (typeof value === "string") headers.set(key, value);
    else for (const part of value) headers.append(key, part);
  }

  return new Request(url, { method: req.method, headers });
}
