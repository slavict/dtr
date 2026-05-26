# API Reference

Base URL: `http://127.0.0.1:8000` (configurable via frontend `src/api/axios.js`).

All authenticated endpoints require header: `Authorization: Token <jwt>`.

---

## Auth

| Method | Endpoint        | Auth | Description                                                                                                                |
|--------|-----------------|------|----------------------------------------------------------------------------------------------------------------------------|
| POST   | `/users/`       | No   | Register. Body: `{ "user": { "email", "username", "password" } }`. Returns `{ "user": { "email", "username", "token" } }`. |
| POST   | `/users/login/` | No   | Login. Body: `{ "user": { "email", "password" } }`. Returns `{ "user": { "email", "username", "token" } }`.                |
| GET    | `/user`         | Yes  | Current user profile.                                                                                                      |
| PUT    | `/user`         | Yes  | Update profile. Body: `{ "user": { ... } }`.                                                                               |

---

## Records

Each user sees and can modify only their own records. `technician_name` is set by the server from the logged-in user.

| Method | Endpoint            | Auth | Description                                                                                               |
|--------|---------------------|------|-----------------------------------------------------------------------------------------------------------|
| GET    | `/api/records/`     | Yes  | List current user's records.                                                                              |
| POST   | `/api/records/`     | Yes  | Create record. Body: `{ "description", "work_order_finished", "work_started_at?", "work_finished_at?" }`. |
| PUT    | `/api/records/<id>` | Yes  | Update own record. 403 if record is finished. Partial body allowed.                                       |
| DELETE | `/api/records/<id>` | Yes  | Delete own record. 404 if not owner.                                                                      |

### Record payload

```json
{
    "pk": 1,
    "technician_name": "johndoe",
    "work_order_finished": false,
    "description": "Work description",
    "work_started_at": "2025-01-15",
    "work_finished_at": null
}
```

---

## JWT (SimpleJWT)

| Method | Endpoint              | Description                                                    |
|--------|-----------------------|----------------------------------------------------------------|
| POST   | `/api/token/`         | Obtain access/refresh tokens (alternative to `/users/login/`). |
| POST   | `/api/token/refresh/` | Refresh access token.                                          |
| POST   | `/api/token/verify/`  | Verify token.                                                  |

---

## Errors

- **401** – Missing or invalid auth (some endpoints may return **403** for unauthenticated requests).
- **403** – Forbidden (e.g. edit finished record, or unauthenticated on protected endpoint).
- **404** – Not found (e.g. record not found or not owned by current user).
