# CI/CD Process — Mactodocs

## Overview

Every `git push` to `main` automatically deploys the latest code to the VPS via GitHub Actions.

```
git push origin main
        ↓
GitHub Actions triggered
        ↓
Connect to VPS via Tailscale VPN
        ↓
SSH into VPS → git pull → docker compose up --build frontend
        ↓
Live at https://mdox.hijr.win ✅
```

---

## Stack

| Layer          | Technology             |
| -------------- | ---------------------- |
| Auth           | Supabase               |
| Frontend + API | Next.js (Docker)       |
| Database       | PostgreSQL 17 (Docker) |
| ORM            | Drizzle                |
| Web Server     | Nginx (Docker)         |
| Tunnel         | Cloudflare Tunnel      |
| VPN            | Tailscale              |
| CI/CD          | GitHub Actions         |

---

## Infrastructure

### VPS Directory Structure

```
/home/sadmin/mactodocs/
├── frontend/
│   ├── Dockerfile
│   └── mactodoc/          ← git clone (Next.js source)
├── nginx/
│   └── conf.d/
│       └── default.conf
├── docker-compose.yml
└── .env
```

### Docker Services

```
┌─────────────────────────────────────┐
│              VPS Docker             │
│                                     │
│  ┌─────────┐    ┌────────────────┐  │
│  │  Nginx  │───►│  Next.js :3000 │  │
│  │  :80    │    └───────┬────────┘  │
│  └─────────┘            │           │
│                         ▼           │
│                ┌────────────────┐   │
│                │ PostgreSQL     │   │
│                │ :5432          │   │
│                └────────────────┘   │
└─────────────────────────────────────┘
        ▲
Cloudflare Tunnel (mdox.hijr.win)
```

---

## GitHub Actions Workflow

File: `.github/workflows/deploy.yml`

```yaml
name: Deploy to VPS

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Connect to Tailscale
        uses: tailscale/github-action@v2
        with:
          authkey: ${{ secrets.TAILSCALE_AUTHKEY }}

      - name: SSH into VPS and deploy
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_TAILSCALE_IP }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /home/sadmin/mactodocs/frontend/mactodoc
            git pull origin main
            cd /home/sadmin/mactodocs
            docker compose up -d --build frontend
            docker image prune -f
```

---

## Required GitHub Secrets

Go to **GitHub → repo → Settings → Secrets and variables → Actions**:

| Secret              | Description                                  |
| ------------------- | -------------------------------------------- |
| `TAILSCALE_AUTHKEY` | Tailscale auth key (Admin → Settings → Keys) |
| `VPS_TAILSCALE_IP`  | VPS Tailscale IP (`tailscale ip -4`)         |
| `VPS_USER`          | VPS username (`sadmin`)                      |
| `VPS_SSH_KEY`       | VPS SSH private key (`~/.ssh/github_deploy`) |

---

## Local Development

### Prerequisites

- Node.js 20+
- Docker Desktop
- Cloudflare Tunnel (for remote Postgres access)

### Setup

```bash
# Clone repo
git clone git@github.com:yourusername/mactodoc.git
cd mactodoc

# Install dependencies
npm install

# Create local env
cp .env.example .env.local
# Edit .env.local with your local values

# Start Cloudflare tunnel to VPS Postgres
cloudflared access tcp --hostname mactodocdb.hijr.win --url localhost:5433

# Run dev server
npm run dev
```

### Environment Variables

| Variable         | Local (`.env.local`)                         | Production (`.env`)                         |
| ---------------- | -------------------------------------------- | ------------------------------------------- |
| `PG_HOST`        | `localhost`                                  | `postgres`                                  |
| `PG_PORT`        | `5433`                                       | `5432`                                      |
| `DB_CONN_V1_URL` | `postgres://sadb:pass@localhost:5433/mdocdb` | `postgres://sadb:pass@postgres:5432/mdocdb` |

---

## Deployment Flow (Step by Step)

1. **Developer** pushes code to `main` branch
2. **GitHub Actions** detects the push and starts the workflow
3. **Tailscale** GitHub Action joins the VPS private network
4. **appleboy/ssh-action** SSHs into VPS using Tailscale IP
5. **VPS** pulls latest code from GitHub
6. **Docker** rebuilds only the `frontend` container
7. **Old images** are pruned to save disk space
8. **Nginx** routes traffic to the new container
9. **Cloudflare** serves the updated app at `mdox.hijr.win`

> ⚠️ Only the `frontend` container is rebuilt on deploy. `postgres` and `nginx` are never restarted unless manually triggered.

---

## Manual Deploy (if needed)

SSH into VPS and run:

```bash
cd /home/sadmin/mactodocs/frontend/mactodoc
git pull origin main
cd /home/sadmin/mactodocs
docker compose up -d --build frontend
docker image prune -f
```

---

## Useful Commands on VPS

```bash
# Check all containers
docker compose ps

# View frontend logs
docker compose logs -f frontend

# View nginx logs
docker compose logs -f nginx

# Restart a service
docker compose restart frontend

# Full restart
docker compose down && docker compose up -d
```
