# Self-Hosted GitHub Actions Runner Setup

Since your Ubuntu server (192.168.2.31) is internal and unreachable from GitHub's public runners, use a self-hosted runner on your local network to execute the deploy job.

## Prerequisites
- Ubuntu 22.04+ (or Windows/macOS if preferred)
- GitHub personal access token (PAT) with `repo` + `admin:org_self_hosted_runner` scope
- SSH access to 192.168.2.31 from the runner machine
- Node.js 20+ and npm installed on the runner

## Installation (Ubuntu 22.04 example)

### 1. Create runner directory
```bash
mkdir -p ~/github-runner
cd ~/github-runner
```

### 2. Download and extract runner
```bash
# Get latest release (check https://github.com/actions/runner/releases)
RUNNER_VERSION=2.317.0
curl -o actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz \
  -L https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz
tar xzf actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz
```

### 3. Configure runner
```bash
# Navigate to repo on GitHub: Settings > Actions > Runners > New self-hosted runner
# Copy the configure command (e.g., ./config.sh --url https://github.com/krutoi-igoor/recipe-app --token ABC123...)
# Run it in ~/github-runner:

./config.sh --url https://github.com/krutoi-igoor/recipe-app --token <PAT>
```

When prompted:
- **Name**: something like `ubuntu-local-1`
- **Runnergroup**: leave default
- **Labels**: add `self-hosted,local` (optional)
- **Work folder**: press Enter (default `_work`)

### 4. Run as service (optional but recommended)
```bash
sudo ./svc.sh install
sudo ./svc.sh start
sudo ./svc.sh status
```

Or run in foreground for debugging:
```bash
./run.sh
```

### 5. Verify
Go to GitHub repo > Settings > Actions > Runners. You should see your runner listed as **Idle**.

## Alternative: Docker Container (Recommended for Isolation)

If running the runner in a container:

```dockerfile
# Dockerfile
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    curl \
    git \
    jq \
    build-essential \
    libssl-dev \
    libffi-dev \
    python3-dev \
    nodejs npm

WORKDIR /runner

RUN curl -o runner.tar.gz -L \
    https://github.com/actions/runner/releases/download/v2.317.0/actions-runner-linux-x64-2.317.0.tar.gz && \
    tar xzf runner.tar.gz && \
    rm runner.tar.gz

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
```

```bash
# entrypoint.sh
#!/bin/bash
set -e

RUNNER_NAME=${RUNNER_NAME:-ubuntu-local-runner}
REPO_URL=${REPO_URL:-https://github.com/krutoi-igoor/recipe-app}
PAT=${PAT}

if [ -z "$PAT" ]; then
  echo "Error: PAT environment variable not set"
  exit 1
fi

./config.sh --url "$REPO_URL" --token "$PAT" --name "$RUNNER_NAME" --unattended --replace

./run.sh
```

Run:
```bash
docker build -t github-runner .
docker run -d \
  -e PAT=<your-pat> \
  -e RUNNER_NAME=docker-runner-1 \
  -e REPO_URL=https://github.com/krutoi-igoor/recipe-app \
  --name gh-runner \
  github-runner
```

## Workflow Usage

Update `runs-on` in `.github/workflows/ci.yml`:

```yaml
# For the deploy job only (keep others on ubuntu-latest):
deploy-to-ubuntu-host:
  runs-on: [self-hosted, local]  # matches your runner labels
  # ... rest of job
```

Or for all jobs to use self-hosted:
```yaml
deploy-to-ubuntu-host:
  runs-on: self-hosted
  # ... rest of job
```

## Accessing Secrets on Self-Hosted Runner

Secrets work the same way. No special setup needed—GitHub injects them at runtime.

## Security Notes
- **Isolate the runner** from production (use a separate machine or container).
- **Rotate PAT regularly** and use least-privilege scopes.
- **Network security**: Ensure SSH key on the runner is protected; consider using GitHub's deployment keys if possible.
- **Keep runner updated**: Manually or via automation.

## Troubleshooting

### Runner doesn't connect
```bash
# Check logs in ~/github-runner/_diag/
cat _diag/Runner_*.log
```

### Deploy job still doesn't reach server
- Verify SSH works from runner: `ssh -i /path/to/key user@192.168.2.31 'echo ok'`
- Verify `DEPLOY_SSH_KEY` secret is set correctly (newlines intact).
- Check runner logs and workflow run logs on GitHub.

### Remove/unregister runner
```bash
./config.sh remove --token <PAT>
```
