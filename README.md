# Recipe App

Main differentiator: **paste a social/video URL and get a clean, structured recipe** (ingredients, time-coded steps, yields, tags). Everything else supports that: search, planning, shopping lists, exports, and privacy.

## What the App Will Do
- **Social/video import (hero feature):** TikTok/IG/YouTube/Shorts URLs are fetched, transcribed, and converted into structured recipes. We pull captions/ASR, key frames, and descriptions to derive ingredients, timing, and steps. User reviews and saves.
- **Web URL import:** Extract recipes from blogs and standard sites, stripping ads/boilerplate.
- **Image/OCR import:** Photos/screenshots/handwritten cards → OCR → structured ingredients + instructions.
- **Manual create/edit:** Fast form for original recipes with notes and photos.
- **Auto-tagging + search:** AI tags cuisine/meal type/dietary flags; full-text search with filters.
- **Meal planning:** Drag recipes onto a weekly calendar.
- **Shopping lists:** Generate aggregated grocery lists from meal plans or selected recipes.
- **Collections & favorites:** Organize by custom collections and favorites.
- **Data ownership:** Export library (JSON/CSV), keep recipes private by default.

## How Social/Video Import Works (planned flow)
1) User pastes a social/video link.
2) Backend fetches media metadata, captions/transcript, description/comments when available.
3) AI extracts ingredients, quantities, units, and ordered steps; time-codes when possible.
4) User reviews/edits; we apply auto-tagging and save to the library.
5) Recipe can be added to meal plans and shopping lists immediately.

## Tech Stack (current scaffold)
- Frontend: React 18 + Vite
- Backend: Node.js/Express
- Data: PostgreSQL, Redis
- Infra (dev): Podman + podman-compose (db, redis, backend, frontend)

## Repo Structure
- `backend/` – Express API scaffold (health route in place)
- `frontend/` – React/Vite scaffold (calls backend health)
- `static/` – built frontend assets for deployment
- `uploads/` – user-uploaded images (local/dev)
- `scripts/` – helper scripts
- `docs/` – planning artifacts (API spec, design system, architecture, testing, hosting)

## Quick Start (local, dev)
1) Copy `.env.example` → `.env` and fill secrets.  
2) `podman-compose up -d` (starts Postgres, Redis, backend, frontend).  
3) Visit `http://localhost:5173` → should show frontend and hit backend health.  

Run services without Compose:
- Backend: `cd backend && npm ci && npm run dev`
- Frontend: `cd frontend && npm ci && npm run dev`

**Note:** We use **Podman** for containerized development (alternative to Docker). See `docs/developer-setup.md` for installation.

## Status
- Planning docs done (API, design system, architecture, testing, hosting, setup).
- Scaffolds running; core features to be implemented next with focus on social/video → recipe conversion.

See `developer-setup.md` and `testing-strategy.md` for deeper details.
