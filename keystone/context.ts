/**
 * Keystone context for use in seed scripts and API routes.
 * Requires Prisma client to be generated (keystone postinstall / prisma generate).
 */

import config from "./keystone";
import { getContext } from "@keystone-6/core/context";

// Prisma client is generated at node_modules/.prisma/client when using default generator
const prismaModule = require(".prisma/client");

export const keystoneContext = getContext(config, prismaModule);
