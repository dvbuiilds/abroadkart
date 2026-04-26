# ── Stage 1: Build ────────────────────────────────────────────────────────────
# Compiles TypeScript via `keystone build` and generates the Prisma client.
# A dummy DATABASE_URL is used here — Prisma client generation reads the
# schema.prisma file; it does NOT need a live database connection.
# All real secrets are injected at runtime by docker-compose via env_file.
#
# WHY node:20-slim (Debian) and NOT node:20-alpine:
# Prisma auto-detects the OpenSSL version at client-generation time and picks
# the matching query-engine binary. Alpine 3.17+ ships OpenSSL 3.x but Prisma
# sometimes resolves to the "openssl-1.1.x" musl binary (libssl.so.1.1),
# which no longer exists on modern Alpine — causing a crash on startup.
# Debian bookworm (slim) ships glibc + OpenSSL 3.x and Prisma resolves
# correctly to linux-arm64-openssl-3.0.x without any manual overrides.
FROM node:20-slim AS builder
WORKDIR /app

# Install openssl BEFORE anything Prisma-related.
# node:20-slim is a bare Debian image with no openssl pre-installed.
# Without it, Prisma cannot detect the system OpenSSL version and silently
# defaults to generating the "openssl-1.1.x" query-engine binary, which then
# fails to load at runtime because libssl.so.1.1 doesn't exist on modern Debian.
# With openssl 3.x present, Prisma correctly generates linux-arm64-openssl-3.0.x.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Install dependencies first (better layer caching — only re-runs when
# package.json or yarn.lock changes, not on every source code change).
# --ignore-scripts skips the postinstall hook ("keystone postinstall") which
# needs keystone.ts to exist — but we haven't copied source files yet at this step.
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --ignore-scripts

# Copy the full source — keystone.ts is now present
COPY . .

# Now run postinstall manually (needs keystone.ts to resolve "./keystone")
RUN node_modules/.bin/keystone postinstall

# Run keystone build directly (bypassing dotenv-cli so no .env file is needed).
# The dummy DATABASE_URL satisfies Prisma's schema parsing during code generation.
RUN DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy \
    SESSION_SECRET=buildsecret \
    node_modules/.bin/keystone build


# ── Stage 2: Runner ───────────────────────────────────────────────────────────
# Must match the builder base image so the Prisma query-engine binary
# (linux-arm64-openssl-3.0.x) links against the same OpenSSL library.
FROM node:20-slim AS runner
WORKDIR /app

# Same openssl install as the builder — the query-engine .so file dynamically
# links against libssl.so.3 at runtime, so it must be present here too.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# .keystone/ contains the compiled server code output by `keystone build`
COPY --from=builder /app/.keystone      ./.keystone
# node_modules must be present because .keystone/bin/cli.js requires them
COPY --from=builder /app/node_modules   ./node_modules
COPY --from=builder /app/package.json   ./package.json
# schema.prisma is read at runtime by Prisma for any migration / db-push commands
COPY --from=builder /app/schema.prisma  ./schema.prisma

EXPOSE 3001

# Call keystone directly — no dotenv-cli wrapper needed.
# Real env vars (DATABASE_URL, REDIS_URL, BETTER_AUTH_*, etc.) come from
# docker-compose env_file at container startup.
CMD ["node_modules/.bin/keystone", "start"]
