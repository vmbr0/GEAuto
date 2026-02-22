# Docker – GE Auto Import

## Stack

- **postgres** : PostgreSQL 15 (port 5432)
- **app** : Next.js (port 3000)

Au démarrage, l’app exécute automatiquement `prisma db push` et le seed (admin + utilisateurs de test).

---

## Lancer toute la stack

```bash
docker compose up -d
```

- App : http://localhost:3000  
- Connexion admin : `admin@geautoimport.fr` / `password123`

---

## Arrêter

```bash
docker compose down
```

Avec suppression des données Postgres :

```bash
docker compose down -v
```

---

## Rebuild après modification du code

```bash
docker compose up -d --build
```

---

## Utiliser uniquement Postgres (dev en local)

```bash
docker compose up -d postgres
```

Puis sur ta machine :

```bash
npm run dev
```

En local, garde dans `.env` :

`DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ge_auto_import?schema=public"`

---

## Fichiers

| Fichier | Rôle |
|--------|------|
| `Dockerfile` | Build et run de l’app Next.js |
| `docker-compose.yml` | Postgres + app, variables d’environnement |
| `.dockerignore` | Exclut node_modules, .next, .git, etc. |

---

## Variables d’environnement (app)

Dans `docker-compose.yml` pour le service `app` :

- `DATABASE_URL` : pointe vers le service `postgres`
- `NEXTAUTH_URL` : `http://localhost:3000`
- `NEXTAUTH_SECRET` : pris depuis ta machine si défini, sinon valeur par défaut

Pour surcharger (ex. secret) : crée un fichier `.env` à la racine ou utilise :

```bash
export NEXTAUTH_SECRET=ton-secret
docker compose up -d
```

---

## Dépannage : « Base de données indisponible » / Can't reach database at localhost:5432

- **L’app affiche « Base de données indisponible »** tant qu’aucun serveur PostgreSQL n’écoute sur `localhost:5432`.

### Option 1 : Docker (recommandé)

1. **Ouvrez Docker Desktop** et attendez qu’il soit complètement démarré (icône verte, pas seulement « Docker is running »).
2. Dans un terminal, à la racine du projet :
   ```powershell
   .\scripts\start-db.ps1
   ```
   ou :
   ```bash
   docker-compose up -d postgres redis
   ```
3. Vérifiez que les conteneurs tournent : `docker-compose ps`. Vous devez voir `ge-auto-postgres` et `ge-auto-redis` avec le statut **Up**.

Si vous voyez l’erreur **`open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified`** : le moteur Docker n’est pas joignable. Redémarrez Docker Desktop, ou désactivez/réactivez WSL2 dans les paramètres Docker.

### Option 2 : PostgreSQL installé en local (sans Docker)

1. Installez [PostgreSQL pour Windows](https://www.postgresql.org/download/windows/) (par ex. via le programme officiel ou Chocolatey).
2. Créez une base nommée `ge_auto_import` (pgAdmin ou `psql -c "CREATE DATABASE ge_auto_import;"`).
3. Dans `.env`, définissez :
   ```
   DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/ge_auto_import?schema=public"
   ```
4. À la racine du projet : `npx prisma migrate deploy` (ou `npx prisma db push` en dev).
5. Relancez l’app (`npm run dev`).

---

## Dépannage : table global_settings absente

Si l'app affiche « The table global_settings does not exist », exécuter une fois : npx prisma db push, puis relancer. Alternative : npm run dev:with-db. Sans la table, l'app utilise des valeurs par défaut.
