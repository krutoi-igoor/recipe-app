#!/usr/bin/env bash
set -euo pipefail

# Bootstrap server with Node.js, npm, and PM2 for the recipe app
# Usage: bash server-bootstrap.sh

if [[ $(id -u) -ne 0 ]]; then
  echo "Please run as root (use sudo)." >&2
  exit 1
fi

apt update
apt install -y curl ca-certificates gnupg build-essential git

# Install NodeSource (LTS) and npm
if ! command -v node >/dev/null 2>&1; then
  # Use NodeSource setup for current LTS
  curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
  apt install -y nodejs
fi

# Ensure npm is available
if ! command -v npm >/dev/null 2>&1; then
  apt install -y npm
fi

# Install PM2 globally
if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

# Optional: set up PM2 to start on boot for user 'alex'
if command -v pm2 >/dev/null 2>&1; then
  pm2 startup systemd -u alex --hp /home/alex >/tmp/pm2-startup.log
  echo "PM2 startup configured. Log: /tmp/pm2-startup.log"
fi

echo "Bootstrap complete. Versions:"
node -v || true
npm -v || true
pm2 -v || true
