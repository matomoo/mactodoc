# VPS Stack Setup — mactodocs

Full setup guide and reference for the mactodocs production server stack.

---

## Server Info

|                 |                                 |
| --------------- | ------------------------------- |
| **OS**          | Debian 13 (Trixie)              |
| **Public IP**   | None (behind Cloudflare Tunnel) |
| **User**        | `sadmin`                        |
| **Project dir** | `~/mactodocs/`                  |

---

## Project Structure

```
~/mactodocs/
├── docker-compose.yml
└── nginx/
    └── conf.d/
```

---

## Docker Installation

Install Docker from the official repository (not the default Debian packages):

```bash
# Install dependencies
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg

# Add Docker's GPG key
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add Docker repo for Debian Trixie
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/debian trixie stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update

# Install Docker + Compose plugin
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Run Docker without sudo
sudo usermod -aG docker $USER
newgrp docker

# Verify
sudo systemctl is-active docker
docker run hello-world
```

---

## Docker Services

### docker-compose.yml (current — without Next.js)

```yaml
services:
  postgres:
    image: postgres:17-alpine
    container_name: postgres
    restart: always
    environment:
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: strongpassword
      POSTGRES_DB: mydb
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "127.0.0.1:5432:5432" # localhost only, never public
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    container_name: nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
    networks:
      - app-network

volumes:
  pgdata:

networks:
  app-network:
    driver: bridge
```

### docker-compose.yml (future — with Next.js)

```yaml
services:
  postgres:
    image: postgres:17-alpine
    container_name: postgres
    restart: always
    environment:
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: strongpassword
      POSTGRES_DB: mydb
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "127.0.0.1:5432:5432"
    networks:
      - app-network

  nextjs:
    build: ./app
    container_name: nextjs
    restart: always
    environment:
      DATABASE_URL: postgresql://myuser:strongpassword@postgres:5432/mydb
    depends_on:
      - postgres
    expose:
      - "3000"
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    container_name: nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
    depends_on:
      - nextjs
    networks:
      - app-network

volumes:
  pgdata:

networks:
  app-network:
    driver: bridge
```

### Common Commands

```bash
# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f

# Restart a service
docker compose restart postgres

# Stop all
docker compose down
```

---

## PostgreSQL

|              |                                    |
| ------------ | ---------------------------------- |
| **Image**    | `postgres:17-alpine`               |
| **User**     | `myuser`                           |
| **Password** | `strongpassword`                   |
| **Database** | `mydb`                             |
| **Port**     | `127.0.0.1:5432` (localhost only)  |
| **Data**     | Named volume `pgdata` (persistent) |

> `pgdata` is a Docker named volume — data persists across container restarts and rebuilds.

### Connect inside VPS

```bash
docker exec -it postgres psql -U myuser -d mydb
```

---

## Cloudflare Tunnel

Tunnel is managed via **Cloudflare Zero Trust Dashboard** (token-based, no local config file).

|                     |                                  |
| ------------------- | -------------------------------- |
| **Type**            | Dashboard-managed (token-based)  |
| **Service**         | `cloudflared` running as systemd |
| **Config location** | Cloudflare Zero Trust Dashboard  |

### Check tunnel status

```bash
sudo systemctl status cloudflared
sudo systemctl restart cloudflared
```

### Tunnel Hostnames

| Hostname              | Type | Target                         |
| --------------------- | ---- | ------------------------------ |
| `mactodocdb.hijr.win` | TCP  | `localhost:5432` (Postgres)    |
| _(your domain)_       | HTTP | `localhost:80` (Nginx, future) |

### Add/edit hostnames

Go to: **https://one.dash.cloudflare.com**
→ Networks → Tunnels → your tunnel → Edit → Public Hostname

---

## Navicat Remote Connection (from Mac)

Postgres is not publicly exposed. Access it via `cloudflared` TCP proxy on your local Mac.

### Step 1 — Run local proxy

```bash
cloudflared access tcp --hostname mactodocdb.hijr.win --url localhost:5433
```

> Add alias to `~/.zshrc` for convenience:
>
> ```bash
> alias dbconnect="cloudflared access tcp --hostname mactodocdb.hijr.win --url localhost:5433"
> ```

> Run `source ~/.zshrc` after adding the alias.

### Step 2 — Connect Navicat

| Field        | Value            |
| ------------ | ---------------- |
| **Host**     | `localhost`      |
| **Port**     | `5433`           |
| **Database** | `mydb`           |
| **Username** | `myuser`         |
| **Password** | `strongpassword` |

> Keep the terminal with `cloudflared` open while using Navicat. Close it when done.

---

## Traffic Architecture

```
# Database access (admin/dev)
Navicat (Mac)
    │
    ▼
cloudflared (Mac) — run manually
    │
    ▼
Cloudflare Tunnel (TCP)
    │
    ▼
cloudflared (VPS, systemd)
    │
    ▼
Postgres container (127.0.0.1:5432)


# Web traffic (future)
Browser / Internet
    │
    ▼
Cloudflare Tunnel (HTTP)
    │
    ▼
Nginx container (port 80/443)
    │
    ▼
Next.js container (port 3000)
    │
    ▼
Postgres container (internal Docker network)
```

---

## Next.js Deployment (Future)

### 1. Create app folder

```bash
mkdir -p ~/mactodocs/app
# copy your Next.js project into ~/mactodocs/app/
```

### 2. Add to next.config.js

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
};

module.exports = nextConfig;
```

### 3. Create Dockerfile

```dockerfile
# ~/mactodocs/app/Dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

### 4. Nginx config

```nginx
# ~/mactodocs/nginx/conf.d/app.conf
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://nextjs:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 5. Deploy

```bash
cd ~/mactodocs
docker compose up -d --build
```

### 6. Add web domain to Cloudflare Tunnel

In Cloudflare Dashboard → Tunnel → Public Hostname:

| Field     | Value                  |
| --------- | ---------------------- |
| Subdomain | `www` (or your choice) |
| Domain    | your domain            |
| Type      | HTTP                   |
| URL       | `localhost:80`         |

---

## Remaining Tasks

- [ ] Build Next.js app with `Dockerfile`
- [ ] Add `nextjs` service to `docker-compose.yml`
- [ ] Write Nginx config for Next.js proxy
- [ ] Add web domain to Cloudflare Tunnel dashboard
- [ ] Set up SSL with Let's Encrypt (Certbot)
