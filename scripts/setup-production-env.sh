#!/usr/bin/env bash
# Génère un .env prêt pour https://ge-import.com (Docker)
# Usage: bash scripts/setup-production-env.sh
# Puis: docker compose up -d

set -e
cd "$(dirname "$0")/.."

ENV_FILE=".env"
DOMAIN="ge-import.com"
NEXTAUTH_URL="https://${DOMAIN}"

if [ -f "$ENV_FILE" ]; then
  echo "[!] .env existe déjà. Supprimer pour régénérer: rm .env"
  exit 0
fi

# Générer un secret fort
if command -v openssl &>/dev/null; then
  NEXTAUTH_SECRET=$(openssl rand -base64 32)
else
  NEXTAUTH_SECRET=$(head -c 32 /dev/urandom | base64)
fi

# Mot de passe Postgres par défaut (à changer en prod si besoin)
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-$(openssl rand -base64 16 2>/dev/null || echo 'geimport_prod_ChangeMe')}"

cat > "$ENV_FILE" << EOF
# Généré pour https://${DOMAIN} – $(date -I 2>/dev/null || date)
NODE_ENV=production
NEXTAUTH_URL=${NEXTAUTH_URL}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/ge_auto_import?schema=public
EMAIL_FROM=GE Auto Import <noreply@${DOMAIN}>
RESEND_API_KEY=
EOF

chmod 600 "$ENV_FILE"
echo "[OK] .env créé pour ${NEXTAUTH_URL}"
echo "     POSTGRES_PASSWORD est défini (Docker). Pour Resend (emails), ajoute RESEND_API_KEY dans .env puis: docker compose up -d --force-recreate"
echo ""
echo "Lancer l'app: docker compose up -d"
