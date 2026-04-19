# ── Stage 1: Build ────────────────────────────────────────────────────────────
# Installs all deps and runs `next build`.
#
# PUBLIC_ADMIN_URL is the public Keystone origin. At build time it is copied into
# NEXT_PUBLIC_KEYSTONE_URL so the Next.js client bundle has the correct admin/API host.
# Server-side code reads PUBLIC_ADMIN_URL at runtime (see src/lib/public-urls.ts).
#
# For LOCAL docker-compose: leave the default (http://localhost:3001).
# For production: pass --build-arg PUBLIC_ADMIN_URL=https://admin.example.com
FROM node:20-alpine AS builder
WORKDIR /app

# NEXT_PUBLIC_* must be set before `next build`.
ARG PUBLIC_ADMIN_URL=http://localhost:3001

ENV NEXT_PUBLIC_KEYSTONE_URL=$PUBLIC_ADMIN_URL

# Install dependencies first (better layer caching)
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy the full source
COPY . .

# Build the Next.js application
RUN yarn build


# ── Stage 2: Runner ───────────────────────────────────────────────────────────
# Lean production image — only the built output, public assets, and node_modules.
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next        ./.next
COPY --from=builder /app/public       ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# `next start` reads env vars (including NEXT_PUBLIC_* for server-side code)
# from docker-compose env_file at container startup.
CMD ["node_modules/.bin/next", "start"]
