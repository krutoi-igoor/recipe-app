# CI/CD Setup Notes

Use this when wiring GitHub Actions to the Ubuntu host.

## Required secrets (GitHub repo)
- `DEPLOY_HOST`: host/IP (e.g., 192.168.2.31)
- `DEPLOY_USER`: SSH user (e.g., alex)
- `DEPLOY_PATH`: absolute path (e.g., /var/www/recipe-app)
- `DEPLOY_SSH_KEY`: private key for `DEPLOY_USER` (PEM; add as multi-line secret)
- `DEPLOY_KNOWN_HOSTS`: output of `ssh-keyscan -H 192.168.2.31`

## Server prerequisites
- Node.js 20.x and npm
- PM2 installed globally (`npm install -g pm2`)
- Directories present: `/var/www/recipe-app/static` (for frontend build), `/var/www/recipe-app/backend`, `/var/www/recipe-app/frontend`
- nginx already configured to serve `/static` and proxy API to port 3000

## Workflow usage
- Trigger: `workflow_dispatch` on branch `main` after tests pass
- Steps performed:
  1) Install backend deps (prod) locally in the runner
  2) Install frontend deps and build locally in the runner
  3) `rsync` repo to `$DEPLOY_PATH` (excludes `.git` and `node_modules`)
  4) Remote: `npm ci --omit=dev` in backend, restart PM2 service `recipe-app`
  5) Remote: `npm ci` in frontend, build, and copy `dist` into `$DEPLOY_PATH/static`

## First-run checklist
- Verify SSH key works: `ssh -i key alex@192.168.2.31 'echo ok'`
- Seed `known_hosts`: `ssh-keyscan -H 192.168.2.31`
- Ensure PM2 has a process name `recipe-app` or allow it to start via workflow
- Ensure `.env` is present on the server under `$DEPLOY_PATH/backend/.env`

## Safety notes
- Runner does not include DB migrations; run manually or add a migration step when ready
- Deploy job only runs on `workflow_dispatch` to avoid accidental pushes to server
