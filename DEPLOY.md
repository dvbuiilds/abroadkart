# AbroadKart — Deployment Guide

Production is one DigitalOcean droplet running this repo's Docker stack, with Cloudflare in front. Cloudflare holds DNS and proxies traffic. Its R2 buckets hold private files and the public blog-image CDN (`cdn.abroadkart.com`), which this guide does not move.

Work through the parts in order. Parts 1–3 do not change what visitors see. Part 5 does.

## What runs where

| Hostname | Points to | Serves |
|---|---|---|
| `abroadkart.com`, `www.abroadkart.com` | droplet, after Part 5 | Next.js site and blog. Still WordPress until Part 5. |
| `admin.abroadkart.com` | droplet | Keystone admin and GraphQL API |
| `cdn.abroadkart.com` | Cloudflare R2 (unchanged) | Blog images |

Images are built in GitHub Actions and pulled from GHCR, so the droplet never runs a build.

On the droplet, Caddy terminates HTTPS on ports 80 and 443 and forwards to containers bound to localhost only:

| Container | Bound to | Used by |
|---|---|---|
| `abroadkart-nextjs` | `127.0.0.1:3000` | Caddy → `abroadkart.com` |
| `abroadkart-keystone` | `127.0.0.1:3001` | Caddy → `admin.abroadkart.com` |
| `abroadkart-postgres` | `127.0.0.1:5432` | SSH tunnel only |

Never edit tracked files on the droplet. Releases are checkouts of tags, and local edits block them.

---

## Part 1 — Prepare the droplet (once)

1. **Create the droplet.** Ubuntu 24.04, 1 vCPU / 2 GB RAM. The droplet only pulls prebuilt images, so it never runs a build. Add your SSH key and note the public IP as `<DROPLET_IP>`.

2. **Install Docker and Caddy.**
   ```bash
   ssh root@<DROPLET_IP>
   curl -fsSL https://get.docker.com | sh
   apt install -y caddy
   docker compose version
   ```
   Compose must be **v2.24.4 or newer**. The override file in step 6 uses the `!override` tag, which older versions reject.

3. **Open only SSH, HTTP and HTTPS.**
   ```bash
   ufw allow OpenSSH
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw enable
   ```
   UFW does not filter ports that Docker publishes. Step 6 binds the app ports to `127.0.0.1`, and that binding is what keeps them private.

   Then add a 2 GB swap file. It is a safety net for memory spikes on the 2 GB droplet:
   ```bash
   fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
   echo '/swapfile none swap sw 0 0' >> /etc/fstab
   echo 'vm.swappiness=10' > /etc/sysctl.d/99-swap.conf && sysctl -p /etc/sysctl.d/99-swap.conf
   swapon --show && free -h
   ```

4. **Get the code.**
   ```bash
   git clone https://github.com/dvbuiilds/abroadkart.git /opt/abroadkart
   cd /opt/abroadkart
   ```
   If the repo is private, add a read-only deploy key to the droplet and clone over SSH.

