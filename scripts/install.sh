#!/usr/bin/env bash
# GE Auto Import – VPS install script (non-Docker)
# Usage: sudo bash install.sh
# Requires: Ubuntu/Debian-like system

set -e
APP_DIR="${APP_DIR:-/opt/ge-auto-import}"
APP_USER="${APP_USER:-geapp}"
NODE_VERSION="20"
PG_VERSION="16"

echo "[*] Installing Node.js ${NODE_VERSION} LTS..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt-get install -y nodejs

echo "[*] Installing PostgreSQL..."
apt-get install -y postgresql postgresql-contrib

echo "[*] Creating DB and user..."
sudo -u postgres psql -c "CREATE USER ${APP_USER} WITH PASSWORD '${POSTGRES_APP_PASSWORD:-changeme}';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE ge_auto_import OWNER ${APP_USER};" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ge_auto_import TO ${APP_USER};"

echo "[*] Creating app directory and user..."
useradd -r -s /bin/false "${APP_USER}" 2>/dev/null || true
mkdir -p "${APP_DIR}"
chown "${APP_USER}:${APP_USER}" "${APP_DIR}"

echo "[*] Copying app (run from repo root)..."
# Assumes script is run from repo root or APP_SOURCE is set
rsync -a --exclude node_modules --exclude .next --exclude .git . "${APP_DIR}/"
chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"

echo "[*] Installing dependencies and building..."
cd "${APP_DIR}"
export DATABASE_URL="postgresql://${APP_USER}:${POSTGRES_APP_PASSWORD:-changeme}@localhost:5432/ge_auto_import?schema=public"
sudo -u "${APP_USER}" npm ci
sudo -u "${APP_USER}" npx prisma migrate deploy || sudo -u "${APP_USER}" npx prisma db push
sudo -u "${APP_USER}" npm run build

echo "[*] Installing PM2..."
npm install -g pm2

echo "[*] Starting with PM2..."
sudo -u "${APP_USER}" pm2 start npm --name "ge-auto-import" -- start
sudo -u "${APP_USER}" pm2 save
env -i PATH=/usr/bin pm2 startup systemd -u "${APP_USER}" --hp "${APP_DIR}" || true

echo "[*] Done. Set .env in ${APP_DIR} (NEXTAUTH_URL, NEXTAUTH_SECRET, etc.) and restart: pm2 restart ge-auto-import"
