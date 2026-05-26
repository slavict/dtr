# Architecture Overview

## High-level

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│   Nginx     │────▶│   Django    │
│  (React)    │     │  (port 80)  │     │  (port 8000)│
└─────────────┘     └─────────────┘     └──────┬──────┘
       │                    │                  │
       │                    │                  ▼
       │                    │           ┌─────────────┐
       │                    │           │  PostgreSQL │
       │                    │           └─────────────┘
       │                    │
       │             (optional)
       │                    ▼
       │             ┌─────────────┐
       └────────────▶│  React dev  │
                     │  (port 3000)│
                     └─────────────┘
```

- **Production**: Browser → Nginx (:80) → React static + API proxy → Gunicorn/Django → PostgreSQL. See [PRODUCTION.md](PRODUCTION.md).
- **Development**: React dev server (3000) talks to Django (8000) directly; CORS is enabled on the backend.

## Backend (Django)

- **records** app: custom `User` model (email as USERNAME_FIELD), JWT via `user.token`; `Record` model with `owner` FK.
- **Auth**: Custom JWT backend (`records.backends.JWTAuthentication`) expecting `Authorization: Token <jwt>`; optional SimpleJWT routes for token refresh/verify.
- **Records API**: List/create filtered by `request.user`; update/delete only for owner; edit disabled when `work_order_finished` is true.
- **Serializers**: Set `owner` and `technician_name` from `request.user` on create/update; `technician_name` is read-only.

## Frontend (React)

- **Auth**: `AuthContext` holds token and user; token in `localStorage` and set on axios via `setAuthToken`.
- **Routing**: React Router; `/login`, `/register`, `/` (protected). Unauthenticated access to `/` redirects to `/login`.
- **Records**: Home shows list and “Add record”; list rows have Edit (if not finished) and Delete. Forms use Formik + Yup; API calls use the shared axios instance (with auth header).

## Data flow (typical)

1. User registers or logs in → backend returns JWT and user info → frontend stores in context and `localStorage`, sets `Authorization` on axios.
2. User opens Home → `GET /api/records/` with auth → backend returns only that user’s records.
3. User adds/edits record → form submits to `POST` or `PUT /api/records/...` with auth → backend sets `owner` and `technician_name`; list is refreshed.
