# Project Board Conventions

Use GitHub Projects (or equivalent) to track work. Columns and automation below keep flow consistent.

## Columns
- Backlog — newly triaged ideas and requests
- Ready — prioritized and sized, waiting to start
- In Progress — actively being worked
- Review — PRs opened and awaiting review/QA
- Blocked — requires decision/unblock; add note explaining why
- Done — merged/deployed/verified

## Labels
- Domains: `frontend`, `backend`, `devops`, `docs`
- Work type: `feature`, `bug`, `chore`, `spike`
- Priority: `priority:high`, `priority:medium`, `priority:low`
- Status helpers: `blocked`, `needs-design`, `needs-backend`, `needs-frontend`

## Automation
- New issues → Backlog
- Issues/PRs marked `blocked` → Blocked
- PR opened → Review; PR merged → Done
- Move to In Progress when first commit/branch created or work starts

## Templates
- Feature request: problem, proposal, acceptance criteria, dependencies
- Bug report: expected/actual, repro steps, environment, logs/screenshots
- Tech debt: context, risk if ignored, proposed fix, estimate

## Working Agreements
- Keep issues small (1-2 days of effort) and acceptance criteria explicit
- Link PRs to issues; reference board column transitions in PR description
- Keep Blocked items updated daily with next action and owner
