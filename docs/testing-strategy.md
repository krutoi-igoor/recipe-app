# Recipe App - Testing Strategy

**Version:** 1.0  
**Last Updated:** December 5, 2025  
**Owner:** Solo developer  
**Scope:** Full-stack web app (React + Node/Express + PostgreSQL + Redis)

---

## 1) Goals & Principles
- Catch regressions early; keep change velocity high for solo dev.
- Focus on high-value paths: auth, recipe CRUD, import flows, meal plans, shopping lists.
- Prefer fast, deterministic tests; minimize flaky network/UI dependencies.
- Shift-left: validation, types, and linting before runtime.
- Keep CI under 10 minutes on main branch.

---

## 2) Test Types & Ownership
- **Unit (backend):** Services, utils, validators. Framework: Jest. Target coverage: 80%+ per service folder.
- **Unit (frontend):** Pure components, hooks, utilities. Framework: Jest + React Testing Library (RTL). Target coverage: 80% lines/branches on `src/components` and `src/hooks`.
- **Integration (backend):** Express routes with Supertest hitting an ephemeral Postgres (Testcontainers) + Redis. Validate controllers + services + DB interactions.
- **Component/Integration (frontend):** RTL with mocked network (MSW). Validate page-level rendering, routing, and key interactions.
- **End-to-End (E2E):** Playwright or Cypress. Cover happy paths and a few edge cases; run headless in CI on a seeded DB snapshot.
- **Contract Tests:** Align with `api-specification.md` using OpenAPI schema validation on responses (Dredd or Schemathesis optional).
- **Performance/Load (targeted):** k6 or Artillery for recipe search, imports, and shopping list generation (periodic, not on every CI run).
- **Security/Linting:** ESLint, Prettier, npm audit. Optional: Snyk/Trivy if added later.

---

## 3) Environments & Data
- **Local:** Dev stack via podman-compose; use seeded fixtures for repeatable runs.
- **Test (CI):** Spin ephemeral Postgres/Redis via podman-compose or Testcontainers. No external network calls; mock AI/OCR.
- **Prod:** No tests in prod; use `/health` and logging/alerts.

### Seed Data (minimum viable)
- Users: 2 accounts (owner, secondary)
- Recipes: 10 diverse recipes with tags
- Meal plans: 1 week populated
- Shopping lists: 2 lists with items

---

## 4) Tooling & Libraries
- **Backend:** Jest, Supertest, Testcontainers, ts-jest (if TS), sinon (mocking), faker.js.
- **Frontend:** Jest, React Testing Library, MSW (mock HTTP), user-event, axe-core (a11y checks).
- **E2E:** Playwright (preferred) or Cypress. Use `@playwright/test` fixtures.
- **Coverage:** `jest --coverage`; enforce thresholds in config.
- **Lint/Format:** ESLint + Prettier; run pre-commit.
- **CI:** GitHub Actions workflow (sample below).

---

## 5) What to Test (Happy Paths First)
- **Auth:** login, register, logout, token refresh, protected route access.
- **Recipes:** create/update/delete, list with filters, view detail, tag filtering, search.
- **Imports:** URL import success, bad URL handling, timeout path, file upload validation.
- **Meal Planner:** create meal plan entries, drag/drop moves, date range fetch, conflict handling.
- **Shopping Lists:** generation from meal plan, item check/uncheck, quantity aggregation.
- **Collections/Tags:** create collection, add/remove recipe, filter by tag.
- **Profile/Settings:** password change, preference updates.
- **Error Paths:** validation errors return 422 with details; 401/403 on auth failures; 404 for missing IDs.
- **Accessibility:** key pages pass axe checks (no critical violations).

---

## 6) Minimal E2E Suite (Playwright)
1. Register + login + persist session.
2. Create recipe and see it in list and detail.
3. Import recipe via URL (mock import service response).
4. Plan meals for a week and generate shopping list; verify aggregated items.
5. Basic search + filter (tags/cuisine) returns expected recipe.
6. Logout and verify protected routes redirect.

---

## 7) Backend Test Harness (Node/Express)
- Use **Testcontainers** for Postgres + Redis in integration tests.
- Run migrations before tests; seed fixtures.
- Clear Redis between tests.
- Mock external services (AI/OCR, email) with jest.fn or nock/MSW for node.

