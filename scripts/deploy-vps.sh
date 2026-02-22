#!/usr/bin/env bash
# Déploiement one-shot sur le VPS pour https://ge-import.com
# À lancer depuis le VPS (après clone du repo) ou en local pour préparer .env
# Usage: cd /opt/GEAuto && sudo bash scripts/deploy-vps.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_DIR"

DOMAIN="ge-import.com"
ENV_FILE="$REPO_DIR/.env"

echo "[*] GE Auto Import – déploiement pour https://${DOMAIN}"
echo "    Répertoire: $REPO_DIR"
echo ""

# 1. Créer .env si absent
if [ ! -f "$ENV_FILE" ]; then
  echo "[*] Création de .env..."
  if command -v openssl &>/dev/null; then
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    POSTGRES_PASSWORD=$(openssl rand -base64 16)
  else
    NEXTAUTH_SECRET=$(head -c 32 /dev/urandom | base64)
    POSTGRES_PASSWORD="geimport_$(head -c 8 /dev/urandom | base64)"
  fi
  cat > "$ENV_FILE" << EOF
NODE_ENV=production
NEXTAUTH_URL=https://${DOMAIN}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/ge_auto_import?schema=public
EMAIL_FROM=GE Auto Import <noreply@${DOMAIN}>
RESEND_API_KEY=
EOF
  chmod 600 "$ENV_FILE"
  echo "    .env créé (NEXTAUTH_SECRET et POSTGRES_PASSWORD générés)"
else
  echo "[*] .env existe déjà, on ne le modifie pas"
fi

# 2. Docker
if command -v docker &>/dev/null && [ -f "docker-compose.yml" ]; then
  echo "[*] Démarrage des conteneurs Docker..."
  docker compose up -d --build
  echo "[OK] App + Postgres démarrés (port 3000)"
else
  echo "[!] Docker non trouvé ou pas de docker-compose. Installer Docker puis: docker compose up -d"
fi

echo ""
echo "--- Suite sur le VPS ---"
echo "1. Nginx: sudo cp $REPO_DIR/deploy/nginx-ge-import.conf /etc/nginx/sites-available/ge-import"
echo "   Puis:   sudo ln -sf /etc/nginx/sites-available/ge-import /etc/nginx/sites-enabled/"
echo "           sudo nginx -t && sudo systemctl reload nginx"
echo "2. HTTPS: sudo certbot --nginx -d ge-import.com -d www.ge-import.com"
echo "3. (Optionnel) Emails: éditer .env et ajouter RESEND_API_KEY, puis docker compose up -d --force-recreate"
echo ""
