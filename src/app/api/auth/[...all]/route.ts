import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@app/lib/auth";

export const dynamic = "force-dynamic";

const handler = toNextJsHandler({
  get handler() {
    return getAuth().handler;
  },
});

export const GET = handler.GET;
export const POST = handler.POST;
export const PUT = handler.PUT;
export const PATCH = handler.PATCH;
export const DELETE = handler.DELETE;
