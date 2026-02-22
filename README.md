# GE Auto Import

Plateforme SaaS pour l'import automobile : demandes véhicules/pièces, inventaire, rendez-vous, demandes d'information, espace client et admin.

## Stack technique

- **Frontend:** Next.js 14 (App Router), TypeScript, TailwindCSS, Framer Motion
- **Backend:** Next.js API Routes, Prisma ORM
- **Base de données:** PostgreSQL (persistant, pas SQLite)
- **Auth:** NextAuth.js (credentials, JWT)
- **Email:** Resend (transactionnel)
- **Scraping:** Playwright (optionnel)

---

## Installation rapide (Docker – recommandé)

**Pour ge-import.com (tout prêt, pas de config manuelle .env) :**

```bash
git clone <repo> && cd ge-auto-import
bash scripts/setup-production-env.sh   # crée .env avec NEXTAUTH_URL=https://ge-import.com + secrets générés
docker compose up -d
```

Ensuite sur le VPS : Nginx + HTTPS avec `deploy/nginx-ge-import.conf` et Certbot (voir [Déploiement ge-import.com](#déploiement-ge-importcom) ci-dessous).

**Autre domaine / dev :**

```bash
git clone <repo> && cd ge-auto-import
cp .env.example .env
# Éditer .env : NEXTAUTH_URL (ex. https://votredomaine.com), NEXTAUTH_SECRET, optionnel POSTGRES_PASSWORD
docker compose up -d
```

L’app écoute sur le port 3000. La base PostgreSQL est dans un volume persistant.

**Première fois (migrations) :** Si le dossier `prisma/migrations` est vide, créer une migration locale puis la committer :

```bash
# En local, avec une DB PostgreSQL dispo
npm run db:migrate
# Nommer la migration (ex. init), puis committer prisma/migrations
```

En production, au démarrage du conteneur, `prisma migrate deploy` est exécuté automatiquement.

---

## Installation VPS (sans Docker)

Sur un serveur Ubuntu/Debian :

```bash
sudo bash scripts/install.sh
```

Le script installe Node.js LTS, PostgreSQL, crée la base et l’utilisateur, installe les dépendances, applique les migrations (ou `db push` si aucune migration), build l’app et configure PM2 (redémarrage au boot).

Ensuite, configurer `.env` dans le répertoire d’installation (ex. `/opt/ge-auto-import`) puis :

```bash
sudo -u geapp pm2 restart ge-auto-import
```

---

## Variables d’environnement

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `DATABASE_URL` | Oui | URL PostgreSQL (ex. `postgresql://user:pass@host:5432/db?schema=public`) |
| `NEXTAUTH_URL` | Oui | URL publique de l’app (ex. `https://votredomaine.com`) |
| `NEXTAUTH_SECRET` | Oui | Secret fort : `openssl rand -base64 32` |
| `POSTGRES_PASSWORD` | Docker | Mot de passe Postgres pour `docker-compose` |
| `RESEND_API_KEY` | Non | Clé API Resend pour les e-mails (sinon envoi désactivé) |
| `EMAIL_FROM` | Non | Expéditeur (ex. `GE Auto Import <noreply@votredomaine.com>`) |

Voir `.env.example` pour un modèle complet.

---

## Scripts npm

| Script | Usage |
|--------|--------|
| `npm run dev` | Développement (generate + db push + next dev) |
| `npm run build` | Build production (prisma generate + next build) |
| `npm run start` | Démarrer le serveur Next (après build) |
| `npm run start:prod` | Idem en production |
| `npm run migrate:deploy` | Appliquer les migrations (production) |
| `npm run seed` | Seed DB (dev, optionnel) |
| `npm run db:studio` | Ouvrir Prisma Studio |

---

## Déploiement ge-import.com

Sur le VPS, une fois le repo cloné :

```bash
sudo bash scripts/deploy-vps.sh
```

Puis Nginx + HTTPS :

```bash
sudo cp deploy/nginx-ge-import.conf /etc/nginx/sites-available/ge-import
sudo ln -sf /etc/nginx/sites-available/ge-import /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d ge-import.com -d www.ge-import.com
```

Optionnel : ajouter `RESEND_API_KEY` dans `.env` pour les e-mails, puis `docker compose up -d --force-recreate`.

---

## Nginx + HTTPS (autre domaine)

- Exemple : `deploy/nginx.conf.example`. Pour **ge-import.com** : `deploy/nginx-ge-import.conf`.
- HTTPS avec Certbot :

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d votredomaine.com -d www.votredomaine.com
```

Renouvellement automatique : `certbot renew` (souvent déjà en cron).

---

## Checklist production

- [ ] PostgreSQL persistant (volume ou serveur dédié)
- [ ] `NEXTAUTH_URL` en HTTPS
- [ ] `NEXTAUTH_SECRET` fort et unique
- [ ] Migrations appliquées (`migrate:deploy` ou premier `db push` documenté)
- [ ] Pas de `.env` commité ; utiliser `.env.example` comme référence
- [ ] Headers de sécurité (déjà dans le middleware)
- [ ] Rate limiting activé (login, reset password, formulaires publics)
- [ ] Compte admin créé (seed ou manuellement) pour accéder à `/admin`

---

## Documentation déploiement

Voir **`docs/DEPLOYMENT.md`** pour :

- Persistance base de données
- Configuration e-mail (Resend, fallback, tests)
- Nginx + Certbot en détail
- Sécurité (bcrypt, cookies, JWT, CORS)
- Dépannage

---

## Structure du projet

```
/app              # Pages et routes (App Router)
/components       # Composants React
/lib              # Auth, Prisma, validations, email
/prisma           # Schéma et migrations
/services         # Services métier (appointments, email, etc.)
/scripts          # install.sh (VPS)
/deploy           # nginx.conf.example
/docs             # DEPLOYMENT.md
```
