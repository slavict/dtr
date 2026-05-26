# Dental Tech Register (DTR)

Web application for managing work-order records. Technicians can register, log in, and maintain their own records (description, work started/finished dates, completion status). Built with a Django REST backend and a React (MUI) frontend, orchestrated with Docker.

---

## Table of contents

- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick start (Docker)](#quick-start-docker)
- [Environment variables](#environment-variables)
- [Backend (Django)](#backend-django)
- [Frontend (React)](#frontend-react)
- [API reference](#api-reference)
- [Testing](#testing)
- [Scripts and useful commands](#scripts-and-useful-commands)
- [Further documentation](#further-documentation)

---

## Tech stack

| Layer        | Technology |
|-------------|------------|
| Backend     | Django 4.x, Django REST Framework, JWT auth (custom + SimpleJWT), PostgreSQL |
| Frontend    | React 18, Material UI (MUI), React Router, Formik, Yup, Axios |
| Infrastructure | Docker, Docker Compose, Nginx |

---

## Project structure

```
ProjectDTR/
├── docker-compose.yml    # Orchestrates all services
├── .env                  # Environment variables (create from .env.example if needed)
├── README.md             # This file
├── TESTING.md            # How to run tests
├── django/
│   └── django_project/   # Django app
│       ├── manage.py
│       ├── requirements.txt
│       ├── Dockerfile
│       ├── django_project/  # Project settings, urls
│       └── records/         # Main app: User, Record models, API views, serializers
├── reactapp/             # React SPA
│   ├── package.json
│   ├── dockerfile
│   └── src/
│       ├── api/          # Axios instance, API base URL, setAuthToken
│       ├── context/      # AuthContext (token, user, login, logout)
│       ├── components/
│       │   ├── app/      # App root, routing
│       │   ├── appHeader/
│       │   ├── appHome/   # Record list + “Add record”
│       │   ├── appListRecords/
│       │   ├── appModalRecord/  # Edit / Add record modal
│       │   ├── appRecordForm/   # Form (Formik + Yup)
│       │   ├── appRemoveRecord/
│       │   └── auth/     # Login, Register, ProtectedRoute
│       └── index.js
└── nginx/                # Nginx config and Dockerfile
```

---

## Prerequisites

- Docker and Docker Compose
- (Optional) Node 18+ and Python 3.10+ for local dev without Docker

---

## Quick start (Docker)

1. **Clone and enter the project**
   ```bash
   git clone <repo-url>
   cd ProjectDTR
   ```

2. **Create `.env`** in the project root (see [Environment variables](#environment-variables)):
   ```bash
   SECRET_KEY=your-secret-key
   DEBUG=1
   POSTGRES_ENGINE=django.db.backends.postgresql
   POSTGRES_DB=django_db
   POSTGRES_USER=admin
   POSTGRES_PASSWORD=strong_password
   POSTGRES_HOST=postgres
   POSTGRES_PORT=5432
   ```

3. **Make entrypoint executable (if needed)**
   ```bash
   chmod +x django/django_project/entrypoint.sh
   ```

4. **Start services**
   ```bash
   docker-compose up -d
   ```

5. **Apply migrations (first time or after model changes)**
   ```bash
   docker-compose exec django python manage.py migrate
   ```

6. **Open the app**
   - Frontend (dev): **http://localhost:3000**
   - Backend API: **http://localhost:8000** (or via Nginx on port 8000, depending on setup)

---

## Environment variables

Used by the **Django** service (and optionally by the frontend for API URL). Create a `.env` file in the project root.

| Variable | Description | Example |
|----------|-------------|--------|
| `SECRET_KEY` | Django secret key | (long random string) |
| `DEBUG` | Django debug mode (0/1) | `1` |
| `POSTGRES_ENGINE` | DB engine | `django.db.backends.postgresql` |
| `POSTGRES_DB` | Database name | `django_db` |
| `POSTGRES_USER` | DB user | `admin` |
| `POSTGRES_PASSWORD` | DB password | `strong_password` |
| `POSTGRES_HOST` | DB host (use service name in Docker) | `postgres` |
| `POSTGRES_PORT` | DB port | `5432` |

---

## Backend (Django)

### Models

- **User** (custom auth): `email`, `username`, `password`; JWT via `user.token`.
- **Record**: `owner` (FK to User), `technician_name` (set from logged-in user), `work_order_finished`, `description`, `work_started_at`, `work_finished_at`.

### Main behaviour

- Records are **per user**: list/create/update/delete are scoped by `request.user`.
- **Technician name** is read-only and set from the authenticated user on create/update.
- **Finished** records cannot be edited (API returns 403).

### Running Django locally (no Docker)

```bash
cd django/django_project
python -m venv venv
source venv/bin/activate   # or venv\Scripts\activate on Windows
pip install -r requirements.txt
# Set env vars, then:
python manage.py migrate
python manage.py runserver
```

---

## Frontend (React)

### Features

- **Auth**: Login and Register pages; JWT stored in `localStorage` and sent as `Authorization: Token <token>`.
- **Protected routes**: Home (record list) requires authentication; otherwise redirect to `/login`.
- **Records**: List, add, edit (only if not finished), delete; technician name is read-only and comes from the logged-in user.

### Routing

| Path | Description |
|------|-------------|
| `/login` | Login form |
| `/register` | Registration form |
| `/` | Protected: record list + “Add record” |

### Config (API URL)

- API base URL and records endpoint are in `reactapp/src/api/axios.js` (`API_BASE_URL`, `RECORDS_API`). Adjust for your backend (e.g. when using Nginx or another host/port).

### Running React locally (no Docker)

```bash
cd reactapp
npm install
npm start
```

---

## API reference

Base URL: `http://127.0.0.1:8000` (or your backend URL).

### Authentication

- **Register**  
  `POST /users/`  
  Body: `{ "user": { "email", "username", "password" } }`  
  Returns: `{ "user": { "email", "username", "token" } }`.

- **Login**  
  `POST /users/login/`  
  Body: `{ "user": { "email", "password" } }`  
  Returns: `{ "user": { "email", "username", "token" } }`.

- **Authenticated requests**  
  Header: `Authorization: Token <jwt>`.

### Records

- **List (own records)**  
  `GET /api/records/`  
  Auth required. Returns array of records for the current user.

- **Create**  
  `POST /api/records/`  
  Auth required. Body: `{ "description", "work_order_finished", "work_started_at?", "work_finished_at?" }`.  
  `technician_name` and `owner` are set on the server.

- **Update**  
  `PUT /api/records/<id>`  
  Auth required; only owner; 403 if record is finished. Body: same fields as create (partial allowed).

- **Delete**  
  `DELETE /api/records/<id>`  
  Auth required; only owner.

### Other

- **User profile**  
  `GET /user`, `PUT /user` (auth required).
- **JWT (SimpleJWT)**  
  `POST /api/token/`, `POST /api/token/refresh/`, `POST /api/token/verify/`.

---

## Testing

- **Backend**: `docker-compose run --rm django python manage.py test records`
- **Frontend**: `docker-compose run --rm node npm test -- --watchAll=false`

See **[TESTING.md](TESTING.md)** for details and troubleshooting (e.g. `react-router-dom` in Docker, rebuilding the Node image).

---

## Scripts and useful commands

| Task | Command |
|------|--------|
| Start all services | `docker-compose up -d` |
| Stop all | `docker-compose down` |
| View logs | `docker-compose logs -f [django|node|postgres|nginx]` |
| Django shell | `docker-compose exec django python manage.py shell` |
| Create superuser | `docker-compose exec django python manage.py createsuperuser` |
| Migrations | `docker-compose exec django python manage.py makemigrations` then `migrate` |
| Backend tests | `docker-compose run --rm django python manage.py test records` |
| Frontend tests | `docker-compose run --rm node npm test -- --watchAll=false` |
| Rebuild images | `docker-compose build` |

---

## Further documentation

- **[docs/API.md](docs/API.md)** – API reference (auth, records, errors).
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** – High-level architecture and data flow.
- **[TESTING.md](TESTING.md)** – Running backend and frontend tests (including Docker).

---

## License and references

- Original idea/reference: [Habr article](https://habr.com/ru/post/713490/) (React + Django + Postgres + Nginx in Docker).
