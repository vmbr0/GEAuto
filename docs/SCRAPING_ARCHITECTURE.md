# Vehicle Search – Scraping Backend Architecture

Backend modulaire pour la recherche véhicules : file d’jobs, cache, détection de blocage, logs structurés. Conçu pour la stabilité et l’observabilité, pas pour contourner les protections.

## Stack

- **Node.js / Next.js** – API et workers
- **Playwright** – rendu headless
- **BullMQ** – file d’jobs (Redis)
- **Redis** – file + rate limiting
- **PostgreSQL** – cache et résultats (Prisma)
- **Winston** – logs structurés

## Flux

```
Client
   → GET /api/search?brand=BMW&model=320&yearMin=2015
   → Vérification cache (SearchResultCache, < 6h)
   → Si trouvé → retour immédiat
   → Sinon → création job dans la queue (rate limit: 1 requête / query / 5 min)
   → Worker: scraper → parser → validation → écriture DB
   → Prochains appels → cache hit
```

## Fichiers principaux

| Rôle | Fichier |
|------|--------|
| API | `app/api/search/route.ts` – GET, validation, cache, enqueue |
| Service | `services/search/search-service.ts` – normalisation, hash, cache, enqueue |
| File | `lib/queue/search-queue.ts` – BullMQ, 3 tentatives, backoff, timeout 60s |
| Rate limit | `lib/rate-limit.ts` – 1 job / query / 5 min (Redis) |
| Scraper | `services/scraping/vehicle-scraper.ts` – Playwright, networkidle, bloc/captcha |
| Parser | `services/scraping/vehicle-parser.ts` – extraction + validation (prix requis, ≥3 entrées) |
| Worker | `workers/search-worker.ts` – concurrency 2, délai 2–3 s entre jobs |
| Logs | `lib/logger.ts` – Winston, événements structurés |

## Schéma DB (Prisma)

- **SearchResultCache** : `queryHash`, `queryParams` (JSON), `results` (JSONB), `status` (SUCCESS | FAILED | BLOCKED), `failureReason`, `createdAt`, `updatedAt`.
- Cache : 6 heures en dev (configurable dans le service).

## Comportement

- **Pas de blocage** : l’API ne fait pas le scraping ; elle enregistre un job et renvoie « in progress » ou le cache.
- **Détection bloc** : si la page contient « access denied », « captcha », etc., statut `BLOCKED`, pas de résultat vide stocké.
- **Parser** : entrées sans prix ignorées ; si moins de 3 entrées valides, pas d’enregistrement (échec propre).
- **Erreurs** : tout est en try/catch ; en cas d’erreur API → `{ status: "error", message: "Search temporarily unavailable" }` (503).

## Rate limiting

- 1 job par `queryHash` toutes les 5 minutes (clé Redis `search:ratelimit:{queryHash}`).
- Concurrency worker : 2.
- Délai entre deux jobs : 2,5 s.

## Mode développement

- **DEV_MODE=true** : sauvegarde du HTML brut dans `tmp/scraper-snapshots/`, log de la taille et des 500 premiers caractères.
- Variable d’environnement : `DEV_MODE=true` (ou laisser en dev sans proxy).

## Lancer le worker

```bash
npm run worker:search
```

Prérequis : Redis (`REDIS_URL`), PostgreSQL (Prisma à jour). Créer la table si besoin :

```bash
npx prisma db push
# ou
npx prisma migrate dev --name add_search_result_cache
```

## Exemple d’appel API

```http
GET /api/search?brand=BMW&model=320&yearMin=2015
```

Réponses possibles :

- **200** – `{ status: "success", source: "cache", results: [...], cachedAt: "..." }`
- **200** – `{ status: "in_progress", queryHash: "v1-..." }`
- **503** – `{ status: "error", message: "..." }`

## Logs (Winston)

Événements typiques : `query_received`, `job_created`, `job_started`, `job_completed`, `job_failed`, `cache_hit`, `scraper` (page fetched / snapshot), `parser` (suspicious count). Chaque log inclut selon le cas : `jobId`, `queryHash`, `durationMs`, `resultCount`, `failureReason`, `blocked`.
