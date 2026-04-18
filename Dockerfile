# ── Stage 1: Build ────────────────────────────────────────────────────────────
# Installs all deps and runs `next build`.
#
# NEXT_PUBLIC_KEYSTONE_URL is needed at BUILD TIME because Next.js inlines
# NEXT_PUBLIC_* variables into the client bundle during the build step.
# It is also read at RUNTIME by server-side code (API routes / RSCs), but
# those pick it up from the docker-compose env_file, so you get two chances:
#   - Client bundle  → baked in via the ARG below at image build time
#   - Server runtime → injected by docker-compose at container startup
#
# For LOCAL docker-compose: leave the ARG default (http://localhost:3001).
# For DROPLET deploy: pass --build-arg NEXT_PUBLIC_KEYSTONE_URL=http://<ip>:3001
FROM node:20-alpine AS builder
WORKDIR /app

# Build arguments — all NEXT_PUBLIC_* vars must be baked in at build time
# because Next.js inlines them into the client bundle during `next build`.
# env_file (runtime) is too late for these; they must come via ARG → ENV.
ARG NEXT_PUBLIC_KEYSTONE_URL=http://localhost:3001

ENV NEXT_PUBLIC_KEYSTONE_URL=$NEXT_PUBLIC_KEYSTONE_URL

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