**Example integration setup (pseudo):**
```javascript
import { StartedTestContainer, PostgreSqlContainer, RedisContainer } from 'testcontainers';
import request from 'supertest';
import app from '../src/app';

let pg; let redis;

beforeAll(async () => {
  pg = await new PostgreSqlContainer('postgres:16-alpine').withDatabase('testdb').start();
  redis = await new RedisContainer().start();
  process.env.DATABASE_URL = pg.getConnectionUri();
  process.env.REDIS_URL = `redis://${redis.getHost()}:${redis.getPort()}`;
  await runMigrations();
  await seedFixtures();
});

afterAll(async () => {
  await pg.stop();
  await redis.stop();
});

describe('POST /api/v1/recipes', () => {
  it('creates a recipe', async () => {
    const res = await request(app)
      .post('/api/v1/recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Soup', ingredients: [...], instructions: [...] });
    expect(res.status).toBe(201);
    expect(res.body.data.recipe.title).toBe('Soup');
  });
});
```

---

## 8) Frontend Test Harness (React)
- Use **MSW** to mock API calls; no real network in tests.
- Use **React Testing Library** with `user-event` for realistic interactions.
- Use **jest-axe** or **axe-core** for accessibility smoke tests on key pages.
- Snapshot tests only for stable, small components (icons), not dynamic views.

**Example page test (pseudo):**
```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../App';
import { server } from '../test/msw-server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('user can create recipe', async () => {
  render(<App />);
  await userEvent.click(screen.getByText(/new recipe/i));
  await userEvent.type(screen.getByLabelText(/title/i), 'Soup');
  await userEvent.click(screen.getByRole('button', { name: /save/i }));
  expect(await screen.findByText('Soup')).toBeInTheDocument();
});
```

---

## 9) Coverage Targets & Gates
- Backend: 80% lines/branches on services, controllers, utils.
- Frontend: 80% lines/branches on components, hooks.
- Exclude: index files, generated clients, config stubs.
- Enforce via Jest config `coverageThreshold`.

---

## 10) CI/CD Workflow (GitHub Actions Example)
```yaml
name: ci

on:
  pull_request:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: recipe_app_test
        ports: [5432:5432]
        options: >-
          --health-cmd "pg_isready -U postgres" \
          --health-interval 10s \
          --health-timeout 5s \
          --health-retries 5
      redis:
        image: redis:7-alpine
        ports: [6379:6379]

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install backend deps
        run: cd backend && npm ci
      - name: Install frontend deps
        run: cd frontend && npm ci
      - name: Lint
        run: npm run lint --workspaces
      - name: Backend tests
        run: cd backend && npm test -- --runInBand
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/recipe_app_test
          REDIS_URL: redis://localhost:6379
      - name: Frontend tests
        run: cd frontend && npm test -- --runInBand
      - name: Upload coverage
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage
```

---

## 11) Performance & Load (Periodic)
- Tool: k6 or Artillery.
- Scenarios: search endpoint, recipe import, shopping list generation.
- Run monthly or before major releases; not every PR.
- Track p95 latency and error rate.

---

## 12) Quality Gates & Definition of Done
- Lint passes.
- Unit + integration tests pass locally.
- E2E suite passes on main.
- Coverage >= 80% on critical modules.
- No high-severity vulnerabilities from npm audit.
- Manual sanity check on staging build (if available).

---

## 13) Test Data & Fixtures Management
- Keep fixtures small and reusable; store under `tests/fixtures`.
- Use factory helpers to generate data (e.g., `makeRecipe()`).
- Reset DB/Redis between test suites.
- For E2E, load a known seed via migration or SQL script.

---

## 14) Logging & Diagnostics in Tests
- Use structured logs in app (JSON) and keep them minimal in tests.
- On failure, dump response bodies for API tests.
- Capture Playwright traces and videos for failed E2E tests; upload as artifacts in CI.

---

## 15) Risk-Based Focus Areas
- Import pipeline (HTML parsing, AI/OCR): mock external calls; ensure timeout handling.
- Auth/session security: token expiry, logout invalidation, rate limiting on auth routes.
- Data consistency: cascading deletes for recipes in collections/meal plans.
- Concurrency: shopping list aggregation; ensure transactions.
- Accessibility: prevent regressions on critical flows.

---

## 16) Maintenance Plan
- Review test suite quarterly; prune slow/flaky tests.
- Keep fixtures synced with schema changes.
- Update CI images and Node versions annually.
- Track coverage trends; avoid blanket `/* istanbul ignore */`.

---

**Status:** Ready for implementation
