# AbroadKart — Deployment Guide

## Environment files (before `docker compose`)

1. Copy [`.env.example`](./.env.example) to **`.env`** in the repo root. It holds **Next.js** settings and **`POSTGRES_PASSWORD` / `REDIS_PASSWORD`** for Compose. Fill all values (see comments in the example).
2. Copy [`keystone/.env.example`](./keystone/.env.example) to **`keystone/.env`**. Use the **same** passwords in `DATABASE_URL` / `REDIS_URL` as in root **`.env`**.

For **`docker compose`**, [`docker-compose.yml`](./docker-compose.yml) **overrides** `DATABASE_URL`, Keystone’s `REDIS_URL`, and **`BETTER_AUTH_JWKS_URL`** so containers use Docker hostnames (`postgres`, `redis`, `nextjs`). **`PUBLIC_APP_URL`** and **`PUBLIC_ADMIN_URL`** are injected the same in every app container from the root **`.env`** (see [`.env.example`](./.env.example)). Keep `DATABASE_URL` / `REDIS_URL` / `BETTER_AUTH_JWKS_URL` as `localhost` defaults in **`keystone/.env`** — you only change **`PUBLIC_APP_URL`** / **`PUBLIC_ADMIN_URL`** per environment.

Rotating only the Postgres password on an **existing** volume: updating **`.env`** does not change the password inside Postgres. Either run `ALTER ROLE postgres WITH PASSWORD '...'` via `psql` inside the container, or `docker compose down -v` (destructive, wipes data).

## Stack

| Service    | Image / Source        | Port | Start order |
|------------|-----------------------|------|-------------|
| postgres   | `postgres:16-alpine`  | 5432 | 1st         |
| redis      | `redis:7-alpine`      | 6379 | 2nd         |
| keystone   | `./keystone/`         | 3001 | 3rd         |
| nextjs     | `.` (root)            | 3000 | 4th         |

---

## Phase 1 — Local Docker Testing

### Prerequisites

- Docker Desktop running
- **`.env`** at repo root (from **`.env.example`**) — Next.js + Compose passwords
- **`keystone/.env`** (from **`keystone/.env.example`**) — Keystone (same passwords as root `.env` in connection strings)

### Step 1 — Start infra only

```bash
docker compose up -d postgres redis
```

Wait a few seconds, then confirm both are healthy:

```bash
docker compose ps
```

Both should show `healthy`.

### Step 2 — Build and start Keystone

```bash
docker compose up --build keystone
```

> **First time only** — once Keystone is running, open a second terminal and push
> the schema to the database.
> Use Prisma directly (bypasses Keystone's schema-consistency pre-flight check
> which fails when the container was built with a dummy DATABASE_URL):
>
> ```bash
> docker exec -it abroadkart-keystone node_modules/.bin/prisma db push
> ```

You should see Keystone listening at **http://localhost:3001/admin**.

### Step 3 — Build and start Next.js

```bash
docker compose up --build nextjs
```

Open **http://localhost:3000** in your browser.

### Shortcut — bring everything up at once (after first-time setup)

```bash
docker compose up --build
```

### Useful commands

```bash
# Stream logs from all containers
docker compose logs -f

# Stream logs from one container
docker compose logs -f keystone

# Restart a single service (e.g. after a code change)
docker compose up --build keystone

# Stop everything (keep volumes)
docker compose down

# Stop everything AND wipe volumes (clean slate)
docker compose down -v

# Open a shell inside a container
docker exec -it abroadkart-keystone sh
docker exec -it abroadkart-nextjs sh
```

---

## Phase 2 — DigitalOcean Droplet Deployment

### Recommended droplet spec (for testing)

- **2 vCPU / 4 GB RAM** — 1 GB is too tight for Next.js builds
- OS: Ubuntu 24.04 LTS
- Region: closest to your users

### Step 1 — Provision the droplet

Create the droplet on DigitalOcean, note its public IP: `<DROPLET_IP>`.

Enable the firewall (adjust after TLS — see **Step 8**):
```bash
ufw allow OpenSSH
ufw allow 3000    # Next.js (temporary; remove when using Caddy on 443)
ufw allow 3001    # Keystone (temporary; remove when using Caddy on 443)
ufw enable
```

### Step 2 — Install Docker on the droplet

```bash
ssh root@<DROPLET_IP>

curl -fsSL https://get.docker.com | sh
apt install -y docker-compose-plugin
```

### Step 3 — Get the code onto the droplet

**Option A — git clone (recommended)**
```bash
git clone <your-repo-url> /opt/abroadkart
cd /opt/abroadkart
```

**Option B — rsync from your laptop**
```bash
rsync -avz --exclude node_modules --exclude .next --exclude .keystone \
  ./ root@<DROPLET_IP>:/opt/abroadkart/
```

### Step 4 — Update public URLs (two variables per file)

On the droplet, set the **browser-facing** origins only. Do **not** replace `localhost` in `DATABASE_URL`, `REDIS_URL`, or `BETTER_AUTH_JWKS_URL` inside **`keystone/.env`** — Compose overrides those at runtime.

```bash
cd /opt/abroadkart

# Root `.env` — Next app origin + (for consistency) admin URL
nano .env
# Set (example raw IP; prefer HTTPS domains after Step 8):
#   PUBLIC_APP_URL=http://<DROPLET_IP>:3000
#   PUBLIC_ADMIN_URL=http://<DROPLET_IP>:3001

# Keystone — same two lines (must match root `.env`)
nano keystone/.env
#   PUBLIC_APP_URL=http://<DROPLET_IP>:3000
#   PUBLIC_ADMIN_URL=http://<DROPLET_IP>:3001
```

