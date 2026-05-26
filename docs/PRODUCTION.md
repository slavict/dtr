# Production environment

This guide explains how to run **ProjectDTR** in production with Docker. The default `docker-compose.yml` is for **development** (Django `runserver`, React dev server on port 3000, source code mounted into containers). Production uses a separate compose file and stricter settings.

---

## Development vs production

| | Development (`docker-compose.yml`) | Production (`docker-compose.prod.yml`) |
|---|-----------------------------------|----------------------------------------|
| Django server | `runserver` | **Gunicorn** (3 workers) |
| React | Dev server on port **3000** | **Static build** served by Nginx |
| Public entrypoint | Nginx **8000** (API) + React **3000** | Nginx **80** (UI + API) |
| `DEBUG` | `1` | **`0`** |
| Code volumes | Mounted for live reload | **Not** mounted (image only) |
| `node` service | Yes | **No** |

---

## Prerequisites

- Docker and Docker Compose
- A `.env` file configured for production (see below)
- `chmod +x django/django_project/entrypoint.sh`

---

## 1. Configure environment

Copy the example file and edit values (especially secrets and hosts):

```bash
cp .env.production.example .env
```

| Variable | Production value | Notes |
|----------|------------------|--------|
| `SECRET_KEY` | Long random string | **Required.** Never commit real keys. |
| `DEBUG` | `0` | Disables Django debug pages. |
| `ALLOWED_HOSTS` | Your domain(s) | Comma-separated; see [Django docs](https://docs.djangoproject.com/en/4.1/ref/settings/#allowed-hosts). |
| `POSTGRES_*` | Strong credentials | Use secrets management in real deployments. |
| `DATABASE` | `postgres` | Enables DB wait in `entrypoint.sh`. |
| `REACT_APP_API_BASE_URL` | Empty or full URL | Empty = same origin (browser calls Nginx on port 80). Set `https://api.example.com` if the API is on another host. |

**Security checklist**

- Do not use development passwords or `SECRET_KEY` from the repo.
- Restrict `ALLOWED_HOSTS` to real hostnames (avoid `*` in production).
- Put TLS termination in front of Nginx (reverse proxy, load balancer, or Certbot).

---

## 2. Build and start production stack

From the project root:

```bash
chmod +x django/django_project/entrypoint.sh

docker compose -f docker-compose.prod.yml build

docker compose -f docker-compose.prod.yml up -d
```

On first start, the Django entrypoint runs migrations automatically.

Open the app at **http://localhost:8888** (Nginx maps host port **8888** → container port 80). All API routes (`/users/`, `/api/records/`, etc.) and the React UI are served through Nginx.

---

## 3. Collect static files (Django admin / DRF)

After the stack is up, run once (and after upgrades that change static assets):

```bash
docker compose -f docker-compose.prod.yml exec django python manage.py collectstatic --noinput
```

Static files are written to the `django_static_volume` shared with Nginx.

---

## 4. Create an admin user (optional)

```bash
docker compose -f docker-compose.prod.yml exec django python manage.py createsuperuser
```

---

## Useful production commands

| Task | Command |
|------|---------|
| View logs | `docker compose -f docker-compose.prod.yml logs -f` |
| Stop stack | `docker compose -f docker-compose.prod.yml down` |
| Rebuild after code changes | `docker compose -f docker-compose.prod.yml build --no-cache && docker compose -f docker-compose.prod.yml up -d` |
| Django admin | **http://localhost:8888/admin/** (requires superuser; run `collectstatic` for styling) |
| Django shell | `docker compose -f docker-compose.prod.yml exec django python manage.py shell` |
| Run backend tests | `docker compose -f docker-compose.prod.yml run --rm django python manage.py test records` |
| Apply new migrations | `docker compose -f docker-compose.prod.yml exec django python manage.py migrate` |

---

## Architecture (production)

```
Browser
   │
   ▼
Nginx :8888 ──►  /, /static/js|css → React build; other /static → Django
           ──►  /api/*, /users/* → Gunicorn (Django) :8000
                                    │
                                    ▼
                              PostgreSQL
```

The production Nginx config is `nginx/nginx.prod.conf`. The image is built from `nginx/Dockerfile.prod`, which builds the React app and copies it into the Nginx image.

---

## API base URL for the frontend

`reactapp/src/api/axios.js` uses:

```text
REACT_APP_API_BASE_URL  (build-time, optional)
NODE_ENV=production     →  same-origin (relative URLs to port 8888)
NODE_ENV=development    →  http://127.0.0.1:8000
```

For the **Docker production** setup (single host on port **8888**), leave `REACT_APP_API_BASE_URL` **unset** in `.env` so the React build calls `/users/`, `/api/records/`, etc. on the same host. Do not rely on `||` with an empty string — that incorrectly falls back to port 8000.

If the API is hosted elsewhere, set it when building:

```bash
REACT_APP_API_BASE_URL=https://api.example.com docker compose -f docker-compose.prod.yml build nginx
```

---

## HTTPS (recommended)

This compose file exposes plain HTTP on port 80. In production you should terminate TLS in front of Nginx, for example:

- A cloud load balancer (ALB, etc.) with HTTPS → Nginx :80
- A host-level reverse proxy (Caddy, Traefik) with automatic certificates
- Certbot + Nginx on the same machine

Ensure `ALLOWED_HOSTS` and any `CSRF_TRUSTED_ORIGINS` in Django settings include your HTTPS domain.

---

## Troubleshooting

| Problem | What to check |
|---------|----------------|
| `502 Bad Gateway` from Nginx | `docker compose -f docker-compose.prod.yml logs django` — Gunicorn may have crashed; verify `.env` and Postgres. |
| Blank page (HTML loads, no UI) | React JS/CSS blocked by Django `/static/` — rebuild Nginx after `nginx.prod.conf` fix; verify `curl -I http://localhost:8888/static/js/main.*.js` returns 200. |
| Blank page / wrong API host | Rebuild Nginx after changing `REACT_APP_API_BASE_URL`. |
| Django container restarting | `docker compose -f docker-compose.prod.yml logs django` — rebuild image after `requirements.txt` changes (`gunicorn`, `djangorestframework-simplejwt`). |
| Static files 404 (admin) | Run `collectstatic` (see step 3). |
| Database connection errors | `POSTGRES_HOST=postgres`, stack running, passwords match in `.env` and `postgres` service. |
| CORS errors | Production serves UI and API from the same origin; CORS is mainly relevant when React and API are on different hosts. |

---

## Switching back to development

```bash
docker compose -f docker-compose.prod.yml down
docker compose up -d
```

Use `DEBUG=1` in `.env` and the default `docker-compose.yml` for local development with hot reload.
