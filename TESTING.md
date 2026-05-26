# Running tests (Docker)

All services run in Docker. Run tests inside the corresponding containers.

## Django (backend)

Requires the `django` service and its dependencies (e.g. Postgres). Django creates a test database automatically.

```bash
# From project root
docker-compose run --rm django python manage.py test records
```

Run with verbose output:

```bash
docker-compose run --rm django python manage.py test records -v 2
```

## React (frontend)

Uses Jest and React Testing Library. No backend or browser required.

Tests live under `reactapp/src/tests/` (separate from app code; mirrors component layout). Shared mocks: `src/tests/utils/reactRouterMock.js`.

| Area | Test file |
|------|-----------|
| API errors | `src/tests/api/formatApiErrors.test.js` |
| Login / Register | `src/tests/components/auth/Login.test.js`, `Register.test.js` |
| Auth routing | `src/tests/components/auth/ProtectedRoute.test.js` |
| Auth context | `src/tests/context/AuthContext.test.js` |
| Records UI | `src/tests/components/appRecordForm/RecordForm.test.js`, `ListRecords.test.js` |
| App shell | `src/tests/components/app/App.test.js` |

**Ensure dependencies are installed** (e.g. `react-router-dom` and others in `package.json`):

```bash
cd reactapp && npm install
```

Then run tests:

```bash
# From project root (Docker)
docker-compose run --rm node npm test -- --watchAll=false
```

If you see "Cannot find module 'react-router-dom'", the Node image may have been built before that dependency was added. Rebuild so the container runs a fresh `npm install`:

```bash
docker-compose build node
docker-compose run --rm node npm test -- --watchAll=false
```

Or run tests locally (no Docker):

```bash
cd reactapp && npm install && npm test -- --watchAll=false
```

`--watchAll=false` runs the test suite once and exits (suitable for CI/Docker). Omit it for interactive watch mode locally.
