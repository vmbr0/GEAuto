# PART 5 – Admin Configuration Panel – Livrable

## 1) Schéma Prisma mis à jour

### Nouveau modèle `GlobalSettings` (singleton)

```prisma
model GlobalSettings {
  id                   String   @id @default(cuid())
  key                  String   @unique @default("default")
  regionPricePerCV     Float    @default(46.15)
  defaultTransportCost Float    @default(800)
  germanTempPlateCost  Float    @default(150)
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  @@map("global_settings")
}
```

- Une seule ligne active : `key = "default"` (contrainte unique).
- Utilisation : `findUnique({ where: { key: "default" } })` puis `upsert` si absent.

### Modèle `CocPrice` (inchangé)

```prisma
model CocPrice {
  id        String   @id @default(cuid())
  brand     String   @unique
  price     Float
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("coc_prices")
}
```

---

## 2) Structure des dossiers

```
app/
├── admin/
│   ├── page.tsx                    # Lien "Paramètres" ajouté
│   └── settings/
│       └── page.tsx                 # Page /admin/settings
│
└── api/
    └── admin/
        ├── config/
        │   └── route.ts             # GET: lit GlobalSettings (compatibilité formulaire)
        └── settings/
            ├── global/
            │   └── route.ts         # GET / PUT GlobalSettings
            └── coc/
                ├── route.ts         # GET liste, POST créer
                └── [id]/
                    └── route.ts     # PUT modifier, DELETE supprimer

lib/
└── validations/
    └── settings.ts                  # Zod: globalSettingsSchema, cocPriceSchema

components/
└── ui/
    └── Toast.tsx                    # Toast succès/erreur

services/
└── inventory/
    └── import-cost-calculator.ts    # Utilise GlobalSettings + CocPrice

prisma/
├── schema.prisma                    # + GlobalSettings
└── seed.ts                          # Seed GlobalSettings + COC exemples
```

---

## 3) Page Paramètres UI (`/admin/settings`)

**Fichier** : `app/admin/settings/page.tsx`

### Sections

1. **Paramètres régionaux**
   - Prix par CV (€)
   - Coût transport par défaut (€)
   - Plaque temporaire allemande (€)
   - Bouton « Enregistrer les paramètres » avec état de chargement

2. **Prix COC par marque**
   - Tableau : Marque | Prix (€) | Actions (Modifier / Supprimer)
   - Bouton « Ajouter une marque »
   - Modal ajout : Marque + Prix
   - Modal édition : Prix (marque en lecture seule)
   - Modal confirmation suppression

### Comportement

- Champs éditables inline (chiffres).
- Sauvegarde avec loading sur le bouton.
- Toast succès / erreur après action.
- Gestion d’erreurs (messages API + try/catch).
- Style dashboard : Cards, grille, table.

### Sécurité

- Route sous `/admin/*` : protégée par `requireRole(UserRole.ADMIN)` dans `app/admin/layout.tsx`.
- API : `getServerSession` + vérification `UserRole.ADMIN` sur toutes les routes sous `/api/admin/settings/*`.
- Validation Zod côté API pour GlobalSettings et CocPrice (valeurs numériques ≥ 0, bornes max).

---

## 4) Service de calcul mis à jour

**Fichier** : `services/inventory/import-cost-calculator.ts`

### Logique

- **GlobalSettings** : `getGlobalSettings()` lit l’unique ligne `key = "default"`, ou la crée avec les valeurs par défaut si elle n’existe pas.
- **COC** : `getCocPrice(brand)` cherche par `brand.toUpperCase()` ; si aucune ligne : `DEFAULT_COC_PRICE = 200`.

### Formules (inchangées)

```
carteGrise = cvFiscaux × regionPricePerCV
importCost = purchasePrice + carteGrise + cocPrice + germanTempPlateCost + defaultTransportCost
potentialMargin = avgFrancePrice - importCost  (si applicable)
```

### Appels

- `calculateImportCost({ purchasePrice, cvFiscaux, brand })` → utilise GlobalSettings + CocPrice.
- `calculatePotentialMargin(...)` → s’appuie sur `calculateImportCost`.

---

## 5) Protection par rôle

- **Layout admin** : `app/admin/layout.tsx` appelle `await requireRole(UserRole.ADMIN)` ; sans rôle ADMIN, redirection (ou 403).
- **API** :
  - `GET/PUT /api/admin/settings/global` : vérification session + `session.user.role === UserRole.ADMIN`.
  - `GET/POST /api/admin/settings/coc` : idem.
  - `PUT/DELETE /api/admin/settings/coc/[id]` : idem.

---

## 6) Validation Zod

**Fichier** : `lib/validations/settings.ts`

- **globalSettingsSchema** :  
  - `regionPricePerCV` : number, min 0, max 500  
  - `defaultTransportCost` : number, min 0, max 100_000  
  - `germanTempPlateCost` : number, min 0, max 10_000  

- **cocPriceSchema** :  
  - `brand` : string, min 1, max 100  
  - `price` : number, min 0, max 10_000  

Utilisation : `safeParse` dans les routes PUT/POST ; en cas d’échec, réponse 400 avec les messages d’erreur.

---

## 7) Seed

**Fichier** : `prisma/seed.ts`

- Création/mise à jour de la ligne **GlobalSettings** `key = "default"` avec :
  - regionPricePerCV: 46.15  
  - defaultTransportCost: 800  
  - germanTempPlateCost: 150  

- Création/mise à jour de **CocPrice** pour : BMW, MERCEDES, AUDI, VOLKSWAGEN, PORSCHE (price: 200).

---

## 8) Appliquer les changements

```bash
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
```

---

Résumé : schéma Prisma (GlobalSettings + CocPrice), API settings global/coc, page `/admin/settings`, calcul d’import basé sur GlobalSettings et COC par marque, validation Zod, protection admin, seed et documentation sont en place. On s’arrête ici comme demandé.
