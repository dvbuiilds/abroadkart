# AbroadKart — Deployment Guide

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
- Env files for your workflow:
  - **Local Next.js** (`yarn dev`): `.env.local` at repo root (not `.env` — see README).
  - **Local Keystone** (`cd keystone && npm run dev`): `keystone/.env`
  - **Docker Keystone**: `keystone/.env.docker`
  - **Docker Next.js**: `.env.nextjs`

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

Enable the firewall:
```bash
ufw allow OpenSSH
ufw allow 3000    # Next.js
ufw allow 3001    # Keystone
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

### Step 4 — Update env files for the droplet IP

On the droplet, edit the two env files to replace `localhost` with the real IP:

```bash
cd /opt/abroadkart

# Keystone env
nano keystone/.env.docker
# Change:
#   FRONTEND_URL=http://localhost:3000       →  http://<DROPLET_IP>:3000
#   KEYSTONE_PUBLIC_URL=http://localhost:3001 →  http://<DROPLET_IP>:3001

# Next.js env
nano .env.nextjs
# Change:
#   NEXT_PUBLIC_KEYSTONE_URL=http://localhost:3001  →  http://<DROPLET_IP>:3001
```

If you use **Google OAuth**, update the Google Cloud Console OAuth client:
- **Authorized JavaScript origins** → include `http://<DROPLET_IP>:3000`
- **Authorized redirect URIs** → include `http://<DROPLET_IP>:3000/api/auth/callback/google` (or your production domain equivalent)

Align **`BETTER_AUTH_URL`**, **`BETTER_AUTH_ISSUER`**, **`BETTER_AUTH_AUDIENCE`**, and **`BETTER_AUTH_JWKS_URL`** in Next.js and Keystone env files with the public URL users use (not Docker internal hostnames, unless documented).

### Step 5 — Build images on the droplet

Pass the droplet IP as a build arg so the Next.js client bundle points to the right Keystone host:

```bash
docker compose build \
  --build-arg NEXT_PUBLIC_KEYSTONE_URL=http://<DROPLET_IP>:3001
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

# Next.js
docker compose up -d nextjs
```

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

## Checklist — Before Going Live

- [ ] Change `POSTGRES_PASSWORD` to something strong in `keystone/.env.docker`
- [ ] Rotate `SESSION_SECRET` to a fresh 64-char random hex string
- [ ] Remove host port mappings for `postgres` (5432) and `redis` (6379) from `docker-compose.yml` — they should only be accessible inside the Docker network, not exposed publicly
- [ ] Set strong **`BETTER_AUTH_SECRET`** and verify **`BETTER_AUTH_*`** / JWKS URLs match production origins
- [ ] Confirm Cloudflare R2 CORS allows the droplet origin
- [ ] Set up a proper domain + Nginx/Caddy reverse proxy (so you can use port 80/443 instead of :3000 / :3001)
- [ ] Use `prisma migrate deploy` instead of `db:push` for schema changes in production
