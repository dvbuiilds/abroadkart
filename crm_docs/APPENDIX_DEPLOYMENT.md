# Appendix E: Deployment, Docker & DevOps

**Related**: [Master Requirements](./REQUIREMENTS_MASTER.md) | [Phase 1](./PHASE_1_FOUNDATION.md) | [Phase 2](./PHASE_2_SCHEMA.md)

---

## 1. Environments & Targets

### 1.1 Environments

- **Local**: Docker Compose, hot reload, seeded data.

- **Staging**: Same as production infra with reduced resources.

- **Production**: Managed Postgres, Redis, object storage, autoscaled frontends.

### 1.2 Services

- `keystone-api` – Keystone GraphQL + Admin UI

- `consultant-web` – Next.js Consultant Portal

- `fulfilment-web` – Next.js Fulfilment Portal

- `postgres` – Application database

- `redis` – Cache and rate-limiting

- `storage` – S3 or S3-compatible (MinIO for local)

- `reverse-proxy` – Nginx or platform load balancer

---

## 2. Dockerfiles

### 2.1 Keystone API Dockerfile

`keystone/Dockerfile`:

```dockerfile

FROM node:22-alpine AS base

WORKDIR /app

ENV NODE_ENV=production



# Install deps

FROM base AS deps

RUN apk add --no-cache libc6-compat

COPY package.json yarn.lock ./

RUN npm ci



# Build

FROM base AS build

COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN npm run build



# Runtime

FROM base AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules

COPY --from=build /app/.keystone ./ ./.keystone

COPY --from=build /app/package.json ./



EXPOSE 3001

CMD ["npm", "run", "start"]

2.2 Next.js (Consultant / Fulfilment) Dockerfile

apps/consultant/Dockerfile (same pattern for fulfilment):



text

FROM node:22-alpine AS base

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1



FROM base AS deps

COPY package.json yarn.lock ./

RUN npm ci



FROM base AS build

COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN npm run build



FROM base AS runtime

ENV NODE_ENV=production

COPY --from=build /app/public ./public

COPY --from=build /app/.next ./.next

COPY --from=build /app/node_modules ./node_modules

COPY --from=build /app/package.json ./



EXPOSE 3000

CMD ["npm", "run", "start"]

## 3. docker-compose (local dev)

The **canonical** stack is maintained in the repository: [`docker-compose.yml`](../docker-compose.yml), with a gitignored **`.env`** at the repo root (from [`.env.example`](../.env.example)) and **`keystone/.env`** (from [`keystone/.env.example`](../keystone/.env.example)). Compose overrides DB/Redis URLs for container hostnames. See [`DEPLOY.md`](../DEPLOY.md).

The draft multi-app layout below is **illustrative only** (not maintained; do not copy credentials). Replace all placeholders with secrets from your environment; prefer the real `docker-compose.yml` for local runs.

```yaml
# Illustrative only — use repository docker-compose.yml instead
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: abroadkart
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: <POSTGRES_PASSWORD>
  redis:
    image: redis:7-alpine
    # Require a password in production; see repository compose file
  minio:
    image: minio/minio
    environment:
      MINIO_ROOT_USER: <MINIO_ROOT_USER>
      MINIO_ROOT_PASSWORD: <MINIO_ROOT_PASSWORD>
```

4. Database Migrations

Keystone (Prisma) migrations:



bash

# Generate migration after schema change

npm run keystone:prisma:migrate -- --name add_new_field



# Apply migrations locally

npm run keystone:prisma:migrate



# Deploy migrations to production

npm run keystone:prisma:migrate:deploy

Run migrations as a separate CI/CD step before updating app containers.



5. CI/CD (GitHub Actions Example)

.github/workflows/deploy.yml (outline):



text

name: Deploy



on:

  push:

    branches:

      - main



jobs:

  build-and-deploy:

    runs-on: ubuntu-latest



    steps:

      - uses: actions/checkout@v4



      - uses: actions/setup-node@v4

        with:

          node-version: 22



      - name: Install deps

        run: npm ci



      - name: Lint & Test

        run: |

          npm run lint

          npm test



      - name: Build apps

        run: |

          npm run build:keystone

          npm run build:consultant

          npm run build:fulfilment



      - name: Build Docker images

        run: |

          docker build -t registry/keystone-api ./keystone

          docker build -t registry/consultant-web ./apps/consultant

          docker build -t registry/fulfilment-web ./apps/fulfilment



      - name: Push images

        run: |

          docker push registry/keystone-api

          docker push registry/consultant-web

          docker push registry/fulfilment-web



      - name: Deploy (Kubernetes)

        uses: azure/k8s-deploy@v5

        with:

          manifests: |

            k8s/postgres.yaml

            k8s/redis.yaml

            k8s/keystone.yaml

            k8s/consultant-web.yaml

            k8s/fulfilment-web.yaml

6. Kubernetes Manifests (Outline)

Example k8s/keystone.yaml:



text

apiVersion: apps/v1

kind: Deployment

metadata:

  name: keystone-api

spec:

  replicas: 2

  selector:

    matchLabels:

      app: keystone-api

  template:

    metadata:

      labels:

        app: keystone-api

    spec:

      containers:

        - name: keystone-api

          image: registry/keystone-api:latest

          envFrom:

            - secretRef:

                name: keystone-env

          ports:

            - containerPort: 3001

***

apiVersion: v1

kind: Service

metadata:

  name: keystone-api

spec:

  selector:

    app: keystone-api

  ports:

    - port: 80

      targetPort: 3001

Similar manifests for consultant-web and fulfilment-web with ingress routing (/consultant, /fulfilment).



7. Monitoring & Logging

Use managed solutions (e.g., Datadog, New Relic, or Prometheus + Grafana).



Instrument:



API latency



GraphQL error rates



Database query times



Cache hit ratio



Centralize logs via:



CloudWatch / Stackdriver / ELK



Ensure Keystone and Next.js log structured JSON where possible.



8. Backup & DR

Nightly Postgres backups (full), plus WAL archiving for point-in-time recovery.



Regular snapshots of object storage.



Document RTO/RPO targets and test restores at least quarterly.



9. Security Hardening

Enforce HTTPS end-to-end.



Use security headers (CSP, HSTS, X-Frame-Options) at the edge.



Rotate credentials and secrets regularly.



Restrict DB and Redis to private network.



Restrict S3 buckets via IAM policies to app roles only.
```