If you use **Google OAuth**, update the Google Cloud Console OAuth client whenever **`PUBLIC_APP_URL`** changes:
- **Authorized JavaScript origins** → your Next origin (e.g. `https://app.example.com` or `http://<DROPLET_IP>:3000`)
- **Authorized redirect URIs** → `{PUBLIC_APP_URL}/api/auth/callback/google`

### Step 5 — Build images on the droplet

Pass the public Keystone origin as a build arg so the Next.js **client** bundle embeds the correct admin host (`NEXT_PUBLIC_KEYSTONE_URL` is derived from **`PUBLIC_ADMIN_URL`** in the Dockerfile):

```bash
docker compose build \
  --build-arg PUBLIC_ADMIN_URL=http://<DROPLET_IP>:3001
```

### Step 6 — Start services in order

```bash
# Infra first
docker compose up -d postgres redis

# Wait ~10 s for health checks to pass
sleep 10 && docker compose ps

# Keystone
docker compose up -d keystone

# First time only — push schema to DB (use Prisma directly, not keystone prisma)
sleep 10
docker exec -it abroadkart-keystone node_modules/.bin/prisma db push

# Next.js (starts `nextjs-migrate` first: auth schema + Better Auth tables, then the app)
docker compose up -d nextjs
```

Better Auth: Postgres gets `CREATE SCHEMA IF NOT EXISTS auth` from [`db/init/01-auth-schema.sql`](./db/init/01-auth-schema.sql) on a **new** volume, and the one-shot [`nextjs-migrate`](./docker-compose.yml) service runs [`scripts/docker-auth-migrate.sh`](./scripts/docker-auth-migrate.sh) before `nextjs` on every `up` (idempotent).

### Step 7 — Verify

| URL                                     | What you expect         |
|-----------------------------------------|-------------------------|
| `http://<DROPLET_IP>:3001/api/graphql`  | GraphQL playground      |
| `http://<DROPLET_IP>:3001/admin`        | Keystone Admin UI       |
| `http://<DROPLET_IP>:3000`              | Next.js frontend        |

```bash
# Check all containers are running
docker compose ps

# Tail logs
docker compose logs -f
```

---

## Step 8 — TLS with Caddy (recommended for production)

Terminating TLS on the host fixes **Secure** session cookies for Keystone admin SSO (browsers require HTTPS for `Secure` cookies) and lets you close public access to ports 3000/3001.

1. **DNS** — Create A records for your app and admin hostnames (e.g. `app.example.com` → droplet IP, `admin.example.com` → droplet IP).

2. **Firewall** — Allow HTTP/HTTPS; drop raw app ports from the internet once Caddy is up:
   ```bash
   ufw allow 80
   ufw allow 443
   ufw delete allow 3000   # if you added it earlier
   ufw delete allow 3001
   ufw reload
   ```

3. **Bind Compose ports to loopback** — Edit [`docker-compose.yml`](./docker-compose.yml) on the server so only Caddy (on the host) can reach the apps:
   ```yaml
   keystone:
     ports:
       - "127.0.0.1:3001:3001"
   nextjs:
     ports:
       - "127.0.0.1:3000:3000"
   ```
   Local dev machines can keep `3000:3000` / `3001:3001` if you use a gitignored `docker-compose.override.yml` on the droplet only.

4. **Install Caddy** (Ubuntu):
   ```bash
   apt install -y caddy
   ```

5. **`/etc/caddy/Caddyfile`** (replace hostnames):
   ```
   app.example.com {
     encode zstd gzip
     reverse_proxy 127.0.0.1:3000
   }

   admin.example.com {
     encode zstd gzip
     reverse_proxy 127.0.0.1:3001
   }
   ```
   Then: `systemctl reload caddy` — Let’s Encrypt certificates are issued automatically.

6. **Env** — Set HTTPS origins (same in **`.env`** and **`keystone/.env`**):
   ```
   PUBLIC_APP_URL=https://app.example.com
   PUBLIC_ADMIN_URL=https://admin.example.com
   ```

7. **Rebuild Next.js** (client bundle must match **`PUBLIC_ADMIN_URL`**):
   ```bash
   docker compose build --build-arg PUBLIC_ADMIN_URL=https://admin.example.com nextjs nextjs-migrate
   docker compose up -d
   ```

8. **Google OAuth** — Add `https://app.example.com/api/auth/callback/google` and the new origin under JavaScript origins.

---

## Checklist — Before Going Live

- [ ] **`POSTGRES_PASSWORD`** and **`REDIS_PASSWORD`** in root **`.env`** are strong; **`keystone/.env`** connection strings use the same passwords (no default passwords committed)
- [ ] Rotate `SESSION_SECRET` to a fresh 64-char random hex string
- [ ] On the public server, do **not** publish Postgres or Redis to the internet: **remove or comment out** the entire `ports:` blocks under **`postgres`** and **`redis`** in [`docker-compose.yml`](./docker-compose.yml) on that host (Compose merges override files in a way that does **not** reliably strip ports, so editing the published compose file or a **gitignored** `docker-compose.override.yml` with no `ports` key duplicated is safer than relying on an empty `ports: []` merge). App containers still reach `postgres:5432` and `redis:6379` on the internal network. Use UFW/host firewall as a second layer.
- [ ] Set strong **`BETTER_AUTH_SECRET`** and verify **`PUBLIC_APP_URL`** / **`PUBLIC_ADMIN_URL`** match the origins users type in the browser (and Google OAuth / R2 CORS if applicable)
- [ ] Confirm Cloudflare R2 CORS allows the production app origin
- [ ] Prefer **Step 8** (Caddy + HTTPS) on the public droplet; **`ab_admin_session`** uses `Secure` only when **`PUBLIC_ADMIN_URL`** is `https://…`
- [ ] Use `prisma migrate deploy` instead of `db:push` for schema changes in production
