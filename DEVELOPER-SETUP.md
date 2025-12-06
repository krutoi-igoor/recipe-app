# Running Recipe App Locally

## Prerequisites
- **Podman** (or Docker)
- **Node.js 20+**

## Setup with Podman Compose

1. Copy `.env.example` → `.env` and update secrets if needed.
2. Run the stack:
   ```bash
   podman-compose up -d
   ```
   This brings up:
   - PostgreSQL (port 5432)
   - Redis (port 6379)
   - Backend (port 3000, or mapped port 3001)
   - Frontend (port 5174 → container 5173)

3. Visit `http://localhost:5174` to access the app.

## Setup without Compose (manual)

### 1. Database & Cache
```bash
podman run -d --name recipe-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=recipe_app -p 5432:5432 postgres:16-alpine
podman run -d --name recipe-redis -p 6379:6379 redis:7-alpine
```

### 2. Backend
```bash
cd backend
npm install
PRISMA_CLI_BINARY_TARGETS=debian-openssl-3.0.x npx prisma migrate deploy
npm run dev
```
Backend runs on `http://localhost:3000`.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

## Running Tests

### Backend API Tests
```bash
cd backend
npm install --save-dev jest supertest
npm test
```

### Frontend Component Tests
```bash
cd frontend
npm install --save-dev vitest @testing-library/react jsdom
npm test
```

## Environment Variables

See `.env.example` for all options. Key variables:
- `DATABASE_URL` – PostgreSQL connection string
- `REDIS_URL` – Redis connection URL
- `JWT_SECRET`, `JWT_REFRESH_SECRET` – signing secrets
- `VITE_API_BASE` – frontend API endpoint (default: `http://localhost:3000/api/v1`)

## Typical Development Workflow

1. Make changes to backend or frontend code.
2. Nodemon (backend) and Vite HMR (frontend) auto-reload.
3. Run tests: `npm test` in each service.
4. Check logs: `podman logs <container-name>` (if using Compose).

## Troubleshooting

- **Port already in use:** Change compose mappings or stop conflicting services.
- **Migration errors:** Run `npx prisma migrate deploy` in the backend container.
- **CORS issues:** Verify `VITE_API_BASE` matches the backend URL.
- **Token refresh fails:** Ensure JWT secrets are consistent between backend and frontend.

## Next Steps
- Add user profile/settings endpoint.
- Implement recipe edit/delete UI.
- Add image uploads for recipes.
- Integrate social/video URL import (hero feature).
