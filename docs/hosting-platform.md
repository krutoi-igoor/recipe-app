# Recipe App - Hosting Platform Specifications

## Executive Summary
This document outlines the hosting infrastructure specifications, current server status, setup requirements, and deployment strategy for the Recipe App on a self-hosted Ubuntu Linux server.

**Server Details:**
- **IP Address**: <SERVER_IP>
- **Operating System**: Ubuntu 22.04.5 LTS (Jammy)
- **Hostname**: tiger
- **User**: alex
- **Environment**: Local network (self-hosted)

---

## 1. Current Server Status

### 1.1 System Information (As of Assessment: Dec 5, 2025)

**Operating System:**
- Distribution: Ubuntu 22.04.5 LTS
- Codename: jammy
- Kernel: 6.8.0-87-generic (x86_64)
- Architecture: x86_64

**Hardware:**
- **CPU**: 11th Gen Intel(R) Core(TM) i7-1185GRE @ 2.80GHz
- **Cores**: 8 cores
- **RAM**: 15.3 GB (14 Gi usable)
- **Storage**: 
  - Total: 439 GB
  - Used: 321 GB (77%)
  - Available: 96 GB
  - Filesystem: /dev/nvme0n1p2 (NVMe SSD)

**Memory Status:**
- Total Memory: 14 Gi
- Used: 2.7 Gi
- Free: 2.2 Gi
- Available: 11 Gi
- Swap: 2.0 Gi (unused)

**System Uptime:**
- Server has been running continuously (stable environment)

### 1.2 Currently Installed Software

**Web Server:**
- ✅ **nginx 1.18.0** (Ubuntu) - INSTALLED & RUNNING
  - Status: Active (running since Nov 15, 2025)
  - Listening on: Port 80 (HTTP)
  - Default configuration present

**Programming Languages:**
- ✅ **Python 3.10.12** - INSTALLED
- ❌ **Node.js** - NOT INSTALLED (required)
- ❌ **npm** - NOT INSTALLED (required)

**Databases:**
- ❌ **PostgreSQL** - NOT INSTALLED (required)
- ❌ **Redis** - NOT INSTALLED (required)

**Development Tools:**
- ❌ **Git** - NOT INSTALLED (required)
- ❌ **Docker** - NOT INSTALLED (optional)
- ❌ **PM2** - NOT INSTALLED (required)

**Network Status:**
- Port 80: LISTENING (nginx)
- Port 443: Not active (SSL not configured)
- Ports 3000, 5432, 6379: Available

---

## 2. Infrastructure Requirements

### 2.1 Minimum Requirements ✅ MET

| Requirement | Minimum       | Current        | Status     |
|-------------|---------------|----------------|------------|
| CPU Cores   | 2 cores       | 8 cores        | ✅ Exceeds |
| RAM         | 2 GB          | 15.3 GB        | ✅ Exceeds |
| Storage     | 20 GB         | 96 GB free     | ✅ Exceeds |
| OS          | Ubuntu 20.04+ | Ubuntu 22.04.5 | ✅ Met     |

### 2.2 Recommended Requirements ✅ MET

| Requirement | Recommended | Current       | Status      |
|-------------|-------------|---------------|-------------|
| CPU Cores   | 4 cores     | 8 cores       | ✅ Exceeds  |
| RAM         | 4 GB        | 15.3 GB       | ✅ Exceeds  |
| Storage     | 50 GB       | 96 GB free    | ✅ Exceeds  |
| Network     | Gigabit     | Local network | ✅ Adequate |

**Assessment**: The server hardware significantly exceeds all requirements for running the Recipe App. This provides excellent headroom for growth and performance.

---

## 3. Software Installation Plan

### 3.1 Phase 1: Core Dependencies

#### A. Node.js & npm (Required for backend and build tools)

**Installation Method**: NodeSource Repository (Recommended)

```bash
# Install Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

**Alternative**: NVM (Node Version Manager) for version flexibility

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

#### B. PostgreSQL 16 (Primary database)

```bash
# Add PostgreSQL repository
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