5. **Create the env files.** Copy from the examples. Do not copy your laptop's files, which hold localhost values and a development password.
   ```bash
   cp .env.example .env
   cp keystone/.env.example keystone/.env
   ```
   Generate each new secret separately with `openssl rand -hex 32`.

   **Root `.env`** (Next.js, and Compose's variable substitution):

   | Variable | Value |
   |---|---|
   | `POSTGRES_PASSWORD` | new secret |
   | `PUBLIC_APP_URL` | `https://abroadkart.com` |
   | `PUBLIC_ADMIN_URL` | `https://admin.abroadkart.com` |
   | `BETTER_AUTH_SECRET` | new secret |
   | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | from Google Cloud Console. Optional: Google sign-in is off without them. |
   | `ABROADKART_BOOTSTRAP_SUPERADMIN_EMAIL` | the one email that becomes superAdmin (Part 5, step 4) |
   | `LEADS_INTERNAL_KEY` | new secret, same value as in `keystone/.env` |
   | `REVALIDATE_SECRET` | new secret, same value as in `keystone/.env` |
   | `BLOG_CDN_URL` | `https://cdn.abroadkart.com` |
   | `IMAGE_TAG` | the release tag being deployed, for example `v2026.10.24`. Set it in Part 3, step 3 and on every release. |

   **`keystone/.env`:**

   | Variable | Value |
   |---|---|
   | `SESSION_SECRET` | new secret |
   | `PUBLIC_APP_URL`, `PUBLIC_ADMIN_URL` | same as root `.env` |
   | `LEADS_INTERNAL_KEY`, `REVALIDATE_SECRET` | same as root `.env` |
   | `R2_BUCKET_NAME`, `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | the private R2 bucket. Create a token scoped to that bucket. |
   | `R2_PUBLIC_*` | only for the blog import (Part 3, step 7) |
   | `BETTER_AUTH_ISSUER`, `BETTER_AUTH_AUDIENCE` | **delete both lines.** Keystone then checks tokens against `PUBLIC_APP_URL`. A stale value here breaks sign-in. |

   Leave `DATABASE_URL` and `BETTER_AUTH_JWKS_URL` as they are. Compose overrides them with container hostnames.

6. **Bind the containers to localhost.** Create `/opt/abroadkart/docker-compose.override.yml`. Compose loads it automatically. Git does not track it, so it survives checkouts.
   ```yaml
   services:
     postgres:
       ports: !override
         - "127.0.0.1:5432:5432"
     keystone:
       ports: !override
         - "127.0.0.1:3001:3001"
     nextjs:
       ports: !override
         - "127.0.0.1:3000:3000"
   ```

---

## Part 2 — Cloudflare (once)

1. **Add the admin record.** DNS → Records → Add record: type `A`, name `admin`, IPv4 `<DROPLET_IP>`, proxy status **Proxied** (orange cloud). Leave `@` and `www` alone until Part 5.

2. **Create an origin certificate.** SSL/TLS → Origin Server → Create Certificate. Use RSA, hostnames `abroadkart.com` and `*.abroadkart.com`, and validity 15 years. Cloudflare shows the private key only once. On the droplet:
   ```bash
   mkdir -p /etc/caddy/certs
   nano /etc/caddy/certs/origin.pem     # paste the certificate
   nano /etc/caddy/certs/origin.key     # paste the private key
   chown root:caddy /etc/caddy/certs/origin.pem /etc/caddy/certs/origin.key
   chmod 640 /etc/caddy/certs/origin.pem /etc/caddy/certs/origin.key
   ```

3. **Set the SSL mode.** SSL/TLS → Overview → **Full (strict)**. This setting covers the whole zone, including the live WordPress site, so load `https://abroadkart.com` afterwards. If it breaks, switch to **Full**. Origin certificates work in both modes.

---

## Part 3 — First start (once)

0. **On your laptop**, create and push the release tag as described in Part 4, "On your laptop". The droplet can only check out pushed tags. Pushing the tag also starts the image build in GitHub Actions; see step 3.

1. **Configure Caddy.** Replace `/etc/caddy/Caddyfile`:
   ```
   abroadkart.com {
   	tls /etc/caddy/certs/origin.pem /etc/caddy/certs/origin.key
   	encode zstd gzip
   	reverse_proxy 127.0.0.1:3000
   }

   www.abroadkart.com {
   	tls /etc/caddy/certs/origin.pem /etc/caddy/certs/origin.key
   	redir https://abroadkart.com{uri} permanent
   }

   admin.abroadkart.com {
   	tls /etc/caddy/certs/origin.pem /etc/caddy/certs/origin.key
   	encode zstd gzip
   	reverse_proxy 127.0.0.1:3001
   }
   ```
   ```bash
   caddy validate --config /etc/caddy/Caddyfile && systemctl reload caddy
   ```

2. **Check out the release.**
   ```bash
   cd /opt/abroadkart
   git fetch --tags
   git checkout v2026.10.24
   ```

3. **Get the images.** The `release-images` workflow in GitHub Actions runs the test gate, then builds and publishes both images when the tag is pushed. Wait for that run to go green in the repo's Actions tab. The first time only, open each of `abroadkart-web` and `abroadkart-keystone` under your GitHub Packages, choose **Change visibility**, and set it to **Public**. Public packages pull without a login. Then set the release tag on the droplet and pull:
   ```bash
   cd /opt/abroadkart
   grep -q '^IMAGE_TAG=' .env && sed -i 's/^IMAGE_TAG=.*/IMAGE_TAG=v2026.10.24/' .env || echo 'IMAGE_TAG=v2026.10.24' >> .env
   docker compose pull
   ```
   Settings such as `PUBLIC_ADMIN_URL` are read when a container starts, so they do not need a new image.

4. **Start Postgres and create the schema.** There are no migration files yet, so `prisma db push` is how the schema reaches the database.
   ```bash
   docker compose up -d postgres
   docker compose ps                      # wait until postgres shows (healthy)
   docker compose run --rm --no-deps keystone node_modules/.bin/prisma db push
   ```
   On an empty database Prisma will not ask you to confirm anything. If it ever asks about dropping data, answer **no**.

5. **Start everything.**
   ```bash
   docker compose up -d --no-build
   docker compose ps
   ss -ltn | grep -E ':(3000|3001|5432) '
   ```
   On its first start, `nextjs` creates the Better Auth tables. Confirm with `docker compose logs nextjs | grep auth-migrate`. Every line from `ss` should show `127.0.0.1:` before the port.

6. **Check from your laptop, before DNS points at the droplet.** `--resolve` sends the request to the droplet without changing DNS. `-k` is needed because curl does not trust the origin certificate.
   ```bash
   DROPLET_IP=<DROPLET_IP>
   curl -sk -o /dev/null -w "site  %{http_code}\n"  --resolve abroadkart.com:443:$DROPLET_IP https://abroadkart.com/blogs
   curl -sk -o /dev/null -w "admin %{http_code}\n"  --resolve admin.abroadkart.com:443:$DROPLET_IP https://admin.abroadkart.com/admin
   curl -sk --resolve admin.abroadkart.com:443:$DROPLET_IP -H "content-type: application/json" \
     -d '{"query":"{ __typename }"}' https://admin.abroadkart.com/api/graphql
   ```
   Expect `site 200`, `admin 200` (or a redirect to sign-in), and `{"data":{"__typename":"Query"}}`. On any 5xx, run `docker compose logs --tail=100 nextjs keystone` on the droplet.

7. **Load the blog content.** The production database starts empty, and the blog pages read from it. The import runs on your laptop against the production database through an SSH tunnel. It reads the WordPress export in the repo's `output/` folder, which git does not track.

   Terminal 1 (leave it open):
   ```bash
   ssh -N -L 5433:127.0.0.1:5432 root@<DROPLET_IP>
   ```
   Port 5433 avoids the Postgres container on your laptop, which uses 5432.

   Terminal 2, in the `keystone/` folder of the same commit as the release:
   ```bash
   export DATABASE_URL='postgresql://postgres:<POSTGRES_PASSWORD>@localhost:5433/abroadkart'
   yarn import:blogs --dry-run
   yarn import:blogs
   yarn import:blogs --verify
   unset DATABASE_URL     # so later local commands cannot reach production
   ```
   `--verify` exits non-zero if the database differs from the export. Images already in the R2 bucket are skipped.

   Then clear the blog cache on the droplet. Blog pages cache for an hour, so a page loaded before the import would stay empty:
   ```bash
   curl -s -X POST http://127.0.0.1:3000/api/revalidate \
     -H "x-revalidate-secret: $(grep '^REVALIDATE_SECRET=' .env | cut -d= -f2)" \
     -H "content-type: application/json" -d '{"scope":"categories"}'
   ```

   Do **not** run `yarn seed` or `yarn seed:students` on production. They create sample consultants, students and applications.

8. **Google sign-in (if you use it).** In Google Cloud Console, add `https://abroadkart.com` under Authorized JavaScript origins, and `https://abroadkart.com/api/auth/callback/google` under Authorized redirect URIs.

9. **R2 CORS.** Only if the browser fetches R2 files with JavaScript: allow `https://abroadkart.com` and `https://admin.abroadkart.com` in the bucket's CORS settings. Test one document download after Part 5.

---

## Part 4 — Release (every time)

### On your laptop

1. **Use `main` for releases.** `fb_wp_blog_migration` is 111 commits ahead of `main`. Merge it through a pull request before the next release, so `main` matches production. Until then, the first release is tagged on the branch.

2. **Run the gate** from the repo root, on Node 22.23.4 or newer (`node -v`). It must finish without errors. The release workflow runs the same gate when the tag is pushed, so this local run is an early check.
   ```bash
   yarn test && yarn build && (cd keystone && yarn test)
   ```
   Before tagging, check that both Dockerfiles still pin a patched Node: `grep '^FROM' Dockerfile keystone/Dockerfile`.

3. **Tag the commit and push the tag.**
   ```bash
   git tag -a v2026.10.24 -m "Blog migration"
   git push origin v2026.10.24
   ```
   Tags are named `vYYYY.MM.DD`. For a second release on the same day, use `v2026.10.24-2`.

   The push starts the `release-images` workflow. Wait for it to go green before you continue on the droplet. If the gate fails, nothing is published and the droplet keeps running the previous tag.

### On the droplet

1. **Note the current version.** It is your rollback target.
   ```bash
   cd /opt/abroadkart && git describe --tags --always
   ```

2. **Back up the database.** Backups contain personal data. Keep copies off the droplet and out of public storage.
   ```bash
   mkdir -p /opt/backups
   docker exec abroadkart-postgres pg_dump -U postgres abroadkart | gzip > /opt/backups/abroadkart-$(date +%F-%H%M).sql.gz
   ls -lh /opt/backups
   ```
   The new file should be more than a few kilobytes.

3. **Check out the release.** Stop if the first command prints anything.
   ```bash
   git status --short --untracked-files=no
   git fetch --tags
   git checkout v2026.10.24
   ```

4. **Check for new settings.** Add any new variables to `.env` or `keystone/.env` before building.
   ```bash
   git diff <previous-tag> v2026.10.24 -- .env.example keystone/.env.example
   ```

5. **Pull, apply the schema if it changed, and start.**
   ```bash
   sed -i 's/^IMAGE_TAG=.*/IMAGE_TAG=v2026.10.24/' .env
   docker compose pull
   docker compose up -d postgres
   # only if the schema changed:
   git diff --quiet <previous-tag> v2026.10.24 -- keystone/schema.prisma || \
     docker compose run --rm --no-deps keystone node_modules/.bin/prisma db push
   docker compose up -d --no-build
   docker compose ps
   docker image prune -a -f   # removes images from earlier releases; they stay in GHCR
   ```
   `keystone/schema.prisma` is tracked in git and generated from `keystone/schema/`, so this check catches every schema change. If `db push` asks about dropping data, answer **no** and stop.

6. **Verify.**
   ```bash
   curl -sI https://abroadkart.com/blogs | head -n 1
   curl -s -H "content-type: application/json" -d '{"query":"{ __typename }"}' https://admin.abroadkart.com/api/graphql
   ```
   Then load the site in a browser and sign in.

### Roll back

Code:
```bash
cd /opt/abroadkart
git checkout <previous-tag>
sed -i 's/^IMAGE_TAG=.*/IMAGE_TAG=<previous-tag>/' .env
docker compose pull
docker compose up -d --no-build
```
The previous release's images stay in GHCR, so `docker compose pull` fetches them again even after `docker image prune`.

Database (last resort; erases everything written since the backup):
```bash
docker compose stop keystone nextjs
docker exec abroadkart-postgres psql -U postgres -c 'DROP DATABASE abroadkart;' -c 'CREATE DATABASE abroadkart;'
gunzip -c /opt/backups/<file>.sql.gz | docker exec -i abroadkart-postgres psql -U postgres abroadkart
docker compose up -d
```
Rolling back the code does not undo schema or data changes, so restore the backup only if the release left the data broken.

---

## Part 5 — Move abroadkart.com to the droplet (cutover)

This replaces the live WordPress site. Start only when every item below is true:

- [ ] The `/blogs` hero copy is final. It is open item 3 in [`crm_docs/BLOG_PHASE6_RESULTS.md`](./crm_docs/BLOG_PHASE6_RESULTS.md), which that doc marks as blocking go-live.
- [ ] Part 3, step 6 passes, and `yarn import:blogs --verify` passed.
- [ ] You accept that old WordPress URLs return 404. The blog docs say this is intended.
- [ ] WordPress stays available as a rollback until the new site has run for a while.

Steps:

1. **Record the current DNS records** for `@` and `www` in Cloudflare (type and content). This is your rollback.
2. **Check the settings.** `.env` has `PUBLIC_APP_URL=https://abroadkart.com`, and `keystone/.env` has no `BETTER_AUTH_ISSUER` or `BETTER_AUTH_AUDIENCE` lines. If you change either, run `docker compose up -d --no-build`. No new image is needed, because `PUBLIC_APP_URL` is read at runtime.
3. **Point the apex and www at the droplet.** In Cloudflare DNS, set `@` and `www` to type `A`, content `<DROPLET_IP>`, proxy **Proxied**. Remove any other records for those names.
4. **Create the superadmin.** Sign up at `https://abroadkart.com/sign-up` with the email in `ABROADKART_BOOTSTRAP_SUPERADMIN_EMAIL`. That account becomes superAdmin, and every other sign-up starts as `pending`. Then open `https://admin.abroadkart.com/admin` and sign in.
5. **Check the public site.** Load `https://abroadkart.com`, a `/blogs` post, `https://abroadkart.com/sitemap.xml` and `https://abroadkart.com/robots.txt`. Then watch the logs for 15 minutes: `docker compose logs -f nextjs keystone`.

**Roll back:** set `@` and `www` back to the records from step 1. The WordPress site is not touched by the droplet, so reverting DNS restores it.

---

## Run locally (optional)

```bash
cp .env.example .env && cp keystone/.env.example keystone/.env
docker compose build
docker compose up -d postgres
docker compose run --rm --no-deps keystone node_modules/.bin/prisma db push   # first time only
docker compose up -d
```

Open http://localhost:3000. The Keystone admin is at http://localhost:3001/admin.

---

## Checklist

- [ ] Both Dockerfiles pin Node 22.23.4 or newer (`grep '^FROM' Dockerfile keystone/Dockerfile`). Node 20 is end-of-life and has no fix for CVE-2026-111497 (Node2Shell). Bumping Node means editing both Dockerfiles and `node-version` in `.github/workflows/release-images.yml`.
- [ ] Swap is active on the droplet (`swapon --show`, `free -h`). The 2 GB swap file from Part 1 is a safety net, so it must survive reboots (`/etc/fstab`).
- [ ] Secrets are new and unique. None are `change-me`, and none match your laptop's values.
- [ ] `ss -ltn` on the droplet shows ports 3000, 3001 and 5432 on `127.0.0.1` only.
- [ ] Caddy serves `abroadkart.com`, `www` and `admin` with the origin certificate.
- [ ] Cloudflare SSL mode is Full (strict), or Full.
- [ ] `PUBLIC_APP_URL` and `PUBLIC_ADMIN_URL` start with `https://`. The admin session cookie is only `Secure` when `PUBLIC_ADMIN_URL` is HTTPS.
- [ ] Google OAuth origins and the redirect URI match `PUBLIC_APP_URL`.
- [ ] A nightly backup runs. Add this line with `crontab -e` on the droplet, then copy backups off the droplet:
  ```
  0 3 * * * docker exec abroadkart-postgres pg_dump -U postgres abroadkart | gzip > /opt/backups/abroadkart-$(date +\%F).sql.gz
  ```

## Troubleshooting

| Symptom | Likely cause and check |
|---|---|
| Cloudflare **526** | Caddy has no valid origin certificate for that hostname. Check `/etc/caddy/certs/` and `journalctl -u caddy`. |
| Cloudflare **525** | Caddy is not listening on 443. Check `systemctl status caddy`. |
| Cloudflare **502** | A container is down. Check `docker compose ps` and `docker compose logs --tail=100 nextjs keystone`. |
| Blog pages show the retry page | Next cannot reach Keystone. Check `docker compose logs keystone`. |
| Blog list is empty after the import | Run the revalidate call in Part 3, step 7. |
| Sign-in works but admin refuses access | The account is `pending`. Only the `ABROADKART_BOOTSTRAP_SUPERADMIN_EMAIL` account is created as superAdmin. |
| Keystone rejects tokens | `BETTER_AUTH_ISSUER` or `BETTER_AUTH_AUDIENCE` is set in `keystone/.env` and no longer matches `PUBLIC_APP_URL`. Delete both lines. |
| `manifest unknown` or `denied` on `docker compose pull` | The tag has not finished building in the `release-images` workflow, or the package is still private. Check the Actions run, then the package visibility (Part 3, step 3). |
| Container restarting, or killed (OOM) | Check `docker stats --no-stream` for memory use, and `dmesg \| grep -i oom` for kills. The `nextjs` and `keystone` containers have Node heap caps in `docker-compose.yml`. |
| `nextjs` exits on start with an auth-migrate error | Check `docker compose logs nextjs`. Confirm the `auth` schema exists with `docker exec abroadkart-postgres psql -U postgres -d abroadkart -c '\dn'`. The server retries on restart, so fix the cause (usually the database) and wait. |
