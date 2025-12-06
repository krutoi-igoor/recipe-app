# Development Log (Chronological)

> Purpose: running log of incremental changes for future story/blog. Timestamps in UTC.

- 2025-12-06 04:26 UTC — Initial commit: planning docs and scaffolds (b089a58).
- 2025-12-06 05:53 UTC — Updated docs to reference podman for local development (71f6237).
- 2025-12-06 06:28 UTC — Added auth + recipe CRUD scaffolding with Prisma (609b762).
- 2025-12-06 06:34 UTC — Added auth /me endpoint and initial Prisma migration (81160ac).
- 2025-12-06 07:33 UTC — Frontend auth UI and recipe flow (497b334).
- 2025-12-06 07:43 UTC — UX polish, token refresh, testing, and dev docs (b77d79e).
- 2025-12-06 07:54 UTC — Phase 2 feature bundle: recipe edit/delete, meal planning, shopping list, collections (fe7bf76).
- 2025-12-06 07:55 UTC — Docs: Phase 2 API endpoints (1619008).
- 2025-12-06 07:57 UTC — Docs: Phase 2 comprehensive testing guide (7e380c5).
- 2025-12-06 07:58 UTC — Docs: Phase 2 implementation summary (1cc2e4f).
- 2025-12-06 07:59 UTC — Docs: Phase 2 visual workflow guide (af15c96).
- 2025-12-06 08:00 UTC — Docs: Phase 2 status report (7149231).
- 2025-12-06 08:01 UTC — Docs: Phase 2 quickstart guide (5cfc55f).
- 2025-12-06 08:02 UTC — Docs: Improved Phase 2 status table alignment (1dc32ca).
- 2025-12-06 09:30 UTC — Cleaned podman state in WSL (podman-machine-default), fixed port conflicts (5432/6379/3000/5174), confirmed services via podman-compose.
- 2025-12-06 09:50 UTC — Applied Prisma migration adding MealPlan/Collection/CollectionRecipe and Recipe.imageUrl columns.
- 2025-12-06 10:10 UTC — Fixed auth middleware to use JWT payload `{ userId, email }`; updated controllers to read `req.user.userId` for recipes/meal plans/collections.
- 2025-12-06 10:25 UTC — Resolved “Invalid refresh token” UX on load by silently clearing stale tokens in `fetchMe()`.
- 2025-12-06 10:40 UTC — End-to-end API verification (register, recipe create, meal plan, collection add, shopping list) via `test-simple.sh` — PASS.
- 2025-12-06 11:00 UTC — Documentation re-org: moved Phase 2 docs into `project-status/`; added Phase 1 status doc; centralized test scripts into `test-scripts/`.
- 2025-12-06 11:20 UTC — Frontend guards for adding recipe to collection (enforce collection + recipe selection; clearer error messaging).
- 2025-12-06 12:05 UTC — Restructured `project-status/` into `phase-1/` and `phase-2/` subdirectories; updated README to point to new doc locations.