# Update and install
sudo apt-get update
sudo apt-get install -y postgresql-16 postgresql-contrib-16

# Enable and start
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Verify
sudo systemctl status postgresql
psql --version
```

**Post-Installation Configuration:**

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE recipe_app;
CREATE USER recipe_user WITH ENCRYPTED PASSWORD 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE recipe_app TO recipe_user;
ALTER DATABASE recipe_app OWNER TO recipe_user;
\q

# Configure PostgreSQL for local connections
sudo nano /etc/postgresql/16/main/pg_hba.conf
# Add: host    recipe_app    recipe_user    127.0.0.1/32    md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

#### C. Redis 7 (Caching and sessions)

```bash
# Install Redis
sudo apt-get install -y redis-server

# Enable and start
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Verify
redis-cli ping  # Should return PONG
redis-server --version
```

**Redis Configuration:**

```bash
# Edit Redis config
sudo nano /etc/redis/redis.conf

# Recommended changes:
# maxmemory 512mb
# maxmemory-policy allkeys-lru
# bind 127.0.0.1 ::1
# requirepass STRONG_PASSWORD_HERE

# Restart Redis
sudo systemctl restart redis-server
```

#### D. Git (Version control)

```bash
sudo apt-get install -y git
git --version

# Configure Git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

#### E. PM2 (Process manager for Node.js)

```bash
# Install globally via npm (after Node.js is installed)
sudo npm install -g pm2

# Setup PM2 to start on boot
pm2 startup systemd
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u alex --hp /home/alex

# Verify
pm2 --version
```

### 3.2 Phase 2: Optional but Recommended

#### A. Docker & Docker Compose (for containerized development)

```bash
# Install Docker
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker alex

# Enable and start
sudo systemctl enable docker
sudo systemctl start docker

# Verify
docker --version
docker compose version
```

#### B. Certbot (for SSL certificates via Let's Encrypt)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
```

#### C. Build Tools (for native npm modules)

```bash
sudo apt-get install -y build-essential python3-dev
```

#### D. ImageMagick (for image processing)

```bash
sudo apt-get install -y imagemagick
```

#### E. Tesseract OCR (for recipe image text extraction)

```bash
sudo apt-get install -y tesseract-ocr tesseract-ocr-eng
tesseract --version
```

---

## 4. nginx Configuration

### 4.1 Current Status

- nginx 1.18.0 is installed and running
- Listening on port 80 (HTTP only)
- Default configuration active
- SSL not configured

### 4.2 Recipe App nginx Configuration

**Create new site configuration:**

```bash
sudo nano /etc/nginx/sites-available/recipe-app
```

**Configuration file content:**

```nginx
# Recipe App - nginx Configuration

