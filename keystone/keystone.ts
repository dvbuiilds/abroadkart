/**
 * KeystoneJS configuration
 */

import { config } from '@keystone-6/core';
import { lists } from './schema';
import { clerkSession } from './lib/clerkAuth';

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
      kind: 's3',
      type: 'file',
      bucketName: process.env.R2_BUCKET_NAME!,
      region: 'auto',
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
    healthCheck: true,
  },
  graphql: {
    path: '/api/graphql',
    apolloConfig: {
      introspection: process.env.NODE_ENV !== 'production',
    },
  },
});