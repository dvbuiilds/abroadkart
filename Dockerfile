# ── Stage 1: Dependencies ─────────────────────────────────────────────────────
# Installs all deps (dev deps included, needed by `next build`). Re-runs only when
# package.json or yarn.lock changes. The yarn cache is a BuildKit cache mount, so
# retries and later releases reuse downloaded packages instead of refetching them.
#
# Node is pinned to a patched release. 22.23.4 fixes CVE-2026-111497 (Node2Shell,
# Brotli decoder). Bump this tag with each Node security release, and bump
# `node-version` in .github/workflows/release-images.yml to match.
FROM node:22.23.4-alpine AS deps
WORKDIR /app
ENV YARN_CACHE_FOLDER=/yarn-cache
COPY package.json yarn.lock ./
# The install is retried because the npm registry sometimes returns an empty tarball
# for a package, which fails yarn's integrity check on that attempt.
RUN --mount=type=cache,target=/yarn-cache,sharing=locked \
    for attempt in 1 2 3; do \
      yarn install --frozen-lockfile --network-timeout 600000 --network-concurrency 4 && exit 0; \
      echo "yarn install failed on attempt ${attempt}, retrying"; sleep 15; \
    done; \
    exit 1


# ── Stage 2: Build ────────────────────────────────────────────────────────────
# `output: "standalone"` is enabled by NEXT_OUTPUT (see next.config.ts). The build
# needs no runtime secrets, and the browser reads its Keystone URL at runtime
# (src/lib/graphql-client.ts), so one image runs in every environment.
FROM deps AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_OUTPUT=standalone
COPY . .
RUN yarn build


# ── Stage 3: Runner ───────────────────────────────────────────────────────────
# Only the traced server, static assets and public files. No dev deps, source
# or lockfile. Runs as the unprivileged `node` user.
FROM node:22.23.4-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

USER node
EXPOSE 3000

# Runtime env (DATABASE_URL, PUBLIC_*, secrets) comes from docker-compose.
# Better Auth tables are created at startup by src/instrumentation.ts.
CMD ["node", "server.js"]
