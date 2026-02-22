# mobile.de Scraping Backend

## Architecture

- **API** (`POST /api/admin/scrape/mobile-de`): vérifie le cache → si trouvé retourne la session + véhicules. Sinon crée une session, enqueue un job BullMQ, puis poll la DB jusqu’à ce que le worker ait terminé (ou timeout 2 min). En l’absence de Redis, exécution directe du scraping (fallback).
- **Queue** (BullMQ + Redis): une recherche = un job. Un seul worker, concurrency 1.
- **Cache** (Redis): clé = `brand|model|year|mileage|fuelType|transmission`. TTL 6 h. En cas d’échec du scraping, retour du dernier résultat connu si disponible.
- **Worker** (processus séparé): lit les jobs, lance le scraper Playwright, enregistre les véhicules en DB, met à jour la session et le cache.

## Prérequis

- **Redis** (pour queue + cache): définir `REDIS_URL` (ex. `redis://localhost:6379`).
- **Playwright**: `npx playwright install chromium` si besoin.
- **Proxies** (optionnel):  
  - `RESIDENTIAL_PROXY_URL` pour des proxies résidentiels rotatifs.  
  - Sinon, le Tor manager local (ports 9050+) est utilisé si `useProxy: true`.

## Lancer le worker

Avec Redis configuré :

```bash
npm run worker:mobile-de
```

Ou :

```bash
tsx workers/mobile-de-worker.ts
```

Le worker tourne en continu et traite les jobs un par un.

## Comportement du scraper

- **Playwright** en headless.
- **Jusqu’à 3 tentatives** par page.
- **Pause** ~2,5 s entre chaque page et entre chaque retry.
- **Détection bloc/captcha** (texte type "captcha", "recaptcha", "Zugriff verweigert", etc.) → arrêt propre et échec du job.
- En cas de bloc/captcha, le job échoue ; l’API peut renvoyer le dernier cache si disponible.

## Variables d’environnement

| Variable               | Description                                      |
|------------------------|--------------------------------------------------|
| `REDIS_URL`            | URL Redis (queue + cache). Si absente, pas de queue/cache. |
| `RESIDENTIAL_PROXY_URL`| Proxy résidentiel (optionnel).                   |
| `CHROMIUM_PATH`        | Chemin vers Chromium (optionnel).                |
