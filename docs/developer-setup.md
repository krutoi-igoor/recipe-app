# Recipe App - Developer Setup Guide

**Version:** 1.0  
**Last Updated:** December 5, 2025  
**Audience:** Solo developer  
**Stack:** React 18, Node/Express, PostgreSQL, Redis, nginx (for prod)

---

## 1) Prerequisites
- Node.js 20 LTS (nvm recommended)
- npm 10+ (ships with Node 20)
- Git
- Docker Desktop (for local Postgres/Redis via compose)
- VS Code (recommended) with extensions: ESLint, Prettier, Prisma, GitLens, vscode-icons
- Optional: pgAdmin or TablePlus for DB, Postman/Insomnia for API

---

## 2) Repository Structure (planned)
```
recipe-app/
├── frontend/           # React app
├── backend/            # Express API
├── static/             # Built frontend (deployed)
├── uploads/            # User-uploaded images (dev/prod)
├── scripts/            # Utility scripts
├── .env.example        # Root env template
└── docs/               # Planning docs (current files)
```

---

## 3) Environment Variables
Create `.env` files based on examples. Do **not** commit secrets.

**Root `.env.example`:**
```
# Shared
NODE_ENV=development
PORT=3000

# Backend
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/recipe_app
REDIS_URL=redis://localhost:6379
JWT_SECRET=replace_me
JWT_REFRESH_SECRET=replace_me_refresh
AI_PROVIDER=openai
OPENAI_API_KEY=replace_me
SMTP_URL=smtp://user:pass@smtp.example.com:587

# Frontend
VITE_API_BASE=http://localhost:3000/api/v1
```

---

## 4) Local Services via Docker Compose
Create `docker-compose.yml` in project root:
```yaml
version: '3.9'
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: recipe_app
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  db_data:
```
Run: `docker compose up -d`

---

## 5) Backend Setup (Express + Prisma)
```
cd backend
npm ci
npm run lint        # optional
npm run prisma:generate
npm run prisma:migrate:dev  # or npm run migrate
npm run dev         # starts on :3000
```
Common scripts (suggested for package.json):
```
"scripts": {
  "dev": "nodemon src/server.js",
  "lint": "eslint .",
  "test": "jest",
  "migrate": "prisma migrate deploy",
  "prisma:generate": "prisma generate",
  "prisma:migrate:dev": "prisma migrate dev"
}
```

---

## 6) Frontend Setup (React + Vite)
```
cd frontend
npm ci
npm run lint        # optional
npm run dev         # starts on :5173
```
Suggested `scripts`:
```
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint .",
  "test": "vitest"
}
```

### Vite Proxy (dev)
Add to `vite.config.ts` to proxy API:
```ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false
    }
  }
}
```

---

## 7) Running Full Stack Locally
- Start DB/Redis: `docker compose up -d`
- Start backend: `npm run dev` in `backend`
- Start frontend: `npm run dev` in `frontend`
- Visit `http://localhost:5173`

---

## 8) Code Quality & Git Workflow
- Branch naming: `feature/<desc>`, `bugfix/<desc>`, `chore/<desc>`
- Commit style: Conventional Commits (e.g., `feat: add recipe import endpoint`)
- Pre-commit: Run lint + tests for touched packages if feasible.
- PR checklist (even solo): description, screenshots (UI), test evidence.
- Main branch protection (self-discipline): require CI green before merge.

---

## 9) Debugging Tips
- Backend: use VS Code launch config to attach to Node (inspect). Add breakpoints in controllers/services.
- Frontend: React DevTools + Redux/Zustand devtools; network tab for API calls.
- Database: enable Prisma query logging when needed (`PRISMA_LOG_QUERIES=true`).
- Logs: check backend console, nginx/error logs (prod), PM2 logs in `/var/www/recipe-app/logs/`.

---

## 10) Sample VS Code Settings
Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": ["javascript", "typescript", "typescriptreact"],
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.turbo": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

---

## 11) Production Deployment (recap)
- Build frontend: `cd frontend && npm run build`; copy to `static/`.
- Run DB migrations: `cd backend && npm run migrate`.
- Restart app: `pm2 restart recipe-app`.
- nginx proxies `/api` to Node on :3000 and serves `/static`.

---

## 12) Backups & Secrets
- Keep `.env` out of git; store a copy in a password manager.
- Backup DB regularly (see `hosting-platform.md`).
- Consider age/GPG for secret files if sharing.

---

## 13) Common Commands
- `docker compose up -d` — start services
- `docker compose down` — stop services
- `npm test` — run tests (per package)
- `npm run lint` — run linters
- `pm2 logs recipe-app` — view prod logs
- `pm2 restart recipe-app` — restart prod app

---

**Status:** Ready for implementation