# Redirect HTTP to HTTPS (after SSL is configured)
server {
    listen 80;
    listen [::]:80;
    server_name <SERVER_IP> recipe.local;
    
    # For SSL setup with Certbot
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Uncomment after SSL is configured
    # return 301 https://$server_name$request_uri;
    
    # Temporary: serve app on HTTP during development
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Static files (production build)
    location /static/ {
        alias /var/www/recipe-app/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Uploaded files (recipe images)
    location /uploads/ {
        alias /var/www/recipe-app/uploads/;
        expires 30d;
        add_header Cache-Control "public";
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # File upload size limit (for recipe images)
    client_max_body_size 10M;
}

# HTTPS Configuration (uncomment after SSL certificate is obtained)
# server {
#     listen 443 ssl http2;
#     listen [::]:443 ssl http2;
#     server_name <SERVER_IP> recipe.local;
#     
#     # SSL certificate paths (will be set by Certbot)
#     ssl_certificate /etc/letsencrypt/live/recipe.local/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/recipe.local/privkey.pem;
#     
#     # SSL configuration
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_prefer_server_ciphers on;
#     ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
#     ssl_session_cache shared:SSL:10m;
#     ssl_session_timeout 10m;
#     
#     # Include same location blocks as HTTP server above
#     location / {
#         # ... (same as HTTP config)
#     }
# }
```

**Enable the site:**

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/recipe-app /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 4.3 SSL Certificate Setup (Production)

For local network access, SSL is optional but recommended:

**Option 1: Self-Signed Certificate (Local Network)**

```bash
# Create self-signed certificate
sudo mkdir -p /etc/ssl/private
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/recipe-app-selfsigned.key \
  -out /etc/ssl/certs/recipe-app-selfsigned.crt

# Update nginx config with certificate paths
# Then reload nginx
```

**Option 2: Let's Encrypt (if accessible from internet)**

```bash
# Only if you have a domain name pointing to this server
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**Option 3: No SSL (Development Only)**

For initial development, HTTP is acceptable. Add HTTPS before production use.

---

## 5. Directory Structure

### 5.1 Application Directories

```bash
# Create application directory structure
sudo mkdir -p /var/www/recipe-app
sudo mkdir -p /var/www/recipe-app/uploads
sudo mkdir -p /var/www/recipe-app/uploads/recipes
sudo mkdir -p /var/www/recipe-app/uploads/temp
sudo mkdir -p /var/www/recipe-app/static
sudo mkdir -p /var/www/recipe-app/logs
sudo mkdir -p /var/www/recipe-app/backups

# Set ownership
sudo chown -R alex:alex /var/www/recipe-app

# Set permissions
chmod 755 /var/www/recipe-app
chmod 775 /var/www/recipe-app/uploads
chmod 775 /var/www/recipe-app/logs
chmod 775 /var/www/recipe-app/backups
```

### 5.2 Directory Layout

```
/var/www/recipe-app/
├── backend/                 # Node.js/Express backend code
│   ├── src/
│   ├── node_modules/
│   ├── package.json
│   ├── .env
│   └── ...
├── frontend/                # React frontend code (development)
│   ├── src/
│   ├── public/
│   ├── node_modules/
│   └── package.json
├── static/                  # Built frontend assets (production)
│   ├── js/
│   ├── css/
│   ├── images/
│   └── index.html
├── uploads/                 # User uploaded files
│   ├── recipes/            # Recipe images
│   └── temp/               # Temporary upload processing
├── logs/                    # Application logs
│   ├── app.log
│   ├── error.log
│   └── access.log
└── backups/                 # Database backups
    └── recipe_app_YYYY-MM-DD.sql
```

---

## 6. Database Configuration

### 6.1 PostgreSQL Setup

**Connection Details:**
- Host: localhost (127.0.0.1)
- Port: 5432 (default)
- Database: recipe_app
- User: recipe_user
- Password: (set during installation)

**Connection String:**
```
postgresql://recipe_user:PASSWORD@localhost:5432/recipe_app
```

### 6.2 Database Optimization

```sql
-- Edit PostgreSQL configuration
-- sudo nano /etc/postgresql/16/main/postgresql.conf

-- Recommended settings for 16GB RAM system:
shared_buffers = 4GB
effective_cache_size = 12GB
maintenance_work_mem = 1GB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 52MB
min_wal_size = 1GB
max_wal_size = 4GB
max_worker_processes = 8
max_parallel_workers_per_gather = 4
max_parallel_workers = 8
```

### 6.3 Automated Backups

**Daily backup script:**

```bash
# Create backup script
sudo nano /usr/local/bin/backup-recipe-app.sh
```

```bash
#!/bin/bash
# Recipe App Database Backup Script

BACKUP_DIR="/var/www/recipe-app/backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="$BACKUP_DIR/recipe_app_$DATE.sql"
DB_NAME="recipe_app"
DB_USER="recipe_user"

# Create backup
pg_dump -U $DB_USER -d $DB_NAME > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "recipe_app_*.sql.gz" -mtime +7 -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-recipe-app.sh

# Add to cron (daily at 2 AM)
crontab -e
# Add line:
0 2 * * * /usr/local/bin/backup-recipe-app.sh >> /var/www/recipe-app/logs/backup.log 2>&1
```

---

## 7. Security Configuration

### 7.1 Firewall Setup (UFW)

```bash
# Enable UFW
sudo ufw enable

# Allow SSH (important - do this first!)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status

# Should show:
# 22/tcp    ALLOW       Anywhere
# 80/tcp    ALLOW       Anywhere
# 443/tcp   ALLOW       Anywhere
```

### 7.2 SSH Hardening (Optional but Recommended)

```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Recommended changes:
# PermitRootLogin no
# PasswordAuthentication yes  (or use SSH keys)
# Port 22  (or change to non-standard port)
# AllowUsers alex

# Restart SSH
sudo systemctl restart sshd
```

### 7.3 Fail2Ban (Brute Force Protection)

```bash
# Install fail2ban
sudo apt-get install -y fail2ban

# Create local config
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# Enable SSH protection
[sshd]
enabled = true
port = 22
logpath = /var/log/auth.log
maxretry = 5
bantime = 3600

# Enable and start
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 7.4 Automatic Security Updates

```bash
# Install unattended-upgrades
sudo apt-get install -y unattended-upgrades

# Enable automatic security updates
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

---

## 8. Monitoring & Logging

### 8.1 System Monitoring

**Install htop (interactive process viewer):**
```bash
sudo apt-get install -y htop
```

**Install netdata (real-time performance monitoring):**
```bash
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
# Access at: http://<SERVER_IP>:19999
```

### 8.2 Log Management

**Configure log rotation:**

```bash
sudo nano /etc/logrotate.d/recipe-app
```

```
/var/www/recipe-app/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 8.3 nginx Access Logs

```bash
# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 9. Deployment Strategy

### 9.1 Development Workflow

```
Local Machine → Git Push → GitHub/GitLab → SSH to Server → Git Pull → Build → Deploy
```

### 9.2 Deployment Steps

**Initial Deployment:**

```bash
# SSH into server
ssh <USER>@<SERVER_IP>

# Navigate to app directory
cd /var/www/recipe-app

# Clone repository
git clone https://github.com/your-username/recipe-app.git .

# Install backend dependencies
cd backend
npm install

# Create .env file
nano .env
# Add environment variables (see development-requirements.md)

# Run database migrations
npm run migrate

# Build frontend
cd ../frontend
npm install
npm run build

# Copy build to static directory
cp -r build/* ../static/

# Start backend with PM2
cd ../backend
pm2 start npm --name "recipe-app" -- start
pm2 save

# Check status
pm2 status
pm2 logs recipe-app
```

**Subsequent Deployments:**

```bash
# SSH to server
ssh <USER>@<SERVER_IP>
cd /var/www/recipe-app

# Pull latest changes
git pull origin main

# Update backend
cd backend
npm install
npm run migrate  # if there are new migrations
pm2 restart recipe-app

# Update frontend
cd ../frontend
npm install
npm run build
cp -r build/* ../static/

# Monitor
pm2 logs recipe-app
```

### 9.3 PM2 Process Management

```bash
# Start app
pm2 start npm --name "recipe-app" -- start

# Stop app
pm2 stop recipe-app

# Restart app
pm2 restart recipe-app

# View logs
pm2 logs recipe-app

# Monitor resources
pm2 monit

# View app list
pm2 list

# Save current process list (persists across reboots)
pm2 save

# Setup startup script
pm2 startup
```

### 9.4 Environment Configuration

**Backend .env file template:**

```bash
# /var/www/recipe-app/backend/.env

NODE_ENV=production
PORT=3000
API_BASE_URL=http://<SERVER_IP>/api/v1

# Database
DATABASE_URL=postgresql://recipe_user:PASSWORD@localhost:5432/recipe_app
DATABASE_POOL_SIZE=20

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=GENERATE_STRONG_RANDOM_SECRET_HERE
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=GENERATE_ANOTHER_SECRET
JWT_REFRESH_EXPIRATION=7d

# File Upload
UPLOAD_DIR=/var/www/recipe-app/uploads
MAX_FILE_SIZE=10485760

# AI Services (if using)
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4

# OCR
OCR_SERVICE=tesseract

# Logging
LOG_LEVEL=info
```

---

## 10. Performance Optimization

### 10.1 nginx Performance Tuning

```nginx
# /etc/nginx/nginx.conf

user www-data;
worker_processes 8;  # Match number of CPU cores
worker_rlimit_nofile 65535;

events {
    worker_connections 2048;
    multi_accept on;
    use epoll;
}

http {
    # Basic Settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;
    
    # Buffer Sizes
    client_body_buffer_size 10K;
    client_header_buffer_size 1k;
    client_max_body_size 10M;
    large_client_header_buffers 4 16k;
    
    # Timeouts
    client_body_timeout 12;
    client_header_timeout 12;
    send_timeout 10;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Cache
    open_file_cache max=2000 inactive=20s;
    open_file_cache_valid 60s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
}
```

### 10.2 Node.js Performance

```bash
# PM2 cluster mode (utilize all CPU cores)
pm2 start npm --name "recipe-app" -i max -- start

# PM2 with memory limit and auto-restart
pm2 start npm --name "recipe-app" --max-memory-restart 1G -- start
```

### 10.3 PostgreSQL Connection Pooling

Backend should use connection pooling (already in requirements):

```javascript
// In backend config
{
  pool: {
    max: 20,
    min: 5,
    idle: 10000,
    acquire: 30000
  }
}
```

---

## 11. Disaster Recovery

### 11.1 Backup Strategy

**What to Backup:**
1. PostgreSQL database (automated daily)
2. User uploads (/var/www/recipe-app/uploads)
3. Application code (Git repository)
4. Configuration files (.env, nginx configs)

**Backup Locations:**
- Primary: /var/www/recipe-app/backups (local)
- Secondary: External drive or remote server (recommended)

### 11.2 Recovery Procedures

**Database Recovery:**

```bash
# Restore from backup
gunzip -c /var/www/recipe-app/backups/recipe_app_2025-12-05.sql.gz | psql -U recipe_user -d recipe_app
```

**Application Recovery:**

```bash
# Re-clone from Git
cd /var/www/recipe-app
git pull origin main

# Reinstall dependencies
cd backend && npm install
cd ../frontend && npm install && npm run build

# Restart
pm2 restart recipe-app
```

### 11.3 Health Checks

**Application Health Endpoint:**

```bash
# Should return 200 OK
curl http://<SERVER_IP>/api/v1/health
```

**Monitor script:**

```bash
# /usr/local/bin/health-check.sh
#!/bin/bash
if ! curl -f http://localhost:3000/api/v1/health > /dev/null 2>&1; then
    echo "App is down, restarting..."
    pm2 restart recipe-app
    echo "$(date): App restarted" >> /var/www/recipe-app/logs/health-check.log
fi
```

```bash
# Add to crontab (every 5 minutes)
*/5 * * * * /usr/local/bin/health-check.sh
```

---

## 12. Network Configuration

### 12.1 Local Network Access

**Current Setup:**
- Server IP: <SERVER_IP>
- Accessible from local network only
- No external internet access required

**Access URLs:**
- Development: http://<SERVER_IP>
- API: http://<SERVER_IP>/api/v1
- Optional domain: http://recipe.local (requires hosts file entry)

### 12.2 Hosts File (Optional - For Friendly URL)

**On client machines:**

```bash
# Linux/Mac: /etc/hosts
# Windows: C:\Windows\System32\drivers\etc\hosts

<SERVER_IP>    recipe.local
```

Then access via: http://recipe.local

### 12.3 Port Forwarding (If External Access Needed)

If you want to access from outside local network:

1. Configure router port forwarding:
   - External Port 80 → <SERVER_IP>:80
   - External Port 443 → <SERVER_IP>:443

2. Use dynamic DNS service (e.g., No-IP, DuckDNS)

3. Configure SSL certificate for domain

**Security Note**: External access requires additional security measures (fail2ban, rate limiting, strong passwords, regular updates).

---

## 13. Maintenance Schedule

### 13.1 Daily Tasks (Automated)
- Database backups (2:00 AM)
- Log rotation
- Security updates (unattended-upgrades)
- Health checks (every 5 minutes)

### 13.2 Weekly Tasks
- Review application logs
- Check disk space usage
- Monitor system performance
- Review backup integrity

### 13.3 Monthly Tasks
- Update Node.js and npm packages
- Review and update dependencies
- Security audit
- Performance optimization review
- Clean up old logs and backups

### 13.4 Quarterly Tasks
- Full system updates (apt upgrade)
- PostgreSQL maintenance (VACUUM, ANALYZE)
- Review and update SSL certificates
- Disaster recovery drill

---

## 14. Troubleshooting Guide

### 14.1 Application Won't Start

```bash
# Check PM2 logs
pm2 logs recipe-app --lines 50

# Check if port 3000 is in use
sudo lsof -i :3000

# Check environment variables
cd /var/www/recipe-app/backend
cat .env

# Check database connection
psql -U recipe_user -d recipe_app -h localhost
```

### 14.2 nginx 502 Bad Gateway

```bash
# Check if backend is running
pm2 status

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### 14.3 Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connections
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 14.4 High Memory Usage

```bash
# Check memory usage
free -h
htop

# Check PM2 processes
pm2 monit

# Restart app with memory limit
pm2 restart recipe-app --max-memory-restart 1G
```

### 14.5 Disk Space Full

```bash
# Check disk usage
df -h

# Find large directories
sudo du -h --max-depth=1 /var | sort -hr | head -10

# Clean up:
# - Old logs: sudo rm /var/log/*.log.*.gz
# - Old backups: rm /var/www/recipe-app/backups/*_old.sql.gz
# - npm cache: npm cache clean --force
# - apt cache: sudo apt-get clean
```

---

## 15. Installation Checklist

### Pre-Deployment Checklist

- [ ] Server is accessible via SSH
- [ ] Server has Ubuntu 22.04.5 LTS or newer
- [ ] Minimum 4GB RAM available
- [ ] Minimum 20GB free disk space
- [ ] Firewall configured (UFW)
- [ ] Static IP assigned or reserved in router
- [ ] Backup strategy planned

### Software Installation Checklist

- [ ] Node.js 20.x installed
- [ ] npm installed and working
- [ ] PostgreSQL 16 installed and running
- [ ] Redis 7 installed and running
- [ ] Git installed
- [ ] PM2 installed globally
- [ ] nginx configured for Recipe App
- [ ] SSL certificate configured (optional)
- [ ] Tesseract OCR installed (optional)
- [ ] Build tools installed

### Configuration Checklist

- [ ] PostgreSQL database created
- [ ] PostgreSQL user created with permissions
- [ ] Redis password set (optional)
- [ ] nginx site configuration created
- [ ] Application directories created
- [ ] Permissions set correctly
- [ ] Environment variables configured
- [ ] Automated backups configured
- [ ] Log rotation configured
- [ ] PM2 startup script configured

### Security Checklist

- [ ] Firewall enabled (UFW)
- [ ] SSH hardened
- [ ] fail2ban installed and configured
- [ ] Automatic security updates enabled
- [ ] Strong passwords set (database, Redis)
- [ ] JWT secrets generated
- [ ] File upload limits configured
- [ ] nginx security headers configured

### Deployment Checklist

- [ ] Code repository cloned
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Database migrations run
- [ ] Frontend built
- [ ] Static files deployed
- [ ] Application started with PM2
- [ ] Health check endpoint responding
- [ ] Logs are being written
- [ ] Access from browser works

---

## 16. Performance Benchmarks

### Expected Performance Targets

| Metric              | Target  | Notes                     |
|---------------------|---------|---------------------------|
| Page Load Time      | < 2s    | First contentful paint    |
| API Response Time   | < 200ms | 95th percentile           |
| Database Query Time | < 100ms | Most queries              |
| Recipe Import (URL) | < 5s    | Typical blog post         |
| OCR Processing      | < 10s   | Per image                 |
| Concurrent Users    | 50+     | Without degradation       |
| Uptime              | 99.5%+  | ~3.7 hours/month downtime |

### Current Server Capacity Estimate

With 8 cores and 15GB RAM, this server can theoretically handle:
- **Concurrent users**: 200-500 (with proper optimization)
- **Recipes stored**: 100,000+ (limited by disk space)
- **Daily imports**: 10,000+ (without API rate limits)
- **Database size**: 50GB+ before performance impact

---

## 17. Cost Analysis

### Hardware Costs
- **Server**: Already owned (sunk cost)
- **Electricity**: ~$5-10/month (estimated for 24/7 operation)

### Software Costs
- **Operating System**: Free (Ubuntu)
- **Web Server**: Free (nginx)
- **Database**: Free (PostgreSQL)
- **Cache**: Free (Redis)
- **Development Tools**: Free (Node.js, Git, PM2)

### Optional Service Costs
- **Domain Name**: $10-15/year (optional)
- **SSL Certificate**: Free (Let's Encrypt) or $0-50/year
- **OpenAI API**: Variable, ~$10-100/month depending on usage
- **Cloud OCR**: Variable, or $0 (Tesseract local)
- **Backup Storage**: $0-20/month (external drive or cloud)

### Total Estimated Monthly Cost
- **Minimum**: $5-10 (electricity only, all free software)
- **With AI features**: $20-110 (adds API costs)

**Comparison**: Managed hosting (Heroku, DigitalOcean, AWS) would cost $20-100+/month for similar specs.

---

## 18. Next Steps

### Immediate (This Week)
1. ✅ Server assessment complete
2. 🔄 Install required software (Node.js, PostgreSQL, Redis, Git)
3. Configure nginx for Recipe App
4. Set up database and user
5. Create application directory structure
6. Configure security (firewall, fail2ban)

### Week 1
1. Clone/initialize code repository
2. Set up development environment
3. Configure environment variables
4. Run initial deployment test
5. Set up monitoring and logging
6. Configure automated backups

### Week 2
1. Begin backend development (Phase 2)
2. Test deployment workflow
3. Optimize nginx configuration
4. Set up CI/CD pipeline (optional)

---

## 19. Contact & Support

**Server Administrator**: alex  
**Server Location**: Local network (<SERVER_IP>)  
**Documentation**: This file and development-requirements.md

**Useful Resources**:
- nginx docs: https://nginx.org/en/docs/
- PostgreSQL docs: https://www.postgresql.org/docs/
- PM2 docs: https://pm2.keymetrics.io/docs/
- Ubuntu docs: https://ubuntu.com/server/docs

---

## Version History

| Version | Date        | Author      | Changes                                                |
|---------|-------------|-------------|--------------------------------------------------------|  
| 1.0     | Dec 5, 2025 | DevOps Team | Initial hosting platform assessment and specifications |---

## Appendix A: Quick Reference Commands

```bash
# Application Management
pm2 start recipe-app
pm2 stop recipe-app
pm2 restart recipe-app
pm2 logs recipe-app
pm2 monit

# nginx
sudo systemctl status nginx
sudo systemctl restart nginx
sudo nginx -t
sudo tail -f /var/log/nginx/error.log

# PostgreSQL
sudo systemctl status postgresql
sudo -u postgres psql
psql -U recipe_user -d recipe_app

# Redis
sudo systemctl status redis-server
redis-cli ping
redis-cli

# System
htop
df -h
free -h
sudo ufw status

# Logs
tail -f /var/www/recipe-app/logs/app.log
sudo journalctl -u nginx -f
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```

---

## Appendix B: Emergency Contacts

**If server is unresponsive:**
1. Physical access required (local machine)
2. Check power and network connection
3. Reboot if necessary
4. Check logs after restart

**If database is corrupted:**
1. Stop application: `pm2 stop recipe-app`
2. Stop PostgreSQL: `sudo systemctl stop postgresql`
3. Restore from backup (see section 11.2)
4. Start PostgreSQL: `sudo systemctl start postgresql`
5. Start application: `pm2 start recipe-app`

---

**Document End**
